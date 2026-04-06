import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import {
    clearSessionCookie,
    createSessionForUser,
    deleteSessionById,
    resolveUserFromRequest,
    setSessionCookie,
    SESSION_COOKIE,
} from '../auth/session.js';
import { toPublicUser } from '../auth/userJson.js';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    display_name: z.string().max(120).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const profilePatchSchema = z.object({
    display_name: z.string().max(120).optional(),
    bio: z.string().max(2000).optional(),
    avatar_seed: z.string().max(120).optional(),
});

export const authRoutes = new Hono();

authRoutes.post('/register', async (c) => {
    let body: z.infer<typeof registerSchema>;
    try {
        body = registerSchema.parse(await c.req.json());
    } catch {
        return c.json({ error: 'Invalid body' }, 400);
    }
    const email = body.email.trim().toLowerCase();
    const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
    if (existing.length > 0) {
        return c.json({ error: 'Email already registered' }, 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const [user] = await db
        .insert(schema.users)
        .values({
            email,
            passwordHash,
            displayName: body.display_name?.trim() || email.split('@')[0],
        })
        .returning({
            id: schema.users.id,
            email: schema.users.email,
            displayName: schema.users.displayName,
            bio: schema.users.bio,
            avatarSeed: schema.users.avatarSeed,
            createdAt: schema.users.createdAt,
            updatedAt: schema.users.updatedAt,
        });

    const sessionId = await createSessionForUser(user.id);
    setSessionCookie(c, sessionId);

    return c.json({ user: toPublicUser(user) });
});

authRoutes.post('/login', async (c) => {
    let body: z.infer<typeof loginSchema>;
    try {
        body = loginSchema.parse(await c.req.json());
    } catch {
        return c.json({ error: 'Invalid body' }, 400);
    }
    const email = body.email.trim().toLowerCase();
    const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
    const user = rows[0];
    if (!user) {
        return c.json({ error: 'Invalid email or password' }, 401);
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
        return c.json({ error: 'Invalid email or password' }, 401);
    }

    const sessionId = await createSessionForUser(user.id);
    setSessionCookie(c, sessionId);

    return c.json({
        user: toPublicUser({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            bio: user.bio,
            avatarSeed: user.avatarSeed,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }),
    });
});

authRoutes.post('/logout', async (c) => {
    const sessionId = getCookie(c, SESSION_COOKIE);
    if (sessionId) {
        await deleteSessionById(sessionId);
    }
    clearSessionCookie(c);
    return c.json({ ok: true });
});

authRoutes.get('/me', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) {
        return c.json({ user: null }, 200);
    }
    return c.json({
        user: toPublicUser({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            bio: user.bio,
            avatarSeed: user.avatarSeed,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }),
    });
});

authRoutes.patch('/profile', async (c) => {
    const row = await resolveUserFromRequest(c);
    if (!row) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    let body: z.infer<typeof profilePatchSchema>;
    try {
        body = profilePatchSchema.parse(await c.req.json());
    } catch {
        return c.json({ error: 'Invalid body' }, 400);
    }
    if (
        body.display_name === undefined &&
        body.bio === undefined &&
        body.avatar_seed === undefined
    ) {
        return c.json({ error: 'No fields to update' }, 400);
    }

    const updates: {
        updatedAt: Date;
        displayName?: string | null;
        bio?: string | null;
        avatarSeed?: string | null;
    } = {
        updatedAt: new Date(),
    };
    if (body.display_name !== undefined) updates.displayName = body.display_name.trim() || null;
    if (body.bio !== undefined) updates.bio = body.bio.trim() || null;
    if (body.avatar_seed !== undefined) updates.avatarSeed = body.avatar_seed.trim() || null;

    const [updated] = await db
        .update(schema.users)
        .set(updates)
        .where(eq(schema.users.id, row.id))
        .returning({
            id: schema.users.id,
            email: schema.users.email,
            displayName: schema.users.displayName,
            bio: schema.users.bio,
            avatarSeed: schema.users.avatarSeed,
            createdAt: schema.users.createdAt,
            updatedAt: schema.users.updatedAt,
        });

    return c.json({ user: toPublicUser(updated) });
});
