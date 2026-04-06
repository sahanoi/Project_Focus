import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL ?? 'postgres://focus_ftp:focus_ftp_local@localhost:5432/focus_ftp',
    },
});
