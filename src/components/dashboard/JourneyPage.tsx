import React from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import { Sparkles, Lock, Star, Zap } from 'lucide-react';
import StarterQuestCard from './StarterQuestCard';
import DailyMissionCard from './DailyMissionCard';

/** Aligns with `LEVEL_TO_TIER` / `FEATURE_GATES` in `src/types/index.ts`. Higher levels are aspirational flair. */
const LEVEL_MILESTONES = [
    { level: 1,  label: 'Initiate',     xpRequired: 0,     reward: 'Regular habits & statistics' },
    { level: 2,  label: 'Apprentice',   xpRequired: 1000,  reward: 'Numerical habits' },
    { level: 3,  label: 'Practitioner', xpRequired: 2000,  reward: 'Goals & custom schedules' },
    { level: 4,  label: 'Strategist',   xpRequired: 3000,  reward: 'Infinite Loop habits' },
    { level: 5,  label: 'Competent',    xpRequired: 4000,  reward: 'Challenge habits & routines' },
    { level: 6,  label: 'Expert',       xpRequired: 5000,  reward: 'Unlimited active habits' },
    { level: 10, label: 'Veteran',      xpRequired: 9000,  reward: 'Community leaderboard rank badge (roadmap)' },
    { level: 20, label: 'Master',       xpRequired: 19000, reward: 'Custom radar themes (roadmap)' },
    { level: 50, label: 'Legend',       xpRequired: 49000, reward: 'Legend collectible frame (roadmap)' },
    { level: 61, label: 'Immortal',     xpRequired: 60000, reward: 'Immortal title & profile aura (roadmap)' },
];

export default function JourneyPage() {
    const { stats } = useHabitStore();
    const { level, xp } = stats;
    const xpProgress = (xp % 1000) / 1000 * 100;
    const xpToNextLevel = 1000 - (xp % 1000);

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24 lg:pb-8">
            <header>
                <h1 className="text-3xl font-black text-dark dark:text-night-text tracking-tight">Journey</h1>
                <p className="text-dark-lighter dark:text-night-text-muted mt-1 text-sm max-w-xl">
                    Story-style quests, guideline habits, and your long-term level path — separate from the main dashboard, so home stays a straightforward habit tracker.
                </p>
            </header>

            {/* Foundation + 7-day missions (isekai / guided layer) */}
            <section aria-label="Story quests and missions" className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-dark-lighter dark:text-night-text-muted px-1">Quests &amp; missions</h2>
                <StarterQuestCard />
                <DailyMissionCard />
            </section>

            <h2 className="text-sm font-bold uppercase tracking-wider text-dark-lighter dark:text-night-text-muted px-1 pt-2">Level progression</h2>

            {/* Current Level Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl p-6"
            >
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl font-black text-primary dark:text-primary-light">{level}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-primary-light">Current Level</span>
                            <Sparkles size={12} className="text-warning" />
                        </div>
                        <h2 className="text-xl font-black text-dark dark:text-night-text mb-3">
                            {LEVEL_MILESTONES.slice().reverse().find(m => level >= m.level)?.label ?? 'Initiate'}
                        </h2>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider">
                                <span className="text-primary dark:text-primary-light">Season XP</span>
                                <span>{Math.floor(xp % 1000)} / 1000</span>
                            </div>
                            <div className="h-3 bg-[#D4C8E8] dark:bg-night-bg rounded-full overflow-hidden border border-primary/10 dark:border-primary/20">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    className="h-full bg-primary relative rounded-full"
                                >
                                    <div className="absolute inset-0 bg-white/20 rounded-full" />
                                </motion.div>
                            </div>
                            <p className="text-[10px] text-dark-lighter dark:text-night-text-muted">
                                {Math.round(xpToNextLevel)} XP until Level {level + 1}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Level Milestones */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-dark-lighter dark:text-night-text-muted px-1">Milestone Roadmap</h3>
                {LEVEL_MILESTONES.map((milestone, idx) => {
                    const isUnlocked = level >= milestone.level;
                    const isCurrent = LEVEL_MILESTONES[idx + 1]
                        ? level >= milestone.level && level < LEVEL_MILESTONES[idx + 1].level
                        : level >= milestone.level;

                    return (
                        <motion.div
                            key={milestone.level}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                isCurrent
                                    ? 'bg-surface dark:bg-night-surface border-primary/30 dark:border-primary/40'
                                    : isUnlocked
                                        ? 'bg-success/5 dark:bg-success/10 border-success/20 dark:border-success/30'
                                        : 'bg-surface-dark/30 dark:bg-night-surface/30 border-[#D4C8E8] dark:border-night-border opacity-60'
                            }`}
                        >
                            {/* Level badge */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isCurrent ? 'bg-primary/10 dark:bg-primary/20'
                                    : isUnlocked ? 'bg-success/10 dark:bg-success/20'
                                        : 'bg-[#D4C8E8]/50 dark:bg-night-bg/50'
                            }`}>
                                {isUnlocked
                                    ? <Star size={20} className={isCurrent ? 'text-primary dark:text-primary-light' : 'text-success'} />
                                    : <Lock size={16} className="text-dark-lighter dark:text-night-text-muted" />
                                }
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-sm ${isCurrent ? 'text-primary dark:text-primary-light' : isUnlocked ? 'text-success' : 'text-dark-lighter dark:text-night-text-muted'}`}>
                                        Lv.{milestone.level}
                                    </span>
                                    <span className="font-bold text-sm text-dark dark:text-night-text">{milestone.label}</span>
                                    {isCurrent && (
                                        <span className="text-[9px] font-bold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            You are here
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-dark-lighter dark:text-night-text-muted mt-0.5">{milestone.reward}</p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <span className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted">
                                    {milestone.xpRequired.toLocaleString()} XP
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Coming Soon Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-2xl p-5 flex items-center gap-4"
            >
                <div className="w-10 h-10 rounded-xl bg-warning/10 dark:bg-warning/20 flex items-center justify-center flex-shrink-0">
                    <Zap size={20} className="text-warning" />
                </div>
                <div>
                    <p className="text-sm font-bold text-dark dark:text-night-text">More coming soon</p>
                    <p className="text-xs text-dark-lighter dark:text-night-text-muted">
                        Collectibles showcase, weekly season leaderboard, and XP history charts are on the roadmap.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
