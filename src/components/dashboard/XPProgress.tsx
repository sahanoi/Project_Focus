import React from 'react';
import { CharacterStats } from '../../types';

interface XPProgressProps {
    stats: CharacterStats;
}

export default function XPProgress({ stats }: XPProgressProps) {
    const { level, xp, nextLevelXp } = stats;
    const progressPercent = Math.min(100, Math.max(0, (stats.attributes.ovr / 100) * 100)); // Using OVR as a visual for now, or actual XP?
    // standard XP bar:
    const xpProgress = (xp % 1000) / 1000 * 100; // Assuming 1000 XP per level

    return (
        <div className="flex items-center gap-3 bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-800 shadow-sm h-10 w-full max-w-sm ml-auto">
            {/* Level Badge */}
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lvl</span>
                <span className="text-sm font-black text-white">{level}</span>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold text-cyan-400">Season Progress</span>
                    <span className="text-[9px] text-gray-500">{Math.floor(xp)} / {nextLevelXp} XP</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700/50 relative">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] relative"
                        style={{ width: `${xpProgress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
