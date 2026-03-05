import React, { useMemo, useCallback } from 'react';
import { useModalClose } from '../../hooks/useModalClose';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialUser } from '../../utils/dummySocialData';
import { X, Trophy, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { TIER_COLORS } from '../../utils/achievementUtils';

interface PublicProfileModalProps {
    user: SocialUser | null;
    onClose: () => void;
}

export default function PublicProfileModal({ user, onClose }: PublicProfileModalProps) {
    const stableOnClose = useCallback(onClose, [onClose]);
    useModalClose(!!user, stableOnClose);
    if (!user) return null;

    // Formatting radar data
    const radarData = useMemo(() => {
        return [
            { subject: 'OVR', A: user.stats.attributes?.ovr || 0 },
            { subject: 'DSC', A: user.stats.attributes?.dsc || 0 },
            { subject: 'FOC', A: user.stats.attributes?.foc || 0 },
            { subject: 'STK', A: user.stats.attributes?.stk || 0 },
            { subject: 'BAL', A: user.stats.attributes?.bal || 0 },
            { subject: 'GRT', A: user.stats.attributes?.grt || 0 },
            { subject: 'VIT', A: user.stats.attributes?.vit || 0 },
        ];
    }, [user.stats]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl bg-surface dark:bg-night-surface rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors"
                >
                    {/* Header Banner */}
                    <div className="flex-shrink-0 relative h-32 bg-gradient-to-tr from-indigo-500 via-primary to-primary-light dark:from-indigo-600 dark:via-primary-dark dark:to-primary">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors backdrop-blur-md"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto pb-8">
                        {/* Profile Info Row (overlays banner) */}
                        <div className="px-8 flex flex-col sm:flex-row gap-6 items-end sm:items-start relative -mt-16 sm:-mt-12 mb-8">
                            <div className="relative group">
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white dark:bg-night-bg border-4 border-surface dark:border-night-surface shadow-xl object-cover transition-colors"
                                />
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-dark dark:bg-night-bg text-white dark:text-night-text text-sm font-black rounded-xl flex items-center justify-center shadow-lg border-2 border-surface dark:border-night-surface transition-colors">
                                    {user.level}
                                </div>
                            </div>

                            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-14">
                                <h2 className="text-2xl sm:text-3xl font-black text-dark dark:text-night-text tracking-tight leading-none mb-1 transition-colors">
                                    {user.name}
                                </h2>
                                <p className="text-dark-lighter dark:text-night-text-muted font-medium flex items-center justify-center sm:justify-start gap-2 transition-colors">
                                    <Trophy size={14} className="text-primary" /> Accountability Partner
                                </p>
                            </div>

                            <div className="mt-4 sm:mt-14 w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                    <Shield size={16} /> Nudge
                                </button>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="px-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Left Col: RPG Card */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-night-bg rounded-2xl p-6 border border-[#D4C8E8] dark:border-night-border shadow-sm relative overflow-hidden group transition-colors">
                                    {/* Glassmorphism gradient effect inside card */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 dark:from-primary/10 to-transparent pointer-events-none transition-colors" />

                                    <div className="flex items-center justify-between relative z-10 mb-4">
                                        <h3 className="font-black text-dark dark:text-night-text text-lg uppercase tracking-wider transition-colors">RPG Card</h3>
                                        <div className="bg-dark dark:bg-night-surface text-white dark:text-night-text border border-transparent dark:border-night-border px-3 py-1 rounded-lg font-black text-sm flex items-center gap-1 shadow-md transition-colors">
                                            OVR {user.stats.attributes?.ovr || 0}
                                        </div>
                                    </div>

                                    {/* Radar Chart */}
                                    <div className="h-[220px] -mt-4 relative z-10">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                                <PolarGrid stroke="var(--radar-grid-color, #D4C8E8)" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: 'var(--radar-text-color, #4a4a4a)', fontSize: 10, fontWeight: 800 }}
                                                />
                                                <Radar
                                                    name={user.name}
                                                    dataKey="A"
                                                    stroke="#6E44FF"
                                                    fill="#6E44FF"
                                                    fillOpacity={0.4}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Active Streaks Box */}
                                {user.activeStreaks.length > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-5 border border-orange-200 dark:border-orange-900/30 shadow-inner transition-colors">
                                        <h4 className="font-bold text-orange-800 dark:text-orange-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-2 transition-colors">
                                            <Flame size={14} /> Active Streaks
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {user.activeStreaks.map(streak => (
                                                <div key={streak.name} className="bg-white dark:bg-night-surface px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-900/50 text-sm font-bold shadow-sm flex items-center gap-2 text-dark dark:text-night-text transition-colors">
                                                    <span>{streak.icon}</span> {streak.days}d
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Col: Trophies & Stats */}
                            <div className="space-y-6">
                                {/* Top Badges Showcase */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-black text-dark dark:text-night-text text-sm uppercase tracking-wider flex items-center gap-2 transition-colors">
                                            <Trophy size={16} className="text-yellow-500 dark:text-yellow-400 transition-colors" /> Trophy Room
                                        </h3>
                                        <span className="text-xs font-bold text-primary hover:text-primary-dark cursor-pointer flex items-center gap-0.5">
                                            View All <ArrowUpRight size={14} />
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {user.badges.map(badge => {
                                            const tierStyles = TIER_COLORS[badge.tier as keyof typeof TIER_COLORS];
                                            return (
                                                <div key={badge.id} className={`flex items-center gap-4 p-3 rounded-xl border bg-white dark:bg-night-surface ${tierStyles.border} dark:border-opacity-20 shadow-sm group hover:scale-[1.02] transition-all`}>
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-inner ${tierStyles.bg} dark:bg-opacity-10`}>
                                                        {badge.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${tierStyles.text} dark:opacity-80`}>
                                                            {badge.tier}
                                                        </p>
                                                        <p className="text-sm font-black text-dark dark:text-night-text transition-colors">{badge.name}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Weekly Stats summary */}
                                <div className="bg-surface-dark dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border rounded-2xl p-5 mt-auto transition-colors">
                                    <h4 className="font-bold text-dark dark:text-night-text text-xs uppercase tracking-wider mb-4 transition-colors">Current Week</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-dark-lighter dark:text-night-text-muted font-bold uppercase tracking-wider mb-0.5 transition-colors">XP Earned</p>
                                            <p className="text-2xl font-black text-primary dark:text-primary-light transition-colors">{user.xpThisWeek.toLocaleString()}</p>
                                        </div>
                                        <div className="w-[1px] h-8 bg-[#D4C8E8] dark:bg-night-border transition-colors" />
                                        <div className="text-right">
                                            <p className="text-[10px] text-dark-lighter dark:text-night-text-muted font-bold uppercase tracking-wider mb-0.5 transition-colors">Global Rank</p>
                                            <p className="text-2xl font-black text-dark dark:text-night-text transition-colors">Top 10%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
