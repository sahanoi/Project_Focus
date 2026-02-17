import { Habit, Goal, Completion, Routine } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

// ==========================================
// Dummy Data Generator
// ==========================================

function dateStr(d: Date): string {
    return format(d, 'yyyy-MM-dd');
}

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCompletions(
    daysBack: number,
    probability: number,
    type: 'boolean' | 'numerical',
    minVal = 0,
    maxVal = 10
): Record<string, Completion> {
    const completions: Record<string, Completion> = {};
    const now = new Date();

    for (let i = 0; i < daysBack; i++) {
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
    const todayStr = dateStr(now);

    const habits: Habit[] = [
        // 1. Drink Water — numerical, daily, high consistency
        {
            id: uuidv4(),
            name: 'Drink Water 💧',
            type: 'numerical',
            category: 'health',
            color: '#2563EB',
            icon: '💧',
            schedule: { type: 'daily' },
            dailyTarget: 6,
            goalValue: 8,
            unit: 'glasses',
            completions: generateCompletions(60, 0.85, 'numerical', 4, 10),
            createdAt: dateStr(subDays(now, 60)),
            archived: false,
        },
        // 2. Morning Run — numerical, MWF
        {
            id: uuidv4(),
            name: 'Morning Run 🏃',
            type: 'numerical',
            category: 'fitness',
            color: '#F59E0B',
            icon: '🏃',
            schedule: { type: 'weekly', daysOfWeek: [1, 3, 5] },
            dailyTarget: 2,
            goalValue: 5,
            unit: 'km',
            completions: generateCompletions(90, 0.7, 'numerical', 2, 7),
            createdAt: dateStr(subDays(now, 90)),
            archived: false,
        },
        // 3. Read 30 min — numerical, daily
        {
            id: uuidv4(),
            name: 'Read 30 min 📚',
            type: 'numerical',
            category: 'learning',
            color: '#8B5CF6',
            icon: '📚',
            schedule: { type: 'daily' },
            dailyTarget: 15,
            goalValue: 30,
            unit: 'min',
            completions: generateCompletions(45, 0.75, 'numerical', 10, 45),
            createdAt: dateStr(subDays(now, 45)),
            archived: false,
        },
        // 4. Meditate — numerical, daily
        {
            id: uuidv4(),
            name: 'Meditate 🧘‍♂️',
            type: 'numerical',
            category: 'mindfulness',
            color: '#14B8A6',
            icon: '🧘‍♂️',
            schedule: { type: 'daily' },
            dailyTarget: 5,
            goalValue: 15,
            unit: 'min',
            completions: generateCompletions(30, 0.65, 'numerical', 3, 20),
            createdAt: dateStr(subDays(now, 30)),
            archived: false,
        },
        // 5. Take Vitamins — regular, daily, very consistent
        {
            id: uuidv4(),
            name: 'Take Vitamins 💊',
            type: 'regular',
            category: 'health',
            color: '#10B981',
            icon: '💊',
            schedule: { type: 'daily' },
            completions: generateCompletions(75, 0.9, 'boolean'),
            createdAt: dateStr(subDays(now, 75)),
            archived: false,
        },
        // 6. No Social Media — infinite, daily
        {
            id: uuidv4(),
            name: 'No Social Media 📱',
            type: 'infinite',
            category: 'productivity',
            color: '#EF4444',
            icon: '📱',
            schedule: { type: 'daily' },
            completions: generateCompletions(40, 0.6, 'boolean'),
            createdAt: dateStr(subDays(now, 40)),
            archived: false,
        },
        // 7. Push-ups — numerical, daily
        {
            id: uuidv4(),
            name: 'Push-ups 💪',
            type: 'numerical',
            category: 'fitness',
            color: '#EC4899',
            icon: '💪',
            schedule: { type: 'daily' },
            dailyTarget: 20,
            goalValue: 50,
            unit: 'reps',
            completions: generateCompletions(50, 0.72, 'numerical', 15, 60),
            createdAt: dateStr(subDays(now, 50)),
            archived: false,
        },
        // 8. 30-Day Cold Shower Challenge
        {
            id: uuidv4(),
            name: '30-Day Cold Shower ❄️',
            type: 'challenge',
            category: 'health',
            color: '#06B6D4',
            icon: '❄️',
            schedule: { type: 'daily' },
            startDate: dateStr(subDays(now, 15)),
            endDate: dateStr(subDays(now, -15)),
            completions: generateCompletions(15, 0.8, 'boolean'),
            createdAt: dateStr(subDays(now, 15)),
            archived: false,
        },
        // 9. Plan Tomorrow — regular, daily
        {
            id: uuidv4(),
            name: 'Plan Tomorrow 📝',
            type: 'regular',
            category: 'productivity',
            color: '#F97316',
            icon: '📝',
            schedule: { type: 'daily' },
            completions: generateCompletions(35, 0.78, 'boolean'),
            createdAt: dateStr(subDays(now, 35)),
            archived: false,
        },
        // 10. Call Family — regular, weekends
        {
            id: uuidv4(),
            name: 'Call Family 📞',
            type: 'regular',
            category: 'social',
            color: '#EC4899',
            icon: '📞',
            schedule: { type: 'weekly', daysOfWeek: [0, 6] },
            completions: generateCompletions(60, 0.55, 'boolean'),
            createdAt: dateStr(subDays(now, 60)),
            archived: false,
        },
        // 11. Skincare AM — regular, daily (for Skincare routine)
        {
            id: uuidv4(),
            name: 'Skincare AM ☀️',
            type: 'regular',
            category: 'health',
            color: '#F59E0B',
            icon: '☀️',
            schedule: { type: 'daily' },
            completions: generateCompletions(30, 0.82, 'boolean'),
            createdAt: dateStr(subDays(now, 30)),
            archived: false,
        },
        // 12. Skincare PM — regular, daily (for Skincare routine)
        {
            id: uuidv4(),
            name: 'Skincare PM 🌙',
            type: 'regular',
            category: 'health',
            color: '#8B5CF6',
            icon: '🌙',
            schedule: { type: 'daily' },
            completions: generateCompletions(30, 0.75, 'boolean'),
            createdAt: dateStr(subDays(now, 30)),
            archived: false,
        },
    ];

    return habits;
}

export function generateDummyGoals(habits: Habit[]): Goal[] {
    const goals: Goal[] = [];
    const numericalHabits = habits.filter(h => h.type === 'numerical' && h.goalValue);

    for (const h of numericalHabits) {
        goals.push({
            id: uuidv4(),
            habitId: h.id,
            name: `${h.name} Goal`,
            targetValue: (h.goalValue || 100) * 30, // Monthly target
            unit: h.unit || '',
            achieved: false,
            createdAt: h.createdAt,
        });
    }

    return goals;
}

export function generateDummyRoutines(habits: Habit[]): Routine[] {
    // Helper to find habit by name substring
    const findHabit = (namePart: string) => habits.find(h => h.name.toLowerCase().includes(namePart.toLowerCase()));

    const routines: Routine[] = [];

    // 1. Morning Routine
    const morningHabits = [
        findHabit('Take Vitamins'),
        findHabit('Meditate'),
        findHabit('Drink Water'),
        findHabit('Skincare AM'),
    ].filter(Boolean) as Habit[];

    if (morningHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Morning Ritual',
            description: 'Start every day with energy and intention',
            icon: '🌅',
            habitIds: morningHabits.map(h => h.id),
            bonusXp: 150,
            completionTime: 30,
        });
    }

    // 2. Bedtime Routine
    const bedtimeHabits = [
        findHabit('Plan Tomorrow'),
        findHabit('Read 30 min'),
        findHabit('Skincare PM'),
    ].filter(Boolean) as Habit[];

    if (bedtimeHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Bedtime Wind-Down',
            description: 'Prepare mind and body for deep recovery',
            icon: '🌙',
            habitIds: bedtimeHabits.map(h => h.id),
            bonusXp: 120,
            completionTime: 45,
        });
    }

    // 3. Skincare Routine
    const skincareHabits = [
        findHabit('Skincare AM'),
        findHabit('Skincare PM'),
    ].filter(Boolean) as Habit[];

    if (skincareHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Skincare Protocol',
            description: 'Daily AM/PM skincare for healthy skin',
            icon: '🧴',
            habitIds: skincareHabits.map(h => h.id),
            bonusXp: 80,
            completionTime: 10,
        });
    }

    // 4. Weekly Care
    const weeklyHabits = [
        findHabit('Call Family'),
        findHabit('Morning Run'),
    ].filter(Boolean) as Habit[];

    if (weeklyHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Weekly Check-In',
            description: 'Stay connected and stay moving',
            icon: '📋',
            habitIds: weeklyHabits.map(h => h.id),
            bonusXp: 200,
        });
    }

    return routines;
}

