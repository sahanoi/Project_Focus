import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { X, Copy, Download, Share2, Target, Zap, TrendingUp } from 'lucide-react';
import { calculateCurrentStreak } from '../../utils/statsUtils';
import { useAuth } from '../../contexts/AuthContext';

function getHabitColorClass(hex: string) {
    return {
        bg: 'bg-white',
        text: 'text-dark'
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
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-4 flex items-center justify-between border-b border-[#D4C8E8] bg-white">
                        <h3 className="font-black text-dark tracking-wide flex items-center gap-2">
                            <Share2 size={18} className="text-primary" /> Share Template
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-dark-lighter hover:bg-surface-dark transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 pb-10 bg-[#f8f9fa] flex flex-col items-center">

                        {/* THE SHAREABLE CARD */}
                        <div className={`w-full max-w-sm aspect-[4/5] rounded-[2rem] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden ${themeColors.bg} border-2 border-white/50 backdrop-blur-md`}>
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

                            <div className="relative z-10 text-center space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center text-4xl shadow-lg">
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
                                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center ${themeColors.text}`}>
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
                                        <div className={`w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center ${themeColors.text}`}>
                                            <Target size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=E6DDF2" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
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
                                className="flex-1 py-3.5 bg-dark text-white rounded-xl font-bold shadow-lg hover:bg-dark-light transition-colors flex items-center justify-center gap-2"
                            >
                                <Copy size={18} /> Copy Link
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-3.5 bg-white text-dark border border-[#D4C8E8] rounded-xl font-bold shadow-sm hover:bg-surface-dark transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Save Image
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] font-medium text-dark-lighter uppercase tracking-wider text-center">
                            Image generation is mocked for this MVP
                        </p>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
