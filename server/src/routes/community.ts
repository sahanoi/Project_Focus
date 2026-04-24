import { Hono } from 'hono';
import { eq, and, isNull, desc, asc, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { resolveUserFromRequest } from '../auth/session.js';

const BASE_XP = 50;
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 100];

function getWeekStart(offset = 0): string {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + offset * 7);
    return d.toISOString().split('T')[0];
}

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function computeTier(xp: number): string {
    if (xp >= 25000) return 'Master';
    if (xp >= 10000) return 'Diamond';
    if (xp >= 4000) return 'Platinum';
    if (xp >= 1500) return 'Gold';
    if (xp >= 500) return 'Silver';
    return 'Bronze';
}

function computeLevel(xp: number): number {
    return Math.floor(xp / 50) + 1;
}

function computeGuildTier(weeklyXp: number): string {
    if (weeklyXp >= 250000) return 'Master';
    if (weeklyXp >= 100000) return 'Diamond';
    if (weeklyXp >= 40000) return 'Platinum';
    if (weeklyXp >= 15000) return 'Gold';
    if (weeklyXp >= 5000) return 'Silver';
    if (weeklyXp >= 1000) return 'Bronze';
    return 'Iron';
}

/**
 * Safely upsert a weekly leaderboard row.
 * PostgreSQL unique index with nullable columns treats NULL != NULL, so we use
 * SELECT + conditional UPDATE/INSERT instead of onConflictDoUpdate.
 */
async function upsertWeeklyLeaderboard(
    communityHabitId: string | null,
    guildId: string | null,
    weekStart: string,
    userId: string,
    xpEarned: number,
): Promise<void> {
    const condition = and(
        communityHabitId
            ? eq(schema.weeklyLeaderboard.communityHabitId, communityHabitId)
            : isNull(schema.weeklyLeaderboard.communityHabitId),
        guildId
            ? eq(schema.weeklyLeaderboard.guildId, guildId)
            : isNull(schema.weeklyLeaderboard.guildId),
        eq(schema.weeklyLeaderboard.weekStart, weekStart),
        eq(schema.weeklyLeaderboard.userId, userId),
    );

    const existing = await db
        .select({ id: schema.weeklyLeaderboard.id })
        .from(schema.weeklyLeaderboard)
        .where(condition)
        .limit(1);

    if (existing.length > 0) {
        await db
            .update(schema.weeklyLeaderboard)
            .set({
                score: sql`${schema.weeklyLeaderboard.score} + ${xpEarned}`,
                completions: sql`${schema.weeklyLeaderboard.completions} + 1`,
            })
            .where(eq(schema.weeklyLeaderboard.id, existing[0].id));
    } else {
        await db.insert(schema.weeklyLeaderboard).values({
            communityHabitId,
            guildId,
            weekStart,
            userId,
            score: xpEarned,
            completions: 1,
        });
    }
}

export const communityRoutes = new Hono();

// GET /habits
communityRoutes.get('/habits', async (c) => {
    const user = await resolveUserFromRequest(c);

    const habits = await db
        .select()
        .from(schema.communityHabits)
        .orderBy(asc(schema.communityHabits.sortOrder), asc(schema.communityHabits.name));

    if (habits.length === 0) return c.json({ habits: [] });

    const habitIds = habits.map((h) => h.id);
    const weekStart = getWeekStart();

    const participantCounts = await db
        .select({
            communityHabitId: schema.userCommunityHabits.communityHabitId,
            count: sql<number>`cast(count(*) as int)`,
        })
        .from(schema.userCommunityHabits)
        .where(inArray(schema.userCommunityHabits.communityHabitId, habitIds))
        .groupBy(schema.userCommunityHabits.communityHabitId);

    const weeklyCounts = await db
        .select({
            communityHabitId: schema.weeklyLeaderboard.communityHabitId,
            totalCompletions: sql<number>`cast(coalesce(sum(${schema.weeklyLeaderboard.completions}), 0) as int)`,
        })
        .from(schema.weeklyLeaderboard)
        .where(
            and(
                inArray(schema.weeklyLeaderboard.communityHabitId, habitIds),
                isNull(schema.weeklyLeaderboard.guildId),
                eq(schema.weeklyLeaderboard.weekStart, weekStart),
            ),
        )
        .groupBy(schema.weeklyLeaderboard.communityHabitId);

    let joinedIds = new Set<string>();
    if (user) {
        const joined = await db
            .select({ communityHabitId: schema.userCommunityHabits.communityHabitId })
            .from(schema.userCommunityHabits)
            .where(eq(schema.userCommunityHabits.userId, user.id));
        joinedIds = new Set(joined.map((j) => j.communityHabitId));
    }

    const participantMap = new Map(participantCounts.map((p) => [p.communityHabitId, p.count]));
    const weeklyMap = new Map(
        weeklyCounts.map((w) => [w.communityHabitId, w.totalCompletions]),
    );

    return c.json({
        habits: habits.map((h) => ({
            ...h,
            participantCount: participantMap.get(h.id) ?? 0,
            totalCompletionsThisWeek: weeklyMap.get(h.id) ?? 0,
            isJoined: joinedIds.has(h.id),
        })),
    });
});

