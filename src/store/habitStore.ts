import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Habit, Goal, HabitType, HabitCategory, TabView, StatsFilter, Completion, HabitSchedule, Routine, CharacterStats } from '../types';
import { today } from '../utils/dateUtils';
import { generateDummyHabits, generateDummyGoals, generateDummyRoutines } from '../data/dummyData';
import { calculateCharacterStats } from '../utils/gamificationUtils';

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
    darkMode: boolean;

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

    // Dark mode
    toggleDarkMode: () => void;

    // Data management
    importData: (data: { habits: Habit[]; goals: Goal[]; routines?: Routine[] }) => void;
    clearAllData: () => void;
    loadDummyData: () => void;

    // Internal
    recalculateStats: () => void;
}

// ==========================================
// Store Implementation
// ==========================================

export const useHabitStore = create<HabitStore>()(
    persist(
        (set, get) => ({
            // Initial state
            habits: [],
            goals: [],
            routines: [],
            stats: {
                level: 1,
                xp: 0,
                nextLevelXp: 1000,
                attributes: { ovr: 60, dsc: 60, foc: 60, stk: 60, bal: 60, grt: 60, vit: 60 }
            },
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
            darkMode: false,

            // ==========================================
            // Internal Helper
            // ==========================================

            recalculateStats: () => {
                const { habits } = get();
                const newStats = calculateCharacterStats(habits);
                set({ stats: newStats });
            },

            // ==========================================
            // Habit CRUD
            // ==========================================

            addHabit: (habitData) => {
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
                        stats: calculateCharacterStats(newHabits)
                    };
                });
                return id;
            },

            updateHabit: (id, updates) => {
                set((state) => {
                    const newHabits = state.habits.map((h) =>
                        h.id === id ? { ...h, ...updates } : h
                    );
                    return {
                        habits: newHabits,
                        stats: calculateCharacterStats(newHabits)
                    };
                });
            },

            deleteHabit: (id) => {
                set((state) => {
                    const newHabits = state.habits.filter((h) => h.id !== id);
                    return {
                        habits: newHabits,
                        goals: state.goals.filter((g) => g.habitId !== id),
                        // Also remove from routines
                        routines: state.routines.map(r => ({
                            ...r,
                            habitIds: r.habitIds.filter(hid => hid !== id)
                        })),
                        stats: calculateCharacterStats(newHabits)
                    };
                });
            },

            archiveHabit: (id) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, archived: !h.archived } : h
                    ),
                }));
            },

            duplicateHabit: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return null;

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
                        stats: calculateCharacterStats(newHabits)
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
                set((state) => {
                    const newHabits = state.habits.map((h) => {
                        if (h.id !== habitId) return h;
                        const existing = h.completions[date];
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
                        stats: calculateCharacterStats(newHabits)
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
                        stats: calculateCharacterStats(newHabits)
                    };
                });
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
            },

            deleteGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                }));
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
            // Dark Mode
            // ==========================================

            toggleDarkMode: () => {
                set((state) => ({ darkMode: !state.darkMode }));
            },

            // ==========================================
            // Data Management
            // ==========================================

            importData: (data) => {
                set({
                    habits: data.habits,
                    goals: data.goals,
                    routines: data.routines || [], // Handle legacy imports
                });
                // Recalculate stats after import
                get().recalculateStats();
            },

            clearAllData: () => {
                set({
                    habits: [],
                    goals: [],
                    routines: [],
                    stats: {
                        level: 1,
                        xp: 0,
                        nextLevelXp: 1000,
                        attributes: { ovr: 60, dsc: 60, foc: 60, stk: 60, bal: 60, grt: 60, vit: 60 }
                    },
                    selectedDate: today(),
                    activeTab: 'dashboard',
                    selectedHabitId: null,
                });
            },

            loadDummyData: () => {
                const habits = generateDummyHabits();
                const goals = generateDummyGoals(habits);
                const routines = generateDummyRoutines(habits);
                const stats = calculateCharacterStats(habits);

                set({ habits, goals, routines, stats });
            },
        }),
        {
            name: 'habit-tracker-storage',
            partialize: (state) => ({
                habits: state.habits,
                goals: state.goals,
                routines: state.routines,
                stats: state.stats,
                darkMode: state.darkMode,
            }),
        }
    )
);
