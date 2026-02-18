import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, BarChart2, Settings, User, LogOut, Plus } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: 'dashboard' | 'statistics' | 'settings') => void;
    onAddHabit: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onAddHabit }: SidebarProps) {
    const { user, signOut } = useAuth();
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'statistics', label: 'Stastics', icon: BarChart2 }, // "Reports" in reference
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <aside className="w-64 h-screen bg-[#0f1014] border-r border-[#1e1b4b]/30 flex flex-col fixed left-0 top-0 z-50">
            {/* Brand / Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                    F
                </div>
                <h1 className="text-xl font-bold text-gray-100 tracking-tight">Focus FTP</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 tracking-wider">Menu</div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-[#1e1b4b] text-indigo-300 shadow-sm border border-indigo-500/20'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}

                {/* Quick Add Button in Sidebar? Or keep it global? */}
                <button
                    onClick={onAddHabit}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-indigo-900/20 hover:shadow-indigo-600/30"
                >
                    <Plus size={18} />
                    <span>New Habit</span>
                </button>
            </nav>

            {/* User Profile / Bottom */}
            <div className="p-4 border-t border-gray-800 bg-[#0a0a0c] space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300">
                        <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-200 truncate">{user?.email?.split('@')[0] || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email || 'Level 5 Pro'}</div>
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/10 transition-all"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

