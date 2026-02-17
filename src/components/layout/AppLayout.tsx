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
    const handleTabChange = (tab: 'dashboard' | 'statistics' | 'settings') => {
        useHabitStore.setState({ activeTab: tab });
    };

    return (
        <div className="flex min-h-screen bg-[#111318]">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onAddHabit={onAddHabit}
            />

            {/* Main Content Wrapper */}
            <main className="flex-1 pl-64">
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
