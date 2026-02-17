import { Habit, Completion, Goal } from '../types';
import { getDaysInRange, daysBetween, getDayOfWeek, getDayOfWeekName, today } from './dateUtils';

// ==========================================
// Completion Rate
// ==========================================

export function calculateCompletionRate(
    habit: Habit,
    startDate: string,
    endDate: string
): number {
    const days = getDaysInRange(startDate, endDate);
    if (days.length === 0) return 0;

    const completed = days.filter((day) => {
        const completion = habit.completions[day];
        if (!completion) return false;
        if (habit.type === 'numerical') {
            return completion.value !== undefined && completion.value > 0;
        }
        return completion.completed;
    }).length;

    return Math.round((completed / days.length) * 100);
}

export function calculateOverallCompletionRate(
    habits: Habit[],
    startDate: string,
    endDate: string
): number {
    if (habits.length === 0) return 0;
    const rates = habits.map((h) => calculateCompletionRate(h, startDate, endDate));
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
}

// ==========================================
// Streak Calculation
// ==========================================

export function calculateCurrentStreak(habit: Habit): number {
    let streak = 0;
    let currentDate = today();

    // Check if today is completed; if not, start from yesterday
    const todayCompletion = habit.completions[currentDate];
    const isTodayCompleted = isCompletionDone(habit, todayCompletion);

    if (!isTodayCompleted) {
        // Start checking from yesterday
        const yesterday = getDaysInRange(
            subtractOneDayStr(currentDate),
            subtractOneDayStr(currentDate)
        )[0];
        if (!yesterday) return 0;
        currentDate = yesterday;
    }

    while (true) {
        const completion = habit.completions[currentDate];
        if (!isCompletionDone(habit, completion)) break;
        streak++;
        const prev = getDaysInRange(
            subtractOneDayStr(currentDate),
            subtractOneDayStr(currentDate)
        );
        if (prev.length === 0) break;
        currentDate = prev[0];
    }

    return streak;
}

export function calculateLongestStreak(habit: Habit): number {
    const dates = Object.keys(habit.completions).sort();
    if (dates.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: string | null = null;

    for (const date of dates) {
        const completion = habit.completions[date];
        if (!isCompletionDone(habit, completion)) {
            currentStreak = 0;
            prevDate = date;
            continue;
        }

        if (prevDate && daysBetween(prevDate, date) === 1) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }

        longestStreak = Math.max(longestStreak, currentStreak);
        prevDate = date;
    }

    return longestStreak;
}

// ==========================================
// Consistency Score
// ==========================================

export function calculateConsistencyScore(
    habit: Habit,
    startDate: string,
    endDate: string
): number {
    const days = getDaysInRange(startDate, endDate);
    if (days.length === 0) return 0;

    let completedDays = 0;
    for (const day of days) {
        const completion = habit.completions[day];
        if (isCompletionDone(habit, completion)) {
            completedDays++;
        }
    }

    return Math.round((completedDays / days.length) * 100);
}

// ==========================================
// Best Performing Days
// ==========================================

