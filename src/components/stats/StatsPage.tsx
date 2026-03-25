import React, { useMemo, useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { DateRange, HabitType, Habit } from '../../types';

interface StatsPageProps {
    onEditHabit?: (habit: Habit) => void;
}
import { getDateRange, formatShortDate } from '../../utils/dateUtils';
import HabitDetailPage from '../habits/HabitDetailPage';
import StreakLifeLine from '../dashboard/StreakLifeLine';
import StatsRadar from '../dashboard/StatsRadar';
import {
    calculateOverallCompletionRate,
    calculateCurrentStreak,
    calculateLongestStreak,
    calculateConsistencyScore,
    calculateCompletionRate,
    getBestPerformingDays,
    aggregateNumericalProgress,
    getDailyCompletionData,
    getHabitDistribution,
    getTotalNumericalValue,
    calculateGoalProgress,
} from '../../utils/statsUtils';
import { calculateHabitLevel, getLevelColor } from '../../utils/habitLevelUtils';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import {
    TrendingUp, Flame, Target, Calendar as CalendarIcon,
    Award, BarChart3, Activity, Filter, X,
} from 'lucide-react';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: '3 Months' },
    { value: 'year', label: 'This Year' },
];

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#EC4899', '#F97316'];

export default function StatsPage({ onEditHabit }: StatsPageProps) {
    const { habits, goals, routines, statsFilter, setStatsFilter, stats } = useHabitStore();
    const [selectedRange, setSelectedRange] = useState<DateRange>('month');
    const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
    const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'habits' | 'routines'>('habits');

    const activeHabits = habits.filter((h) => !h.archived);

    // Filter by type, then by selected habit IDs if any
    const filteredHabits = useMemo(() => {
        let filtered = activeHabits;
        if (statsFilter.habitType !== 'all') {
            filtered = filtered.filter((h) => h.type === statsFilter.habitType);
        }
        if (selectedHabitIds.length > 0) {
            filtered = filtered.filter((h) => selectedHabitIds.includes(h.id));
        }
        return filtered;
    }, [activeHabits, statsFilter.habitType, selectedHabitIds]);

    const range = useMemo(() => getDateRange(selectedRange), [selectedRange]);

    // Routine-filtered habits
    const routineHabits = useMemo(() => {
        if (!selectedRoutineId) return [];
        const routine = routines.find(r => r.id === selectedRoutineId);
        if (!routine) return [];
        return activeHabits.filter(h => routine.habitIds.includes(h.id));
    }, [selectedRoutineId, routines, activeHabits]);

    const displayHabits = activeView === 'routines' && selectedRoutineId ? routineHabits : filteredHabits;

    // Summary Stats
    const overallRate = useMemo(
        () => calculateOverallCompletionRate(displayHabits, range.start, range.end),
        [displayHabits, range]
    );

    const totalActiveHabits = displayHabits.length;

    const bestStreakHabit = useMemo(() => {
        let best = { name: '-', streak: 0 };
        for (const h of displayHabits) {
            const s = calculateCurrentStreak(h);
            if (s > best.streak) best = { name: h.name, streak: s };
        }
        return best;
    }, [displayHabits]);

    const avgConsistency = useMemo(() => {
        if (displayHabits.length === 0) return 0;
        const scores = displayHabits.map((h) => calculateConsistencyScore(h, range.start, range.end));
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }, [displayHabits, range]);

    // Chart Data
    const dailyCompletionData = useMemo(
        () => getDailyCompletionData(displayHabits, range.start, range.end).map((d) => ({
            ...d,
            label: formatShortDate(d.date),
        })),
        [displayHabits, range]
    );

    const perHabitRates = useMemo(
        () => displayHabits.map((h) => ({
            name: h.name,
            rate: calculateCompletionRate(h, range.start, range.end),
            color: h.color,
        })).sort((a, b) => b.rate - a.rate),
        [displayHabits, range]
    );

    const bestDaysData = useMemo(() => {
        if (displayHabits.length === 0) return [];
        const dayTotals: Record<number, { total: number; count: number }> = {};
        for (let i = 0; i < 7; i++) dayTotals[i] = { total: 0, count: 0 };

        for (const h of displayHabits) {
            const days = getBestPerformingDays(h, range.start, range.end);
            for (const d of days) {
                dayTotals[d.dayIndex].total += d.rate;
                dayTotals[d.dayIndex].count++;
            }
        }

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return Object.entries(dayTotals).map(([idx, stats]) => ({
            day: dayNames[Number(idx)],
            rate: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
        }));
    }, [displayHabits, range]);

    const distributionData = useMemo(
        () => getHabitDistribution(displayHabits),
        [displayHabits]
    );

    // Numerical habits + goals for progress chart with goal lines
    const numericalHabits = displayHabits.filter((h) => h.type === 'numerical');
    const numericalProgressData = useMemo(() => {
        if (numericalHabits.length === 0) return [];
        return numericalHabits.map((h) => ({
            habit: h,
            data: aggregateNumericalProgress(h, range.start, range.end),
            goal: goals.find(g => g.habitId === h.id),
        }));
    }, [numericalHabits, range, goals]);

    // Streak data
    const streakData = useMemo(
        () => displayHabits.map((h) => ({
            name: h.name,
            current: calculateCurrentStreak(h),
            longest: calculateLongestStreak(h),
            color: h.color,
            level: calculateHabitLevel(h),
        })).sort((a, b) => b.current - a.current),
        [displayHabits]
    );

    // Heat map data
    const heatMapData = useMemo(() => {
        return dailyCompletionData.map((d) => ({
            date: d.date,
            label: formatShortDate(d.date),
            intensity: d.total > 0 ? d.completed / d.total : 0,
            completed: d.completed,
            total: d.total,
        }));
    }, [dailyCompletionData]);

    // Goal progress
    const goalProgressData = useMemo(() => {
        return goals.map((g) => {
            const habit = habits.find((h) => h.id === g.habitId);
            if (!habit) return null;
            const total = getTotalNumericalValue(habit);
            const percent = Math.min(Math.round((total / g.targetValue) * 100), 100);
            return { goal: g, habit, total, percent };
        }).filter(Boolean) as { goal: typeof goals[0]; habit: typeof habits[0]; total: number; percent: number }[];
    }, [goals, habits]);

    const toggleHabitSelection = (id: string) => {
        setSelectedHabitIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    if (activeHabits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Activity size={48} className="text-dark-lighter dark:text-night-text-muted mb-4 transition-colors" />
                <h3 className="text-lg font-bold text-dark dark:text-night-text mb-1 transition-colors">No data yet</h3>
                <p className="text-dark-lighter dark:text-night-text-muted text-sm transition-colors">
                    Start tracking habits to see your statistics here!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 bg-surface-dark dark:bg-night-bg min-h-full text-dark dark:text-night-text transition-colors duration-300">
            {/* View Toggle + Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Habits / Routines toggle */}
                <div className="flex rounded-lg border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors">
                    <button
                        onClick={() => { setActiveView('habits'); setSelectedRoutineId(null); }}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'habits' ? 'bg-primary dark:bg-primary-dark text-white' : 'bg-surface dark:bg-night-surface text-dark-lighter dark:text-night-text-muted hover:bg-[#D4C8E8] dark:hover:bg-white/5'
                            }`}
                    >
                        Habits
                    </button>
                    <button
                        onClick={() => setActiveView('routines')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'routines' ? 'bg-primary dark:bg-primary-dark text-white' : 'bg-surface dark:bg-night-surface text-dark-lighter dark:text-night-text-muted hover:bg-[#D4C8E8] dark:hover:bg-white/5'
                            }`}
                    >
                        Routines
                    </button>
                </div>

                {/* Date range selector */}
                <div className="flex rounded-lg border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors">
                    {DATE_RANGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedRange(opt.value)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${selectedRange === opt.value
                                ? 'bg-primary dark:bg-primary-dark text-white'
                                : 'bg-surface dark:bg-night-surface text-dark-lighter dark:text-night-text-muted hover:bg-[#D4C8E8] dark:hover:bg-white/5'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {activeView === 'habits' && (
                    <select
                        value={statsFilter.habitType}
                        onChange={(e) => setStatsFilter({ habitType: e.target.value as HabitType | 'all' })}
                        className="bg-surface dark:bg-night-surface text-dark-light dark:text-night-text border border-[#D4C8E8] dark:border-night-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    >
                        <option value="all">All Types</option>
                        <option value="regular">Regular</option>
                        <option value="numerical">Numerical</option>
                        <option value="infinite">Infinite Loop</option>
                        <option value="challenge">Challenge</option>
                    </select>
                )}
            </div>

            {/* Habit Selector Pills (Habits view) */}
            {activeView === 'habits' && (
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={14} className="text-dark-lighter dark:text-night-text-muted transition-colors" />
                    <button
                        onClick={() => setSelectedHabitIds([])}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${selectedHabitIds.length === 0
                            ? 'bg-primary dark:bg-primary-dark text-white border-indigo-500 dark:border-indigo-700'
                            : 'bg-surface dark:bg-night-surface text-dark-lighter dark:text-night-text-muted border-[#D4C8E8] dark:border-night-border hover:border-primary/30 dark:hover:border-primary/50'
                            }`}
                    >
                        All Habits
                    </button>
                    {activeHabits.map(h => (
                        <button
                            key={h.id}
                            onClick={() => toggleHabitSelection(h.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${selectedHabitIds.includes(h.id)
                                ? 'text-white border-transparent'
                                : 'bg-surface dark:bg-night-surface text-dark-lighter dark:text-night-text-muted border-[#D4C8E8] dark:border-night-border hover:border-primary/30 dark:hover:border-primary/50'
                                }`}
                            style={selectedHabitIds.includes(h.id) ? { backgroundColor: h.color, borderColor: h.color } : undefined}
                        >
                            <span>{h.icon}</span>
                            <span className="max-w-[100px] truncate">{h.name}</span>
                            {selectedHabitIds.includes(h.id) && <X size={12} />}
                        </button>
                    ))}
                </div>
            )}

            {/* Routine Selector (Routines view) */}
            {activeView === 'routines' && (
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={14} className="text-dark-lighter dark:text-night-text-muted transition-colors" />
                    {routines.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setSelectedRoutineId(r.id === selectedRoutineId ? null : r.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${selectedRoutineId === r.id
                                ? 'bg-primary dark:bg-primary-dark text-white border-indigo-500 dark:border-indigo-700'
                                : 'bg-surface dark:bg-night-surface text-dark-lighter dark:text-night-text-muted border-[#D4C8E8] dark:border-night-border hover:border-primary/30 dark:hover:border-primary/50'
                                }`}
                        >
                            <span>{r.icon}</span>
                            <span>{r.name}</span>
                            <span className="text-[10px] opacity-60">({r.habitIds.length})</span>
                        </button>
                    ))}
                    {routines.length === 0 && (
                        <span className="text-sm text-dark-lighter dark:text-night-text-muted transition-colors">No routines created yet</span>
                    )}
                </div>
            )}

            {/* Single Habit Deep Dive — show HabitDetailPage inline */}
            {activeView === 'habits' && selectedHabitIds.length === 1 && (() => {
                const habit = activeHabits.find(h => h.id === selectedHabitIds[0]);
                if (!habit) return null;
                return (
                    <HabitDetailPage
                        habitId={habit.id}
                        onBack={() => setSelectedHabitIds([])}
                        onEdit={(habit) => onEditHabit?.(habit)}
                    />
                );
            })()}

            {/* Overview Charts — only when NOT drilling into a single habit */}
            {(activeView !== 'habits' || selectedHabitIds.length !== 1) && (<>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-4 text-center border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <TrendingUp size={24} className="mx-auto text-primary dark:text-primary-light mb-2 transition-colors" />
                        <p className="text-2xl font-black text-primary dark:text-primary-light transition-colors">{overallRate}%</p>
                        <p className="text-xs font-semibold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mt-1 transition-colors">Completion Rate</p>
                    </div>
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-4 text-center border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <Flame size={24} className="mx-auto text-amber-400 dark:text-amber-500 mb-2 transition-colors" />
                        <p className="text-2xl font-black text-amber-400 dark:text-amber-500 transition-colors">{bestStreakHabit.streak}</p>
                        <p className="text-xs font-semibold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mt-1 transition-colors">Best Streak</p>
                    </div>
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-4 text-center border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <Target size={24} className="mx-auto text-emerald-400 dark:text-emerald-500 mb-2 transition-colors" />
                        <p className="text-2xl font-black text-emerald-400 dark:text-emerald-500 transition-colors">{totalActiveHabits}</p>
                        <p className="text-xs font-semibold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mt-1 transition-colors">Active Habits</p>
                    </div>
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-4 text-center border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <Award size={24} className="mx-auto text-purple-400 dark:text-purple-500 mb-2 transition-colors" />
                        <p className="text-2xl font-black text-purple-400 dark:text-purple-500 transition-colors">{avgConsistency}%</p>
                        <p className="text-xs font-semibold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mt-1 transition-colors">Consistency</p>
                    </div>
                </div>

                {/* Streak Life Line */}
                <StreakLifeLine />

                {/* Completion Rate Over Time - Area Chart */}
                <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                    <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                        <TrendingUp size={18} className="text-primary dark:text-primary-light transition-colors" />
                        Completion Rate Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dailyCompletionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #D4C8E8)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--chart-text-color, #6B7280)' }} interval="preserveStartEnd" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--chart-text-color, #6B7280)' }} unit="%" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #D4C8E8)', color: 'var(--tooltip-text, #111318)', borderRadius: 8 }}
                                formatter={(val: number) => [`${val}%`, 'Completion Rate']}
                            />
                            <Area
                                type="monotone"
                                dataKey="rate"
                                stroke="#6366F1"
                                fill="#6366F1"
                                fillOpacity={0.15}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: '#6366F1', stroke: '#1a1a2e', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Per-Habit Completion Bar Chart */}
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                            <BarChart3 size={18} className="text-emerald-400 dark:text-emerald-500 transition-colors" />
                            Per-Habit Completion
                        </h3>
                        {perHabitRates.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={perHabitRates} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #D4C8E8)" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--chart-text-color, #6B7280)' }} unit="%" />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--chart-text-color, #9CA3AF)' }} width={100} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #D4C8E8)', borderRadius: 8, color: 'var(--tooltip-text, #111318)' }}
                                        formatter={(val: number) => [`${val}%`, 'Rate']}
                                    />
                                    <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                                        {perHabitRates.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-dark-lighter text-center py-10">No data</p>
                        )}
                    </div>

                    {/* Habit Distribution Pie Chart */}
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                            <Activity size={18} className="text-pink-400 dark:text-pink-500 transition-colors" />
                            Habit Type Distribution
                        </h3>
                        {distributionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        dataKey="count"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={50}
                                        strokeWidth={2}
                                        stroke="#111318"
                                    >
                                        {distributionData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #D4C8E8)', borderRadius: 8, color: 'var(--tooltip-text, #111318)' }}
                                    />
                                    <Legend
                                        iconType="square"
                                        wrapperStyle={{ fontSize: 12, fontWeight: 600, color: 'var(--chart-text-color, #9CA3AF)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-dark-lighter dark:text-night-text-muted text-center py-10 transition-colors">No data</p>
                        )}
                    </div>
                </div>

                {/* RPG Stats Radar Chart */}
                <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                    <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                        <Activity size={18} className="text-purple-400 dark:text-purple-500 transition-colors" />
                        Character Attributes Radar
                    </h3>
                    <div className="flex justify-center max-w-sm mx-auto">
                        <StatsRadar stats={stats} />
                    </div>
                </div>

                {/* Streak Dashboard with Levels */}
                <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                    <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                        <Flame size={18} className="text-amber-400 dark:text-amber-500 transition-colors" />
                        Streak Dashboard
                    </h3>
                    {streakData.length > 0 ? (
                        <div className="space-y-3">
                            {streakData.map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-dark-light dark:text-night-text w-28 truncate transition-colors">{s.name}</span>
                                    <span
                                        className="text-[10px] font-bold px-1.5 rounded-full border"
                                        style={{
                                            color: getLevelColor(s.level.level),
                                            borderColor: getLevelColor(s.level.level) + '40',
                                            backgroundColor: getLevelColor(s.level.level) + '15',
                                        }}
                                    >
                                        Lv.{s.level.level}
                                    </span>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-6 bg-[#D4C8E8] dark:bg-night-bg rounded-md overflow-hidden relative transition-colors">
                                            <div
                                                className="h-full rounded-md flex items-center justify-end px-2"
                                                style={{
                                                    width: `${Math.max((s.current / (Math.max(s.longest, 1))) * 100, 8)}%`,
                                                    backgroundColor: s.color,
                                                }}
                                            >
                                                <span className="text-xs font-bold text-white">{s.current}d</span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-dark-lighter dark:text-night-text-muted font-medium whitespace-nowrap transition-colors">
                                            Best: {s.longest}d
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-dark-lighter dark:text-night-text-muted text-center py-10 transition-colors">No streaks yet</p>
                    )}
                </div>

                {/* Best Days of Week */}
                <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                    <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                        <CalendarIcon size={18} className="text-teal-400 dark:text-teal-500 transition-colors" />
                        Best Performing Days
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={bestDaysData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #D4C8E8)" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--chart-text-color, #9CA3AF)', fontWeight: 600 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--chart-text-color, #6B7280)' }} unit="%" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #D4C8E8)', borderRadius: 8, color: 'var(--tooltip-text, #111318)' }}
                                formatter={(val: number) => [`${val}%`, 'Avg Rate']}
                            />
                            <Bar dataKey="rate" fill="#14B8A6" radius={[6, 6, 0, 0]}>
                                {bestDaysData.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.rate >= 70 ? '#10B981' : entry.rate >= 40 ? '#F59E0B' : '#EF4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Heat Map Calendar */}
                <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                    <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                        <CalendarIcon size={18} className="text-emerald-400 dark:text-emerald-500 transition-colors" />
                        Activity Heat Map
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {heatMapData.map((d, i) => {
                            const opacity = d.intensity === 0 ? 0.08 : Math.max(0.2, d.intensity);
                            return (
                                <div
                                    key={i}
                                    className="heatmap-cell w-4 h-4 rounded-sm cursor-pointer"
                                    style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                                    title={`${d.label}: ${d.completed}/${d.total} (${Math.round(d.intensity * 100)}%)`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                        <span>Less</span>
                        {[0.08, 0.25, 0.5, 0.75, 1].map((op) => (
                            <div
                                key={op}
                                className="w-3.5 h-3.5 rounded-sm"
                                style={{ backgroundColor: `rgba(16, 185, 129, ${op})` }}
                            />
                        ))}
                        <span>More</span>
                    </div>
                </div>

                {/* Numerical Progress Line Chart WITH Goal Reference Lines */}
                {numericalProgressData.length > 0 && (
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                            <Target size={18} className="text-emerald-400 dark:text-emerald-500 transition-colors" />
                            Numerical Habit Progress
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color, #D4C8E8)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'var(--chart-text-color, #6B7280)' }}
                                    interval="preserveStartEnd"
                                    allowDuplicatedCategory={false}
                                />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--chart-text-color, #6B7280)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderColor: 'var(--tooltip-border, #D4C8E8)', borderRadius: 8, color: 'var(--tooltip-text, #111318)' }}
                                />
                                <Legend iconType="square" wrapperStyle={{ fontSize: 12, fontWeight: 600, color: 'var(--chart-text-color, #9CA3AF)' }} />

                                {/* Goal target reference lines */}
                                {numericalProgressData.map((np, i) => {
                                    if (!np.goal) return null;
                                    return (
                                        <ReferenceLine
                                            key={`goal-${np.habit.id}`}
                                            y={np.goal.targetValue}
                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                            strokeDasharray="8 4"
                                            strokeWidth={1.5}
                                            strokeOpacity={0.6}
                                            label={{
                                                value: `🎯 ${np.goal.name}`,
                                                fill: CHART_COLORS[i % CHART_COLORS.length],
                                                fontSize: 10,
                                                position: 'insideTopRight',
                                            }}
                                        />
                                    );
                                })}

                                {numericalProgressData.map((np, i) => (
                                    <Line
                                        key={np.habit.id}
                                        data={np.data}
                                        type="monotone"
                                        dataKey="cumulative"
                                        name={np.habit.name}
                                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Goal Progress */}
                {goalProgressData.length > 0 && (
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border transition-colors">
                        <h3 className="text-sm font-bold text-dark-light dark:text-night-text mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors">
                            <Award size={18} className="text-purple-400 dark:text-purple-500 transition-colors" />
                            Goal Progress
                        </h3>
                        <div className="space-y-4">
                            {goalProgressData.map((gp, i) => (
                                <div key={i} className="border border-[#D4C8E8] dark:border-night-border rounded-lg p-4 bg-surface-dark dark:bg-night-bg transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold text-dark dark:text-night-text text-sm transition-colors">{gp.goal.name}</h4>
                                            <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">{gp.habit.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg" style={{ color: gp.habit.color }}>
                                                {gp.percent}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-[#D4C8E8] dark:bg-night-border rounded-full overflow-hidden transition-colors">
                                        <div
                                            className="h-full rounded-full relative transition-all duration-500"
                                            style={{ width: `${gp.percent}%`, backgroundColor: gp.habit.color }}
                                        >
                                            {[25, 50, 75, 100].map((m) => (
                                                gp.percent >= m && (
                                                    <div
                                                        key={m}
                                                        className="absolute top-0 h-full w-0.5 bg-white/20"
                                                        style={{ left: `${(m / gp.percent) * 100}%` }}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                                        <span>{gp.total} {gp.goal.unit}</span>
                                        <span>Target: {gp.goal.targetValue} {gp.goal.unit}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[25, 50, 75, 100].map((m) => (
                                            <span
                                                key={m}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${gp.percent >= m
                                                    ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                                                    : 'bg-[#D4C8E8] dark:bg-night-border text-dark-lighter dark:text-night-text-muted border border-[#D4C8E8] dark:border-night-border'
                                                    }`}
                                            >
                                                {m === 100 ? '🏆' : '⭐'} {m}%
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>)}
        </div>
    );
}
