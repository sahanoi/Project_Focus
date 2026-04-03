import { CharacterStats, Habit, HabitTemplate } from '../types';
import { isHabitTypeAvailable } from './featureGateUtils';

/** Same mapping as OnboardingWizard — keeps ritual auto-seed aligned with wizard templates. */
export function habitPayloadFromTemplate(
    template: HabitTemplate,
    stats: CharacterStats
): Omit<Habit, 'id' | 'completions' | 'createdAt' | 'archived'> {
    const type = isHabitTypeAvailable(stats, template.type) ? template.type : 'regular';
    const base = {
        name: template.name,
        type,
        category: template.category,
        color: template.color,
        icon: template.icon,
        schedule: template.schedule,
    };
    if (type === 'numerical') {
        return {
            ...base,
            dailyTarget: template.dailyTarget,
            goalValue: template.goalValue,
            unit: template.unit,
        };
    }
    if (type === 'infinite') {
        return base;
    }
    return base;
}
