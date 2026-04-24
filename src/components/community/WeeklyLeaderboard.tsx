import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown, Flame, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { LeaderboardEntry, WeeklyLeaderboardData, HabitCardTier } from '../../lib/communityApi';
import { fetchHabitLeaderboard, fetchGlobalLeaderboard } from '../../lib/communityApi';

// ─── Inline fallback type guards (types already imported above) ───────────────
// Re-exported so downstream consumers can use them without importing communityApi
export type { LeaderboardEntry, WeeklyLeaderboardData, HabitCardTier };

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WeeklyLeaderboardProps {
    communityHabitSlug?: string;
    guildId?: string;
    maxEntries?: number;
    compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Hex colors used for inline styles (badge backgrounds) in this component. */
const TIER_HEX: Record<HabitCardTier, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#fbbf24',
    Platinum: '#6ee7b7',
    Diamond: '#93c5fd',
    Master: '#c084fc',
};

const RANK_BADGE: Record<number, { bg: string; text: string }> = {
    1: { bg: '#fbbf24', text: '#78350f' },
    2: { bg: '#c0c0c0', text: '#374151' },
    3: { bg: '#cd7f32', text: '#fff7ed' },
};

function avatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=E6DDF2`;
}

function formatWeekRange(isoDate: string): string {
    const start = new Date(isoDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 p-4 animate-pulse">
            <div className="w-8 h-5 bg-gray-200 dark:bg-night-border rounded" />
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-night-border" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 dark:bg-night-border rounded w-32" />
                <div className="h-2.5 bg-gray-100 dark:bg-night-border/60 rounded w-20" />
            </div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-night-border rounded" />
        </div>
    );
}

interface PodiumSeatProps {
    entry: LeaderboardEntry;
    place: 1 | 2 | 3;
}

function PodiumSeat({ entry, place }: PodiumSeatProps) {
    const heights: Record<1 | 2 | 3, string> = { 1: 'h-16', 2: 'h-10', 3: 'h-7' };
    const tierColor = TIER_HEX[entry.tier];
    const seed = entry.avatarSeed ?? entry.displayName;

    return (
        <div className="flex flex-col items-center gap-1 flex-1">
            {place === 1 && (
                <span className="text-2xl leading-none mb-1" title="Champion">👑</span>
            )}
            <div className="relative">
                <img
                    src={avatarUrl(seed)}
                    alt={entry.displayName}
                    className="w-14 h-14 rounded-full border-2 border-white dark:border-night-surface shadow-md bg-surface dark:bg-night-bg"
                    style={{ borderColor: tierColor }}
                />
                <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow"
                    style={{ background: RANK_BADGE[place]?.bg, color: RANK_BADGE[place]?.text }}
                >
                    {place}
                </div>
            </div>
            <p className="text-xs font-bold text-dark dark:text-night-text text-center truncate w-full max-w-[80px] mt-1">
                {entry.displayName}
            </p>
            <p className="text-[11px] font-black text-primary dark:text-primary-light">
                {entry.score.toLocaleString()}
            </p>
            <div
                className={`${heights[place]} w-full rounded-t-xl mt-1 opacity-80`}
                style={{ background: RANK_BADGE[place]?.bg }}
            />
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WeeklyLeaderboard({
    communityHabitSlug,
    maxEntries = 20,
    compact = false,
}: WeeklyLeaderboardProps) {
    const { user } = useAuth();
    const [data, setData] = useState<WeeklyLeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        const fetcher = communityHabitSlug
            ? fetchHabitLeaderboard(communityHabitSlug)
            : fetchGlobalLeaderboard();

        fetcher
            .then(d => { if (!cancelled) { setData(d); } })
            .catch(e => {
                if (!cancelled) {
                    setData(null);
                    setError(e instanceof Error ? e.message : 'Failed to load leaderboard');
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [communityHabitSlug]);

    const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'You';
    const entries = (data?.entries ?? [])
        .slice(0, maxEntries)
        .map(e => (e.isCurrentUser ? { ...e, displayName } : e));

    const [first, second, third] = entries;
    const restEntries = compact ? entries : entries.slice(3);

    const weekRange = data ? formatWeekRange(data.weekStart) : '—';
    const title = communityHabitSlug ? 'Habit Leaderboard' : 'Weekly Leaderboard';

    return (
        <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors">
            {error && (
                <div className="mx-5 mt-5 mb-0 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-3 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                    <Shield size={14} className="flex-shrink-0" />
                    <span className="flex-1 min-w-0">{error}</span>
                    <button
                        type="button"
                        className="underline font-bold flex-shrink-0"
                        onClick={() => {
                            setLoading(true);
                            setError(null);
                            const fetcher = communityHabitSlug
                                ? fetchHabitLeaderboard(communityHabitSlug)
                                : fetchGlobalLeaderboard();
                            fetcher
                                .then(setData)
                                .catch(e => {
                                    setData(null);
                                    setError(e instanceof Error ? e.message : 'Failed to load leaderboard');
                                })
                                .finally(() => setLoading(false));
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2 transition-colors">
                        <Trophy size={18} className="text-primary dark:text-primary-light" />
                        {title}
                    </h2>
                    <p className="text-xs text-dark-lighter dark:text-night-text-muted mt-0.5 transition-colors">
                        {weekRange}
                    </p>
                </div>
                {data && (
                    <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                            Participants
                        </p>
                        <p className="text-sm font-black text-dark dark:text-night-text transition-colors">
                            {data.totalParticipants.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Top 3 Podium (non-compact) */}
            {!compact && !loading && first && second && third && (
                <div className="px-5 pb-2 pt-1">
                    <div className="flex items-end justify-center gap-2 py-2">
                        <PodiumSeat entry={second} place={2} />
                        <PodiumSeat entry={first} place={1} />
                        <PodiumSeat entry={third} place={3} />
                    </div>
                </div>
            )}

            {/* Divider */}
            {!compact && !loading && <div className="h-px bg-[#D4C8E8] dark:bg-night-border mx-5 transition-colors" />}

            {/* Rankings list */}
            <div className="divide-y divide-[#D4C8E8]/50 dark:divide-night-border/50">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : !error && restEntries.length === 0 && (
                        <p className="text-center text-dark-lighter dark:text-night-text-muted text-sm py-10 px-6 transition-colors">
                            No data yet — be the first to complete this habit this week! 🏆
                        </p>
                    )
                }

                <AnimatePresence>
                    {!loading && restEntries.map((entry, idx) => {
                        const rank = compact ? entry.rank : entry.rank;
                        const seed = entry.avatarSeed ?? entry.displayName;
                        const isTop3 = rank <= 3;
                        const rankStyle = RANK_BADGE[rank as 1 | 2 | 3];
                        const tierColor = TIER_HEX[entry.tier];

                        return (
                            <motion.div
                                key={entry.userId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`flex items-center gap-3 px-4 py-3 transition-colors group
                                    ${entry.isCurrentUser
                                        ? 'bg-primary/5 dark:bg-primary/10'
                                        : 'hover:bg-primary/[0.04] dark:hover:bg-primary/[0.06]'
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-9 flex flex-col items-center gap-0.5 flex-shrink-0">
                                    {isTop3 && rankStyle ? (
                                        <span
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                                            style={{ background: rankStyle.bg, color: rankStyle.text }}
                                        >
                                            {rank}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-black text-dark-lighter dark:text-night-text-muted transition-colors">
                                            #{rank}
                                        </span>
                                    )}
                                    {entry.movement === 'up' && <ArrowUp size={11} className="text-green-500" />}
                                    {entry.movement === 'down' && <ArrowDown size={11} className="text-red-400" />}
                                    {entry.movement === 'same' && <div className="w-3 h-[2px] bg-gray-300 dark:bg-night-border rounded-full" />}
                                </div>

                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={avatarUrl(seed)}
                                        alt={entry.displayName}
                                        className="w-9 h-9 rounded-full bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border transition-colors"
                                    />
                                </div>

                                {/* Name + tier */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate transition-colors
                                        ${entry.isCurrentUser ? 'text-primary dark:text-primary-light' : 'text-dark dark:text-night-text'}`}>
                                        {entry.displayName}
                                        {entry.isCurrentUser && <span className="font-normal opacity-70"> (You)</span>}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                                            style={{ background: tierColor }}
                                        >
                                            {entry.tier}
                                        </span>
                                        <span className="text-[10px] text-dark-lighter dark:text-night-text-muted transition-colors">
                                            {entry.completions} done
                                        </span>
                                    </div>
                                </div>

                                {/* Score + streak */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {entry.streak > 2 && (
                                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-lg">
                                            <Flame size={10} /> {entry.streak}
                                        </span>
                                    )}
                                    <div className="text-right">
                                        <p className="text-sm font-black text-dark dark:text-night-text transition-colors">
                                            {entry.score.toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                                            pts
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#D4C8E8]/60 dark:border-night-border/60 transition-colors">
                <p className="text-[10px] text-dark-lighter dark:text-night-text-muted text-center transition-colors">
                    Resets every Monday midnight UTC
                </p>
            </div>
        </div>
    );
}

export default WeeklyLeaderboard;
