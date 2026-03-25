import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { LayoutDashboard, BarChart2, Globe, Award, User, Lock } from 'lucide-react';
import { TabView } from '../../types';
import { isAnalyticsEnabled } from '../../utils/featureGateUtils';

interface BottomNavProps {
    activeTab: TabView;
    setActiveTab: (tab: TabView) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
    const stats = useHabitStore(s => s.stats);
    const analyticsLocked = !isAnalyticsEnabled(stats);

    const navItems: { id: TabView; label: string; icon: React.ElementType; locked?: boolean }[] = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'statistics', label: 'Stats', icon: BarChart2, locked: analyticsLocked },
        { id: 'community', label: 'Social', icon: Globe },
        { id: 'achievements', label: 'Badges', icon: Award },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-night-surface border-t border-dark-border dark:border-night-border z-40 transition-colors pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center px-1 py-1 h-[72px] mb-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isLocked = item.locked;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (!isLocked) setActiveTab(item.id);
                            }}
                            className={`flex flex-col items-center justify-center w-full h-full relative transition-colors duration-300 ${isActive
                                ? 'text-primary dark:text-primary-light'
                                : isLocked
                                    ? 'text-dark-lighter/40 dark:text-night-text-muted/40 cursor-not-allowed'
                                    : 'text-dark-lighter dark:text-night-text-muted hover:text-dark-light dark:hover:text-night-text'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-300 relative ${isActive ? 'bg-primary/10 dark:bg-primary-light/10 mb-1' : 'mb-0'}`}>
                                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                                {isLocked && (
                                    <div className="absolute -top-1 -right-1 bg-amber-100 dark:bg-amber-900/50 rounded-full p-0.5 border border-amber-200 dark:border-amber-700">
                                        <Lock size={8} className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 mt-1'}`}>{item.label}</span>
                            {isActive && (
                                <div className="absolute top-0 w-8 h-1 bg-primary dark:bg-primary-light rounded-b-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