// GET /habits/:slug
communityRoutes.get('/habits/:slug', async (c) => {
    const { slug } = c.req.param();
    const user = await resolveUserFromRequest(c);

    const rows = await db
        .select()
        .from(schema.communityHabits)
        .where(eq(schema.communityHabits.slug, slug))
        .limit(1);
    const habit = rows[0];
    if (!habit) return c.json({ error: 'Not found' }, 404);

    const weekStart = getWeekStart();

    const [participantRow] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.userCommunityHabits)
        .where(eq(schema.userCommunityHabits.communityHabitId, habit.id));

    const [weeklyRow] = await db
        .select({
            total: sql<number>`cast(coalesce(sum(${schema.weeklyLeaderboard.completions}), 0) as int)`,
        })
        .from(schema.weeklyLeaderboard)
        .where(
            and(
                eq(schema.weeklyLeaderboard.communityHabitId, habit.id),
                isNull(schema.weeklyLeaderboard.guildId),
                eq(schema.weeklyLeaderboard.weekStart, weekStart),
            ),
        );

    const [topStreakRow] = await db
        .select({
            topStreak: sql<number>`cast(coalesce(max(${schema.communityHabitXp.bestStreak}), 0) as int)`,
        })
        .from(schema.communityHabitXp)
        .where(eq(schema.communityHabitXp.communityHabitId, habit.id));

    let userXp = null;
    let isJoined = false;

    if (user) {
        const joinedRows = await db
            .select()
            .from(schema.userCommunityHabits)
            .where(
                and(
                    eq(schema.userCommunityHabits.userId, user.id),
                    eq(schema.userCommunityHabits.communityHabitId, habit.id),
                ),
            )
            .limit(1);
        isJoined = joinedRows.length > 0;

        if (isJoined) {
            const xpRows = await db
                .select()
                .from(schema.communityHabitXp)
                .where(
                    and(
                        eq(schema.communityHabitXp.userId, user.id),
                        eq(schema.communityHabitXp.communityHabitId, habit.id),
                    ),
                )
                .limit(1);
            userXp = xpRows[0] ?? null;
        }
    }

    return c.json({
        habit,
        communityStats: {
            participantCount: participantRow?.count ?? 0,
            totalCompletionsThisWeek: weeklyRow?.total ?? 0,
            topStreak: topStreakRow?.topStreak ?? 0,
        },
        userXp,
        isJoined,
    });
});

// POST /habits/:slug/join
communityRoutes.post('/habits/:slug/join', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { slug } = c.req.param();
    const rows = await db
        .select()
        .from(schema.communityHabits)
        .where(eq(schema.communityHabits.slug, slug))
        .limit(1);
    const habit = rows[0];
    if (!habit) return c.json({ error: 'Not found' }, 404);

    await db
        .insert(schema.userCommunityHabits)
        .values({ userId: user.id, communityHabitId: habit.id })
        .onConflictDoNothing();

    await db
        .insert(schema.communityHabitXp)
        .values({ userId: user.id, communityHabitId: habit.id })
        .onConflictDoNothing();

    return c.json({ ok: true });
});

// POST /habits/:slug/leave
communityRoutes.post('/habits/:slug/leave', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { slug } = c.req.param();
    const rows = await db
        .select()
        .from(schema.communityHabits)
        .where(eq(schema.communityHabits.slug, slug))
        .limit(1);
    const habit = rows[0];
    if (!habit) return c.json({ error: 'Not found' }, 404);

    await db
        .delete(schema.userCommunityHabits)
        .where(
            and(
                eq(schema.userCommunityHabits.userId, user.id),
                eq(schema.userCommunityHabits.communityHabitId, habit.id),
            ),
        );

    return c.json({ ok: true });
});

