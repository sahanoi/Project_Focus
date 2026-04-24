import React, { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeStore } from '../../store/themeStore';
import { LayoutDashboard, BarChart2, Settings, User, LogOut, Plus, Menu, X, Award, Globe, Lock, Sun, Moon, ChevronLeft, ChevronRight, Map } from 'lucide-react';
import AppLogo from '../ui/AppLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { TabView } from '../../types';
import { isAnalyticsEnabled, canAddHabit, getUserTierName } from '../../utils/featureGateUtils';

interface SidebarProps {
    activeTab: TabView;
    setActiveTab: (tab: TabView) => void;
    onAddHabit: () => void;
    isCollapsed?: boolean;
    setIsCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, onAddHabit, isCollapsed = false, setIsCollapsed }: SidebarProps) {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useThemeStore();
    const stats = useHabitStore(s => s.stats);
    const habitCount = useHabitStore(s => s.habits.filter(h => !h.archived).length);
    const [mobileOpen, setMobileOpen] = useState(false);
    const analyticsLocked = !isAnalyticsEnabled(stats);
    const habitLimitReached = !canAddHabit(stats, habitCount);
    const tierName = getUserTierName(stats);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'statistics', label: 'Statistics', icon: BarChart2 },
        { id: 'community', label: 'Community', icon: Globe },
        { id: 'journey', label: 'Journey', icon: Map },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    const handleTabChange = (tab: TabView) => {
        setActiveTab(tab);
        setMobileOpen(false);
    };

    const sidebarContent = (
        <>
            {/* Brand / Logo */}
            <div
                className={`flex items-center justify-between transition-colors group ${isCollapsed ? 'px-3 py-4' : 'p-4 px-5'} lg:cursor-pointer lg:hover:bg-black/5 dark:lg:hover:bg-primary/10`}
                onClick={() => {
                    if (window.innerWidth >= 1024) {
                        setIsCollapsed?.(!isCollapsed);
                    }
                }}
                title={window.innerWidth >= 1024 ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : undefined}
            >
                <div className="flex items-center gap-3">
                    <AppLogo size={32} />
                    {!isCollapsed && <h1 className="text-xl font-bold text-dark dark:text-night-text tracking-tight transition-colors">Focus FTP</h1>}
                </div>
                {/* Mobile close button */}
                {!isCollapsed && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
                        className="lg:hidden p-2 rounded-lg hover:bg-surface-dark/50 dark:hover:bg-primary/15 text-dark-lighter dark:text-night-text-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
                {/* Collapse/Expand arrow — desktop only, no circle */}
                <span className="hidden lg:flex text-dark-lighter/50 dark:text-night-text-muted/50 group-hover:text-primary dark:group-hover:text-primary-light transition-colors flex-shrink-0">
                    {isCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                {!isCollapsed && (
                    <div className="text-xs font-bold text-purple-dark/85 dark:text-primary-light/50 uppercase px-2 mb-2 tracking-wider">
                        Menu
                    </div>
                )}

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isLocked = item.id === 'statistics' && analyticsLocked;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (isLocked) return;
                                handleTabChange(item.id);
                            }}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-colors duration-200 group ${isActive
                                ? 'bg-hearth-surface-high dark:bg-primary/15 text-primary-dark dark:text-primary-light'
                                : isLocked
                                    ? 'text-dark-lighter/50 dark:text-night-text-muted/50 cursor-not-allowed'
                                    : 'text-dark-lighter dark:text-night-text-muted hover:bg-surface-dark/50 dark:hover:bg-primary/10 hover:text-dark-light dark:hover:text-night-text'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-primary dark:text-primary-light' : isLocked ? 'text-dark-lighter/40 dark:text-night-text-muted/40' : 'text-dark-lighter dark:text-night-text-muted group-hover:text-primary-dark dark:group-hover:text-primary'} />
                            {!isCollapsed && <span className="font-medium text-sm flex-1 text-left">{item.label}</span>}
                            {!isCollapsed && isLocked && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                    <Lock size={8} /> Lvl 3
                                </span>
                            )}
                        </button>
                    );
                })}

                <button
                    onClick={() => { if (!habitLimitReached) { onAddHabit(); setMobileOpen(false); } }}
                    className={`w-full mt-6 p-3 rounded-xl flex items-center justify-center ${isCollapsed ? '' : 'gap-2'} font-bold transition-colors ${habitLimitReached
                        ? 'bg-gray-300 dark:bg-night-border text-gray-500 dark:text-night-text-muted cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark text-white'
                        }`}
                    title={habitLimitReached ? `Level up to add more habits (${habitCount}/${canAddHabit(stats, 0) ? 'max' : 'max reached'})` : 'Add a new habit'}
                >
                    <Plus size={18} />
                    {!isCollapsed && <span>{habitLimitReached ? 'Level up for more' : 'New Habit'}</span>}
                </button>
            </nav>

            {/* User Profile / Bottom */}
            <div className={`px-4 pb-4 pt-2 border-t border-dark-border dark:border-night-border bg-surface/50 dark:bg-night-surface/50 space-y-2 transition-colors flex ${isCollapsed ? 'flex-col items-center' : 'flex-col'}`}>
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-2'} rounded-lg gap-2 hover:bg-black/5 dark:hover:bg-primary/10 transition-colors group`}
                    title={isCollapsed ? "Profile" : undefined}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-surface-dark/50 dark:bg-night-surface/60 border border-dark-border group-hover:border-primary/50 dark:border-night-border rounded-full flex items-center justify-center text-primary dark:text-primary-light transition-colors flex-shrink-0">
                            <User size={16} />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-sm font-bold text-dark dark:text-night-text truncate transition-colors group-hover:text-primary-dark dark:group-hover:text-primary-light">{user?.email?.split('@')[0] || 'User'}</div>
                                <div className="text-xs text-dark-lighter dark:text-night-text-muted truncate transition-colors">{tierName} • Lvl {stats.level}</div>
                            </div>
                        )}
                    </div>
                </button>
                <div className={`flex ${isCollapsed ? 'flex-col w-full' : 'gap-2 w-full'} transition-all`}>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`flex items-center justify-center ${isCollapsed ? 'w-full p-2 mb-2' : 'flex-1 p-2'} rounded-lg bg-surface-dark/50 dark:bg-night-surface/60 border border-dark-border dark:border-night-border hover:bg-gray-50 dark:hover:border-primary-light/50 text-dark-lighter dark:text-night-text-muted transition-colors flex-shrink-0`}
                        title="Toggle Dark Mode"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button
                        onClick={signOut}
                        title={isCollapsed ? "Sign Out" : undefined}
                        className={`flex items-center justify-center gap-2 ${isCollapsed ? 'w-full p-2' : 'flex-1 px-3 py-2'} rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 border border-red-500/10 transition-all dark:text-red-400 dark:hover:bg-red-500/20`}
                    >
                        <LogOut size={14} />
                        {!isCollapsed && "Sign Out"}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => {
                    setIsCollapsed?.(false);
                    setMobileOpen(true);
                }}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border rounded-xl text-dark dark:text-night-text hover:bg-primary/5 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-[#E4DEF0] dark:bg-night-surface border-r border-dark-border dark:border-night-border flex-col fixed left-0 top-0 z-50 transition-all duration-300`}>
                {sidebarContent}
            </aside>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-dark/20 dark:bg-night-bg/70 backdrop-blur-sm z-[60]"
                        />
                        {/* Slide-in panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                            className="lg:hidden fixed left-0 top-0 w-72 h-screen bg-[#E4DEF0] dark:bg-night-surface border-r border-dark-border dark:border-night-border flex flex-col z-[70] transition-colors"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
