import { describe, it, expect, beforeEach } from 'vitest';
import { useHabitStore } from '../habitStore';

// Reset store before each test
beforeEach(() => {
    useHabitStore.setState({
        habits: [],
        goals: [],
        selectedDate: '2026-02-13',
        activeTab: 'dashboard',
        statsFilter: { dateRange: 'month', habitType: 'all', habitId: 'all' },
    });
});

describe('Habit Store', () => {
    // ==========================================
    // Habit CRUD
    // ==========================================

    describe('addHabit', () => {
        it('should add a regular habit', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            const habit = useHabitStore.getState().habits.find((h) => h.id === id);
            expect(habit).toBeDefined();
            expect(habit!.name).toBe('Read');
            expect(habit!.type).toBe('regular');
            expect(habit!.completions).toEqual({});
            expect(habit!.archived).toBe(false);
        });

        it('should add a numerical habit with goal', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Steps',
                type: 'numerical',
                category: 'fitness',
                color: '#10B981',
                icon: '🚶',
                goalValue: 10000,
                unit: 'steps',
            });

            const habit = useHabitStore.getState().habits.find((h) => h.id === id);
            expect(habit!.goalValue).toBe(10000);
            expect(habit!.unit).toBe('steps');
        });

        it('should add an infinite habit', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Meditate',
                type: 'infinite',
                category: 'mindfulness',
                color: '#F59E0B',
                icon: '🧘',
            });

            const habit = useHabitStore.getState().habits.find((h) => h.id === id);
            expect(habit!.type).toBe('infinite');
        });

        it('should add a challenge habit with dates', () => {
            const id = useHabitStore.getState().addHabit({
                name: '30 Day Pushup',
                type: 'challenge',
                category: 'fitness',
                color: '#8B5CF6',
                icon: '💪',
                startDate: '2026-02-01',
                endDate: '2026-03-02',
            });

            const habit = useHabitStore.getState().habits.find((h) => h.id === id);
            expect(habit!.startDate).toBe('2026-02-01');
            expect(habit!.endDate).toBe('2026-03-02');
        });
    });

    describe('updateHabit', () => {
        it('should update a habit name', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            useHabitStore.getState().updateHabit(id, { name: 'Read Books' });
            const habit = useHabitStore.getState().habits.find((h) => h.id === id);
            expect(habit!.name).toBe('Read Books');
        });
    });

    describe('deleteHabit', () => {
        it('should remove a habit and its associated goals', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Steps',
                type: 'numerical',
                category: 'fitness',
                color: '#10B981',
                icon: '🚶',
                goalValue: 10000,
                unit: 'steps',
            });

            useHabitStore.getState().addGoal({
                habitId: id,
                name: 'Walk 10000 steps',
                targetValue: 10000,
                unit: 'steps',
            });

            useHabitStore.getState().deleteHabit(id);
            expect(useHabitStore.getState().habits).toHaveLength(0);
            expect(useHabitStore.getState().goals).toHaveLength(0);
        });
    });

    describe('archiveHabit', () => {
        it('should toggle archive status', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            useHabitStore.getState().archiveHabit(id);
            expect(useHabitStore.getState().habits[0].archived).toBe(true);

            useHabitStore.getState().archiveHabit(id);
            expect(useHabitStore.getState().habits[0].archived).toBe(false);
        });
    });

    describe('duplicateHabit', () => {
        it('should create a copy without completions', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            useHabitStore.getState().toggleCompletion(id, '2026-02-13');
            const newId = useHabitStore.getState().duplicateHabit(id);

            expect(newId).toBeTruthy();
            const dup = useHabitStore.getState().habits.find((h) => h.id === newId);
            expect(dup!.name).toBe('Read (copy)');
            expect(dup!.completions).toEqual({});
        });
    });

    // ==========================================
    // Completion Actions
    // ==========================================

    describe('toggleCompletion', () => {
        it('should mark a habit as completed', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            useHabitStore.getState().toggleCompletion(id, '2026-02-13');
            const habit = useHabitStore.getState().habits[0];
            expect(habit.completions['2026-02-13']?.completed).toBe(true);
        });

        it('should uncomplete a habit when toggled again', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            useHabitStore.getState().toggleCompletion(id, '2026-02-13');
            useHabitStore.getState().toggleCompletion(id, '2026-02-13');
            const habit = useHabitStore.getState().habits[0];
            expect(habit.completions['2026-02-13']).toBeUndefined();
        });
    });

    describe('setNumericalValue', () => {
        it('should set a numerical value and mark completed if > 0', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Steps',
                type: 'numerical',
                category: 'fitness',
                color: '#10B981',
                icon: '🚶',
                goalValue: 10000,
                unit: 'steps',
            });

            useHabitStore.getState().setNumericalValue(id, '2026-02-13', 5000);
            const habit = useHabitStore.getState().habits[0];
            expect(habit.completions['2026-02-13']?.value).toBe(5000);
            expect(habit.completions['2026-02-13']?.completed).toBe(true);
        });

        it('should not mark completed for value 0', () => {
            const id = useHabitStore.getState().addHabit({
                name: 'Steps',
                type: 'numerical',
                category: 'fitness',
                color: '#10B981',
                icon: '🚶',
                goalValue: 10000,
                unit: 'steps',
            });

            useHabitStore.getState().setNumericalValue(id, '2026-02-13', 0);
            const habit = useHabitStore.getState().habits[0];
            expect(habit.completions['2026-02-13']?.completed).toBe(false);
        });
    });

    // ==========================================
    // Goal Actions
    // ==========================================

    describe('goals', () => {
        it('should add a goal', () => {
            const goalId = useHabitStore.getState().addGoal({
                habitId: 'habit-1',
                name: 'Walk 10k',
                targetValue: 10000,
                unit: 'steps',
            });

            const goal = useHabitStore.getState().goals.find((g) => g.id === goalId);
            expect(goal).toBeDefined();
            expect(goal!.achieved).toBe(false);
        });

        it('should delete a goal', () => {
            const goalId = useHabitStore.getState().addGoal({
                habitId: 'habit-1',
                name: 'Walk 10k',
                targetValue: 10000,
                unit: 'steps',
            });

            useHabitStore.getState().deleteGoal(goalId);
            expect(useHabitStore.getState().goals).toHaveLength(0);
        });
    });

    // ==========================================
    // Data Management
    // ==========================================

    describe('importData / clearAllData', () => {
        it('should import habits and goals', () => {
            useHabitStore.getState().importData({
                habits: [
                    {
                        id: 'h1',
                        name: 'Test',
                        type: 'regular',
                        category: 'health',
                        color: '#2563EB',
                        icon: '❤️',
                        schedule: { type: 'daily' },
                        completions: {},
                        createdAt: '2026-01-01',
                        archived: false,
                    },
                ],
                goals: [],
            });

            expect(useHabitStore.getState().habits).toHaveLength(1);
        });

        it('should clear all data', () => {
            useHabitStore.getState().addHabit({
                name: 'Read',
                type: 'regular',
                category: 'learning',
                color: '#2563EB',
                icon: '📚',
            });

            useHabitStore.getState().clearAllData();
            expect(useHabitStore.getState().habits).toHaveLength(0);
            expect(useHabitStore.getState().goals).toHaveLength(0);
        });
    });
});
