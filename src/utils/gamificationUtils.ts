import { Habit, CharacterStats, HabitCategory } from '../types';
import { calculateCompletionRate, calculateCurrentStreak, calculateLongestStreak } from './statsUtils';
import { evaluateCollectibles } from '../data/collectibles';

// XP Table: Level = floor(TotalXP / 1000) + 1
export const LEVEL_THRESHOLD = 1000;

export const calculateLevel = (xp: number): { level: number; progress: number; nextLevelXp: number } => {
    const level = Math.floor(xp / LEVEL_THRESHOLD) + 1;
    const progress = xp % LEVEL_THRESHOLD;
    const nextLevelXp = LEVEL_THRESHOLD;
    return { level, progress, nextLevelXp };
};

export const calculateCharacterStats = (habits: Habit[], previousDate?: string, previousUnlocked?: string[]): CharacterStats => {
    const accountCreatedDate = previousDate || new Date().toISOString();
    // Base Stats (everyone starts with baseline potential)
    const stats = {
        ovr: 50,
        dsc: 50, // Discipline
        foc: 50, // Focus
        stk: 50, // Streak
        bal: 50, // Balance
        grt: 50, // Grit
        vit: 50, // Vitality
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

    // 1. DSC (Discipline) — Completion rate of daily habits
    const dailyHabits = habits.filter(h => !h.schedule || h.schedule.type === 'daily');
    const dscRate = dailyHabits.length > 0
        ? dailyHabits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / dailyHabits.length
        : 50;
    stats.dsc = Math.round(50 + (dscRate / 2)); // 50-100 range

    // 2. FOC (Focus) — Numerical target hit-rate
    const numericalHabits = habits.filter(h => h.type === 'numerical');
    let focScore = 50;
    if (numericalHabits.length > 0) {
        const goalHitRate = numericalHabits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / numericalHabits.length;
        focScore = 50 + (goalHitRate / 2);
    } else {
        const overallRate = habits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / habits.length;
        focScore = 50 + (overallRate / 2);
    }
    stats.foc = Math.round(focScore);

    // 3. STK (Streak) — Average streak consistency
    const avgStreak = habits.reduce((acc, h) => acc + calculateCurrentStreak(h), 0) / habits.length;
    const streakBonus = Math.min(45, avgStreak * 2.5);
    stats.stk = Math.round(50 + streakBonus);

    // 4. BAL (Balance) — Category diversity
    const categories = new Set(habits.map(h => h.category));
    const varietyBonus = (categories.size / 9) * 40; // Max 40 pts for all categories
    stats.bal = Math.round(50 + varietyBonus);

    // 5. GRT (Grit) — Longest streak average
    const avgLongestStreak = habits.reduce((acc, h) => acc + calculateLongestStreak(h), 0) / habits.length;
    stats.grt = Math.round(50 + Math.min(45, avgLongestStreak));

    // 6. VIT (Vitality) — Health & Fitness performance
    const vitHabits = habits.filter(h => h.category === 'health' || h.category === 'fitness');
    if (vitHabits.length > 0) {
        const vitRate = vitHabits.reduce((acc, h) => acc + calculateCompletionRate(h, startDate, todayStr), 0) / vitHabits.length;
        stats.vit = Math.round(50 + (vitRate / 2));
    } else {
        stats.vit = 50;
    }

    // 7. OVR (Overall) — Weighted Average
    // Balance Discipline and Grit slightly higher (consistency matters most)
    stats.ovr = Math.round(
        (stats.dsc * 0.20) + // Discipline is key
        (stats.foc * 0.15) +
        (stats.stk * 0.20) + // Streak consistency is key
        (stats.bal * 0.10) +
        (stats.grt * 0.15) +
        (stats.vit * 0.20)   // Health is wealth
    );

    // Cap at 99
    Object.keys(stats).forEach(k => {
        const key = k as keyof typeof stats;
        if (stats[key] > 99) stats[key] = 99;
    });

    // Enhanced XP calculation
    let totalXp = 0;
    habits.forEach(h => {
        // Only count actual completions
        const validCompletions = Object.values(h.completions).filter(c => {
            if (h.type === 'numerical') return (c.value ?? 0) > 0;
            return c.completed;
        }).length;

        const difficultyMulti = h.difficulty === 'hard' ? 2 : h.difficulty === 'medium' ? 1.5 : 1;
        const currentStreak = calculateCurrentStreak(h);
        const streakMulti = 1 + Math.min(1, currentStreak / 30); // Up to 2x at 30 days

        totalXp += validCompletions * 50 * difficultyMulti * streakMulti;
    });

    // Add onboarding mission XP
    // Mission 1: 100, 2: 150, 3: 200, 4: 150, 5: 100, 6: 250, 7: 500
    const missionRewards = [0, 100, 150, 200, 150, 100, 250, 500];
    for (let day = 1; day <= 7; day++) {
        if (typeof window !== 'undefined' && localStorage.getItem(`mission_claimed_${day}`) === 'true') {
            totalXp += missionRewards[day];
        }
    }

    const xp = Math.round(totalXp);
    const { level, nextLevelXp } = calculateLevel(xp);

    const partialStats: CharacterStats = {
        level,
        xp,
        nextLevelXp,
        accountCreatedDate,
        unlockedCollectibles: previousUnlocked || [],
        attributes: stats
    };

    // Evaluate collectible unlocks
    const { allUnlocked } = evaluateCollectibles(partialStats, habits, previousUnlocked || []);
    partialStats.unlockedCollectibles = allUnlocked;

    return partialStats;
};
