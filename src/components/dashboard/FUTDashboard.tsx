import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import StatsRadar from './StatsRadar';
import XPProgress from './XPProgress';
import LogEntryBar from './LogEntryBar';
import HabitList from '../habits/HabitList';
import { Sparkles, Swords, Dumbbell } from 'lucide-react';
import { Habit } from '../../types';

interface FUTDashboardProps {
    onAddHabit: () => void;
    onEditHabit: (habit: Habit) => void;
}

export default function FUTDashboard({ onAddHabit, onEditHabit }: FUTDashboardProps) {
    const { stats, habits, routines } = useHabitStore();

    return (
        <div className="h-full flex flex-col bg-[#111318] text-gray-100">
            {/* Top Bar / Header Area — Log Entry + XP */}
            <div className="h-16 border-b border-[#1e1b4b]/50 flex items-center justify-between px-6 bg-[#0f1014] gap-4">
                <LogEntryBar />

                <div className="w-72 flex-shrink-0">
                    <XPProgress stats={stats} />
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 flex overflow-hidden">

                {/* Main Content (Habit List) */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Swords className="text-indigo-400" size={20} />
                            <h3 className="font-bold text-lg text-gray-200">Today's Squad Battles</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-xs font-bold bg-[#1e1b4b] text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">{stats.attributes.stk} Streak</span>
                            <span className="text-xs font-bold bg-[#1e1b4b] text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">{stats.attributes.foc} Focus</span>
                        </div>
                    </div>

                    <div className="fut-habit-list">
                        <HabitList onEditHabit={onEditHabit} onAddHabit={onAddHabit} />
                    </div>
                </div>

                {/* Right Panel (Stats & Widgets) */}
                <aside className="w-96 bg-[#0f1014] border-l border-[#1e1b4b]/30 overflow-y-auto p-4 flex flex-col gap-6">

                    {/* Stats Radar Widget */}
                    <div>
                        <div className="flex items-center justify-between mb-3 px-2">
                            <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Attributes</h4>
                            <Sparkles size={14} className="text-yellow-500" />
                        </div>
                        <StatsRadar stats={stats} />
                    </div>

                    {/* SBCs / Routines Widget */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider">SBCs (Routines)</h4>
                            <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300">+</button>
                        </div>

                        <div className="space-y-3">
                            {routines.length > 0 ? (
                                routines.map(routine => (
                                    <div key={routine.id} className="bg-[#1e1b4b]/30 p-3 rounded-lg border border-indigo-900/30 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{routine.icon}</span>
                                            <div>
                                                <h4 className="font-bold text-gray-200 text-sm group-hover:text-indigo-300 transition-colors">{routine.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-500">{routine.habitIds.length} Objectives</span>
                                                    <span className="text-[10px] text-indigo-400 font-bold">+{routine.bonusXp} XP</span>
                                                </div>
                                                {routine.description && (
                                                    <p className="text-[10px] text-gray-500 mt-0.5 italic">{routine.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 opacity-40 border border-dashed border-gray-700 rounded-lg">
                                    <Dumbbell className="mx-auto mb-2" size={20} />
                                    <p className="text-xs">No Active SBCs</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}
