import React, { useCallback } from 'react';
import { useModalClose } from '../../hooks/useModalClose';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { X, Copy, Download, Share2, Target, Zap, TrendingUp } from 'lucide-react';
import { calculateCurrentStreak } from '../../utils/statsUtils';
import { useAuth } from '../../contexts/AuthContext';

function getHabitColorClass(hex: string) {
    return {
        bg: 'bg-surface dark:bg-night-surface',
        text: 'text-dark dark:text-night-text'
    };
}

interface ShareHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    habit: Habit;
}

export default function ShareHabitModal({ isOpen, onClose, habit }: ShareHabitModalProps) {
    const { stats } = useHabitStore();
    const { user } = useAuth();
    const stableOnClose = useCallback(onClose, [onClose]);
    useModalClose(isOpen, stableOnClose);

    if (!isOpen) return null;

    const themeColors = getHabitColorClass(habit.color);
    const streak = calculateCurrentStreak(habit);

    const handleCopy = () => {
        const text = `I'm tracking "${habit.name}" on Focus FTP! 🔥 Current streak: ${streak} days. Join me!`;
        navigator.clipboard.writeText(text);
        // Toast could be added here
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                    className="relative w-full max-w-md bg-surface dark:bg-night-surface rounded-3xl border border-dark-border dark:border-night-border overflow-hidden"
                >
                    <div className="p-4 flex items-center justify-between border-b border-dark-border dark:border-night-border">
                        <h3 className="font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2">
                            <Share2 size={18} className="text-primary" /> Share Template
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-dark-lighter dark:text-night-text-muted hover:bg-surface-dark dark:hover:bg-night-bg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 pb-10 bg-[#f8f9fa] dark:bg-night-bg flex flex-col items-center">

                        {/* THE SHAREABLE CARD */}
                        <div className={`w-full max-w-sm aspect-[4/5] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden ${themeColors.bg} border-2 border-dark-border dark:border-night-border`}>
                            <div className="relative z-10 text-center space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 dark:bg-primary/15 border border-dark-border dark:border-night-border flex items-center justify-center text-4xl">
                                    {habit.icon}
                                </div>
                                <div>
                                    <h2 className={`text-3xl font-black ${themeColors.text} tracking-tight leading-none mb-2`}>
                                        {habit.name}
                                    </h2>
                                    <p className={`text-sm font-bold opacity-80 ${themeColors.text} uppercase tracking-wider`}>
                                        {habit.category} • {habit.difficulty}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4 mt-8">
                                <div className="bg-surface-dark/50 dark:bg-night-bg/50 border border-dark-border dark:border-night-border rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${themeColors.text}`}>
                                            <Zap size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${themeColors.text}`}>Current Streak</p>
                                            <p className={`text-xl font-black ${themeColors.text}`}>{streak} Days</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        <div className="text-right">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${themeColors.text}`}>Target</p>
                                            <p className={`text-md font-black ${themeColors.text}`}>
                                                {habit.type === 'numerical' ? `${habit.goalValue || 0} ${habit.unit || ''}` : 'Daily'}
                                            </p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${themeColors.text}`}>
                                            <Target size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=E6DDF2" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white dark:border-night-border" />
                                    <span className={`text-xs font-bold opacity-90 ${themeColors.text}`}>
                                        {user?.email?.split('@')[0] || 'Focus Player'} • Lvl {stats.level}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* END SHAREABLE CARD */}

                        <div className="mt-8 w-full flex gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-3.5 bg-dark dark:bg-night-text text-white dark:text-night-bg rounded-xl font-bold hover:bg-dark-light dark:hover:bg-night-text/80 transition-colors flex items-center justify-center gap-2"
                            >
                                <Copy size={18} /> Copy Link
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-3.5 bg-surface dark:bg-night-surface text-dark dark:text-night-text border border-dark-border dark:border-night-border rounded-xl font-bold hover:bg-surface-dark dark:hover:bg-night-bg transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Save Image
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] font-medium text-dark-lighter dark:text-night-text-muted uppercase tracking-wider text-center">
                            Image generation is mocked for this MVP
                        </p>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
