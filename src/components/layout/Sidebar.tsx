import React, { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeStore } from '../../store/themeStore';
import { LayoutDashboard, BarChart2, Settings, User, LogOut, Plus, Menu, X, Award, Globe, Lock, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
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
                className={`p-4 px-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group`}
                onClick={() => setIsCollapsed?.(!isCollapsed)}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <div className="flex items-center gap-3">
                    <AppLogo size={32} />
                    {!isCollapsed && <h1 className="text-xl font-bold text-dark dark:text-night-text tracking-tight transition-colors">Focus FTP</h1>}
                </div>
                {/* Mobile close button */}
                {!isCollapsed && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
                        className="lg:hidden p-2 rounded-lg hover:bg-surface-dark/50 dark:hover:bg-white/10 text-dark-lighter dark:text-night-text-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
                {/* Collapse/Expand arrow — desktop only */}
                <div className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-[#D4C8E8]/60 dark:bg-night-border/60 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 text-dark-lighter dark:text-night-text-muted group-hover:text-primary dark:group-hover:text-primary-light transition-all flex-shrink-0 ${isCollapsed ? 'mt-1' : ''}`}>
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                {!isCollapsed && <div className="text-xs font-bold text-dark-lighter uppercase px-2 mb-2 tracking-wider">Menu</div>}

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
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'luxury-glass text-primary-dark dark:text-primary-light shadow-sm border border-primary/20'
                                : isLocked
                                    ? 'text-dark-lighter/50 dark:text-night-text-muted/50 cursor-not-allowed'
                                    : 'text-dark-lighter dark:text-night-text-muted hover:bg-surface-dark/50 dark:hover:bg-white/5 hover:text-dark-light dark:hover:text-night-text'
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
                    className={`w-full mt-6 p-3 rounded-xl flex items-center justify-center ${isCollapsed ? '' : 'gap-2'} font-bold transition-all shadow-lg ${habitLimitReached
                        ? 'bg-gray-300 dark:bg-night-border text-gray-500 dark:text-night-text-muted cursor-not-allowed shadow-none'
                        : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20 hover:shadow-primary/30'
                        }`}
                    title={habitLimitReached ? `Level up to add more habits (${habitCount}/${canAddHabit(stats, 0) ? 'max' : 'max reached'})` : 'Add a new habit'}
                >
                    <Plus size={18} />
                    {!isCollapsed && <span>{habitLimitReached ? 'Level up for more' : 'New Habit'}</span>}
                </button>
            </nav>

            {/* User Profile / Bottom */}
            <div className={`px-4 pb-4 pt-2 border-t border-[#D4C8E8] dark:border-night-border bg-surface/50 dark:bg-night-surface/50 space-y-2 transition-colors flex ${isCollapsed ? 'flex-col items-center' : 'flex-col'}`}>
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-2'} rounded-lg gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group`}
                    title={isCollapsed ? "Profile" : undefined}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-surface-dark/50 dark:bg-night-bg border border-[#D4C8E8] group-hover:border-primary/50 dark:border-night-border rounded-full flex items-center justify-center text-primary dark:text-primary-light transition-colors flex-shrink-0 shadow-sm">
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
                        className={`flex items-center justify-center ${isCollapsed ? 'w-full p-2 mb-2' : 'flex-1 p-2'} rounded-lg bg-surface-dark/50 dark:bg-night-bg border border-[#D4C8E8] dark:border-night-border hover:bg-gray-50 dark:hover:border-primary-light/50 text-dark-lighter dark:text-night-text-muted transition-colors flex-shrink-0`}
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
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 luxury-glass border border-[#D4C8E8] dark:border-night-border rounded-xl shadow-md text-dark dark:text-night-text hover:bg-primary/5 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-[#E4DEF0] dark:bg-night-surface border-r border-[#D4C8E8] dark:border-night-border flex-col fixed left-0 top-0 z-50 transition-all duration-300`}>
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
                            className="lg:hidden fixed inset-0 bg-dark/20 dark:bg-black/40 backdrop-blur-sm z-[60]"
                        />
                        {/* Slide-in panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="lg:hidden fixed left-0 top-0 w-72 h-screen bg-[#E4DEF0] dark:bg-night-surface border-r border-[#D4C8E8] dark:border-night-border flex flex-col z-[70] shadow-2xl transition-colors"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
