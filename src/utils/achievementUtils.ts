import { Habit } from '../types';
import { calculateCurrentStreak, calculateLongestStreak } from './statsUtils';

// ==========================================
// Achievement Definitions
// ==========================================

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: AchievementTier;
    category: 'streak' | 'consistency' | 'volume' | 'milestone' | 'special';
    condition: (habits: Habit[]) => boolean;
}

export interface UnlockedAchievement {
    id: string;
    unlockedAt: string; // ISO date
}

// Tier colors for UI
export const TIER_COLORS: Record<AchievementTier, { bg: string; text: string; border: string; glow: string }> = {
    bronze: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50', glow: 'shadow-amber-200/30' },
    silver: { bg: 'bg-gray-50 dark:bg-white/5', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-300 dark:border-white/10', glow: 'shadow-gray-300/30' },
    gold: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-900/50', glow: 'shadow-yellow-300/40' },
    diamond: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-900/50', glow: 'shadow-blue-300/40' },
};

// ==========================================
// Achievement Registry
// ==========================================

export const ACHIEVEMENTS: Achievement[] = [
    // ---- STREAK ----
    {
        id: 'streak_3',
        name: 'Getting Started',
        description: 'Reach a 3-day streak on any habit',
        icon: '🔥',
        tier: 'bronze',
        category: 'streak',
        condition: (habits) => habits.some(h => calculateCurrentStreak(h) >= 3),
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Reach a 7-day streak on any habit',
        icon: '⚔️',
        tier: 'bronze',
        category: 'streak',
        condition: (habits) => habits.some(h => calculateCurrentStreak(h) >= 7),
    },
    {
        id: 'streak_14',
        name: 'Fortnight Force',
        description: 'Reach a 14-day streak on any habit',
        icon: '🛡️',
        tier: 'silver',
        category: 'streak',
        condition: (habits) => habits.some(h => calculateCurrentStreak(h) >= 14),
    },
    {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Reach a 30-day streak on any habit',
        icon: '👑',
        tier: 'gold',
        category: 'streak',
        condition: (habits) => habits.some(h => calculateCurrentStreak(h) >= 30),
    },
    {
        id: 'streak_100',
        name: 'Centurion',
        description: 'Reach a 100-day streak on any habit',
        icon: '💎',
        tier: 'diamond',
        category: 'streak',
        condition: (habits) => habits.some(h => calculateLongestStreak(h) >= 100),
    },

    // ---- CONSISTENCY ----
    {
        id: 'multi_habit_3',
        name: 'Juggler',
        description: 'Maintain 3+ active habits',
        icon: '🤹',
        tier: 'bronze',
        category: 'consistency',
        condition: (habits) => habits.filter(h => !h.archived).length >= 3,
    },
    {
        id: 'multi_habit_7',
        name: 'Lifestyle Designer',
        description: 'Maintain 7+ active habits',
        icon: '🎨',
        tier: 'silver',
        category: 'consistency',
        condition: (habits) => habits.filter(h => !h.archived).length >= 7,
    },
    {
        id: 'multi_habit_10',
        name: 'Master of Habits',
        description: 'Maintain 10+ active habits',
        icon: '🏰',
        tier: 'gold',
        category: 'consistency',
        condition: (habits) => habits.filter(h => !h.archived).length >= 10,
    },

    // ---- VOLUME ----
    {
        id: 'total_completions_50',
        name: 'Half Century',
        description: 'Complete 50 total habit checkoffs',
        icon: '✅',
        tier: 'bronze',
        category: 'volume',
        condition: (habits) => {
            const total = habits.reduce((sum, h) =>
                sum + Object.values(h.completions).filter(c => c.completed || (c.value ?? 0) > 0).length, 0);
            return total >= 50;
        },
    },
    {
        id: 'total_completions_200',
        name: 'Two Hundred Club',
        description: 'Complete 200 total habit checkoffs',
        icon: '🏆',
        tier: 'silver',
        category: 'volume',
        condition: (habits) => {
            const total = habits.reduce((sum, h) =>
                sum + Object.values(h.completions).filter(c => c.completed || (c.value ?? 0) > 0).length, 0);
            return total >= 200;
        },
    },
    {
        id: 'total_completions_500',
        name: 'Legend',
        description: 'Complete 500 total habit checkoffs',
        icon: '⭐',
        tier: 'gold',
        category: 'volume',
        condition: (habits) => {
            const total = habits.reduce((sum, h) =>
                sum + Object.values(h.completions).filter(c => c.completed || (c.value ?? 0) > 0).length, 0);
            return total >= 500;
        },
    },
    {
        id: 'total_completions_1000',
        name: 'Immortal',
        description: 'Complete 1,000 total habit checkoffs',
        icon: '🌟',
        tier: 'diamond',
        category: 'volume',
        condition: (habits) => {
            const total = habits.reduce((sum, h) =>
                sum + Object.values(h.completions).filter(c => c.completed || (c.value ?? 0) > 0).length, 0);
            return total >= 1000;
        },
    },

    // ---- MILESTONE ----
    {
        id: 'first_habit',
        name: 'First Step',
        description: 'Create your first habit',
        icon: '🌱',
        tier: 'bronze',
        category: 'milestone',
        condition: (habits) => habits.length >= 1,
    },
    {
        id: 'first_completion',
        name: 'Day One',
        description: 'Complete a habit for the first time',
        icon: '🎯',
        tier: 'bronze',
        category: 'milestone',
        condition: (habits) => habits.some(h =>
            Object.values(h.completions).some(c => c.completed || (c.value ?? 0) > 0)
        ),
    },

    // ---- SPECIAL ----
    {
        id: 'freeze_used',
        name: 'Ice Shield',
        description: 'Use a streak freeze for the first time',
        icon: '❄️',
        tier: 'bronze',
        category: 'special',
        condition: (habits) => habits.some(h =>
            Object.values(h.completions).some(c => c.frozen)
        ),
    },
    {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete all habits every day for 7 days straight',
        icon: '💯',
        tier: 'gold',
        category: 'special',
        condition: (habits) => {
            if (habits.length === 0) return false;
            const active = habits.filter(h => !h.archived);
            if (active.length === 0) return false;

            // Check last 7 days
            const now = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const allDone = active.every(h => {
                    const c = h.completions[dateStr];
                    if (h.type === 'numerical') return (c?.value ?? 0) > 0;
                    return c?.completed === true;
                });

                if (!allDone) return false;
            }
            return true;
        },
    },
];

// ==========================================
// Evaluation Engine
// ==========================================

export function evaluateAchievements(
    habits: Habit[],
    previouslyUnlocked: UnlockedAchievement[]
): { unlocked: UnlockedAchievement[]; newlyUnlocked: Achievement[] } {
    const unlockedIds = new Set(previouslyUnlocked.map(u => u.id));
    const newlyUnlocked: Achievement[] = [];
    const allUnlocked = [...previouslyUnlocked];

    for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        try {
            if (achievement.condition(habits)) {
                const entry: UnlockedAchievement = {
                    id: achievement.id,
                    unlockedAt: new Date().toISOString().split('T')[0],
                };
                allUnlocked.push(entry);
                newlyUnlocked.push(achievement);
            }
        } catch {
            // Silently skip if evaluation fails
        }
    }

    return { unlocked: allUnlocked, newlyUnlocked };
}
