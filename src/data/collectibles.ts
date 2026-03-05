// ==========================================
// Focus FTP — Master Collectibles Registry
// ==========================================

import { Collectible, CharacterStats } from '../types';
import { calculateCurrentStreak, calculateLongestStreak } from '../utils/statsUtils';
import type { Habit } from '../types';

/**
 * Helper: total completions across all habits
 */
function totalCompletions(habits: Habit[]): number {
    return habits.reduce((acc, h) => acc + Object.values(h.completions).filter(c => c.completed).length, 0);
}

function bestStreak(habits: Habit[]): number {
    return habits.reduce((max, h) => Math.max(max, calculateLongestStreak(h)), 0);
}

function currentBestStreak(habits: Habit[]): number {
    return habits.reduce((max, h) => Math.max(max, calculateCurrentStreak(h)), 0);
}

function uniqueCategories(habits: Habit[]): number {
    return new Set(habits.filter(h => !h.archived).map(h => h.category)).size;
}

// ────────────────────────────────────────────
//  COLLECTIBLES MASTER LIST
// ────────────────────────────────────────────

export const COLLECTIBLES: Collectible[] = [
    // ── WELCOME ──
    {
        id: 'challenger',
        name: 'Challenger',
        description: 'For having the courage to start. Welcome aboard!',
        icon: '🌱',
        rarity: 'common',
        unlockHint: 'Start your journey',
        condition: () => true, // auto-unlocked for everyone
    },
    // ── COMMON ──
    {
        id: 'first_step',
        name: 'First Step',
        description: 'Complete your very first habit.',
        icon: '👣',
        rarity: 'common',
        unlockHint: 'Complete 1 habit',
        condition: (_s, h) => totalCompletions(h) >= 1,
    },
    {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Create 3 habits to track.',
        icon: '📋',
        rarity: 'common',
        unlockHint: 'Have 3 active habits',
        condition: (_s, h) => h.filter(x => !x.archived).length >= 3,
    },
    {
        id: 'ten_down',
        name: 'Ten Down',
        description: 'Complete 10 habits total.',
        icon: '🔟',
        rarity: 'common',
        unlockHint: 'Complete 10 habits',
        condition: (_s, h) => totalCompletions(h) >= 10,
    },
    {
        id: 'apprentice_rank',
        name: 'Apprentice Rank',
        description: 'Reach Level 2.',
        icon: '⭐',
        rarity: 'common',
        unlockHint: 'Reach Level 2',
        condition: (s) => s.level >= 2,
    },

    // ── RARE ──
    {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Hit a 7-day streak on any habit.',
        icon: '🗓️',
        rarity: 'rare',
        unlockHint: '7-day streak on any habit',
        condition: (_s, h) => bestStreak(h) >= 7,
    },
    {
        id: 'half_century',
        name: 'Half Century',
        description: 'Complete 50 habits total.',
        icon: '🎯',
        rarity: 'rare',
        unlockHint: 'Complete 50 habits total',
        condition: (_s, h) => totalCompletions(h) >= 50,
    },
    {
        id: 'well_rounded',
        name: 'Well Rounded',
        description: 'Track habits in 4 different categories.',
        icon: '🧩',
        rarity: 'rare',
        unlockHint: 'Use 4 different categories',
        condition: (_s, h) => uniqueCategories(h) >= 4,
    },
    {
        id: 'practitioner_rank',
        name: 'Practitioner',
        description: 'Reach Level 3.',
        icon: '🏅',
        rarity: 'rare',
        unlockHint: 'Reach Level 3',
        condition: (s) => s.level >= 3,
    },
    {
        id: 'centurion',
        name: 'Centurion',
        description: 'Earn 100 total completions.',
        icon: '💯',
        rarity: 'rare',
        unlockHint: 'Complete 100 habits total',
        condition: (_s, h) => totalCompletions(h) >= 100,
    },

    // ── EPIC ──
    {
        id: 'fortnight_force',
        name: 'Fortnight Force',
        description: 'Maintain a 14-day streak on any habit.',
        icon: '🔥',
        rarity: 'epic',
        unlockHint: '14-day streak on any habit',
        condition: (_s, h) => bestStreak(h) >= 14,
    },
    {
        id: 'category_king',
        name: 'Category King',
        description: 'Track habits in 7+ different categories.',
        icon: '👑',
        rarity: 'epic',
        unlockHint: 'Use 7 different categories',
        condition: (_s, h) => uniqueCategories(h) >= 7,
    },
    {
        id: 'competent_rank',
        name: 'Competent',
        description: 'Reach Level 4.',
        icon: '🌟',
        rarity: 'epic',
        unlockHint: 'Reach Level 4',
        condition: (s) => s.level >= 4,
    },
    {
        id: 'five_hundred_club',
        name: '500 Club',
        description: 'Earn 500 total completions.',
        icon: '🏆',
        rarity: 'epic',
        unlockHint: 'Complete 500 habits total',
        condition: (_s, h) => totalCompletions(h) >= 500,
    },
    {
        id: 'attribute_master',
        name: 'Attribute Master',
        description: 'Get any attribute above 85.',
        icon: '💎',
        rarity: 'epic',
        unlockHint: 'Any attribute ≥ 85',
        condition: (s) => {
            const a = s.attributes;
            return Math.max(a.dsc, a.foc, a.stk, a.bal, a.grt, a.vit) >= 85;
        },
    },

    // ── LEGENDARY ──
    {
        id: 'month_master',
        name: 'Month Master',
        description: 'A 30-day streak on any single habit.',
        icon: '🐉',
        rarity: 'legendary',
        unlockHint: '30-day streak on any habit',
        condition: (_s, h) => bestStreak(h) >= 30,
    },
    {
        id: 'expert_rank',
        name: 'Expert',
        description: 'Reach Level 5 — the pinnacle.',
        icon: '🔱',
        rarity: 'legendary',
        unlockHint: 'Reach Level 5',
        condition: (s) => s.level >= 5,
    },
    {
        id: 'thousand_strong',
        name: 'Thousand Strong',
        description: '1,000 total completions. True dedication.',
        icon: '⚡',
        rarity: 'legendary',
        unlockHint: 'Complete 1,000 habits total',
        condition: (_s, h) => totalCompletions(h) >= 1000,
    },
    {
        id: 'unbreakable',
        name: 'Unbreakable',
        description: 'Active streak of 30+ days right now.',
        icon: '🛡️',
        rarity: 'legendary',
        unlockHint: 'Currently on a 30+ day streak',
        condition: (_s, h) => currentBestStreak(h) >= 30,
    },
];

/**
 * Evaluate which collectibles have been newly unlocked.
 * Returns the full list of unlocked IDs (old + new) and the list of newly earned ones.
 */
export function evaluateCollectibles(
    stats: CharacterStats,
    habits: Habit[],
    alreadyUnlocked: string[] = [],
): { allUnlocked: string[]; newlyUnlocked: Collectible[] } {
    const newlyUnlocked: Collectible[] = [];
    const allUnlocked = [...alreadyUnlocked];

    for (const c of COLLECTIBLES) {
        if (alreadyUnlocked.includes(c.id)) continue;
        try {
            if (c.condition(stats, habits)) {
                allUnlocked.push(c.id);
                newlyUnlocked.push(c);
            }
        } catch {
            // Condition evaluation failed — skip silently
        }
    }

    return { allUnlocked, newlyUnlocked };
}
