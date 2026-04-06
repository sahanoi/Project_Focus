const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    return fetch(path, {
        credentials: 'include',
        ...init,
        headers: {
            ...JSON_HEADERS,
            ...(init?.headers as Record<string, string> | undefined),
        },
    });
}

export async function getJson<T>(path: string): Promise<T> {
    const r = await apiFetch(path);
    if (!r.ok) {
        const t = await r.text();
        throw new Error(t || r.statusText);
    }
    return r.json() as Promise<T>;
}

export async function parseErrorResponse(r: Response): Promise<string> {
    try {
        const j = (await r.json()) as { error?: string };
        return j.error ?? r.statusText;
    } catch {
        return r.statusText;
    }
}

export type AuthMeUser = {
    id: string;
    email: string;
    user_metadata?: {
        display_name?: string;
        bio?: string;
        avatar_seed?: string;
    };
    created_at: string;
    updated_at: string;
};

export async function fetchMe(): Promise<{ user: AuthMeUser | null }> {
    return getJson('/auth/me');
}

export async function loginApi(email: string, password: string): Promise<{ user: AuthMeUser }> {
    const r = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(await parseErrorResponse(r));
    return r.json() as Promise<{ user: AuthMeUser }>;
}

export async function registerApi(
    email: string,
    password: string,
    display_name?: string
): Promise<{ user: AuthMeUser }> {
    const r = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name }),
    });
    if (!r.ok) throw new Error(await parseErrorResponse(r));
    return r.json() as Promise<{ user: AuthMeUser }>;
}

export async function logoutApi(): Promise<void> {
    await apiFetch('/auth/logout', { method: 'POST' });
}

export async function patchProfileApi(data: {
    display_name?: string;
    bio?: string;
    avatar_seed?: string;
}): Promise<{ user: AuthMeUser }> {
    const r = await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(await parseErrorResponse(r));
    return r.json() as Promise<{ user: AuthMeUser }>;
}

export type AppStatePayload = {
    habits: unknown[];
    goals: unknown[];
    routines: unknown[];
    stats: unknown;
    achievements: unknown[];
};

export async function fetchAppState(): Promise<AppStatePayload> {
    return getJson('/api/state');
}

export async function putAppState(body: AppStatePayload): Promise<void> {
    const r = await apiFetch('/api/state', {
        method: 'PUT',
        body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await parseErrorResponse(r));
}
