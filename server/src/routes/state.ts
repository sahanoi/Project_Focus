import { Hono } from 'hono';
import { putStateBodySchema } from '../validation/stateSchema.js';
import { loadFullStateForUser } from '../state/map.js';
import { replaceUserState } from '../state/replace.js';
import { resolveUserFromRequest } from '../auth/session.js';

export const stateRoutes = new Hono();

stateRoutes.get('/state', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const state = await loadFullStateForUser(user.id);
    return c.json(state);
});

stateRoutes.put('/state', async (c) => {
    const user = await resolveUserFromRequest(c);
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    let json: unknown;
    try {
        json = await c.req.json();
    } catch {
        return c.json({ error: 'Invalid JSON' }, 400);
    }
    const parsed = putStateBodySchema.safeParse(json);
    if (!parsed.success) {
        return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }
    try {
        await replaceUserState(user.id, parsed.data);
    } catch (e) {
        console.error(e);
        return c.json({ error: 'Failed to persist state' }, 500);
    }
    return c.json({ ok: true });
});
