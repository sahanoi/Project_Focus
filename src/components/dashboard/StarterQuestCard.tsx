import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Sparkles } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import {
    getStarterQuestProgress,
    shouldShowStarterQuest,
    STARTER_QUEST_STREAK_TARGET,
} from '../../utils/starterQuestUtils';

export default function StarterQuestCard() {
    const habits = useHabitStore((s) => s.habits);

    if (!shouldShowStarterQuest(habits)) return null;

    const progress = getStarterQuestProgress(habits);
    if (!progress) return null;

    const { streak, level } = progress;
    const nextLevel = Math.min(STARTER_QUEST_STREAK_TARGET, level + 1);
    const copy =
        streak === 0
            ? 'Log Drink Water today to begin your foundation streak.'
            : streak < STARTER_QUEST_STREAK_TARGET
              ? `${STARTER_QUEST_STREAK_TARGET - streak} more consecutive day${STARTER_QUEST_STREAK_TARGET - streak === 1 ? '' : 's'} until you unlock your full habit set focus.`
              : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-cyan-500/25 dark:border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-surface dark:via-night-surface to-primary/5 p-5 md:p-6"
            role="region"
            aria-label="Starter quest: Drink Water"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 dark:bg-cyan-400/10 flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-300">
                        <Droplets size={26} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                                Foundation quest
                            </span>
                            <span className="text-xs font-bold text-dark-lighter dark:text-night-text-muted">
                                Level {level} / {STARTER_QUEST_STREAK_TARGET}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-dark dark:text-night-text">
                            Drink Water — build the streak first
                        </h3>
                        <p className="text-sm text-dark-light dark:text-night-text-muted mt-1 leading-relaxed">
                            Reach quest level {STARTER_QUEST_STREAK_TARGET} by checking in <strong>three days in a row</strong>
                            (scheduled days count). Then lean into every habit you picked — in any order you like.
                        </p>
                        {copy ? (
                            <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300/90 mt-2">{copy}</p>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5" aria-hidden>
                        {Array.from({ length: STARTER_QUEST_STREAK_TARGET }, (_, i) => {
                            const step = i + 1;
                            const filled = step <= level;
                            return (
                                <div
                                    key={step}
                                    className={`h-2.5 w-10 sm:w-12 rounded-full transition-colors ${
                                        filled
                                            ? 'bg-cyan-500 dark:bg-cyan-400'
                                            : 'bg-dark-border/60 dark:bg-night-border'
                                    }`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-dark-lighter dark:text-night-text-muted">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>
                            Streak: {streak} day{streak === 1 ? '' : 's'}
                            {level < STARTER_QUEST_STREAK_TARGET ? ` → next: level ${nextLevel}` : ''}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
