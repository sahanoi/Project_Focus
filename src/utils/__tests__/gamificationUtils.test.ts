import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Habit, Goal } from '../../types';
import { calculateCharacterStats, MILESTONE_XP_PER_GOAL } from '../gamificationUtils';

const base = {
    id: '00000000-0000-4000-8000-000000000001',
    createdAt: '2024-01-01',
    archived: false,
    completions: {},
    color: '#000',
    icon: '✅',
} as const;

function makeHabit(over: Partial<Habit> & Pick<Habit, 'name' | 'type' | 'category'>): Habit {
    return { ...base, ...over, completions: over.completions ?? {} } as Habit;
}

describe('calculateCharacterStats', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: () => null,
        });
    });

    it('returns level 1 with no habits', () => {
        const s = calculateCharacterStats([], '2024-01-01T00:00:00.000Z', []);
        expect(s.level).toBe(1);
        expect(s.xp).toBe(0);
    });

    it('adds milestone XP for achieved goals', () => {
        const day = new Date().toISOString().split('T')[0];
        const habit = makeHabit({
            name: 'A',
            type: 'regular',
            category: 'health',
            primarySkills: ['vit'],
            completions: { [day]: { date: day, completed: true } },
        });
        const goals: Goal[] = [
            {
                id: '00000000-0000-4000-8000-0000000000aa',
                habitId: habit.id,
                name: 'G',
                targetValue: 10,
                unit: 'x',
                achieved: true,
                createdAt: '2025-01-01',
            },
        ];
        const s = calculateCharacterStats([habit], '2024-01-01T00:00:00.000Z', [], goals);
        expect(s.xp).toBeGreaterThanOrEqual(50 + MILESTONE_XP_PER_GOAL);
    });

    it('merges tag-based and legacy sub-stats when habits have skill tags', () => {
        const day = new Date().toISOString().split('T')[0];
        const h = makeHabit({
            name: 'Tagged',
            type: 'regular',
            category: 'health',
            schedule: { type: 'daily' },
            primarySkills: ['vit', 'dsc'],
            completions: { [day]: { date: day, completed: true } },
        });
        const s = calculateCharacterStats([h], '2025-01-01T00:00:00.000Z', [], []);
        expect(s.attributes.dsc).toBeGreaterThanOrEqual(50);
        expect(s.attributes.vit).toBeGreaterThanOrEqual(50);
        expect(s.attributes.ovr).toBeGreaterThanOrEqual(50);
    });
});
