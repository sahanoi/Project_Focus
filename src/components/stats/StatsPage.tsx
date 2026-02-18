import React, { useMemo, useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { DateRange, HabitType, Habit } from '../../types';

interface StatsPageProps {
    onEditHabit?: (habit: Habit) => void;
}
import { getDateRange, formatShortDate } from '../../utils/dateUtils';
import HabitDetailPage from '../habits/HabitDetailPage';
import StreakLifeLine from '../dashboard/StreakLifeLine';
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
    const { habits, goals, routines, statsFilter, setStatsFilter } = useHabitStore();
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
                <Activity size={48} className="text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-200 mb-1">No data yet</h3>
                <p className="text-gray-500 text-sm">
                    Start tracking habits to see your statistics here!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 bg-[#111318] min-h-full text-gray-100">
            {/* View Toggle + Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Habits / Routines toggle */}
                <div className="flex rounded-lg border border-gray-700 overflow-hidden">
                    <button
                        onClick={() => { setActiveView('habits'); setSelectedRoutineId(null); }}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'habits' ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:bg-gray-800'
                            }`}
                    >
                        Habits
                    </button>
                    <button
                        onClick={() => setActiveView('routines')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'routines' ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:bg-gray-800'
                            }`}
                    >
                        Routines
                    </button>
                </div>

                {/* Date range selector */}
                <div className="flex rounded-lg border border-gray-700 overflow-hidden">
                    {DATE_RANGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedRange(opt.value)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${selectedRange === opt.value
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#1a1a2e] text-gray-400 hover:bg-gray-800'
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
                        className="bg-[#1a1a2e] text-gray-300 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
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
                    <Filter size={14} className="text-gray-500" />
                    <button
                        onClick={() => setSelectedHabitIds([])}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${selectedHabitIds.length === 0
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-[#1a1a2e] text-gray-400 border-gray-700 hover:border-gray-500'
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
                                : 'bg-[#1a1a2e] text-gray-400 border-gray-700 hover:border-gray-500'
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
                    <Filter size={14} className="text-gray-500" />
                    {routines.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setSelectedRoutineId(r.id === selectedRoutineId ? null : r.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${selectedRoutineId === r.id
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-[#1a1a2e] text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                        >
                            <span>{r.icon}</span>
                            <span>{r.name}</span>
                            <span className="text-[10px] opacity-60">({r.habitIds.length})</span>
                        </button>
                    ))}
                    {routines.length === 0 && (
                        <span className="text-sm text-gray-500">No routines created yet</span>
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
                    <div className="bg-[#1a1a2e] rounded-xl p-4 text-center border border-gray-800">
                        <TrendingUp size={24} className="mx-auto text-indigo-400 mb-2" />
                        <p className="text-2xl font-black text-indigo-400">{overallRate}%</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Completion Rate</p>
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl p-4 text-center border border-gray-800">
                        <Flame size={24} className="mx-auto text-amber-400 mb-2" />
                        <p className="text-2xl font-black text-amber-400">{bestStreakHabit.streak}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Best Streak</p>
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl p-4 text-center border border-gray-800">
                        <Target size={24} className="mx-auto text-emerald-400 mb-2" />
                        <p className="text-2xl font-black text-emerald-400">{totalActiveHabits}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Habits</p>
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl p-4 text-center border border-gray-800">
                        <Award size={24} className="mx-auto text-purple-400 mb-2" />
                        <p className="text-2xl font-black text-purple-400">{avgConsistency}%</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Consistency</p>
                    </div>
                </div>

                {/* Streak Life Line */}
                <StreakLifeLine />

                {/* Completion Rate Over Time - Area Chart */}
                <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                    <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <TrendingUp size={18} className="text-indigo-400" />
                        Completion Rate Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={dailyCompletionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} interval="preserveStartEnd" />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} unit="%" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#374151', color: '#fff', borderRadius: 8 }}
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
                    <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <BarChart3 size={18} className="text-emerald-400" />
                            Per-Habit Completion
                        </h3>
                        {perHabitRates.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={perHabitRates} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} unit="%" />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} width={100} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#374151', borderRadius: 8, color: '#fff' }}
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
                            <p className="text-gray-600 text-center py-10">No data</p>
                        )}
                    </div>

                    {/* Habit Distribution Pie Chart */}
                    <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Activity size={18} className="text-pink-400" />
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
                                        contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#374151', borderRadius: 8, color: '#fff' }}
                                    />
                                    <Legend
                                        iconType="square"
                                        wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-600 text-center py-10">No data</p>
                        )}
                    </div>
                </div>

                {/* Streak Dashboard with Levels */}
                <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                    <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Flame size={18} className="text-amber-400" />
                        Streak Dashboard
                    </h3>
                    {streakData.length > 0 ? (
                        <div className="space-y-3">
                            {streakData.map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-300 w-28 truncate">{s.name}</span>
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
                                        <div className="flex-1 h-6 bg-gray-800 rounded-md overflow-hidden relative">
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
                                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                            Best: {s.longest}d
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-center py-10">No streaks yet</p>
                    )}
                </div>

                {/* Best Days of Week */}
                <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                    <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <CalendarIcon size={18} className="text-teal-400" />
                        Best Performing Days
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={bestDaysData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} unit="%" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#374151', borderRadius: 8, color: '#fff' }}
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
                <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                    <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <CalendarIcon size={18} className="text-emerald-400" />
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
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
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
                    <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Target size={18} className="text-emerald-400" />
                            Numerical Habit Progress
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    interval="preserveStartEnd"
                                    allowDuplicatedCategory={false}
                                />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#374151', borderRadius: 8, color: '#fff' }}
                                />
                                <Legend iconType="square" wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF' }} />

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
                    <div className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Award size={18} className="text-purple-400" />
                            Goal Progress
                        </h3>
                        <div className="space-y-4">
                            {goalProgressData.map((gp, i) => (
                                <div key={i} className="border border-gray-700 rounded-lg p-4 bg-[#111318]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-200 text-sm">{gp.goal.name}</h4>
                                            <p className="text-xs text-gray-500">{gp.habit.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg" style={{ color: gp.habit.color }}>
                                                {gp.percent}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
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
                                    <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                                        <span>{gp.total} {gp.goal.unit}</span>
                                        <span>Target: {gp.goal.targetValue} {gp.goal.unit}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[25, 50, 75, 100].map((m) => (
                                            <span
                                                key={m}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gp.percent >= m
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-gray-800 text-gray-600 border border-gray-700'
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
