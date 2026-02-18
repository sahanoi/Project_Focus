import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import {
    calculateCurrentStreak, calculateLongestStreak,
    calculateCompletionRate, getBestPerformingDays,
    aggregateNumericalProgress, getDailyCompletionData,
    getTotalNumericalValue,
} from '../../utils/statsUtils';
import { getDateRange, formatShortDate, formatDisplayDate } from '../../utils/dateUtils';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, Legend,
} from 'recharts';
import {
    ArrowLeft, Edit3, Flame, Trophy, Target, Calendar,
    TrendingUp, BarChart3, Heart,
} from 'lucide-react';
import { parseISO } from 'date-fns';

interface HabitDetailPageProps {
    habitId: string;
    onBack: () => void;
    onEdit: (habit: Habit) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SCHED_LABELS: Record<string, string> = {
    daily: '📅 Every Day',
    weekly: '📆 Specific Days',
    monthly: '🗓️ Monthly',
    custom: '🔄 Custom Interval',
};

/**
 * Darken a hex color by mixing it toward black.
 */
function darkenColor(hex: string, amount: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nr = Math.round(r * (1 - amount));
    const ng = Math.round(g * (1 - amount));
    const nb = Math.round(b * (1 - amount));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/**
 * Brighten a hex color toward neon by increasing saturation and lightness.
 */
function neonColor(hex: string): string {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 80);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 80);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 80);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function HabitDetailPage({ habitId, onBack, onEdit }: HabitDetailPageProps) {
    const { habits, goals, darkMode } = useHabitStore();
    const habit = habits.find((h) => h.id === habitId);

    if (!habit) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <p className="text-gray-500">Habit not found.</p>
                <button onClick={onBack} className="btn-primary mt-4">← Go Back</button>
            </div>
        );
    }

    const currentStreak = calculateCurrentStreak(habit);
    const longestStreak = calculateLongestStreak(habit);
    const totalCompletions = Object.keys(habit.completions).length;

    const monthRange = useMemo(() => getDateRange('month'), []);
    const quarterRange = useMemo(() => getDateRange('quarter'), []);

    const completionRate = useMemo(
        () => calculateCompletionRate(habit, monthRange.start, monthRange.end),
        [habit, monthRange]
    );

    // Find linked goal
    const linkedGoal = useMemo(
        () => goals.find(g => g.habitId === habit.id),
        [goals, habit.id]
    );
    const totalNumerical = useMemo(
        () => habit.type === 'numerical' ? getTotalNumericalValue(habit) : 0,
        [habit]
    );

    // Daily value data for Life Line chart (last 30 days)
    // With color coding: below life = dark, between goal/crazy = normal, above crazy = neon
    const dailyValueData = useMemo(() => {
        const range = getDateRange('month');
        const data: { date: string; label: string; value: number; completed: boolean; fillColor: string }[] = [];
        const start = new Date(range.start);
        const end = new Date(range.end);
        const lifeTarget = habit.dailyTarget || 0;
        const goalTarget = habit.goalValue || 0;
        const crazyTarget = goalTarget > 0 ? goalTarget * 1.5 : 0;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const completion = habit.completions[dateStr];
            const value = completion?.value ?? (completion?.completed ? 1 : 0);

            // Color coding
            let fillColor = habit.color;
            if (habit.type === 'numerical' && lifeTarget > 0) {
                if (value < lifeTarget) {
                    fillColor = darkenColor(habit.color, 0.5);
                } else if (crazyTarget > 0 && value >= crazyTarget) {
                    fillColor = neonColor(habit.color);
                }
                // between life and crazy → default habit color
            }

            data.push({
                date: dateStr,
                label: formatShortDate(dateStr),
                value,
                completed: completion?.completed ?? false,
                fillColor,
            });
        }
        return data;
    }, [habit]);

    // Weekly pattern — FIXED: use parseISO to avoid timezone-related day-of-week shift
    const weeklyPattern = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const totals = [0, 0, 0, 0, 0, 0, 0];
        Object.entries(habit.completions).forEach(([date, c]) => {
            const parsed = parseISO(date);
            const d = parsed.getDay();
            totals[d]++;
            if (habit.type === 'numerical') {
                // For numerical habits, count as completed if value > 0
                if ((c.value ?? 0) > 0) counts[d]++;
            } else {
                if (c.completed) counts[d]++;
            }
        });
        return DAY_LABELS.map((day, i) => ({
            day,
            rate: totals[i] > 0 ? Math.round((counts[i] / totals[i]) * 100) : 0,
            count: counts[i],
        }));
    }, [habit]);

    // Numerical progress over time
    const progressData = useMemo(() => {
        if (habit.type !== 'numerical') return [];
        return aggregateNumericalProgress(habit, quarterRange.start, quarterRange.end);
    }, [habit, quarterRange]);

    // Calendar month grid — FIXED: use value > 0 for numerical habits
    const calendarData = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: { day: number | null; completed: boolean; value?: number; date: string }[] = [];

        for (let i = 0; i < firstDay; i++) cells.push({ day: null, completed: false, date: '' });

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const c = habit.completions[dateStr];
            const isCompleted = habit.type === 'numerical'
                ? (c?.value ?? 0) > 0
                : c?.completed ?? false;
            cells.push({
                day: d,
                completed: isCompleted,
                value: c?.value,
                date: dateStr,
            });
        }

        return cells;
    }, [habit]);

    // Schedule display
    const scheduleDisplay = useMemo(() => {
        const s = habit.schedule || { type: 'daily' };
        let detail = SCHED_LABELS[s.type] || s.type;
        if (s.type === 'weekly' && s.daysOfWeek) {
            detail += `: ${s.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ')}`;
        }
        if (s.type === 'monthly' && s.daysOfMonth) {
            detail += `: ${s.daysOfMonth.join(', ')}`;
        }
        if (s.type === 'custom' && s.customInterval) {
            detail += `: Every ${s.customInterval} days`;
        }
        return detail;
    }, [habit]);

    const chartTextColor = darkMode ? '#9CA3AF' : '#6B7280';
    const gridColor = darkMode ? '#2A2E37' : '#E5E7EB';

    // Goal / Crazy line values for chart
    const goalLineValue = habit.goalValue || 0;
    const crazyLineValue = goalLineValue > 0 ? Math.round(goalLineValue * 1.5 * 10) / 10 : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="btn-icon">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{habit.icon}</span>
                        <h1 className="text-xl font-bold text-dark">{habit.name}</h1>
                        <span
                            className="badge text-white text-[10px]"
                            style={{ backgroundColor: habit.color }}
                        >
                            {habit.type}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{scheduleDisplay}</p>
                </div>
                <button onClick={() => onEdit(habit)} className="btn-secondary flex items-center gap-1.5 text-sm">
                    <Edit3 size={14} /> Edit
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card text-center">
                    <Flame size={22} className="mx-auto text-warning mb-1" />
                    <p className="stat-number text-xl text-warning">{currentStreak}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">🔥 Current Streak</p>
                </div>
                <div className="card text-center">
                    <Trophy size={22} className="mx-auto text-purple mb-1" />
                    <p className="stat-number text-xl text-purple">{longestStreak}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">🏆 Longest Streak</p>
                </div>
                <div className="card text-center">
                    <Target size={22} className="mx-auto text-primary mb-1" />
                    <p className="stat-number text-xl text-primary">{completionRate}%</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">📊 This Month</p>
                </div>
                <div className="card text-center">
                    <Heart size={22} className="mx-auto text-danger mb-1" />
                    <p className="stat-number text-xl text-danger">{totalCompletions}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">✅ Total Done</p>
                </div>
            </div>

            {/* Life Line Chart with Goal & Crazy Lines */}
            <div className="chart-card mb-6">
                <h3 className="section-title mb-1 flex items-center gap-2">
                    <TrendingUp size={18} className="text-success" />
                    {habit.type === 'numerical' ? 'Daily Value & Life Line' : 'Completion Trend'}
                </h3>
                {habit.type === 'numerical' && (habit.dailyTarget || goalLineValue) ? (
                    <div className="flex flex-wrap gap-3 text-[10px] font-bold mb-3">
                        {habit.dailyTarget && (
                            <span className="text-green-400">
                                🟢 Life Line: {habit.dailyTarget} {habit.unit || ''}/day
                            </span>
                        )}
                        {goalLineValue > 0 && (
                            <span className="text-amber-400">
                                🎯 Goal Line: {goalLineValue} {habit.unit || ''}/day
                            </span>
                        )}
                        {crazyLineValue > 0 && (
                            <span className="text-red-400">
                                🔥 Crazy Line: {crazyLineValue} {habit.unit || ''}/day
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 mb-3">
                        Daily progress over the last 30 days
                    </p>
                )}
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dailyValueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTextColor }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11, fill: chartTextColor }} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: `2px solid ${gridColor}`,
                                backgroundColor: darkMode ? '#1C1F26' : '#fff',
                                color: darkMode ? '#E5E7EB' : '#111827',
                            }}
                            formatter={(val: number, name: string) => [val, name === 'value' ? (habit.unit || 'Value') : name]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={habit.color}
                            fill={habit.color}
                            fillOpacity={0.15}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: habit.color, stroke: '#fff', strokeWidth: 2 }}
                            name={habit.unit || 'Value'}
                        />
                        {/* 🟢 LIFE LINE — minimum daily target */}
                        {habit.dailyTarget && (
                            <ReferenceLine
                                y={habit.dailyTarget}
                                stroke="#10B981"
                                strokeWidth={2.5}
                                strokeDasharray="8 4"
                                label={{
                                    value: `⚡ Life (${habit.dailyTarget})`,
                                    position: 'insideTopRight',
                                    fill: '#10B981',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            />
                        )}
                        {/* 🎯 GOAL LINE — the daily goal value */}
                        {goalLineValue > 0 && (
                            <ReferenceLine
                                y={goalLineValue}
                                stroke="#F59E0B"
                                strokeWidth={2}
                                strokeDasharray="6 3"
                                label={{
                                    value: `🎯 Goal (${goalLineValue})`,
                                    position: 'insideTopLeft',
                                    fill: '#F59E0B',
                                    fontSize: 10,
                                    fontWeight: 700,
                                }}
                            />
                        )}
                        {/* 🔥 CRAZY LINE — 1.5x the goal */}
                        {crazyLineValue > 0 && (
                            <ReferenceLine
                                y={crazyLineValue}
                                stroke="#EF4444"
                                strokeWidth={2}
                                strokeDasharray="4 2"
                                label={{
                                    value: `🔥 Crazy (${crazyLineValue})`,
                                    position: 'insideTopLeft',
                                    fill: '#EF4444',
                                    fontSize: 10,
                                    fontWeight: 700,
                                }}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Calendar — FIXED for numerical habits */}
                <div className="chart-card">
                    <h3 className="section-title mb-3 flex items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        📅 This Month
                    </h3>
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                        {calendarData.map((cell, i) => {
                            if (cell.day === null) return <div key={i} />;
                            const isToday = cell.date === new Date().toISOString().split('T')[0];

                            // Color coding for numerical habits based on value vs targets
                            let cellBg = habit.color;
                            if (cell.completed && habit.type === 'numerical' && cell.value !== undefined) {
                                const lifeTarget = habit.dailyTarget || 0;
                                const crazyTarget = (habit.goalValue || 0) * 1.5;
                                if (lifeTarget > 0 && cell.value < lifeTarget) {
                                    cellBg = darkenColor(habit.color, 0.4);
                                } else if (crazyTarget > 0 && cell.value >= crazyTarget) {
                                    cellBg = neonColor(habit.color);
                                }
                            }

                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${cell.completed
                                        ? 'text-white'
                                        : isToday
                                            ? 'ring-2 ring-primary text-dark'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                    style={cell.completed ? { backgroundColor: cellBg } : undefined}
                                    title={cell.value !== undefined ? `${cell.value} ${habit.unit || ''}` : cell.completed ? 'Done ✅' : 'Missed'}
                                >
                                    {cell.day}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Pattern — FIXED with parseISO */}
                <div className="chart-card">
                    <h3 className="section-title mb-3 flex items-center gap-2">
                        <BarChart3 size={18} className="text-teal" />
                        📊 Weekly Pattern
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyPattern}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: chartTextColor, fontWeight: 600 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chartTextColor }} unit="%" />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: `2px solid ${gridColor}`,
                                    backgroundColor: darkMode ? '#1C1F26' : '#fff',
                                    color: darkMode ? '#E5E7EB' : '#111827',
                                }}
                                formatter={(val: number) => [`${val}%`, 'Success Rate']}
                            />
                            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                                {weeklyPattern.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.rate >= 70 ? '#10B981' : entry.rate >= 40 ? '#F59E0B' : '#EF4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Cumulative Progress Over Time — Task 8: show total goal + current total */}
            {habit.type === 'numerical' && progressData.length > 0 && (
                <div className="chart-card mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="section-title flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple" />
                            📈 Cumulative Progress (3 Months)
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-bold" style={{ color: habit.color }}>
                                {Math.round(totalNumerical * 10) / 10} {habit.unit || ''}
                            </span>
                            {linkedGoal && (
                                <span className="text-gray-400 text-xs">
                                    / {linkedGoal.targetValue} {linkedGoal.unit} ({Math.round((totalNumerical / linkedGoal.targetValue) * 100)}%)
                                </span>
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartTextColor }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 11, fill: chartTextColor }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: `2px solid ${gridColor}`,
                                    backgroundColor: darkMode ? '#1C1F26' : '#fff',
                                    color: darkMode ? '#E5E7EB' : '#111827',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cumulative"
                                stroke={habit.color}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: habit.color }}
                                name={`Total ${habit.unit || ''}`}
                            />
                            {/* Total Goal reference line (from linked goal) */}
                            {linkedGoal && (
                                <ReferenceLine
                                    y={linkedGoal.targetValue}
                                    stroke="#F59E0B"
                                    strokeDasharray="6 3"
                                    strokeWidth={2}
                                    label={{
                                        value: `🎯 ${linkedGoal.name} (${linkedGoal.targetValue} ${linkedGoal.unit})`,
                                        position: 'insideTopRight',
                                        fill: '#F59E0B',
                                        fontSize: 11,
                                        fontWeight: 700,
                                    }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Habit Details Card */}
            <div className="card">
                <h3 className="section-title mb-3">ℹ️ Habit Details</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Category</span>
                        <span className="font-bold">{habit.category}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span className="font-bold">{habit.type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Schedule</span>
                        <span className="font-bold">{scheduleDisplay}</span>
                    </div>
                    {habit.dailyTarget && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">🟢 Life Line Target</span>
                            <span className="font-bold text-success">{habit.dailyTarget} {habit.unit || ''}/day</span>
                        </div>
                    )}
                    {habit.goalValue && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">🎯 Daily Goal</span>
                            <span className="font-bold">{habit.goalValue} {habit.unit || ''}</span>
                        </div>
                    )}
                    {linkedGoal && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">🏆 Total Goal</span>
                            <span className="font-bold text-amber-400">
                                {linkedGoal.name}: {totalNumerical}/{linkedGoal.targetValue} {linkedGoal.unit}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span className="font-bold">{formatDisplayDate(habit.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
