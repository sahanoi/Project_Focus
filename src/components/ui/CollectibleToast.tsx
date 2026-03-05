import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import { COLLECTIBLES } from '../../data/collectibles';
import { Award, X } from 'lucide-react';

const RARITY_STYLES: Record<string, { border: string; glow: string; bg: string; label: string }> = {
    common: {
        border: 'border-gray-300 dark:border-gray-500',
        glow: '',
        bg: 'from-gray-50 to-white dark:from-night-surface dark:to-night-bg',
        label: 'text-gray-500',
    },
    rare: {
        border: 'border-blue-400 dark:border-blue-500',
        glow: 'shadow-blue-400/30 shadow-lg',
        bg: 'from-blue-50 to-white dark:from-blue-950/30 dark:to-night-bg',
        label: 'text-blue-500',
    },
    epic: {
        border: 'border-purple-500 dark:border-purple-400',
        glow: 'shadow-purple-500/30 shadow-lg',
        bg: 'from-purple-50 to-white dark:from-purple-950/30 dark:to-night-bg',
        label: 'text-purple-500',
    },
    legendary: {
        border: 'border-yellow-400 dark:border-yellow-500',
        glow: 'shadow-yellow-400/40 shadow-xl',
        bg: 'from-yellow-50 to-white dark:from-yellow-950/20 dark:to-night-bg',
        label: 'text-yellow-500',
    },
};

export default function CollectibleToast() {
    const { newlyUnlockedCollectibles, clearNewlyUnlockedCollectibles } = useHabitStore();
    const [visibleId, setVisibleId] = useState<string | null>(null);

    useEffect(() => {
        if (newlyUnlockedCollectibles.length > 0) {
            setVisibleId(newlyUnlockedCollectibles[0]);
            const timer = setTimeout(() => {
                setVisibleId(null);
                setTimeout(() => clearNewlyUnlockedCollectibles(), 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [newlyUnlockedCollectibles, clearNewlyUnlockedCollectibles]);

    const collectible = COLLECTIBLES.find(c => c.id === visibleId);
    if (!collectible) return null;

    const style = RARITY_STYLES[collectible.rarity] || RARITY_STYLES.common;

    return (
        <AnimatePresence>
            {visibleId && (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[360px] max-w-[90vw] border-2 rounded-2xl bg-gradient-to-r ${style.bg} ${style.border} ${style.glow} backdrop-blur-md overflow-hidden`}
                >
                    <div className="flex items-center gap-4 p-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl bg-white/80 dark:bg-night-surface border border-gray-100 dark:border-night-border flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                            {collectible.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Award size={14} className="text-warning flex-shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-dark-lighter dark:text-night-text-muted">
                                    New Collectible!
                                </span>
                            </div>
                            <p className="text-sm font-black text-dark dark:text-night-text truncate transition-colors">
                                {collectible.name}
                            </p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${style.label}`}>
                                {collectible.rarity}
                            </p>
                        </div>

                        {/* Close */}
                        <button
                            onClick={() => {
                                setVisibleId(null);
                                setTimeout(() => clearNewlyUnlockedCollectibles(), 300);
                            }}
                            className="p-1.5 rounded-lg text-dark-lighter dark:text-night-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Rarity progress bar at bottom */}
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className={`h-0.5 origin-left ${collectible.rarity === 'legendary' ? 'bg-yellow-400' :
                                collectible.rarity === 'epic' ? 'bg-purple-500' :
                                    collectible.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
                            }`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
