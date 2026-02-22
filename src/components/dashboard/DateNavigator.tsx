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
        <div className="flex items-center gap-3 w-full">
            {/* Week nav */}
            <button
                onClick={() => navigateWeek(-1)}
                className="p-1.5 rounded-lg hover:bg-white/70 text-dark-lighter transition-colors flex-shrink-0"
                aria-label="Previous week"
            >
                <ChevronLeft size={18} />
            </button>

            {/* Day pills */}
            <div className="flex-1 flex gap-1.5 justify-center">
                {weekDays.map((day) => (
                    <button
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`relative flex flex-col items-center py-1.5 px-2.5 rounded-xl transition-all duration-200 min-w-[44px] group ${day.isSelected
                                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                                : day.isToday
                                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                                    : 'hover:bg-white/70 text-dark-lighter'
                            }`}
                    >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${day.isSelected ? 'text-white/80' : ''
                            }`}>
                            {day.dayLabel}
                        </span>
                        <span className={`text-lg font-black leading-tight ${day.isSelected ? 'text-white' : day.isToday ? 'text-primary' : 'text-dark'
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
                    className="p-1.5 rounded-lg hover:bg-white/70 text-dark-lighter transition-colors"
                    aria-label="Next week"
                >
                    <ChevronRight size={18} />
                </button>

                {!isCurrentWeek && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={goToToday}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors"
                    >
                        Today
                    </motion.button>
                )}
            </div>
        </div>
    );
}
