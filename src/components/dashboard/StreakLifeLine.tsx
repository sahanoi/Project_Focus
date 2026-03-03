import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { calculateCurrentStreak, calculateLongestStreak } from '../../utils/statsUtils';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

export default function StreakLifeLine() {
    const { habits } = useHabitStore();
    const activeHabits = habits.filter(h => !h.archived);

    if (activeHabits.length === 0) return null;

    const streakData = activeHabits.map(h => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        currentStreak: calculateCurrentStreak(h),
        longestStreak: calculateLongestStreak(h),
    })).sort((a, b) => b.currentStreak - a.currentStreak);

    const topStreak = streakData[0];
    const totalActiveStreaks = streakData.filter(s => s.currentStreak > 0).length;

    return (
        <div className="space-y-3">
            {/* Overall Streak Status */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-900/40 p-4 transition-colors">
                {/* Heartbeat pulse background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-orange-200/20"
                        style={{
                            animation: totalActiveStreaks > 0 ? 'streakPulse 2s ease-in-out infinite' : 'none',
                        }}
                    />
                </div>

                <div className="relative flex items-center gap-4">
                    {/* Flame Icon with animation */}
                    <div className="relative">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${totalActiveStreaks > 0
                                ? 'bg-gradient-to-br from-orange-400 to-red-400 dark:from-orange-500 dark:to-red-600 shadow-lg shadow-orange-300/30 dark:shadow-orange-900/30'
                                : 'bg-[#D4C8E8] dark:bg-night-border'
                                }`}
                            style={{
                                animation: topStreak?.currentStreak >= 7 ? 'streakBreathe 1.5s ease-in-out infinite' : 'none',
                            }}
                        >
                            <Flame size={24} className={totalActiveStreaks > 0 ? 'text-white' : 'text-dark-lighter dark:text-night-text-muted transition-colors'} />
                        </div>
                        {topStreak?.currentStreak >= 7 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-black">🔥</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-dark dark:text-night-text transition-colors">
                                {topStreak?.currentStreak || 0}
                            </span>
                            <span className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">day streak</span>
                        </div>
                        <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                            {totalActiveStreaks} of {activeHabits.length} habits on streak
                        </p>
                    </div>

                    {/* Best Record */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500 transition-colors">
                            <Trophy size={12} />
                            <span className="font-bold">Best</span>
                        </div>
                        <span className="text-sm font-bold text-dark dark:text-night-text transition-colors">
                            {Math.max(...streakData.map(s => s.longestStreak), 0)}d
                        </span>
                    </div>
                </div>
            </div>

            {/* Life Line — Individual Habit Streaks */}
            <div className="space-y-1.5">
                {streakData.slice(0, 5).map((s) => {
                    const maxStreak = Math.max(...streakData.map(d => d.longestStreak), 1);
                    const streakPercent = Math.min((s.currentStreak / maxStreak) * 100, 100);

                    return (
                        <div key={s.id} className="flex items-center gap-2 group">
                            <span className="text-sm w-5 text-center">{s.icon}</span>
                            <div className="flex-1 h-2 bg-[#D4C8E8] dark:bg-night-bg rounded-full overflow-hidden transition-colors">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${Math.max(streakPercent, s.currentStreak > 0 ? 8 : 0)}%`,
                                        background: s.currentStreak > 0
                                            ? `linear-gradient(90deg, ${s.color}88, ${s.color})`
                                            : '', // Tailwind will handle dark bg via classes, but inline styles override
                                        animation: s.currentStreak >= 3 ? 'lifeLinePulse 3s ease-in-out infinite' : 'none',
                                    }}
                                />
                            </div>
                            <span className={`text-xs font-mono w-6 text-right transition-colors ${s.currentStreak > 0 ? 'text-dark dark:text-night-text font-bold' : 'text-dark-lighter dark:text-night-text-muted'
                                }`}>
                                {s.currentStreak}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
