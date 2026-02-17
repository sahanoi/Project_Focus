import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import {
    calculateCurrentStreak, calculateLongestStreak,
    calculateCompletionRate, getBestPerformingDays,
    aggregateNumericalProgress, getDailyCompletionData,
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

export default function HabitDetailPage({ habitId, onBack, onEdit }: HabitDetailPageProps) {
    const { habits, darkMode } = useHabitStore();
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

    // Daily value data for Life Line chart (last 30 days)
    const dailyValueData = useMemo(() => {
        const range = getDateRange('month');
        const data: { date: string; label: string; value: number; completed: boolean }[] = [];
        const start = new Date(range.start);
        const end = new Date(range.end);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const completion = habit.completions[dateStr];
            data.push({
                date: dateStr,
                label: formatShortDate(dateStr),
                value: completion?.value ?? (completion?.completed ? 1 : 0),
                completed: completion?.completed ?? false,
            });
        }
        return data;
    }, [habit]);

    // Weekly pattern
    const weeklyPattern = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const totals = [0, 0, 0, 0, 0, 0, 0];
        Object.entries(habit.completions).forEach(([date, c]) => {
            const d = new Date(date).getDay();
            totals[d]++;
            if (c.completed) counts[d]++;
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

    // Calendar month grid
    const calendarData = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: { day: number | null; completed: boolean; value?: number; date: string }[] = [];

        // Padding
        for (let i = 0; i < firstDay; i++) cells.push({ day: null, completed: false, date: '' });

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const c = habit.completions[dateStr];
            cells.push({
                day: d,
                completed: c?.completed ?? false,
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

            {/* Life Line Chart — the key feature */}
            <div className="chart-card mb-6">
                <h3 className="section-title mb-1 flex items-center gap-2">
                    <TrendingUp size={18} className="text-success" />
                    {habit.type === 'numerical' ? 'Daily Value & Life Line' : 'Completion Trend'}
                </h3>
                {habit.dailyTarget ? (
                    <p className="text-xs text-gray-500 mb-3">
                        🟢 <strong>Life Line</strong> = {habit.dailyTarget} {habit.unit || 'completions'}/day — stay above the green line to keep the habit alive!
                    </p>
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
                        {/* 🟢 THE LIFE LINE — green reference line for minimum daily target */}
                        {habit.dailyTarget && (
                            <ReferenceLine
                                y={habit.dailyTarget}
                                stroke="#10B981"
                                strokeWidth={2.5}
                                strokeDasharray="8 4"
                                label={{
                                    value: `⚡ Life Line (${habit.dailyTarget})`,
                                    position: 'insideTopRight',
                                    fill: '#10B981',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Calendar */}
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
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${cell.completed
                                            ? 'text-white'
                                            : isToday
                                                ? 'ring-2 ring-primary text-dark'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                    style={cell.completed ? { backgroundColor: habit.color } : undefined}
                                    title={cell.value !== undefined ? `${cell.value} ${habit.unit || ''}` : cell.completed ? 'Done ✅' : 'Missed'}
                                >
                                    {cell.day}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Pattern */}
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

            {/* Numerical Progress Over Time */}
            {habit.type === 'numerical' && progressData.length > 0 && (
                <div className="chart-card mb-6">
                    <h3 className="section-title mb-3 flex items-center gap-2">
                        <TrendingUp size={18} className="text-purple" />
                        📈 Cumulative Progress (3 Months)
                    </h3>
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
                            {/* Goal line if exists */}
                            {habit.goalValue && (
                                <ReferenceLine
                                    y={habit.goalValue * 90}
                                    stroke="#F59E0B"
                                    strokeDasharray="6 3"
                                    strokeWidth={2}
                                    label={{
                                        value: '🎯 90-Day Goal',
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
                    <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span className="font-bold">{formatDisplayDate(habit.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
