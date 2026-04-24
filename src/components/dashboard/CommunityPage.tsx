import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
    Globe, Trophy, Users, Activity, Shield, ChevronRight,
    TrendingUp, UserPlus, Flame, Zap,
} from 'lucide-react';
import {
    type Guild,
    CommunityHabit,
    FeedEvent,
    FeedEventType,
    WeeklyLeaderboardData,
    HabitCardTier,
    TIER_COLORS,
    fetchCommunityHabits,
    fetchGlobalLeaderboard,
    fetchSocialFeed,
    joinCommunityHabit,
    leaveCommunityHabit,
} from '../../lib/communityApi';
import HabitXPCard from '../community/HabitXPCard';
import { CommunityHabitDetailPage } from '../community/CommunityHabitDetailPage';
import { GuildBrowserPageContent } from '../community/GuildBrowserPage';
import GuildDetailPage from '../community/GuildDetailPage';

// ==========================================
// Constants & helpers
// ==========================================

type CommunityTab = 'habits' | 'leaderboard' | 'guilds' | 'feed';

const CATEGORY_FILTERS = ['All', 'Health', 'Fitness', 'Learning', 'Productivity', 'Mindfulness'];

const FEED_EVENT_CONFIG: Record<FeedEventType, { icon: string; build: (e: FeedEvent) => string }> = {
    habit_completed: { icon: '✅', build: e => `${e.displayName} completed ${e.communityHabitIcon ?? ''} ${e.communityHabitName ?? 'a habit'}` },
    level_up:        { icon: '🏆', build: e => `${e.displayName} leveled up in ${e.communityHabitIcon ?? ''} ${e.communityHabitName ?? 'a habit'} → Lv.${(e.metadata.level as number) ?? '?'}` },
    streak_milestone:{ icon: '🔥', build: e => `${e.displayName} hit a ${(e.metadata.streak as number) ?? '?'}-day streak on ${e.communityHabitIcon ?? ''} ${e.communityHabitName ?? 'a habit'}!` },
    guild_joined:    { icon: '⚔️', build: e => `${e.displayName} joined the guild "${e.guildName ?? 'a guild'}"` },
    guild_created:  { icon: '⚔️', build: e => `${e.displayName} created the guild "${(e.metadata.guildName as string) ?? e.guildName ?? 'a guild'}"` },
    tier_up:         { icon: '✨', build: e => `${e.displayName} reached ${(e.metadata.tier as string) ?? ''} tier in ${e.communityHabitIcon ?? ''} ${e.communityHabitName ?? 'a habit'}!` },
    challenge_completed: { icon: '🎯', build: e => `${e.displayName} completed the ${(e.metadata.challengeName as string) ?? 'challenge'}!` },
};

const FEED_EVENT_FALLBACK = { icon: '💬', build: (e: FeedEvent) => `${e.displayName} had community activity` };

