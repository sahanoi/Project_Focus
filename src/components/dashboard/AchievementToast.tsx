import React, { useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { TIER_COLORS } from '../../utils/achievementUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';

/**
 * Achievement toast — appears when a new achievement is unlocked.
 * Auto-dismisses after 4 seconds.
 */
export default function AchievementToast() {
    const { newAchievement, dismissAchievementToast } = useHabitStore();

    useEffect(() => {
        if (newAchievement) {
            const timer = setTimeout(dismissAchievementToast, 4000);
            return () => clearTimeout(timer);
        }
    }, [newAchievement, dismissAchievementToast]);

    return (
        <AnimatePresence>
            {newAchievement && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                    className="fixed bottom-6 right-6 z-[200] max-w-sm"
                >
                    <div
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${TIER_COLORS[newAchievement.tier].bg} ${TIER_COLORS[newAchievement.tier].border}`}
                        onClick={dismissAchievementToast}
                    >
                        <div className="text-4xl">{newAchievement.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Award size={14} className={TIER_COLORS[newAchievement.tier].text} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${TIER_COLORS[newAchievement.tier].text}`}>
                                    {newAchievement.tier} Achievement
                                </span>
                            </div>
                            <p className="text-sm font-black text-dark">{newAchievement.name}</p>
                            <p className="text-xs text-dark-lighter">{newAchievement.description}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
