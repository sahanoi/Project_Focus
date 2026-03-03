import { LEVEL_TO_TIER, FEATURE_GATES, FeatureGate, HabitType, CharacterStats } from '../types';

/**
 * Returns the feature gate config for the user's current level.
 */
export function getFeatureGate(stats: CharacterStats): FeatureGate {
    const tier = LEVEL_TO_TIER(stats.level);
    return FEATURE_GATES[tier];
}

/** Can the user add another habit? */
export function canAddHabit(stats: CharacterStats, currentHabitCount: number): boolean {
    return currentHabitCount < getFeatureGate(stats).maxHabits;
}

/** Is this habit type available at the user's tier? */
export function isHabitTypeAvailable(stats: CharacterStats, type: HabitType): boolean {
    return getFeatureGate(stats).availableHabitTypes.includes(type);
}

/** Is the analytics/stats tab enabled? */
export function isAnalyticsEnabled(stats: CharacterStats): boolean {
    return getFeatureGate(stats).analyticsEnabled;
}

/** Get the user's current tier name. */
export function getUserTierName(stats: CharacterStats): string {
    const tier = LEVEL_TO_TIER(stats.level);
    const names: Record<string, string> = {
        novice: 'Novice',
        apprentice: 'Apprentice',
        practitioner: 'Practitioner',
        competent: 'Competent',
        expert: 'Expert',
    };
    return names[tier] || tier;
}
