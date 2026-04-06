import React, { useState, useEffect, useCallback } from 'react';
import { useModalClose } from '../../hooks/useModalClose';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { patchProfileApi } from '../../lib/api';
import { Award, Star, Edit3, Check, X, Camera, Info, Lock } from 'lucide-react';
import { getUserTierName } from '../../utils/featureGateUtils';
import { COLLECTIBLES } from '../../data/collectibles';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
//  Hexagonal GPI Radar Chart (pure SVG)
// ─────────────────────────────────────────────

const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Jocelyn', 'Brian', 'Sophie',
    'Marcus', 'Cleo', 'Zara', 'Dominic', 'Luna',
    'Kai', 'Priya', 'Ethan', 'Ava', 'Oscar',
    'Nadia', 'Leo', 'Maya', 'Rishi', 'Elena',
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildPolygon(cx: number, cy: number, r: number, n: number) {
    const points = [];
    for (let i = 0; i < n; i++) {
        const pt = polarToCartesian(cx, cy, r, (360 / n) * i);
        points.push(`${pt.x},${pt.y}`);
    }
    return points.join(' ');
}

interface GPIChartProps {
    data: { label: string; shortLabel: string; value: number; icon: string }[];
}

function GPIRadarChart({ data }: GPIChartProps) {
    const cx = 160, cy = 160, r = 110;
    const n = data.length;
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

    // Normalise values: attributes go 0–50 → 0–1
    const normalised = data.map(d => Math.min(1, d.value / 50));

    // Player polygon points
    const playerPoints = normalised.map((v, i) => {
        const pt = polarToCartesian(cx, cy, r * v, (360 / n) * i);
        return `${pt.x},${pt.y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 320 320" className="w-full max-w-xs mx-auto select-none">
            {/* Background hexagons */}
            {rings.map((ratio, ri) => (
                <polygon
                    key={ri}
                    points={buildPolygon(cx, cy, r * ratio, n)}
                    fill={ri === rings.length - 1 ? 'rgba(99,75,150,0.06)' : 'none'}
                    stroke="rgba(139,92,246,0.15)"
                    strokeWidth="1"
                />
            ))}

            {/* Axis lines */}
            {data.map((_, i) => {
                const outer = polarToCartesian(cx, cy, r, (360 / n) * i);
                return (
                    <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y}
                        stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
                );
            })}

            {/* Player shape */}
            <polygon
                points={playerPoints}
                fill="rgba(245,158,11,0.18)"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            {/* Attribute dots */}
            {normalised.map((v, i) => {
                const pt = polarToCartesian(cx, cy, r * v, (360 / n) * i);
                return (
                    <circle key={i} cx={pt.x} cy={pt.y} r={4}
                        fill="#F59E0B" stroke="#1a1230" strokeWidth="1.5" />
                );
            })}

            {/* Labels */}
            {data.map((d, i) => {
                const labelR = r + 28;
                const pt = polarToCartesian(cx, cy, labelR, (360 / n) * i);
                const iconPt = polarToCartesian(cx, cy, r + 14, (360 / n) * i);
                return (
                    <g key={i}>
                        <text x={pt.x} y={pt.y}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize="10" fontWeight="700" fill="rgba(200,190,230,0.85)"
                            letterSpacing="0.5">
                            {d.shortLabel}
                        </text>
                        <text x={iconPt.x} y={iconPt.y}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize="13">
                            {d.icon}
                        </text>
                    </g>
                );
            })}

            {/* Centre OVR */}
            <text x={cx} y={cy - 10} textAnchor="middle" fontSize="18" fontWeight="900"
                fill="#F59E0B">{data.find(d => d.shortLabel === 'OVR')?.value ?? 0}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fontWeight="700"
                fill="rgba(200,190,230,0.6)" letterSpacing="1.5">OVR</text>
        </svg>
    );
}

// ─────────────────────────────────────────────
//  Edit Profile Modal
// ─────────────────────────────────────────────
interface EditModalProps {
    currentUsername: string;
    currentBio: string;
    currentAvatarSeed: string;
    onClose: () => void;
    onSave: (username: string, bio: string, avatarSeed: string) => Promise<void>;
}

function EditProfileModal({ currentUsername, currentBio, currentAvatarSeed, onClose, onSave }: EditModalProps) {
    const stableOnClose = useCallback(onClose, [onClose]);
    useModalClose(true, stableOnClose);
    const [username, setUsername] = useState(currentUsername);
    const [bio, setBio] = useState(currentBio);
    const [avatarSeed, setAvatarSeed] = useState(currentAvatarSeed);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!username.trim()) { setError('Username cannot be empty'); return; }
        setSaving(true);
        setError('');
        try {
            await onSave(username.trim(), bio.trim(), avatarSeed);
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-night-surface border border-dark-border dark:border-night-border rounded-3xl w-full max-w-md p-6 z-10 transition-colors"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-dark dark:text-night-text transition-colors">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-night-surface text-dark-lighter dark:text-night-text-muted transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Avatar Picker */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-3 transition-colors">
                        <Camera size={12} className="inline mr-1" />
                        Choose Avatar
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {AVATAR_SEEDS.map(seed => (
                            <button
                                key={seed}
                                onClick={() => setAvatarSeed(seed)}
                                className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-colors ${avatarSeed === seed
                                    ? 'border-primary dark:border-primary-light scale-110'
                                    : 'border-transparent hover:border-primary/40'
                                    }`}
                                title={seed}
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffdfbf,E6DDF2`}
                                    alt={seed}
                                    className="w-full h-full"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Username */}
                <div className="mb-4">
                    <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 transition-colors">
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        maxLength={30}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-night-bg border border-gray-200 dark:border-night-border text-dark dark:text-night-text placeholder-gray-400 dark:placeholder-night-text-muted focus:outline-none focus:border-primary dark:focus:border-primary-light transition-colors font-bold"
                        placeholder="Your display name..."
                    />
                </div>

                {/* Bio */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider mb-2 transition-colors">
                        Bio <span className="text-dark-lighter/50 dark:text-night-text-muted/50 normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        maxLength={120}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-night-bg border border-gray-200 dark:border-night-border text-dark dark:text-night-text placeholder-gray-400 dark:placeholder-night-text-muted focus:outline-none focus:border-primary dark:focus:border-primary-light transition-colors resize-none"
                        placeholder="Tell the world what drives you..."
                    />
                    <div className="text-right text-xs text-dark-lighter/50 dark:text-night-text-muted/50 mt-1">{bio.length}/120</div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-night-border text-dark-lighter dark:text-night-text-muted font-bold hover:bg-gray-50 dark:hover:bg-night-surface transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                                <Star size={16} />
                            </motion.div>
                        ) : <Check size={16} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  Main Profile Page
// ─────────────────────────────────────────────
export default function ProfilePage() {
    const { stats, habits } = useHabitStore();
    const { user, refreshAuth } = useAuth();
    const tierName = getUserTierName(stats);
    const progressPercent = Math.min(100, Math.round((stats.xp / stats.nextLevelXp) * 100));

    const [showEdit, setShowEdit] = useState(false);
    const [showGPIInfo, setShowGPIInfo] = useState(false);

    // Profile fields — persisted in user_metadata
    const [displayName, setDisplayName] = useState(
        user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Focus Explorer'
    );
    const [bio, setBio] = useState(user?.user_metadata?.bio || 'Ready to build consistency. 🔥');
    const [avatarSeed, setAvatarSeed] = useState(
        user?.user_metadata?.avatar_seed || 'Felix'
    );

    // Sync whenever user metadata changes (e.g. after save)
    useEffect(() => {
        if (user?.user_metadata) {
            setDisplayName(user.user_metadata.display_name || user.email?.split('@')[0] || 'Focus Explorer');
            setBio(user.user_metadata.bio || 'Ready to build consistency. 🔥');
            setAvatarSeed(user.user_metadata.avatar_seed || 'Felix');
        }
    }, [user]);

    const handleSaveProfile = async (newName: string, newBio: string, newSeed: string) => {
        try {
            await patchProfileApi({
                display_name: newName,
                bio: newBio,
                avatar_seed: newSeed,
            });
            await refreshAuth();
        } catch (e) {
            console.error(e);
            throw e;
        }
        setDisplayName(newName);
        setBio(newBio);
        setAvatarSeed(newSeed);
    };

    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,ffdfbf,E6DDF2`;

    // GPI chart data — all 7 attributes
    const gpiData = [
        { label: 'Overall Rating', shortLabel: 'OVR', value: stats.attributes.ovr, icon: '⚡' },
        { label: 'Discipline (daily completion)', shortLabel: 'DSC', value: stats.attributes.dsc, icon: '🛡️' },
        { label: 'Focus (numerical hit-rate)', shortLabel: 'FOC', value: stats.attributes.foc, icon: '👁' },
        { label: 'Grit (longest streak)', shortLabel: 'GRT', value: stats.attributes.grt, icon: '🔥' },
        { label: 'Vitality (health & fitness)', shortLabel: 'VIT', value: stats.attributes.vit, icon: '💪' },
        { label: 'Balance (category diversity)', shortLabel: 'BAL', value: stats.attributes.bal, icon: '⚖️' },
        { label: 'Streak Consistency', shortLabel: 'STK', value: stats.attributes.stk, icon: '🔗' },
    ];

    const totalHabits = habits.filter(h => !h.archived).length;
    const totalCompletions = habits.reduce((acc, h) => acc + Object.values(h.completions).filter(c => c.completed).length, 0);
    const longestStreak = habits.reduce((max, h) => {
        let streak = 0, best = 0;
        const sorted = Object.values(h.completions).sort((a, b) => a.date.localeCompare(b.date));
        for (const c of sorted) { if (c.completed) { streak++; best = Math.max(best, streak); } else streak = 0; }
        return Math.max(max, best);
    }, 0);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">

            {/* ── Header / ID Card ── */}
            <div className="card mb-6 relative overflow-hidden dark:bg-night-surface dark:border-night-border transition-colors">
                {/* Cover gradient */}
                <div className="absolute top-0 left-0 w-full h-36 bg-primary/30 dark:bg-primary/20" />

                <div className="relative pt-16 px-6 pb-6 flex flex-col md:flex-row items-center md:items-end gap-5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 rounded-3xl bg-white dark:bg-night-bg border-4 border-white dark:border-night-surface overflow-hidden z-10 transition-colors">
                            <img src={avatarUrl} alt="avatar" className="w-full h-full" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary dark:bg-primary-light flex items-center justify-center text-white text-xs font-black">
                            {stats.level}
                        </div>
                    </div>

                    {/* Name & bio */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-dark dark:text-night-text transition-colors">{displayName}</h1>
                            <span className="badge bg-purple/10 dark:bg-purple/20 text-purple-dark dark:text-primary-light border border-purple/20 dark:border-purple/30 mx-auto md:mx-0 transition-colors text-xs">
                                {tierName} • Lvl {stats.level}
                            </span>
                        </div>
                        <p className="text-sm text-dark-lighter dark:text-night-text-muted transition-colors">{bio}</p>
                        <p className="text-xs text-dark-lighter/60 dark:text-night-text-muted/60 mt-1 transition-colors">{user?.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-night-border bg-white dark:bg-night-bg text-dark dark:text-night-text font-bold hover:border-primary dark:hover:border-primary-light hover:text-primary dark:hover:text-primary-light transition-colors text-sm"
                        >
                            <Edit3 size={14} /> Edit Profile
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors">
                            <Award size={14} /> Showcase
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Quick Stats Row ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Active Habits', value: totalHabits },
                    { label: 'Total Done', value: totalCompletions },
                    { label: 'Best Streak', value: `${longestStreak}d` },
                ].map(s => (
                    <div key={s.label} className="card text-center dark:bg-night-surface dark:border-night-border transition-colors">
                        <div className="text-2xl font-black text-dark dark:text-night-text transition-colors">{s.value}</div>
                        <div className="text-[10px] font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-widest mt-0.5 transition-colors">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Main Grid: XP + GPI ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* XP Progress */}
                <div className="card dark:bg-night-surface dark:border-night-border transition-colors flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Star size={20} className="text-primary dark:text-primary-light transition-colors" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">Level Progress</div>
                            <div className="text-2xl font-black text-dark dark:text-night-text transition-colors">Level {stats.level}</div>
                        </div>
                        <div className="ml-auto text-right">
                            <div className="text-sm font-bold text-primary dark:text-primary-light">{stats.xp}<span className="text-dark-lighter dark:text-night-text-muted font-normal"> / {stats.nextLevelXp} XP</span></div>
                            <div className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">{stats.nextLevelXp - stats.xp} XP to go</div>
                        </div>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-night-bg rounded-full overflow-hidden transition-colors mb-5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                            className="h-full bg-primary rounded-full"
                        />
                    </div>

                    {/* Attribute bars */}
                    <div className="space-y-3">
                        {gpiData.filter(d => d.shortLabel !== 'OVR').map(attr => (
                            <div key={attr.shortLabel}>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-dark-lighter dark:text-night-text-muted transition-colors flex items-center gap-1">
                                        <span>{attr.icon}</span> {attr.label.split(' ')[0]}
                                    </span>
                                    <span className="text-dark dark:text-night-text transition-colors">{attr.value}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-night-bg rounded-full transition-colors">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, attr.value * 2)}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                        className="h-full rounded-full bg-warning-dark"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GPI Radar Chart */}
                <div className="card dark:bg-night-surface dark:border-night-border transition-colors flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xs font-bold text-dark-lighter dark:text-night-text-muted uppercase tracking-wider transition-colors">Performance Index</h3>
                            <div className="text-lg font-black text-dark dark:text-night-text transition-colors">GPI Chart</div>
                        </div>
                        <button
                            onClick={() => setShowGPIInfo(!showGPIInfo)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-night-surface text-dark-lighter dark:text-night-text-muted transition-colors"
                        >
                            <Info size={16} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showGPIInfo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 overflow-hidden"
                            >
                                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-3 text-xs text-dark-lighter dark:text-night-text-muted space-y-1 transition-colors">
                                    {gpiData.map(d => (
                                        <div key={d.shortLabel} className="flex gap-2">
                                            <span className="font-bold text-dark dark:text-night-text w-8 transition-colors">{d.shortLabel}</span>
                                            <span>{d.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dark radar background container — gated behind 3 completions */}
                    {totalCompletions >= 3 ? (
                        <div className="flex-1 flex items-center justify-center bg-[#1a103d] dark:bg-[#0d0820] rounded-2xl p-4 min-h-[260px]">
                            <GPIRadarChart data={gpiData} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-night-bg rounded-2xl p-6 min-h-[260px] text-center border-2 border-dashed border-gray-200 dark:border-night-border">
                            <Lock size={28} className="text-gray-300 dark:text-night-text-muted mb-3" />
                            <p className="text-sm font-bold text-dark dark:text-night-text mb-1 transition-colors">Chart Locked</p>
                            <p className="text-xs text-dark-lighter dark:text-night-text-muted mb-3 transition-colors">
                                Complete 3 habits to unlock your Performance Index
                            </p>
                            <div className="flex items-center gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all ${i < totalCompletions
                                            ? 'bg-primary scale-110'
                                            : 'bg-gray-200 dark:bg-night-border'
                                            }`}
                                    />
                                ))}
                                <span className="text-xs font-bold text-dark-lighter dark:text-night-text-muted ml-1">{totalCompletions}/3</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Collectibles Showcase ── */}
            <h2 className="text-lg font-bold text-dark dark:text-night-text mb-4 flex items-center gap-2 transition-colors">
                <Star className="text-warning" size={20} />
                Showcase & Collectibles
                <span className="text-xs font-bold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2 py-0.5 rounded-full ml-auto">
                    {stats.unlockedCollectibles?.length || 0} / {COLLECTIBLES.length}
                </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {COLLECTIBLES.map((c, i) => {
                    const isUnlocked = stats.unlockedCollectibles?.includes(c.id);
                    const rarityColors: Record<string, string> = {
                        common: 'border-gray-300 dark:border-gray-600',
                        rare: 'border-blue-400 dark:border-blue-500',
                        epic: 'border-purple-500 dark:border-purple-400',
                        legendary: 'border-yellow-400 dark:border-yellow-500',
                    };
                    const rarityBg: Record<string, string> = {
                        common: 'bg-gray-50 dark:bg-night-bg',
                        rare: 'bg-blue-50 dark:bg-blue-900/20',
                        epic: 'bg-purple-50 dark:bg-purple-900/20',
                        legendary: 'bg-yellow-50/80 dark:bg-yellow-900/20',
                    };
                    const rarityLabel: Record<string, string> = {
                        common: 'text-gray-500',
                        rare: 'text-blue-500',
                        epic: 'text-purple-500',
                        legendary: 'text-yellow-500',
                    };

                    return (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`relative rounded-2xl border-2 p-3 text-center transition-colors ${isUnlocked
                                ? `${rarityColors[c.rarity]} ${rarityBg[c.rarity]} cursor-default`
                                : 'border-dashed border-gray-200 dark:border-night-border bg-gray-50/50 dark:bg-night-surface/60 opacity-50 grayscale'
                                }`}
                            title={isUnlocked ? c.description : c.unlockHint}
                        >
                            <div className={`text-2xl mb-1 ${!isUnlocked ? 'blur-[2px]' : ''}`}>{c.icon}</div>
                            <div className={`text-[11px] font-bold leading-tight ${isUnlocked ? 'text-dark dark:text-night-text' : 'text-gray-400 dark:text-night-text-muted'
                                } transition-colors`}>
                                {isUnlocked ? c.name : '???'}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${rarityLabel[c.rarity]}`}>
                                {c.rarity}
                            </div>
                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Lock size={14} className="text-gray-400 dark:text-night-text-muted" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* How to Earn hint */}
            <div className="text-center py-3 px-6 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 dark:border-primary/20 mb-6">
                <p className="text-xs font-medium text-dark-lighter dark:text-night-text-muted transition-colors">
                    💡 <span className="font-bold">How to earn:</span> Complete habits, build streaks, level up, and diversify your categories to unlock rare collectibles!
                </p>
            </div>

            {/* ── Edit Modal ── */}
            <AnimatePresence>
                {showEdit && (
                    <EditProfileModal
                        currentUsername={displayName}
                        currentBio={bio}
                        currentAvatarSeed={avatarSeed}
                        onClose={() => setShowEdit(false)}
                        onSave={handleSaveProfile}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
