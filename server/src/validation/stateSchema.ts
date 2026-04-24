import { z } from 'zod';

const skillAttributeKey = z.enum(['dsc', 'foc', 'stk', 'bal', 'grt', 'vit']);

const completionSchema = z.object({
    completed: z.boolean(),
    value: z.number().optional(),
    note: z.string().optional(),
    frozen: z.boolean().optional(),
});

export const habitSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.enum(['regular', 'numerical', 'infinite', 'challenge']),
    category: z.string(),
    color: z.string(),
    icon: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    schedule: z.any().optional().nullable(),
    dailyTarget: z.number().optional(),
    goalValue: z.number().optional(),
    unit: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    primarySkills: z.array(skillAttributeKey).optional(),
    secondarySkills: z.array(skillAttributeKey).optional(),
    completions: z.record(z.string(), completionSchema),
    createdAt: z.string(),
    archived: z.boolean(),
});

export const goalSchema = z.object({
    id: z.string().uuid(),
    habitId: z.string().uuid(),
    name: z.string(),
    targetValue: z.number(),
    unit: z.string(),
    deadline: z.string().optional(),
    achieved: z.boolean(),
    createdAt: z.string(),
});

export const routineSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    icon: z.string(),
    habitIds: z.array(z.string().uuid()),
    bonusXp: z.number(),
    completionTime: z.number().optional(),
});

export const characterStatsSchema = z.object({
    level: z.number(),
    xp: z.number(),
    nextLevelXp: z.number(),
    accountCreatedDate: z.string(),
    unlockedCollectibles: z.array(z.string()),
    attributes: z.object({
        ovr: z.number(),
        dsc: z.number(),
        foc: z.number(),
        stk: z.number(),
        bal: z.number(),
        grt: z.number(),
        vit: z.number(),
    }),
});

export const achievementEntrySchema = z.object({
    id: z.string(),
    unlockedAt: z.string(),
});

export const putStateBodySchema = z.object({
    habits: z.array(habitSchema),
    goals: z.array(goalSchema),
    routines: z.array(routineSchema),
    stats: characterStatsSchema,
    achievements: z.array(achievementEntrySchema),
});

export type PutStateBody = z.infer<typeof putStateBodySchema>;
