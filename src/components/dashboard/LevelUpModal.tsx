import React, { useCallback } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUpCircle } from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

export default function LevelUpModal() {
    const { showLevelUpModal, levelUpData, dismissLevelUpModal } = useHabitStore();
    const stableDismiss = useCallback(dismissLevelUpModal, [dismissLevelUpModal]);
    useModalClose(showLevelUpModal, stableDismiss);

    if (!showLevelUpModal || !levelUpData) return null;

    const { oldLevel, newLevel, oldStats, newStats } = levelUpData;

    // Stats comparison to show what improved
    const statChanges = [
        { key: 'dsc', label: 'Discipline' },
        { key: 'foc', label: 'Focus' },
        { key: 'stk', label: 'Streak' },
        { key: 'bal', label: 'Balance' },
        { key: 'grt', label: 'Grit' },
        { key: 'vit', label: 'Vitality' },
    ].map(stat => ({
        ...stat,
        old: oldStats.attributes[stat.key as keyof typeof oldStats.attributes],
        new: newStats.attributes[stat.key as keyof typeof newStats.attributes],
    })).filter(stat => stat.new > stat.old);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-dark/40 backdrop-blur-md"
                onClick={dismissLevelUpModal}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                className="relative w-full max-w-sm bg-white rounded-3xl p-8 border border-[#D4C8E8] text-center overflow-hidden"
            >
                <div className="relative z-10 flex flex-col items-center">
                    {/* Level Badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'tween', ease: 'easeOut', duration: 0.2, delay: 0.2 }}
                        className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white mb-6 border-4 border-white"
                    >
                        <Trophy size={40} />
                    </motion.div>

                    <h2 className="text-3xl font-black text-dark mb-2 tracking-tight">Level Up!</h2>
                    <p className="text-dark-lighter font-medium mb-8">
                        You've reached level <span className="text-primary font-bold text-lg">{newLevel}</span>
                    </p>

                    {/* Stat Improvements */}
                    {statChanges.length > 0 && (
                        <div className="w-full bg-surface-dark border border-[#D4C8E8] rounded-2xl p-4 mb-8">
                            <h3 className="text-xs font-bold text-dark-lighter uppercase tracking-wider mb-3">Stat Increases</h3>
                            <div className="space-y-2">
                                {statChanges.map((stat, i) => (
                                    <motion.div
                                        key={stat.key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="font-bold text-dark">{stat.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-dark-lighter">{stat.old}</span>
                                            <ArrowUpCircle size={14} className="text-success" />
                                            <span className="font-bold text-success">{stat.new}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <motion.button
                        onClick={dismissLevelUpModal}
                        className="w-full py-3.5 bg-dark text-white rounded-xl font-bold hover:bg-dark-light transition-colors"
                    >
                        Keep Going
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
