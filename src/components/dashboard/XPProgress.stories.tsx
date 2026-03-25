import type { StoryDefault } from '@ladle/react';
import { useEffect } from 'react';
import type { CharacterStats } from '@/types';
import { useHabitStore } from '@/store/habitStore';
import XPProgress from './XPProgress';

const sampleStats: CharacterStats = {
    level: 7,
    xp: 1820,
    nextLevelXp: 2000,
    accountCreatedDate: new Date().toISOString(),
    unlockedCollectibles: [],
    attributes: { ovr: 68, dsc: 70, foc: 72, stk: 65, bal: 60, grt: 66, vit: 71 },
};

function StoreStub() {
    useEffect(() => {
        useHabitStore.setState({
            setActiveTab: () => {},
        });
    }, []);
    return (
        <div className="max-w-md mx-auto">
            <XPProgress stats={sampleStats} />
        </div>
    );
}

export default {
    title: 'Dashboard / XPProgress',
} satisfies StoryDefault;

export const Default = () => <StoreStub />;
