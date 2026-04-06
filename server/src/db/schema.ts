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
