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
import DailyMissionCard from './DailyMissionCard';
import StarterQuestCard from './StarterQuestCard';
import { Target, Check, ChevronDown, ChevronRight, Sparkles, Moon } from 'lucide-react';
import { Habit, Routine } from '../../types';

interface FUTDashboardProps {
    onAddHabit: () => void;
    onEditHabit: (habit: Habit) => void;
    onAddGoal?: () => void;
}

/*
 * Dashboard UX goals: docs/PRODUCT.md §5
 * 1. PRIMARY CTA: Logging today's habits is the #1 action — LogEntryBar sits at the very top.
 * 2. HIERARCHY: Daily Mission → Active Goals → Routine Habits → Stats sidebar.
 * 3. MOBILE-FIRST: Full XP bar visible on all screen sizes; sidebar widgets collapse on small screens.
 * 4. AESTHETIC: Consistent "premium dusk purple / glassmorphism" via luxury-glass across all cards.
 * 5. EMPTY STATES: Every section has a clear prompt when there's no data yet.
 */
export default function FUTDashboard({ onAddHabit, onEditHabit, onAddGoal }: FUTDashboardProps) {
    const { stats, habits, routines, goals } = useHabitStore();
    const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
    const [showReview, setShowReview] = useState(false);

    const toggleRoutine = (id: string) => {
        setExpandedRoutine(expandedRoutine === id ? null : id);
    };

    return (
        <div className="flex flex-col h-full bg-surface dark:bg-night-surface text-dark dark:text-night-text overflow-hidden transition-colors duration-300 font-body">
            {/* Top Bar — tonal layers, no hard divider line */}
            <div className="relative bg-hearth-surface-low/90 dark:bg-night-surface fade-down z-40 transition-colors shadow-[0_1px_0_rgba(37,25,13,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                {/* Row 1: Search + XP */}
                <div className="flex items-center justify-between px-4 lg:px-8 py-3 gap-4 bg-hearth-surface-bright/70 dark:bg-night-surface/90 transition-colors">
                    <div className="flex-1 max-w-2xl min-w-0">
                        <LogEntryBar />
                    </div>
                    <div className="w-72 xl:w-80 flex-shrink-0 hidden md:block">
                        <XPProgress stats={stats} />
                    </div>
                </div>
                {/* Row 2: Date Navigator + mobile XP */}
                <div className="px-4 lg:px-8 pb-1.5 flex items-center gap-2 bg-hearth-surface-low/50 dark:bg-night-bg/40 transition-colors">
                    <div className="flex-1">
                        <DateNavigator />
                    </div>
                    {/* XP bar visible only on mobile — md+ shows it in Row 1 */}
                    <div className="md:hidden flex-shrink-0 w-44">
                        <XPProgress stats={stats} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0 container mx-auto max-w-7xl pt-6 px-4 pb-8 bg-hearth-background/80 dark:bg-night-bg/70 transition-colors">

                {/* Goals -> Routines -> Habits */}
                <div className="flex-1 overflow-y-auto pr-0 scrollbar-thin scrollbar-thumb-gray-700/60 scrollbar-track-transparent min-w-0 flex flex-col gap-8">

                    {/* Structured starter: Drink Water → L3 streak, then free play across selected habits */}
                    <section aria-label="Foundation quest">
                        <StarterQuestCard />
                    </section>

                    {/* 7-DAY ONBOARDING MISSION */}
                    <section aria-label="Daily mission">
                        <DailyMissionCard />
                    </section>

                    {/* Level 1: GOALS (The Umbrella) */}
                    <section aria-label="Active goals">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-headline text-2xl font-semibold tracking-tight text-hearth-on-surface dark:text-night-text flex items-center gap-2 transition-colors">
                                <Target className="text-primary dark:text-primary-light transition-colors" size={24} />
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
                                <div key={g.id} className="bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl relative overflow-hidden group transition-colors p-5">
                                    <div className="absolute top-0 right-0 p-4">
                                        {g.achieved && <Check size={20} className="text-success" />}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 text-dark dark:text-night-text transition-colors">{g.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-primary dark:text-primary-light transition-colors">{g.targetValue} {g.unit}</span>
                                        {g.deadline && <span className="text-xs text-dark-lighter dark:text-night-text-muted font-medium bg-surface-dark/50 dark:bg-night-surface/60 px-2 py-0.5 rounded-full transition-colors">by {g.deadline}</span>}
                                    </div>
                                    {/* Progress simulation (requires active habit matching in future) */}
                                    <div className="w-full h-2 bg-gray-100 dark:bg-night-bg rounded-full mt-4 transition-colors">
                                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: g.achieved ? '100%' : '35%' }} />
                                    </div>
                                </div>
                            ))}
                            {goals.length === 0 && onAddGoal && (
                                <button onClick={onAddGoal} className="card border-dashed border-2 flex flex-col items-center justify-center p-8 text-dark-lighter dark:text-night-text-muted hover:text-primary dark:hover:text-primary-light border-dark-border dark:border-night-border hover:border-primary/50 dark:hover:border-primary-light/50 hover:bg-primary/5 transition-all h-32">
                                    <Target size={24} className="mb-2 opacity-50" />
                                    <span className="font-medium">Define your first objective</span>
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Level 2 & 3: ROUTINES AND HABITS */}
                    <section aria-label="Today routines and habits">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-headline text-2xl font-semibold tracking-tight text-hearth-on-surface dark:text-night-text flex items-center gap-2 transition-colors">
                                <Sparkles className="text-warning" size={24} />
                                Today's Schedule
                            </h2>
                            <div className="flex gap-2">
                                <span className="badge bg-purple/10 dark:bg-purple/20 text-purple-dark dark:text-primary-light border border-purple/20 dark:border-purple/30 transition-colors">{stats.attributes.stk} Streak</span>
                                <span className="badge bg-teal/10 dark:bg-teal/20 text-teal-dark dark:text-teal border border-teal/20 dark:border-teal/30 transition-colors">{stats.attributes.foc} Focus</span>
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
                                        className="bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl overflow-hidden transition-colors duration-300 p-4 mb-4"
                                    >
                                        {/* Routine Header */}
                                        <div
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => toggleRoutine(routine.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-surface-dark/50 dark:bg-night-surface/60 flex items-center justify-center text-2xl transition-colors">
                                                    {routine.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-dark dark:text-night-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors">{routine.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm font-medium text-dark-lighter dark:text-night-text-muted transition-colors">{routineHabits.length} Habits</span>
                                                        <span className="text-xs font-bold text-primary-dark dark:text-primary-light bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-md transition-colors">+{routine.bonusXp} XP</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-dark-lighter dark:text-night-text-muted group-hover:text-dark dark:group-hover:text-night-text transition-colors p-2">
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
                                                    className="border-t border-gray-100/10 dark:border-night-border pl-4 border-l-2 ml-6 border-l-gray-100/20 dark:border-l-night-border overflow-hidden transition-colors"
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
                                <div className="bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl p-6 transition-colors space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-dark dark:text-night-text inline-flex items-center gap-2 transition-colors">
                                            <Sparkles size={18} className="text-warning" />
                                            All Habits
                                        </h3>
                                        <button
                                            onClick={onAddHabit}
                                            className="btn-secondary py-1.5 text-xs"
                                        >
                                            + Add Habit
                                        </button>
                                    </div>
                                    {habits.filter(h => !h.archived).length === 0 && (
                                        <div className="flex flex-col items-center py-8 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mb-4">
                                                <Sparkles size={28} className="text-primary/40 dark:text-primary-light/40" />
                                            </div>
                                            <p className="text-sm font-semibold text-dark-lighter dark:text-night-text-muted mb-1 transition-colors">No habits yet</p>
                                            <p className="text-xs text-dark-lighter/70 dark:text-night-text-muted/60 max-w-xs transition-colors">
                                                Add your first habit above. Start small — even a single daily habit compounds into remarkable progress.
                                            </p>
                                        </div>
                                    )}
                                    <HabitList onEditHabit={onEditHabit} onAddHabit={onAddHabit} />
                                </div>
                            )}
                        </div>
                    </section>
                </div>

            </div>

            {/* Daily Review Modal */}
            <DailyReviewModal isOpen={showReview} onClose={() => setShowReview(false)} />
        </div>
    );
}
