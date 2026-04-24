import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flame, ChevronDown, ChevronUp, MoreVertical, Check, X, UserMinus, Shield } from 'lucide-react';
import type { Friend } from '../../lib/communityApi';
import { fetchFriends, acceptFriendRequest, removeFriend } from '../../lib/communityApi';
import FriendRequestModal from './FriendRequestModal';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FriendsPanelProps {
    compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=E6DDF2`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonFriendRow() {
    return (
        <div className="flex items-center gap-3 p-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-night-border flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 dark:bg-night-border rounded w-28" />
                <div className="h-2.5 bg-gray-100 dark:bg-night-border/60 rounded w-20" />
            </div>
            <div className="h-8 w-20 bg-gray-100 dark:bg-night-border/60 rounded-xl" />
        </div>
    );
}

// ─── Overflow menu ────────────────────────────────────────────────────────────

interface OverflowMenuProps {
    onRemove: () => void;
    removing: boolean;
}

function OverflowMenu({ onRemove, removing }: OverflowMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(p => !p)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-dark-lighter dark:text-night-text-muted hover:bg-gray-100 dark:hover:bg-night-border transition-colors"
                aria-label="More options"
            >
                <MoreVertical size={15} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-night-surface rounded-2xl shadow-lg border border-[#D4C8E8] dark:border-night-border overflow-hidden"
                        >
                            <button
                                onClick={() => { onRemove(); setOpen(false); }}
                                disabled={removing}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            >
                                <UserMinus size={14} />
                                Remove friend
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Pending request row ──────────────────────────────────────────────────────

interface PendingRowProps {
    friend: Friend;
    onAccept: (userId: string) => Promise<void>;
    onDecline: (userId: string) => void;
}

function PendingRequestRow({ friend, onAccept, onDecline }: PendingRowProps) {
    const [accepting, setAccepting] = useState(false);
    const seed = friend.avatarSeed ?? friend.displayName;

    const handleAccept = async () => {
        setAccepting(true);
        try { await onAccept(friend.userId); } finally { setAccepting(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#D4C8E8]/50 dark:border-night-border/50 last:border-0 transition-colors"
        >
            <img
                src={avatarUrl(seed)}
                alt={friend.displayName}
                className="w-9 h-9 rounded-full bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border transition-colors flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark dark:text-night-text truncate transition-colors">
                    {friend.displayName}
                </p>
                <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">Wants to be friends</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => void handleAccept()}
                    disabled={accepting}
                    className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    aria-label="Accept request"
                >
                    {accepting ? <span className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
                </button>
                <button
                    onClick={() => onDecline(friend.userId)}
                    className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                    aria-label="Decline request"
                >
                    <X size={14} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Accepted friend row ──────────────────────────────────────────────────────

interface FriendRowProps {
    friend: Friend;
    onRemove: (userId: string) => Promise<void>;
}

function FriendRow({ friend, onRemove }: FriendRowProps) {
    const [removing, setRemoving] = useState(false);
    const seed = friend.avatarSeed ?? friend.displayName;

    const handleRemove = async () => {
        setRemoving(true);
        try { await onRemove(friend.userId); } finally { setRemoving(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#D4C8E8]/50 dark:border-night-border/50 last:border-0 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.05] transition-colors group"
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <img
                    src={avatarUrl(seed)}
                    alt={friend.displayName}
                    className="w-10 h-10 rounded-full bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dark dark:bg-night-border text-white dark:text-night-text text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-night-surface transition-colors">
                    {friend.level}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark dark:text-night-text truncate transition-colors">
                    {friend.displayName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">
                        {friend.weeklyXp.toLocaleString()} XP this week
                    </span>
                    {friend.mutualHabits.length > 0 && (
                        <span className="text-[10px] text-dark-lighter dark:text-night-text-muted transition-colors">
                            · {friend.mutualHabits.length} shared
                        </span>
                    )}
                </div>
            </div>

            {/* Streak badge (mock: level * 2 as streak proxy) */}
            {friend.level > 3 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-lg">
                    <Flame size={10} /> {friend.level * 2}
                </span>
            )}

            <OverflowMenu onRemove={() => void handleRemove()} removing={removing} />
        </motion.div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FriendsPanel({ compact = false }: FriendsPanelProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [pendingExpanded, setPendingExpanded] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await fetchFriends();
            setFriends(data);
        } catch (e) {
            setFriends([]);
            setLoadError(e instanceof Error ? e.message : 'Failed to load friends');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const accepted = friends.filter(f => f.status === 'accepted');
    const incoming = friends.filter(f => f.status === 'pending_received');
    const outgoing = friends.filter(f => f.status === 'pending_sent');

    const handleAccept = async (userId: string) => {
        setMutationError(null);
        try {
            await acceptFriendRequest(userId);
            setFriends(prev =>
                prev.map(f => f.userId === userId ? { ...f, status: 'accepted' as const } : f)
            );
        } catch (e) {
            setMutationError(e instanceof Error ? e.message : 'Could not accept request');
        }
    };

    const handleDecline = (userId: string) => {
        setFriends(prev => prev.filter(f => f.userId !== userId));
    };

    const handleRemove = async (userId: string) => {
        setMutationError(null);
        try {
            await removeFriend(userId);
            setFriends(prev => prev.filter(f => f.userId !== userId));
        } catch (e) {
            setMutationError(e instanceof Error ? e.message : 'Could not remove friend');
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border overflow-hidden transition-colors">
                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-[#D4C8E8]/60 dark:border-night-border/60 transition-colors">
                    <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2 transition-colors">
                        <Users size={18} className="text-indigo-500 dark:text-indigo-400 transition-colors" />
                        Friends
                        {accepted.length > 0 && (
                            <span className="text-sm font-bold text-dark-lighter dark:text-night-text-muted transition-colors">
                                ({accepted.length})
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors flex items-center gap-1.5"
                    >
                        <span className="text-base leading-none">+</span>
                        Add Friend
                    </button>
                </div>

                {loadError && (
                    <div className="px-5 py-3 border-b border-[#D4C8E8]/60 dark:border-night-border/60 bg-red-50/80 dark:bg-red-950/20">
                        <div className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                            <Shield size={14} className="flex-shrink-0" />
                            <span className="flex-1 min-w-0">{loadError}</span>
                            <button type="button" onClick={() => void load()} className="underline font-bold flex-shrink-0">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {mutationError && (
                    <div className="px-5 py-2 border-b border-[#D4C8E8]/60 dark:border-night-border/60 bg-amber-50/80 dark:bg-amber-950/20">
                        <p className="text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
                            <Shield size={12} /> {mutationError}
                        </p>
                    </div>
                )}

                {/* Incoming pending requests */}
                {!loading && !loadError && incoming.length > 0 && (
                    <div className="border-b border-[#D4C8E8]/60 dark:border-night-border/60 transition-colors">
                        <button
                            onClick={() => setPendingExpanded(p => !p)}
                            className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-night-border/20 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-dark dark:text-night-text transition-colors">
                                    Friend Requests
                                </span>
                                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                                    {incoming.length}
                                </span>
                            </div>
                            {pendingExpanded
                                ? <ChevronUp size={16} className="text-dark-lighter dark:text-night-text-muted" />
                                : <ChevronDown size={16} className="text-dark-lighter dark:text-night-text-muted" />
                            }
                        </button>

                        <AnimatePresence>
                            {pendingExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <AnimatePresence>
                                        {incoming.map(f => (
                                            <PendingRequestRow
                                                key={f.id}
                                                friend={f}
                                                onAccept={handleAccept}
                                                onDecline={handleDecline}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Friends list */}
                <div className="divide-y divide-[#D4C8E8]/50 dark:divide-night-border/50">
                    {loading
                        ? Array.from({ length: compact ? 3 : 5 }).map((_, i) => <SkeletonFriendRow key={i} />)
                        : (
                            <AnimatePresence>
                                {accepted.map((friend, idx) => (
                                    <motion.div
                                        key={friend.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.04 }}
                                    >
                                        <FriendRow friend={friend} onRemove={handleRemove} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )
                    }

                    {!loading && !loadError && accepted.length === 0 && incoming.length === 0 && outgoing.length === 0 && (
                        <div className="py-12 px-6 text-center">
                            <p className="text-dark-lighter dark:text-night-text-muted text-sm transition-colors">
                                No friends yet — add friends to compare progress! 👥
                            </p>
                        </div>
                    )}
                </div>

                {/* Outgoing sent requests */}
                {!loading && !loadError && outgoing.length > 0 && (
                    <div className="border-t border-[#D4C8E8]/60 dark:border-night-border/60 px-5 py-3 transition-colors">
                        <p className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 transition-colors">
                            Sent Requests
                        </p>
                        <div className="space-y-2">
                            {outgoing.map(f => {
                                const seed = f.avatarSeed ?? f.displayName;
                                return (
                                    <div key={f.id} className="flex items-center gap-3">
                                        <img
                                            src={avatarUrl(seed)}
                                            alt={f.displayName}
                                            className="w-8 h-8 rounded-full border border-[#D4C8E8] dark:border-night-border transition-colors"
                                        />
                                        <p className="text-sm text-dark dark:text-night-text flex-1 transition-colors">
                                            {f.displayName}
                                        </p>
                                        <button
                                            onClick={() => handleDecline(f.userId)}
                                            className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Friend request modal */}
            <AnimatePresence>
                {showModal && (
                    <FriendRequestModal
                        onClose={() => setShowModal(false)}
                        onSent={() => { setShowModal(false); void load(); }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default FriendsPanel;
