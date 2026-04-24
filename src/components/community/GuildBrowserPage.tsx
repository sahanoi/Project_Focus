import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Shield } from 'lucide-react';
import type { Guild } from '../../lib/communityApi';
import { fetchGuilds } from '../../lib/communityApi';
import GuildCard from './GuildCard';
import CreateGuildModal from './CreateGuildModal';

const CATEGORY_FILTERS = [
    { value: 'all', label: 'All Guilds' },
    { value: 'mine', label: 'My Guilds' },
    { value: 'fitness', label: '💪 Fitness' },
    { value: 'health', label: '❤️ Health' },
    { value: 'learning', label: '📚 Learning' },
    { value: 'productivity', label: '⚡ Productivity' },
    { value: 'mindfulness', label: '🧘 Mindfulness' },
];

function GuildGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="rounded-3xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface p-5 animate-pulse"
                >
                    <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-night-bg flex-shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                            <div className="h-4 bg-gray-200 dark:bg-night-bg rounded-lg w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-night-bg rounded-lg w-1/2" />
                        </div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-night-bg rounded-lg mb-3" />
                    <div className="flex gap-4 mb-4">
                        <div className="h-3 bg-gray-200 dark:bg-night-bg rounded-lg w-1/3" />
                        <div className="h-3 bg-gray-200 dark:bg-night-bg rounded-lg w-1/3" />
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-night-bg rounded-xl w-1/3" />
                </div>
            ))}
        </div>
    );
}

export function GuildBrowserPageContent({ onSelectGuild }: { onSelectGuild?: (guild: Guild) => void }) {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showFull, setShowFull] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadGuilds = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await fetchGuilds({ search, showFull });
            setGuilds(data);
        } catch (err) {
            setGuilds([]);
            setLoadError(err instanceof Error ? err.message : 'Failed to load guilds');
        } finally {
            setLoading(false);
        }
    }, [search, showFull]);

    useEffect(() => {
        loadGuilds();
    }, [loadGuilds]);

    const filteredGuilds = guilds.filter((g) => {
        if (activeFilter === 'mine') return Boolean(g.isMember);
        if (activeFilter !== 'all') {
            return (g.communityHabitName ?? '').toLowerCase().includes(activeFilter) ||
                (g.description ?? '').toLowerCase().includes(activeFilter);
        }
        return true;
    });

    const myGuilds = guilds.filter((g) => g.isMember);
    const featuredGuilds = [...guilds].sort((a, b) => b.weeklyXp - a.weeklyXp).slice(0, 4);

    const handleViewDetail = (id: string) => {
        const guild = guilds.find((g) => g.id === id);
        if (guild) onSelectGuild?.(guild);
    };

    const handleJoin = (id: string) => {
        const guild = guilds.find((g) => g.id === id);
        if (guild) onSelectGuild?.(guild);
    };

    const handleGuildCreated = (guild: Guild) => {
        setShowCreateModal(false);
        setGuilds((prev) => [guild, ...prev]);
    };

    const sectionLabel =
        activeFilter === 'mine'
            ? 'My Guilds'
            : activeFilter === 'all'
            ? 'All Guilds'
            : (CATEGORY_FILTERS.find((f) => f.value === activeFilter)?.label ?? 'Guilds');

    return (
        <div className="space-y-8">
            {/* Header bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-dark flex items-center justify-center text-white">
                        <Shield size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-dark dark:text-night-text tracking-tight transition-colors">
                        ⚔️ Guilds
                    </h2>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors"
                >
                    <Plus size={16} />
                    Create Guild
                </button>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-lighter dark:text-night-text-muted pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Search guilds..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border bg-white dark:bg-night-surface text-dark dark:text-night-text placeholder:text-dark-lighter dark:placeholder:text-night-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {CATEGORY_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setActiveFilter(f.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                activeFilter === f.value
                                    ? 'bg-primary text-white'
                                    : 'bg-surface dark:bg-night-bg text-dark-lighter dark:text-night-text-muted border border-[#D4C8E8] dark:border-night-border hover:border-primary/50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <label className="flex items-center gap-2 ml-auto text-xs font-bold text-dark-lighter dark:text-night-text-muted cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={showFull}
                            onChange={(e) => setShowFull(e.target.checked)}
                            className="rounded accent-primary"
                        />
                        Show full guilds
                    </label>
                </div>
            </div>

            {loadError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                    <Shield size={16} className="flex-shrink-0" />
                    <span className="flex-1 min-w-0">{loadError}</span>
                    <button type="button" onClick={() => void loadGuilds()} className="underline font-bold flex-shrink-0">
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <GuildGridSkeleton />
            ) : loadError ? null : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeFilter}-${search}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-10"
                    >
                        {/* My Guilds section */}
                        {myGuilds.length > 0 && activeFilter === 'all' && (
                            <section>
                                <h3 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4 transition-colors">
                                    My Guilds
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myGuilds.map((guild, i) => (
                                        <motion.div
                                            key={guild.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <GuildCard
                                                guild={guild}
                                                onJoin={handleJoin}
                                                onViewDetail={handleViewDetail}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Featured Guilds horizontal scroll */}
                        {featuredGuilds.length > 0 && activeFilter === 'all' && (
                            <section>
                                <h3 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4 transition-colors">
                                    🌟 Featured Guilds
                                </h3>
                                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                    {featuredGuilds.map((guild, i) => (
                                        <motion.div
                                            key={guild.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className="snap-start flex-shrink-0 w-72"
                                        >
                                            <GuildCard
                                                guild={guild}
                                                onJoin={handleJoin}
                                                onViewDetail={handleViewDetail}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* All / Filtered Guilds grid */}
                        <section>
                            <h3 className="text-lg font-black text-dark dark:text-night-text tracking-wide mb-4 transition-colors">
                                {sectionLabel}
                            </h3>
                            {filteredGuilds.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-5xl mb-4">🏰</div>
                                    <p className="text-dark dark:text-night-text font-bold mb-2 transition-colors">
                                        No guilds found
                                    </p>
                                    <p className="text-dark-lighter dark:text-night-text-muted text-sm transition-colors">
                                        Be the first to create one!
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
                                    >
                                        Create Guild
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredGuilds.map((guild, i) => (
                                        <motion.div
                                            key={guild.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                        >
                                            <GuildCard
                                                guild={guild}
                                                onJoin={handleJoin}
                                                onViewDetail={handleViewDetail}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Create Guild Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateGuildModal
                        onClose={() => setShowCreateModal(false)}
                        onCreated={handleGuildCreated}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default GuildBrowserPageContent;
