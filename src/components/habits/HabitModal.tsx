import React, { useState, useEffect, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import {
    Habit, HabitType, HabitCategory, HABIT_CATEGORIES, HABIT_COLORS,
    HABIT_EMOJIS, HABIT_TEMPLATES, HabitTemplate, HabitSchedule, ScheduleType,
} from '../../types';
import { X, Check, Target, Infinity, Timer, Hash, Calendar, Sparkles } from 'lucide-react';

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
    const { addHabit, updateHabit, addGoal } = useHabitStore();

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
        } else {
            const habitId = addHabit(habitData);
            if (type === 'numerical' && goalValue > 0) {
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
        setType(t.type);
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
                <div className="flex items-center justify-between p-5 border-b-2 border-gray-200">
                    <h2 className="text-lg font-bold text-dark">
                        {editHabit ? '✏️ Edit Habit' : '✨ Create New Habit'}
                    </h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                {/* Template Selector */}
                {!editHabit && !showTemplates && (
                    <div className="px-5 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowTemplates(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-primary text-primary font-semibold text-sm hover:bg-blue-50 transition-colors"
                        >
                            <Sparkles size={16} />
                            Choose from Templates 📋
                        </button>
                    </div>
                )}

                {/* Template List */}
                {showTemplates && (
                    <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-dark">📋 Pre-planned Habits</h3>
                            <button onClick={() => setShowTemplates(false)} className="text-xs text-primary font-semibold">
                                ← Back to form
                            </button>
                        </div>
                        {HABIT_CATEGORIES.map((cat) => {
                            const templates = HABIT_TEMPLATES[cat.value];
                            if (!templates || templates.length === 0) return null;
                            return (
                                <div key={cat.value}>
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1.5">
                                        {cat.icon} {cat.label}
                                    </p>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {templates.map((t, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => applyTemplate(t)}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 text-left transition-all"
                                            >
                                                <span className="text-xl">{t.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{t.name}</p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {t.type} • {t.schedule.type === 'weekly' ? `${t.schedule.daysOfWeek?.map(d => DAY_LABELS[d]).join(', ')}` : t.schedule.type}
                                                        {t.goalValue ? ` • ${t.goalValue} ${t.unit}` : ''}
                                                    </p>
                                                </div>
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main Form */}
                {!showTemplates && (
                    <form onSubmit={handleSubmit} className="p-5 space-y-5">
                        {/* Name + Emoji */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">
                                Habit Name
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-11 h-11 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50 transition-colors flex-shrink-0"
                                >
                                    {icon}
                                </button>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    placeholder="e.g., Read 30 minutes 📚"
                                    required
                                    id="habit-name-input"
                                />
                            </div>

                            {/* Emoji Picker Grid */}
                            {showEmojiPicker && (
                                <div className="mt-2 p-3 rounded-lg border-2 border-gray-200 bg-white">
                                    <div className="grid grid-cols-9 gap-1">
                                        {HABIT_EMOJIS.map((e) => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => { setIcon(e); setShowEmojiPicker(false); }}
                                                className={`w-8 h-8 rounded-md flex items-center justify-center text-lg hover:bg-gray-100 transition-colors ${icon === e ? 'bg-blue-100 ring-2 ring-primary' : ''}`}
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
                            <label className="block text-sm font-semibold text-dark mb-1.5">
                                Habit Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {HABIT_TYPE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setType(opt.value)}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all ${type === opt.value
                                            ? 'border-primary bg-blue-50 text-primary'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-lg">{opt.emoji}</span>
                                        <div>
                                            <p className="text-sm font-semibold">{opt.label}</p>
                                            <p className="text-xs text-gray-500">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">
                                📅 Schedule
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {SCHEDULE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setScheduleType(opt.value)}
                                        className={`p-2.5 rounded-lg border-2 text-left transition-all ${scheduleType === opt.value
                                            ? 'border-primary bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <p className="text-xs font-semibold">{opt.label}</p>
                                        <p className="text-[10px] text-gray-500">{opt.desc}</p>
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
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Custom: Interval input */}
                            {scheduleType === 'custom' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Every</span>
                                    <input
                                        type="number"
                                        value={customInterval}
                                        onChange={(e) => setCustomInterval(Math.max(2, Number(e.target.value)))}
                                        className="input-field w-20 text-center text-sm"
                                        min={2}
                                    />
                                    <span className="text-sm text-gray-500">days</span>
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value as HabitCategory);
                                    const cat = HABIT_CATEGORIES.find((c) => c.value === e.target.value);
                                    if (cat && !editHabit) setIcon(cat.icon);
                                }}
                                className="select-field"
                            >
                                {HABIT_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-1.5">
                                🎨 Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {HABIT_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-dark scale-110' : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Daily Target */}
                        {(type === 'numerical') && (
                            <div className="p-4 bg-blue-50 rounded-lg border-2 border-primary space-y-3">
                                <p className="text-sm font-bold text-primary flex items-center gap-1">
                                    🎯 Daily Target (Life Line)
                                </p>
                                <p className="text-xs text-gray-500">
                                    Minimum value per day to keep the habit "alive". Shows as a green Life Line on charts.
                                </p>
                                <input
                                    type="number"
                                    value={dailyTarget || ''}
                                    onChange={(e) => setDailyTarget(Number(e.target.value))}
                                    className="input-field text-sm"
                                    placeholder="e.g., 5"
                                    min="0"
                                />
                            </div>
                        )}

                        {/* Numerical Fields */}
                        {type === 'numerical' && (
                            <div className="p-4 bg-green-50 rounded-lg border-2 border-success space-y-3">
                                <p className="text-sm font-bold text-success flex items-center gap-1">
                                    <Target size={16} /> Goal Configuration
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-dark mb-1">
                                            Target Value
                                        </label>
                                        <input
                                            type="number"
                                            value={goalValue || ''}
                                            onChange={(e) => setGoalValue(Number(e.target.value))}
                                            className="input-field text-sm"
                                            placeholder="10000"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-dark mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="input-field text-sm"
                                            placeholder="steps, pages, ml..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Challenge Fields */}
                        {type === 'challenge' && (
                            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple space-y-3">
                                <p className="text-sm font-bold text-purple flex items-center gap-1">
                                    <Timer size={16} /> ⏱️ Challenge Duration
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-dark mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-dark mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="input-field text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary flex-1" id="save-habit-btn">
                                {editHabit ? '💾 Save Changes' : '✨ Create Habit'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
