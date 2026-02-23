import React from 'react';
import Sidebar from './Sidebar';
import { useHabitStore } from '../../store/habitStore';

interface AppLayoutProps {
    children: React.ReactNode;
    onAddHabit: () => void;
}

export default function AppLayout({ children, onAddHabit }: AppLayoutProps) {
    const { activeTab, setActiveTab } = useHabitStore();

    // Type coercion for setActiveTab to match SidebarProps
    const handleTabChange = (tab: any) => {
        useHabitStore.setState({ activeTab: tab });
    };

    return (
        <div className="flex h-screen bg-surface dark:bg-night-bg overflow-hidden transition-colors duration-300">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onAddHabit={onAddHabit}
            />

            {/* Main Content Wrapper */}
            <main className="flex-1 pl-0 lg:pl-64 h-screen overflow-hidden pt-14 lg:pt-0">
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
