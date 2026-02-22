import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { calculateCompletionRate, calculateCurrentStreak } from '../../utils/statsUtils';
import { subDays, format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Zap } from 'lucide-react';

export default function WeeklyDigest() {
    const { habits } = useHabitStore();
    const activeHabits = habits.filter(h => !h.archived);

    const digest = useMemo(() => {
        const now = new Date();
        const thisWeekStart = format(subDays(now, 6), 'yyyy-MM-dd');
        const thisWeekEnd = format(now, 'yyyy-MM-dd');
        const lastWeekStart = format(subDays(now, 13), 'yyyy-MM-dd');
        const lastWeekEnd = format(subDays(now, 7), 'yyyy-MM-dd');

        if (activeHabits.length === 0) {
            return null;
        }

        const thisWeekRates = activeHabits.map(h =>
            calculateCompletionRate(h, thisWeekStart, thisWeekEnd)
        );
        const thisWeekAvg = Math.round(
            thisWeekRates.reduce((a, b) => a + b, 0) / thisWeekRates.length
        );

        const lastWeekRates = activeHabits.map(h =>
            calculateCompletionRate(h, lastWeekStart, lastWeekEnd)
        );
        const lastWeekAvg = Math.round(
            lastWeekRates.reduce((a, b) => a + b, 0) / lastWeekRates.length
        );

        const trend = thisWeekAvg - lastWeekAvg;

        const totalCompletions = activeHabits.reduce((sum, h) => {
            let count = 0;
            const days = [];
            for (let i = 0; i <= 6; i++) {
                days.push(format(subDays(now, i), 'yyyy-MM-dd'));
            }
            days.forEach(d => {
                if (h.completions[d]?.completed) count++;
            });
            return sum + count;
        }, 0);

        const totalVolume = activeHabits.reduce((sum, h) => {
            if (h.type !== 'numerical') return sum;
            let vol = 0;
            const days = [];
            for (let i = 0; i <= 6; i++) {
                days.push(format(subDays(now, i), 'yyyy-MM-dd'));
            }
            days.forEach(d => {
                vol += (h.completions[d]?.value || 0);
            });
            return sum + vol;
        }, 0);

        const habitPerformance = activeHabits.map(h => ({
            name: h.name,
            icon: h.icon,
            rate: calculateCompletionRate(h, thisWeekStart, thisWeekEnd),
            streak: calculateCurrentStreak(h),
        })).sort((a, b) => b.rate - a.rate);

        const bestHabit = habitPerformance[0];
        const worstHabit = habitPerformance[habitPerformance.length - 1];

        const dayCompletions: Record<string, number> = {};
        for (let i = 0; i <= 6; i++) {
            const d = subDays(now, i);
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayName = format(d, 'EEE');
            dayCompletions[dayName] = activeHabits.filter(h =>
                h.completions[dateStr]?.completed
            ).length;
        }
        const bestDay = Object.entries(dayCompletions)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            thisWeekAvg,
            lastWeekAvg,
            trend,
            totalCompletions,
            totalVolume,
            bestHabit,
            worstHabit,
            bestDay,
            habitCount: activeHabits.length,
        };
    }, [activeHabits]);

    if (!digest) {
        return (
            <div className="text-center py-6 opacity-40">
                <Calendar size={20} className="mx-auto mb-2" />
                <p className="text-xs">Complete some habits to see your weekly digest</p>
            </div>
        );
    }

    const TrendIcon = digest.trend > 0 ? TrendingUp : digest.trend < 0 ? TrendingDown : Minus;
    const trendColor = digest.trend > 0 ? 'text-emerald-600' : digest.trend < 0 ? 'text-red-500' : 'text-dark-lighter';
    const trendBg = digest.trend > 0 ? 'bg-emerald-50 border-emerald-200' : digest.trend < 0 ? 'bg-red-50 border-red-200' : 'bg-surface-dark border-[#E6DDF2]';

    return (
        <div className="space-y-3">
            {/* Overall Rate Card */}
            <div className={`rounded-xl p-4 border ${trendBg}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-lighter font-medium">This Week</span>
                    <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
                        <TrendIcon size={12} />
                        {digest.trend > 0 ? '+' : ''}{digest.trend}%
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-dark">{digest.thisWeekAvg}%</span>
                    <span className="text-xs text-dark-lighter">completion</span>
                </div>
                {/* Mini bar */}
                <div className="h-1.5 bg-[#E6DDF2] rounded-full mt-3 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${digest.thisWeekAvg}%`,
                            background: digest.thisWeekAvg >= 70
                                ? 'linear-gradient(90deg, #10B981, #34D399)'
                                : digest.thisWeekAvg >= 40
                                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                                    : 'linear-gradient(90deg, #EF4444, #F87171)',
                        }}
                    />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 border border-[#E6DDF2] shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={12} className="text-warning" />
                        <span className="text-[10px] text-dark-lighter uppercase">Completions</span>
                    </div>
                    <span className="text-lg font-bold text-dark">{digest.totalCompletions}</span>
                </div>
                {digest.totalVolume > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-[#E6DDF2] shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                            <BarChart3 size={12} className="text-purple" />
                            <span className="text-[10px] text-dark-lighter uppercase">Volume</span>
                        </div>
                        <span className="text-lg font-bold text-dark">{Math.round(digest.totalVolume * 10) / 10}</span>
                    </div>
                )}
                <div className="bg-white rounded-lg p-3 border border-[#E6DDF2] shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Calendar size={12} className="text-primary" />
                        <span className="text-[10px] text-dark-lighter uppercase">Best Day</span>
                    </div>
                    <span className="text-lg font-bold text-dark">{digest.bestDay?.[0] || '-'}</span>
                </div>
            </div>

            {/* Top & Bottom Habit */}
            {digest.bestHabit && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="text-sm">{digest.bestHabit.icon}</span>
                        <span className="text-xs text-dark-light flex-1 truncate">{digest.bestHabit.name}</span>
                        <span className="text-xs font-bold text-emerald-600">{digest.bestHabit.rate}%</span>
                    </div>
                    {digest.worstHabit && digest.worstHabit.name !== digest.bestHabit.name && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                            <span className="text-sm">{digest.worstHabit.icon}</span>
                            <span className="text-xs text-dark-light flex-1 truncate">{digest.worstHabit.name}</span>
                            <span className="text-xs font-bold text-red-500">{digest.worstHabit.rate}%</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
