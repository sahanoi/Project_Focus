import React, { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { Habit } from '../../types';
import { calculateHabitLevel, getLevelColor } from '../../utils/habitLevelUtils';
import { format, subDays, addDays } from 'date-fns';
import {
    X, Check, Minus, Plus, Calendar, ArrowRight,
    TrendingUp, Award, Clock
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
        setNumericalValue(habit.id, modalDate, Math.max(0, current + delta));
    };

    const handleViewDetails = () => {
        setDetailViewHabitId(habit.id);
        setSelectedHabitId(null);
    };

    // Date navigation
    const dateLabels = [
        { label: 'Today', date: format(new Date(), 'yyyy-MM-dd') },
        { label: 'Yesterday', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
        { label: format(subDays(new Date(), 2), 'EEE'), date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
        { label: format(subDays(new Date(), 3), 'EEE'), date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-sm bg-[#1a1a2e] rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-6 pb-0 flex flex-col items-center">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
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
                </div>

                {/* Date Selector */}
                <div className="mt-6 px-6">
                    <div className="flex bg-[#11131a] rounded-xl p-1 border border-gray-800">
                        {dateLabels.map((d) => (
                            <button
                                key={d.date}
                                onClick={() => setModalDate(d.date)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${modalDate === d.date
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Log Controls */}
                <div className="p-8">
                    {habit.type === 'numerical' ? (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-6 mb-4">
                                <button
                                    onClick={() => handleAdjustValue(-1)}
                                    className="w-12 h-12 rounded-2xl bg-[#11131a] border border-gray-800 flex items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all active:scale-90"
                                >
                                    <Minus className="text-indigo-400" />
                                </button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-5xl font-black text-white">{completion?.value ?? 0}</span>
                                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">
                                        {habit.unit || 'Units'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleAdjustValue(1)}
                                    className="w-12 h-12 rounded-2xl bg-[#11131a] border border-gray-800 flex items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all active:scale-90"
                                >
                                    <Plus className="text-indigo-400" />
                                </button>
                            </div>

                            {habit.dailyTarget && (
                                <div className="w-full bg-[#11131a] rounded-xl p-3 border border-gray-800 mb-6">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1.5">
                                        <span>Target: {habit.dailyTarget} {habit.unit}</span>
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
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#11131a] text-gray-400 text-sm font-bold border border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all group"
                    >
                        <TrendingUp size={16} />
                        View Full Analysis
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                </div>

                {/* Level Progress Footer */}
                <div className="bg-[#11131a] px-6 py-4 flex items-center justify-between border-t border-gray-800">
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
        </div>
    );
}
