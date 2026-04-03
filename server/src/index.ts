import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth.js';
import { stateRoutes } from './routes/state.js';

const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
app.use(
    '*',
    cors({
        origin: corsOrigin,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        credentials: true,
    }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/auth', authRoutes);
app.route('/api', stateRoutes);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Focus FTP API listening on http://localhost:${info.port}`);
});
