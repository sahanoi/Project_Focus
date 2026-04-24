import { Hono } from 'hono';
import { eq, and, or, desc, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { resolveUserFromRequest } from '../auth/session.js';

const friendRequestSchema = z.object({
    emailOrUsername: z.string().min(1).max(256),
});

export const socialRoutes = new Hono();

// GET /feed
socialRoutes.get('/feed', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const acceptedFriendships = await db
        .select({ friendId: schema.friendships.friendId })
        .from(schema.friendships)
        .where(
            and(
                eq(schema.friendships.userId, user.id),
                eq(schema.friendships.status, 'accepted'),
            ),
        );
    const friendIds = acceptedFriendships.map((f) => f.friendId);

    let guildPeerIds: string[] = [];
    const userGuilds = await db
        .select({ guildId: schema.guildMembers.guildId })
        .from(schema.guildMembers)
        .where(eq(schema.guildMembers.userId, user.id));

    if (userGuilds.length > 0) {
        const guildIds = userGuilds.map((g) => g.guildId);
        const peers = await db
            .select({ userId: schema.guildMembers.userId })
            .from(schema.guildMembers)
            .where(inArray(schema.guildMembers.guildId, guildIds));
        guildPeerIds = peers.map((p) => p.userId);
    }

    const visibleUserIds = [...new Set([user.id, ...friendIds, ...guildPeerIds])];

    const events = await db
        .select({
            id: schema.socialFeed.id,
            userId: schema.socialFeed.userId,
            eventType: schema.socialFeed.eventType,
            communityHabitId: schema.socialFeed.communityHabitId,
            guildId: schema.socialFeed.guildId,
            metadata: schema.socialFeed.metadata,
            isPublic: schema.socialFeed.isPublic,
            createdAt: schema.socialFeed.createdAt,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
            habitName: schema.communityHabits.name,
            habitIcon: schema.communityHabits.icon,
            guildName: schema.guilds.name,
        })
        .from(schema.socialFeed)
        .innerJoin(schema.users, eq(schema.socialFeed.userId, schema.users.id))
        .leftJoin(
            schema.communityHabits,
            eq(schema.socialFeed.communityHabitId, schema.communityHabits.id),
        )
        .leftJoin(schema.guilds, eq(schema.socialFeed.guildId, schema.guilds.id))
        .where(inArray(schema.socialFeed.userId, visibleUserIds))
        .orderBy(desc(schema.socialFeed.createdAt))
        .limit(50);

    return c.json({ events });
});

// GET /friends
socialRoutes.get('/friends', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const friends = await db
        .select({
            id: schema.friendships.id,
            friendId: schema.friendships.friendId,
            status: schema.friendships.status,
            createdAt: schema.friendships.createdAt,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
            email: schema.users.email,
            level: schema.userStats.level,
            xp: schema.userStats.xp,
        })
        .from(schema.friendships)
        .innerJoin(schema.users, eq(schema.friendships.friendId, schema.users.id))
        .leftJoin(schema.userStats, eq(schema.friendships.friendId, schema.userStats.userId))
        .where(eq(schema.friendships.userId, user.id));

    return c.json({ friends });
});

// POST /friends/request
socialRoutes.post('/friends/request', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    let body: z.infer<typeof friendRequestSchema>;
    try {
        body = friendRequestSchema.parse(await c.req.json());
    } catch {
        return c.json({ error: 'Invalid body' }, 400);
    }

    const val = body.emailOrUsername.trim().toLowerCase();

    const targetRows = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(
            or(
                sql`lower(${schema.users.email}) = ${val}`,
                sql`lower(${schema.users.displayName}) = ${val}`,
            ),
        )
        .limit(1);

    const target = targetRows[0];
    if (!target) return c.json({ error: 'User not found' }, 404);
    if (target.id === user.id) return c.json({ error: 'Cannot add yourself' }, 400);

    const existing = await db
        .select({ id: schema.friendships.id })
        .from(schema.friendships)
        .where(
            and(
                eq(schema.friendships.userId, user.id),
                eq(schema.friendships.friendId, target.id),
            ),
        )
        .limit(1);
    if (existing.length > 0) return c.json({ error: 'Friendship already exists' }, 409);

    await db.insert(schema.friendships).values({
        userId: user.id,
        friendId: target.id,
        status: 'pending',
    });

    return c.json({ ok: true });
});

// GET /friends/requests  — defined before /friends/:userId to avoid route shadowing
socialRoutes.get('/friends/requests', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const requests = await db
        .select({
            id: schema.friendships.id,
            userId: schema.friendships.userId,
            createdAt: schema.friendships.createdAt,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
            email: schema.users.email,
        })
        .from(schema.friendships)
        .innerJoin(schema.users, eq(schema.friendships.userId, schema.users.id))
        .where(
            and(
                eq(schema.friendships.friendId, user.id),
                eq(schema.friendships.status, 'pending'),
            ),
        );

    return c.json({ requests });
});

// POST /friends/:userId/accept
socialRoutes.post('/friends/:userId/accept', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { userId } = c.req.param();

    const updated = await db
        .update(schema.friendships)
        .set({ status: 'accepted' })
        .where(
            and(
                eq(schema.friendships.userId, userId),
                eq(schema.friendships.friendId, user.id),
                eq(schema.friendships.status, 'pending'),
            ),
        )
        .returning();

    if (updated.length === 0) return c.json({ error: 'Friendship request not found' }, 404);

    // Create reciprocal accepted friendship so both sides can see each other in /friends
    await db
        .insert(schema.friendships)
        .values({
            userId: user.id,
            friendId: userId,
            status: 'accepted',
        })
        .onConflictDoNothing();

    return c.json({ ok: true });
});

// DELETE /friends/:userId
socialRoutes.delete('/friends/:userId', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { userId } = c.req.param();

    await db
        .delete(schema.friendships)
        .where(
            or(
                and(
                    eq(schema.friendships.userId, user.id),
                    eq(schema.friendships.friendId, userId),
                ),
                and(
                    eq(schema.friendships.userId, userId),
                    eq(schema.friendships.friendId, user.id),
                ),
            ),
        );

    return c.json({ ok: true });
});
