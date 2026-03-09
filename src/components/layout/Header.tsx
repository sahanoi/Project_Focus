import React from 'react';
import { useHabitStore } from '../../store/habitStore';
import { formatDisplayDate, formatDayName } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar, BarChart3, Settings, Plus, Moon, Sun } from 'lucide-react';

interface HeaderProps {
    onAddHabit: () => void;
}

export default function Header({ onAddHabit }: HeaderProps) {
    const { selectedDate, setSelectedDate, activeTab, setActiveTab } = useHabitStore();

    const navigateDate = (direction: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + direction);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const goToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <header className="bg-white/80 dark:bg-night-bg/80 backdrop-blur-md border-b border-[#D4C8E8] dark:border-night-border sticky top-0 z-40 transition-colors">
            <div className="max-w-5xl mx-auto px-4">
                {/* Top Bar */}
                <div className="flex items-center justify-between py-3">
                    <h1 className="text-xl font-extrabold text-dark tracking-tight">
                        <span className="text-primary">Habit</span>Tracker
                    </h1>

                    <div className="flex items-center gap-2">


                        {activeTab === 'dashboard' && (
                            <button
                                onClick={onAddHabit}
                                className="btn-primary flex items-center gap-2 text-sm"
                                id="add-habit-btn"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                                <span className="hidden sm:inline">New Habit</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Date Navigator (only on dashboard) */}
                {activeTab === 'dashboard' && (
                    <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="btn-icon"
                                aria-label="Previous day"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="text-center min-w-[160px]">
                                <p className="font-bold text-dark">
                                    {isToday ? 'Today' : formatDayName(selectedDate)}
                                </p>
                                <p className="text-sm text-gray-500">{formatDisplayDate(selectedDate)}</p>
                            </div>

                            <button
                                onClick={() => navigateDate(1)}
                                className="btn-icon"
                                aria-label="Next day"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {!isToday && (
                            <button
                                onClick={goToToday}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Go to Today
                            </button>
                        )}
                    </div>
                )}

                {/* Tab Navigation */}
                <nav className="flex gap-0" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${activeTab === 'dashboard' ? 'tab-active' : 'tab-inactive'
                            }`}
                    >
                        <Calendar size={16} />
                        Dashboard
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'statistics'}
                        onClick={() => setActiveTab('statistics')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${activeTab === 'statistics' ? 'tab-active' : 'tab-inactive'
                            }`}
                    >
                        <BarChart3 size={16} />
                        Statistics
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'tab-active' : 'tab-inactive'
                            }`}
                    >
                        <Settings size={16} />
                        Settings
                    </button>
                </nav>
            </div>
        </header>
    );
}
