import type { StoryDefault } from '@ladle/react';
import type { CharacterStats } from '@/types';
import StatsRadar from './StatsRadar';

const sampleStats: CharacterStats = {
    level: 4,
    xp: 2450,
    nextLevelXp: 3000,
    accountCreatedDate: new Date().toISOString(),
    unlockedCollectibles: [],
    attributes: { ovr: 72, dsc: 80, foc: 65, stk: 70, bal: 55, grt: 68, vit: 74 },
};

export default {
    title: 'Dashboard / StatsRadar',
} satisfies StoryDefault;

export const Default = () => (
    <div className="max-w-md mx-auto">
        <StatsRadar stats={sampleStats} />
    </div>
);
