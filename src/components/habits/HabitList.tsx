import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import HabitCard from './HabitCard';
import { Inbox } from 'lucide-react';
import { getDay, parseISO, differenceInCalendarDays } from 'date-fns';

interface HabitListProps {
    onEditHabit: (habit: Habit) => void;
    onAddHabit: () => void;
}

/**
 * Check if a habit is scheduled for a given date based on its schedule settings.
 */
function isScheduledForDate(habit: Habit, dateStr: string): boolean {
    const schedule = habit.schedule || { type: 'daily' };

    switch (schedule.type) {
        case 'daily':
            return true;

        case 'weekly': {
            if (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0) return true;
            const dayOfWeek = parseISO(dateStr).getDay();
            return schedule.daysOfWeek.includes(dayOfWeek);
        }

        case 'monthly': {
            if (!schedule.daysOfMonth || schedule.daysOfMonth.length === 0) return true;
            const dayOfMonth = parseISO(dateStr).getDate();
            return schedule.daysOfMonth.includes(dayOfMonth);
        }

        case 'custom': {
            if (!schedule.customInterval || schedule.customInterval < 2) return true;
            const created = parseISO(habit.createdAt);
            const current = parseISO(dateStr);
            const diff = differenceInCalendarDays(current, created);
            return diff >= 0 && diff % schedule.customInterval === 0;
        }

        default:
            return true;
    }
}

export default function HabitList({ onEditHabit, onAddHabit }: HabitListProps) {
    const { habits, selectedDate } = useHabitStore();

    // Filter: active + scheduled for selected date
    const todaysHabits = useMemo(() => {
        return habits
            .filter((h) => !h.archived)
            .filter((h) => isScheduledForDate(h, selectedDate));
    }, [habits, selectedDate]);

    // Group habits by type
    const regularHabits = todaysHabits.filter((h) => h.type === 'regular');
    const numericalHabits = todaysHabits.filter((h) => h.type === 'numerical');
    const infiniteHabits = todaysHabits.filter((h) => h.type === 'infinite');
    const challengeHabits = todaysHabits.filter((h) => h.type === 'challenge');

    const completedCount = todaysHabits.filter((h) => {
        const c = h.completions[selectedDate];
        if (h.type === 'numerical') return c?.value !== undefined && c.value > 0;
        return c?.completed === true;
    }).length;

    const completionPercent = todaysHabits.length > 0
        ? Math.round((completedCount / todaysHabits.length) * 100)
        : 0;

    const totalHabitsCount = habits.filter((h) => !h.archived).length;

    if (totalHabitsCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-dark dark:bg-night-bg flex items-center justify-center mb-4 transition-colors">
                    <Inbox size={32} className="text-dark-lighter dark:text-night-text-muted transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-night-text mb-1 transition-colors">No habits yet 📝</h3>
                <p className="text-dark-lighter dark:text-night-text-muted text-sm mb-4 transition-colors">
                    Start building better habits today! 🚀
                </p>
                <button onClick={onAddHabit} className="btn-primary" id="empty-add-habit-btn">
                    ✨ Create Your First Habit
                </button>
            </div>
        );
    }

    if (todaysHabits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-bold text-dark dark:text-night-text mb-1 transition-colors">No habits scheduled today!</h3>
                <p className="text-dark-lighter dark:text-night-text-muted text-sm mb-4 transition-colors">
                    Enjoy your day off, or create a new habit.
                </p>
                <button onClick={onAddHabit} className="btn-secondary" id="add-habit-off-day-btn">
                    ✨ Add a Habit
                </button>
            </div>
        );
    }

    const renderGroup = (title: string, emoji: string, habits: Habit[], colorClass: string) => {
        if (habits.length === 0) return null;
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-dark-lighter dark:text-night-text-muted transition-colors">
                        {emoji} {title}
                    </h2>
                    <span className="text-xs text-dark-lighter dark:text-night-text-muted font-medium transition-colors">({habits.length})</span>
                </div>
                <div className="space-y-2">
                    {habits.map((h) => (
                        <HabitCard key={h.id} habit={h} date={selectedDate} onEdit={onEditHabit} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Daily Progress Summary */}
            <div className="bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl p-5 mb-6 transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-dark dark:text-night-text tracking-wide uppercase transition-colors">
                        Today's Progress
                    </h2>
                    <span
                        className={`text-xl font-black font-mono tabular-nums ${completionPercent === 100 ? 'text-success' : 'text-primary dark:text-primary-light'}`}
                    >
                        {completionPercent === 100 ? '🎉 ' : ''}{completionPercent}%
                    </span>
                </div>
                <div className="h-2.5 bg-[#D4C8E8] dark:bg-night-bg rounded-full overflow-hidden transition-colors">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${completionPercent}%`,
                            backgroundColor: completionPercent === 100
                                ? '#10B981'
                                : '#9B8BB4',
                        }}
                    />
                </div>
                <p className="text-xs text-dark-lighter dark:text-night-text-muted mt-2 font-medium transition-colors">
                    {completedCount} of {todaysHabits.length} habits completed
                    {todaysHabits.length < totalHabitsCount && (
                        <span className="opacity-60 ml-2">
                            ({totalHabitsCount - todaysHabits.length} not scheduled today)
                        </span>
                    )}
                </p>
            </div>

            {/* Habit Groups */}
            {renderGroup('Regular Habits', '✅', regularHabits, 'bg-primary')}
            {renderGroup('Numerical Habits', '🔢', numericalHabits, 'bg-success')}
            {renderGroup('Infinite Loop', '♾️', infiniteHabits, 'bg-warning')}
            {renderGroup('Challenges', '⏱️', challengeHabits, 'bg-purple')}
        </div>
    );
}
