import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Star, Calendar, Crown, Shield } from 'lucide-react';
import type { Guild, GuildMember, GuildTier } from '../../lib/communityApi';
import { GUILD_TIER_COLORS, fetchGuildDetail, joinGuild, leaveGuild } from '../../lib/communityApi';

const TIER_ICONS: Record<GuildTier, string> = {
    Iron: '⚙️',
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '💠',
    Master: '👑',
};

const TOP3_MEDALS = ['🥇', '🥈', '🥉'];

interface MemberRowProps {
    member: GuildMember;
    rank: number;
}

function MemberRow({ member, rank }: MemberRowProps) {
    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(member.displayName)}&backgroundColor=E6DDF2`;
    const isTop3 = rank <= 3;

    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                member.isCurrentUser
                    ? 'bg-primary/5 dark:bg-[rgb(63_54_82)]'
                    : 'hover:bg-surface dark:hover:bg-night-bg'
            }`}
        >
            {/* Rank */}
            <div className="w-8 text-center text-sm font-black flex-shrink-0 text-dark-lighter dark:text-night-text-muted transition-colors">
                {isTop3 ? TOP3_MEDALS[rank - 1] : `#${rank}`}
            </div>

            {/* Avatar */}
            <img
                src={avatarUrl}
                alt={member.displayName}
                className="w-9 h-9 rounded-full bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border flex-shrink-0"
            />

            {/* Name + role */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`text-sm font-bold truncate transition-colors ${
                            member.isCurrentUser
                                ? 'text-primary dark:text-primary-light'
                                : 'text-dark dark:text-night-text'
                        }`}
                    >
                        {member.displayName}
                        {member.isCurrentUser && ' (You)'}
                    </span>
                    {member.role === 'owner' && <span className="text-xs flex-shrink-0">👑</span>}
                    {member.role === 'admin' && <span className="text-xs flex-shrink-0">⭐</span>}
                </div>
                <span className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                    {member.totalXp.toLocaleString()} total XP
                </span>
            </div>

            {/* Weekly XP */}
            <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-dark dark:text-night-text transition-colors">
                    {member.weeklyXp.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider">
                    XP / wk
                </div>
            </div>
        </div>
    );
}

interface GuildDetailPageProps {
    guild: Guild;
    onBack: () => void;
    onJoined?: () => void;
}

