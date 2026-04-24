import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Lock } from 'lucide-react';
import type { Guild, CommunityHabit } from '../../lib/communityApi';
import { createGuild, fetchCommunityHabits } from '../../lib/communityApi';

const ICON_OPTIONS = ['⚔️', '🛡️', '🏰', '👑', '🔥', '⭐', '🌟', '💫', '🎯', '🏆', '🦁', '🦅', '🐺', '🐲', '💪', '🧠'];

const BANNER_COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
];

interface CreateGuildModalProps {
    onClose: () => void;
    onCreated: (guild: Guild) => void;
}

export default function CreateGuildModal({ onClose, onCreated }: CreateGuildModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('⚔️');
    const [bannerColor, setBannerColor] = useState(BANNER_COLORS[0]);
    const [communityHabitId, setCommunityHabitId] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [communityHabits, setCommunityHabits] = useState<CommunityHabit[]>([]);
    const [habitsLoadError, setHabitsLoadError] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setHabitsLoadError(null);
        fetchCommunityHabits()
            .then(setCommunityHabits)
            .catch(e => { setCommunityHabits([]); setHabitsLoadError(e instanceof Error ? e.message : 'Could not load community habits'); });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Guild name is required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const guild = await createGuild({
                name: name.trim(),
                description: description.trim() || undefined,
                icon,
                bannerColor,
                communityHabitId: communityHabitId || undefined,
                isPublic,
            });
            setLoading(false);
            onCreated(guild);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create guild. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-md w-full rounded-3xl bg-white dark:bg-night-surface p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-dark dark:text-night-text tracking-tight transition-colors">
                        Create Guild
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface dark:bg-night-bg flex items-center justify-center text-dark-lighter dark:text-night-text-muted hover:text-dark dark:hover:text-night-text transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Live preview banner */}
                <div
                    className="h-20 rounded-2xl flex items-center justify-center mb-6 text-4xl"
                    style={{ backgroundColor: bannerColor }}
                >
                    {icon}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Guild Name */}
                    <div>
                        <label className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 block transition-colors">
                            Guild Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 50))}
                            placeholder="Epic Warriors Guild"
                            className="w-full px-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border bg-surface dark:bg-night-bg text-dark dark:text-night-text placeholder:text-dark-lighter dark:placeholder:text-night-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-colors"
                        />
                        <p className="text-xs text-dark-lighter dark:text-night-text-muted mt-1 transition-colors">
                            {name.length}/50
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 block transition-colors">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                            placeholder="Tell people what your guild is about..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border bg-surface dark:bg-night-bg text-dark dark:text-night-text placeholder:text-dark-lighter dark:placeholder:text-night-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none transition-colors"
                        />
                        <p className="text-xs text-dark-lighter dark:text-night-text-muted mt-1 transition-colors">
                            {description.length}/200
                        </p>
                    </div>

                    {/* Icon picker */}
                    <div>
                        <label className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 block transition-colors">
                            Guild Icon
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {ICON_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcon(emoji)}
                                    className={`h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                                        icon === emoji
                                            ? 'bg-primary/20 border-2 border-primary'
                                            : 'bg-surface dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border hover:border-primary/50'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Banner color */}
                    <div>
                        <label className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 block transition-colors">
                            Banner Color
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {BANNER_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setBannerColor(color)}
                                    className={`w-9 h-9 rounded-full transition-transform ${
                                        bannerColor === color
                                            ? 'scale-125 ring-2 ring-offset-2 ring-primary'
                                            : 'hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Community Habit */}
                    <div>
                        <label className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 block transition-colors">
                            Community Habit
                        </label>
                        {habitsLoadError && (
                            <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-medium" role="alert">
                                {habitsLoadError}
                            </p>
                        )}
                        <select
                            value={communityHabitId}
                            onChange={(e) => setCommunityHabitId(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border bg-surface dark:bg-night-bg text-dark dark:text-night-text focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-colors"
                        >
                            <option value="">Global (any habit)</option>
                            {communityHabits.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.icon} {h.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Public / Private toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-[#D4C8E8] dark:border-night-border bg-surface dark:bg-night-bg transition-colors">
                        <div className="flex items-center gap-3">
                            {isPublic ? (
                                <Globe size={18} className="text-primary flex-shrink-0" />
                            ) : (
                                <Lock size={18} className="text-dark-lighter dark:text-night-text-muted flex-shrink-0" />
                            )}
                            <div>
                                <p className="text-sm font-bold text-dark dark:text-night-text transition-colors">
                                    {isPublic ? 'Public Guild' : 'Private Guild'}
                                </p>
                                <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                                    {isPublic ? 'Anyone can find and join' : 'Invite-only'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${isPublic ? 'bg-primary' : 'bg-gray-300 dark:bg-night-border'}`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-7' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            '⚔️ Create Guild'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
