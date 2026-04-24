import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, ChevronRight } from 'lucide-react';
import type { Guild, GuildTier } from '../../lib/communityApi';
import { GUILD_TIER_COLORS } from '../../lib/communityApi';

const TIER_ICONS: Record<GuildTier, string> = {
    Iron: '⚙️',
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '💠',
    Master: '👑',
};

interface GuildCardProps {
    guild: Guild;
    onJoin?: (id: string) => void;
    onViewDetail?: (id: string) => void;
    compact?: boolean;
}

export default function GuildCard({ guild, onJoin, onViewDetail, compact = false }: GuildCardProps) {
    const tierColor = GUILD_TIER_COLORS[guild.ladderTier];
    const tierIcon = TIER_ICONS[guild.ladderTier];
    const isOwner = guild.userRole === 'owner';
    const isMember = guild.isMember;
    const isFull = guild.memberCount >= guild.maxMembers;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => onViewDetail?.(guild.id)}
            className={`rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface transition-colors cursor-pointer ${compact ? 'p-3' : 'p-5'}`}
        >
            {/* Top section */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                        className={`flex-shrink-0 flex items-center justify-center rounded-2xl bg-surface dark:bg-night-bg transition-colors ${compact ? 'w-10 h-10 text-2xl' : 'w-12 h-12 text-3xl'}`}
                    >
                        {guild.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3
                            className={`font-black text-dark dark:text-night-text tracking-tight truncate transition-colors ${compact ? 'text-sm' : 'text-base'}`}
                        >
                            {guild.name}
                        </h3>
                        {guild.communityHabitName && (
                            <span className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                                {guild.communityHabitIcon} {guild.communityHabitName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Tier badge */}
                <div
                    className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ml-2"
                    style={{ backgroundColor: tierColor }}
                >
                    <span>{tierIcon}</span>
                    {!compact && <span>{guild.ladderTier}</span>}
                </div>
            </div>

            {/* Description */}
            {!compact && guild.description && (
                <p className="text-xs text-dark-lighter dark:text-night-text-muted mb-3 line-clamp-1 transition-colors">
                    {guild.description}
                </p>
            )}

            {/* Stats row */}
            <div className={`flex items-center gap-4 ${compact ? 'mb-2' : 'mb-4'}`}>
                <div className="flex items-center gap-1 text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                    <Users size={11} />
                    <span className="font-semibold">{guild.memberCount.toLocaleString()}</span>
                    {!compact && <span>/ {guild.maxMembers}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                    <Star size={11} className="text-amber-400" />
                    <span className="font-semibold">{guild.weeklyXp.toLocaleString()}</span>
                    {!compact && <span className="text-[10px]">XP / wk</span>}
                </div>
            </div>

            {/* Bottom action */}
            {!compact && (
                <div
                    className="flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                >
                    {isOwner ? (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 transition-colors">
                            👑 Owner
                        </span>
                    ) : isMember ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 transition-colors">
                            ✓ Member
                        </span>
                    ) : (
                        <button
                            onClick={() => onJoin?.(guild.id)}
                            disabled={isFull}
                            className="text-xs font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-xl transition-colors"
                        >
                            {isFull ? 'Guild Full' : 'Join Guild'}
                        </button>
                    )}
                    <ChevronRight size={16} className="text-dark-lighter dark:text-night-text-muted transition-colors" />
                </div>
            )}
        </motion.div>
    );
}
