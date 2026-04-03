import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useHabitStore } from '../../store/habitStore';

interface AppLayoutProps {
    children: React.ReactNode;
    onAddHabit: () => void;
}

export default function AppLayout({ children, onAddHabit }: AppLayoutProps) {
    const { activeTab, setActiveTab } = useHabitStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Type coercion for setActiveTab to match SidebarProps
    const handleTabChange = (tab: any) => {
        useHabitStore.setState({ activeTab: tab });
    };

    return (
        <div className="relative z-10 flex h-screen bg-surface/80 dark:bg-night-bg/85 backdrop-blur-md overflow-hidden transition-colors duration-300">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onAddHabit={onAddHabit}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            {/* Main Content Wrapper */}
            <main className={`flex-1 pl-0 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'} h-screen overflow-hidden pt-14 pb-24 lg:pt-0 lg:pb-0 transition-all duration-300`}>
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </main>

            <BottomNav
                activeTab={activeTab}
                setActiveTab={handleTabChange}
            />
        </div>
    );
}
