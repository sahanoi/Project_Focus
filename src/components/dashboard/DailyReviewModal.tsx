import React, { useState, useMemo, useCallback } from 'react';
import { useModalClose } from '../../hooks/useModalClose';
import { useHabitStore } from '../../store/habitStore';
import { format } from 'date-fns';
import { X, Sparkles, Moon, CheckCircle2, XCircle, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOOD_OPTIONS = [
    { emoji: '😤', label: 'Awful', value: 1 },
    { emoji: '😞', label: 'Bad', value: 2 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😊', label: 'Good', value: 4 },
    { emoji: '🔥', label: 'Amazing', value: 5 },
];

export default function DailyReviewModal({ isOpen, onClose }: DailyReviewModalProps) {
    const stableOnClose = useCallback(onClose, [onClose]);
    useModalClose(isOpen, stableOnClose);
    const { habits, selectedDate, freezeStreak } = useHabitStore();
    const [mood, setMood] = useState<number | null>(null);
    const [journal, setJournal] = useState('');
    const [showFreezeSuccess, setShowFreezeSuccess] = useState<string | null>(null);

    const todayStr = selectedDate;
    const dateLabel = format(new Date(todayStr + 'T00:00:00'), 'EEEE, MMM d');

    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived),
        [habits]
    );

    const completedHabits = useMemo(() =>
        activeHabits.filter(h => {
            const c = h.completions[todayStr];
            if (h.type === 'numerical') return (c?.value ?? 0) > 0;
            return c?.completed === true;
        }),
        [activeHabits, todayStr]
    );

    const missedHabits = useMemo(() =>
        activeHabits.filter(h => {
            const c = h.completions[todayStr];
            const isCompleted = h.type === 'numerical' ? (c?.value ?? 0) > 0 : c?.completed === true;
            return !isCompleted && !c?.frozen;
        }),
        [activeHabits, todayStr]
    );

    const frozenHabits = useMemo(() =>
        activeHabits.filter(h => h.completions[todayStr]?.frozen),
        [activeHabits, todayStr]
    );

    const completionRate = activeHabits.length > 0
        ? Math.round((completedHabits.length / activeHabits.length) * 100)
        : 0;

    const handleFreeze = (habitId: string) => {
        const success = freezeStreak(habitId, todayStr);
        if (success) {
            setShowFreezeSuccess(habitId);
            setTimeout(() => setShowFreezeSuccess(null), 2000);
        }
    };

    // Count remaining freezes for each habit
    const getFreezesRemaining = (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return 0;
        const [year, month] = todayStr.split('-');
        const monthPrefix = `${year}-${month}`;
        const used = Object.entries(habit.completions)
            .filter(([d, c]) => d.startsWith(monthPrefix) && c.frozen)
            .length;
        return Math.max(0, 3 - used);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/20 dark:bg-black/60 backdrop-blur-sm transition-colors">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-lg bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-primary/5 dark:bg-primary/10 p-6 border-b border-[#D4C8E8] dark:border-night-border transition-colors">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-primary/15 text-dark-lighter dark:text-night-text-muted transition-colors">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Moon size={24} className="text-primary dark:text-primary-light transition-colors" />
                        <div>
                            <h2 className="text-lg font-black text-dark dark:text-night-text transition-colors">Daily Review</h2>
                            <p className="text-sm text-dark-lighter dark:text-night-text-muted transition-colors">{dateLabel}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Completion Summary */}
                    <div className="text-center">
                        <div className="text-5xl font-black text-dark dark:text-night-text mb-1 transition-colors">{completionRate}%</div>
                        <p className="text-sm text-dark-lighter dark:text-night-text-muted transition-colors">
                            {completedHabits.length} of {activeHabits.length} habits completed
                        </p>
                        <div className="h-2 bg-[#D4C8E8] dark:bg-night-border rounded-full mt-3 overflow-hidden max-w-xs mx-auto transition-colors">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionRate}%` }}
                                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                    </div>

                    {/* Completed */}
                    {completedHabits.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-success dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 transition-colors">
                                <CheckCircle2 size={14} />
                                Completed ({completedHabits.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {completedHabits.map(h => (
                                    <span key={h.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/5 dark:bg-emerald-950/30 border border-success/15 dark:border-emerald-800/50 text-sm font-medium text-dark dark:text-night-text transition-colors">
                                        <span>{h.icon}</span> {h.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missed — with freeze option */}
                    {missedHabits.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-danger dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 transition-colors">
                                <XCircle size={14} />
                                Missed ({missedHabits.length})
                            </p>
                            <div className="space-y-2">
                                {missedHabits.map(h => {
                                    const remaining = getFreezesRemaining(h.id);
                                    return (
                                        <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-danger/5 dark:bg-red-950/30 border border-danger/10 dark:border-red-900/50 transition-colors">
                                            <span className="flex items-center gap-2 text-sm font-medium text-dark dark:text-night-text transition-colors">
                                                <span>{h.icon}</span> {h.name}
                                            </span>
                                            {remaining > 0 && (
                                                <button
                                                    onClick={() => handleFreeze(h.id)}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                >
                                                    <Snowflake size={12} />
                                                    Freeze ({remaining})
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Frozen */}
                    {frozenHabits.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 transition-colors">
                                <Snowflake size={14} />
                                Frozen ({frozenHabits.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {frozenHabits.map(h => (
                                    <span key={h.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors">
                                        <Snowflake size={12} /> {h.icon} {h.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mood */}
                    <div>
                        <p className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-3 transition-colors">How are you feeling?</p>
                        <div className="flex justify-center gap-3">
                            {MOOD_OPTIONS.map(m => (
                                <button
                                    key={m.value}
                                    onClick={() => setMood(m.value)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 ${mood === m.value
                                        ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 dark:border-primary/50'
                                        : 'bg-surface dark:bg-night-bg border-2 border-transparent hover:bg-primary/5 dark:hover:bg-primary/10'
                                        }`}
                                >
                                    <span className="text-2xl">{m.emoji}</span>
                                    <span className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted transition-colors">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Journal */}
                    <div>
                        <p className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 transition-colors">Quick reflection</p>
                        <textarea
                            value={journal}
                            onChange={(e) => setJournal(e.target.value)}
                            placeholder="What went well? What could be better tomorrow?"
                            className="w-full px-4 py-3 rounded-xl bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border text-dark dark:text-night-text text-sm placeholder-dark-lighter/40 dark:placeholder-night-text-muted/40 focus:border-primary/50 dark:focus:border-primary-light/50 focus:outline-none focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary-light/10 resize-none transition-all"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#D4C8E8] dark:border-night-border bg-surface/50 dark:bg-night-bg/50 transition-colors">
                    <motion.button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} />
                        Done for Today
                    </motion.button>
                </div>
            </motion.div>

            {/* Freeze success toast */}
            <AnimatePresence>
                {showFreezeSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                        <Snowflake size={14} />
                        Streak protected! ❄️
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
