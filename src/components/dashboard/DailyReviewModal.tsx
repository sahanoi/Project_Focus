import React, { useState, useMemo } from 'react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/20 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-lg bg-white rounded-3xl border border-[#E6DDF2] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-primary/5 to-primary-light/5 p-6 border-b border-[#E6DDF2]">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/50 text-dark-lighter transition-colors">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Moon size={24} className="text-primary" />
                        <div>
                            <h2 className="text-lg font-black text-dark">Daily Review</h2>
                            <p className="text-sm text-dark-lighter">{dateLabel}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Completion Summary */}
                    <div className="text-center">
                        <div className="text-5xl font-black text-dark mb-1">{completionRate}%</div>
                        <p className="text-sm text-dark-lighter">
                            {completedHabits.length} of {activeHabits.length} habits completed
                        </p>
                        <div className="h-2 bg-[#E6DDF2] rounded-full mt-3 overflow-hidden max-w-xs mx-auto">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionRate}%` }}
                                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                            />
                        </div>
                    </div>

                    {/* Completed */}
                    {completedHabits.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-success uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <CheckCircle2 size={14} />
                                Completed ({completedHabits.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {completedHabits.map(h => (
                                    <span key={h.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/5 border border-success/15 text-sm font-medium text-dark">
                                        <span>{h.icon}</span> {h.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missed — with freeze option */}
                    {missedHabits.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-danger uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <XCircle size={14} />
                                Missed ({missedHabits.length})
                            </p>
                            <div className="space-y-2">
                                {missedHabits.map(h => {
                                    const remaining = getFreezesRemaining(h.id);
                                    return (
                                        <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-danger/5 border border-danger/10">
                                            <span className="flex items-center gap-2 text-sm font-medium text-dark">
                                                <span>{h.icon}</span> {h.name}
                                            </span>
                                            {remaining > 0 && (
                                                <button
                                                    onClick={() => handleFreeze(h.id)}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
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
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Snowflake size={14} />
                                Frozen ({frozenHabits.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {frozenHabits.map(h => (
                                    <span key={h.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm font-medium text-blue-700">
                                        <Snowflake size={12} /> {h.icon} {h.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mood */}
                    <div>
                        <p className="text-xs font-bold text-dark-lighter uppercase tracking-wider mb-3">How are you feeling?</p>
                        <div className="flex justify-center gap-3">
                            {MOOD_OPTIONS.map(m => (
                                <button
                                    key={m.value}
                                    onClick={() => setMood(m.value)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 ${mood === m.value
                                            ? 'bg-primary/10 border-2 border-primary/30 scale-110 shadow-sm'
                                            : 'bg-surface border-2 border-transparent hover:bg-primary/5 hover:scale-105'
                                        }`}
                                >
                                    <span className="text-2xl">{m.emoji}</span>
                                    <span className="text-[10px] font-bold text-dark-lighter">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Journal */}
                    <div>
                        <p className="text-xs font-bold text-dark-lighter uppercase tracking-wider mb-2">Quick reflection</p>
                        <textarea
                            value={journal}
                            onChange={(e) => setJournal(e.target.value)}
                            placeholder="What went well? What could be better tomorrow?"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-[#E6DDF2] text-dark text-sm placeholder-dark-lighter/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#E6DDF2] bg-surface/50">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20"
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
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
                    >
                        <Snowflake size={14} />
                        Streak protected! ❄️
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