export function getBestPerformingDays(
    habit: Habit,
    startDate: string,
    endDate: string
): { day: string; dayIndex: number; count: number; rate: number }[] {
    const days = getDaysInRange(startDate, endDate);
    const dayStats: Record<number, { total: number; completed: number }> = {};

    for (let i = 0; i < 7; i++) {
        dayStats[i] = { total: 0, completed: 0 };
    }

    for (const day of days) {
        const dayIndex = getDayOfWeek(day);
        dayStats[dayIndex].total++;
        const completion = habit.completions[day];
        if (isCompletionDone(habit, completion)) {
            dayStats[dayIndex].completed++;
        }
    }

    return Object.entries(dayStats)
        .map(([idx, stats]) => ({
            day: getDayOfWeekName(Number(idx)),
            dayIndex: Number(idx),
            count: stats.completed,
            rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.rate - a.rate);
}

// ==========================================
// Numerical Habit Progress
// ==========================================

export function aggregateNumericalProgress(
    habit: Habit,
    startDate: string,
    endDate: string
): { date: string; value: number; cumulative: number }[] {
    const days = getDaysInRange(startDate, endDate);
    let cumulative = 0;

    return days.map((day) => {
        const completion = habit.completions[day];
        const value = completion?.value ?? 0;
        cumulative += value;
        return { date: day, value, cumulative };
    });
}

export function calculateGoalProgress(habit: Habit, goal: Goal): number {
    const totalValue = Object.values(habit.completions).reduce(
        (sum, c) => sum + (c.value ?? 0),
        0
    );
    return Math.min(Math.round((totalValue / goal.targetValue) * 100), 100);
}

export function getTotalNumericalValue(habit: Habit): number {
    return Object.values(habit.completions).reduce(
        (sum, c) => sum + (c.value ?? 0),
        0
    );
}

// ==========================================
// Projected Completion
// ==========================================

export function getProjectedCompletionDate(
    habit: Habit,
    goal: Goal
): string | null {
    const completionValues = Object.entries(habit.completions)
        .filter(([_, c]) => c.value !== undefined && c.value > 0)
        .sort(([a], [b]) => a.localeCompare(b));

    if (completionValues.length < 2) return null;

    const totalValue = completionValues.reduce((sum, [_, c]) => sum + (c.value ?? 0), 0);
    const firstDate = completionValues[0][0];
    const lastDate = completionValues[completionValues.length - 1][0];
    const dayCount = daysBetween(firstDate, lastDate) || 1;
    const dailyRate = totalValue / dayCount;

    if (dailyRate <= 0) return null;

    const remaining = goal.targetValue - totalValue;
    if (remaining <= 0) return today();

    const daysNeeded = Math.ceil(remaining / dailyRate);
    const projected = new Date(lastDate);
    projected.setDate(projected.getDate() + daysNeeded);

    return projected.toISOString().split('T')[0];
}

// ==========================================
// Challenge Progress
// ==========================================

export function getChallengeProgress(habit: Habit): {
    daysTotal: number;
    daysCompleted: number;
    daysRemaining: number;
    completionRate: number;
} | null {
    if (habit.type !== 'challenge' || !habit.startDate || !habit.endDate) return null;

    const daysTotal = daysBetween(habit.startDate, habit.endDate) + 1;
    const todayStr = today();
    const effectiveEnd = habit.endDate < todayStr ? habit.endDate : todayStr;
    const daysElapsed = Math.max(0, daysBetween(habit.startDate, effectiveEnd) + 1);

    const daysInRange = getDaysInRange(habit.startDate, effectiveEnd);
    const daysCompleted = daysInRange.filter((day) => {
        const c = habit.completions[day];
        return c?.completed === true;
    }).length;

    const daysRemaining = Math.max(0, daysBetween(todayStr, habit.endDate));

    return {
        daysTotal,
        daysCompleted,
        daysRemaining,
        completionRate: daysElapsed > 0 ? Math.round((daysCompleted / daysElapsed) * 100) : 0,
    };
}

// ==========================================
// Habit Distribution
// ==========================================

export function getHabitDistribution(
    habits: Habit[]
): { type: string; count: number; color: string }[] {
    const typeColors: Record<string, string> = {
        regular: '#2563EB',
        numerical: '#10B981',
        infinite: '#F59E0B',
        challenge: '#8B5CF6',
    };

    const typeLabels: Record<string, string> = {
        regular: 'Regular',
        numerical: 'Numerical',
        infinite: 'Infinite Loop',
        challenge: 'Challenge',
    };

    const counts: Record<string, number> = {};
    for (const habit of habits) {
        counts[habit.type] = (counts[habit.type] || 0) + 1;
    }

    return Object.entries(counts).map(([type, count]) => ({
        type: typeLabels[type] || type,
        count,
        color: typeColors[type] || '#6B7280',
    }));
}

// ==========================================
// Daily Completion Data (for charts)
// ==========================================

export function getDailyCompletionData(
    habits: Habit[],
    startDate: string,
    endDate: string
): { date: string; rate: number; completed: number; total: number }[] {
    const days = getDaysInRange(startDate, endDate);
    const activeHabits = habits.filter((h) => !h.archived);

    return days.map((day) => {
        const total = activeHabits.length;
        const completed = activeHabits.filter((h) => {
            const c = h.completions[day];
            return isCompletionDone(h, c);
        }).length;

        return {
            date: day,
            rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            completed,
            total,
        };
    });
}

// ==========================================
// Helpers
// ==========================================

function isCompletionDone(habit: Habit, completion?: Completion): boolean {
    if (!completion) return false;
    if (habit.type === 'numerical') {
        return completion.value !== undefined && completion.value > 0;
    }
    return completion.completed;
}

function subtractOneDayStr(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}
