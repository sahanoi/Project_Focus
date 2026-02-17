import React, { useState, useEffect } from 'react';
import { useHabitStore } from './store/habitStore';
import AppLayout from './components/layout/AppLayout';
import HabitModal from './components/habits/HabitModal';
import HabitDetailPage from './components/habits/HabitDetailPage';
import QuickLogModal from './components/habits/QuickLogModal';
import StatsPage from './components/stats/StatsPage';
import SettingsPage from './components/settings/SettingsPage';
import { Habit } from './types';

import FUTDashboard from './components/dashboard/FUTDashboard';

export default function App() {
    const { activeTab, darkMode, selectedHabitId, setSelectedHabitId, detailViewHabitId, setDetailViewHabitId, showModal, setShowModal } = useHabitStore();

    const [editHabit, setEditHabit] = useState<Habit | null>(null);

    // Apply dark mode class to <html>
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleAddHabit = () => {
        setEditHabit(null);
        setShowModal(true);
    };

    const handleEditHabit = (habit: Habit) => {
        setEditHabit(habit);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditHabit(null);
    };

    // If a habit detail page is selected, show it as an overlay/main content
    if (detailViewHabitId) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-[#111318]' : 'bg-surface'}`}>
                <HabitDetailPage
                    habitId={detailViewHabitId}
                    onBack={() => setDetailViewHabitId(null)}
                    onEdit={handleEditHabit}
                />
                <HabitModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    editHabit={editHabit}
                />
            </div>
        );
    }

    return (
        <AppLayout onAddHabit={handleAddHabit}>
            {activeTab === 'dashboard' && (
                <FUTDashboard onAddHabit={handleAddHabit} onEditHabit={handleEditHabit} />
            )}
            {activeTab === 'statistics' && <StatsPage />}
            {activeTab === 'settings' && <SettingsPage />}

            {/* Quick Log Modal Overlay */}
            {selectedHabitId && <QuickLogModal />}

            {/* Add/Edit Modal Overlay */}
            <HabitModal
                isOpen={showModal}
                onClose={handleCloseModal}
                editHabit={editHabit}
            />
        </AppLayout>
    );
}
