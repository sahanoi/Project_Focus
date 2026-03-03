import { describe, it, expect } from 'vitest';
import { CharacterStats } from '../../types';
import {
    getFeatureGate,
    canAddHabit,
    isHabitTypeAvailable,
    isAnalyticsEnabled,
    getUserTierName,
} from '../featureGateUtils';

// Helper to build stats at a given level
function statsAtLevel(level: number): CharacterStats {
    return {
        level,
        xp: 0,
        nextLevelXp: 1000,
        accountCreatedDate: '2024-01-01T00:00:00.000Z',
        attributes: { ovr: 60, dsc: 60, foc: 60, stk: 60, bal: 60, grt: 60, vit: 60 },
    };
}

describe('getFeatureGate', () => {
    it('returns novice gate for level 1', () => {
        const gate = getFeatureGate(statsAtLevel(1));
        expect(gate.maxHabits).toBe(3);
        expect(gate.analyticsEnabled).toBe(false);
        expect(gate.routinesEnabled).toBe(false);
    });

    it('returns apprentice gate for level 2', () => {
        const gate = getFeatureGate(statsAtLevel(2));
        expect(gate.maxHabits).toBe(6);
        expect(gate.availableHabitTypes).toContain('numerical');
    });

    it('returns practitioner gate for level 3', () => {
        const gate = getFeatureGate(statsAtLevel(3));
        expect(gate.maxHabits).toBe(12);
        expect(gate.analyticsEnabled).toBe(true);
        expect(gate.goalsEnabled).toBe(true);
    });

    it('returns competent gate for level 4', () => {
        const gate = getFeatureGate(statsAtLevel(4));
        expect(gate.maxHabits).toBe(25);
        expect(gate.routinesEnabled).toBe(true);
        expect(gate.availableHabitTypes).toContain('challenge');
    });

    it('returns expert gate for level 5+', () => {
        const gate = getFeatureGate(statsAtLevel(5));
        expect(gate.maxHabits).toBe(Infinity);
    });

    it('returns expert gate for very high levels', () => {
        const gate = getFeatureGate(statsAtLevel(99));
        expect(gate.maxHabits).toBe(Infinity);
    });
});

describe('canAddHabit', () => {
    it('allows adding habits below max', () => {
        expect(canAddHabit(statsAtLevel(1), 2)).toBe(true);
    });

    it('blocks adding habits at max', () => {
        expect(canAddHabit(statsAtLevel(1), 3)).toBe(false);
    });

    it('blocks adding habits above max', () => {
        expect(canAddHabit(statsAtLevel(1), 5)).toBe(false);
    });

    it('expert tier allows unlimited', () => {
        expect(canAddHabit(statsAtLevel(5), 999)).toBe(true);
    });
});

describe('isHabitTypeAvailable', () => {
    it('novice only has regular', () => {
        expect(isHabitTypeAvailable(statsAtLevel(1), 'regular')).toBe(true);
        expect(isHabitTypeAvailable(statsAtLevel(1), 'numerical')).toBe(false);
        expect(isHabitTypeAvailable(statsAtLevel(1), 'challenge')).toBe(false);
    });

    it('apprentice has regular + numerical', () => {
        expect(isHabitTypeAvailable(statsAtLevel(2), 'numerical')).toBe(true);
        expect(isHabitTypeAvailable(statsAtLevel(2), 'infinite')).toBe(false);
    });

    it('practitioner has regular + numerical + infinite', () => {
        expect(isHabitTypeAvailable(statsAtLevel(3), 'infinite')).toBe(true);
        expect(isHabitTypeAvailable(statsAtLevel(3), 'challenge')).toBe(false);
    });

    it('competent has all types', () => {
        expect(isHabitTypeAvailable(statsAtLevel(4), 'challenge')).toBe(true);
    });
});

describe('isAnalyticsEnabled', () => {
    it('disabled for novice (level 1)', () => {
        expect(isAnalyticsEnabled(statsAtLevel(1))).toBe(false);
    });

    it('disabled for apprentice (level 2)', () => {
        expect(isAnalyticsEnabled(statsAtLevel(2))).toBe(false);
    });

    it('enabled for practitioner (level 3)', () => {
        expect(isAnalyticsEnabled(statsAtLevel(3))).toBe(true);
    });
});

describe('getUserTierName', () => {
    it('returns correct names for each level', () => {
        expect(getUserTierName(statsAtLevel(1))).toBe('Novice');
        expect(getUserTierName(statsAtLevel(2))).toBe('Apprentice');
        expect(getUserTierName(statsAtLevel(3))).toBe('Practitioner');
        expect(getUserTierName(statsAtLevel(4))).toBe('Competent');
        expect(getUserTierName(statsAtLevel(5))).toBe('Expert');
    });
});
