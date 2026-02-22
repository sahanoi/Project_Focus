import { Habit, Completion, Goal, HabitType } from '../types';
import { getDaysInRange, daysBetween, getDayOfWeek, getDayOfWeekName, today, getDayOfMonth } from './dateUtils';

// ==========================================
// Schedule Helpers
// ==========================================

export function isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
    // 1. Check if date is before creation
    if (dateStr < habit.createdAt.split('T')[0]) return false;

    // 2. Check schedule type
    const { schedule } = habit;
    if (!schedule || schedule.type === 'daily') return true;

    if (schedule.type === 'weekly') {
        const dayOfWeek = getDayOfWeek(dateStr); // 0=Sun
        return schedule.daysOfWeek?.includes(dayOfWeek) ?? false;
    }

    if (schedule.type === 'monthly') {
        const dayOfMonth = getDayOfMonth(dateStr);
        return schedule.daysOfMonth?.includes(dayOfMonth) ?? false;
    }

    if (schedule.type === 'custom') {
        const interval = schedule.customInterval || 1;
        const start = habit.createdAt.split('T')[0];
        // daysBetween(start, current) -> differenceInDays(current, start) -> current - start
        const diff = daysBetween(start, dateStr);
        return diff >= 0 && diff % interval === 0;
    }

    return true;
}

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

    let dueCount = 0;
    let completedCount = 0;

    for (const day of days) {
        if (!isHabitDueOnDate(habit, day)) continue;

        dueCount++;
        const completion = habit.completions[day];

        if (habit.type === 'numerical') {
            if (completion?.value !== undefined && completion.value > 0) {
                completedCount++;
            }
        } else {
            if (completion?.completed) {
                completedCount++;
            }
        }
    }

    if (dueCount === 0) return 0;
    return Math.round((completedCount / dueCount) * 100);
}

export function calculateOverallCompletionRate(
    habits: Habit[],
    startDate: string,
    endDate: string
): number {
    if (habits.length === 0) return 0;

    let totalRate = 0;
    let count = 0;

    for (const habit of habits) {
        // Optimization: Check isHabitDueOnDate for at least one day?
        // Reuse logic: get due days in range
        const rangeDays = getDaysInRange(startDate, endDate);
        const dueDays = rangeDays.filter(d => isHabitDueOnDate(habit, d));

        if (dueDays.length > 0) {
            // Recalculate rate based on due days only
            // We can call calculateCompletionRate, which now handles due checks
            const rate = calculateCompletionRate(habit, startDate, endDate);
            totalRate += rate;
            count++;
        }
    }

    if (count === 0) return 0;
    return Math.round(totalRate / count);
}

// ==========================================
// Streak Calculation
// ==========================================

export function calculateCurrentStreak(habit: Habit): number {
    let streak = 0;
    let currentDate = today();

    // 1. Find the last DUE date
    let searchDate = currentDate;
    let lookback = 0;

    // If today is NOT due, find previous due date
    while (!isHabitDueOnDate(habit, searchDate) && lookback < 365) {
        searchDate = subtractOneDayStr(searchDate);
        lookback++;
    }
    if (lookback >= 365) return 0;

    let pointer = searchDate; // Start at most recent due date

    // Check the tip (most recent due date)
    if (pointer === currentDate) {
        if (isCompletionDone(habit, habit.completions[pointer])) {
            streak++;
            pointer = subtractOneDayStr(pointer);
        } else {
            // Today due, not done. Streak is not broken yet.
            // Just move pointer back to check valid history.
            pointer = subtractOneDayStr(pointer);
        }
    }

    // Now loop back
    let loops = 0;
    while (loops < 365 * 5) { // 5 years max history
        if (new Date(pointer) < new Date(habit.createdAt)) break;

        if (isHabitDueOnDate(habit, pointer)) {
            if (isCompletionDone(habit, habit.completions[pointer])) {
                streak++;
            } else if (habit.completions[pointer]?.frozen) {
                // Frozen day — streak not broken, but doesn't count as completed
            } else {
                break; // Streak broken
            }
        }
        pointer = subtractOneDayStr(pointer);
        loops++;
    }

    return streak;
}

export function calculateLongestStreak(habit: Habit): number {
    const start = habit.createdAt.split('T')[0];
    const end = today();
    const days = getDaysInRange(start, end);

    let longest = 0;
    let current = 0;

    for (const day of days) {
        if (!isHabitDueOnDate(habit, day)) continue;

        if (isCompletionDone(habit, habit.completions[day])) {
            current++;
        } else if (habit.completions[day]?.frozen) {
            // Frozen — streak not broken, doesn't count
        } else {
            if (current > longest) longest = current;
            current = 0;
        }
    }
    if (current > longest) longest = current;

    return longest;
}

// ==========================================
// Consistency Score
// ==========================================

export function calculateConsistencyScore(
    habit: Habit,
    startDate: string,
    endDate: string
): number {
    return calculateCompletionRate(habit, startDate, endDate);
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
        if (!isHabitDueOnDate(habit, day)) continue;

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
        // Only count habits that are DUE on this specific 'day'
        const dueHabits = activeHabits.filter(h => isHabitDueOnDate(h, day));

        const total = dueHabits.length;
        const completed = dueHabits.filter((h) => {
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
