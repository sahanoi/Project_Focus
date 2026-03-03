import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { format, subDays, eachDayOfInterval, startOfWeek } from 'date-fns';

/**
 * GitHub-style mini heatmap showing the last ~12 weeks of habit activity.
 * Color intensity scales with completion count per day.
 */
export default function MiniHeatmap() {
    const { habits, selectedDate } = useHabitStore();
    const activeHabits = habits.filter(h => !h.archived);

    const heatmapData = useMemo(() => {
        const today = new Date(selectedDate + 'T00:00:00');
        const weeksBack = 12;
        const startDate = startOfWeek(subDays(today, weeksBack * 7), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: today });

        const totalHabits = activeHabits.length || 1;

        return days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            let completed = 0;

            activeHabits.forEach(h => {
                const c = h.completions[dateStr];
                if (h.type === 'numerical') {
                    if ((c?.value ?? 0) > 0) completed++;
                } else {
                    if (c?.completed) completed++;
                }
            });

            const rate = completed / totalHabits;

            return {
                date: dateStr,
                dayOfWeek: date.getDay(),
                completed,
                rate,
                level: rate === 0 ? 0 : rate < 0.25 ? 1 : rate < 0.5 ? 2 : rate < 0.75 ? 3 : 4,
            };
        });
    }, [activeHabits, selectedDate]);

    // Group by week columns
    const weeks = useMemo(() => {
        const cols: typeof heatmapData[] = [];
        let current: typeof heatmapData = [];

        heatmapData.forEach(d => {
            // Monday = 1, adjust so Mon=0
            const adjusted = d.dayOfWeek === 0 ? 6 : d.dayOfWeek - 1;
            if (adjusted === 0 && current.length > 0) {
                cols.push(current);
                current = [];
            }
            current.push(d);
        });
        if (current.length > 0) cols.push(current);

        return cols;
    }, [heatmapData]);

    const levelColors = [
        'bg-[#D4C8E8]',           // 0: empty
        'bg-primary/20',          // 1: <25%
        'bg-primary/40',          // 2: 25-50%
        'bg-primary/65',          // 3: 50-75%
        'bg-primary',             // 4: 75-100%
    ];

    const totalCompleted = heatmapData.reduce((sum, d) => sum + d.completed, 0);

    return (
        <div className="space-y-3">
            {/* Heatmap grid */}
            <div className="flex gap-[3px] justify-end overflow-hidden">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map(day => (
                            <div
                                key={day.date}
                                className={`w-[11px] h-[11px] rounded-[3px] transition-colors ${levelColors[day.level]}`}
                                title={`${format(new Date(day.date + 'T00:00:00'), 'MMM d')}: ${day.completed}/${activeHabits.length}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-dark-lighter font-medium">
                    {totalCompleted} completions in {weeks.length} weeks
                </span>
                <div className="flex items-center gap-1">
                    <span className="text-dark-lighter">Less</span>
                    {levelColors.map((color, i) => (
                        <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${color}`} />
                    ))}
                    <span className="text-dark-lighter">More</span>
                </div>
            </div>
        </div>
    );
}
