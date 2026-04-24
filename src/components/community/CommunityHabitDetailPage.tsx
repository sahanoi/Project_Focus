import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, Trophy, Flame, Target, Zap, TrendingUp,
    ChevronRight, UserPlus, UserMinus, Shield,
} from 'lucide-react';
import {
    CommunityHabit,
    CommunityHabitXP,
    WeeklyLeaderboardData,
    Guild,
    HabitCardTier,
    TIER_COLORS,
    fetchCommunityHabitDetail,
    fetchHabitLeaderboard,
    fetchGuilds,
    joinCommunityHabit,
    leaveCommunityHabit,
    joinGuild,
} from '../../lib/communityApi';
import HabitXPCard from './HabitXPCard';

// ==========================================
// Skeleton loaders
// ==========================================

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-night-border rounded-xl ${className ?? ''}`} />
    );
}

function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-5 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
        </div>
    );
}

// ==========================================
// Leaderboard row
// ==========================================

interface LeaderboardRowProps {
    rank: number;
    displayName: string;
    score: number;
    streak: number;
    tier: HabitCardTier;
    isCurrentUser: boolean;
    movement: 'up' | 'down' | 'same';
    avatarSeed?: string;
}

function LeaderboardRow({ rank, displayName, score, streak, tier, isCurrentUser, movement, avatarSeed }: LeaderboardRowProps) {
    const tierColors = TIER_COLORS[tier];
    const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-dark-lighter dark:text-night-text-muted';
    const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 border-b border-[#D4C8E8]/40 dark:border-night-border/40 last:border-0 transition-colors ${isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-surface dark:hover:bg-primary/5'}`}>
            <div className="w-8 text-center">
                {rankEmoji ? (
                    <span className="text-lg">{rankEmoji}</span>
                ) : (
                    <span className={`text-sm font-black ${rankColor}`}>#{rank}</span>
                )}
            </div>

            <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed ?? displayName}&backgroundColor=E6DDF2`}
                alt={displayName}
                className="w-8 h-8 rounded-full border border-[#D4C8E8] dark:border-night-border bg-surface flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-primary dark:text-primary-light' : 'text-dark dark:text-night-text'}`}>
                    {displayName} {isCurrentUser && '(You)'}
                </p>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r ${tierColors.bg} ${tierColors.text}`}>
                        {tier}
                    </span>
                    {streak > 0 && (
                        <span className="text-[10px] flex items-center gap-0.5 text-orange-500 font-bold">
                            <Flame size={9} /> {streak}d
                        </span>
                    )}
                </div>
            </div>

            <div className="text-right flex items-center gap-2">
                <div>
                    <p className="text-sm font-black text-dark dark:text-night-text">{score.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider">XP</p>
                </div>
                {movement === 'up' && <TrendingUp size={12} className="text-green-500" />}
                {movement === 'down' && <TrendingUp size={12} className="text-red-400 rotate-180" />}
            </div>
        </div>
    );
}

// ==========================================
// Guild card
// ==========================================

interface GuildCardProps {
    guild: Guild;
    onJoin: (id: string) => void;
    joining: boolean;
}

function GuildCard({ guild, onJoin, joining }: GuildCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-night-surface rounded-2xl border border-[#D4C8E8] dark:border-night-border p-4 flex items-center gap-3 transition-colors"
        >
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: guild.bannerColor + '33' }}
            >
                {guild.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-dark dark:text-night-text text-sm truncate">{guild.name}</p>
                <p className="text-xs text-dark-lighter dark:text-night-text-muted truncate">{guild.description}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-dark-lighter dark:text-night-text-muted flex items-center gap-1">
                        <Users size={9} /> {guild.memberCount}/{guild.maxMembers}
                    </span>
                    <span className="text-[10px] text-dark-lighter dark:text-night-text-muted flex items-center gap-1">
                        <Zap size={9} /> {guild.weeklyXp.toLocaleString()} /wk
                    </span>
                </div>
            </div>
            {!guild.isMember && (
                <button
                    onClick={() => onJoin(guild.id)}
                    disabled={joining}
                    className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                    {joining ? '...' : 'Join'}
                </button>
            )}
            {guild.isMember && (
                <span className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900">
                    Joined ✓
                </span>
            )}
        </motion.div>
    );
}

// ==========================================
// Stat card
// ==========================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    highlight?: boolean;
}

function StatCard({ icon, label, value, sub, highlight }: StatCardProps) {
    return (
        <div className={`rounded-2xl border p-4 flex flex-col gap-1 transition-colors ${highlight ? 'bg-primary/5 border-primary/30 dark:bg-primary/10 dark:border-primary/40' : 'bg-white dark:bg-night-surface border-[#D4C8E8] dark:border-night-border'}`}>
            <div className={`text-sm ${highlight ? 'text-primary dark:text-primary-light' : 'text-dark-lighter dark:text-night-text-muted'}`}>{icon}</div>
            <p className="text-xl font-black text-dark dark:text-night-text">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider">{label}</p>
            {sub && <p className="text-[10px] text-dark-lighter dark:text-night-text-muted">{sub}</p>}
        </div>
    );
}

// ==========================================
// Main Component
// ==========================================

interface CommunityHabitDetailPageProps {
    slug: string;
    onBack: () => void;
}

export function CommunityHabitDetailPage({ slug, onBack }: CommunityHabitDetailPageProps) {
    const [habit, setHabit] = useState<CommunityHabit | null>(null);
    const [xpData, setXpData] = useState<CommunityHabitXP | null>(null);
    const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardData | null>(null);
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [joiningGuildId, setJoiningGuildId] = useState<string | null>(null);
    const [communityMilestone] = useState({ total: 1_000_000, current: 423851, label: 'glasses total' });

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [detailData, lb, guildData] = await Promise.all([
                fetchCommunityHabitDetail(slug),
                fetchHabitLeaderboard(slug),
                fetchGuilds(),
            ]);
            const habitData = detailData.habit;
            setHabit(habitData);
            setXpData(detailData.userXp);
            setLeaderboard(lb);
            setGuilds(guildData.filter(g => g.communityHabitId === habitData.id || !g.communityHabitId).slice(0, 4));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load habit');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleToggleJoin = async () => {
        if (!habit) return;
        setJoining(true);
        setActionError(null);
        try {
            if (habit.isJoined) {
                await leaveCommunityHabit(slug);
                setHabit(h => h ? { ...h, isJoined: false, participantCount: Math.max(0, h.participantCount - 1) } : h);
            } else {
                await joinCommunityHabit(slug);
                setHabit(h => h ? { ...h, isJoined: true, participantCount: h.participantCount + 1 } : h);
            }
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Could not update membership');
        } finally {
            setJoining(false);
        }
    };

    const handleJoinGuild = async (guildId: string) => {
        setJoiningGuildId(guildId);
        setActionError(null);
        try {
            await joinGuild(guildId);
            setGuilds(gs => gs.map(g => g.id === guildId ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g));
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Could not join guild');
        } finally {
            setJoiningGuildId(null);
        }
    };

    const milestonePercent = Math.min(100, Math.round((communityMilestone.current / communityMilestone.total) * 100));

    return (
        <div className="h-full flex flex-col bg-surface dark:bg-night-bg overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-night-surface border-b border-[#D4C8E8] dark:border-night-border px-6 py-4 transition-colors">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-dark-lighter dark:text-night-text-muted hover:text-dark dark:hover:text-night-text text-sm font-bold mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Community
                    </button>

                    {loading ? (
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-14 h-14 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                        </div>
                    ) : habit ? (
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-surface dark:bg-night-bg flex items-center justify-center text-3xl flex-shrink-0 border border-[#D4C8E8] dark:border-night-border transition-colors">
                                {habit.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-black text-dark dark:text-night-text tracking-tight">{habit.name}</h1>
                                <p className="text-sm text-dark-lighter dark:text-night-text-muted mt-0.5">{habit.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs font-bold text-dark-lighter dark:text-night-text-muted flex items-center gap-1">
                                        <Users size={12} /> {habit.participantCount.toLocaleString()} participants
                                    </span>
                                    <span className="text-xs font-bold text-dark-lighter dark:text-night-text-muted capitalize bg-surface dark:bg-night-bg px-2 py-0.5 rounded-full border border-[#D4C8E8] dark:border-night-border">
                                        {habit.category}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleToggleJoin}
                                disabled={joining}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${habit.isJoined
                                    ? 'bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900'
                                    : 'bg-primary text-white hover:bg-primary-dark'
                                } disabled:opacity-50`}
                            >
                                {joining ? '...' : habit.isJoined ? (
                                    <><UserMinus size={14} /> Leave</>
                                ) : (
                                    <><UserPlus size={14} /> Join</>
                                )}
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            {/* Error state */}
            {error && (
                <div className="max-w-3xl mx-auto px-6 pt-6 w-full">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                        <Shield size={16} /> {error}
                        <button onClick={loadData} className="ml-auto underline font-bold">Retry</button>
                    </div>
                </div>
            )}

            {actionError && !error && (
                <div className="max-w-3xl mx-auto px-6 pt-4 w-full">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-3 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
                        <Shield size={14} /> {actionError}
                    </div>
                </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-6 space-y-8">

                    {/* Your Card */}
                    <section>
                        <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4">Your Card</h2>
                        {loading || !habit || !xpData ? (
                            <div className="flex justify-center">
                                <Skeleton className="h-64 w-72 rounded-3xl" />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <HabitXPCard habit={habit} xpData={xpData} size="lg" showDetails />
                            </div>
                        )}
                    </section>

                    {/* Stats row */}
                    <section>
                        <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4">This Week</h2>
                        {loading || !xpData || !leaderboard ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard icon={<Trophy size={16} />} label="Your Rank" value={`#${leaderboard.userRank ?? '—'}`} sub={`of ${leaderboard.totalParticipants.toLocaleString()}`} highlight />
                                <StatCard icon={<Target size={16} />} label="Completions" value={xpData.totalCompletions} sub="all time" />
                                <StatCard icon={<Flame size={16} />} label="Streak" value={`${xpData.streak}d`} sub={`Best: ${xpData.bestStreak}d`} />
                                <StatCard icon={<Users size={16} />} label="Community" value={habit?.totalCompletionsThisWeek.toLocaleString() ?? '—'} sub="this week" />
                            </div>
                        )}
                    </section>

                    {/* Community Milestone */}
                    {habit && (
                        <section>
                            <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4">Community Milestone</h2>
                            <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border p-5 transition-colors">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-dark dark:text-night-text">
                                            {communityMilestone.current.toLocaleString()} / {communityMilestone.total.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-dark-lighter dark:text-night-text-muted mt-0.5">
                                            {habit.name} {communityMilestone.label}
                                        </p>
                                    </div>
                                    <span className="text-2xl font-black text-primary dark:text-primary-light">{milestonePercent}%</span>
                                </div>
                                <div className="h-3 bg-surface dark:bg-night-bg rounded-full overflow-hidden border border-[#D4C8E8] dark:border-night-border">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${milestonePercent}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                                    />
                                </div>
                                <p className="text-xs text-dark-lighter dark:text-night-text-muted mt-2 font-medium">
                                    🏆 Goal: {communityMilestone.total.toLocaleString()} {communityMilestone.label} — keep going!
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Weekly Leaderboard */}
                    <section>
                        <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4">Weekly Leaderboard</h2>
                        {loading || !leaderboard ? (
                            <CardSkeleton />
                        ) : leaderboard.entries.length === 0 ? (
                            <div className="text-center py-8 text-dark-lighter dark:text-night-text-muted text-sm">No entries yet this week.</div>
                        ) : (
                            <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors">
                                {leaderboard.entries.map((entry, i) => (
                                    <motion.div
                                        key={entry.userId}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <LeaderboardRow
                                            rank={entry.rank}
                                            displayName={entry.displayName}
                                            score={entry.score}
                                            streak={entry.streak}
                                            tier={entry.tier}
                                            isCurrentUser={entry.isCurrentUser}
                                            movement={entry.movement}
                                            avatarSeed={entry.avatarSeed}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Guilds */}
                    {guilds.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide">Active Guilds</h2>
                                <button className="text-sm font-bold text-primary dark:text-primary-light hover:text-primary-dark transition-colors flex items-center gap-1">
                                    View all <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {guilds.map(guild => (
                                    <GuildCard
                                        key={guild.id}
                                        guild={guild}
                                        onJoin={handleJoinGuild}
                                        joining={joiningGuildId === guild.id}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="pb-8" />
                </div>
            </div>
        </div>
    );
}

export default CommunityHabitDetailPage;
