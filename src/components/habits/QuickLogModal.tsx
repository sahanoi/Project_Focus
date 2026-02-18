import React, { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { calculateHabitLevel, getLevelColor } from '../../utils/habitLevelUtils';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import {
    X, Check, Minus, Plus, ArrowRight, TrendingUp, Award,
    ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

export default function QuickLogModal() {
    const {
        habits,
        selectedHabitId,
        setSelectedHabitId,
        setDetailViewHabitId,
        toggleCompletion,
        setNumericalValue,
        selectedDate: storeDate
    } = useHabitStore();

    const [modalDate, setModalDate] = useState(storeDate);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const habit = useHabitStore(state => state.habits.find(h => h.id === selectedHabitId));

    if (!habit) return null;

    const completion = habit.completions[modalDate];
    const isCompleted = habit.type === 'numerical'
        ? (completion?.value ?? 0) >= (habit.dailyTarget || 1)
        : completion?.completed === true;

    const levelInfo = calculateHabitLevel(habit);
    const levelColor = getLevelColor(levelInfo.level);

    const handleClose = () => setSelectedHabitId(null);

    const handleToggle = () => {
        if (habit.type === 'numerical') {
            const current = completion?.value ?? 0;
            const target = habit.dailyTarget || 1;
            setNumericalValue(habit.id, modalDate, current >= target ? 0 : target);
        } else {
            toggleCompletion(habit.id, modalDate);
        }
    };

    const handleAdjustValue = (delta: number) => {
        const current = completion?.value ?? 0;
        const newVal = Math.max(0, Math.round((current + delta) * 100) / 100);
        setNumericalValue(habit.id, modalDate, newVal);
    };

    const handleViewDetails = () => {
        setDetailViewHabitId(habit.id);
        setSelectedHabitId(null);
    };

    // Calendar Logic
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-3xl bg-[#1a1a2e] rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* LEFT SIDE: Log Controls */}
                <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-800">
                    {/* Header */}
                    <div className="relative p-6 pb-0 flex flex-col items-center">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 left-4 md:hidden p-2 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <span className="text-5xl mb-3 drop-shadow-lg">{habit.icon}</span>
                        <h2 className="text-xl font-bold text-gray-100 text-center px-4">
                            {habit.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                style={{
                                    color: levelColor,
                                    borderColor: levelColor + '40',
                                    backgroundColor: levelColor + '15',
                                }}
                            >
                                Lv.{levelInfo.level} {levelInfo.title}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                {habit.type}
                            </span>
                        </div>
                        {/* Selected Date Display */}
                        <div className="mt-4 flex items-center gap-2 text-gray-400 bg-[#11131a] px-3 py-1.5 rounded-lg border border-gray-800">
                            <Calendar size={14} />
                            <span className="text-sm font-medium">{format(new Date(modalDate), 'EEEE, MMM d')}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        {habit.type === 'numerical' ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-6 mb-4">
                                    <button
                                        onClick={() => handleAdjustValue(-0.5)}
                                        className="w-12 h-12 rounded-2xl bg-[#11131a] border border-gray-800 flex items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all active:scale-90"
                                    >
                                        <Minus className="text-indigo-400" />
                                    </button>
                                    <div className="text-center min-w-[100px]">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={completion?.value ?? 0}
                                            onChange={(e) => setNumericalValue(habit.id, modalDate, Math.max(0, parseFloat(e.target.value) || 0))}
                                            className="text-5xl font-black text-white bg-transparent text-center w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">
                                            {habit.unit || 'Units'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAdjustValue(0.5)}
                                        className="w-12 h-12 rounded-2xl bg-[#11131a] border border-gray-800 flex items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all active:scale-90"
                                    >
                                        <Plus className="text-indigo-400" />
                                    </button>
                                </div>

                                {habit.dailyTarget && (
                                    <div className="w-full bg-[#11131a] rounded-xl p-3 border border-gray-800 mb-6 max-w-[200px]">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1.5">
                                            <span>Target: {habit.dailyTarget}</span>
                                            <span className={isCompleted ? 'text-green-400' : 'text-indigo-400'}>
                                                {Math.round(((completion?.value ?? 0) / habit.dailyTarget) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(100, ((completion?.value ?? 0) / habit.dailyTarget) * 100)}%`,
                                                    backgroundColor: isCompleted ? '#10b981' : habit.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center pb-6">
                                <button
                                    onClick={handleToggle}
                                    className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-xl ${isCompleted
                                        ? 'border-green-500/50 bg-green-500/10 text-green-500 shadow-green-500/20'
                                        : 'border-gray-800 bg-gray-500/5 text-gray-600 hover:border-indigo-500/30'
                                        }`}
                                >
                                    <Check size={48} strokeWidth={4} className={`transition-transform duration-300 ${isCompleted ? 'scale-100' : 'scale-50 opacity-0'}`} />
                                    {!isCompleted && <div className="absolute w-4 h-4 rounded-full border-2 border-current opacity-20" />}
                                </button>
                                <p className={`mt-4 font-bold text-sm tracking-wide ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                                    {isCompleted ? 'Completed!' : 'Not yet logged'}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleViewDetails}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#11131a] text-gray-400 text-sm font-bold border border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all group mt-auto"
                        >
                            <TrendingUp size={16} />
                            View Full Analysis
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                    </div>

                    {/* Level Footer */}
                    <div className="bg-[#11131a] px-6 py-4 flex items-center justify-between border-t border-gray-800 mt-auto">
                        <div className="flex items-center gap-2">
                            <Award size={14} className="text-yellow-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{levelInfo.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-700"
                                    style={{
                                        width: `${levelInfo.progressToNext}%`,
                                        backgroundColor: levelColor
                                    }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 font-mono">
                                {levelInfo.progressToNext}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Calendar */}
                <div className="w-full md:w-80 bg-[#151720] flex flex-col border-l border-gray-800">
                    <div className="p-4 flex items-center justify-between border-b border-gray-800">
                        <h3 className="font-bold text-gray-200">History</h3>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 flex-1">
                        {/* Month Nav */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-sm text-gray-300">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {weekDays.map(d => (
                                <div key={d} className="text-[10px] font-bold text-gray-600 uppercase">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((date, i) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const isCurrentMonth = isSameMonth(date, currentMonth);
                                const isTargetDate = dateStr === modalDate;
                                const dayCompletion = habit.completions[dateStr];
                                const dayCompleted = habit.type === 'numerical'
                                    ? (dayCompletion?.value ?? 0) > 0
                                    : dayCompletion?.completed === true;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setModalDate(dateStr)}
                                        className={`
                                            aspect-square rounded-lg flex items-center justify-center text-xs font-semibold relative transition-all
                                            ${!isCurrentMonth ? 'text-gray-700' : 'text-gray-300 hover:bg-gray-800'}
                                            ${isTargetDate ? 'ring-2 ring-indigo-500 bg-indigo-500/10 text-indigo-400' : ''}
                                        `}
                                    >
                                        <span>{format(date, 'd')}</span>
                                        {/* Status Dot */}
                                        {dayCompleted && (
                                            <div
                                                className="absolute bottom-1 w-1 h-1 rounded-full"
                                                style={{ backgroundColor: habit.color }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
