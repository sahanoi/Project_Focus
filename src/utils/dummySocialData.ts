import { CharacterStats } from '../types';

export interface SocialUser {
    id: string;
    name: string;
    avatarUrl: string;
    level: number;
    xpThisWeek: number;
    stats: CharacterStats;
    badges: { id: string; name: string; icon: string; tier: string }[];
    activeStreaks: { name: string; days: number; icon: string }[];
}

export interface FeedEvent {
    id: string;
    userId: string;
    type: 'level_up' | 'achievement' | 'streak_milestone' | 'habit_completed';
    timestamp: string; // ISO string
    message: string;
    details?: string;
    icon: string;
}

// =====================================
// Simulated Friends Data
// =====================================

export const DUMMY_FRIENDS: SocialUser[] = [
    {
        id: 'user_1',
        name: 'Alex Rivera',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4',
        level: 14,
        xpThisWeek: 2150,
        stats: {
            level: 14, xp: 21500, nextLevelXp: 25000, accountCreatedDate: '2024-01-01T00:00:00.000Z',
            attributes: { ovr: 72, dsc: 85, foc: 68, stk: 75, bal: 60, grt: 80, vit: 65 }
        },
        badges: [
            { id: 'b1', name: 'Centurion', icon: '💎', tier: 'diamond' },
            { id: 'b2', name: 'Perfect Week', icon: '💯', tier: 'gold' },
            { id: 'b3', name: 'Monthly Master', icon: '👑', tier: 'gold' }
        ],
        activeStreaks: [
            { name: 'Morning Run', days: 42, icon: '🏃' },
            { name: 'Read 10 Pages', days: 15, icon: '📚' }
        ]
    },
    {
        id: 'user_2',
        name: 'Sarah Chen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf',
        level: 8,
        xpThisWeek: 1850,
        stats: {
            level: 8, xp: 8500, nextLevelXp: 10000, accountCreatedDate: '2024-01-01T00:00:00.000Z',
            attributes: { ovr: 65, dsc: 60, foc: 70, stk: 65, bal: 80, grt: 60, vit: 55 }
        },
        badges: [
            { id: 'b4', name: 'Week Warrior', icon: '⚔️', tier: 'bronze' },
            { id: 'b5', name: 'Half Century', icon: '✅', tier: 'bronze' }
        ],
        activeStreaks: [
            { name: 'Meditation', days: 12, icon: '🧘‍♀️' },
            { name: 'Drink Water', days: 25, icon: '💧' }
        ]
    },
    {
        id: 'user_3',
        name: 'Marcus Johnson',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=c0aede',
        level: 21,
        xpThisWeek: 3400,
        stats: {
            level: 21, xp: 45000, nextLevelXp: 50000, accountCreatedDate: '2024-01-01T00:00:00.000Z',
            attributes: { ovr: 88, dsc: 95, foc: 85, stk: 90, bal: 75, grt: 98, vit: 80 }
        },
        badges: [
            { id: 'b6', name: 'Legend', icon: '⭐', tier: 'gold' },
            { id: 'b1', name: 'Centurion', icon: '💎', tier: 'diamond' },
            { id: 'b7', name: 'Immortal', icon: '🌟', tier: 'diamond' }
        ],
        activeStreaks: [
            { name: 'Deep Work', days: 104, icon: '🧠' },
            { name: 'Gym Session', days: 60, icon: '🏋️' },
            { name: 'Journaling', days: 100, icon: '📝' }
        ]
    },
    {
        id: 'user_4',
        name: 'Elena Rostova',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&backgroundColor=ffb7b2',
        level: 11,
        xpThisWeek: 950,
        stats: {
            level: 11, xp: 15000, nextLevelXp: 18000, accountCreatedDate: '2024-01-01T00:00:00.000Z',
            attributes: { ovr: 68, dsc: 65, foc: 60, stk: 70, bal: 75, grt: 65, vit: 85 }
        },
        badges: [
            { id: 'b8', name: 'Juggler', icon: '🤹', tier: 'bronze' },
            { id: 'b9', name: 'Fortnight Force', icon: '🛡️', tier: 'silver' }
        ],
        activeStreaks: [
            { name: 'Yoga', days: 18, icon: '🧘' }
        ]
    }
];

// =====================================
// Simulated Feed Data
// =====================================

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

export const DUMMY_FEED: FeedEvent[] = [
    {
        id: 'f1',
        userId: 'user_3',
        type: 'streak_milestone',
        timestamp: hoursAgo(2),
        message: 'Marcus Johnson reached a 100-day streak!',
        details: 'Deep Work (🧠)',
        icon: '🔥'
    },
    {
        id: 'f2',
        userId: 'user_1',
        type: 'level_up',
        timestamp: hoursAgo(5),
        message: 'Alex Rivera reached Level 14',
        details: '+5 OVR increase',
        icon: '🏆'
    },
    {
        id: 'f3',
        userId: 'user_2',
        type: 'achievement',
        timestamp: hoursAgo(12),
        message: 'Sarah Chen unlocked "Week Warrior"',
        details: 'Bronze Achievement',
        icon: '⚔️'
    },
    {
        id: 'f4',
        userId: 'user_4',
        type: 'habit_completed',
        timestamp: hoursAgo(24),
        message: 'Elena Rostova crushed Yoga',
        details: '+100 XP (Hard Difficulty)',
        icon: '✅'
    },
    {
        id: 'f5',
        userId: 'user_3',
        type: 'achievement',
        timestamp: hoursAgo(48),
        message: 'Marcus Johnson unlocked "Legend"',
        details: 'Gold Achievement',
        icon: '⭐'
    }
];
