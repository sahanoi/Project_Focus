import { Habit, Goal, Completion, Routine } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';

// ==========================================
// Demo Data Generator — Clean, Realistic
// ==========================================

function dateStr(d: Date): string {
    return format(d, 'yyyy-MM-dd');
}

function randomBetween(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10; // supports decimals
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

    const habits: Habit[] = [
        // 1. Study Hours — numerical, daily, the main one with big goal
        {
            id: uuidv4(),
            name: 'Study',
            type: 'numerical',
            category: 'learning',
            color: '#2563EB',
            icon: '📚',
            schedule: { type: 'daily' },
            dailyTarget: 2,
            goalValue: 4,
            unit: 'hours',
            completions: generateCompletions(90, 0.82, 'numerical', 0.5, 5),
            createdAt: dateStr(subDays(now, 90)),
            archived: false,
        },
        // 2. Running — numerical, MWF
        {
            id: uuidv4(),
            name: 'Running',
            type: 'numerical',
            category: 'fitness',
            color: '#F59E0B',
            icon: '🏃',
            schedule: { type: 'weekly', daysOfWeek: [1, 3, 5] },
            dailyTarget: 3,
            goalValue: 7,
            unit: 'km',
            completions: generateCompletions(75, 0.68, 'numerical', 1.5, 8),
            createdAt: dateStr(subDays(now, 75)),
            archived: false,
        },
        // 3. Reading — numerical, daily
        {
            id: uuidv4(),
            name: 'Reading',
            type: 'numerical',
            category: 'learning',
            color: '#8B5CF6',
            icon: '📖',
            schedule: { type: 'daily' },
            dailyTarget: 20,
            goalValue: 40,
            unit: 'min',
            completions: generateCompletions(60, 0.73, 'numerical', 10, 50),
            createdAt: dateStr(subDays(now, 60)),
            archived: false,
        },
        // 4. Meditation — numerical, daily
        {
            id: uuidv4(),
            name: 'Meditation',
            type: 'numerical',
            category: 'mindfulness',
            color: '#14B8A6',
            icon: '🧘',
            schedule: { type: 'daily' },
            dailyTarget: 5,
            goalValue: 15,
            unit: 'min',
            completions: generateCompletions(45, 0.62, 'numerical', 3, 20),
            createdAt: dateStr(subDays(now, 45)),
            archived: false,
        },
        // 5. Take Vitamins — regular, daily
        {
            id: uuidv4(),
            name: 'Take Vitamins',
            type: 'regular',
            category: 'health',
            color: '#10B981',
            icon: '💊',
            schedule: { type: 'daily' },
            completions: generateCompletions(80, 0.88, 'boolean'),
            createdAt: dateStr(subDays(now, 80)),
            archived: false,
        },
        // 6. No Social Media — infinite, daily
        {
            id: uuidv4(),
            name: 'No Social Media',
            type: 'infinite',
            category: 'productivity',
            color: '#EF4444',
            icon: '📵',
            schedule: { type: 'daily' },
            completions: generateCompletions(40, 0.58, 'boolean'),
            createdAt: dateStr(subDays(now, 40)),
            archived: false,
        },
        // 7. Workout — numerical, daily
        {
            id: uuidv4(),
            name: 'Workout',
            type: 'numerical',
            category: 'fitness',
            color: '#EC4899',
            icon: '💪',
            schedule: { type: 'daily' },
            dailyTarget: 30,
            goalValue: 60,
            unit: 'min',
            completions: generateCompletions(55, 0.7, 'numerical', 15, 75),
            createdAt: dateStr(subDays(now, 55)),
            archived: false,
        },
        // 8. Cold Shower Challenge — 30 days
        {
            id: uuidv4(),
            name: 'Cold Shower Challenge',
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
            name: 'Plan Tomorrow',
            type: 'regular',
            category: 'productivity',
            color: '#F97316',
            icon: '📝',
            schedule: { type: 'daily' },
            completions: generateCompletions(50, 0.76, 'boolean'),
            createdAt: dateStr(subDays(now, 50)),
            archived: false,
        },
        // 10. Call Family — regular, weekends
        {
            id: uuidv4(),
            name: 'Call Family',
            type: 'regular',
            category: 'social',
            color: '#EC4899',
            icon: '📞',
            schedule: { type: 'weekly', daysOfWeek: [0, 6] },
            completions: generateCompletions(60, 0.55, 'boolean'),
            createdAt: dateStr(subDays(now, 60)),
            archived: false,
        },
        // 11. Drink Water — numerical, daily
        {
            id: uuidv4(),
            name: 'Drink Water',
            type: 'numerical',
            category: 'health',
            color: '#3B82F6',
            icon: '💧',
            schedule: { type: 'daily' },
            dailyTarget: 6,
            goalValue: 10,
            unit: 'glasses',
            completions: generateCompletions(70, 0.85, 'numerical', 3, 12),
            createdAt: dateStr(subDays(now, 70)),
            archived: false,
        },
        // 12. Journaling — regular, daily
        {
            id: uuidv4(),
            name: 'Journaling',
            type: 'regular',
            category: 'mindfulness',
            color: '#A855F7',
            icon: '📓',
            schedule: { type: 'daily' },
            completions: generateCompletions(35, 0.65, 'boolean'),
            createdAt: dateStr(subDays(now, 35)),
            archived: false,
        },
    ];

    return habits;
}

