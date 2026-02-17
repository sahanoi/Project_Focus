import { describe, it, expect } from 'vitest';
import {
    calculateCompletionRate,
    calculateCurrentStreak,
    calculateLongestStreak,
    calculateConsistencyScore,
    getBestPerformingDays,
    aggregateNumericalProgress,
    calculateGoalProgress,
    getTotalNumericalValue,
    getHabitDistribution,
    getChallengeProgress,
} from '../statsUtils';
import { Habit, Goal } from '../../types';

// ==========================================
// Test Helpers
// ==========================================

function makeHabit(overrides: Partial<Habit> = {}): Habit {
    return {
        id: 'test-habit',
        name: 'Test Habit',
        type: 'regular',
        category: 'health',
        color: '#2563EB',
        icon: '❤️',
        completions: {},
        createdAt: '2026-01-01',
        archived: false,
        ...overrides,
    };
}

function makeGoal(overrides: Partial<Goal> = {}): Goal {
    return {
        id: 'test-goal',
        habitId: 'test-habit',
        name: 'Test Goal',
        targetValue: 100,
        unit: 'units',
        achieved: false,
        createdAt: '2026-01-01',
        ...overrides,
    };
}

// ==========================================
// Completion Rate Tests
// ==========================================

describe('calculateCompletionRate', () => {
    it('should return 0 for no completions', () => {
        const habit = makeHabit();
        expect(calculateCompletionRate(habit, '2026-02-01', '2026-02-07')).toBe(0);
    });

    it('should return 100 for all days completed', () => {
        const habit = makeHabit({
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true },
                '2026-02-02': { date: '2026-02-02', completed: true },
                '2026-02-03': { date: '2026-02-03', completed: true },
            },
        });
        expect(calculateCompletionRate(habit, '2026-02-01', '2026-02-03')).toBe(100);
    });

    it('should calculate partial completion', () => {
        const habit = makeHabit({
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true },
                '2026-02-03': { date: '2026-02-03', completed: true },
            },
        });
        // 2 out of 3 days
        expect(calculateCompletionRate(habit, '2026-02-01', '2026-02-03')).toBe(67);
    });

    it('should count numerical habits with value > 0', () => {
        const habit = makeHabit({
            type: 'numerical',
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true, value: 5000 },
                '2026-02-02': { date: '2026-02-02', completed: false, value: 0 },
                '2026-02-03': { date: '2026-02-03', completed: true, value: 3000 },
            },
        });
        expect(calculateCompletionRate(habit, '2026-02-01', '2026-02-03')).toBe(67);
    });
});

// ==========================================
// Streak Tests
// ==========================================

describe('calculateLongestStreak', () => {
    it('should return 0 for no completions', () => {
        expect(calculateLongestStreak(makeHabit())).toBe(0);
    });

    it('should count consecutive days', () => {
        const habit = makeHabit({
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true },
                '2026-02-02': { date: '2026-02-02', completed: true },
                '2026-02-03': { date: '2026-02-03', completed: true },
                '2026-02-05': { date: '2026-02-05', completed: true },
            },
        });
        expect(calculateLongestStreak(habit)).toBe(3);
    });

    it('should find longest streak even if not the latest', () => {
        const habit = makeHabit({
            completions: {
                '2026-01-01': { date: '2026-01-01', completed: true },
                '2026-01-02': { date: '2026-01-02', completed: true },
                '2026-01-03': { date: '2026-01-03', completed: true },
                '2026-01-04': { date: '2026-01-04', completed: true },
                '2026-02-10': { date: '2026-02-10', completed: true },
                '2026-02-11': { date: '2026-02-11', completed: true },
            },
        });
        expect(calculateLongestStreak(habit)).toBe(4);
    });
});

// ==========================================
// Consistency Score Tests
// ==========================================

describe('calculateConsistencyScore', () => {
    it('should return 0 for no completions', () => {
        expect(calculateConsistencyScore(makeHabit(), '2026-02-01', '2026-02-07')).toBe(0);
    });

    it('should return 100 for perfect completion', () => {
        const habit = makeHabit({
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true },
                '2026-02-02': { date: '2026-02-02', completed: true },
            },
        });
        expect(calculateConsistencyScore(habit, '2026-02-01', '2026-02-02')).toBe(100);
    });
});

