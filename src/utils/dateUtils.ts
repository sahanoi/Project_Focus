import {
    format,
    parseISO,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    eachDayOfInterval,
    subDays,
    subMonths,
    addDays,
    differenceInDays,
    getDay,
    isToday as isTodayFns,
    isBefore,
    isAfter,
    startOfDay,
} from 'date-fns';

// ==========================================
// Date Formatting
// ==========================================

export const DATE_FORMAT = 'yyyy-MM-dd';

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, DATE_FORMAT);
}

export function formatDisplayDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM d, yyyy');
}

export function formatShortDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM d');
}

export function formatDayName(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'EEEE');
}

// ==========================================
// Date Checks
// ==========================================

export function isToday(date: string): boolean {
    return isTodayFns(parseISO(date));
}

export function isDateBefore(a: string, b: string): boolean {
    return isBefore(parseISO(a), parseISO(b));
}

export function isDateAfter(a: string, b: string): boolean {
    return isAfter(parseISO(a), parseISO(b));
}

export function today(): string {
    return formatDate(new Date());
}

// ==========================================
// Date Ranges
// ==========================================

export function getDateRange(
    rangeType: 'week' | 'month' | 'quarter' | 'year' | 'all',
    referenceDate?: string
): { start: string; end: string } {
    const ref = referenceDate ? parseISO(referenceDate) : new Date();
    const endDate = formatDate(ref);

    switch (rangeType) {
        case 'week':
            return {
                start: formatDate(startOfWeek(ref, { weekStartsOn: 1 })),
                end: formatDate(endOfWeek(ref, { weekStartsOn: 1 })),
            };
        case 'month':
            return {
                start: formatDate(startOfMonth(ref)),
                end: formatDate(endOfMonth(ref)),
            };
        case 'quarter':
            return {
                start: formatDate(subMonths(startOfMonth(ref), 2)),
                end: endDate,
            };
        case 'year':
            return {
                start: formatDate(startOfYear(ref)),
                end: formatDate(endOfYear(ref)),
            };
        case 'all':
            return {
                start: '2020-01-01',
                end: endDate,
            };
    }
}

export function getDaysInRange(start: string, end: string): string[] {
    const interval = {
        start: parseISO(start),
        end: parseISO(end),
    };
    return eachDayOfInterval(interval).map((d) => formatDate(d));
}

// ==========================================
// Day calculations
// ==========================================

export function daysBetween(a: string, b: string): number {
    return differenceInDays(parseISO(b), parseISO(a));
}

export function getDayOfWeek(date: string): number {
    return getDay(parseISO(date));
}

export function getDayOfWeekName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

export function getDayOfMonth(date: string): number {
    return parseISO(date).getDate();
}

export function addDaysToDate(date: string, days: number): string {
    return formatDate(addDays(parseISO(date), days));
}

export function subtractDays(date: string, days: number): string {
    return formatDate(subDays(parseISO(date), days));
}

// ==========================================
// Week helpers
// ==========================================

export function getWeekDays(date?: string): string[] {
    const ref = date ? parseISO(date) : new Date();
    const start = startOfWeek(ref, { weekStartsOn: 1 });
    const end = endOfWeek(ref, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map((d) => formatDate(d));
}

// ==========================================
// Month helpers
// ==========================================

export function getMonthDays(date?: string): string[] {
    const ref = date ? parseISO(date) : new Date();
    const start = startOfMonth(ref);
    const end = endOfMonth(ref);
    return eachDayOfInterval({ start, end }).map((d) => formatDate(d));
}

export function getMonthGrid(date?: string): (string | null)[][] {
    const ref = date ? parseISO(date) : new Date();
    const monthStart = startOfMonth(ref);
    const monthEnd = endOfMonth(ref);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeks: (string | null)[][] = [];
    let currentWeek: (string | null)[] = [];

    // Fill empty days at start
    const startDay = getDay(monthStart);
    const mondayOffset = startDay === 0 ? 6 : startDay - 1;
    for (let i = 0; i < mondayOffset; i++) {
        currentWeek.push(null);
    }

    for (const day of days) {
        currentWeek.push(formatDate(day));
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Fill empty days at end
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    return weeks;
}
