import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { toIsoTimestamp } from '../util/dates.js';

/** Matches client CharacterStats defaults when user has no row yet. */
export const DEFAULT_STATS = {
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    accountCreatedDate: new Date().toISOString(),
    unlockedCollectibles: [] as string[],
    attributes: {
        ovr: 60,
        dsc: 60,
        foc: 60,
        stk: 60,
        bal: 60,
        grt: 60,
        vit: 60,
    },
};

export type ApiState = {
    habits: unknown[];
    goals: unknown[];
    routines: unknown[];
    stats: typeof DEFAULT_STATS;
    achievements: { id: string; unlockedAt: string }[];
};

async function loadStatsSlice(userId: string) {
    const statRows = await db
        .select()
        .from(schema.userStats)
        .where(eq(schema.userStats.userId, userId))
        .limit(1);
    const s = statRows[0];
    const stats = s
        ? {
              level: s.level,
              xp: s.xp,
              nextLevelXp: s.nextLevelXp,
              accountCreatedDate: toIsoTimestamp(s.accountCreatedDate),
              unlockedCollectibles: s.unlockedCollectibles,
              attributes: s.attributes as (typeof DEFAULT_STATS)['attributes'],
          }
        : { ...DEFAULT_STATS };
    const achievements = s?.achievements ?? [];
    return { stats, achievements };
}

export async function loadFullStateForUser(userId: string): Promise<ApiState> {
    const { stats, achievements } = await loadStatsSlice(userId);

    const habitRows = await db
        .select()
        .from(schema.habits)
        .where(eq(schema.habits.userId, userId));

    const goalRows = await db.select().from(schema.goals).where(eq(schema.goals.userId, userId));
    const goals = goalRows.map((g) => ({
        id: g.id,
        habitId: g.habitId,
        name: g.name,
        targetValue: g.targetValue,
        unit: g.unit,
        ...(g.deadline ? { deadline: g.deadline } : {}),
        achieved: g.achieved,
        createdAt: toIsoTimestamp(g.createdAt),
    }));

    const routineRows = await db
        .select()
        .from(schema.routines)
        .where(eq(schema.routines.userId, userId));
    const routines = routineRows.map((r) => ({
        id: r.id,
        name: r.name,
        ...(r.description ? { description: r.description } : {}),
        icon: r.icon,
        habitIds: r.habitIds,
        bonusXp: r.bonusXp,
        ...(r.completionTime != null ? { completionTime: r.completionTime } : {}),
    }));

    if (habitRows.length === 0) {
        return { habits: [], goals, routines, stats, achievements };
    }

    const habitIds = habitRows.map((h) => h.id);
    const completionRows = await db
        .select()
        .from(schema.habitCompletions)
        .where(inArray(schema.habitCompletions.habitId, habitIds));

    const byHabit = new Map<string, typeof completionRows>();
    for (const c of completionRows) {
        const list = byHabit.get(c.habitId) ?? [];
        list.push(c);
        byHabit.set(c.habitId, list);
    }

    const habits = habitRows.map((h) => {
        const comps = byHabit.get(h.id) ?? [];
        const completions: Record<
            string,
            { completed: boolean; value?: number; note?: string; frozen?: boolean }
        > = {};
        for (const c of comps) {
            completions[c.completedDate] = {
                completed: c.completed,
                ...(c.value != null ? { value: c.value } : {}),
                ...(c.note ? { note: c.note } : {}),
                ...(c.frozen ? { frozen: c.frozen } : {}),
            };
        }
        return {
            id: h.id,
            name: h.name,
            type: h.type,
            category: h.category,
            color: h.color,
            icon: h.icon,
            ...(h.difficulty ? { difficulty: h.difficulty } : {}),
            ...(h.schedule != null ? { schedule: h.schedule } : {}),
            ...(h.dailyTarget != null ? { dailyTarget: h.dailyTarget } : {}),
            ...(h.goalValue != null ? { goalValue: h.goalValue } : {}),
            ...(h.unit ? { unit: h.unit } : {}),
            ...(h.startDate ? { startDate: h.startDate } : {}),
            ...(h.endDate ? { endDate: h.endDate } : {}),
            ...(h.skillFocus?.primarySkills?.length
                ? { primarySkills: h.skillFocus.primarySkills as ('dsc' | 'foc' | 'stk' | 'bal' | 'grt' | 'vit')[] }
                : {}),
            ...(h.skillFocus?.secondarySkills?.length
                ? { secondarySkills: h.skillFocus.secondarySkills as ('dsc' | 'foc' | 'stk' | 'bal' | 'grt' | 'vit')[] }
                : {}),
            completions,
            createdAt: toIsoTimestamp(h.createdAt),
            archived: h.archived,
        };
    });

    return { habits, goals, routines, stats, achievements };
}
