import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Habit, Goal, HabitType, HabitCategory, TabView, StatsFilter, Completion, HabitSchedule, Routine, CharacterStats } from '../types';
import { today } from '../utils/dateUtils';
import { generateDummyHabits, generateDummyGoals, generateDummyRoutines } from '../data/dummyData';
import { calculateCharacterStats } from '../utils/gamificationUtils';
import { evaluateAchievements, UnlockedAchievement, Achievement } from '../utils/achievementUtils';
import { isHabitTypeAvailable, canAddHabit } from '../utils/featureGateUtils';
import { supabase } from '../lib/supabase';

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

    // Supabase sync
    fetchAllData: () => Promise<void>;

    // Internal
    recalculateStats: () => void;
    dismissAchievementToast: () => void;
    dismissLevelUpModal: () => void;
    clearNewlyUnlockedCollectibles: () => void;
}

// ==========================================
// Supabase Helper: Convert DB rows → Habit with completions
// ==========================================

interface DbHabit {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    category: string;
    schedule: HabitSchedule;
    created_at: string;
    archived: boolean;
    // These fields are stored in the habit row as extra JSON or separate columns
    // We'll map them from the DB
    type?: HabitType;
    color?: string;
    icon?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    daily_target?: number;
    goal_value?: number;
    unit?: string;
    start_date?: string;
    end_date?: string;
}

interface DbCompletion {
    id: string;
    habit_id: string;
    completed_date: string;
    value: number | null;
    completed: boolean;
}

interface DbGoal {
    id: string;
    user_id: string;
    habit_id: string | null;
    description: string;
    target_value: number;
    current_value: number;
    deadline: string | null;
    achieved: boolean;
    created_at: string;
}

interface DbRoutine {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    time_of_day: string;
    habit_ids: string[];
    created_at: string;
}

function dbHabitToHabit(dbHabit: DbHabit, completions: DbCompletion[]): Habit {
    const completionMap: Record<string, Completion> = {};
    completions.forEach(c => {
        completionMap[c.completed_date] = {
            date: c.completed_date,
            completed: c.completed,
            value: c.value ?? undefined,
        };
    });

    return {
        id: dbHabit.id,
        name: dbHabit.name,
        type: (dbHabit.type as HabitType) || 'regular',
        category: (dbHabit.category as HabitCategory) || 'other',
        color: dbHabit.color || '#2563EB',
        icon: dbHabit.icon || '✅',
        difficulty: dbHabit.difficulty,
        schedule: dbHabit.schedule || { type: 'daily' },
        dailyTarget: dbHabit.daily_target,
        goalValue: dbHabit.goal_value,
        unit: dbHabit.unit,
        startDate: dbHabit.start_date,
        endDate: dbHabit.end_date,
        completions: completionMap,
        createdAt: dbHabit.created_at?.split('T')[0] || today(),
        archived: dbHabit.archived || false,
    };
}

function dbGoalToGoal(dbGoal: DbGoal): Goal {
    return {
        id: dbGoal.id,
        habitId: dbGoal.habit_id || '',
        name: dbGoal.description,
        targetValue: dbGoal.target_value,
        unit: '',
        deadline: dbGoal.deadline || undefined,
        achieved: dbGoal.achieved,
        createdAt: dbGoal.created_at?.split('T')[0] || today(),
    };
}

