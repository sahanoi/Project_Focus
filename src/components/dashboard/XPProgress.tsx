import React from 'react';
import { CharacterStats } from '../../types';
import { useHabitStore } from '../../store/habitStore';

interface XPProgressProps {
    stats: CharacterStats;
}

export default function XPProgress({ stats }: XPProgressProps) {
    const { level, xp, nextLevelXp } = stats;
    const { setActiveTab } = useHabitStore();
    const xpProgress = (xp % 1000) / 1000 * 100;

    return (
        <button
            onClick={() => setActiveTab('journey')}
            className="flex items-center gap-3 bg-surface-dark/80 dark:bg-night-surface/80 rounded-lg px-4 py-2 border border-[#D4C8E8] dark:border-night-border h-10 w-full max-w-sm ml-auto transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 group"
        >
            {/* Level Badge */}
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors group-hover:text-primary dark:group-hover:text-primary-light">Lvl</span>
                <span className="text-sm font-black text-dark dark:text-night-text transition-colors group-hover:text-primary-dark dark:group-hover:text-white">{level}</span>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold text-primary dark:text-primary-light transition-colors">Season Progress</span>
                    <span className="text-[9px] text-dark-lighter dark:text-night-text-muted transition-colors group-hover:text-dark dark:group-hover:text-night-text">{Math.floor(xp)} / {nextLevelXp} XP</span>
                </div>
                <div className="h-1.5 w-full bg-[#D4C8E8] dark:bg-night-bg rounded-full overflow-hidden border border-primary/10 dark:border-primary/20 relative transition-colors">
                    <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
            </div>
        </button>
    );
}
