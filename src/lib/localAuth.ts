import { v4 as uuidv4 } from 'uuid';
import type { Session, User } from './authTypes';

const USERS_KEY = 'focus-ftp-local-users';
const SESSION_KEY = 'focus-ftp-local-session';

export const LOCAL_AUTH_CHANGED_EVENT = 'focus-local-auth-changed';

type LocalUserRecord = {
    id: string;
    password: string;
    user_metadata?: {
        display_name?: string;
        bio?: string;
        avatar_seed?: string;
    };
};

function readUsers(): Record<string, LocalUserRecord> {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? (JSON.parse(raw) as Record<string, LocalUserRecord>) : {};
    } catch {
        return {};
    }
}

function writeUsers(users: Record<string, LocalUserRecord>) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Optional seed account from env. Only runs in dev: VITE_* values ship in the client bundle,
 * so never set VITE_LOCAL_AUTH_PASSWORD for a public production build.
 */
export function ensureSeedLocalUser(): void {
    if (import.meta.env.PROD) return;
    const email = import.meta.env.VITE_LOCAL_AUTH_EMAIL?.trim().toLowerCase();
    const password = import.meta.env.VITE_LOCAL_AUTH_PASSWORD;
    if (!email || !password) return;
    const users = readUsers();
    users[email] = {
        id: users[email]?.id ?? uuidv4(),
        password,
        user_metadata: users[email]?.user_metadata ?? { display_name: email.split('@')[0] },
    };
    writeUsers(users);
}

function toUser(email: string, rec: LocalUserRecord): User {
    return {
        id: rec.id,
        email,
        app_metadata: {},
        user_metadata: rec.user_metadata ?? {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

export function getLocalSession(): Session | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        const { email } = JSON.parse(raw) as { email: string };
        const key = email.toLowerCase();
        const rec = readUsers()[key];
        if (!rec) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        const user = toUser(email, rec);
        return {
            access_token: 'local-token',
            refresh_token: 'local',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user,
        };
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export function localSignUp(email: string, password: string): { error: Error | null } {
    const key = email.trim().toLowerCase();
    if (!key || !password) return { error: new Error('Email and password required') };
    const users = readUsers();
    if (users[key]) return { error: new Error('User already registered') };
    users[key] = {
        id: uuidv4(),
        password,
        user_metadata: { display_name: key.split('@')[0] },
    };
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: key }));
    dispatchLocalAuthChanged();
    return { error: null };
}

export function localSignIn(email: string, password: string): { error: Error | null } {
    ensureSeedLocalUser();
    const key = email.trim().toLowerCase();
    const users = readUsers();
    const rec = users[key];
    if (!rec || rec.password !== password) {
        return { error: new Error('Invalid login credentials') };
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: key }));
    dispatchLocalAuthChanged();
    return { error: null };
}

export function clearLocalSession(): void {
    localStorage.removeItem(SESSION_KEY);
    dispatchLocalAuthChanged();
}

export function updateLocalUserMetadata(
    email: string,
    data: { display_name?: string; bio?: string; avatar_seed?: string }
): void {
    const key = email.trim().toLowerCase();
    const users = readUsers();
    if (!users[key]) return;
    users[key] = {
        ...users[key],
        user_metadata: { ...users[key].user_metadata, ...data },
    };
    writeUsers(users);
    dispatchLocalAuthChanged();
}

export function dispatchLocalAuthChanged(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(LOCAL_AUTH_CHANGED_EVENT));
}
