import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import { calculateCurrentStreak, getChallengeProgress, getTotalNumericalValue } from '../../utils/statsUtils';
import { calculateHabitLevel, getLevelColor } from '../../utils/habitLevelUtils';
import { getDateRange } from '../../utils/dateUtils';
import XPToast from '../ui/XPToast';
import {
    Check, Flame, Timer, Target, MoreVertical,
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
    const [showXPToast, setShowXPToast] = useState(false);
    const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const triggerXPToast = useCallback(() => {
        if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
        setShowXPToast(true);
        xpTimerRef.current = setTimeout(() => setShowXPToast(false), 1800);
    }, []);

    const completion = habit.completions[date];
    const isCompleted = completion?.completed === true;
    const currentStreak = calculateCurrentStreak(habit);

    // Habit Level
    const levelInfo = useMemo(() => calculateHabitLevel(habit), [habit]);
    let levelColor = getLevelColor(levelInfo.level);

    // Swap pure stark colors for pastel versions
    if (levelColor === '#ef4444') levelColor = '#F87171';
    if (levelColor === '#f59e0b') levelColor = '#FBBF24';
    if (levelColor === '#3b82f6') levelColor = '#9B8BB4'; // Make max level Lilac!

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
            const wasCompleted = isCompleted;
            toggleCompletion(habit.id, date);
            if (!wasCompleted) triggerXPToast();
        }
    };

    const handleNumericalInput = (val: number) => {
        const newVal = Math.max(0, Math.round(val * 100) / 100);
        const wasZero = currentNumValue === 0;
        setNumericalValue(habit.id, date, newVal);
        if (wasZero && newVal > 0) triggerXPToast();
    };

    const currentNumValue = completion?.value ?? 0;

    return (
        <div
            className={`bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl p-4 relative group transition-colors duration-300 cursor-pointer ${isCompleted ? 'border-l-4' : 'border-l-4 border-l-transparent'
                }`}
            style={isCompleted ? { borderLeftColor: habit.color } : undefined}
            onClick={() => setSelectedHabitId(habit.id)}
        >
            <div className="flex items-start gap-4">
                {/* Status Indicator / Checkbox */}
                <div onClick={(e) => e.stopPropagation()}>
                    {habit.type === 'numerical' ? (
                        <div
                            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${isCompleted
                                ? 'text-white border-transparent'
                                : 'border-gray-300 dark:border-night-border text-dark-lighter dark:text-night-text-muted bg-gray-50 dark:bg-night-bg/50'
                                }`}
                            style={isCompleted ? { backgroundColor: habit.color } : undefined}
                        >
                            <Target size={16} strokeWidth={2.5} />
                        </div>
                    ) : (
                        <button
                            onClick={handleCheckToggle}
                            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300 ${isCompleted
                                ? 'text-white border-transparent'
                                : 'border-gray-300 dark:border-night-border bg-gray-50 dark:bg-night-bg/50 hover:border-gray-400 dark:hover:border-primary-light/45'
                                }`}
                            style={isCompleted ? { backgroundColor: habit.color } : undefined}
                        >
                            <AnimatePresence>
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 45 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Check size={18} strokeWidth={3} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg leading-none">{habit.icon}</span>
                        <h3 className={`font-bold text-base truncate transition-colors ${isCompleted ? 'line-through text-dark-lighter dark:text-night-text-muted/60' : 'text-dark dark:text-night-text'}`}>
                            {habit.name}
                        </h3>
                        {/* Level Badge */}
                        <span
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                            style={{
                                color: levelColor,
                                backgroundColor: levelColor + '15',
                            }}
                        >
                            Lv.{levelInfo.level}
                        </span>
                    </div>

                    {/* Completion condition */}
                    <p className="text-[11px] font-medium text-dark-lighter dark:text-night-text-muted mb-2 leading-tight transition-colors">{completionCondition}</p>

                    {/* Contextual Stats (Hiding irrelevant ones) */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Streak (For Boolean) */}
                        {(habit.type === 'regular' || habit.type === 'infinite') && currentStreak > 0 && (
                            <span className="streak-badge px-2 py-0.5 rounded text-[10px]">
                                <Flame size={12} /> {currentStreak} streak
                            </span>
                        )}

                        {/* Numerical Contextual Stats */}
                        {habit.type === 'numerical' && (
                            <div className="flex items-center gap-2 w-full mt-1">
                                {/* Inline numerical entry */}
                                {habit.dailyTarget && (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleNumericalInput(currentNumValue - 0.5)}
                                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-night-bg flex items-center justify-center text-dark-lighter dark:text-night-text-muted hover:text-dark dark:hover:text-night-text hover:bg-gray-200 dark:hover:bg-primary/15 transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={currentNumValue}
                                            onChange={(e) => handleNumericalInput(parseFloat(e.target.value) || 0)}
                                            className="w-14 text-center text-[12px] font-bold bg-surface-dark/50 dark:bg-night-bg/50 rounded-lg px-1 py-1 text-dark dark:text-night-text outline-none border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                                        />
                                        <button
                                            onClick={() => handleNumericalInput(currentNumValue + 0.5)}
                                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-night-bg flex items-center justify-center text-dark-lighter dark:text-night-text-muted hover:text-dark dark:hover:text-night-text hover:bg-gray-200 dark:hover:bg-primary/15 transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                )}

                                {habit.goalValue && (
                                    <div className="flex-1 ml-2">
                                        <div className="flex justify-between text-[10px] font-bold text-dark-lighter dark:text-night-text-muted mb-1 transition-colors">
                                            <span>{totalNumerical} {habit.unit}</span>
                                            <span>Goal: {habit.goalValue}</span>
                                        </div>
                                        <div className="progress-bar flex-1 h-1.5 bg-gray-100 dark:bg-night-bg transition-colors">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${goalPercent}%`, backgroundColor: habit.color }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Challenge countdown */}
                        {habit.type === 'challenge' && challengeProgress && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="challenge-timer text-[10px] px-2 py-0.5 border border-purple/20 dark:border-purple/30 text-purple dark:text-purple-300 bg-purple/5 dark:bg-purple/10 rounded-full transition-colors">
                                    <Timer size={10} /> {challengeProgress.daysRemaining}d left
                                </span>
                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-night-bg rounded-full overflow-hidden transition-colors">
                                    <div
                                        className="h-full bg-purple rounded-full transition-all"
                                        style={{ width: `${(challengeProgress.daysCompleted / challengeProgress.daysTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-gray-100 dark:hover:bg-primary/15 text-dark-lighter dark:text-night-text-muted transition-colors p-1 rounded"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div ref={menuRef} className="absolute right-0 top-8 bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-2xl z-20 py-2 min-w-[160px] animate-fade-in-up transition-colors">
                                <button
                                    onClick={() => { onEdit(habit); setShowMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-primary/10 text-left font-medium text-dark dark:text-night-text transition-colors"
                                >
                                    <Edit3 size={16} className="text-dark-lighter dark:text-night-text-muted" /> Edit
                                </button>
                                <button
                                    onClick={() => { duplicateHabit(habit.id); setShowMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-primary/10 text-left font-medium text-dark dark:text-night-text transition-colors"
                                >
                                    <Copy size={16} className="text-dark-lighter dark:text-night-text-muted" /> Duplicate
                                </button>
                                <button
                                    onClick={() => { archiveHabit(habit.id); setShowMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-primary/10 text-left font-medium text-dark dark:text-night-text transition-colors"
                                >
                                    <Archive size={16} className="text-dark-lighter dark:text-night-text-muted" /> {habit.archived ? 'Unarchive' : 'Archive'}
                                </button>
                                <hr className="my-2 border-gray-100 dark:border-night-border transition-colors" />
                                <button
                                    onClick={() => { deleteHabit(habit.id); setShowMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 font-medium text-left transition-colors"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* XP Toast */}
            <XPToast visible={showXPToast} xp={50} />
        </div>
    );
}