export function generateDummyGoals(habits: Habit[]): Goal[] {
    const goals: Goal[] = [];

    // Find the "Study" habit for a big 1000hr goal
    const studyHabit = habits.find(h => h.name === 'Study');
    if (studyHabit) {
        goals.push({
            id: uuidv4(),
            habitId: studyHabit.id,
            name: '1000 Hours of Study',
            targetValue: 1000,
            unit: 'hours',
            achieved: false,
            createdAt: studyHabit.createdAt,
        });
    }

    // Running goal
    const runHabit = habits.find(h => h.name === 'Running');
    if (runHabit) {
        goals.push({
            id: uuidv4(),
            habitId: runHabit.id,
            name: 'Run 500km',
            targetValue: 500,
            unit: 'km',
            achieved: false,
            createdAt: runHabit.createdAt,
        });
    }

    // Workout goal
    const workoutHabit = habits.find(h => h.name === 'Workout');
    if (workoutHabit) {
        goals.push({
            id: uuidv4(),
            habitId: workoutHabit.id,
            name: 'Workout 200 Hours',
            targetValue: 12000,
            unit: 'min',
            achieved: false,
            createdAt: workoutHabit.createdAt,
        });
    }

    return goals;
}

export function generateDummyRoutines(habits: Habit[]): Routine[] {
    const findHabit = (name: string) =>
        habits.find(h => h.name.toLowerCase() === name.toLowerCase());

    const routines: Routine[] = [];

    // Morning Routine
    const morningHabits = [
        findHabit('Take Vitamins'),
        findHabit('Meditation'),
        findHabit('Drink Water'),
    ].filter(Boolean) as Habit[];

    if (morningHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Morning Ritual',
            description: 'Start every day with intention',
            icon: '🌅',
            habitIds: morningHabits.map(h => h.id),
            bonusXp: 150,
            completionTime: 30,
        });
    }

    // Evening Routine
    const eveningHabits = [
        findHabit('Plan Tomorrow'),
        findHabit('Reading'),
        findHabit('Journaling'),
    ].filter(Boolean) as Habit[];

    if (eveningHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Evening Wind-Down',
            description: 'Prepare for deep recovery',
            icon: '🌙',
            habitIds: eveningHabits.map(h => h.id),
            bonusXp: 120,
            completionTime: 45,
        });
    }

    // Fitness Stack
    const fitnessHabits = [
        findHabit('Running'),
        findHabit('Workout'),
    ].filter(Boolean) as Habit[];

    if (fitnessHabits.length > 0) {
        routines.push({
            id: uuidv4(),
            name: 'Fitness Stack',
            description: 'Build strength and endurance',
            icon: '🏋️',
            habitIds: fitnessHabits.map(h => h.id),
            bonusXp: 200,
        });
    }

    return routines;
}
