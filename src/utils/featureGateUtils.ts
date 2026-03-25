import { LEVEL_TO_TIER, FEATURE_GATES, FeatureGate, HabitType, CharacterStats, USER_TIER_ORDER } from '../types';

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

/** Minimum character level required to create habits of this type (1–6+). */
export function getMinLevelForHabitType(type: HabitType): number {
    const tierMinLevel: Record<(typeof USER_TIER_ORDER)[number], number> = {
        novice: 1,
        apprentice: 2,
        practitioner: 3,
        strategist: 4,
        competent: 5,
        expert: 6,
    };
    for (const tier of USER_TIER_ORDER) {
        if (FEATURE_GATES[tier].availableHabitTypes.includes(type)) {
            return tierMinLevel[tier];
        }
    }
    return 99;
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
        strategist: 'Strategist',
        competent: 'Competent',
        expert: 'Expert',
    };
    return names[tier] || tier;
}
