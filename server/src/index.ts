import './env.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth.js';
import { stateRoutes } from './routes/state.js';
import { communityRoutes } from './routes/community.js';
import { guildRoutes } from './routes/guilds.js';
import { socialRoutes } from './routes/social.js';

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required (e.g. postgres://focus_ftp:focus_ftp_local@localhost:5432/focus_ftp)');
    process.exit(1);
}

function isDbUnreachable(err: unknown): boolean {
    const code = (e: unknown) =>
        typeof e === 'object' && e !== null && 'code' in e && (e as { code: unknown }).code === 'ECONNREFUSED';
    if (code(err)) return true;
    if (err instanceof AggregateError && Array.isArray(err.errors)) {
        return err.errors.some((e) => code(e));
    }
    return false;
}

const app = new Hono();

app.onError((err, c) => {
    console.error('[API]', err);
    if (isDbUnreachable(err)) {
        return c.json(
            {
                error:
                    'Database unreachable (connection refused). Start Postgres — e.g. npm run db:up from the project root, or use npm run dev so Docker Postgres starts first.',
            },
            503,
        );
    }
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return c.json({ error: message }, 500);
});

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(
    '*',
    cors({
        origin: corsOrigin,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        credentials: true,
    }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/auth', authRoutes);
app.route('/api', stateRoutes);
app.route('/api/community', communityRoutes);
app.route('/api/guilds', guildRoutes);
app.route('/api/social', socialRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Focus FTP API listening on http://localhost:${info.port}`);
});
