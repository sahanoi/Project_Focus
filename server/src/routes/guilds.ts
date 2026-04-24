import { Hono } from 'hono';
import { eq, and, ne, desc, sql, ilike, lt } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { resolveUserFromRequest } from '../auth/session.js';

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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

function getWeekStart(offset = 0): string {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + offset * 7);
    return d.toISOString().split('T')[0];
}

const createGuildSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(500).optional(),
    icon: z.string().min(1).max(10),
    bannerColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
        .default('#6366f1'),
    communityHabitId: z.string().uuid().optional(),
    isPublic: z.boolean().default(true),
});

const patchGuildSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(500).nullable().optional(),
    icon: z.string().min(1).max(10).optional(),
    bannerColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
    isPublic: z.boolean().optional(),
});

export const guildRoutes = new Hono();

// GET /
guildRoutes.get('/', async (c) => {
    const user = await resolveUserFromRequest(c);
    const search = c.req.query('search');
    const communityHabitId = c.req.query('communityHabitId');
    const mine = c.req.query('mine') === 'true';
    const showFull = c.req.query('showFull') === 'true';

    if (mine) {
        if (!user) return c.json({ error: 'Unauthorized' }, 401);
    }

    if (mine && user) {
        const myGuilds = await db
            .select({
                id: schema.guilds.id,
                name: schema.guilds.name,
                slug: schema.guilds.slug,
                description: schema.guilds.description,
                icon: schema.guilds.icon,
                bannerColor: schema.guilds.bannerColor,
                communityHabitId: schema.guilds.communityHabitId,
                isPublic: schema.guilds.isPublic,
                maxMembers: schema.guilds.maxMembers,
                memberCount: schema.guilds.memberCount,
                ownerId: schema.guilds.ownerId,
                totalXp: schema.guilds.totalXp,
                weeklyXp: schema.guilds.weeklyXp,
                createdAt: schema.guilds.createdAt,
                userRole: schema.guildMembers.role,
            })
            .from(schema.guilds)
            .innerJoin(
                schema.guildMembers,
                and(
                    eq(schema.guildMembers.guildId, schema.guilds.id),
                    eq(schema.guildMembers.userId, user.id),
                ),
            )
            .orderBy(desc(schema.guilds.weeklyXp));

        return c.json({
            guilds: myGuilds.map((g) => ({
                ...g,
                ladderTier: computeGuildTier(g.weeklyXp),
                isMember: true,
            })),
        });
    }

    const guilds = await db
        .select()
        .from(schema.guilds)
        .where(
            and(
                eq(schema.guilds.isPublic, true),
                !showFull ? lt(schema.guilds.memberCount, schema.guilds.maxMembers) : undefined,
                search ? ilike(schema.guilds.name, `%${search}%`) : undefined,
                communityHabitId
                    ? eq(schema.guilds.communityHabitId, communityHabitId)
                    : undefined,
            ),
        )
        .orderBy(desc(schema.guilds.weeklyXp));

    let membershipMap = new Map<string, string>();
    if (user) {
        const memberships = await db
            .select({ guildId: schema.guildMembers.guildId, role: schema.guildMembers.role })
            .from(schema.guildMembers)
            .where(eq(schema.guildMembers.userId, user.id));
        membershipMap = new Map(memberships.map((m) => [m.guildId, m.role]));
    }

    return c.json({
        guilds: guilds.map((g) => ({
            ...g,
            ladderTier: computeGuildTier(g.weeklyXp),
            isMember: membershipMap.has(g.id),
            userRole: membershipMap.get(g.id) ?? null,
        })),
    });
});

// POST /
guildRoutes.post('/', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    let body: z.infer<typeof createGuildSchema>;
    try {
        body = createGuildSchema.parse(await c.req.json());
    } catch {
        return c.json({ error: 'Invalid body' }, 400);
    }

    const slug = slugify(body.name);
    if (!slug) return c.json({ error: 'Invalid name' }, 400);

    const existing = await db
        .select({ id: schema.guilds.id })
        .from(schema.guilds)
        .where(eq(schema.guilds.slug, slug))
        .limit(1);
    if (existing.length > 0) return c.json({ error: 'Guild name already taken' }, 409);

    const [guild] = await db
        .insert(schema.guilds)
        .values({
            name: body.name,
            slug,
            description: body.description,
            icon: body.icon,
            bannerColor: body.bannerColor,
            communityHabitId: body.communityHabitId,
            isPublic: body.isPublic,
            ownerId: user.id,
            memberCount: 1,
        })
        .returning();

    await db.insert(schema.guildMembers).values({
        guildId: guild.id,
        userId: user.id,
        role: 'owner',
    });

    await db.insert(schema.socialFeed).values({
        userId: user.id,
        eventType: 'guild_created',
        guildId: guild.id,
        metadata: { guildName: guild.name },
    });

    return c.json({ guild: { ...guild, ladderTier: 'Iron' } }, 201);
});

