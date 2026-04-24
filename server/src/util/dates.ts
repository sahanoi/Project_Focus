/** Safe ISO string for DB timestamps (pg may return Date or string depending on driver/config). */
export function toIsoTimestamp(value: Date | string | number): string {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? new Date(0).toISOString() : value.toISOString();
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}
