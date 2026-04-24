import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { FeedEvent, FeedEventType } from '../../lib/communityApi';
import { fetchSocialFeed } from '../../lib/communityApi';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SocialFeedPanelProps {
    maxEvents?: number;
    showRefresh?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=E6DDF2`;
}

interface EventConfig {
    icon: string;
    bgColor: string;
    textColor: string;
}

const EVENT_CONFIG: Record<FeedEventType, EventConfig> = {
    habit_completed: { icon: '✅', bgColor: 'bg-green-100 dark:bg-green-500/15', textColor: 'text-green-600 dark:text-green-400' },
    level_up:        { icon: '⭐', bgColor: 'bg-yellow-100 dark:bg-yellow-500/15', textColor: 'text-yellow-600 dark:text-yellow-400' },
    streak_milestone: { icon: '🔥', bgColor: 'bg-orange-100 dark:bg-orange-500/15', textColor: 'text-orange-600 dark:text-orange-400' },
    guild_joined:    { icon: '⚔️', bgColor: 'bg-indigo-100 dark:bg-indigo-500/15', textColor: 'text-indigo-600 dark:text-indigo-400' },
    tier_up:         { icon: '✨', bgColor: 'bg-purple-100 dark:bg-purple-500/15', textColor: 'text-purple-600 dark:text-purple-400' },
    challenge_completed: { icon: '🏆', bgColor: 'bg-blue-100 dark:bg-blue-500/15', textColor: 'text-blue-600 dark:text-blue-400' },
};

function buildEventMessage(event: FeedEvent): { main: string; detail?: string } {
    const habit = event.communityHabitIcon
        ? `${event.communityHabitIcon} ${event.communityHabitName ?? ''}`
        : (event.communityHabitName ?? '');

    switch (event.eventType) {
        case 'habit_completed':
            return { main: `completed ${habit}` };
        case 'level_up':
            return { main: `reached Level ${String(event.metadata.level ?? '?')} 🎉` };
        case 'streak_milestone':
            return {
                main: `hit a ${String(event.metadata.days ?? '?')}-day streak on ${habit} 🔥`,
                detail: `${String(event.metadata.days ?? '?')}-day streak`,
            };
        case 'guild_joined':
            return { main: `joined the ⚔️ ${event.guildName ?? 'Unknown'} guild` };
        case 'tier_up':
            return { main: `upgraded to ${String(event.metadata.tier ?? '?')} tier on ${habit} ✨` };
        case 'challenge_completed':
            return { main: `completed a challenge on ${habit} 🏆` };
    }
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-night-surface p-5 rounded-3xl border border-[#D4C8E8] dark:border-night-border flex items-start gap-4 animate-pulse transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-night-border flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between gap-4">
                    <div className="h-3.5 bg-gray-200 dark:bg-night-border rounded w-48" />
                    <div className="h-3 bg-gray-100 dark:bg-night-border/60 rounded w-14" />
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-night-border/60 rounded w-32" />
            </div>
        </div>
    );
}

// ─── Feed card ────────────────────────────────────────────────────────────────

interface FeedCardProps {
    event: FeedEvent;
    index: number;
}

function FeedCard({ event, index }: FeedCardProps) {
    const config = EVENT_CONFIG[event.eventType];
    const seed = event.avatarSeed ?? event.displayName;
    const { main, detail } = buildEventMessage(event);
    const timeAgo = formatDistanceToNow(new Date(event.createdAt), { addSuffix: true });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-night-surface p-5 rounded-3xl border border-[#D4C8E8] dark:border-night-border transition-colors flex items-start gap-4 group"
        >
            {/* Avatar + event icon overlay */}
            <div className="relative flex-shrink-0">
                <img
                    src={avatarUrl(seed)}
                    alt={event.displayName}
                    className="w-12 h-12 rounded-2xl bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border transition-colors"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px] border-2 border-white dark:border-night-surface ${config.bgColor} transition-colors`}>
                    {config.icon}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-0.5">
                    <p className="text-sm font-bold text-dark dark:text-night-text transition-colors leading-snug">
                        <span className="text-primary dark:text-primary-light">{event.displayName}</span>
                        {' '}
                        <span className="font-normal text-dark-lighter dark:text-night-text-muted">{main}</span>
                    </p>
                    <span className="text-xs text-dark-lighter dark:text-night-text-muted whitespace-nowrap flex-shrink-0 transition-colors">
                        {timeAgo}
                    </span>
                </div>
                {detail && (
                    <p className={`text-xs font-medium mt-1 ${config.textColor} transition-colors`}>{detail}</p>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SocialFeedPanel({ maxEvents = 30, showRefresh = true }: SocialFeedPanelProps) {
    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await fetchSocialFeed();
            setEvents(data.slice(0, maxEvents));
        } catch (e) {
            setEvents([]);
            setError(e instanceof Error ? e.message : 'Failed to load feed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [maxEvents]);

    useEffect(() => { void load(); }, [load]);

    return (
        <div className="flex flex-col gap-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2 transition-colors">
                    <Activity size={18} className="text-primary dark:text-primary-light transition-colors" />
                    Live Feed
                </h2>
                {showRefresh && (
                    <button
                        onClick={() => void load(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 text-sm font-bold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary disabled:opacity-50 transition-colors"
                        aria-label="Refresh feed"
                    >
                        <RefreshCw
                            size={14}
                            className={refreshing ? 'animate-spin' : ''}
                        />
                        Refresh
                    </button>
                )}
            </div>

            {/* Feed list */}
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                        <Shield size={16} className="flex-shrink-0" />
                        <span className="flex-1 min-w-0">{error}</span>
                        <button
                            type="button"
                            onClick={() => void load(false)}
                            className="underline font-bold flex-shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : !error && (
                        <AnimatePresence mode="popLayout">
                            {events.map((event, idx) => (
                                <FeedCard key={event.id} event={event} index={idx} />
                            ))}
                        </AnimatePresence>
                    )
                }

                {!loading && !error && events.length === 0 && (
                    <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-10 text-center transition-colors">
                        <p className="text-dark-lighter dark:text-night-text-muted text-sm">
                            No activity yet. Follow friends to see their progress here! 👋
                        </p>
                    </div>
                )}

                {/* End of feed */}
                {!loading && !error && events.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: events.length * 0.05 + 0.1 }}
                        className="text-center py-6 text-dark-lighter dark:text-night-text-muted text-sm font-medium flex items-center justify-center gap-2 opacity-60 transition-colors"
                    >
                        <Shield size={16} />
                        You're all caught up!
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default SocialFeedPanel;