// ==========================================
// Subcomponents
// ==========================================

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 dark:bg-night-border rounded-xl ${className ?? ''}`} />;
}

interface HabitBrowserCardProps {
    habit: CommunityHabit;
    onClick: () => void;
    onToggleJoin: (slug: string) => void;
    joining: boolean;
}

function HabitBrowserCard({ habit, onClick, onToggleJoin, joining }: HabitBrowserCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            onClick={onClick}
            className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-4 cursor-pointer group transition-colors hover:shadow-md"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-surface dark:bg-night-bg flex items-center justify-center text-2xl flex-shrink-0 border border-[#D4C8E8] dark:border-night-border transition-colors">
                    {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark dark:text-night-text text-sm group-hover:text-primary dark:group-hover:text-primary-light transition-colors leading-tight">
                        {habit.name}
                    </h3>
                    <p className="text-[10px] font-bold uppercase text-dark-lighter dark:text-night-text-muted mt-0.5 capitalize">{habit.category}</p>
                </div>
            </div>

            <p className="text-xs text-dark-lighter dark:text-night-text-muted mb-3 line-clamp-2 leading-relaxed">{habit.description}</p>

            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted flex items-center gap-1">
                    <Users size={10} /> {habit.participantCount.toLocaleString()}
                </span>
                <button
                    onClick={e => { e.stopPropagation(); onToggleJoin(habit.slug); }}
                    disabled={joining}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 ${habit.isJoined
                        ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                >
                    {joining ? '...' : habit.isJoined ? 'Joined ✓' : 'Join'}
                </button>
            </div>
        </motion.div>
    );
}

interface PodiumEntryProps {
    rank: 1 | 2 | 3;
    displayName: string;
    score: number;
    tier: HabitCardTier;
    avatarSeed?: string;
    isCurrentUser: boolean;
}

function PodiumEntry({ rank, displayName, score, tier, avatarSeed, isCurrentUser }: PodiumEntryProps) {
    const tierColors = TIER_COLORS[tier];
    const heights = { 1: 'h-20', 2: 'h-14', 3: 'h-10' };
    const rankMedals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const borderColors = { 1: 'border-yellow-400', 2: 'border-gray-400', 3: 'border-amber-600' };

    return (
        <div className={`flex flex-col items-center gap-2 ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
            <span className="text-xl">{rankMedals[rank]}</span>
            <div className="relative">
                <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed ?? displayName}&backgroundColor=E6DDF2`}
                    alt={displayName}
                    className={`w-12 h-12 rounded-full border-2 ${borderColors[rank]} ${isCurrentUser ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                />
                <div className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1 py-0.5 rounded-full bg-gradient-to-r ${tierColors.bg} ${tierColors.text} border border-white dark:border-night-surface`}>
                    {tier.slice(0, 2)}
                </div>
            </div>
            <p className={`text-xs font-bold text-center max-w-[72px] truncate ${isCurrentUser ? 'text-primary dark:text-primary-light' : 'text-dark dark:text-night-text'}`}>
                {displayName}
            </p>
            <p className="text-xs font-black text-dark-lighter dark:text-night-text-muted">{score.toLocaleString()}</p>
            <div className={`w-16 ${heights[rank]} rounded-t-xl bg-gradient-to-b ${rank === 1 ? 'from-yellow-300 to-yellow-500' : rank === 2 ? 'from-gray-300 to-gray-400' : 'from-amber-500 to-amber-700'} opacity-60`} />
        </div>
    );
}

function FeedCard({ event, index }: { event: FeedEvent; index: number }) {
    const config = FEED_EVENT_CONFIG[event.eventType] ?? FEED_EVENT_FALLBACK;
    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-white dark:bg-night-surface p-4 rounded-3xl border border-[#D4C8E8] dark:border-night-border transition-colors flex items-start gap-3"
        >
            <div className="w-10 h-10 rounded-2xl bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border flex items-center justify-center text-xl flex-shrink-0 transition-colors">
                {config.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-dark dark:text-night-text leading-snug">{config.build(event)}</p>
                    <span className="text-[10px] text-dark-lighter dark:text-night-text-muted whitespace-nowrap flex-shrink-0 mt-0.5">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${event.avatarSeed ?? event.userId}&backgroundColor=E6DDF2`}
                        alt={event.displayName}
                        className="w-5 h-5 rounded-full border border-[#D4C8E8] dark:border-night-border"
                    />
                    <span className="text-[11px] text-dark-lighter dark:text-night-text-muted font-medium">{event.displayName}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ==========================================
// Tabs
// ==========================================

