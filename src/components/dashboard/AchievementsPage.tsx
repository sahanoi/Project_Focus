import React, { useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { ACHIEVEMENTS, TIER_COLORS, Achievement } from '../../utils/achievementUtils';
import { motion } from 'framer-motion';
import { Lock, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function AchievementsPage() {
    const { achievements } = useHabitStore();

    const unlockedIds = useMemo(() => new Set(achievements.map(a => a.id)), [achievements]);

    const categories = useMemo(() => {
        const cats = new Set(ACHIEVEMENTS.map(a => a.category));
        return Array.from(cats);
    }, []);

    const groupedAchievements = useMemo(() => {
        const groups: Record<string, Achievement[]> = {};
        for (const a of ACHIEVEMENTS) {
            if (!groups[a.category]) groups[a.category] = [];
            groups[a.category].push(a);
        }
        return groups;
    }, []);

    const getUnlockDate = (id: string) => {
        const unlockInfo = achievements.find(a => a.id === id);
        if (!unlockInfo) return null;
        return format(new Date(unlockInfo.unlockedAt + 'T00:00:00'), 'MMM d, yyyy');
    };

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-5xl">
            {/* Header */}
            <header className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-dark tracking-tight mb-2">
                        Trophy Room
                    </h1>
                    <p className="text-dark-lighter">
                        Track your milestones, streaks, and gamification rewards.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-[#D4C8E8]">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Award className="text-primary" size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-2xl font-black text-dark">{achievements.length} <span className="text-sm font-medium text-dark-lighter">/ {ACHIEVEMENTS.length}</span></div>
                        <div className="text-xs font-bold uppercase tracking-wider text-dark-lighter">Unlocked</div>
                    </div>
                </div>
            </header>

            {/* Achievement Categories */}
            <div className="space-y-12">
                {categories.map((category, catIdx) => (
                    <section key={category}>
                        <h2 className="text-lg font-black text-dark uppercase tracking-wider mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-[#D4C8E8] inline-block" />
                            {category}
                            <span className="flex-1 h-px bg-[#D4C8E8] inline-block" />
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedAchievements[category].map((achievement, idx) => {
                                const isUnlocked = unlockedIds.has(achievement.id);
                                const tierStyles = isUnlocked
                                    ? TIER_COLORS[achievement.tier]
                                    : { bg: 'bg-surface-dark border-gray-200 opacity-60', text: 'text-gray-400', border: 'border-gray-200', glow: '' };

                                return (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 + catIdx * 0.1 }}
                                        className={`relative p-5 rounded-2xl border ${tierStyles.bg} ${tierStyles.border} transition-all duration-300 ${isUnlocked ? tierStyles.glow : 'grayscale hover:grayscale-0'}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner ${isUnlocked ? 'bg-white' : 'bg-gray-100'}`}>
                                                {isUnlocked ? achievement.icon : <Lock size={20} className="text-gray-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${tierStyles.text}`}>
                                                        {achievement.tier}
                                                    </span>
                                                    {isUnlocked && (
                                                        <span className="text-[10px] font-medium text-dark-lighter">
                                                            {getUnlockDate(achievement.id)}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`font-black text-sm mb-1 ${isUnlocked ? 'text-dark' : 'text-gray-500'}`}>
                                                    {achievement.name}
                                                </h3>
                                                <p className={`text-xs ${isUnlocked ? 'text-dark-lighter' : 'text-gray-400'}`}>
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