function dbRoutineToRoutine(dbRoutine: DbRoutine): Routine {
    return {
        id: dbRoutine.id,
        name: dbRoutine.name,
        description: dbRoutine.description || undefined,
        icon: '📋',
        habitIds: dbRoutine.habit_ids || [],
        bonusXp: 50,
    };
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

export const useHabitStore = create<HabitStore>()(
    (set, get) => ({
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

        // ==========================================
        // Supabase Sync — Fetch all data on login
        // ==========================================

        fetchAllData: async () => {
            set({ isLoading: true });

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    set({ isLoading: false });
                    return;
                }

                // Fetch profile
                const { data: profile, error: profileErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Fetch habits
                const { data: dbHabits, error: habitsErr } = await supabase
                    .from('habits')
                    .select('*')
                    .eq('user_id', user.id);

                if (habitsErr) throw habitsErr;

                // Fetch all completions for this user
                const { data: dbCompletions, error: compErr } = await supabase
                    .from('habit_completions')
                    .select('*')
                    .eq('user_id', user.id);

                if (compErr) throw compErr;

                // Fetch goals
                const { data: dbGoals, error: goalsErr } = await supabase
                    .from('goals')
                    .select('*')
                    .eq('user_id', user.id);

                if (goalsErr) throw goalsErr;

                // Fetch routines
                const { data: dbRoutines, error: routinesErr } = await supabase
                    .from('routines')
                    .select('*')
                    .eq('user_id', user.id);

                if (routinesErr) throw routinesErr;

                // Convert DB rows to app types
                const habits = (dbHabits || []).map((h: any) => {
                    const habitCompletions = (dbCompletions || []).filter((c: any) => c.habit_id === h.id);
                    return dbHabitToHabit(h, habitCompletions);
                });

                const goals = (dbGoals || []).map((g: any) => dbGoalToGoal(g));
                const routines = (dbRoutines || []).map((r: any) => dbRoutineToRoutine(r));

                // Use profile stats if available, otherwise recalculate
                let stats = calculateCharacterStats(habits);
                if (profile?.stats) {
                    const dbStats = profile.stats as any;
                    stats = {
                        ...stats,
                        level: dbStats.level ?? stats.level,
                        xp: dbStats.xp ?? stats.xp,
                        nextLevelXp: dbStats.nextLevelXp ?? stats.nextLevelXp,
                        accountCreatedDate: dbStats.accountCreatedDate || profile.updated_at || stats.accountCreatedDate,
                        unlockedCollectibles: dbStats.unlockedCollectibles || stats.unlockedCollectibles || [],
                        attributes: dbStats.attributes || stats.attributes
                    };
                }

                set({ habits, goals, routines, stats, isLoading: false });
            } catch (err) {
                console.error('Failed to fetch data from Supabase:', err);
                set({ isLoading: false });
                // Falls back to cached Zustand data from localStorage
            }
        },

        // ==========================================
        // Internal Helper
        // ==========================================

        recalculateStats: () => {
            const state = get();
            const { habits, achievements, stats: currentStats } = state;
            const newStats = calculateCharacterStats(habits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles);
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

            // Sync stats to Supabase Profile (stored as JSONB 'stats' column)
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from('profiles').update({
                    stats: {
                        level: newStats.level,
                        xp: newStats.xp,
                        nextLevelXp: newStats.nextLevelXp,
                        accountCreatedDate: newStats.accountCreatedDate,
                        attributes: newStats.attributes,
                        unlockedCollectibles: newStats.unlockedCollectibles,
                    },
                    updated_at: new Date().toISOString()
                }).eq('id', user.id);
            })();
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

            // Optimistic update
            set((state) => {
                const newHabits = [...state.habits, newHabit];
                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(newHabits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles)
                };
            });

            // Sync to Supabase (fire-and-forget)
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from('habits').insert({
                    id,
                    user_id: user.id,
                    name: newHabit.name,
                    description: null,
                    category: newHabit.category,
                    schedule: newHabit.schedule,
                    archived: false,
                    type: newHabit.type,
                    color: newHabit.color,
                    icon: newHabit.icon,
                    difficulty: newHabit.difficulty,
                    daily_target: newHabit.dailyTarget,
                    goal_value: newHabit.goalValue,
                    unit: newHabit.unit,
                    start_date: newHabit.startDate,
                    end_date: newHabit.endDate,
                });
            })();

            return id;
        },

        updateHabit: (id, updates) => {
            if (updates.type !== undefined && !isHabitTypeAvailable(get().stats, updates.type)) {
                return;
            }
            // Optimistic update
            set((state) => {
                const newHabits = state.habits.map((h) =>
                    h.id === id ? { ...h, ...updates } : h
                );
                return {
                    habits: newHabits,
                    stats: calculateCharacterStats(newHabits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles)
                };
            });

            // Sync to Supabase
            (async () => {
                const dbUpdates: Record<string, any> = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.category !== undefined) dbUpdates.category = updates.category;
                if (updates.schedule !== undefined) dbUpdates.schedule = updates.schedule;
                if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
                if (updates.type !== undefined) dbUpdates.type = updates.type;
                if (updates.color !== undefined) dbUpdates.color = updates.color;
                if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
                if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
                if (updates.dailyTarget !== undefined) dbUpdates.daily_target = updates.dailyTarget;
                if (updates.goalValue !== undefined) dbUpdates.goal_value = updates.goalValue;
                if (updates.unit !== undefined) dbUpdates.unit = updates.unit;

                if (Object.keys(dbUpdates).length > 0) {
                    await supabase.from('habits').update(dbUpdates).eq('id', id);
                }
            })();
        },

        deleteHabit: (id) => {
            // Optimistic update
            set((state) => {
                const newHabits = state.habits.filter((h) => h.id !== id);
                return {
                    habits: newHabits,
                    goals: state.goals.filter((g) => g.habitId !== id),
                    routines: state.routines.map(r => ({
                        ...r,
                        habitIds: r.habitIds.filter(hid => hid !== id)
                    })),
                    stats: calculateCharacterStats(newHabits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles)
                };
            });

            // Sync to Supabase (cascade deletes completions & goals via FK)
            (async () => {
                await supabase.from('habits').delete().eq('id', id);
            })();
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

            (async () => {
                await supabase.from('habits').update({ archived: newArchived }).eq('id', id);
            })();
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
                    stats: calculateCharacterStats(newHabits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles)
                };
            });

            // Sync to Supabase
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from('habits').insert({
                    id: newId,
                    user_id: user.id,
                    name: duplicate.name,
                    description: null,
                    category: duplicate.category,
                    schedule: duplicate.schedule,
                    archived: false,
                    type: duplicate.type,
                    color: duplicate.color,
                    icon: duplicate.icon,
                    difficulty: duplicate.difficulty,
                    daily_target: duplicate.dailyTarget,
                    goal_value: duplicate.goalValue,
                    unit: duplicate.unit,
                    start_date: duplicate.startDate,
                    end_date: duplicate.endDate,
                });
            })();

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

            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from('routines').insert({
                    id,
                    user_id: user.id,
                    name: newRoutine.name,
                    description: newRoutine.description || null,
                    time_of_day: 'morning',
                    habit_ids: newRoutine.habitIds,
                });
            })();

            return id;
        },

        updateRoutine: (id, updates) => {
            set((state) => ({
                routines: state.routines.map((r) =>
                    r.id === id ? { ...r, ...updates } : r
                ),
            }));

            (async () => {
                const dbUpdates: Record<string, any> = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.habitIds !== undefined) dbUpdates.habit_ids = updates.habitIds;

                if (Object.keys(dbUpdates).length > 0) {
                    await supabase.from('routines').update(dbUpdates).eq('id', id);
                }
            })();
        },

        deleteRoutine: (id) => {
            set((state) => ({
                routines: state.routines.filter((r) => r.id !== id),
            }));

            (async () => {
                await supabase.from('routines').delete().eq('id', id);
            })();
        },

        // ==========================================
        // Completion Actions
        // ==========================================

        toggleCompletion: (habitId, date) => {
            const habit = get().habits.find(h => h.id === habitId);
            if (!habit) return;
            const existing = habit.completions[date];
            const isCompleting = !existing?.completed;

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
                    stats: calculateCharacterStats(newHabits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles)
                };
            });

            // Sync to Supabase
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                if (isCompleting) {
                    await supabase.from('habit_completions').insert({
                        user_id: user.id,
                        habit_id: habitId,
                        completed_date: date,
                        completed: true,
                        value: existing?.value ?? null,
                    });
                } else {
                    await supabase.from('habit_completions')
                        .delete()
                        .eq('habit_id', habitId)
                        .eq('completed_date', date);
                }
            })();
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
                    stats: calculateCharacterStats(newHabits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles)
                };
            });

            // Sync to Supabase
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Delete existing then insert new value
                await supabase.from('habit_completions')
                    .delete()
                    .eq('habit_id', habitId)
                    .eq('completed_date', date);

                await supabase.from('habit_completions').insert({
                    user_id: user.id,
                    habit_id: habitId,
                    completed_date: date,
                    completed: value > 0,
                    value,
                });
            })();
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

            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from('goals').insert({
                    id,
                    user_id: user.id,
                    habit_id: newGoal.habitId,
                    description: newGoal.name,
                    target_value: newGoal.targetValue,
                    current_value: 0,
                    deadline: newGoal.deadline || null,
                    achieved: false,
                });
            })();

            return id;
        },

        updateGoal: (id, updates) => {
            set((state) => ({
                goals: state.goals.map((g) =>
                    g.id === id ? { ...g, ...updates } : g
                ),
            }));

            (async () => {
                const dbUpdates: Record<string, any> = {};
                if (updates.name !== undefined) dbUpdates.description = updates.name;
                if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
                if (updates.achieved !== undefined) dbUpdates.achieved = updates.achieved;
                if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

                if (Object.keys(dbUpdates).length > 0) {
                    await supabase.from('goals').update(dbUpdates).eq('id', id);
                }
            })();
        },

        deleteGoal: (id) => {
            set((state) => ({
                goals: state.goals.filter((g) => g.id !== id),
            }));

            (async () => {
                await supabase.from('goals').delete().eq('id', id);
            })();
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
                selectedDate: today(),
                activeTab: 'dashboard',
                selectedHabitId: null,
            });

            // Also clear from Supabase
            (async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from('habit_completions').delete().eq('user_id', user.id);
                await supabase.from('goals').delete().eq('user_id', user.id);
                await supabase.from('routines').delete().eq('user_id', user.id);
                await supabase.from('habits').delete().eq('user_id', user.id);
            })();
        },

        loadDummyData: () => {
            const habits = generateDummyHabits();
            const goals = generateDummyGoals(habits);
            const routines = generateDummyRoutines(habits);
            const stats = calculateCharacterStats(habits, get().stats?.accountCreatedDate, get().stats?.unlockedCollectibles);

            set({ habits, goals, routines, stats });
        },
    })
);

