// Community Habits — Types + real API calls

import { apiFetch, getJson, parseErrorResponse } from './api';

async function throwIfNotOk(r: Response): Promise<void> {
    if (!r.ok) {
        const msg = await parseErrorResponse(r);
        throw new Error(`${r.status}: ${msg}`);
    }
}

// ==========================================
// Tier System
// ==========================================

export type HabitCardTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export const TIER_THRESHOLDS: Record<HabitCardTier, number> = {
    Bronze: 0,
    Silver: 500,
    Gold: 1500,
    Platinum: 4000,
    Diamond: 10000,
    Master: 25000,
};

export const TIER_COLORS: Record<HabitCardTier, { bg: string; text: string; border: string; glow: string }> = {
    Bronze:   { bg: 'from-amber-700 to-amber-500',   text: 'text-amber-100',  border: 'border-amber-600',   glow: 'shadow-amber-500/30' },
    Silver:   { bg: 'from-gray-400 to-gray-300',      text: 'text-gray-900',   border: 'border-gray-400',    glow: 'shadow-gray-400/30' },
    Gold:     { bg: 'from-yellow-500 to-yellow-300',  text: 'text-yellow-900', border: 'border-yellow-400',  glow: 'shadow-yellow-400/40' },
    Platinum: { bg: 'from-teal-400 to-cyan-300',      text: 'text-teal-900',   border: 'border-teal-400',    glow: 'shadow-teal-400/40' },
    Diamond:  { bg: 'from-blue-400 to-cyan-300',      text: 'text-blue-900',   border: 'border-blue-400',    glow: 'shadow-blue-400/50' },
    Master:   { bg: 'from-purple-600 to-pink-500',    text: 'text-white',      border: 'border-purple-500',  glow: 'shadow-purple-500/50' },
};

export const TIER_TITLES: Record<HabitCardTier, Record<string, string>> = {
    Bronze:   { 'drink-water': 'Water Seeker',       'morning-run': 'Jogger',               default: 'Novice' },
    Silver:   { 'drink-water': 'Hydration Adept',    'morning-run': 'Runner',               default: 'Apprentice' },
    Gold:     { 'drink-water': 'Hydration Pro',      'morning-run': 'Athlete',              default: 'Practitioner' },
    Platinum: { 'drink-water': 'Water Sage',         'morning-run': 'Sprinter',             default: 'Expert' },
    Diamond:  { 'drink-water': 'Hydration Legend',   'morning-run': 'Marathon Hero',        default: 'Master' },
    Master:   { 'drink-water': 'Water God',          'morning-run': 'Ultramarathon Legend', default: 'Grand Master' },
};

