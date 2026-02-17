import React, { useState, useMemo, useRef } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import { calculateCurrentStreak, calculateLongestStreak, getChallengeProgress, getTotalNumericalValue } from '../../utils/statsUtils';
import { calculateHabitLevel, getLevelColor } from '../../utils/habitLevelUtils';
import { getDateRange } from '../../utils/dateUtils';
import {
    Check, Flame, Infinity, Timer, Target, MoreVertical,
    Trash2, Copy, Archive, Edit3, Minus, Plus,
} from 'lucide-react';

interface HabitCardProps {
    habit: Habit;
    date: string;
    onEdit: (habit: Habit) => void;
}

/**
 * Build a human-readable completion condition string.
 */
function getCompletionCondition(habit: Habit): string {
    const scheduleLabel = getScheduleLabel(habit);

    switch (habit.type) {
        case 'regular':
            return scheduleLabel;
        case 'numerical': {
            const target = habit.dailyTarget || habit.goalValue || 0;
            const unit = habit.unit || 'units';
            if (habit.dailyTarget) {
                return `At least ${target} ${unit} ${scheduleLabel.toLowerCase()}`;
            }
            return `Track ${unit} ${scheduleLabel.toLowerCase()}`;
        }
        case 'infinite':
            return "Don't break the chain";
        case 'challenge': {
            const progress = getChallengeProgress(habit);
            if (progress) {
                return `Complete ${progress.daysTotal} days`;
            }
            return 'Challenge mode';
        }
        default:
            return scheduleLabel;
    }
}

function getScheduleLabel(habit: Habit): string {
    const schedule = habit.schedule || { type: 'daily' };
    switch (schedule.type) {
        case 'daily':
            return 'Daily';
        case 'weekly': {
            if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return schedule.daysOfWeek.map(d => dayNames[d]).join(', ');
            }
            return 'Weekly';
        }
        case 'monthly':
            return 'Monthly';
        case 'custom':
            return `Every ${schedule.customInterval || 2} days`;
        default:
            return 'Daily';
    }
}

/**
 * Get aggregate numerical value for the current week.
 */
function getWeeklyTotal(habit: Habit): number {
    const { start, end } = getDateRange('week');
    let total = 0;
    const startD = new Date(start);
    const endD = new Date(end);
    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const c = habit.completions[dateStr];
        if (c?.value !== undefined) total += c.value;
    }
    return total;
}

