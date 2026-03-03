import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import {
    calculateCurrentStreak, calculateLongestStreak,
    calculateCompletionRate, aggregateNumericalProgress,
    getTotalNumericalValue,
} from '../../utils/statsUtils';
import { getDateRange, formatShortDate, formatDisplayDate, daysBetween } from '../../utils/dateUtils';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import {
    ArrowLeft, Edit3, Flame, Trophy, Target, Calendar,
    TrendingUp, BarChart3, Heart, CheckCircle2, Share2,
} from 'lucide-react';
import { parseISO } from 'date-fns';
import ShareHabitModal from './ShareHabitModal';

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
 * Darken a hex color computationally but mapped to our softer palette where possible.
 */
function processColorForChart(baseHex: string, mode: 'base' | 'dark' | 'neon') {
    // In our cozy theme, we just use the base color, 
    // maybe a slightly darker shade for 'dark', and a bright but not 'neon' for 'neon'
    if (mode === 'base') return baseHex;
    if (mode === 'dark') return '#9CA3AF'; // Soft gray instead of harsh dark
    if (mode === 'neon') return '#D8B4E2'; // Lilac pop instead of harsh neon
    return baseHex;
}

export default function HabitDetailPage({ habitId, onBack, onEdit }: HabitDetailPageProps) {
    const { habits, goals } = useHabitStore();
    const [showShareModal, setShowShareModal] = React.useState(false);
    const habit = habits.find((h) => h.id === habitId);

    if (!habit) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center text-dark">
                <p className="text-dark-lighter bg-white p-8 rounded-3xl shadow-sm border border-[#D4C8E8]">Habit not found.</p>
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
            let fillColor = processColorForChart(habit.color, 'base');
            if (habit.type === 'numerical' && lifeTarget > 0) {
                if (value < lifeTarget) {
                    fillColor = processColorForChart(habit.color, 'dark');
                } else if (crazyTarget > 0 && value >= crazyTarget) {
                    fillColor = processColorForChart(habit.color, 'neon');
                }
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

    // Weekly pattern
    const weeklyPattern = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const totals = [0, 0, 0, 0, 0, 0, 0];
        Object.entries(habit.completions).forEach(([date, c]) => {
            const parsed = parseISO(date);
            const d = parsed.getDay();
            totals[d]++;
            if (habit.type === 'numerical') {
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
        const data = aggregateNumericalProgress(habit, quarterRange.start, quarterRange.end);

        const slope = linkedGoal
            ? (linkedGoal.deadline
                ? linkedGoal.targetValue / Math.max(1, daysBetween(habit.createdAt, linkedGoal.deadline))
                : (habit.goalValue || habit.dailyTarget || 0))
            : (habit.goalValue || habit.dailyTarget || 0);

        if (slope > 0) {
            data.forEach((d, i) => {
                (d as any).ideal = Math.round(slope * (i + 1) * 10) / 10;
            });
        }

        return data;
    }, [habit, quarterRange, linkedGoal]);

    // Calendar month grid
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

    // Constant colors for soft theme
    const chartTextColor = '#6B7280';
    const gridColor = '#F3F4F6';
    const tooltipBg = '#FFFFFF';
    const tooltipText = '#3C3C43';

    // Goal / Crazy line values for chart
    const goalLineValue = habit.goalValue || 0;
    const crazyLineValue = goalLineValue > 0 ? Math.round(goalLineValue * 1.5 * 10) / 10 : 0;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-[#D4C8E8]">
                <button onClick={onBack} className="btn-icon bg-gray-50 hover:bg-gray-100 text-dark-lighter">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl bg-gray-50 p-3 rounded-2xl shadow-sm border border-gray-100">{habit.icon}</span>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-dark">{habit.name}</h1>
                                <span
                                    className="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm"
                                    style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                                >
                                    {habit.type.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-dark-lighter flex items-center gap-1.5">
                                <Calendar size={14} className="text-dark-lighter" /> {scheduleDisplay}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-white border-2 border-gray-200 text-dark-lighter hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                        title="Share Habit Template"
                    >
                        <Share2 size={16} />
                    </button>
                    <button onClick={() => onEdit(habit)} className="btn-secondary flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-white border-2 border-gray-200 text-dark-lighter hover:border-primary hover:text-primary transition-colors">
                        <Edit3 size={16} /> Edit Habit
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                <div className="card text-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-3">
                        <Flame size={24} className="text-warning" />
                    </div>
                    <p className="text-3xl font-black text-dark mb-1">{currentStreak}</p>
                    <p className="text-[11px] font-bold text-dark-lighter uppercase tracking-wide">Current Streak</p>
                </div>
                <div className="card text-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-purple/10 flex items-center justify-center mx-auto mb-3">
                        <Trophy size={24} className="text-purple" />
                    </div>
                    <p className="text-3xl font-black text-dark mb-1">{longestStreak}</p>
                    <p className="text-[11px] font-bold text-dark-lighter uppercase tracking-wide">Longest Streak</p>
                </div>
                <div className="card text-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Target size={24} className="text-primary" />
                    </div>
                    <p className="text-3xl font-black text-dark mb-1">{completionRate}%</p>
                    <p className="text-[11px] font-bold text-dark-lighter uppercase tracking-wide">This Month</p>
                </div>
                <div className="card text-center hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-dark mb-1">{totalCompletions}</p>
                    <p className="text-[11px] font-bold text-dark-lighter uppercase tracking-wide">Total Done</p>
                </div>
            </div>

            {/*  Contextual Charts: Only show line chart for Numerical. */}
            {habit.type === 'numerical' && (
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            Daily Value Tracking
                        </h3>
                        {/* Legend / Goal Lines Info */}
                        {(habit.dailyTarget || goalLineValue) ? (
                            <div className="flex gap-4 text-xs font-bold">
                                {habit.dailyTarget && (
                                    <span className="flex items-center gap-1 text-success">
                                        <div className="w-2 h-2 rounded-full bg-success"></div> Life Line ({habit.dailyTarget})
                                    </span>
                                )}
                                {goalLineValue > 0 && (
                                    <span className="flex items-center gap-1 text-warning">
                                        <div className="w-2 h-2 rounded-full bg-warning"></div> Goal ({goalLineValue})
                                    </span>
                                )}
                            </div>
                        ) : null}
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyValueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartTextColor }} interval="preserveStartEnd" axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: chartTextColor }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip
                                cursor={{ stroke: `${habit.color}40`, strokeWidth: 2, strokeDasharray: '4 4' }}
                                contentStyle={{
                                    borderRadius: 12,
                                    border: `1px solid ${gridColor}`,
                                    backgroundColor: tooltipBg,
                                    color: tooltipText,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    fontWeight: 'bold'
                                }}
                                formatter={(val: number, name: string) => [val, name === 'value' ? (habit.unit || 'Value') : name]}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={habit.color}
                                fill={`url(#colorGradient-${habit.id})`}
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#fff', stroke: habit.color, strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: habit.color, stroke: '#fff', strokeWidth: 3 }}
                                name={habit.unit || 'Value'}
                            />
                            <defs>
                                <linearGradient id={`colorGradient-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={habit.color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={habit.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            {/* Target Lines */}
                            {habit.dailyTarget && (
                                <ReferenceLine y={habit.dailyTarget} stroke="#84CC16" strokeDasharray="4 4" strokeWidth={2} />
                            )}
                            {goalLineValue > 0 && (
                                <ReferenceLine y={goalLineValue} stroke="#FBBF24" strokeDasharray="4 4" strokeWidth={2} />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Two-column layout for Calendar and Weekly Pattern */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* Calendar */}
                <div className="card flex flex-col">
                    <h3 className="text-lg font-bold text-dark mb-5 flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        Consistency Calendar
                    </h3>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="text-center text-[11px] font-bold text-dark-lighter uppercase tracking-wider">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 flex-1 items-start">
                        {calendarData.map((cell, i) => {
                            if (cell.day === null) return <div key={i} className="aspect-square" />;
                            const isToday = cell.date === new Date().toISOString().split('T')[0];

                            // Soft color logic
                            let cellBg = habit.color;
                            if (cell.completed && habit.type === 'numerical' && cell.value !== undefined) {
                                const lifeTarget = habit.dailyTarget || 0;
                                if (lifeTarget > 0 && cell.value < lifeTarget) {
                                    cellBg = '#9CA3AF'; // missed target soft gray
                                }
                            }

                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 hover:scale-105 cursor-default ${cell.completed
                                        ? 'text-white shadow-sm'
                                        : isToday
                                            ? 'ring-2 ring-primary ring-offset-2 text-dark font-black'
                                            : 'bg-gray-50 text-dark-lighter hover:bg-gray-100'
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

                {/* Weekly Pattern */}
                <div className="card flex flex-col">
                    <h3 className="text-lg font-bold text-dark mb-5 flex items-center gap-2">
                        <BarChart3 size={20} className="text-teal" />
                        Weekly Distribution
                    </h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
                            <BarChart data={weeklyPattern} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: chartTextColor, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chartTextColor }} unit="%" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: gridColor, opacity: 0.5 }}
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: `none`,
                                        backgroundColor: tooltipBg,
                                        color: tooltipText,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        fontWeight: 'bold'
                                    }}
                                    formatter={(val: number) => [`${val}%`, 'Success Rate']}
                                />
                                <Bar dataKey="rate" radius={[8, 8, 8, 8]} maxBarSize={40}>
                                    {weeklyPattern.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.rate >= 70 ? '#84CC16' : entry.rate >= 40 ? '#FBBF24' : '#F87171'}
                                            className="transition-colors duration-300"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Cumulative Progress Over Time (Numerical Only) */}
            {habit.type === 'numerical' && progressData.length > 0 && (
                <div className="card mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                            <TrendingUp size={20} className="text-purple" />
                            Cumulative Progress
                        </h3>
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                            <span className="font-black text-lg" style={{ color: habit.color }}>
                                {Math.round(totalNumerical * 10) / 10}
                                <span className="text-xs text-dark-lighter ml-1 font-bold tracking-wider uppercase">{habit.unit || ''}</span>
                            </span>
                            {linkedGoal && (
                                <div className="h-6 w-px bg-gray-200"></div>
                            )}
                            {linkedGoal && (
                                <span className="text-dark-lighter text-sm font-bold">
                                    Target: {linkedGoal.targetValue}
                                </span>
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartTextColor }} interval="preserveStartEnd" axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: chartTextColor }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 12,
                                    border: `none`,
                                    backgroundColor: tooltipBg,
                                    color: tooltipText,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cumulative"
                                stroke={habit.color}
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 6, fill: habit.color, stroke: '#fff', strokeWidth: 3 }}
                                name={`Total ${habit.unit || ''}`}
                            />
                            {/* Ideal Pace Line */}
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                stroke="#D1D5DB"
                                strokeDasharray="6 6"
                                dot={false}
                                strokeWidth={2.5}
                                name="Ideal Pace"
                                activeDot={false}
                            />
                            {/* Total Goal reference line (from linked goal) */}
                            {linkedGoal && (
                                <ReferenceLine
                                    y={linkedGoal.targetValue}
                                    stroke="#FBBF24"
                                    strokeDasharray="4 4"
                                    strokeWidth={2}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Habit Meta Details */}
            <div className="card bg-gray-50/50 border-none shadow-none">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                        <p className="text-dark-lighter font-bold uppercase text-[10px] tracking-wider mb-1">Category</p>
                        <p className="font-bold text-dark">{habit.category}</p>
                    </div>
                    <div>
                        <p className="text-dark-lighter font-bold uppercase text-[10px] tracking-wider mb-1">Schedule</p>
                        <p className="font-bold text-dark">{scheduleDisplay}</p>
                    </div>
                    <div>
                        <p className="text-dark-lighter font-bold uppercase text-[10px] tracking-wider mb-1">Created</p>
                        <p className="font-bold text-dark">{formatDisplayDate(habit.createdAt)}</p>
                    </div>
                    {habit.type === 'numerical' && (
                        <div>
                            <p className="text-dark-lighter font-bold uppercase text-[10px] tracking-wider mb-1">Target</p>
                            <p className="font-bold text-dark">{habit.dailyTarget || habit.goalValue || '-'} {habit.unit}</p>
                        </div>
                    )}
                </div>
            </div>

            <ShareHabitModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                habit={habit}
            />
        </div>
    );
}
