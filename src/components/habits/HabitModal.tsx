import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useModalClose } from '../../hooks/useModalClose';
import { useHabitStore } from '../../store/habitStore';
import {
    Habit, HabitType, HabitCategory, HABIT_CATEGORIES, HABIT_COLORS,
    HABIT_EMOJIS, HABIT_TEMPLATES, HabitTemplate, HabitSchedule, ScheduleType,
} from '../../types';
import { getMinLevelForHabitType, isHabitTypeAvailable } from '../../utils/featureGateUtils';
import { X, Check, Target, Infinity, Timer, Hash, Calendar, Sparkles, Lock } from 'lucide-react';

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    editHabit?: Habit | null;
}

const HABIT_TYPE_OPTIONS: { value: HabitType; label: string; icon: React.ReactNode; desc: string; emoji: string }[] = [
    { value: 'regular', label: 'Regular', icon: <Check size={18} />, desc: 'Daily check-off', emoji: '✅' },
    { value: 'numerical', label: 'Numerical', icon: <Hash size={18} />, desc: 'Track numbers', emoji: '🔢' },
    { value: 'infinite', label: 'Infinite Loop', icon: <Infinity size={18} />, desc: 'Never-ending streak', emoji: '♾️' },
    { value: 'challenge', label: 'Challenge', icon: <Timer size={18} />, desc: 'Time-limited', emoji: '⏱️' },
];

