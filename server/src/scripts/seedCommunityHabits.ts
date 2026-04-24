/**
 * Seeds the community_habits table with the default set of shared habits.
 * Safe to run multiple times — uses onConflictDoNothing() so existing slugs are skipped.
 * Run: npm run db:seed:community --prefix server
 */
import '../env.js';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

const COMMUNITY_HABITS = [
    { slug: 'drink-water', name: 'Drink Water', icon: '💧', category: 'health', description: 'Stay hydrated throughout the day', unit: 'glasses', dailyTarget: 6, goalValue: 8, isFeatured: true, sortOrder: 1 },
    { slug: 'morning-run', name: 'Morning Run', icon: '🏃', category: 'fitness', description: 'Start your day with a refreshing run', unit: 'km', dailyTarget: 2, goalValue: 5, isFeatured: true, sortOrder: 2 },
    { slug: 'daily-walk', name: 'Daily Walk', icon: '🚶', category: 'fitness', description: '10,000 steps a day keeps the doctor away', unit: 'min', dailyTarget: 20, goalValue: 30, isFeatured: true, sortOrder: 3 },
    { slug: 'meditate', name: 'Meditate', icon: '🧘', category: 'mindfulness', description: 'Clear your mind and find inner peace', unit: 'min', dailyTarget: 5, goalValue: 15, isFeatured: true, sortOrder: 4 },
    { slug: 'read-30min', name: 'Read 30 Min', icon: '📚', category: 'learning', description: 'Expand your mind with daily reading', unit: 'min', dailyTarget: 15, goalValue: 30, isFeatured: true, sortOrder: 5 },
    { slug: 'push-ups', name: 'Push-ups', icon: '💪', category: 'fitness', description: 'Build strength with this fundamental exercise', unit: 'reps', dailyTarget: 20, goalValue: 50, isFeatured: false, sortOrder: 6 },
    { slug: 'cold-shower', name: 'Cold Shower', icon: '🚿', category: 'health', description: 'Boost energy and resilience with cold water', unit: null, dailyTarget: null, goalValue: 1, isFeatured: false, sortOrder: 7 },
    { slug: 'daily-journal', name: 'Daily Journal', icon: '📝', category: 'mindfulness', description: 'Reflect, plan, and process your thoughts', unit: 'entries', dailyTarget: 1, goalValue: 1, isFeatured: false, sortOrder: 8 },
    { slug: 'sleep-8h', name: 'Sleep 8 Hours', icon: '😴', category: 'health', description: 'Prioritize quality sleep for recovery and performance', unit: 'hours', dailyTarget: 7, goalValue: 8, isFeatured: false, sortOrder: 9 },
    { slug: 'stretch', name: 'Stretch', icon: '🤸', category: 'fitness', description: 'Daily stretching for flexibility and injury prevention', unit: 'min', dailyTarget: 10, goalValue: 15, isFeatured: false, sortOrder: 10 },
    { slug: 'no-social-media', name: 'No Social Media', icon: '📵', category: 'productivity', description: 'Reclaim your attention and mental clarity', unit: null, dailyTarget: null, goalValue: null, isFeatured: false, sortOrder: 11 },
    { slug: 'eat-healthy', name: 'Eat Healthy', icon: '🥗', category: 'health', description: 'Fuel your body with nutritious food choices', unit: 'meals', dailyTarget: 2, goalValue: 3, isFeatured: false, sortOrder: 12 },
] satisfies (typeof schema.communityHabits.$inferInsert)[];

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL is required (set in server/.env or project root .env)');
        process.exit(1);
    }

    console.log(`Seeding ${COMMUNITY_HABITS.length} community habits...`);

    await db
        .insert(schema.communityHabits)
        .values(COMMUNITY_HABITS)
        .onConflictDoNothing();

    console.log('Done. Community habits seeded (existing slugs skipped).');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