export default function HabitCard({ habit, date, onEdit }: HabitCardProps) {
    const { toggleCompletion, setNumericalValue, deleteHabit, archiveHabit, duplicateHabit, setSelectedHabitId } = useHabitStore();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const completion = habit.completions[date];
    const isCompleted = completion?.completed === true;
    const currentStreak = calculateCurrentStreak(habit);

    // Habit Level
    const levelInfo = useMemo(() => calculateHabitLevel(habit), [habit]);
    const levelColor = getLevelColor(levelInfo.level);

    // Challenge progress
    const challengeProgress = habit.type === 'challenge' ? getChallengeProgress(habit) : null;

    // Numerical progress
    const totalNumerical = habit.type === 'numerical' ? getTotalNumericalValue(habit) : 0;
    const goalPercent = habit.type === 'numerical' && habit.goalValue
        ? Math.min(Math.round((totalNumerical / habit.goalValue) * 100), 100)
        : 0;

    // Aggregate weekly total for numerical habits
    const weeklyTotal = useMemo(() => {
        if (habit.type !== 'numerical') return 0;
        return getWeeklyTotal(habit);
    }, [habit]);

    const completionCondition = useMemo(() => getCompletionCondition(habit), [habit]);

    const handleCheckToggle = () => {
        if (habit.type !== 'numerical') {
            toggleCompletion(habit.id, date);
        }
    };

    const handleNumericalInput = (val: number) => {
        const newVal = Math.max(0, val);
        setNumericalValue(habit.id, date, newVal);
    };

    const currentNumValue = completion?.value ?? 0;

    return (
        <div
            className={`card-flat relative group transition-all duration-200 hover:shadow-md cursor-pointer ${isCompleted ? 'border-l-4' : 'border-l-4 border-l-gray-200'
                }`}
            style={isCompleted ? { borderLeftColor: habit.color } : undefined}
            onClick={() => setSelectedHabitId(habit.id)}
        >
            <div className="flex items-start gap-3">
                {/* Status Indicator / Checkbox */}
                <div onClick={(e) => e.stopPropagation()}>
                    {habit.type === 'numerical' ? (
                        <div
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${isCompleted
                                    ? 'text-white border-transparent'
                                    : 'border-gray-200 text-gray-300'
                                }`}
                            style={isCompleted ? { backgroundColor: habit.color } : undefined}
                        >
                            <Target size={14} strokeWidth={3} />
                        </div>
                    ) : (
                        <button
                            onClick={handleCheckToggle}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${isCompleted
                                ? 'text-white border-transparent'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            style={isCompleted ? { backgroundColor: habit.color } : undefined}
                        >
                            {isCompleted && <Check size={16} strokeWidth={3} />}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{habit.icon}</span>
                        <h3 className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-gray-400' : 'text-dark'}`}>
                            {habit.name}
                        </h3>
                        {/* Level Badge */}
                        <span
                            className="text-[10px] font-bold px-1.5 py-0 rounded-full border"
                            style={{
                                color: levelColor,
                                borderColor: levelColor + '40',
                                backgroundColor: levelColor + '15',
                            }}
                        >
                            Lv.{levelInfo.level}
                        </span>
                    </div>

                    {/* Completion condition */}
                    <p className="text-[10px] text-gray-400 mb-1.5 leading-tight">{completionCondition}</p>

                    {/* Type-specific info */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Streak */}
                        {(habit.type === 'regular' || habit.type === 'infinite') && currentStreak > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-warning">
                                <Flame size={13} /> {currentStreak} day streak 🔥
                            </span>
                        )}

                        {/* Numerical goal progress */}
                        {habit.type === 'numerical' && habit.goalValue && (
                            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                                <div className="progress-bar flex-1 h-2">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${goalPercent}%`, backgroundColor: habit.color }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-500">
                                    {totalNumerical}/{habit.goalValue} {habit.unit}
                                </span>
                            </div>
                        )}

                        {/* Weekly aggregate total for numerical */}
                        {habit.type === 'numerical' && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                This week: {weeklyTotal} {habit.unit || ''}
                            </span>
                        )}

                        {/* Daily target indicator */}
                        {habit.dailyTarget && habit.type === 'numerical' && (
                            <span className={`text-[10px] font-bold ${currentNumValue >= habit.dailyTarget ? 'text-success' : 'text-gray-400'
                                }`}>
                                {currentNumValue >= habit.dailyTarget ? '🟢' : '⚪'} {currentNumValue}/{habit.dailyTarget}
                            </span>
                        )}

                        {/* Challenge countdown */}
                        {habit.type === 'challenge' && challengeProgress && (
                            <div className="flex items-center gap-2">
                                <span className="challenge-timer">
                                    <Timer size={12} /> {challengeProgress.daysRemaining}d left
                                </span>
                                <span className="text-xs font-semibold text-gray-500">
                                    {challengeProgress.daysCompleted}/{challengeProgress.daysTotal} days
                                </span>
                            </div>
                        )}

                        {/* Level progress bar (tiny) */}
                        {levelInfo.level < 10 && (
                            <div className="flex items-center gap-1.5 ml-auto">
                                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${levelInfo.progressToNext}%`, backgroundColor: levelColor }}
                                    />
                                </div>
                                <span className="text-[9px] text-gray-400">{levelInfo.title}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div ref={menuRef} className="absolute right-0 top-8 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                                <button
                                    onClick={() => { onEdit(habit); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
                                >
                                    <Edit3 size={14} /> ✏️ Edit
                                </button>
                                <button
                                    onClick={() => { duplicateHabit(habit.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
                                >
                                    <Copy size={14} /> 📋 Duplicate
                                </button>
                                <button
                                    onClick={() => { archiveHabit(habit.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
                                >
                                    <Archive size={14} /> 📦 {habit.archived ? 'Unarchive' : 'Archive'}
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                    onClick={() => { deleteHabit(habit.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 text-danger text-left"
                                >
                                    <Trash2 size={14} /> 🗑️ Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
