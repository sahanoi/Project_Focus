import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import {
    clearSessionCookie,
    createSessionForUser,
    deleteSessionById,
    getCookie,
    resolveUserFromRequest,
    setSessionCookie,
    SESSION_COOKIE,
} from '../auth/session.js';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    display_name: z.string().max(120).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
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
            createdAt: schema.users.createdAt,
            updatedAt: schema.users.updatedAt,
        });

    const sessionId = await createSessionForUser(user.id);
    setSessionCookie(c, sessionId);

    return c.json({
        user: {
            id: user.id,
            email: user.email,
            user_metadata: { display_name: user.displayName ?? undefined },
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
        },
    });
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
        user: {
            id: user.id,
            email: user.email,
            user_metadata: { display_name: user.displayName ?? undefined },
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
        },
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
        user: {
            id: user.id,
            email: user.email,
            user_metadata: { display_name: user.displayName ?? undefined },
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
        },
    });
});
