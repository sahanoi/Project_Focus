import { Habit, Goal, Completion, Routine } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

// ==========================================
// Demo Data Generator — Persona: Leo (CS Student & Runner)
// ==========================================

function dateStr(d: Date): string {
    return format(d, 'yyyy-MM-dd');
}

function randomBetween(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateCompletions(
    daysBack: number,
    probability: number,
    type: 'boolean' | 'numerical',
    minVal = 0,
    maxVal = 10,
    endOffset = 0
): Record<string, Completion> {
    const completions: Record<string, Completion> = {};
    const now = new Date();

    for (let i = endOffset; i < daysBack + endOffset; i++) {
        const d = subDays(now, i);
        const date = dateStr(d);
        const shouldComplete = Math.random() < probability;

        if (shouldComplete) {
            if (type === 'numerical') {
                const value = randomBetween(minVal, maxVal);
                completions[date] = { date, completed: value > 0, value };
            } else {
                completions[date] = { date, completed: true };
            }
        }
    }
    return completions;
}

export function generateDummyHabits(): Habit[] {
    const now = new Date();

    const habits: Habit[] = [
        {
            id: uuidv4(),
            name: 'LeetCode Daily',
            type: 'numerical',
            category: 'learning',
            color: '#F59E0B',
            icon: '💻',
            difficulty: 'hard',
            schedule: { type: 'daily' },
            dailyTarget: 1,
            goalValue: 3,
            unit: 'problems',
            completions: generateCompletions(120, 0.75, 'numerical', 1, 4),
            createdAt: dateStr(subDays(now, 120)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: 'Half-Marathon Prep',
            type: 'numerical',
            category: 'fitness',
            color: '#EF4444',
            icon: '🏃',
            difficulty: 'hard',
            schedule: { type: 'weekly', daysOfWeek: [1, 3, 5, 6] },
            dailyTarget: 5,
            goalValue: 15,
            unit: 'km',
            completions: generateCompletions(90, 0.85, 'numerical', 5, 18),
            createdAt: dateStr(subDays(now, 90)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: 'Deep Work (Thesis)',
            type: 'numerical',
            category: 'productivity',
            color: '#6E44FF',
            icon: '🧠',
            difficulty: 'medium',
            schedule: { type: 'daily' },
            dailyTarget: 2,
            goalValue: 6,
            unit: 'hours',
            completions: generateCompletions(60, 0.65, 'numerical', 1, 5),
            createdAt: dateStr(subDays(now, 60)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: 'Stretching & Mobility',
            type: 'regular',
            category: 'health',
            color: '#10B981',
            icon: '🧘‍♂️',
            difficulty: 'easy',
            schedule: { type: 'daily' },
            completions: generateCompletions(100, 0.90, 'boolean'),
            createdAt: dateStr(subDays(now, 100)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: 'Read SysDesign Book',
            type: 'numerical',
            category: 'learning',
            color: '#3B82F6',
            icon: '📖',
            difficulty: 'medium',
            schedule: { type: 'daily' },
            dailyTarget: 15,
            goalValue: 30,
            unit: 'pages',
            completions: generateCompletions(45, 0.8, 'numerical', 10, 40),
            createdAt: dateStr(subDays(now, 45)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: 'No Junk Food',
            type: 'infinite',
            category: 'health',
            color: '#EC4899',
            icon: '🍔',
            difficulty: 'hard',
            schedule: { type: 'daily' },
            completions: generateCompletions(50, 0.60, 'boolean'),
            createdAt: dateStr(subDays(now, 50)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: 'Hydration',
            type: 'numerical',
            category: 'health',
            color: '#06B6D4',
            icon: '💧',
            difficulty: 'easy',
            schedule: { type: 'daily' },
            dailyTarget: 2.5,
            goalValue: 4,
            unit: 'liters',
            completions: generateCompletions(120, 0.95, 'numerical', 1.5, 3.5),
            createdAt: dateStr(subDays(now, 120)),
            archived: false,
        },
        {
            id: uuidv4(),
            name: '7+ Hours Sleep',
            type: 'regular',
            category: 'health',
            color: '#8B5CF6',
            icon: '💤',
            difficulty: 'medium',
            schedule: { type: 'daily' },
            completions: generateCompletions(80, 0.70, 'boolean'),
            createdAt: dateStr(subDays(now, 80)),
            archived: false,
        },
    ];

    // Ensure today is somewhat realistic (maybe some done, some not)
    // We generated back from today.
    return habits;
}

export function generateDummyGoals(habits: Habit[]): Goal[] {
    const goals: Goal[] = [];

    const leetcode = habits.find(h => h.name === 'LeetCode Daily');
    if (leetcode) {
        goals.push({
            id: uuidv4(),
            habitId: leetcode.id,
            name: 'Solve 150 Problems',
            targetValue: 150,
            unit: 'problems',
            achieved: false,
            createdAt: leetcode.createdAt,
        });
    }

    const run = habits.find(h => h.name === 'Half-Marathon Prep');
    if (run) {
        goals.push({
            id: uuidv4(),
            habitId: run.id,
            name: 'Run 250km Total',
            targetValue: 250,
            unit: 'km',
            achieved: false,
            createdAt: run.createdAt,
        });
    }

    const thesis = habits.find(h => h.name === 'Deep Work (Thesis)');
    if (thesis) {
        goals.push({
            id: uuidv4(),
            habitId: thesis.id,
            name: '100 Hours of Deep Work',
            targetValue: 100,
            unit: 'hours',
            achieved: false,
            createdAt: thesis.createdAt,
        });
    }

    return goals;
}

export function generateDummyRoutines(habits: Habit[]): Routine[] {
    const findHabit = (name: string) =>
        habits.find(h => h.name.toLowerCase() === name.toLowerCase());

    const routines: Routine[] = [];

    const morningRunStack = [
        findHabit('Hydration'),
        findHabit('Half-Marathon Prep'),
        findHabit('Stretching & Mobility'),
    ].filter(Boolean) as Habit[];

    if (morningRunStack.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Morning Run Stack',
            description: 'Fuel up, run far, recover smart.',
            icon: '🌅',
            habitIds: morningRunStack.map(h => h.id),
            bonusXp: 300,
            completionTime: 90,
        });
    }

    const studyBlock = [
        findHabit('Deep Work (Thesis)'),
        findHabit('LeetCode Daily'),
        findHabit('Read SysDesign Book'),
    ].filter(Boolean) as Habit[];

    if (studyBlock.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Deep Work Block',
            description: 'Laser focus for computer science.',
            icon: '⚡',
            habitIds: studyBlock.map(h => h.id),
            bonusXp: 400,
            completionTime: 180,
        });
    }

    return routines;
}