const SCHEDULE_OPTIONS: { value: ScheduleType; label: string; desc: string }[] = [
    { value: 'daily', label: 'Every Day', desc: 'Repeat daily' },
    { value: 'weekly', label: 'Specific Days', desc: 'Choose days of week' },
    { value: 'monthly', label: 'Monthly', desc: 'Specific dates each month' },
    { value: 'custom', label: 'Custom', desc: 'Every N days' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_EMOJIS = ['🌞', '🔵', '🟢', '🟡', '🟠', '🔴', '🟣'];

export default function HabitModal({ isOpen, onClose, editHabit }: HabitModalProps) {
    const { addHabit, updateHabit, addGoal, updateGoal, goals, stats } = useHabitStore();
    const stableOnClose = useCallback(onClose, [onClose]);
    useModalClose(isOpen, stableOnClose);

    const [name, setName] = useState('');
    const [type, setType] = useState<HabitType>('regular');
    const [category, setCategory] = useState<HabitCategory>('health');
    const [color, setColor] = useState(HABIT_COLORS[0]);
    const [icon, setIcon] = useState('✅');
    const [goalValue, setGoalValue] = useState<number>(0);
    const [unit, setUnit] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dailyTarget, setDailyTarget] = useState<number>(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    // Schedule state
    const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);
    const [customInterval, setCustomInterval] = useState<number>(2);

    // Goal linking
    const [linkedGoalId, setLinkedGoalId] = useState<string>('');

    useEffect(() => {
        if (editHabit) {
            setName(editHabit.name);
            setType(editHabit.type);
            setCategory(editHabit.category);
            setColor(editHabit.color);
            setIcon(editHabit.icon);
            setGoalValue(editHabit.goalValue || 0);
            setUnit(editHabit.unit || '');
            setStartDate(editHabit.startDate || '');
            setEndDate(editHabit.endDate || '');
            setDailyTarget(editHabit.dailyTarget || 0);
            // Schedule
            const sched = editHabit.schedule || { type: 'daily' };
            setScheduleType(sched.type);
            setSelectedDays(sched.daysOfWeek || []);
            setSelectedMonthDays(sched.daysOfMonth || []);
            setCustomInterval(sched.customInterval || 2);
        } else {
            resetForm();
        }
    }, [editHabit, isOpen]);

    const resetForm = () => {
        setName('');
        setType('regular');
        setCategory('health');
        setColor(HABIT_COLORS[0]);
        setIcon('✅');
        setGoalValue(0);
        setUnit('');
        setStartDate('');
        setEndDate('');
        setDailyTarget(0);
        setScheduleType('daily');
        setSelectedDays([]);
        setSelectedMonthDays([]);
        setCustomInterval(2);
        setShowEmojiPicker(false);
        setShowTemplates(false);
        setLinkedGoalId('');
    };

    const buildSchedule = (): HabitSchedule => {
        switch (scheduleType) {
            case 'weekly':
                return { type: 'weekly', daysOfWeek: selectedDays };
            case 'monthly':
                return { type: 'monthly', daysOfMonth: selectedMonthDays };
            case 'custom':
                return { type: 'custom', customInterval };
            default:
                return { type: 'daily' };
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const habitData: any = {
            name: name.trim(),
            type,
            category,
            color,
            icon,
            schedule: buildSchedule(),
            ...(dailyTarget > 0 && { dailyTarget }),
            ...(type === 'numerical' && { goalValue, unit }),
            ...(type === 'challenge' && { startDate, endDate }),
        };

        if (editHabit) {
            updateHabit(editHabit.id, habitData);
            // Link/unlink goal if changed
            if (linkedGoalId) {
                updateGoal(linkedGoalId, { habitId: editHabit.id });
            }
        } else {
            const habitId = addHabit(habitData);
            if (!habitId) return;
            // Link existing goal to new habit
            if (linkedGoalId) {
                updateGoal(linkedGoalId, { habitId });
            } else if (type === 'numerical' && goalValue > 0) {
                addGoal({
                    habitId,
                    name: `${name} Goal`,
                    targetValue: goalValue,
                    unit,
                });
            }
        }

        onClose();
        resetForm();
    };

    const applyTemplate = (t: HabitTemplate) => {
        setName(t.name);
        const useType = isHabitTypeAvailable(stats, t.type) ? t.type : 'regular';
        setType(useType);
        setCategory(t.category);
        setColor(t.color);
        setIcon(t.icon);
        setGoalValue(t.goalValue || 0);
        setUnit(t.unit || '');
        setDailyTarget(t.dailyTarget || 0);
        setScheduleType(t.schedule.type);
        setSelectedDays(t.schedule.daysOfWeek || []);
        setSelectedMonthDays(t.schedule.daysOfMonth || []);
        setCustomInterval(t.schedule.customInterval || 2);
        setShowTemplates(false);
    };

    const toggleDay = (day: number) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
        );
    };

    const toggleMonthDay = (day: number) => {
        setSelectedMonthDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-night-border">
                    <h2 className="text-lg font-bold text-dark dark:text-night-text">
                        {editHabit ? '✏️ Edit Habit' : '✨ Create New Habit'}
                    </h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                {/* Template Selector */}
                {!editHabit && !showTemplates && (
                    <div className="px-6 pt-5">
                        <button
                            type="button"
                            onClick={() => setShowTemplates(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 hover:border-primary transition-all duration-300"
                        >
                            <Sparkles size={16} />
                            Choose from Templates 📋
                        </button>
                    </div>
                )}

                {/* Template List */}
                {showTemplates && (
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto w-[calc(100%+0.5rem)] pr-4 custom-scrollbar">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-sm text-dark dark:text-night-text tracking-wide uppercase">📋 Pre-planned Habits</h3>
                            <button onClick={() => setShowTemplates(false)} className="text-xs text-primary font-bold hover:underline">
                                ← Back to form
                            </button>
                        </div>
                        {HABIT_CATEGORIES.map((cat) => {
                            const templates = HABIT_TEMPLATES[cat.value];
                            if (!templates || templates.length === 0) return null;
                            return (
                                <div key={cat.value} className="bg-gray-50/50 dark:bg-night-surface/60 p-4 rounded-2xl border border-gray-100 dark:border-night-border">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-dark-lighter dark:text-night-text-muted mb-3 flex items-center gap-2">
                                        <span>{cat.icon}</span> {cat.label}
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {templates.map((t, i) => {
                                            const locked = !isHabitTypeAvailable(stats, t.type);
                                            return (
                                            <button
                                                key={i}
                                                type="button"
                                                disabled={locked}
                                                onClick={() => applyTemplate(t)}
                                                className={`flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 dark:border-night-border bg-surface dark:bg-night-surface text-left transition-colors duration-300 group ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}`}
                                            >
                                                <span className="text-xl">{t.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-dark dark:text-night-text truncate">{t.name}</p>
                                                    <p className="text-[11px] text-dark-lighter dark:text-night-text-muted">
                                                        {t.type} • {t.schedule.type === 'weekly' ? `${t.schedule.daysOfWeek?.map(d => DAY_LABELS[d]).join(', ')}` : t.schedule.type}
                                                        {t.goalValue ? ` • ${t.goalValue} ${t.unit}` : ''}
                                                    </p>
                                                </div>
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                            </button>
                                        );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main Form */}
                {!showTemplates && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Name + Emoji */}
                        <div>
                            <label className="block text-sm font-bold text-dark dark:text-night-text mb-2">
                                Habit Name
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-12 h-12 rounded-xl border border-gray-200 dark:border-night-border bg-gray-50 dark:bg-night-bg flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-primary/15 hover:border-gray-300 dark:hover:border-primary-light/40 transition-colors flex-shrink-0"
                                >
                                    {icon}
                                </button>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field flex-1 text-base placeholder:text-dark-lighter font-medium"
                                    placeholder="e.g., Read 30 minutes 📚"
                                    required
                                    id="habit-name-input"
                                />
                            </div>

                            {/* Emoji Picker Grid */}
                            {showEmojiPicker && (
                                <div className="mt-3 p-4 rounded-2xl border border-gray-100 dark:border-night-border bg-surface dark:bg-night-surface animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-9 gap-1.5">
                                        {HABIT_EMOJIS.map((e) => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => { setIcon(e); setShowEmojiPicker(false); }}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-primary/15 transition-colors ${icon === e ? 'bg-primary/10 ring-2 ring-primary' : ''}`}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Habit Type */}
                        <div>
                            <label className="block text-sm font-bold text-dark dark:text-night-text mb-2">
                                Habit Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {HABIT_TYPE_OPTIONS.map((opt) => {
                                    const unlocked = isHabitTypeAvailable(stats, opt.value) || editHabit?.type === opt.value;
                                    const minLv = getMinLevelForHabitType(opt.value);
                                    return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        disabled={!unlocked}
                                        onClick={() => unlocked && setType(opt.value)}
                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-colors duration-300 ${type === opt.value
                                            ? 'border-primary bg-primary/5'
                                            : unlocked
                                                ? 'border-transparent bg-gray-50 dark:bg-night-bg hover:bg-gray-100 dark:hover:bg-primary/15'
                                                : 'border-transparent bg-gray-50/60 dark:bg-night-bg/60 opacity-70 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 ${type === opt.value ? 'bg-primary/10' : 'bg-gray-200 dark:bg-night-border'}`}>
                                            {!unlocked ? <Lock size={14} className="text-dark-lighter dark:text-night-text-muted" /> : opt.emoji}
                                        </div>
                                        <div className="mt-1.5 min-w-0">
                                            <p className={`text-sm font-bold ${type === opt.value ? 'text-primary' : 'text-dark dark:text-night-text'}`}>{opt.label}</p>
                                            <p className="text-[11px] text-dark-lighter dark:text-night-text-muted font-medium leading-tight mt-0.5">{opt.desc}</p>
                                            {!unlocked && (
                                                <p className="text-[10px] text-primary dark:text-primary-light font-bold mt-1">Lv.{minLv}+</p>
                                            )}
                                        </div>
                                    </button>
                                );
                                })}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="bg-gray-50/50 dark:bg-night-surface/60 p-5 rounded-3xl border border-gray-100 dark:border-night-border">
                            <label className="block text-sm font-bold text-dark dark:text-night-text mb-3">
                                📅 Schedule
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {SCHEDULE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setScheduleType(opt.value)}
                                        className={`p-3 rounded-xl border text-left transition-colors ${scheduleType === opt.value
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                            : 'border-gray-200 dark:border-night-border bg-surface dark:bg-night-surface hover:border-gray-300 dark:hover:border-primary-light/40'
                                            }`}
                                    >
                                        <p className={`text-xs font-bold ${scheduleType === opt.value ? 'text-primary' : 'text-dark dark:text-night-text'}`}>{opt.label}</p>
                                        <p className="text-[10px] text-dark-lighter dark:text-night-text-muted mt-0.5">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Weekly: Day of week chips */}
                            {scheduleType === 'weekly' && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {DAY_LABELS.map((day, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => toggleDay(i)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedDays.includes(i)
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-night-bg text-dark-lighter dark:text-night-text-muted hover:bg-gray-200 dark:hover:bg-primary/15'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Monthly: Date chips */}
                            {scheduleType === 'monthly' && (
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => toggleMonthDay(d)}
                                            className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${selectedMonthDays.includes(d)
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-night-bg text-dark-lighter dark:text-night-text-muted hover:bg-gray-200 dark:hover:bg-primary/15'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Custom: Interval input */}
                            {scheduleType === 'custom' && (
                                <div className="flex items-center gap-3 bg-surface dark:bg-night-surface p-3 rounded-xl border border-gray-200 dark:border-night-border inline-flex">
                                    <span className="text-sm font-bold text-dark-lighter dark:text-night-text-muted">Every</span>
                                    <input
                                        type="number"
                                        value={customInterval}
                                        onChange={(e) => setCustomInterval(Math.max(2, Number(e.target.value)))}
                                        className="w-16 text-center text-lg font-black text-dark dark:text-night-text outline-none bg-gray-50 dark:bg-night-bg rounded-lg py-1 border border-gray-100 dark:border-night-border"
                                        min={2}
                                    />
                                    <span className="text-sm font-bold text-dark-lighter dark:text-night-text-muted">days</span>
                                </div>
                            )}
                        </div>

                        {/* Category & Color row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-dark dark:text-night-text mb-2">
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            setCategory(e.target.value as HabitCategory);
                                            const cat = HABIT_CATEGORIES.find((c) => c.value === e.target.value);
                                            if (cat && !editHabit) setIcon(cat.icon);
                                        }}
                                        className="select-field w-full appearance-none pr-10"
                                    >
                                        {HABIT_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-xl">
                                        {HABIT_CATEGORIES.find(c => c.value === category)?.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-bold text-dark dark:text-night-text mb-2">
                                    🎨 Color
                                </label>
                                <div className="flex gap-2.5 flex-wrap">
                                    {HABIT_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-9 h-9 rounded-full transition-colors duration-300 ${color === c ? 'ring-4 ring-offset-2 ring-gray-100 dark:ring-night-border dark:ring-offset-night-surface' : ''
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Link to Existing Goal */}
                        {(() => {
                            // Only show goals that are unlinked (no habitId or empty habitId), or linked to this habit
                            const availableGoals = goals.filter(g => !g.habitId || g.habitId === '' || (editHabit && g.habitId === editHabit.id));
                            if (availableGoals.length === 0) return null;
                            return (
                                <div>
                                    <label className="block text-sm font-semibold text-dark dark:text-night-text mb-1.5">
                                        🎯 Link to Goal
                                    </label>
                                    <select
                                        value={linkedGoalId}
                                        onChange={(e) => setLinkedGoalId(e.target.value)}
                                        className="select-field"
                                    >
                                        <option value="">None (no goal linked)</option>
                                        {availableGoals.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name} — {g.targetValue} {g.unit}{g.deadline ? ` (by ${g.deadline})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-dark-lighter dark:text-night-text-muted mt-1">Link this habit to a S.M.A.R.T. goal you've already created</p>
                                </div>
                            );
                        })()}

                        {/* Daily Target */}
                        {(type === 'numerical') && (
                            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                                <label className="block text-sm font-bold text-dark dark:text-night-text mb-1">
                                    🎯 Daily Target (Life Line)
                                </label>
                                <p className="text-xs text-dark-lighter dark:text-night-text-muted font-medium leading-relaxed">
                                    Minimum daily amount required. Appears as a <span className="text-success font-bold">green Life Line</span> on your charts.
                                </p>
                                <input
                                    type="number"
                                    value={dailyTarget || ''}
                                    onChange={(e) => setDailyTarget(Number(e.target.value))}
                                    className="input-field max-w-[150px] text-lg font-bold"
                                    placeholder="e.g., 5"
                                    min="0"
                                />
                            </div>
                        )}

                        {/* Numerical Fields */}
                        {type === 'numerical' && (
                            <div className="p-5 bg-success/5 rounded-2xl border border-success/20 space-y-4">
                                <p className="text-sm font-bold text-success flex items-center gap-2">
                                    <Target size={18} /> Ultimate Goal
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-widest mb-1.5">
                                            Target Value
                                        </label>
                                        <input
                                            type="number"
                                            value={goalValue || ''}
                                            onChange={(e) => setGoalValue(Number(e.target.value))}
                                            className="input-field"
                                            placeholder="1000"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-widest mb-1.5">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="input-field"
                                            placeholder="pages, km..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Challenge Fields */}
                        {type === 'challenge' && (
                            <div className="p-5 bg-purple/5 rounded-2xl border border-purple/20 space-y-4">
                                <p className="text-sm font-bold text-purple flex items-center gap-2">
                                    <Timer size={18} /> ⏱️ Challenge Duration
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-widest mb-1.5">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-widest mb-1.5">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-night-border mt-6 sticky bottom-0 bg-[#FAF7FE] dark:bg-night-surface pb-2">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3.5">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary flex-1 py-3.5" id="save-habit-btn">
                                {editHabit ? '💾 Save Changes' : '✨ Create Habit'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
