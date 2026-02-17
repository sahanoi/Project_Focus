import { Habit } from '../types';

// ==========================================
// Habit Level System
// ==========================================

export interface HabitLevelInfo {
    level: number;
    title: string;
    totalCompletions: number;
    nextLevelAt: number;
    progressToNext: number; // 0-100%
}

// Level thresholds — increasing milestones
const LEVEL_THRESHOLDS = [
    { level: 1, at: 0, title: 'Novice' },
    { level: 2, at: 10, title: 'Apprentice' },
    { level: 3, at: 25, title: 'Adept' },
    { level: 4, at: 50, title: 'Skilled' },
    { level: 5, at: 100, title: 'Veteran' },
    { level: 6, at: 200, title: 'Expert' },
    { level: 7, at: 365, title: 'Master' },
    { level: 8, at: 500, title: 'Grandmaster' },
    { level: 9, at: 730, title: 'Mythic' },
    { level: 10, at: 1000, title: 'Legendary' },
];

/**
 * Calculate the level of a habit based on total completions.
 * For numerical habits, any day with a value > 0 counts as a completion.
 * For regular/infinite/challenge habits, any day marked completed counts.
 */
export function calculateHabitLevel(habit: Habit): HabitLevelInfo {
    const totalCompletions = countCompletions(habit);

    // Find current level
    let currentLevel = LEVEL_THRESHOLDS[0];
    let nextLevel = LEVEL_THRESHOLDS[1];

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalCompletions >= LEVEL_THRESHOLDS[i].at) {
            currentLevel = LEVEL_THRESHOLDS[i];
            nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
            break;
        }
    }

    const nextLevelAt = nextLevel ? nextLevel.at : currentLevel.at;
    const progressToNext = nextLevel
        ? Math.min(100, Math.round(
            ((totalCompletions - currentLevel.at) / (nextLevel.at - currentLevel.at)) * 100
        ))
        : 100; // Max level

    return {
        level: currentLevel.level,
        title: currentLevel.title,
        totalCompletions,
        nextLevelAt,
        progressToNext,
    };
}

/**
 * Count the number of completed days for a habit.
 */
function countCompletions(habit: Habit): number {
    return Object.values(habit.completions).filter(c => {
        if (habit.type === 'numerical') {
            return c.value !== undefined && c.value > 0;
        }
        return c.completed;
    }).length;
}

/**
 * Get the level color based on level number (for badges/indicators).
 */
export function getLevelColor(level: number): string {
    const colors: Record<number, string> = {
        1: '#6B7280',  // gray
        2: '#10B981',  // green
        3: '#2563EB',  // blue
        4: '#8B5CF6',  // purple
        5: '#F59E0B',  // amber
        6: '#EF4444',  // red
        7: '#EC4899',  // pink
        8: '#F97316',  // orange
        9: '#06B6D4',  // cyan
        10: '#FACC15', // gold
    };
    return colors[level] || '#6B7280';
}
