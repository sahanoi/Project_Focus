import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, ChevronRight, Gift, Sparkles } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { USER_MISSIONS, getOnboardingDay } from '../../data/missions';
import { calculateCurrentStreak } from '../../utils/statsUtils';
import { today } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';

export default function DailyMissionCard() {
    const { stats, habits, goals, setActiveTab } = useHabitStore();
    const currentDay = getOnboardingDay(stats.accountCreatedDate);
    const mission = currentDay <= 7 ? USER_MISSIONS[currentDay] : null;

    const [isClaimed, setIsClaimed] = useState(() => {
        if (!mission) return true;
        return localStorage.getItem(`mission_claimed_${currentDay}`) === 'true';
    });

    // All hooks must be before any conditional returns
    const todayStr = today();

    // Count today's completions across all habits
    const todayCompletions = habits.reduce((acc, h) => {
        const comp = h.completions[todayStr];
        if (comp && (comp.completed || (comp.value && comp.value > 0))) {
            return acc + 1;
        }
        return acc;
    }, 0);

    // If they finished the 7-day onboarding or no mission, don't show
    if (currentDay > 7 || !mission || isClaimed) return null;

    // Evaluate if the mission condition is met
    let isCompleted = false;

    switch (mission.targetAction) {
        case 'COMPLETE_1_HABIT':
            isCompleted = todayCompletions >= 1;
            break;
        case 'COMPLETE_2_HABITS':
            isCompleted = todayCompletions >= 2;
            break;
        case 'ACHIEVE_STREAK_3':
            isCompleted = habits.some(h => calculateCurrentStreak(h) >= 3);
            break;
        case 'CREATE_CUSTOM_HABIT':
            isCompleted = habits.length > 3;
            break;
        case 'VISIT_COMMUNITY':
            isCompleted = localStorage.getItem('visited_community') === 'true';
            break;
        case 'CREATE_FIRST_GOAL':
            isCompleted = goals.length > 0;
            break;
        case 'REACH_LEVEL_2':
            isCompleted = stats.level >= 2;
            break;
        default:
            isCompleted = false;
    }

    const handleClaim = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D8B4E2', '#9B8BB4', '#FBBF24', '#84CC16']
        });
        localStorage.setItem(`mission_claimed_${currentDay}`, 'true');
        setIsClaimed(true);
    };

    const handleActionClick = () => {
        if (mission.targetAction === 'VISIT_COMMUNITY') {
            localStorage.setItem('visited_community', 'true');
            setActiveTab('community');
        } else if (mission.targetAction === 'CREATE_FIRST_GOAL') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex-shrink-0">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl bg-gradient-to-br from-primary-light/20 to-primary/10 dark:from-primary/20 dark:to-primary-dark/10 border-2 border-primary-light/30 dark:border-primary/30 shadow-sm"
            >

                <div className="p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-dark/50 dark:bg-night-bg/50 shadow-inner flex items-center justify-center flex-shrink-0">
                            <Sparkles className="text-warning" size={24} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light">Day {currentDay} of 7</span>
                            </div>
                            <h3 className="text-xl font-bold text-dark dark:text-night-text">{mission.title}</h3>
                            <p className="text-dark-light dark:text-night-text-muted text-sm mt-1 max-w-xl">
                                {mission.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end flex-shrink-0 gap-2">
                        {isCompleted ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClaim}
                                className="bg-warning text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-warning/20 flex items-center gap-2 hover:bg-warning-dark transition-colors"
                            >
                                <Gift size={20} />
                                Claim {mission.rewardXP} XP
                            </motion.button>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-dark-lighter dark:text-night-text-muted text-sm font-medium bg-surface-dark/50 dark:bg-night-bg/50 px-4 py-2 rounded-lg">
                                    <div className="w-4 h-4 rounded-full border-2 border-dark-lighter/50 dark:border-night-text-muted/50" />
                                    Pending...
                                </div>
                                {mission.targetAction === 'VISIT_COMMUNITY' && (
                                    <button onClick={handleActionClick} className="text-xs text-primary dark:text-primary-light font-bold hover:underline">
                                        Go to Community →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
