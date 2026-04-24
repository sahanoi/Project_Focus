import { Habit, CharacterStats, Goal } from '../types';
import { calculateCompletionRate, calculateCurrentStreak, calculateLongestStreak } from './statsUtils';
import { evaluateCollectibles } from '../data/collectibles';
import { hasAnySkillFocus, habitSkillWeight } from './skillFocusUtils';

// XP Table: Level = floor(TotalXP / 1000) + 1
export const LEVEL_THRESHOLD = 1000;

/** Flat XP for each fully achieved (milestone) goal — boosts season level. */
export const MILESTONE_XP_PER_GOAL = 60;

export const calculateLevel = (xp: number): { level: number; progress: number; nextLevelXp: number } => {
    const level = Math.floor(xp / LEVEL_THRESHOLD) + 1;
    const progress = xp % LEVEL_THRESHOLD;
    const nextLevelXp = LEVEL_THRESHOLD;
    return { level, progress, nextLevelXp };
};

type SubStatKey = 'dsc' | 'foc' | 'stk' | 'bal' | 'grt' | 'vit';

function tagBasedAttribute(
    k: 'dsc' | 'foc' | 'grt' | 'vit',
    habits: Habit[],
    startDate: string,
    todayStr: string
): number | null {
    const active = habits.filter((h) => !h.archived);
    const contributors = active.filter((h) => hasAnySkillFocus(h) && habitSkillWeight(h, k) > 0);
    if (contributors.length === 0) return null;
    let wSum = 0;
    let val = 0;
    for (const h of contributors) {
        const weight = habitSkillWeight(h, k);
        const rate = calculateCompletionRate(h, startDate, todayStr);
        const sub = 50 + rate / 2;
        wSum += weight;
        val += weight * sub;
    }
    return Math.round(val / wSum);
}

function computeLegacyScores(
    habits: Habit[],
    startDate: string,
    todayStr: string
): Record<SubStatKey, number> {
    const out: Record<SubStatKey, number> = {
        dsc: 50,
        foc: 50,
        stk: 50,
        bal: 50,
        grt: 50,
        vit: 50,
    };

    const dailyHabits = habits.filter((h) => !h.schedule || h.schedule.type === 'daily');
    const dscRate =
        dailyHabits.length > 0
            ? dailyHabits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / dailyHabits.length
            : 50;
    out.dsc = Math.round(50 + dscRate / 2);

    const numericalHabits = habits.filter((h) => h.type === 'numerical');
    let focScore = 50;
    if (numericalHabits.length > 0) {
        const goalHitRate =
            numericalHabits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / numericalHabits.length;
        focScore = 50 + goalHitRate / 2;
    } else {
        const overallRate =
            habits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / habits.length;
        focScore = 50 + overallRate / 2;
    }
    out.foc = Math.round(focScore);

    const avgStreak = habits.reduce((acc, h) => acc + calculateCurrentStreak(h), 0) / habits.length;
    const streakBonus = Math.min(45, avgStreak * 2.5);
    out.stk = Math.round(50 + streakBonus);

    const categories = new Set(habits.map((h) => h.category));
    const varietyBonus = (categories.size / 9) * 40;
    out.bal = Math.round(50 + varietyBonus);

    const avgLongestStreak = habits.reduce((acc, h) => acc + calculateLongestStreak(h), 0) / habits.length;
    out.grt = Math.round(50 + Math.min(45, avgLongestStreak));

    const vitHabits = habits.filter((h) => h.category === 'health' || h.category === 'fitness');
    if (vitHabits.length > 0) {
        const vitRate =
            vitHabits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / vitHabits.length;
        out.vit = Math.round(50 + vitRate / 2);
    } else {
        out.vit = 50;
    }

    return out;
}

export const calculateCharacterStats = (
    habits: Habit[],
    previousDate?: string,
    previousUnlocked?: string[],
    goals: Goal[] = []
): CharacterStats => {
    const accountCreatedDate = previousDate || new Date().toISOString();
    const stats: { ovr: number } & Record<SubStatKey, number> = {
        ovr: 50,
        dsc: 50,
        foc: 50,
        stk: 50,
        bal: 50,
        grt: 50,
        vit: 50,
    };

    if (habits.length === 0) {
        return {
            level: 1,
            xp: 0,
            nextLevelXp: LEVEL_THRESHOLD,
            accountCreatedDate,
            unlockedCollectibles: previousUnlocked || [],
            attributes: stats,
        };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const legacy = computeLegacyScores(habits, startDate, todayStr);
    const active = habits.filter((h) => !h.archived);
    const wBlend = active.filter((h) => hasAnySkillFocus(h)).length / Math.max(1, active.length);

    (['dsc', 'foc', 'grt', 'vit'] as const).forEach((k) => {
        const tb = tagBasedAttribute(k, habits, startDate, todayStr);
        if (tb == null) {
            stats[k] = legacy[k];
        } else {
            stats[k] = Math.round(wBlend * tb + (1 - wBlend) * legacy[k]);
        }
    });
    stats.stk = legacy.stk;
    stats.bal = legacy.bal;

    stats.ovr = Math.round(
        stats.dsc * 0.2 + stats.foc * 0.15 + stats.stk * 0.2 + stats.bal * 0.1 + stats.grt * 0.15 + stats.vit * 0.2
    );

    (['ovr', 'dsc', 'foc', 'stk', 'bal', 'grt', 'vit'] as const).forEach((k) => {
        if (stats[k] > 99) stats[k] = 99;
    });

    let totalXp = 0;
    habits.forEach((h) => {
        const validCompletions = Object.values(h.completions).filter((c) => {
            if (h.type === 'numerical') return (c.value ?? 0) > 0;
            return c.completed;
        }).length;

        const difficultyMulti = h.difficulty === 'hard' ? 2 : h.difficulty === 'medium' ? 1.5 : 1;
        const currentStreak = calculateCurrentStreak(h);
        const streakMulti = 1 + Math.min(1, currentStreak / 30);

        totalXp += validCompletions * 50 * difficultyMulti * streakMulti;
    });

    const missionRewards = [0, 100, 150, 200, 150, 100, 250, 500];
    for (let day = 1; day <= 7; day++) {
        if (typeof window !== 'undefined' && localStorage.getItem(`mission_claimed_${day}`) === 'true') {
            totalXp += missionRewards[day];
        }
    }

    const achievedGoals = goals.filter((g) => g.achieved);
    totalXp += achievedGoals.length * MILESTONE_XP_PER_GOAL;

    const xp = Math.round(totalXp);
    const { level, nextLevelXp } = calculateLevel(xp);

    const partialStats: CharacterStats = {
        level,
        xp,
        nextLevelXp,
        accountCreatedDate,
        unlockedCollectibles: previousUnlocked || [],
        attributes: stats,
    };

    const { allUnlocked } = evaluateCollectibles(partialStats, habits, previousUnlocked || []);
    partialStats.unlockedCollectibles = allUnlocked;

    return partialStats;
};