// POST /habits/:slug/complete
communityRoutes.post('/habits/:slug/complete', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { slug } = c.req.param();

    const habitRows = await db
        .select()
        .from(schema.communityHabits)
        .where(eq(schema.communityHabits.slug, slug))
        .limit(1);
    const habit = habitRows[0];
    if (!habit) return c.json({ error: 'Not found' }, 404);

    const joinedRows = await db
        .select()
        .from(schema.userCommunityHabits)
        .where(
            and(
                eq(schema.userCommunityHabits.userId, user.id),
                eq(schema.userCommunityHabits.communityHabitId, habit.id),
            ),
        )
        .limit(1);
    if (joinedRows.length === 0) return c.json({ error: 'Not joined' }, 400);

    // Ensure XP row exists, then fetch it
    await db
        .insert(schema.communityHabitXp)
        .values({ userId: user.id, communityHabitId: habit.id })
        .onConflictDoNothing();

    const [xpData] = await db
        .select()
        .from(schema.communityHabitXp)
        .where(
            and(
                eq(schema.communityHabitXp.userId, user.id),
                eq(schema.communityHabitXp.communityHabitId, habit.id),
            ),
        )
        .limit(1);

    const today = getTodayString();

    if (xpData.lastCompletedDate === today) {
        return c.json({
            xpEarned: 0,
            newXp: xpData.xp,
            newStreak: xpData.streak,
            newTier: computeTier(xpData.xp),
            leveledUp: false,
            xpData,
        });
    }

    const yesterday = getYesterdayString();
    const newStreak = xpData.lastCompletedDate === yesterday ? xpData.streak + 1 : 1;

    const streakMultiplier = 1 + Math.min(1, newStreak / 30);
    const xpEarned = Math.round(BASE_XP * streakMultiplier);

    const prevXp = xpData.xp;
    const newXp = prevXp + xpEarned;
    const prevLevel = xpData.level;
    const newLevel = computeLevel(newXp);
    const prevTier = computeTier(prevXp);
    const newTier = computeTier(newXp);
    const newBestStreak = Math.max(xpData.bestStreak, newStreak);

    const [updatedXp] = await db
        .update(schema.communityHabitXp)
        .set({
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            bestStreak: newBestStreak,
            totalCompletions: xpData.totalCompletions + 1,
            lastCompletedDate: today,
            updatedAt: new Date(),
        })
        .where(eq(schema.communityHabitXp.id, xpData.id))
        .returning();

    const weekStart = getWeekStart();
    await upsertWeeklyLeaderboard(habit.id, null, weekStart, user.id, xpEarned);
    await upsertWeeklyLeaderboard(null, null, weekStart, user.id, xpEarned);

    // Update XP for all guilds the user belongs to
    const memberGuilds = await db
        .select({ guildId: schema.guildMembers.guildId, weeklyXp: schema.guilds.weeklyXp })
        .from(schema.guildMembers)
        .innerJoin(schema.guilds, eq(schema.guildMembers.guildId, schema.guilds.id))
        .where(eq(schema.guildMembers.userId, user.id));

    for (const { guildId, weeklyXp } of memberGuilds) {
        await db
            .update(schema.guildMembers)
            .set({
                weeklyXp: sql`${schema.guildMembers.weeklyXp} + ${xpEarned}`,
                totalXp: sql`${schema.guildMembers.totalXp} + ${xpEarned}`,
            })
            .where(
                and(
                    eq(schema.guildMembers.guildId, guildId),
                    eq(schema.guildMembers.userId, user.id),
                ),
            );

        const newGuildWeeklyXp = weeklyXp + xpEarned;
        await db
            .update(schema.guilds)
            .set({
                weeklyXp: sql`${schema.guilds.weeklyXp} + ${xpEarned}`,
                totalXp: sql`${schema.guilds.totalXp} + ${xpEarned}`,
                ladderTier: computeGuildTier(newGuildWeeklyXp),
            })
            .where(eq(schema.guilds.id, guildId));
    }

    await db.insert(schema.socialFeed).values({
        userId: user.id,
        eventType: 'habit_completed',
        communityHabitId: habit.id,
        metadata: { habitName: habit.name, xpEarned, streak: newStreak },
    });

    if (STREAK_MILESTONES.includes(newStreak)) {
        await db.insert(schema.socialFeed).values({
            userId: user.id,
            eventType: 'streak_milestone',
            communityHabitId: habit.id,
            metadata: { days: newStreak },
        });
    }

    if (newTier !== prevTier) {
        await db.insert(schema.socialFeed).values({
            userId: user.id,
            eventType: 'tier_up',
            communityHabitId: habit.id,
            metadata: { tier: newTier },
        });
    }

    return c.json({
        xpEarned,
        newXp,
        newStreak,
        newTier,
        leveledUp: newLevel > prevLevel,
        xpData: updatedXp,
    });
});

