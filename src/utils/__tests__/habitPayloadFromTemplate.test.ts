import { describe, it, expect } from 'vitest';
import { HABIT_TEMPLATES } from '../../types';
import { habitPayloadFromTemplate } from '../habitPayloadFromTemplate';
import { STARTER_QUEST_HABIT_NAME } from '../starterQuestUtils';

const noviceStats = {
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    accountCreatedDate: '2024-01-01T00:00:00.000Z',
    unlockedCollectibles: [] as string[],
    attributes: { ovr: 50, dsc: 50, foc: 50, stk: 50, bal: 50, grt: 50, vit: 50 },
};

const apprenticeStats = {
    level: 2,
    xp: 100,
    nextLevelXp: 1000,
    accountCreatedDate: '2024-01-01T00:00:00.000Z',
    unlockedCollectibles: [] as string[],
    attributes: { ovr: 55, dsc: 55, foc: 55, stk: 55, bal: 55, grt: 55, vit: 55 },
};

describe('habitPayloadFromTemplate', () => {
    it('keeps health[0] aligned with starter quest habit name', () => {
        expect(HABIT_TEMPLATES.health[0].name).toBe(STARTER_QUEST_HABIT_NAME);
    });

    it('coerces Drink Water to regular for novice (same as onboarding)', () => {
        const water = HABIT_TEMPLATES.health[0];
        const p = habitPayloadFromTemplate(water, noviceStats);
        expect(p.name).toBe(STARTER_QUEST_HABIT_NAME);
        expect(p.type).toBe('regular');
        expect(p.goalValue).toBeUndefined();
    });

    it('preserves numerical Drink Water for apprentice+', () => {
        const water = HABIT_TEMPLATES.health[0];
        const p = habitPayloadFromTemplate(water, apprenticeStats);
        expect(p.type).toBe('numerical');
        expect(p.goalValue).toBe(8);
        expect(p.unit).toBe('glasses');
        expect(p.dailyTarget).toBe(6);
    });
});
