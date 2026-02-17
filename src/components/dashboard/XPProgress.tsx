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
        <div className="w-full bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Season Progress</span>
                    <span className="text-xl font-black text-white">Level {level}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-cyan-400">{Math.floor(xp)} XP</span>
                    <span className="text-xs text-gray-500 ml-1">/ {nextLevelXp}</span>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden relative border border-gray-700">
                {/* Progress Fill */}
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-all duration-1000 ease-out relative"
                    style={{ width: `${xpProgress}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer"></div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="text-6xl">🏆</span>
            </div>
        </div>
    );
}
