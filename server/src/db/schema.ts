import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    integer,
    date,
    jsonb,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name'),
    bio: text('bio'),
    avatarSeed: text('avatar_seed'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const habits = pgTable('habits', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    category: text('category').notNull(),
    color: text('color').notNull(),
    icon: text('icon').notNull(),
    difficulty: text('difficulty'),
    schedule: jsonb('schedule'),
    dailyTarget: integer('daily_target'),
    goalValue: integer('goal_value'),
    unit: text('unit'),
    startDate: date('start_date', { mode: 'string' }),
    endDate: date('end_date', { mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    archived: boolean('archived').notNull().default(false),
});

export const habitCompletions = pgTable(
    'habit_completions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        habitId: uuid('habit_id')
            .notNull()
            .references(() => habits.id, { onDelete: 'cascade' }),
        completedDate: date('completed_date', { mode: 'string' }).notNull(),
        completed: boolean('completed').notNull().default(true),
        value: integer('value'),
        note: text('note'),
        frozen: boolean('frozen').default(false),
    },
    (t) => [uniqueIndex('habit_completions_habit_id_completed_date').on(t.habitId, t.completedDate)],
);

export const goals = pgTable('goals', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    habitId: uuid('habit_id')
        .notNull()
        .references(() => habits.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    targetValue: integer('target_value').notNull(),
    unit: text('unit').notNull(),
    deadline: date('deadline', { mode: 'string' }),
    achieved: boolean('achieved').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export const routines = pgTable('routines', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon').notNull(),
    habitIds: jsonb('habit_ids').notNull().$type<string[]>(),
    bonusXp: integer('bonus_xp').notNull(),
    completionTime: integer('completion_time'),
});

export const userStats = pgTable('user_stats', {
    userId: uuid('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    level: integer('level').notNull(),
    xp: integer('xp').notNull(),
    nextLevelXp: integer('next_level_xp').notNull(),
    accountCreatedDate: timestamp('account_created_date', { withTimezone: true }).notNull(),
    attributes: jsonb('attributes').notNull(),
    unlockedCollectibles: jsonb('unlocked_collectibles').notNull().$type<string[]>(),
    achievements: jsonb('achievements').notNull().$type<{ id: string; unlockedAt: string }[]>(),
});

export const communityHabits = pgTable('community_habits', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique(),
    name: text('name').notNull(),
    icon: text('icon').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    unit: text('unit'),
    dailyTarget: integer('daily_target'),
    goalValue: integer('goal_value'),
    isFeatured: boolean('is_featured').default(false),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const guilds = pgTable('guilds', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    icon: text('icon').notNull().default('⚔️'),
    bannerColor: text('banner_color').notNull().default('#6366f1'),
    communityHabitId: uuid('community_habit_id')
        .references(() => communityHabits.id, { onDelete: 'cascade' }),
    isPublic: boolean('is_public').default(true).notNull(),
    maxMembers: integer('max_members').default(50).notNull(),
    memberCount: integer('member_count').default(1).notNull(),
    ownerId: uuid('owner_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    totalXp: integer('total_xp').default(0).notNull(),
    weeklyXp: integer('weekly_xp').default(0).notNull(),
    ladderTier: text('ladder_tier').default('Iron').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userCommunityHabits = pgTable(
    'user_community_habits',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        communityHabitId: uuid('community_habit_id')
            .notNull()
            .references(() => communityHabits.id, { onDelete: 'cascade' }),
        joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
    },
    (t) => [uniqueIndex('user_community_habits_user_id_community_habit_id').on(t.userId, t.communityHabitId)],
);

export const communityHabitXp = pgTable(
    'community_habit_xp',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        communityHabitId: uuid('community_habit_id')
            .notNull()
            .references(() => communityHabits.id, { onDelete: 'cascade' }),
        xp: integer('xp').default(0).notNull(),
        level: integer('level').default(1).notNull(),
        streak: integer('streak').default(0).notNull(),
        bestStreak: integer('best_streak').default(0).notNull(),
        totalCompletions: integer('total_completions').default(0).notNull(),
        lastCompletedDate: date('last_completed_date', { mode: 'string' }),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (t) => [uniqueIndex('community_habit_xp_user_id_community_habit_id').on(t.userId, t.communityHabitId)],
);

export const weeklyLeaderboard = pgTable(
    'weekly_leaderboard',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        communityHabitId: uuid('community_habit_id')
            .references(() => communityHabits.id, { onDelete: 'cascade' }),
        guildId: uuid('guild_id')
            .references(() => guilds.id, { onDelete: 'cascade' }),
        weekStart: date('week_start', { mode: 'string' }).notNull(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        score: integer('score').notNull().default(0),
        completions: integer('completions').notNull().default(0),
        rank: integer('rank'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (t) => [uniqueIndex('weekly_leaderboard_habit_guild_week_user').on(t.communityHabitId, t.guildId, t.weekStart, t.userId)],
);

export const guildMembers = pgTable(
    'guild_members',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        guildId: uuid('guild_id')
            .notNull()
            .references(() => guilds.id, { onDelete: 'cascade' }),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        role: text('role').notNull().default('member'),
        joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
        weeklyXp: integer('weekly_xp').default(0).notNull(),
        totalXp: integer('total_xp').default(0).notNull(),
    },
    (t) => [uniqueIndex('guild_members_guild_id_user_id').on(t.guildId, t.userId)],
);

export const guildLadderHistory = pgTable('guild_ladder_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    guildId: uuid('guild_id')
        .notNull()
        .references(() => guilds.id, { onDelete: 'cascade' }),
    seasonNumber: integer('season_number').notNull(),
    startRank: text('start_rank').notNull(),
    endRank: text('end_rank').notNull(),
    xpEarned: integer('xp_earned').notNull().default(0),
    seasonStart: date('season_start', { mode: 'string' }).notNull(),
    seasonEnd: date('season_end', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const socialFeed = pgTable('social_feed', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    communityHabitId: uuid('community_habit_id')
        .references(() => communityHabits.id, { onDelete: 'cascade' }),
    guildId: uuid('guild_id')
        .references(() => guilds.id, { onDelete: 'cascade' }),
    metadata: jsonb('metadata').notNull().default({}),
    isPublic: boolean('is_public').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const friendships = pgTable(
    'friendships',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        friendId: uuid('friend_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        status: text('status').notNull().default('pending'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    },
    (t) => [uniqueIndex('friendships_user_id_friend_id').on(t.userId, t.friendId)],
);

export const habitChallenges = pgTable('habit_challenges', {
    id: uuid('id').primaryKey().defaultRandom(),
    challengerId: uuid('challenger_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    challengeeId: uuid('challengee_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    communityHabitId: uuid('community_habit_id')
        .notNull()
        .references(() => communityHabits.id, { onDelete: 'cascade' }),
    durationDays: integer('duration_days').notNull().default(7),
    status: text('status').notNull().default('pending'),
    challengerScore: integer('challenger_score').default(0).notNull(),
    challengeeScore: integer('challengee_score').default(0).notNull(),
    winnerId: uuid('winner_id')
        .references(() => users.id, { onDelete: 'set null' }),
    startDate: date('start_date', { mode: 'string' }),
    endDate: date('end_date', { mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