// GET /habits/:slug/leaderboard
communityRoutes.get('/habits/:slug/leaderboard', async (c) => {
    const user = await resolveUserFromRequest(c);
    const { slug } = c.req.param();
    const scope = c.req.query('scope') ?? 'global';
    const guildId = c.req.query('guildId');
    const week = c.req.query('week') ?? 'current';

    const habitRows = await db
        .select()
        .from(schema.communityHabits)
        .where(eq(schema.communityHabits.slug, slug))
        .limit(1);
    const habit = habitRows[0];
    if (!habit) return c.json({ error: 'Not found' }, 404);

    const weekStart = week === 'prev' ? getWeekStart(-1) : getWeekStart();

    let memberFilter: string[] | null = null;
    if (scope === 'guild' && guildId) {
        const guildMemberRows = await db
            .select({ userId: schema.guildMembers.userId })
            .from(schema.guildMembers)
            .where(eq(schema.guildMembers.guildId, guildId));
        memberFilter = guildMemberRows.map((m) => m.userId);
        if (memberFilter.length === 0) {
            return c.json({ entries: [], weekStart, userRank: null, totalParticipants: 0 });
        }
    }

    const baseWhere = and(
        eq(schema.weeklyLeaderboard.communityHabitId, habit.id),
        isNull(schema.weeklyLeaderboard.guildId),
        eq(schema.weeklyLeaderboard.weekStart, weekStart),
        memberFilter ? inArray(schema.weeklyLeaderboard.userId, memberFilter) : undefined,
    );

    const rows = await db
        .select({
            userId: schema.weeklyLeaderboard.userId,
            score: schema.weeklyLeaderboard.score,
            completions: schema.weeklyLeaderboard.completions,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
            xp: schema.communityHabitXp.xp,
            streak: schema.communityHabitXp.streak,
        })
        .from(schema.weeklyLeaderboard)
        .innerJoin(schema.users, eq(schema.weeklyLeaderboard.userId, schema.users.id))
        .leftJoin(
            schema.communityHabitXp,
            and(
                eq(schema.communityHabitXp.userId, schema.weeklyLeaderboard.userId),
                eq(schema.communityHabitXp.communityHabitId, habit.id),
            ),
        )
        .where(baseWhere)
        .orderBy(desc(schema.weeklyLeaderboard.score))
        .limit(50);

    const [totalRow] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.weeklyLeaderboard)
        .where(baseWhere);

    const entries = rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        displayName: r.displayName,
        avatarSeed: r.avatarSeed,
        score: r.score,
        completions: r.completions,
        tier: computeTier(r.xp ?? 0),
        streak: r.streak ?? 0,
        isCurrentUser: user ? r.userId === user.id : false,
    }));

    const userRankIndex = user ? entries.findIndex((e) => e.userId === user.id) : -1;
    const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

    return c.json({
        entries,
        weekStart,
        userRank,
        totalParticipants: totalRow?.count ?? 0,
    });
});

// GET /leaderboard — global leaderboard (communityHabitId IS NULL)
communityRoutes.get('/leaderboard', async (c) => {
    const user = await resolveUserFromRequest(c);
    const week = c.req.query('week') ?? 'current';
    const weekStart = week === 'prev' ? getWeekStart(-1) : getWeekStart();

    const rows = await db
        .select({
            userId: schema.weeklyLeaderboard.userId,
            score: schema.weeklyLeaderboard.score,
            completions: schema.weeklyLeaderboard.completions,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
            xp: schema.userStats.xp,
            level: schema.userStats.level,
        })
        .from(schema.weeklyLeaderboard)
        .innerJoin(schema.users, eq(schema.weeklyLeaderboard.userId, schema.users.id))
        .leftJoin(schema.userStats, eq(schema.weeklyLeaderboard.userId, schema.userStats.userId))
        .where(
            and(
                isNull(schema.weeklyLeaderboard.communityHabitId),
                isNull(schema.weeklyLeaderboard.guildId),
                eq(schema.weeklyLeaderboard.weekStart, weekStart),
            ),
        )
        .orderBy(desc(schema.weeklyLeaderboard.score))
        .limit(50);

    const [totalRow] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.weeklyLeaderboard)
        .where(
            and(
                isNull(schema.weeklyLeaderboard.communityHabitId),
                isNull(schema.weeklyLeaderboard.guildId),
                eq(schema.weeklyLeaderboard.weekStart, weekStart),
            ),
        );

    const entries = rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        displayName: r.displayName ?? r.userId,
        avatarSeed: r.avatarSeed,
        score: r.score,
        completions: r.completions,
        tier: computeTier(r.xp ?? 0) as string,
        streak: 0,
        isCurrentUser: user ? r.userId === user.id : false,
        movement: 'same' as const,
    }));

    const userRankIndex = user ? entries.findIndex((e) => e.userId === user.id) : -1;
    const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

    return c.json({
        entries,
        weekStart,
        userRank,
        totalParticipants: totalRow?.count ?? 0,
    });
});
