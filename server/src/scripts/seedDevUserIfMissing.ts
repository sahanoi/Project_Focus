/**
 * Creates the dev test user only if that email is not registered.
 * Does not reset password on existing users (unlike seedDevUser.ts).
 * Run: npm run db:seed:if-missing --prefix server
 *
 * Defaults: leo@fcs.com / paswrod123! — override with DEV_SEED_EMAIL / DEV_SEED_PASSWORD.
 */
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

const DEFAULT_EMAIL = 'leo@fcs.com';
const DEFAULT_PASSWORD = 'paswrod123!';

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is required (set in server/.env or project root .env)');
        process.exit(1);
    }

    const email = (process.env.DEV_SEED_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
    const password = process.env.DEV_SEED_PASSWORD ?? DEFAULT_PASSWORD;

    if (password.length < 8) {
        console.error('Password must be at least 8 characters (same rule as API register).');
        process.exit(1);
    }

    const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

    if (existing.length > 0) {
        console.log(`Dev user already present: ${email} (skipped insert)`);
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = email.split('@')[0] || 'Dev';

    await db.insert(schema.users).values({
        email,
        passwordHash,
        displayName,
    });
    console.log(`Created dev user: ${email}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
