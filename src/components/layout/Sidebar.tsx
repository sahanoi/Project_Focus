import React, { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, BarChart2, Settings, User, LogOut, Plus, Menu, X, Award, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabView } from '../../types';

interface SidebarProps {
    activeTab: TabView;
    setActiveTab: (tab: TabView) => void;
    onAddHabit: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onAddHabit }: SidebarProps) {
    const { user, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'community', label: 'Community', icon: Globe },
        { id: 'statistics', label: 'Statistics', icon: BarChart2 },
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
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-primary to-primary-light rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                        F
                    </div>
                    <h1 className="text-xl font-bold text-dark tracking-tight">Focus FTP</h1>
                </div>
                {/* Mobile close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/50 text-dark-lighter"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                <div className="text-xs font-bold text-dark-lighter uppercase px-2 mb-2 tracking-wider">Menu</div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-white text-primary-dark shadow-sm border border-primary/20'
                                : 'text-dark-lighter hover:bg-white/50 hover:text-dark-light'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-primary' : 'text-dark-lighter group-hover:text-primary-dark'} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}

                <button
                    onClick={() => { onAddHabit(); setMobileOpen(false); }}
                    className="w-full mt-6 bg-primary hover:bg-primary-dark text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                    <Plus size={18} />
                    <span>New Habit</span>
                </button>
            </nav>

            {/* User Profile / Bottom */}
            <div className="p-4 border-t border-[#E6DDF2] bg-surface/50 space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-white border border-[#E6DDF2] rounded-full flex items-center justify-center text-primary">
                        <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-dark truncate">{user?.email?.split('@')[0] || 'User'}</div>
                        <div className="text-xs text-dark-lighter truncate">{user?.email || 'Level 5 Pro'}</div>
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10 transition-all"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 bg-white border border-[#E6DDF2] rounded-xl shadow-md text-dark hover:bg-primary/5 transition-colors"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 h-screen bg-[#F4EFE6] border-r border-[#E6DDF2] flex-col fixed left-0 top-0 z-50">
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
                            className="lg:hidden fixed inset-0 bg-dark/20 backdrop-blur-sm z-[60]"
                        />
                        {/* Slide-in panel */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="lg:hidden fixed left-0 top-0 w-72 h-screen bg-[#F4EFE6] border-r border-[#E6DDF2] flex flex-col z-[70] shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