// GET /ladder  — must be before /:id
guildRoutes.get('/ladder', async (c) => {
    const guilds = await db
        .select()
        .from(schema.guilds)
        .where(eq(schema.guilds.isPublic, true))
        .orderBy(desc(schema.guilds.weeklyXp));

    return c.json({
        guilds: guilds.map((g) => ({
            ...g,
            ladderTier: computeGuildTier(g.weeklyXp),
        })),
    });
});

// GET /:id
guildRoutes.get('/:id', async (c) => {
    const user = await resolveUserFromRequest(c);
    const { id } = c.req.param();

    const rows = await db
        .select()
        .from(schema.guilds)
        .where(eq(schema.guilds.id, id))
        .limit(1);
    const guild = rows[0];
    if (!guild) return c.json({ error: 'Not found' }, 404);

    if (!guild.isPublic) {
        if (!user) {
            return c.json({ error: 'Forbidden' }, 403);
        }
        const membership = await db
            .select({ id: schema.guildMembers.id })
            .from(schema.guildMembers)
            .where(
                and(eq(schema.guildMembers.guildId, id), eq(schema.guildMembers.userId, user.id)),
            )
            .limit(1);
        if (membership.length === 0) {
            return c.json({ error: 'Forbidden' }, 403);
        }
    }

    const members = await db
        .select({
            id: schema.guildMembers.id,
            userId: schema.guildMembers.userId,
            role: schema.guildMembers.role,
            joinedAt: schema.guildMembers.joinedAt,
            weeklyXp: schema.guildMembers.weeklyXp,
            totalXp: schema.guildMembers.totalXp,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
        })
        .from(schema.guildMembers)
        .innerJoin(schema.users, eq(schema.guildMembers.userId, schema.users.id))
        .where(eq(schema.guildMembers.guildId, id))
        .orderBy(desc(schema.guildMembers.totalXp));

    let isJoined = false;
    let userRole: string | null = null;
    if (user) {
        const mine = members.find((m) => m.userId === user.id);
        isJoined = !!mine;
        userRole = mine?.role ?? null;
    }

    return c.json({
        guild: { ...guild, ladderTier: computeGuildTier(guild.weeklyXp) },
        members,
        isJoined,
        userRole,
    });
});

// PATCH /:id
guildRoutes.patch('/:id', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { id } = c.req.param();

    const memberRows = await db
        .select({ role: schema.guildMembers.role })
        .from(schema.guildMembers)
        .where(
            and(eq(schema.guildMembers.guildId, id), eq(schema.guildMembers.userId, user.id)),
        )
        .limit(1);

    const membership = memberRows[0];
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        return c.json({ error: 'Forbidden' }, 403);
    }

    let body: z.infer<typeof patchGuildSchema>;
    try {
        body = patchGuildSchema.parse(await c.req.json());
    } catch {
        return c.json({ error: 'Invalid body' }, 400);
    }

    const updates: {
        name?: string;
        slug?: string;
        description?: string | null;
        icon?: string;
        bannerColor?: string;
        isPublic?: boolean;
    } = {};

    if (body.name !== undefined) {
        updates.name = body.name;
        updates.slug = slugify(body.name);
        const nameTaken = await db
            .select({ id: schema.guilds.id })
            .from(schema.guilds)
            .where(and(eq(schema.guilds.slug, updates.slug), ne(schema.guilds.id, id)))
            .limit(1);
        if (nameTaken.length > 0) return c.json({ error: 'Guild name already taken' }, 409);
    }
    if (body.description !== undefined) updates.description = body.description;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.bannerColor !== undefined) updates.bannerColor = body.bannerColor;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

    if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);

    const [guild] = await db
        .update(schema.guilds)
        .set(updates)
        .where(eq(schema.guilds.id, id))
        .returning();

    return c.json({ guild: { ...guild, ladderTier: computeGuildTier(guild.weeklyXp) } });
});

