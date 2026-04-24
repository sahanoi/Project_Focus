import type { Habit, HabitCategory, HabitType, SkillAttributeKey } from '../types';

/** All trainable dimensions except OVR (display + weighting). */
export const SKILL_ATTRIBUTE_KEYS: readonly SkillAttributeKey[] = [
    'dsc',
    'foc',
    'stk',
    'bal',
    'grt',
    'vit',
] as const;

/** Heuristic defaults when the user creates a custom habit without picking skills. */
export function inferSkillFocusFromCategoryType(
    category: HabitCategory,
    type: HabitType
): { primarySkills: SkillAttributeKey[]; secondarySkills: SkillAttributeKey[] } {
    const secondary: SkillAttributeKey[] = [];
    const add = (p: SkillAttributeKey[], s: SkillAttributeKey[]) => ({
        primarySkills: p,
        secondarySkills: s,
    });

    switch (category) {
        case 'health':
        case 'fitness':
            if (type === 'numerical') return add(['vit', 'foc'], ['dsc', 'grt']);
            return add(['vit'], ['dsc', 'grt']);
        case 'learning':
            return add(['foc', 'grt'], ['dsc']);
        case 'productivity':
            return add(['dsc', 'foc'], type === 'infinite' ? ['grt'] : []);
        case 'mindfulness':
            return add(['foc', 'dsc'], ['vit']);
        case 'social':
            return add(['bal', 'dsc'], ['foc']);
        case 'finance':
            return add(['dsc', 'foc'], ['grt']);
        case 'creativity':
            return add(['foc', 'grt'], ['dsc']);
        default:
            return add(['dsc'], ['grt', 'foc']);
    }
}

export function habitSkillWeight(habit: Habit, key: SkillAttributeKey): number {
    const p = habit.primarySkills;
    const s = habit.secondarySkills;
    let w = 0;
    if (p?.includes(key)) w += 1;
    if (s?.includes(key)) w += 0.5;
    return w;
}

export function hasAnySkillFocus(habit: Habit): boolean {
    return (habit.primarySkills?.length ?? 0) > 0 || (habit.secondarySkills?.length ?? 0) > 0;
}

export function effectiveSkillFocus(habit: Habit): { primarySkills: SkillAttributeKey[]; secondarySkills: SkillAttributeKey[] } {
    if (hasAnySkillFocus(habit)) {
        return {
            primarySkills: habit.primarySkills ?? [],
            secondarySkills: habit.secondarySkills ?? [],
        };
    }
    return inferSkillFocusFromCategoryType(habit.category, habit.type);
}
