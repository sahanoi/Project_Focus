import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, users } from '../db/schema.js';
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

export const SESSION_COOKIE = 'focus_session';
const SESSION_DAYS = 30;

export function sessionExpiresAt(): Date {
    const d = new Date();
    d.setDate(d.getDate() + SESSION_DAYS);
    return d;
}

export async function createSessionForUser(userId: string): Promise<string> {
    const expiresAt = sessionExpiresAt();
    const [session] = await db
        .insert(sessions)
        .values({ userId, expiresAt })
        .returning({ id: sessions.id });
    return session.id;
}

export function setSessionCookie(c: Context, sessionId: string): void {
    setCookie(c, SESSION_COOKIE, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: SESSION_DAYS * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
    });
}

export function clearSessionCookie(c: Context): void {
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

export async function resolveUserFromRequest(c: Context) {
    const sessionId = getCookie(c, SESSION_COOKIE);
    if (!sessionId) return null;

    const now = new Date();
    const rows = await db
        .select({
            userId: sessions.userId,
            expiresAt: sessions.expiresAt,
            email: users.email,
            displayName: users.displayName,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, sessionId))
        .limit(1);

    const row = rows[0];
    if (!row || row.expiresAt < now) {
        if (sessionId) {
            await db.delete(sessions).where(eq(sessions.id, sessionId));
        }
        return null;
    }

    return {
        id: row.userId,
        email: row.email,
        displayName: row.displayName,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export async function deleteSessionById(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
}
