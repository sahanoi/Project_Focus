import { describe, it, expect } from 'vitest';
import {
    findStarterWaterHabit,
    getStarterQuestProgress,
    isStarterQuestComplete,
    shouldShowStarterQuest,
    STARTER_QUEST_HABIT_NAME,
} from '../starterQuestUtils';
import { Completion, Habit } from '../../types';
import { today } from '../dateUtils';

function makeWaterHabit(completions: Record<string, Completion>): Habit {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return {
        id: 'w1',
        name: STARTER_QUEST_HABIT_NAME,
        type: 'numerical',
        category: 'health',
        color: '#2563EB',
        icon: '💧',
        schedule: { type: 'daily' },
        dailyTarget: 6,
        goalValue: 8,
        unit: 'glasses',
        completions,
        createdAt: d.toISOString(),
        archived: false,
    };
}

describe('starterQuestUtils', () => {
    it('returns null for findStarterWater when no matching habit', () => {
        const h: Habit = { ...makeWaterHabit({}), name: 'Other', id: 'o1' };
        expect(findStarterWaterHabit([h])).toBeNull();
    });

    it('treats quest as complete when Drink Water habit is absent', () => {
        expect(isStarterQuestComplete([])).toBe(true);
        expect(shouldShowStarterQuest([])).toBe(false);
    });

    it('is complete after 3 consecutive due-day check-ins', () => {
        const t = today();
        const d1 = new Date(t);
        d1.setDate(d1.getDate() - 2);
        const d2 = new Date(t);
        d2.setDate(d2.getDate() - 1);
        const c1 = d1.toISOString().split('T')[0];
        const c2 = d2.toISOString().split('T')[0];
        const habit = makeWaterHabit({
            [c1]: { date: c1, value: 6, completed: true },
            [c2]: { date: c2, value: 6, completed: true },
            [t]: { date: t, value: 6, completed: true },
        });
        expect(isStarterQuestComplete([habit])).toBe(true);
        expect(shouldShowStarterQuest([habit])).toBe(false);
        const p = getStarterQuestProgress([habit]);
        expect(p?.isComplete).toBe(true);
        expect(p?.level).toBe(3);
    });

    it('is not complete when streak is broken', () => {
        const t = today();
        const d0 = new Date(t);
        d0.setDate(d0.getDate() - 4);
        const d2 = new Date(t);
        d2.setDate(d2.getDate() - 2);
        const c0 = d0.toISOString().split('T')[0];
        const c2 = d2.toISOString().split('T')[0];
        const habit = makeWaterHabit({
            [c0]: { date: c0, value: 1, completed: true },
            [c2]: { date: c2, value: 1, completed: true },
            [t]: { date: t, value: 1, completed: true },
        });
        expect(isStarterQuestComplete([habit])).toBe(false);
        expect(shouldShowStarterQuest([habit])).toBe(true);
    });
});
