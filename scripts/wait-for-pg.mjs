/**
 * Waits until TCP connects to Postgres (default 127.0.0.1:5432).
 * Usage: node scripts/wait-for-pg.mjs * Env: PGHOST, PGPORT (optional)
 */
import net from 'node:net';

const host = process.env.PGHOST || '127.0.0.1';
const port = parseInt(process.env.PGPORT || '5432', 10);
const timeoutMs = parseInt(process.env.PG_WAIT_MS || '120000', 10);
const start = Date.now();

function tryOnce() {
    return new Promise((resolve, reject) => {
        const socket = net.connect({ host, port }, () => {
            socket.end();
            resolve(true);
        });
        socket.setTimeout(2000);
        socket.on('error', () => {
            socket.destroy();
            reject(new Error('connect failed'));
        });
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('timeout'));
        });
    });
}

process.stdout.write(`Waiting for PostgreSQL at ${host}:${port}`);

while (Date.now() - start < timeoutMs) {
    try {
        await tryOnce();
        console.log(`\nPostgreSQL is accepting connections (${host}:${port}).`);
        process.exit(0);
    } catch {
        process.stdout.write('.');
        await new Promise((r) => setTimeout(r, 1000));
    }
}

console.error(
 `\nTimed out after ${timeoutMs}ms. Start Postgres (e.g. npm run db:up) and try again.`,
);
process.exit(1);
