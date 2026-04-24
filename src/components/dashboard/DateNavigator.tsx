import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { format, addDays, subDays, startOfWeek, isSameDay, isToday as isDateToday } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DateNavigator() {
    const { selectedDate, setSelectedDate, habits } = useHabitStore();
    const selected = new Date(selectedDate + 'T00:00:00');

    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(selected, { weekStartsOn: 1 }); // Monday start
        return Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            // Count completions for this date
            const completions = habits.filter(h => {
                if (h.archived) return false;
                const c = h.completions[dateStr];
                if (h.type === 'numerical') return (c?.value ?? 0) > 0;
                return c?.completed === true;
            }).length;

            const scheduledCount = habits.filter(h => !h.archived).length;

            return {
                date,
                dateStr,
                dayLabel: format(date, 'EEE'),       // Mon, Tue, etc.
                dayNum: format(date, 'd'),
                isToday: isDateToday(date),
                isSelected: isSameDay(date, selected),
                completions,
                scheduledCount,
                completionRate: scheduledCount > 0 ? completions / scheduledCount : 0,
            };
        });
    }, [selectedDate, habits]);

    const goToToday = () => {
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    };

    const navigateWeek = (direction: number) => {
        const newDate = addDays(selected, direction * 7);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    };

    const isCurrentWeek = weekDays.some(d => d.isToday);

    return (
        <div className="flex items-center gap-2 w-full">
            {/* Week nav */}
            <button
                onClick={() => navigateWeek(-1)}
                className="p-1 rounded-md hover:bg-white/70 dark:hover:bg-primary/15 text-dark-lighter dark:text-night-text-muted transition-colors flex-shrink-0"
                aria-label="Previous week"
            >
                <ChevronLeft size={14} />
            </button>

            {/* Day pills */}
            <div className="flex-1 flex gap-1 justify-center">
                {weekDays.map((day) => (
                    <button
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`relative flex flex-col items-center py-1 px-1.5 rounded-lg transition-colors duration-200 min-w-[36px] group ${day.isSelected
                            ? 'bg-primary text-white'
                            : day.isToday
                                ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light hover:bg-primary/15 dark:hover:bg-primary/30'
                                : 'hover:bg-white/70 dark:hover:bg-primary/15 text-dark-lighter dark:text-night-text-muted'
                            }`}
                    >
                        <span className={`text-[8px] font-bold uppercase tracking-[0.12em] ${day.isSelected ? 'text-white/80' : ''
                            }`}>
                            {day.dayLabel}
                        </span>
                        <span className={`text-sm font-black leading-none ${day.isSelected ? 'text-white' : day.isToday ? 'text-primary dark:text-primary-light' : 'text-dark dark:text-night-text'
                            }`}>
                            {day.dayNum}
                        </span>
                        {/* Completion indicator */}
                        {day.completions > 0 && (
                            <div className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-white' :
                                day.completionRate >= 1 ? 'bg-success' :
                                    day.completionRate >= 0.5 ? 'bg-warning' : 'bg-primary/40'
                                }`} />
                        )}
                    </button>
                ))}
            </div>

            {/* Right side: Week nav + Today button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                    onClick={() => navigateWeek(1)}
                    className="p-1 rounded-md hover:bg-white/70 dark:hover:bg-primary/15 text-dark-lighter dark:text-night-text-muted transition-colors"
                    aria-label="Next week"
                >
                    <ChevronRight size={14} />
                </button>

                {!isCurrentWeek && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={goToToday}
                        className="px-2 py-0.5 rounded-md bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-[9px] font-bold hover:bg-primary/15 dark:hover:bg-primary/30 transition-colors"
                    >
                        Today
                    </motion.button>
                )}
            </div>
        </div>
    );
}
