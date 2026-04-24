import { create, type StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { fetchAppState, putAppState } from '../lib/api';
import { Habit, Goal, TabView, StatsFilter, Routine, CharacterStats } from '../types';
import { today } from '../utils/dateUtils';
import { generateDummyHabits, generateDummyGoals, generateDummyRoutines } from '../data/dummyData';
import { calculateCharacterStats } from '../utils/gamificationUtils';
import { evaluateAchievements, UnlockedAchievement, Achievement } from '../utils/achievementUtils';
import { isHabitTypeAvailable, canAddHabit } from '../utils/featureGateUtils';

// ==========================================
// Store Interface
// ==========================================

interface HabitStore {
    // State
    habits: Habit[];
    goals: Goal[];
    routines: Routine[];
    stats: CharacterStats;
    selectedDate: string;
    activeTab: TabView;
    statsFilter: StatsFilter;
    selectedHabitId: string | null;   // For Quick Log Modal
    detailViewHabitId: string | null; // For Full Detail Page
    showModal: boolean;               // For Add/Edit Modal
    isLoading: boolean;
    achievements: UnlockedAchievement[];
    newAchievement: Achievement | null; // for toast notification
    newlyUnlockedCollectibles: string[]; // IDs of collectibles unlocked in latest recalculation
    showLevelUpModal: boolean;
    levelUpData: { oldLevel: number; newLevel: number; oldStats: CharacterStats; newStats: CharacterStats } | null;

    // Habit Actions
    addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt' | 'archived'>) => string;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    archiveHabit: (id: string) => void;
    duplicateHabit: (id: string) => string | null;

    // Routine Actions
    addRoutine: (routine: Omit<Routine, 'id'>) => string;
    updateRoutine: (id: string, updates: Partial<Routine>) => void;
    deleteRoutine: (id: string) => void;

    // Completion Actions
    toggleCompletion: (habitId: string, date: string) => void;
    setNumericalValue: (habitId: string, date: string, value: number) => void;
    setCompletionNote: (habitId: string, date: string, note: string) => void;
    freezeStreak: (habitId: string, date: string) => boolean; // returns false if no freezes left

    // Goal Actions
    addGoal: (goal: Omit<Goal, 'id' | 'achieved' | 'createdAt'>) => string;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;

    // Navigation
    setSelectedDate: (date: string) => void;
    setActiveTab: (tab: TabView) => void;
    setStatsFilter: (filter: Partial<StatsFilter>) => void;
    setSelectedHabitId: (id: string | null) => void;
    setDetailViewHabitId: (id: string | null) => void;
    setShowModal: (show: boolean) => void;

    // Data management
    importData: (data: { habits: Habit[]; goals: Goal[]; routines?: Routine[] }) => void;
    clearAllData: () => void;
    loadDummyData: () => void;

    /** Load habits/goals/routines/stats from PostgreSQL API (cookie session). */
    fetchAllData: () => Promise<void>;

    // Internal
    recalculateStats: () => void;
    dismissAchievementToast: () => void;
    dismissLevelUpModal: () => void;
    clearNewlyUnlockedCollectibles: () => void;
}

// ==========================================
// Store Implementation
// ==========================================

const DEFAULT_STATS: CharacterStats = {
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    accountCreatedDate: new Date().toISOString(),
    unlockedCollectibles: [],
    attributes: { ovr: 60, dsc: 60, foc: 60, stk: 60, bal: 60, grt: 60, vit: 60 }
};

const habitStoreImpl: StateCreator<HabitStore, [], [], HabitStore> = (set, get) => ({
        // Initial state
        habits: [],
        goals: [],
        routines: [],
        stats: { ...DEFAULT_STATS },
        selectedDate: today(),
        activeTab: 'dashboard',
        statsFilter: {
            dateRange: 'month',
            habitType: 'all',
            habitId: 'all',
        },
        selectedHabitId: null,
        detailViewHabitId: null,
        showModal: false,
        isLoading: false,
        achievements: [],
        newAchievement: null,
        newlyUnlockedCollectibles: [],
        showLevelUpModal: false,
        levelUpData: null,

        fetchAllData: async () => {
            serverSyncSuppressed++;
            set({ isLoading: true });
            try {
                const data = await fetchAppState();
                set({
                    habits: data.habits as Habit[],
                    goals: data.goals as Goal[],
                    routines: data.routines as Routine[],
                    stats: data.stats as CharacterStats,
                    achievements: data.achievements as UnlockedAchievement[],
                });
                get().recalculateStats();
            } catch (e) {
                console.error('fetchAllData failed', e);
            } finally {
                set({ isLoading: false });
                queueMicrotask(() => {
                    serverSyncSuppressed--;
                });
            }
        },

        // ==========================================
        // Internal Helper
        // ==========================================

        recalculateStats: () => {
            const state = get();
            const { habits, achievements, stats: currentStats } = state;
            const newStats = calculateCharacterStats(
                habits,
                get().stats?.accountCreatedDate,
                get().stats?.unlockedCollectibles,
                get().goals
            );
            const { unlocked, newlyUnlocked } = evaluateAchievements(habits, achievements);

            const leveledUp = newStats.level > currentStats.level;

            const oldCollectibles = currentStats.unlockedCollectibles || [];
            const newCollectibles = newStats.unlockedCollectibles || [];
            const justUnlocked = newCollectibles.filter((id: string) => !oldCollectibles.includes(id));

            set({
                stats: newStats,
                achievements: unlocked,
                newAchievement: newlyUnlocked.length > 0 ? newlyUnlocked[0] : null,
                ...(justUnlocked.length > 0 && { newlyUnlockedCollectibles: justUnlocked }),
                ...(leveledUp && {
                    showLevelUpModal: true,
                    levelUpData: {
                        oldLevel: currentStats.level,
                        newLevel: newStats.level,
                        oldStats: currentStats,
                        newStats: newStats
                    }
                })
            });
        },

        dismissAchievementToast: () => set({ newAchievement: null }),
        dismissLevelUpModal: () => set({ showLevelUpModal: false, levelUpData: null }),
        clearNewlyUnlockedCollectibles: () => set({ newlyUnlockedCollectibles: [] }),

        // ==========================================
        // Habit CRUD
        // ==========================================

        addHabit: (habitData) => {
            if (!isHabitTypeAvailable(get().stats, habitData.type)) {
                return '';
            }
            const id = uuidv4();
            const newHabit: Habit = {
                ...habitData,
                id,
                completions: {},
                createdAt: today(),
                archived: false,
                schedule: habitData.schedule || { type: 'daily' },
            };

            set((state) => {
                const newHabits = [...state.habits, newHabit];
                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(
                        newHabits,
                        get().stats?.accountCreatedDate,
                        get().stats?.unlockedCollectibles,
                        get().goals
                    ),
                };
            });

            return id;
        },

        updateHabit: (id, updates) => {
            if (updates.type !== undefined && !isHabitTypeAvailable(get().stats, updates.type)) {
                return;
            }
            set((state) => {
                const newHabits = state.habits.map((h) =>
                    h.id === id ? { ...h, ...updates } : h
                );
                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(
                        newHabits,
                        get().stats?.accountCreatedDate,
                        get().stats?.unlockedCollectibles,
                        get().goals
                    ),
                };
            });
        },

        deleteHabit: (id) => {
            set((state) => {
                const newHabits = state.habits.filter((h) => h.id !== id);
                return {
                    habits: newHabits,
                    goals: state.goals.filter((g) => g.habitId !== id),
                    routines: state.routines.map(r => ({
                        ...r,
                        habitIds: r.habitIds.filter(hid => hid !== id)
                    })),
                    stats: calculateCharacterStats(
                        newHabits,
                        get().stats?.accountCreatedDate,
                        get().stats?.unlockedCollectibles,
                        get().goals
                    ),
                };
            });
        },

        archiveHabit: (id) => {
            const habit = get().habits.find(h => h.id === id);
            if (!habit) return;
            const newArchived = !habit.archived;

            set((state) => ({
                habits: state.habits.map((h) =>
                    h.id === id ? { ...h, archived: newArchived } : h
                ),
            }));
        },

        duplicateHabit: (id) => {
            const habit = get().habits.find((h) => h.id === id);
            if (!habit) return null;
            const st = get().stats;
            if (!isHabitTypeAvailable(st, habit.type)) return null;
            if (!canAddHabit(st, get().habits.length)) return null;

            const newId = uuidv4();
            const duplicate: Habit = {
                ...habit,
                id: newId,
                name: `${habit.name} (copy)`,
                completions: {},
                createdAt: today(),
            };

            set((state) => {
                const newHabits = [...state.habits, duplicate];
                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(
                        newHabits,
                        get().stats?.accountCreatedDate,
                        get().stats?.unlockedCollectibles,
                        get().goals
                    ),
                };
            });

            return newId;
        },

        // ==========================================
        // Routine CRUD
        // ==========================================

        addRoutine: (routineData) => {
            const id = uuidv4();
            const newRoutine: Routine = {
                ...routineData,
                id
            };
            set((state) => ({
                routines: [...state.routines, newRoutine]
            }));

            return id;
        },

        updateRoutine: (id, updates) => {
            set((state) => ({
                routines: state.routines.map((r) =>
                    r.id === id ? { ...r, ...updates } : r
                ),
            }));
        },

        deleteRoutine: (id) => {
            set((state) => ({
                routines: state.routines.filter((r) => r.id !== id),
            }));
        },

        // ==========================================
        // Completion Actions
        // ==========================================

        toggleCompletion: (habitId, date) => {
            const habit = get().habits.find(h => h.id === habitId);
            if (!habit) return;
            const existing = habit.completions[date];

            set((state) => {
                const newHabits = state.habits.map((h) => {
                    if (h.id !== habitId) return h;
                    const newCompletions = { ...h.completions };

                    if (existing?.completed) {
                        delete newCompletions[date];
                    } else {
                        newCompletions[date] = {
                            date,
                            completed: true,
                            value: existing?.value,
                        };
                    }

                    return { ...h, completions: newCompletions };
                });

                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(
                        newHabits,
                        get().stats?.accountCreatedDate,
                        get().stats?.unlockedCollectibles,
                        get().goals
                    ),
                };
            });
        },

        setNumericalValue: (habitId, date, value) => {
            set((state) => {
                const newHabits = state.habits.map((h) => {
                    if (h.id !== habitId) return h;
                    const newCompletions = { ...h.completions };
                    newCompletions[date] = {
                        date,
                        completed: value > 0,
                        value,
                    };
                    return { ...h, completions: newCompletions };
                });

                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(
                        newHabits,
                        get().stats?.accountCreatedDate,
                        get().stats?.unlockedCollectibles,
                        get().goals
                    ),
                };
            });
        },

        setCompletionNote: (habitId, date, note) => {
            set((state) => {
                const newHabits = state.habits.map((h) => {
                    if (h.id !== habitId) return h;
                    const existing = h.completions[date];
                    if (!existing) return h;
                    const newCompletions = { ...h.completions };
                    newCompletions[date] = { ...existing, note: note || undefined };
                    return { ...h, completions: newCompletions };
                });
                return { habits: newHabits };
            });
        },

        freezeStreak: (habitId, date) => {
            const habit = get().habits.find(h => h.id === habitId);
            if (!habit) return false;

            // Count freezes used this month
            const [year, month] = date.split('-');
            const monthPrefix = `${year}-${month}`;
            const freezesThisMonth = Object.entries(habit.completions)
                .filter(([d, c]) => d.startsWith(monthPrefix) && c.frozen)
                .length;

            if (freezesThisMonth >= 3) return false;

            set((state) => {
                const newHabits = state.habits.map((h) => {
                    if (h.id !== habitId) return h;
                    const newCompletions = { ...h.completions };
                    newCompletions[date] = {
                        ...(newCompletions[date] || { date, completed: false }),
                        date,
                        frozen: true,
                    };
                    return { ...h, completions: newCompletions };
                });
                return { habits: newHabits };
            });

            return true;
        },

        // ==========================================
        // Goal Actions
        // ==========================================

        addGoal: (goalData) => {
            const id = uuidv4();
            const newGoal: Goal = {
                ...goalData,
                id,
                achieved: false,
                createdAt: today(),
            };
            set((state) => ({
                goals: [...state.goals, newGoal],
            }));

            return id;
        },

        updateGoal: (id, updates) => {
            set((state) => ({
                goals: state.goals.map((g) =>
                    g.id === id ? { ...g, ...updates } : g
                ),
            }));
            get().recalculateStats();
        },

        deleteGoal: (id) => {
            set((state) => ({
                goals: state.goals.filter((g) => g.id !== id),
            }));
            get().recalculateStats();
        },

        // ==========================================
        // Navigation
        // ==========================================

        setSelectedDate: (date) => set({ selectedDate: date }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setStatsFilter: (filter) =>
            set((state) => ({
                statsFilter: { ...state.statsFilter, ...filter },
            })),
        setSelectedHabitId: (id) => set({ selectedHabitId: id }),
        setDetailViewHabitId: (id) => set({ detailViewHabitId: id }),
        setShowModal: (show) => set({ showModal: show }),

        // ==========================================
        // Data Management
        // ==========================================

        importData: (data) => {
            set({
                habits: data.habits,
                goals: data.goals,
                routines: data.routines || [],
            });
            get().recalculateStats();
        },

        clearAllData: () => {
            set({
                habits: [],
                goals: [],
                routines: [],
                stats: { ...DEFAULT_STATS },
                achievements: [],
                selectedDate: today(),
                activeTab: 'dashboard',
                selectedHabitId: null,
                detailViewHabitId: null,
                showModal: false,
            });
        },

        loadDummyData: () => {
            const habits = generateDummyHabits();
            const goals = generateDummyGoals(habits);
            const routines = generateDummyRoutines(habits);
            const stats = calculateCharacterStats(
                habits,
                get().stats?.accountCreatedDate,
                get().stats?.unlockedCollectibles,
                goals
            );

            set({ habits, goals, routines, stats });
        },
});

const STORE_SYNC_KEYS = ['habits', 'goals', 'routines', 'stats', 'achievements'] as const;

let serverSyncSuppressed = 0;

const DEBOUNCE_MS = 750;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleServerSync() {
    if (import.meta.env.MODE === 'test') return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
        syncTimer = null;
        if (serverSyncSuppressed > 0) return;
        const { habits, goals, routines, stats, achievements } = useHabitStore.getState();
        try {
            await putAppState({ habits, goals, routines, stats, achievements });
        } catch (e) {
            console.error('Server sync failed', e);
        }
    }, DEBOUNCE_MS);
}

export const useHabitStore = create<HabitStore>()(habitStoreImpl);

useHabitStore.subscribe((state, prev) => {
    if (!prev) return;
    const changed = STORE_SYNC_KEYS.some((k) => state[k] !== prev[k]);
    if (changed) scheduleServerSync();
});

/** Use while clearing store after logout so debounced sync does not fire unauthenticated. */
export function withServerSyncSuppressed(run: () => void): void {
    serverSyncSuppressed++;
    try {
        run();
    } finally {
        queueMicrotask(() => {
            serverSyncSuppressed--;
        });
    }
}
