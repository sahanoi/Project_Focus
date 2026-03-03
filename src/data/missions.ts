export interface DailyMission {
    day: number;
    title: string;
    description: string;
    targetAction: string; // Internal identifier for the action needed
    rewardXP: number;
}

export const USER_MISSIONS: Record<number, DailyMission> = {
    1: {
        day: 1,
        title: "Your First Win",
        description: "Consistency starts small. Complete at least one habit today to kick off your journey and secure your first streak.",
        targetAction: "COMPLETE_1_HABIT",
        rewardXP: 100
    },
    2: {
        day: 2,
        title: "Double Down",
        description: "Momentum is building. Try to complete two total habits today. If you only have one, add another quick anchor habit!",
        targetAction: "COMPLETE_2_HABITS",
        rewardXP: 150
    },
    3: {
        day: 3,
        title: "The Magic Three",
        description: "Three completions in a row forms a streak. Build a 3-day streak on any of your habits today.",
        targetAction: "ACHIEVE_STREAK_3",
        rewardXP: 200
    },
    4: {
        day: 4,
        title: "Make It Yours",
        description: "Anchor habits are great, but now it's time to add a custom habit that's uniquely yours. Create one new habit.",
        targetAction: "CREATE_CUSTOM_HABIT",
        rewardXP: 150
    },
    5: {
        day: 5,
        title: "Strength in Numbers",
        description: "You're not alone. Navigate to the Community tab and check out what others are doing.",
        targetAction: "VISIT_COMMUNITY",
        rewardXP: 100
    },
    6: {
        day: 6,
        title: "Vision & Purpose",
        description: "Habits are the system; goals are the destination. Set your first Long-Term Goal in the Goals section.",
        targetAction: "CREATE_FIRST_GOAL",
        rewardXP: 250
    },
    7: {
        day: 7,
        title: "The Apprentice",
        description: "You've proven you can stick to a system. Complete today's habits to officially reach Level 2 and unlock Numerical Tracking!",
        targetAction: "REACH_LEVEL_2",
        rewardXP: 500
    }
};

/**
 * Helper to determine what day of onboarding the user is currently on (1-7).
 * It caps at 8 (meaning they are done with the 7-day onboarding).
 */
export function getOnboardingDay(accountCreatedISO?: string): number {
    if (!accountCreatedISO) return 1;

    const createdDate = new Date(accountCreatedISO);
    createdDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Day 1 is the day of creation (diffDays = 0). Day 2 is diffDays = 1, etc.
    const currentDay = diffDays + 1;

    return Math.min(8, Math.max(1, currentDay));
}
