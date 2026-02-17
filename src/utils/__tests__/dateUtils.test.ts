import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatDisplayDate,
    isToday,
    today,
    getDateRange,
    getDaysInRange,
    daysBetween,
    getDayOfWeek,
    getWeekDays,
    getMonthDays,
    getMonthGrid,
} from '../dateUtils';

describe('formatDate', () => {
    it('should format a Date object', () => {
        const result = formatDate(new Date(2026, 1, 13)); // Feb 13
        expect(result).toBe('2026-02-13');
    });

    it('should format a string date', () => {
        expect(formatDate('2026-02-13')).toBe('2026-02-13');
    });
});

describe('formatDisplayDate', () => {
    it('should return human-readable date', () => {
        expect(formatDisplayDate('2026-02-13')).toBe('Feb 13, 2026');
    });
});

describe('today', () => {
    it('should return todays date as string', () => {
        const t = today();
        expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('getDaysInRange', () => {
    it('should return all days between two dates inclusive', () => {
        const result = getDaysInRange('2026-02-01', '2026-02-03');
        expect(result).toEqual(['2026-02-01', '2026-02-02', '2026-02-03']);
    });

    it('should return single day for same start and end', () => {
        const result = getDaysInRange('2026-02-01', '2026-02-01');
        expect(result).toEqual(['2026-02-01']);
    });
});

describe('daysBetween', () => {
    it('should return difference in days', () => {
        expect(daysBetween('2026-02-01', '2026-02-10')).toBe(9);
    });

    it('should return 0 for same day', () => {
        expect(daysBetween('2026-02-01', '2026-02-01')).toBe(0);
    });
});

describe('getDayOfWeek', () => {
    it('should return correct day index (Sunday=0)', () => {
        // Feb 13, 2026 is a Friday
        expect(getDayOfWeek('2026-02-13')).toBe(5);
    });
});

describe('getWeekDays', () => {
    it('should return 7 days starting from Monday', () => {
        const result = getWeekDays('2026-02-13');
        expect(result).toHaveLength(7);
        // Feb 13 2026 is Friday, week starts Monday = Feb 9
        expect(result[0]).toBe('2026-02-09');
        expect(result[6]).toBe('2026-02-15');
    });
});

describe('getMonthDays', () => {
    it('should return all days in February 2026', () => {
        const result = getMonthDays('2026-02-13');
        expect(result).toHaveLength(28);
        expect(result[0]).toBe('2026-02-01');
        expect(result[27]).toBe('2026-02-28');
    });
});

describe('getDateRange', () => {
    it('should return week range', () => {
        const range = getDateRange('week', '2026-02-13');
        expect(range.start).toBe('2026-02-09');
        expect(range.end).toBe('2026-02-15');
    });

    it('should return month range', () => {
        const range = getDateRange('month', '2026-02-13');
        expect(range.start).toBe('2026-02-01');
        expect(range.end).toBe('2026-02-28');
    });
});

describe('getMonthGrid', () => {
    it('should return weeks with null padding', () => {
        const grid = getMonthGrid('2026-02-13');
        expect(grid.length).toBeGreaterThanOrEqual(4);
        // Each week should have 7 slots
        for (const week of grid) {
            expect(week).toHaveLength(7);
        }
    });
});
