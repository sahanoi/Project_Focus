import React, { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { calculateHabitLevel, getLevelColor } from '../../utils/habitLevelUtils';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import {
    X, Check, Minus, Plus, ArrowRight, TrendingUp, Award,
    ChevronLeft, ChevronRight, Calendar, MessageSquare
} from 'lucide-react';

export default function QuickLogModal() {
    const {
        habits,
        selectedHabitId,
        setSelectedHabitId,
        setDetailViewHabitId,
        toggleCompletion,
        setNumericalValue,
        selectedDate: storeDate,
        setCompletionNote
    } = useHabitStore();

    const [modalDate, setModalDate] = useState(storeDate);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showNote, setShowNote] = useState(false);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-3xl bg-white rounded-3xl border border-[#D4C8E8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* LEFT SIDE: Log Controls */}
                <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 bg-white">
                    {/* Header */}
                    <div className="relative p-6 pb-0 flex flex-col items-center">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 left-4 md:hidden p-2 text-dark-lighter hover:text-dark bg-gray-50 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <span className="text-5xl mb-3 drop-shadow-sm">{habit.icon}</span>
                        <h2 className="text-xl font-bold text-dark text-center px-4">
                            {habit.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                                style={{
                                    color: levelColor,
                                    borderColor: levelColor + '40',
                                    backgroundColor: levelColor + '15',
                                }}
                            >
                                Lv.{levelInfo.level} {levelInfo.title}
                            </span>
                            <span className="text-[10px] text-dark-lighter font-bold uppercase tracking-wider">
                                {habit.type}
                            </span>
                        </div>
                        {/* Selected Date Display */}
                        <div className="mt-4 flex items-center gap-2 text-dark-lighter bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                            <Calendar size={16} className="text-primary" />
                            <span className="text-sm font-bold">{format(new Date(modalDate), 'EEEE, MMM d')}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        {habit.type === 'numerical' ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-6 mb-4">
                                    <button
                                        onClick={() => handleAdjustValue(-0.5)}
                                        className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:border-primary hover:bg-primary/5 hover:text-primary text-dark-lighter transition-all active:scale-95 shadow-sm"
                                    >
                                        <Minus />
                                    </button>
                                    <div className="text-center min-w-[100px]">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={completion?.value ?? 0}
                                            onChange={(e) => setNumericalValue(habit.id, modalDate, Math.max(0, parseFloat(e.target.value) || 0))}
                                            className="text-5xl font-black text-dark bg-transparent text-center w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">
                                            {habit.unit || 'Units'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAdjustValue(0.5)}
                                        className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:border-primary hover:bg-primary/5 hover:text-primary text-dark-lighter transition-all active:scale-95 shadow-sm"
                                    >
                                        <Plus />
                                    </button>
                                </div>

                                {habit.dailyTarget && (
                                    <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 max-w-[220px]">
                                        <div className="flex justify-between text-[10px] font-bold text-dark-lighter uppercase tracking-wider mb-2">
                                            <span>Target: {habit.dailyTarget}</span>
                                            <span className={isCompleted ? 'text-success' : 'text-primary'}>
                                                {Math.round(((completion?.value ?? 0) / habit.dailyTarget) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-500 rounded-full"
                                                style={{
                                                    width: `${Math.min(100, ((completion?.value ?? 0) / habit.dailyTarget) * 100)}%`,
                                                    backgroundColor: isCompleted ? '#84CC16' : habit.color
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
                                    className={`w-32 h-32 rounded-[2rem] border-4 flex items-center justify-center transition-all duration-300 shadow-lg ${isCompleted
                                        ? 'border-[#84CC16] bg-[#84CC16]/10 text-[#84CC16] shadow-success/20 rotate-0'
                                        : 'border-gray-200 bg-gray-50 text-dark-light hover:border-primary/40 hover:bg-primary/5 hover:text-primary rotate-[10deg] hover:rotate-0'
                                        }`}
                                >
                                    <Check size={56} strokeWidth={4} className={`transition-transform duration-500 ${isCompleted ? 'scale-100' : 'scale-50 opacity-0'}`} />
                                    {!isCompleted && <div className="absolute w-6 h-6 rounded-full border-[3px] border-current opacity-30" />}
                                </button>
                                <p className={`mt-5 font-bold text-sm tracking-wide ${isCompleted ? 'text-success' : 'text-dark-lighter'}`}>
                                    {isCompleted ? 'Awesome job! 🎉' : 'Tap to complete'}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleViewDetails}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-50 text-dark-lighter text-sm font-bold border border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group mt-auto shadow-sm"
                        >
                            <TrendingUp size={18} />
                            View Full Analysis
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>

                        {/* Note toggle */}
                        <button
                            onClick={() => setShowNote(!showNote)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 ${showNote || completion?.note
                                    ? 'bg-primary/5 text-primary border border-primary/20'
                                    : 'text-dark-lighter hover:text-primary hover:bg-primary/5'
                                }`}
                        >
                            <MessageSquare size={14} />
                            {completion?.note ? 'Edit Note' : 'Add Note'}
                        </button>

                        {showNote && (
                            <textarea
                                value={completion?.note || ''}
                                onChange={(e) => {
                                    if (completion) {
                                        setCompletionNote(habit.id, modalDate, e.target.value);
                                    }
                                }}
                                placeholder="How did it go? Any reflections..."
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-[#D4C8E8] text-dark text-sm placeholder-dark-lighter/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                                rows={3}
                                autoFocus
                            />
                        )}
                    </div>

                    {/* Level Footer */}
                    <div className="bg-[#F9F9FB] px-6 py-4 flex items-center justify-between border-t border-gray-100 mt-auto rounded-bl-3xl md:rounded-bl-3xl md:rounded-br-none rounded-br-3xl">
                        <div className="flex items-center gap-2">
                            <Award size={16} className="text-warning" />
                            <span className="text-[10px] font-bold text-dark-lighter uppercase tracking-widest">{levelInfo.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-700 rounded-full"
                                    style={{
                                        width: `${levelInfo.progressToNext}%`,
                                        backgroundColor: levelColor
                                    }}
                                />
                            </div>
                            <span className="text-xs font-black text-dark-lighter font-mono">
                                {levelInfo.progressToNext}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Calendar */}
                <div className="w-full md:w-80 bg-[#F9F9FB] flex flex-col border-l border-gray-100">
                    <div className="p-5 flex items-center justify-between border-b border-gray-200 bg-white">
                        <h3 className="font-bold text-darklex items-center gap-2"><Calendar size={18} className="text-primary" /> History</h3>
                        <button
                            onClick={handleClose}
                            className="p-2 text-dark-lighter hover:text-dark hover:bg-gray-100 rounded-full transition-colors hidden md:block"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 flex-1">
                        {/* Month Nav */}
                        <div className="flex items-center justify-between mb-5 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-dark-lighter hover:text-dark transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-sm text-dark tracking-wide uppercase">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-1.5 hover:bg-gray-100 rounded-xl text-dark-lighter hover:text-dark transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-3 text-center">
                            {weekDays.map(d => (
                                <div key={d} className="text-[10px] font-bold text-dark-lighter uppercase tracking-wider">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1.5">
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
                                            aspect-square rounded-xl flex items-center justify-center text-xs font-bold relative transition-all duration-300
                                            ${!isCurrentMonth ? 'text-dark-light' : 'text-dark-lighter hover:bg-gray-200'}
                                            ${isTargetDate ? 'ring-2 ring-primary ring-offset-2 bg-primary/10 text-dark shadow-sm scale-110 z-10' : ''}
                                            ${dayCompleted ? 'bg-white shadow-sm border border-gray-100' : ''}
                                        `}
                                    >
                                        <span>{format(date, 'd')}</span>
                                        {/* Status Dot */}
                                        {dayCompleted && (
                                            <div
                                                className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full"
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
