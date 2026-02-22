import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import StatsRadar from './StatsRadar';
import XPProgress from './XPProgress';
import LogEntryBar from './LogEntryBar';
import DateNavigator from './DateNavigator';
import DailyReviewModal from './DailyReviewModal';
import StreakLifeLine from './StreakLifeLine';
import WeeklyDigest from './WeeklyDigest';
import MiniHeatmap from './MiniHeatmap';
import HabitList from '../habits/HabitList';
import { Target, Check, ChevronDown, ChevronRight, Sparkles, Moon } from 'lucide-react';
import { Habit, Routine } from '../../types';

interface FUTDashboardProps {
    onAddHabit: () => void;
    onEditHabit: (habit: Habit) => void;
    onAddGoal?: () => void;
}

export default function FUTDashboard({ onAddHabit, onEditHabit, onAddGoal }: FUTDashboardProps) {
    const { stats, habits, routines, goals } = useHabitStore();
    const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
    const [showReview, setShowReview] = useState(false);

    const toggleRoutine = (id: string) => {
        setExpandedRoutine(expandedRoutine === id ? null : id);
    };

    return (
        <div className="flex flex-col h-full bg-surface-dark text-dark overflow-hidden transition-colors">
            {/* Top Bar / Header Area */}
            <div className="border-b border-[#E6DDF2] bg-surface shadow-sm fade-down z-10">
                {/* Row 1: Search + XP */}
                <div className="flex items-center justify-between px-4 lg:px-8 py-2 gap-4">
                    <div className="flex-1 max-w-2xl">
                        <LogEntryBar />
                    </div>
                    <div className="w-80 flex-shrink-0 hidden md:block">
                        <XPProgress stats={stats} />
                    </div>
                </div>
                {/* Row 2: Date Navigator */}
                <div className="px-4 lg:px-8 pb-2">
                    <DateNavigator />
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 flex min-h-0 container mx-auto max-w-7xl pt-6 px-4 pb-8">

                {/* Main Content (Goals -> Routines -> Habits) */}
                <div className="flex-1 overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-gray-300 min-w-0 flex flex-col gap-8">

                    {/* Level 1: GOALS (The Umbrella) */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold tracking-tight text-dark flex items-center gap-2">
                                <Target className="text-primary" size={24} />
                                Active Goals
                            </h2>
                            {onAddGoal && (
                                <button onClick={onAddGoal} className="btn-secondary py-2 text-sm">
                                    + New Goal
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {goals.slice(0, 3).map(g => (
                                <div key={g.id} className="card bg-white relative overflow-hidden group hover:-translate-y-1 transition-transform border border-primary-light/50 shadow-sm">
                                    <div className="absolute top-0 right-0 p-4">
                                        {g.achieved && <Check size={20} className="text-success" />}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{g.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-primary">{g.targetValue} {g.unit}</span>
                                        {g.deadline && <span className="text-xs text-dark-lighter font-medium bg-surface-dark px-2 py-0.5 rounded-full">by {g.deadline}</span>}
                                    </div>
                                    {/* Progress simulation (requires active habit matching in future) */}
                                    <div className="w-full h-2 bg-gray-100 rounded-full mt-4">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: g.achieved ? '100%' : '35%' }} />
                                    </div>
                                </div>
                            ))}
                            {goals.length === 0 && onAddGoal && (
                                <button onClick={onAddGoal} className="card border-dashed border-2 flex flex-col items-center justify-center p-8 text-dark-lighter hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all h-32">
                                    <Target size={24} className="mb-2 opacity-50" />
                                    <span className="font-medium">Define your first objective</span>
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Level 2 & 3: ROUTINES AND HABITS */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold tracking-tight text-dark flex items-center gap-2">
                                <Sparkles className="text-warning" size={24} />
                                Today's Schedule
                            </h2>
                            <div className="flex gap-2">
                                <span className="badge bg-purple/10 text-purple-dark border border-purple/20 shadow-sm">{stats.attributes.stk} Streak</span>
                                <span className="badge bg-teal/10 text-teal-dark border border-teal/20 shadow-sm">{stats.attributes.foc} Focus</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {routines.map(routine => {
                                const isExpanded = expandedRoutine === routine.id;
                                const routineHabits = habits.filter(h => routine.habitIds.includes(h.id) && !h.archived);

                                return (
                                    <motion.div
                                        key={routine.id}
                                        layout
                                        className="card-flat border border-gray-100 shadow-sm bg-white overflow-hidden transition-all duration-300"
                                    >
                                        {/* Routine Header */}
                                        <div
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => toggleRoutine(routine.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                                                    {routine.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-dark group-hover:text-primary transition-colors">{routine.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm font-medium text-dark-lighter">{routineHabits.length} Habits</span>
                                                        <span className="text-xs font-bold text-primary-dark bg-primary/10 px-2 py-0.5 rounded-md">+{routine.bonusXp} XP</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-dark-lighter group-hover:text-dark transition-colors p-2">
                                                {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                                            </div>
                                        </div>

                                        {/* Nested Habits (Collapsible) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="border-t border-gray-100 pl-4 border-l-2 ml-6 border-l-gray-100 overflow-hidden"
                                                >
                                                    <div className="pt-4 pb-2">
                                                        {/* Re-using HabitList but passing specific habits if App architecture allows, 
                                                            or just rendering standard HabitList to avoid breaking state for now */}
                                                        <HabitList onEditHabit={onEditHabit} onAddHabit={onAddHabit} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}

                            {/* Uncategorized Habits (Fallback if no routines exist) */}
                            {routines.length === 0 && (
                                <div className="card shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-dark-lighter mb-4 inline-flex items-center gap-2">
                                        All Habits
                                    </h3>
                                    <HabitList onEditHabit={onEditHabit} onAddHabit={onAddHabit} />
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Panel (Stats & Widgets) - Kept lighter and cleanly separated */}
                <aside className="w-[340px] flex-shrink-0 flex flex-col gap-6 pl-6 border-l border-[#E6DDF2]/50">

                    {/* Daily Review CTA */}
                    <button
                        onClick={() => setShowReview(true)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary-light/5 border border-primary/10 hover:border-primary/25 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <Moon size={20} className="text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-dark">Daily Review</p>
                            <p className="text-xs text-dark-lighter">Reflect & protect streaks</p>
                        </div>
                    </button>

                    {/* Weekly Digest Widget */}
                    <div className="card shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-dark text-sm tracking-wide">Weekly Overview</h4>
                        </div>
                        <WeeklyDigest />
                    </div>

                    {/* Streak Life Line Widget */}
                    <div className="card shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-dark text-sm tracking-wide">Steadfast Streaks</h4>
                        </div>
                        <StreakLifeLine />
                    </div>

                    {/* Activity Heatmap */}
                    <div className="card shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-dark text-sm tracking-wide">Activity</h4>
                        </div>
                        <MiniHeatmap />
                    </div>

                    {/* Stats Radar Widget */}
                    <div className="card shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-dark text-sm tracking-wide">RPG Stats</h4>
                        </div>
                        <StatsRadar stats={stats} />
                    </div>

                </aside>

            </div>

            {/* Daily Review Modal */}
            <DailyReviewModal isOpen={showReview} onClose={() => setShowReview(false)} />
        </div>
    );
}