export function getTierForXP(xp: number): HabitCardTier {
    const tiers: HabitCardTier[] = ['Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
    for (const tier of tiers) {
        if (xp >= TIER_THRESHOLDS[tier]) return tier;
    }
    return 'Bronze';
}

export function getNextTier(tier: HabitCardTier): HabitCardTier | null {
    const order: HabitCardTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
    const idx = order.indexOf(tier);
    return idx < order.length - 1 ? order[idx + 1] ?? null : null;
}

export function getXPProgressInTier(xp: number, tier: HabitCardTier): number {
    const next = getNextTier(tier);
    if (!next) return 100;
    const tierStart = TIER_THRESHOLDS[tier];
    const tierEnd = TIER_THRESHOLDS[next];
    return Math.min(100, Math.round(((xp - tierStart) / (tierEnd - tierStart)) * 100));
}

export function getXPToNextTier(xp: number, tier: HabitCardTier): number {
    const next = getNextTier(tier);
    if (!next) return 0;
    return Math.max(0, TIER_THRESHOLDS[next] - xp);
}

// ==========================================
// Community Habit Types
// ==========================================

export interface CommunityHabit {
    id: string;
    slug: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    unit?: string;
    dailyTarget?: number;
    goalValue?: number;
    isFeatured: boolean;
    sortOrder: number;
    participantCount: number;
    totalCompletionsThisWeek: number;
    isJoined?: boolean;
}

export interface CommunityHabitXP {
    communityHabitId: string;
    xp: number;
    level: number;
    tier: HabitCardTier;
    streak: number;
    bestStreak: number;
    totalCompletions: number;
    lastCompletedDate?: string;
    xpToNextTier: number;
    progressInTier: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatarSeed?: string;
    score: number;
    completions: number;
    streak: number;
    tier: HabitCardTier;
    isCurrentUser: boolean;
    movement: 'up' | 'down' | 'same';
}

export interface WeeklyLeaderboardData {
    communityHabitId?: string;
    weekStart: string;
    entries: LeaderboardEntry[];
    userRank?: number;
    totalParticipants: number;
}

// ==========================================
// Guild Types
// ==========================================

export type GuildTier = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export const GUILD_TIER_COLORS: Record<GuildTier, string> = {
    Iron: '#71717a', Bronze: '#cd7f32', Silver: '#c0c0c0',
    Gold: '#fbbf24', Platinum: '#6ee7b7', Diamond: '#93c5fd', Master: '#c084fc',
};

export interface Guild {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon: string;
    bannerColor: string;
    communityHabitId?: string;
    communityHabitName?: string;
    communityHabitIcon?: string;
    isPublic: boolean;
    maxMembers: number;
    memberCount: number;
    totalXp: number;
    weeklyXp: number;
    ladderTier: GuildTier;
    ownerId: string;
    ownerName: string;
    isMember?: boolean;
    userRole?: 'owner' | 'admin' | 'member';
    createdAt: string;
}

export interface GuildMember {
    userId: string;
    displayName: string;
    avatarSeed?: string;
    role: 'owner' | 'admin' | 'member';
    weeklyXp: number;
    totalXp: number;
    joinedAt: string;
    rank: number;
    isCurrentUser: boolean;
}

export interface CreateGuildData {
    name: string;
    description?: string;
    icon: string;
    bannerColor: string;
    communityHabitId?: string;
    isPublic: boolean;
}

// ==========================================
// Feed & Social Types
// ==========================================

export type FeedEventType =
    | 'habit_completed'
    | 'level_up'
    | 'streak_milestone'
    | 'guild_joined'
    | 'guild_created'
    | 'tier_up'
    | 'challenge_completed';

export interface FeedEvent {
    id: string;
    userId: string;
    displayName: string;
    avatarSeed?: string;
    eventType: FeedEventType;
    communityHabitName?: string;
    communityHabitIcon?: string;
    guildName?: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export interface Friend {
    id: string;
    userId: string;
    displayName: string;
    email: string;
    avatarSeed?: string;
    level: number;
    weeklyXp: number;
    status: 'accepted' | 'pending_sent' | 'pending_received';
    mutualHabits: string[];
}

// ==========================================
// Helper: transform DB xp row → CommunityHabitXP
// ==========================================

function toHabitXP(row: { communityHabitId: string; xp: number; level: number; streak: number; bestStreak: number; totalCompletions: number; lastCompletedDate?: string | null }): CommunityHabitXP {
    const tier = getTierForXP(row.xp);
    return {
        communityHabitId: row.communityHabitId,
        xp: row.xp,
        level: row.level,
        tier,
        streak: row.streak,
        bestStreak: row.bestStreak,
        totalCompletions: row.totalCompletions,
        lastCompletedDate: row.lastCompletedDate ?? undefined,
        xpToNextTier: getXPToNextTier(row.xp, tier),
        progressInTier: getXPProgressInTier(row.xp, tier),
    };
}

// ==========================================
// API Functions
// ==========================================

export async function fetchCommunityHabits(): Promise<CommunityHabit[]> {
    const data = await getJson<{ habits: CommunityHabit[] }>('/api/community/habits');
    return data.habits;
}

export async function fetchCommunityHabitDetail(slug: string): Promise<{ habit: CommunityHabit; communityStats: { participantCount: number; totalCompletionsThisWeek: number; topStreak: number }; userXp: CommunityHabitXP | null; isJoined: boolean }> {
    const data = await getJson<{ habit: CommunityHabit; communityStats: { participantCount: number; totalCompletionsThisWeek: number; topStreak: number }; userXp: { communityHabitId: string; xp: number; level: number; streak: number; bestStreak: number; totalCompletions: number; lastCompletedDate?: string | null } | null; isJoined: boolean }>(`/api/community/habits/${slug}`);
    return {
        ...data,
        userXp: data.userXp ? toHabitXP(data.userXp) : null,
    };
}

export async function joinCommunityHabit(slug: string): Promise<{ ok: boolean }> {
    const r = await apiFetch(`/api/community/habits/${slug}/join`, { method: 'POST' });
    await throwIfNotOk(r);
    return { ok: true };
}

export async function leaveCommunityHabit(slug: string): Promise<{ ok: boolean }> {
    const r = await apiFetch(`/api/community/habits/${slug}/leave`, { method: 'POST' });
    await throwIfNotOk(r);
    return { ok: true };
}

export async function completeCommunityHabit(slug: string): Promise<{ xpEarned: number; newXp: number; newStreak: number; newTier: string; leveledUp: boolean; xpData: CommunityHabitXP }> {
    const r = await apiFetch(`/api/community/habits/${slug}/complete`, { method: 'POST' });
    if (!r.ok) {
        throw new Error(`${r.status}: ${await parseErrorResponse(r)}`);
    }
    const data = await r.json() as { xpEarned: number; newXp: number; newStreak: number; newTier: string; leveledUp: boolean; xpData: { communityHabitId: string; xp: number; level: number; streak: number; bestStreak: number; totalCompletions: number; lastCompletedDate?: string } };
    return { ...data, xpData: toHabitXP(data.xpData) };
}

export async function fetchMyHabitXP(slug: string): Promise<CommunityHabitXP | null> {
    const detail = await fetchCommunityHabitDetail(slug);
    return detail.userXp;
}

export async function fetchHabitLeaderboard(slug: string, scope?: 'global' | 'guild', guildId?: string): Promise<WeeklyLeaderboardData> {
    const params = new URLSearchParams();
    if (scope) params.set('scope', scope);
    if (guildId) params.set('guildId', guildId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return getJson<WeeklyLeaderboardData>(`/api/community/habits/${slug}/leaderboard${qs}`);
}

export async function fetchGlobalLeaderboard(scope: 'global' | 'friends' = 'global'): Promise<WeeklyLeaderboardData> {
    const q = scope === 'friends' ? '?scope=friends' : '';
    return getJson<WeeklyLeaderboardData>(`/api/community/leaderboard${q}`);
}

export async function fetchGuilds(params?: { communityHabitId?: string; search?: string; showFull?: boolean; mine?: boolean }): Promise<Guild[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.communityHabitId) qs.set('communityHabitId', params.communityHabitId);
    if (params?.mine) qs.set('mine', 'true');
    if (params?.showFull) qs.set('showFull', 'true');
    const q = qs.toString() ? `?${qs.toString()}` : '';
    const data = await getJson<{ guilds: Guild[] }>(`/api/guilds${q}`);
    return data.guilds;
}

export async function fetchGuildDetail(id: string): Promise<{ guild: Guild; members: GuildMember[] }> {
    const data = await getJson<{ guild: Guild; members: GuildMember[]; isJoined: boolean; userRole: string | null }>(`/api/guilds/${id}`);
    return {
        guild: { ...data.guild, isMember: data.isJoined, userRole: data.userRole as Guild['userRole'] ?? undefined },
        members: data.members.map((m, i) => ({ ...m, rank: i + 1, isCurrentUser: false })),
    };
}

export async function createGuild(data: CreateGuildData): Promise<Guild> {
    const r = await apiFetch('/api/guilds', { method: 'POST', body: JSON.stringify(data) });
    if (!r.ok) {
        throw new Error(`${r.status}: ${await parseErrorResponse(r)}`);
    }
    const result = await r.json() as { guild: Guild };
    return result.guild;
}

export async function joinGuild(id: string): Promise<{ ok: boolean }> {
    const r = await apiFetch(`/api/guilds/${id}/join`, { method: 'POST' });
    await throwIfNotOk(r);
    return { ok: true };
}

export async function leaveGuild(id: string): Promise<{ ok: boolean }> {
    const r = await apiFetch(`/api/guilds/${id}/leave`, { method: 'POST' });
    await throwIfNotOk(r);
    return { ok: true };
}

export async function fetchGuildLadder(): Promise<Guild[]> {
    const data = await getJson<{ guilds: Guild[] }>('/api/guilds/ladder');
    return data.guilds;
}

export async function fetchSocialFeed(): Promise<FeedEvent[]> {
    const data = await getJson<{ events: Array<{ id: string; userId: string; eventType: string; communityHabitId?: string; guildId?: string; metadata: Record<string, unknown>; isPublic: boolean; createdAt: string; displayName?: string; avatarSeed?: string; habitName?: string; habitIcon?: string; guildName?: string }> }>('/api/social/feed');
    return data.events.map(e => ({
        id: e.id,
        userId: e.userId,
        displayName: e.displayName ?? 'Unknown',
        avatarSeed: e.avatarSeed,
        eventType: e.eventType as FeedEventType,
        communityHabitName: e.habitName,
        communityHabitIcon: e.habitIcon,
        guildName: e.guildName,
        metadata: e.metadata,
        createdAt: String(e.createdAt),
    }));
}

export async function fetchFriends(): Promise<Friend[]> {
    const data = await getJson<{ friends: Array<{ id: string; friendId: string; status: string; createdAt: string; displayName?: string; avatarSeed?: string; email: string; level?: number; xp?: number }> }>('/api/social/friends');
    return data.friends.map(f => ({
        id: f.id,
        userId: f.friendId,
        displayName: f.displayName ?? f.email.split('@')[0],
        email: f.email,
        avatarSeed: f.avatarSeed,
        level: f.level ?? 1,
        weeklyXp: 0,
        status: f.status as Friend['status'],
        mutualHabits: [],
    }));
}

export async function sendFriendRequest(emailOrUsername: string): Promise<{ ok: boolean }> {
    const r = await apiFetch('/api/social/friends/request', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername }),
    });
    if (!r.ok) {
        throw new Error(`${r.status}: ${await parseErrorResponse(r)}`);
    }
    return { ok: true };
}

export async function acceptFriendRequest(userId: string): Promise<{ ok: boolean }> {
    const r = await apiFetch(`/api/social/friends/${userId}/accept`, { method: 'POST' });
    await throwIfNotOk(r);
    return { ok: true };
}

export async function removeFriend(userId: string): Promise<{ ok: boolean }> {
    const r = await apiFetch(`/api/social/friends/${userId}`, { method: 'DELETE' });
    await throwIfNotOk(r);
    return { ok: true };
}
