import { Habit, CharacterStats, HabitCategory } from '../types';
import { calculateCompletionRate, calculateCurrentStreak, calculateLongestStreak } from './statsUtils';

// XP Table: Level = floor(TotalXP / 1000) + 1
export const LEVEL_THRESHOLD = 1000;

export const calculateLevel = (xp: number): { level: number; progress: number; nextLevelXp: number } => {
    const level = Math.floor(xp / LEVEL_THRESHOLD) + 1;
    const progress = xp % LEVEL_THRESHOLD;
    const nextLevelXp = LEVEL_THRESHOLD;
    return { level, progress, nextLevelXp };
};

export const calculateCharacterStats = (habits: Habit[]): CharacterStats => {
    // Base Stats (everyone starts with some potential)
    const stats = {
        ovr: 60,
        dsc: 60, // Discipline
        foc: 60, // Focus
        stk: 60, // Streak
        bal: 60, // Balance
        grt: 60, // Grit
        vit: 60, // Vitality
    };

    if (habits.length === 0) {
        return {
            level: 1,
            xp: 0,
            nextLevelXp: LEVEL_THRESHOLD,
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
    const streakBonus = Math.min(40, avgStreak * 2);
    stats.stk = Math.round(55 + streakBonus);

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
        stats.vit = Math.round(55 + (vitRate / 2.2));
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

    // XP calculation based on total completions
    const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.completions).length, 0);
    const xp = totalCompletions * 50; // 50 XP per completion
    const { level, nextLevelXp } = calculateLevel(xp);

    return {
        level,
        xp,
        nextLevelXp,
        attributes: stats
    };
};
