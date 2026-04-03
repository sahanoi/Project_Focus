import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import type { PutStateBody } from '../validation/stateSchema.js';

export async function replaceUserState(userId: string, body: PutStateBody): Promise<void> {
    await db.transaction(async (tx) => {
        await tx.delete(schema.userStats).where(eq(schema.userStats.userId, userId));
        await tx.delete(schema.habits).where(eq(schema.habits.userId, userId));
        await tx.delete(schema.routines).where(eq(schema.routines.userId, userId));

        for (const h of body.habits) {
            await tx.insert(schema.habits).values({
                id: h.id,
                userId,
                name: h.name,
                type: h.type,
                category: h.category,
                color: h.color,
                icon: h.icon,
                difficulty: h.difficulty ?? null,
                schedule: h.schedule ?? null,
                dailyTarget: h.dailyTarget ?? null,
                goalValue: h.goalValue ?? null,
                unit: h.unit ?? null,
                startDate: h.startDate ?? null,
                endDate: h.endDate ?? null,
                createdAt: new Date(h.createdAt),
                archived: h.archived,
            });

            for (const [completedDate, comp] of Object.entries(h.completions)) {
                await tx.insert(schema.habitCompletions).values({
                    habitId: h.id,
                    completedDate,
                    completed: comp.completed,
                    value: comp.value ?? null,
                    note: comp.note ?? null,
                    frozen: comp.frozen ?? false,
                });
            }
        }

        for (const g of body.goals) {
            await tx.insert(schema.goals).values({
                id: g.id,
                userId,
                habitId: g.habitId,
                name: g.name,
                targetValue: g.targetValue,
                unit: g.unit,
                deadline: g.deadline ?? null,
                achieved: g.achieved,
                createdAt: new Date(g.createdAt),
            });
        }

        for (const r of body.routines) {
            await tx.insert(schema.routines).values({
                id: r.id,
                userId,
                name: r.name,
                description: r.description ?? null,
                icon: r.icon,
                habitIds: r.habitIds,
                bonusXp: r.bonusXp,
                completionTime: r.completionTime ?? null,
            });
        }

        await tx.insert(schema.userStats).values({
            userId,
            level: body.stats.level,
            xp: body.stats.xp,
            nextLevelXp: body.stats.nextLevelXp,
            accountCreatedDate: new Date(body.stats.accountCreatedDate),
            attributes: body.stats.attributes,
            unlockedCollectibles: body.stats.unlockedCollectibles,
            achievements: body.achievements,
        });
    });
}