export default function GuildDetailPage({ guild: initialGuild, onBack, onJoined }: GuildDetailPageProps) {
    const [guild, setGuild] = useState<Guild>(initialGuild);
    const [members, setMembers] = useState<GuildMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [retryToken, setRetryToken] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setLoadError(null);
        fetchGuildDetail(initialGuild.id)
            .then(({ guild: g, members: m }) => {
                if (!cancelled) {
                    setGuild(g);
                    setMembers(m);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setLoadError(e instanceof Error ? e.message : 'Failed to load guild');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [initialGuild.id, retryToken]);

    const handleJoin = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await joinGuild(guild.id);
            setGuild((g) => ({ ...g, isMember: true, userRole: 'member', memberCount: g.memberCount + 1 }));
            onJoined?.();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Could not join guild');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            await leaveGuild(guild.id);
            setGuild((g) => ({
                ...g,
                isMember: false,
                userRole: undefined,
                memberCount: Math.max(0, g.memberCount - 1),
            }));
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Could not leave guild');
        } finally {
            setActionLoading(false);
        }
    };

    const tierColor = GUILD_TIER_COLORS[guild.ladderTier];
    const tierIcon = TIER_ICONS[guild.ladderTier];
    const sortedMembers = [...members].sort((a, b) => b.weeklyXp - a.weeklyXp);
    const topContributor = sortedMembers[0];
    const avgContrib = members.length > 0 ? Math.round(guild.totalXp / members.length) : 0;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold text-dark-lighter dark:text-night-text-muted hover:text-dark dark:hover:text-night-text transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Guilds
            </button>

            {loadError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 flex-wrap">
                    <Shield size={16} className="flex-shrink-0" />
                    <span className="flex-1 min-w-0">{loadError}</span>
                    <button
                        type="button"
                        onClick={() => setRetryToken(t => t + 1)}
                        className="underline font-bold"
                    >
                        Retry
                    </button>
                </div>
            )}

            {actionError && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-3 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
                    <Shield size={14} />
                    {actionError}
                </div>
            )}

            {/* Hero banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl overflow-hidden border border-[#D4C8E8] dark:border-night-border"
            >
                {/* Banner */}
                <div
                    className="p-8 flex flex-col items-center text-center"
                    style={{ backgroundColor: guild.bannerColor }}
                >
                    <div className="text-6xl mb-3">{guild.icon}</div>
                    <h1 className="text-3xl font-black text-white mb-2 drop-shadow">{guild.name}</h1>
                    <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold text-white/90 bg-white/20"
                    >
                        <span>{tierIcon}</span>
                        <span>{guild.ladderTier}</span>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="bg-white dark:bg-night-surface p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 transition-colors">
                    {[
                        { value: guild.memberCount, label: 'Members', icon: <Users size={14} className="text-primary" /> },
                        { value: `${guild.weeklyXp.toLocaleString()} XP`, label: 'This Week', icon: <Star size={14} className="text-amber-400" /> },
                        { value: `${guild.totalXp.toLocaleString()} XP`, label: 'Total XP', icon: <Star size={14} className="text-indigo-400" /> },
                        { value: `${tierIcon} ${guild.ladderTier}`, label: 'Tier', icon: null },
                    ].map(({ value, label, icon }) => (
                        <div key={label} className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                {icon}
                            </div>
                            <div className="text-lg font-black text-dark dark:text-night-text transition-colors">
                                {value}
                            </div>
                            <div className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action button */}
                <div className="bg-white dark:bg-night-surface px-4 pb-5 flex justify-center transition-colors">
                    {guild.userRole === 'owner' ? (
                        <span className="px-6 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-bold transition-colors">
                            👑 You own this guild
                        </span>
                    ) : guild.isMember ? (
                        <button
                            onClick={handleLeave}
                            disabled={actionLoading}
                            className="px-6 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-bold disabled:opacity-50 transition-colors"
                        >
                            {actionLoading ? 'Leaving...' : 'Leave Guild'}
                        </button>
                    ) : (
                        <button
                            onClick={handleJoin}
                            disabled={actionLoading || guild.memberCount >= guild.maxMembers}
                            className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold disabled:opacity-50 transition-colors"
                        >
                            {actionLoading
                                ? 'Joining...'
                                : guild.memberCount >= guild.maxMembers
                                ? 'Guild is Full'
                                : '⚔️ Join Guild'}
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: About + Leaderboard */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface p-6 transition-colors"
                    >
                        <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4 transition-colors">
                            About
                        </h2>
                        {guild.description ? (
                            <p className="text-sm text-dark-lighter dark:text-night-text-muted mb-4 leading-relaxed transition-colors">
                                {guild.description}
                            </p>
                        ) : (
                            <p className="text-sm text-dark-lighter dark:text-night-text-muted mb-4 italic transition-colors">
                                No description provided.
                            </p>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Crown size={14} className="text-amber-400 flex-shrink-0" />
                                <span className="text-dark-lighter dark:text-night-text-muted transition-colors">Owner:</span>
                                <span className="font-bold text-dark dark:text-night-text transition-colors">
                                    {guild.ownerName}
                                </span>
                            </div>
                            {guild.communityHabitName && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="flex-shrink-0">{guild.communityHabitIcon}</span>
                                    <span className="text-dark-lighter dark:text-night-text-muted transition-colors">Focus habit:</span>
                                    <span className="font-bold text-dark dark:text-night-text transition-colors">
                                        {guild.communityHabitName}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-dark-lighter dark:text-night-text-muted flex-shrink-0" />
                                <span className="text-dark-lighter dark:text-night-text-muted transition-colors">Created:</span>
                                <span className="font-bold text-dark dark:text-night-text transition-colors">
                                    {new Date(guild.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Leaderboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface p-6 transition-colors"
                    >
                        <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4 transition-colors flex items-center gap-2">
                            <Star size={18} className="text-amber-400" />
                            This Week's Leaderboard
                        </h2>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-8 h-5 bg-gray-200 dark:bg-night-bg rounded" />
                                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-night-bg flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-4 bg-gray-200 dark:bg-night-bg rounded-lg w-1/2" />
                                            <div className="h-3 bg-gray-200 dark:bg-night-bg rounded-lg w-1/3" />
                                        </div>
                                        <div className="h-5 bg-gray-200 dark:bg-night-bg rounded w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedMembers.length === 0 ? (
                            <p className="text-center text-dark-lighter dark:text-night-text-muted py-8 transition-colors">
                                No members yet 🏰
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {sortedMembers.map((member, i) => (
                                    <MemberRow key={member.userId} member={member} rank={i + 1} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right: Stats */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface p-6 transition-colors"
                    >
                        <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4 transition-colors">
                            Guild Stats
                        </h2>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-surface dark:bg-night-bg transition-colors">
                                <div className="text-2xl font-black text-dark dark:text-night-text transition-colors">
                                    {guild.totalXp.toLocaleString()}
                                </div>
                                <div className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                                    Total XP Earned
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-surface dark:bg-night-bg transition-colors">
                                <div className="text-2xl font-black text-dark dark:text-night-text transition-colors">
                                    {avgContrib.toLocaleString()}
                                </div>
                                <div className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                                    Avg. Contribution
                                </div>
                            </div>

                            {topContributor && (
                                <div className="p-4 rounded-2xl bg-surface dark:bg-night-bg transition-colors">
                                    <div className="text-sm font-black text-dark dark:text-night-text truncate transition-colors">
                                        🏆 {topContributor.displayName}
                                    </div>
                                    <div className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                                        Top This Week
                                    </div>
                                    <div className="text-xs text-primary dark:text-primary-light font-bold mt-1">
                                        {topContributor.weeklyXp.toLocaleString()} XP
                                    </div>
                                </div>
                            )}

                            <div
                                className="p-4 rounded-2xl bg-surface dark:bg-night-bg transition-colors"
                            >
                                <div
                                    className="text-2xl font-black"
                                    style={{ color: tierColor }}
                                >
                                    {tierIcon} {guild.ladderTier}
                                </div>
                                <div className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                                    Current Tier
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