// ==========================================
// Best Performing Days Tests
// ==========================================

describe('getBestPerformingDays', () => {
    it('should identify best performing days', () => {
        const habit = makeHabit({
            completions: {
                '2026-02-03': { date: '2026-02-03', completed: true }, // Tuesday
                '2026-02-04': { date: '2026-02-04', completed: true }, // Wednesday
                '2026-02-10': { date: '2026-02-10', completed: true }, // Tuesday
            },
        });

        const result = getBestPerformingDays(habit, '2026-02-01', '2026-02-14');
        const tuesday = result.find((r) => r.day === 'Tuesday');
        expect(tuesday!.count).toBe(2);
    });
});

// ==========================================
// Numerical Progress Tests
// ==========================================

describe('aggregateNumericalProgress', () => {
    it('should aggregate values with cumulative totals', () => {
        const habit = makeHabit({
            type: 'numerical',
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true, value: 100 },
                '2026-02-02': { date: '2026-02-02', completed: true, value: 200 },
                '2026-02-03': { date: '2026-02-03', completed: true, value: 150 },
            },
        });

        const result = aggregateNumericalProgress(habit, '2026-02-01', '2026-02-03');
        expect(result).toHaveLength(3);
        expect(result[0].cumulative).toBe(100);
        expect(result[1].cumulative).toBe(300);
        expect(result[2].cumulative).toBe(450);
    });
});

// ==========================================
// Goal Progress Tests
// ==========================================

describe('calculateGoalProgress', () => {
    it('should calculate percentage towards goal', () => {
        const habit = makeHabit({
            type: 'numerical',
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true, value: 25 },
                '2026-02-02': { date: '2026-02-02', completed: true, value: 25 },
            },
        });
        const goal = makeGoal({ targetValue: 100 });
        expect(calculateGoalProgress(habit, goal)).toBe(50);
    });

    it('should cap at 100%', () => {
        const habit = makeHabit({
            type: 'numerical',
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true, value: 150 },
            },
        });
        const goal = makeGoal({ targetValue: 100 });
        expect(calculateGoalProgress(habit, goal)).toBe(100);
    });
});

// ==========================================
// Challenge Progress Tests
// ==========================================

describe('getChallengeProgress', () => {
    it('should return null for non-challenge habits', () => {
        expect(getChallengeProgress(makeHabit())).toBeNull();
    });

    it('should calculate challenge progress', () => {
        const habit = makeHabit({
            type: 'challenge',
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true },
                '2026-02-02': { date: '2026-02-02', completed: true },
                '2026-02-03': { date: '2026-02-03', completed: true },
            },
        });

        const result = getChallengeProgress(habit);
        expect(result).not.toBeNull();
        expect(result!.daysTotal).toBe(28);
        expect(result!.daysCompleted).toBe(3);
    });
});

// ==========================================
// Distribution Tests
// ==========================================

describe('getHabitDistribution', () => {
    it('should return correct distribution', () => {
        const habits = [
            makeHabit({ type: 'regular' }),
            makeHabit({ type: 'regular', id: '2' }),
            makeHabit({ type: 'numerical', id: '3' }),
            makeHabit({ type: 'challenge', id: '4' }),
        ];

        const result = getHabitDistribution(habits);
        const regular = result.find((r) => r.type === 'Regular');
        expect(regular!.count).toBe(2);
    });
});

// ==========================================
// Total Numerical Value
// ==========================================

describe('getTotalNumericalValue', () => {
    it('should sum all numerical values', () => {
        const habit = makeHabit({
            type: 'numerical',
            completions: {
                '2026-02-01': { date: '2026-02-01', completed: true, value: 100 },
                '2026-02-02': { date: '2026-02-02', completed: true, value: 200 },
            },
        });
        expect(getTotalNumericalValue(habit)).toBe(300);
    });
});