function HabitsTab() {
    const [habits, setHabits] = useState<CommunityHabit[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [category, setCategory] = useState('All');
    const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
    const [detailSlug, setDetailSlug] = useState<string | null>(null);

    const loadHabits = useCallback(() => {
        setLoading(true);
        setLoadError(null);
        fetchCommunityHabits()
            .then(data => { setHabits(data); })
            .catch(e => { setLoadError(e instanceof Error ? e.message : 'Failed to load habits'); })
            .finally(() => { setLoading(false); });
    }, []);

    useEffect(() => { loadHabits(); }, [loadHabits]);

    const handleToggleJoin = useCallback(async (slug: string) => {
        setJoiningSlug(slug);
        setJoinError(null);
        const habit = habits.find(h => h.slug === slug);
        try {
            if (habit?.isJoined) {
                await leaveCommunityHabit(slug);
                setHabits(hs => hs.map(h => h.slug === slug ? { ...h, isJoined: false, participantCount: Math.max(0, h.participantCount - 1) } : h));
            } else {
                await joinCommunityHabit(slug);
                setHabits(hs => hs.map(h => h.slug === slug ? { ...h, isJoined: true, participantCount: h.participantCount + 1 } : h));
            }
        } catch (e) {
            setJoinError(e instanceof Error ? e.message : 'Could not update membership');
        } finally {
            setJoiningSlug(null);
        }
    }, [habits]);

    if (detailSlug) {
        return <CommunityHabitDetailPage slug={detailSlug} onBack={() => setDetailSlug(null)} />;
    }

    const joinedFeatured = habits.filter(h => h.isJoined && h.isFeatured);
    const filteredHabits = habits.filter(h => category === 'All' || h.category.toLowerCase() === category.toLowerCase());

    return (
        <div className="space-y-8">
            {loadError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 flex-wrap">
                    <Shield size={16} /> {loadError}
                    <button type="button" onClick={loadHabits} className="ml-auto underline font-bold">Retry</button>
                </div>
            )}
            {joinError && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-3 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
                    <Shield size={14} /> {joinError}
                </div>
            )}
            {/* My Featured Cards */}
            {joinedFeatured.length > 0 && (
                <section>
                    <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4">Your Active Habits</h2>
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
                        {joinedFeatured.map(habit => (
                            <div key={habit.id} className="flex-shrink-0" onClick={() => setDetailSlug(habit.slug)}>
                                {/* We render a lightweight preview card since xpData loading would be too heavy here */}
                                <div className="w-40 bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-4 cursor-pointer hover:shadow-md transition-all group">
                                    <div className="text-4xl text-center mb-2">{habit.icon}</div>
                                    <p className="text-xs font-black text-dark dark:text-night-text text-center truncate group-hover:text-primary dark:group-hover:text-primary-light transition-colors">{habit.name}</p>
                                    <p className="text-[10px] text-dark-lighter dark:text-night-text-muted text-center mt-1 font-medium">
                                        <Users size={9} className="inline mr-1" />{habit.participantCount.toLocaleString()}
                                    </p>
                                    <div className="mt-2 text-center">
                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                                            Joined ✓
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Category filter */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide">All Community Habits</h2>
                </div>
                <div className="flex gap-2 flex-wrap mb-5">
                    {CATEGORY_FILTERS.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${category === cat
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white dark:bg-night-surface text-dark-lighter dark:text-night-text-muted border border-[#D4C8E8] dark:border-night-border hover:border-primary/50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-4 space-y-3">
                                <div className="flex gap-3">
                                    <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                        ))}
                    </div>
                ) : loadError ? null : filteredHabits.length === 0 ? (
                    <div className="text-center py-12 text-dark-lighter dark:text-night-text-muted">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="font-bold text-dark dark:text-night-text">No habits found</p>
                        <p className="text-sm mt-1">Try a different category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredHabits.map((habit, i) => (
                            <motion.div key={habit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <HabitBrowserCard
                                    habit={habit}
                                    onClick={() => setDetailSlug(habit.slug)}
                                    onToggleJoin={handleToggleJoin}
                                    joining={joiningSlug === habit.slug}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function LeaderboardTab() {
    const [data, setData] = useState<WeeklyLeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scope, setScope] = useState<'global' | 'friends'>('global');

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        const req = scope === 'friends' ? fetchGlobalLeaderboard('friends') : fetchGlobalLeaderboard('global');
        req
            .then(d => { setData(d); })
            .catch(e => { setData(null); setError(e instanceof Error ? e.message : 'Failed to load leaderboard'); })
            .finally(() => { setLoading(false); });
    }, [scope]);

    useEffect(() => { load(); }, [load, scope]);

    const podiumEntries = data?.entries.slice(0, 3) ?? [];
    const listEntries = data?.entries.slice(3) ?? [];

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                    <Shield size={16} /> {error}
                    <button type="button" onClick={load} className="ml-auto underline font-bold">Retry</button>
                </div>
            )}
            {/* Scope selector */}
            <div className="flex items-center gap-3">
                {(['global', 'friends'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setScope(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${scope === s
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white dark:bg-night-surface text-dark-lighter dark:text-night-text-muted border border-[#D4C8E8] dark:border-night-border hover:border-primary/50'
                        }`}
                    >
                        {s === 'global' ? '🌍 Global' : '👥 Friends'}
                    </button>
                ))}
                {data && (
                    <span className="ml-auto text-xs text-dark-lighter dark:text-night-text-muted font-medium">
                        {data.totalParticipants.toLocaleString()} participants
                    </span>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-night-surface rounded-2xl border border-[#D4C8E8] dark:border-night-border p-4 flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                            <Skeleton className="w-16 h-6" />
                        </div>
                    ))}
                </div>
            ) : data ? (
                <>
                    {/* Podium */}
                    <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-6 transition-colors">
                        <h3 className="text-sm font-black text-dark-lighter dark:text-night-text-muted uppercase tracking-widest text-center mb-6">Top 3 This Week</h3>
                        <div className="flex items-end justify-center gap-6">
                            {podiumEntries.map((entry) => {
                                const r = (entry.rank >= 1 && entry.rank <= 3 ? entry.rank : 1) as 1 | 2 | 3;
                                return (
                                    <PodiumEntry
                                        key={entry.userId}
                                        rank={r}
                                        displayName={entry.displayName}
                                        score={entry.score}
                                        tier={entry.tier}
                                        avatarSeed={entry.avatarSeed}
                                        isCurrentUser={entry.isCurrentUser}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Ranked list */}
                    <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors">
                        {listEntries.map((entry, i) => {
                            const tierColors = TIER_COLORS[entry.tier];
                            return (
                                <motion.div
                                    key={entry.userId}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={`flex items-center gap-3 px-4 py-3 border-b border-[#D4C8E8]/40 dark:border-night-border/40 last:border-0 transition-colors ${entry.isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-surface dark:hover:bg-primary/5'}`}
                                >
                                    <div className="w-8 text-center">
                                        <span className="text-sm font-black text-dark-lighter dark:text-night-text-muted">#{entry.rank}</span>
                                    </div>
                                    <img
                                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${entry.avatarSeed ?? entry.userId}&backgroundColor=E6DDF2`}
                                        alt={entry.displayName}
                                        className="w-9 h-9 rounded-full border border-[#D4C8E8] dark:border-night-border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${entry.isCurrentUser ? 'text-primary dark:text-primary-light' : 'text-dark dark:text-night-text'}`}>
                                            {entry.displayName} {entry.isCurrentUser && '(You)'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r ${tierColors.bg} ${tierColors.text}`}>
                                                {entry.tier}
                                            </span>
                                            {entry.streak > 0 && (
                                                <span className="text-[10px] flex items-center gap-0.5 text-orange-500 font-bold">
                                                    <Flame size={9} /> {entry.streak}d
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-dark dark:text-night-text">{entry.score.toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider">XP</p>
                                    </div>
                                    {entry.movement === 'up' && <TrendingUp size={12} className="text-green-500" />}
                                    {entry.movement === 'down' && <TrendingUp size={12} className="text-red-400 rotate-180" />}
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            ) : null}
        </div>
    );
}

function FeedTab() {
    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFeed = useCallback(() => {
        setLoading(true);
        setError(null);
        fetchSocialFeed()
            .then(data => { setEvents(data); })
            .catch(e => { setEvents([]); setError(e instanceof Error ? e.message : 'Failed to load feed'); })
            .finally(() => { setLoading(false); });
    }, []);

    useEffect(() => { loadFeed(); }, [loadFeed]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2">
                    <Activity size={18} className="text-primary dark:text-primary-light" />
                    Live Feed
                </h2>
                <button
                    type="button"
                    onClick={loadFeed}
                    className="text-sm font-bold text-primary dark:text-primary-light hover:text-primary-dark transition-colors"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                    <Shield size={16} /> {error}
                    <button type="button" onClick={loadFeed} className="ml-auto underline font-bold">Retry</button>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-4 flex gap-3">
                            <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? null : events.length === 0 ? (
                <div className="text-center py-12 text-dark-lighter dark:text-night-text-muted">
                    <div className="text-4xl mb-2">💤</div>
                    <p className="font-bold text-dark dark:text-night-text">No activity yet</p>
                    <p className="text-sm mt-1">Add friends and join habits to see their activity here.</p>
                </div>
            ) : (
                <>
                    {events.map((event, i) => (
                        <FeedCard key={event.id} event={event} index={i} />
                    ))}
                    <div className="text-center py-6 text-dark-lighter dark:text-night-text-muted text-sm font-medium flex items-center justify-center gap-2 opacity-60">
                        <Shield size={16} />
                        You're all caught up!
                    </div>
                </>
            )}
        </div>
    );
}

// ==========================================
// Season countdown helper (static mock)
// ==========================================

function useSeasonCountdown() {
    const [label, setLabel] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const diff = end.getTime() - now.getTime();
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            setLabel(`${days}d ${hours}h`);
        };
        update();
        const t = setInterval(update, 60000);
        return () => clearInterval(t);
    }, []);

    return label;
}

// ==========================================
// Main CommunityPage
// ==========================================

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<CommunityTab>('habits');
    const [viewGuild, setViewGuild] = useState<Guild | null>(null);
    const [headerLb, setHeaderLb] = useState<{ userRank: number | null; total: number } | null>(null);
    const seasonCountdown = useSeasonCountdown();

    useEffect(() => {
        if (activeTab !== 'guilds') setViewGuild(null);
    }, [activeTab]);

    useEffect(() => {
        let cancelled = false;
        fetchGlobalLeaderboard('global')
            .then((d) => {
                if (!cancelled) {
                    setHeaderLb({ userRank: d.userRank ?? null, total: d.totalParticipants });
                }
            })
            .catch(() => {
                if (!cancelled) setHeaderLb(null);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const tabs: { id: CommunityTab; label: string; icon: React.ReactNode }[] = [
        { id: 'habits',      label: 'Habits',      icon: <Zap size={15} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={15} /> },
        { id: 'guilds',      label: 'Guilds',      icon: <Users size={15} /> },
        { id: 'feed',        label: 'Feed',         icon: <Activity size={15} /> },
    ];

    return (
        <div className="h-full flex flex-col bg-surface dark:bg-night-bg overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-night-surface border-b border-[#D4C8E8] dark:border-night-border px-6 lg:px-8 py-5 transition-colors">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <div className="w-10 h-10 rounded-xl bg-primary-dark flex items-center justify-center text-white transition-colors">
                                    <Globe size={20} />
                                </div>
                                <h1 className="text-3xl font-black text-dark dark:text-night-text tracking-tight transition-colors">Community</h1>
                            </div>
                            <p className="text-dark-lighter dark:text-night-text-muted text-sm transition-colors">Compete, share, and stay accountable with the world.</p>
                        </div>

                        <div className="flex items-center gap-4 bg-surface dark:bg-night-bg px-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border transition-colors">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-0.5 transition-colors">Season 1 Ends</p>
                                <p className="text-dark dark:text-night-text font-black tracking-tight transition-colors">{seasonCountdown || '—'}</p>
                            </div>
                            <div className="w-[1px] h-8 bg-[#D4C8E8] dark:bg-night-border mx-1 transition-colors" />
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-0.5 transition-colors">Global Rank</p>
                                <p className="text-primary dark:text-primary-light font-black tracking-tight flex items-center gap-1 transition-colors">
                                    <Trophy size={13} />
                                    {headerLb === null
                                        ? '…'
                                        : headerLb.userRank != null
                                        ? `#${headerLb.userRank}`
                                        : 'Unranked'}
                                </p>
                                {headerLb != null && headerLb.total > 0 && (
                                    <p className="text-[9px] text-dark-lighter dark:text-night-text-muted font-medium">
                                        of {headerLb.total.toLocaleString()} this week
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1 bg-surface dark:bg-night-bg rounded-2xl p-1 border border-[#D4C8E8] dark:border-night-border w-fit transition-colors">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-night-surface text-primary dark:text-primary-light shadow-sm'
                                    : 'text-dark-lighter dark:text-night-text-muted hover:text-dark dark:hover:text-night-text'
                                }`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'habits'      && <HabitsTab />}
                            {activeTab === 'leaderboard' && <LeaderboardTab />}
                            {activeTab === 'guilds'      && (viewGuild ? (
                                <GuildDetailPage guild={viewGuild} onBack={() => setViewGuild(null)} />
                            ) : (
                                <GuildBrowserPageContent onSelectGuild={setViewGuild} />
                            ))}
                            {activeTab === 'feed'        && <FeedTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
