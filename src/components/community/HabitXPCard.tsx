import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
    CommunityHabit,
    CommunityHabitXP,
    HabitCardTier,
    TIER_COLORS,
    TIER_TITLES,
    getNextTier,
    TIER_THRESHOLDS,
} from '../../lib/communityApi';
import { Flame, Zap, Star } from 'lucide-react';

interface HabitXPCardProps {
    habit: CommunityHabit;
    xpData: CommunityHabitXP;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
    onComplete?: () => void;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    angle: number;
    speed: number;
    size: number;
    color: string;
}

const PARTICLE_COLORS = ['#fbbf24', '#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fff'];

function generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 50,
        y: 50,
        angle: (i / count) * 360,
        speed: 40 + Math.random() * 40,
        size: 4 + Math.random() * 6,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }));
}

const SIZE_CLASSES = {
    sm: { wrapper: 'w-40', icon: 'text-4xl', name: 'text-xs', title: 'text-[10px]', xp: 'text-[10px]', bar: 'h-1', padding: 'p-3', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { wrapper: 'w-60', icon: 'text-5xl', name: 'text-sm', title: 'text-xs', xp: 'text-xs', bar: 'h-1.5', padding: 'p-4', badge: 'text-[10px] px-2 py-0.5' },
    lg: { wrapper: 'w-full max-w-sm', icon: 'text-6xl', name: 'text-base', title: 'text-sm', xp: 'text-sm', bar: 'h-2', padding: 'p-5', badge: 'text-xs px-2.5 py-1' },
};

function getTierTitle(tier: HabitCardTier, slug: string): string {
    return TIER_TITLES[tier][slug] ?? TIER_TITLES[tier]['default'];
}

export function HabitXPCard({ habit, xpData, size = 'md', showDetails = true, onComplete }: HabitXPCardProps) {
    const sc = SIZE_CLASSES[size];
    const tierColors = TIER_COLORS[xpData.tier];
    const nextTier = getNextTier(xpData.tier);
    const nextTierXP = nextTier ? TIER_THRESHOLDS[nextTier] : xpData.xp;
    const tierStart = TIER_THRESHOLDS[xpData.tier];
    const title = getTierTitle(xpData.tier, habit.slug);
    const isMaster = xpData.tier === 'Master';

    const prevTierRef = useRef<HabitCardTier>(xpData.tier);
    const [showSparkle, setShowSparkle] = useState(false);
    const [particles] = useState(() => generateParticles(16));
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(xpData.progressInTier), 150);
        return () => clearTimeout(timer);
    }, [xpData.progressInTier]);

    useEffect(() => {
        if (prevTierRef.current !== xpData.tier) {
            setShowSparkle(true);
            prevTierRef.current = xpData.tier;
            const t = setTimeout(() => setShowSparkle(false), 1800);
            return () => clearTimeout(t);
        }
    }, [xpData.tier]);

    const glowClass = ['Gold', 'Platinum', 'Diamond', 'Master'].includes(xpData.tier) ? tierColors.glow : '';

    return (
        <motion.div
            className={`${sc.wrapper} relative select-none`}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Glow ring for high tiers */}
            {glowClass && (
                <div className={`absolute inset-0 rounded-3xl blur-xl opacity-40 bg-gradient-to-br ${tierColors.bg} pointer-events-none`} />
            )}

            {/* Master pulse animation */}
            {isMaster && (
                <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 pointer-events-none"
                    animate={{ opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}

            {/* Main card */}
            <div
                className={`relative rounded-3xl border ${tierColors.border} overflow-hidden shadow-lg ${glowClass} ${sc.padding}`}
                style={{ background: 'linear-gradient(135deg, var(--card-from), var(--card-to))' }}
            >
                {/* Inline style for gradient — dynamic tier colors require inline style */}
                <style>{`
                    .habit-xp-card-${habit.id} {
                        background: linear-gradient(135deg, var(--tw-gradient-stops));
                    }
                `}</style>
                <div className={`absolute inset-0 bg-gradient-to-br ${tierColors.bg} opacity-100 rounded-3xl`} />

                <div className="relative z-10 flex flex-col items-center gap-2">
                    {/* Tier badge */}
                    <div className={`absolute top-0 right-0 ${tierColors.text} font-black uppercase tracking-widest flex items-center gap-1 rounded-bl-2xl rounded-tr-3xl bg-black/20 ${sc.badge}`}>
                        <span>✦</span>
                        <span>{xpData.tier}</span>
                    </div>

                    {/* Habit icon */}
                    <motion.div
                        className={`${sc.icon} leading-none mt-2`}
                        animate={isMaster ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        {habit.icon}
                    </motion.div>

                    {/* Habit name */}
                    <h3 className={`font-black ${tierColors.text} ${sc.name} text-center leading-tight`}>
                        {habit.name}
                    </h3>

                    {/* Tier title */}
                    <p className={`${tierColors.text} opacity-80 font-bold ${sc.title} text-center`}>
                        {title}
                    </p>

                    {/* XP Progress bar */}
                    <div className="w-full mt-1">
                        <div className={`w-full bg-black/20 rounded-full ${sc.bar} overflow-hidden`}>
                            <motion.div
                                className="h-full bg-white/70 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${animatedProgress}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                            />
                        </div>
                        <div className={`flex justify-between mt-1 ${tierColors.text} opacity-70 ${sc.xp} font-bold`}>
                            <span>{xpData.xp.toLocaleString()} XP</span>
                            {nextTier ? (
                                <span>{nextTierXP.toLocaleString()} XP</span>
                            ) : (
                                <span className="flex items-center gap-1"><Star size={10} /> MAX</span>
                            )}
                        </div>
                    </div>

                    {/* Details row */}
                    {showDetails && (
                        <div className="flex items-center gap-3 mt-1 w-full justify-center">
                            <div className={`flex items-center gap-1 ${tierColors.text} opacity-80 ${sc.xp} font-bold`}>
                                <Flame size={size === 'sm' ? 10 : 12} className="text-orange-300" />
                                <span>{xpData.streak}d</span>
                            </div>
                            <div className="w-px h-4 bg-white/30" />
                            <div className={`flex items-center gap-1 ${tierColors.text} opacity-80 ${sc.xp} font-bold`}>
                                <Zap size={size === 'sm' ? 10 : 12} className="text-yellow-300" />
                                <span>×{xpData.totalCompletions}</span>
                            </div>
                            {xpData.bestStreak > 0 && (
                                <>
                                    <div className="w-px h-4 bg-white/30" />
                                    <div className={`flex items-center gap-1 ${tierColors.text} opacity-70 ${sc.xp} font-bold`}>
                                        <span>Best {xpData.bestStreak}d</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Complete button */}
                    {onComplete && (
                        <button
                            onClick={onComplete}
                            className={`mt-2 w-full py-1.5 rounded-2xl bg-white/20 hover:bg-white/30 active:bg-white/40 font-bold ${sc.title} ${tierColors.text} transition-all border border-white/30`}
                        >
                            + Log Today
                        </button>
                    )}
                </div>
            </div>

            {/* Tier-up sparkle burst */}
            <AnimatePresence>
                {showSparkle && particles.map(p => (
                    <motion.div
                        key={p.id}
                        className="absolute pointer-events-none rounded-full"
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            top: '50%',
                            left: '50%',
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                            x: Math.cos((p.angle * Math.PI) / 180) * p.speed * 2,
                            y: Math.sin((p.angle * Math.PI) / 180) * p.speed * 2,
                            opacity: 0,
                            scale: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}

export default HabitXPCard;
