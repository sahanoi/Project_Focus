// ==========================================
// Habit Tracker - Type Definitions
// ==========================================

export type HabitType = 'regular' | 'numerical' | 'infinite' | 'challenge';

export type HabitCategory =
    | 'health'
    | 'fitness'
    | 'learning'
    | 'productivity'
    | 'mindfulness'
    | 'social'
    | 'finance'
    | 'creativity'
    | 'other';

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; icon: string }[] = [
    { value: 'health', label: 'Health', icon: '❤️' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'productivity', label: 'Productivity', icon: '⚡' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' },
    { value: 'other', label: 'Other', icon: '📌' },
];

export const HABIT_COLORS = [
    '#2563EB', // primary blue
    '#10B981', // success green
    '#F59E0B', // warning amber
    '#EF4444', // danger red
    '#8B5CF6', // purple
    '#14B8A6', // teal
    '#EC4899', // pink
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
];

// ==========================================
// Emoji Picker Icons
// ==========================================

export const HABIT_EMOJIS = [
    '✅', '💪', '🏃', '🧘', '📚', '💧', '🍎', '😴', '💊',
    '🎯', '📝', '💰', '🎨', '🎵', '🧹', '🚶', '🏋️', '🧠',
    '☀️', '🌙', '🍳', '🥗', '🫀', '🦷', '👀', '🧘‍♂️', '🚴',
    '⏰', '🔥', '💎', '🌿', '📱', '🎮', '☕', '🛌', '🚿',
];

// ==========================================
// Scheduling
// ==========================================

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface HabitSchedule {
    type: ScheduleType;
    daysOfWeek?: number[];    // 0=Sun..6=Sat (for 'weekly')
    daysOfMonth?: number[];   // 1-31 (for 'monthly')
    customInterval?: number;  // every N days (for 'custom')
}

// ==========================================
// Core Interfaces
// ==========================================

export interface Completion {
    date: string; // 'YYYY-MM-DD'
    completed: boolean;
    value?: number; // for numerical habits
}

// ==========================================
//  RPG / Gamification Types
// ==========================================

export interface CharacterStats {
    level: number;
    xp: number;
    nextLevelXp: number;
    attributes: {
        ovr: number; // Overall Rating (weighted average)
        dsc: number; // Discipline (daily habit completion rate)
        foc: number; // Focus (numerical target hit-rate)
        stk: number; // Streak (average streak consistency)
        bal: number; // Balance (category diversity)
        grt: number; // Grit (longest streak average)
        vit: number; // Vitality (health & fitness performance)
    };
}

export interface Routine {
    id: string;
    name: string;
    description?: string;
    icon: string;
    habitIds: string[]; // Ordered list of habits in this routine
    bonusXp: number;    // XP reward for full completion
    completionTime?: number; // Optional target time in minutes
}

export interface Habit {
    id: string;
    name: string;
    type: HabitType;
    category: HabitCategory;
    color: string;
    icon: string;
    difficulty?: 'easy' | 'medium' | 'hard'; // For XP calculation

    // Scheduling
    schedule?: HabitSchedule;

    // Daily completion target (min value for "Life Line" alive status)
    dailyTarget?: number;

    // Numerical habits
    goalValue?: number;
    unit?: string;

    // Challenge habits
    startDate?: string; // 'YYYY-MM-DD'
    endDate?: string;   // 'YYYY-MM-DD'

    // Tracking
    completions: Record<string, Completion>; // keyed by 'YYYY-MM-DD'
    createdAt: string;
    archived: boolean;
}

export interface Goal {
    id: string;
    habitId: string;
    name: string;
    targetValue: number;
    unit: string;
    deadline?: string; // 'YYYY-MM-DD'
    achieved: boolean;
    createdAt: string;
}

export type TabView = 'dashboard' | 'statistics' | 'settings';

export type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface DateRangeValue {
    start: string;
    end: string;
}

export interface StatsFilter {
    dateRange: DateRange;
    habitType: HabitType | 'all';
    habitId: string | 'all';
}

// ==========================================
// Pre-planned Habit Templates
// ==========================================

export interface HabitTemplate {
    name: string;
    icon: string;
    type: HabitType;
    category: HabitCategory;
    color: string;
    schedule: HabitSchedule;
    goalValue?: number;
    unit?: string;
    dailyTarget?: number;
}

export const HABIT_TEMPLATES: Record<HabitCategory, HabitTemplate[]> = {
    health: [
        { name: 'Drink Water', icon: '💧', type: 'numerical', category: 'health', color: '#2563EB', schedule: { type: 'daily' }, goalValue: 8, unit: 'glasses', dailyTarget: 6 },
        { name: 'Take Vitamins', icon: '💊', type: 'regular', category: 'health', color: '#10B981', schedule: { type: 'daily' } },
        { name: 'Sleep 8 Hours', icon: '😴', type: 'numerical', category: 'health', color: '#8B5CF6', schedule: { type: 'daily' }, goalValue: 8, unit: 'hours', dailyTarget: 7 },
        { name: 'No Junk Food', icon: '🍎', type: 'infinite', category: 'health', color: '#EF4444', schedule: { type: 'daily' } },
        { name: 'Brush Teeth', icon: '🦷', type: 'regular', category: 'health', color: '#14B8A6', schedule: { type: 'daily' } },
    ],
    fitness: [
        { name: 'Morning Run', icon: '🏃', type: 'numerical', category: 'fitness', color: '#F59E0B', schedule: { type: 'weekly', daysOfWeek: [1, 3, 5] }, goalValue: 5, unit: 'km', dailyTarget: 2 },
        { name: 'Push-ups', icon: '💪', type: 'numerical', category: 'fitness', color: '#EF4444', schedule: { type: 'daily' }, goalValue: 50, unit: 'reps', dailyTarget: 30 },
        { name: 'Gym Session', icon: '🏋️', type: 'regular', category: 'fitness', color: '#14B8A6', schedule: { type: 'weekly', daysOfWeek: [1, 2, 4, 5] } },
        { name: 'Stretching', icon: '🧘', type: 'regular', category: 'fitness', color: '#EC4899', schedule: { type: 'daily' } },
        { name: 'Cycling', icon: '🚴', type: 'numerical', category: 'fitness', color: '#06B6D4', schedule: { type: 'weekly', daysOfWeek: [0, 6] }, goalValue: 20, unit: 'km' },
    ],
    learning: [
        { name: 'Read 30 min', icon: '📚', type: 'numerical', category: 'learning', color: '#2563EB', schedule: { type: 'daily' }, goalValue: 30, unit: 'min', dailyTarget: 15 },
        { name: 'Practice Coding', icon: '🧠', type: 'numerical', category: 'learning', color: '#8B5CF6', schedule: { type: 'daily' }, goalValue: 60, unit: 'min', dailyTarget: 30 },
        { name: 'Learn New Word', icon: '📝', type: 'regular', category: 'learning', color: '#F97316', schedule: { type: 'daily' } },
        { name: 'Online Course', icon: '🎓', type: 'numerical', category: 'learning', color: '#10B981', schedule: { type: 'weekly', daysOfWeek: [1, 3, 5] }, goalValue: 45, unit: 'min' },
    ],
    productivity: [
        { name: 'Morning Routine', icon: '☀️', type: 'regular', category: 'productivity', color: '#F59E0B', schedule: { type: 'daily' } },
        { name: 'Plan Tomorrow', icon: '📝', type: 'regular', category: 'productivity', color: '#2563EB', schedule: { type: 'daily' } },
        { name: 'No Social Media', icon: '📱', type: 'infinite', category: 'productivity', color: '#EF4444', schedule: { type: 'daily' } },
        { name: 'Deep Work', icon: '⚡', type: 'numerical', category: 'productivity', color: '#8B5CF6', schedule: { type: 'daily' }, goalValue: 120, unit: 'min', dailyTarget: 60 },
    ],
    mindfulness: [
        { name: 'Meditate', icon: '🧘‍♂️', type: 'numerical', category: 'mindfulness', color: '#14B8A6', schedule: { type: 'daily' }, goalValue: 15, unit: 'min', dailyTarget: 5 },
        { name: 'Journal', icon: '📝', type: 'regular', category: 'mindfulness', color: '#8B5CF6', schedule: { type: 'daily' } },
        { name: 'Gratitude List', icon: '🌿', type: 'regular', category: 'mindfulness', color: '#10B981', schedule: { type: 'daily' } },
        { name: 'Digital Detox', icon: '📵', type: 'regular', category: 'mindfulness', color: '#EF4444', schedule: { type: 'weekly', daysOfWeek: [0] } },
    ],
    social: [
        { name: 'Call Family', icon: '📞', type: 'regular', category: 'social', color: '#EC4899', schedule: { type: 'weekly', daysOfWeek: [0, 6] } },
        { name: 'Connect with Friend', icon: '👥', type: 'regular', category: 'social', color: '#2563EB', schedule: { type: 'weekly', daysOfWeek: [3] } },
        { name: 'Random Act of Kindness', icon: '💝', type: 'regular', category: 'social', color: '#F59E0B', schedule: { type: 'daily' } },
    ],
    finance: [
        { name: 'Track Expenses', icon: '💰', type: 'regular', category: 'finance', color: '#10B981', schedule: { type: 'daily' } },
        { name: 'Save Money', icon: '💎', type: 'numerical', category: 'finance', color: '#F59E0B', schedule: { type: 'monthly', daysOfMonth: [1] }, goalValue: 500, unit: 'TL' },
        { name: 'No Impulse Buying', icon: '🛑', type: 'infinite', category: 'finance', color: '#EF4444', schedule: { type: 'daily' } },
    ],
    creativity: [
        { name: 'Draw / Sketch', icon: '🎨', type: 'regular', category: 'creativity', color: '#EC4899', schedule: { type: 'daily' } },
        { name: 'Practice Music', icon: '🎵', type: 'numerical', category: 'creativity', color: '#8B5CF6', schedule: { type: 'daily' }, goalValue: 30, unit: 'min', dailyTarget: 15 },
        { name: 'Write / Blog', icon: '✍️', type: 'numerical', category: 'creativity', color: '#2563EB', schedule: { type: 'daily' }, goalValue: 500, unit: 'words' },
    ],
    other: [
        { name: 'Clean Room', icon: '🧹', type: 'regular', category: 'other', color: '#14B8A6', schedule: { type: 'weekly', daysOfWeek: [6] } },
        { name: 'Skincare Routine', icon: '🧴', type: 'regular', category: 'other', color: '#EC4899', schedule: { type: 'daily' } },
        { name: 'Water Plants', icon: '🌱', type: 'regular', category: 'other', color: '#10B981', schedule: { type: 'weekly', daysOfWeek: [1, 4] } },
    ],
};
