import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DUMMY_FRIENDS, DUMMY_FEED, SocialUser } from '../../utils/dummySocialData';
import { useHabitStore } from '../../store/habitStore';
import { Users, Globe, Trophy, ArrowUp, ArrowDown, Activity, ChevronRight, Shield, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PublicProfileModal from './PublicProfileModal';
import { useAuth } from '../../contexts/AuthContext';

export default function CommunityPage() {
    const { stats } = useHabitStore();
    const { user } = useAuth();
    const [selectedUser, setSelectedUser] = useState<SocialUser | null>(null);

    // Combine player with friends for leaderboard
    const allUsers = [
        ...DUMMY_FRIENDS,
        {
            id: 'self',
            name: user?.email?.split('@')[0] || 'You',
            avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=E6DDF2',
            level: stats.level,
            xpThisWeek: stats.xp % 5000, // mock weekly XP for current user
            stats: stats,
            badges: [], // omitted for brevity on self row
            activeStreaks: []
        }
    ].sort((a, b) => b.xpThisWeek - a.xpThisWeek);

    // Find rank movement (mocked)
    const getMovement = (id: string, idx: number) => {
        if (id === 'user_3') return <ArrowUp size={14} className="text-success" />;
        if (id === 'user_1') return <ArrowDown size={14} className="text-red-400" />;
        return <div className="w-3.5 h-[2px] bg-gray-300 rounded-full" />;
    };

    return (
        <div className="h-full flex flex-col bg-surface dark:bg-night-bg overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-night-surface border-b border-[#D4C8E8] dark:border-night-border px-6 lg:px-8 py-6 transition-colors">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary dark:from-indigo-600 dark:to-primary-dark flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transition-colors">
                                <Globe size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-dark dark:text-night-text tracking-tight transition-colors">Community</h1>
                        </div>
                        <p className="text-dark-lighter dark:text-night-text-muted transition-colors">Compete, share, and stay accountable with friends.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-surface-dark dark:bg-night-bg px-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border shadow-inner transition-colors">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-0.5 transition-colors">Season 1 Ends</p>
                            <p className="text-dark dark:text-night-text font-black tracking-tight transition-colors">4 Days, 12 Hrs</p>
                        </div>
                        <div className="w-[1px] h-8 bg-[#D4C8E8] dark:bg-night-border mx-2 transition-colors" />
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-0.5 transition-colors">Global Rank</p>
                            <p className="text-primary dark:text-primary-light font-black tracking-tight flex items-center gap-1 transition-colors">
                                <Trophy size={14} /> Top 5%
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: ACTIVITY FEED */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2 transition-colors">
                                    <Activity size={18} className="text-primary dark:text-primary-light transition-colors" />
                                    Live Feed
                                </h2>
                                <button className="text-sm font-bold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors">
                                    Refresh
                                </button>
                            </div>

                            <div className="space-y-4">
                                {DUMMY_FEED.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white dark:bg-night-surface p-5 rounded-3xl border border-[#D4C8E8] dark:border-night-border shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-surface dark:bg-night-bg flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-110 transition-all">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4 mb-1">
                                                <p className="text-sm font-bold text-dark dark:text-night-text truncate transition-colors">
                                                    {item.message}
                                                </p>
                                                <span className="text-xs text-dark-lighter dark:text-night-text-muted whitespace-nowrap transition-colors">
                                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {item.details && (
                                                <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">{item.details}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* End of feed message */}
                                <div className="text-center py-6 text-dark-lighter dark:text-night-text-muted text-sm font-medium flex items-center justify-center gap-2 opacity-60 transition-colors">
                                    <Shield size={16} />
                                    You're all caught up!
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LEADERBOARD */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black text-dark dark:text-night-text tracking-wide flex items-center gap-2 transition-colors">
                                    <Users size={18} className="text-indigo-500 dark:text-indigo-400 transition-colors" />
                                    Weekly Leaderboard
                                </h2>
                            </div>

                            <div className="bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border shadow-sm overflow-hidden transition-colors">
                                {allUsers.map((u, idx) => {
                                    const isSelf = u.id === 'self';
                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => !isSelf && setSelectedUser(u as SocialUser)}
                                            className={`p-4 flex items-center gap-4 transition-colors border-b border-[#D4C8E8]/50 dark:border-night-border/50 last:border-0 ${isSelf ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-surface dark:hover:bg-night-bg cursor-pointer'
                                                }`}
                                        >
                                            {/* Rank */}
                                            <div className="w-8 flex flex-col items-center justify-center gap-1">
                                                <span className={`text-sm font-black ${idx < 3 ? 'text-primary dark:text-primary-light' : 'text-dark-lighter dark:text-night-text-muted'} transition-colors`}>
                                                    #{idx + 1}
                                                </span>
                                                {getMovement(u.id, idx)}
                                            </div>

                                            {/* Avatar */}
                                            <div className="relative">
                                                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border transition-colors" />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dark dark:bg-night-border text-white dark:text-night-text text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-night-surface transition-colors">
                                                    {u.level}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate transition-colors ${isSelf ? 'text-primary-dark dark:text-primary-light' : 'text-dark dark:text-night-text'}`}>
                                                    {u.name} {isSelf && '(You)'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] uppercase font-bold text-dark-lighter dark:text-night-text-muted transition-colors">OVR {u.stats.attributes?.ovr || 0}</span>
                                                    {!isSelf && u.activeStreaks.length > 0 && (
                                                        <span className="text-[10px] flex items-center gap-0.5 text-orange-500 font-bold bg-orange-50 px-1.5 rounded-sm">
                                                            <Flame size={10} /> {Math.max(...u.activeStreaks.map(s => s.days))}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="text-right flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-dark dark:text-night-text transition-colors">{u.xpThisWeek.toLocaleString()}</span>
                                                    <span className="text-[9px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">XP</span>
                                                </div>
                                                {!isSelf && <ChevronRight size={16} className="text-gray-300 dark:text-night-border transition-colors" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Public Profile Modal */}
            <PublicProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}