// POST /:id/join
guildRoutes.post('/:id/join', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { id } = c.req.param();

    const guildRows = await db
        .select()
        .from(schema.guilds)
        .where(eq(schema.guilds.id, id))
        .limit(1);
    const guild = guildRows[0];
    if (!guild) return c.json({ error: 'Not found' }, 404);

    if (guild.memberCount >= guild.maxMembers) {
        return c.json({ error: 'Guild is full' }, 400);
    }

    if (!guild.isPublic) {
        return c.json({ error: 'This guild is private' }, 403);
    }

    const existing = await db
        .select({ id: schema.guildMembers.id })
        .from(schema.guildMembers)
        .where(
            and(eq(schema.guildMembers.guildId, id), eq(schema.guildMembers.userId, user.id)),
        )
        .limit(1);
    if (existing.length > 0) return c.json({ error: 'Already a member' }, 409);

    await db.insert(schema.guildMembers).values({
        guildId: id,
        userId: user.id,
        role: 'member',
    });

    await db
        .update(schema.guilds)
        .set({ memberCount: sql`${schema.guilds.memberCount} + 1` })
        .where(eq(schema.guilds.id, id));

    await db.insert(schema.socialFeed).values({
        userId: user.id,
        eventType: 'guild_joined',
        guildId: id,
        metadata: { guildName: guild.name },
    });

    return c.json({ ok: true });
});

// POST /:id/leave
guildRoutes.post('/:id/leave', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { id } = c.req.param();

    const memberRows = await db
        .select({ role: schema.guildMembers.role })
        .from(schema.guildMembers)
        .where(
            and(eq(schema.guildMembers.guildId, id), eq(schema.guildMembers.userId, user.id)),
        )
        .limit(1);

    const membership = memberRows[0];
    if (!membership) return c.json({ error: 'Not a member' }, 400);
    if (membership.role === 'owner') {
        return c.json({ error: 'Owner must transfer ownership before leaving' }, 400);
    }

    await db
        .delete(schema.guildMembers)
        .where(
            and(eq(schema.guildMembers.guildId, id), eq(schema.guildMembers.userId, user.id)),
        );

    await db
        .update(schema.guilds)
        .set({ memberCount: sql`${schema.guilds.memberCount} - 1` })
        .where(eq(schema.guilds.id, id));

    return c.json({ ok: true });
});

// GET /:id/leaderboard
guildRoutes.get('/:id/leaderboard', async (c) => {
    const { id } = c.req.param();
    const week = c.req.query('week') ?? 'current';
    const weekStart = week === 'prev' ? getWeekStart(-1) : getWeekStart();

    const user = await resolveUserFromRequest(c);
    const guildRows = await db
        .select()
        .from(schema.guilds)
        .where(eq(schema.guilds.id, id))
        .limit(1);
    if (guildRows.length === 0) return c.json({ error: 'Not found' }, 404);
    const gRow = guildRows[0]!;

    if (!gRow.isPublic) {
        if (!user) {
            return c.json({ error: 'Forbidden' }, 403);
        }
        const membership = await db
            .select({ id: schema.guildMembers.id })
            .from(schema.guildMembers)
            .where(
                and(eq(schema.guildMembers.guildId, id), eq(schema.guildMembers.userId, user.id)),
            )
            .limit(1);
        if (membership.length === 0) {
            return c.json({ error: 'Forbidden' }, 403);
        }
    }

    const entries = await db
        .select({
            userId: schema.guildMembers.userId,
            role: schema.guildMembers.role,
            weeklyXp: schema.guildMembers.weeklyXp,
            totalXp: schema.guildMembers.totalXp,
            joinedAt: schema.guildMembers.joinedAt,
            displayName: schema.users.displayName,
            avatarSeed: schema.users.avatarSeed,
        })
        .from(schema.guildMembers)
        .innerJoin(schema.users, eq(schema.guildMembers.userId, schema.users.id))
        .where(eq(schema.guildMembers.guildId, id))
        .orderBy(desc(schema.guildMembers.weeklyXp));

    return c.json({
        entries: entries.map((e, i) => ({ ...e, rank: i + 1 })),
        weekStart,
    });
});
