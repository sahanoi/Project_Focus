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
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Inbox size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-1">No habits yet 📝</h3>
                <p className="text-gray-500 text-sm mb-4">
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
                <h3 className="text-lg font-bold text-dark mb-1">No habits scheduled today!</h3>
                <p className="text-gray-500 text-sm mb-4">
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
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                        {emoji} {title}
                    </h2>
                    <span className="text-xs text-gray-400 font-medium">({habits.length})</span>
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
            <div className="rounded-xl border border-[#2A2E37] bg-[#1C1F26] p-5 mb-6" style={{ boxShadow: '4px 4px 0px 0px rgba(0, 0, 0, 0.25)' }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="section-title">📊 Today's Progress</h2>
                    <span className="stat-number text-xl" style={{ color: completionPercent === 100 ? '#10B981' : '#2563EB' }}>
                        {completionPercent === 100 ? '🎉 ' : ''}{completionPercent}%
                    </span>
                </div>
                <div className="progress-bar h-3">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${completionPercent}%`,
                            backgroundColor: completionPercent === 100 ? '#10B981' : '#2563EB',
                        }}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    ✅ {completedCount} of {todaysHabits.length} habits completed
                    {todaysHabits.length < totalHabitsCount && (
                        <span className="text-xs text-gray-400 ml-2">
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
