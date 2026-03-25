import type { StoryDefault } from '@ladle/react';
import { useEffect, useMemo } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { generateDummyHabits } from '@/data/dummyData';
import { today } from '@/utils/dateUtils';
import HabitCard from './HabitCard';

function StoreStub() {
    const habit = useMemo(() => generateDummyHabits()[0], []);

    useEffect(() => {
        useHabitStore.setState({
            toggleCompletion: () => {},
            setNumericalValue: () => {},
            deleteHabit: () => {},
            archiveHabit: () => {},
            duplicateHabit: (_id: string) => null,
            setSelectedHabitId: () => {},
        });
    }, []);

    return (
        <div className="max-w-md mx-auto">
            <HabitCard habit={habit} date={today()} onEdit={() => {}} />
        </div>
    );
}

export default {
    title: 'Habits / HabitCard',
} satisfies StoryDefault;

export const WithDummyHabit = () => <StoreStub />;
