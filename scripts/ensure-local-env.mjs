/**
 * Ensures project root `.env` exists and contains DATABASE_URL for local Docker Postgres.
 * Safe to run repeatedly; does not remove other lines.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

const DEFAULT_URL =
 process.env.DATABASE_URL_TEMPLATE ||
    'postgres://focus_ftp:focus_ftp_local@127.0.0.1:5432/focus_ftp';

let content = '';
if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
} else if (fs.existsSync(examplePath)) {
    content = fs.readFileSync(examplePath, 'utf8');
}

const lines = content.split(/\r?\n/);
const hasDbUrl = lines.some((l) => /^\s*DATABASE_URL\s*=/.test(l));

if (!hasDbUrl) {
    const banner =
        content.trim().length > 0 && !content.endsWith('\n') ? '\n' : '';
    const append = `${banner}DATABASE_URL=${DEFAULT_URL}\n`;
    fs.writeFileSync(envPath, content.trimEnd() + append, 'utf8');
    console.log('Added DATABASE_URL to .env (local Docker Postgres defaults).');
} else if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('Created .env from .env.example');
} else {
    console.log('.env already has DATABASE_URL — leaving unchanged.');
}
