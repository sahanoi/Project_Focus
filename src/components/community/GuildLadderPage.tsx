import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Info, Shield } from 'lucide-react';
import type { Guild, GuildTier } from '../../lib/communityApi';
import { GUILD_TIER_COLORS, fetchGuildLadder } from '../../lib/communityApi';

const TIERS: GuildTier[] = ['Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Iron'];

const TIER_META: Record<GuildTier, { icon: string; threshold: string }> = {
    Master:   { icon: '👑', threshold: '50,000+ weekly XP' },
    Diamond:  { icon: '💠', threshold: '25,000+ weekly XP' },
    Platinum: { icon: '💎', threshold: '10,000+ weekly XP' },
    Gold:     { icon: '🥇', threshold: '5,000+ weekly XP' },
    Silver:   { icon: '🥈', threshold: '2,000+ weekly XP' },
    Bronze:   { icon: '🥉', threshold: '500+ weekly XP' },
    Iron:     { icon: '⚙️', threshold: '0+ weekly XP' },
};

interface XpBarProps {
    value: number;
    max: number;
    color: string;
}

function XpBar({ value, max, color }: XpBarProps) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="flex-1 max-w-28 h-2 rounded-full bg-gray-200 dark:bg-night-bg overflow-hidden">
            <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
            />
        </div>
    );
}

function LadderSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface p-6 animate-pulse"
                >
                    <div className="h-6 bg-gray-200 dark:bg-night-bg rounded-lg w-1/4 mb-4" />
                    {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-4 mb-3 last:mb-0">
                            <div className="w-8 h-5 bg-gray-200 dark:bg-night-bg rounded flex-shrink-0" />
                            <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-night-bg flex-shrink-0" />
                            <div className="flex-1 h-4 bg-gray-200 dark:bg-night-bg rounded" />
                            <div className="w-28 h-4 bg-gray-200 dark:bg-night-bg rounded" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function GuildLadderContent() {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryToken, setRetryToken] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchGuildLadder()
            .then(setGuilds)
            .catch(e => {
                setGuilds([]);
                setError(e instanceof Error ? e.message : 'Failed to load ladder');
            })
            .finally(() => setLoading(false));
    }, [retryToken]);

    const guildsByTier: Record<GuildTier, Guild[]> = {
        Master: [], Diamond: [], Platinum: [], Gold: [], Silver: [], Bronze: [], Iron: [],
    };
    guilds.forEach((g) => {
        guildsByTier[g.ladderTier].push(g);
    });
    TIERS.forEach((tier) => {
        guildsByTier[tier].sort((a, b) => b.weeklyXp - a.weeklyXp);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-dark dark:text-night-text tracking-tight transition-colors">
                            Guild Ladder
                        </h2>
                        <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                            Season 1 • 14 days remaining
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                    <Shield size={16} className="flex-shrink-0" />
                    <span className="flex-1 min-w-0">{error}</span>
                    <button
                        type="button"
                        onClick={() => setRetryToken(t => t + 1)}
                        className="underline font-bold flex-shrink-0"
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <LadderSkeleton />
            ) : error ? null : (
                <div className="space-y-4">
                    {TIERS.map((tier, tierIdx) => {
                        const tierGuilds = guildsByTier[tier];
                        const meta = TIER_META[tier];
                        const tierColor = GUILD_TIER_COLORS[tier];
                        const maxXp = tierGuilds.length > 0
                            ? Math.max(...tierGuilds.map((g) => g.weeklyXp))
                            : 1;

                        return (
                            <motion.div
                                key={tier}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: tierIdx * 0.06 }}
                                className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface overflow-hidden transition-colors"
                            >
                                {/* Tier band header */}
                                <div
                                    className="px-6 py-3 flex items-center justify-between"
                                    style={{ backgroundColor: `${tierColor}20` }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{meta.icon}</span>
                                        <span className="font-black text-dark dark:text-night-text text-base tracking-wide transition-colors">
                                            {tier}
                                        </span>
                                        <span
                                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{ color: tierColor, backgroundColor: `${tierColor}22` }}
                                        >
                                            {meta.threshold}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-dark-lighter dark:text-night-text-muted transition-colors">
                                        {tierGuilds.length} guild{tierGuilds.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Guild rows */}
                                {tierGuilds.length === 0 ? (
                                    <div className="px-6 py-4 text-sm text-dark-lighter dark:text-night-text-muted italic transition-colors">
                                        No guilds at this tier yet
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#D4C8E8]/50 dark:divide-night-border/50">
                                        {tierGuilds.map((guild, idx) => (
                                            <div
                                                key={guild.id}
                                                className="px-6 py-3 flex items-center gap-4 hover:bg-surface dark:hover:bg-night-bg transition-colors"
                                            >
                                                {/* Rank within tier */}
                                                <span className="w-7 text-sm font-black text-dark-lighter dark:text-night-text-muted text-center flex-shrink-0 transition-colors">
                                                    #{idx + 1}
                                                </span>

                                                {/* Guild icon */}
                                                <div className="w-8 h-8 rounded-xl bg-surface dark:bg-night-bg flex items-center justify-center text-lg flex-shrink-0 transition-colors">
                                                    {guild.icon}
                                                </div>

                                                {/* Guild info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-bold text-dark dark:text-night-text truncate transition-colors">
                                                            {guild.name}
                                                        </span>
                                                        {guild.communityHabitName && (
                                                            <span className="text-xs text-dark-lighter dark:text-night-text-muted flex-shrink-0 transition-colors">
                                                                {guild.communityHabitIcon} {guild.communityHabitName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                                                        <Users size={10} />
                                                        <span>{guild.memberCount} members</span>
                                                    </div>
                                                </div>

                                                {/* XP bar + value */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <XpBar value={guild.weeklyXp} max={maxXp} color={tierColor} />
                                                    <span className="text-sm font-black text-dark dark:text-night-text w-24 text-right transition-colors">
                                                        {guild.weeklyXp.toLocaleString()} XP
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* How Ladder Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface p-6 transition-colors"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Info size={18} className="text-primary dark:text-primary-light flex-shrink-0" />
                    <h3 className="text-lg font-black text-dark dark:text-night-text tracking-wide transition-colors">
                        How the Ladder Works
                    </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-dark-lighter dark:text-night-text-muted transition-colors">
                    <li>🏆 Guilds earn XP every week when members complete their habits.</li>
                    <li>📈 Each completed habit adds XP to your guild's weekly total.</li>
                    <li>🔼 Guilds advance tiers by crossing weekly XP thresholds at season end.</li>
                    <li>🔽 Low-activity guilds can be demoted to lower tiers.</li>
                    <li>🗓️ Seasons reset every 4 weeks — ranks reset, but earned tier carries over.</li>
                </ul>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['Master', 'Diamond', 'Gold', 'Iron'] as GuildTier[]).map((tier) => (
                        <div
                            key={tier}
                            className="p-3 rounded-2xl bg-surface dark:bg-night-bg text-center transition-colors"
                        >
                            <div className="text-2xl mb-1">{TIER_META[tier].icon}</div>
                            <div className="text-xs font-black text-dark dark:text-night-text transition-colors">{tier}</div>
                            <div className="text-[10px] text-dark-lighter dark:text-night-text-muted transition-colors leading-snug">
                                {TIER_META[tier].threshold}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default GuildLadderContent;
