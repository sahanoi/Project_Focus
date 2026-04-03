import { Habit } from '../types';
import { calculateCurrentStreak } from './statsUtils';

/** Template name match — same habit created from onboarding template. */
export const STARTER_QUEST_HABIT_NAME = 'Drink Water';

/** Unlock full focus on your other selected habits after this many consecutive due-day check-ins. */
export const STARTER_QUEST_STREAK_TARGET = 3;

export interface StarterQuestProgress {
    habit: Habit;
    /** Current consecutive streak (due days with a valid check-in). */
    streak: number;
    /** Quest levels 1–3 aligned with streak (capped at target). */
    level: number;
    /** True when streak >= STARTER_QUEST_STREAK_TARGET. */
    isComplete: boolean;
}

export function findStarterWaterHabit(habits: Habit[]): Habit | null {
    const h = habits.find((x) => !x.archived && x.name === STARTER_QUEST_HABIT_NAME);
    return h ?? null;
}

/** No named habit → no quest UI (existing accounts). */
export function shouldShowStarterQuest(habits: Habit[]): boolean {
    return findStarterWaterHabit(habits) !== null && !isStarterQuestComplete(habits);
}

export function isStarterQuestComplete(habits: Habit[]): boolean {
    const h = findStarterWaterHabit(habits);
    if (!h) return true;
    return calculateCurrentStreak(h) >= STARTER_QUEST_STREAK_TARGET;
}

export function getStarterQuestProgress(habits: Habit[]): StarterQuestProgress | null {
    const habit = findStarterWaterHabit(habits);
    if (!habit) return null;
    const streak = calculateCurrentStreak(habit);
    const isComplete = streak >= STARTER_QUEST_STREAK_TARGET;
    const level = isComplete
        ? STARTER_QUEST_STREAK_TARGET
        : Math.min(STARTER_QUEST_STREAK_TARGET, Math.max(0, streak));
    return { habit, streak, level, isComplete };
}
