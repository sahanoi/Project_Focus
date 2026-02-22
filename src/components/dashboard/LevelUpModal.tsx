import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ArrowUpCircle } from 'lucide-react';

export default function LevelUpModal() {
    const { showLevelUpModal, levelUpData, dismissLevelUpModal } = useHabitStore();

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
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative w-full max-w-sm bg-white rounded-3xl p-8 border border-[#E6DDF2] shadow-2xl text-center overflow-hidden"
            >
                {/* Custom Confetti / Sparkles effect using framer-motion */}
                <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                            animate={{
                                opacity: 0,
                                x: (Math.random() - 0.5) * 300,
                                y: (Math.random() - 0.5) * 300,
                                scale: Math.random() * 1.5 + 0.5,
                            }}
                            transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                            className="absolute text-yellow-400"
                        >
                            <Sparkles size={Math.random() > 0.5 ? 24 : 16} />
                        </motion.div>
                    ))}
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Level Badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 0.2, damping: 15 }}
                        className="w-24 h-24 bg-gradient-to-tr from-primary to-primary-light rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-6 border-4 border-white"
                    >
                        <Trophy size={40} />
                    </motion.div>

                    <h2 className="text-3xl font-black text-dark mb-2 tracking-tight">Level Up!</h2>
                    <p className="text-dark-lighter font-medium mb-8">
                        You've reached level <span className="text-primary font-bold text-lg">{newLevel}</span>
                    </p>

                    {/* Stat Improvements */}
                    {statChanges.length > 0 && (
                        <div className="w-full bg-surface-dark border border-[#E6DDF2] rounded-2xl p-4 mb-8">
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={dismissLevelUpModal}
                        className="w-full py-3.5 bg-dark text-white rounded-xl font-bold shadow-lg hover:bg-dark-light transition-colors"
                    >
                        Keep Going
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
