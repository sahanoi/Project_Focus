import React from 'react';
import { CharacterStats } from '../../types';

interface XPProgressProps {
    stats: CharacterStats;
}

export default function XPProgress({ stats }: XPProgressProps) {
    const { level, xp, nextLevelXp } = stats;
    const xpProgress = (xp % 1000) / 1000 * 100;

    return (
        <div className="flex items-center gap-3 bg-white/80 dark:bg-night-surface/80 rounded-lg px-4 py-2 border border-[#D4C8E8] dark:border-night-border shadow-sm h-10 w-full max-w-sm ml-auto backdrop-blur-sm transition-colors">
            {/* Level Badge */}
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">Lvl</span>
                <span className="text-sm font-black text-dark dark:text-night-text transition-colors">{level}</span>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold text-primary dark:text-primary-light transition-colors">Season Progress</span>
                    <span className="text-[9px] text-dark-lighter dark:text-night-text-muted transition-colors">{Math.floor(xp)} / {nextLevelXp} XP</span>
                </div>
                <div className="h-1.5 w-full bg-[#D4C8E8] dark:bg-night-bg rounded-full overflow-hidden border border-primary/10 dark:border-primary/20 relative transition-colors">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-primary-light to-pink shadow-sm relative"
                        style={{ width: `${xpProgress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
