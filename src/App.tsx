import React, { useState, useEffect, useRef } from 'react';
import { useHabitStore } from './store/habitStore';
import AppLayout from './components/layout/AppLayout';
import HabitModal from './components/habits/HabitModal';
import HabitDetailPage from './components/habits/HabitDetailPage';
import QuickLogModal from './components/habits/QuickLogModal';
import StatsPage from './components/stats/StatsPage';
import SettingsPage from './components/settings/SettingsPage';
import Auth from './components/auth/Auth';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import SmartGoalWizard from './components/goals/SmartGoalWizard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Habit } from './types';
import { Loader2 } from 'lucide-react';

import FUTDashboard from './components/dashboard/FUTDashboard';
import AchievementsPage from './components/dashboard/AchievementsPage';
import CommunityPage from './components/dashboard/CommunityPage';
import AchievementToast from './components/dashboard/AchievementToast';
import LevelUpModal from './components/dashboard/LevelUpModal';

function AuthenticatedApp() {
    const { activeTab, habits, selectedHabitId, setSelectedHabitId, detailViewHabitId, setDetailViewHabitId, showModal, setShowModal, fetchAllData, isLoading } = useHabitStore();
    const { session, loading } = useAuth();
    const [editHabit, setEditHabit] = useState<Habit | null>(null);
    const [onboardingDone, setOnboardingDone] = useState(false);
    const [showGoalWizard, setShowGoalWizard] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const hasFetchedRef = useRef(false);

    // Fetch data from Supabase ONCE when session becomes available.
    // We use a ref to prevent re-fetching when Supabase fires TOKEN_REFRESHED
    // on window focus (alt-tab), which creates a new session object reference.
    useEffect(() => {
        if (session && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchAllData().then(() => setInitialLoadDone(true));
        }
        if (!session) {
            hasFetchedRef.current = false;
            setInitialLoadDone(false);
        }
    }, [session, fetchAllData]);



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return <Auth />;
    }

    // Only show full-screen loading on initial data fetch, not on subsequent re-renders
    if (!initialLoadDone) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto" />
                    <p className="text-gray-400 text-sm">Loading your data...</p>
                </div>
            </div>
        );
    }

    // Show onboarding for first-time users (no habits yet)
    if (habits.length === 0 && !onboardingDone) {
        return <OnboardingWizard onComplete={() => setOnboardingDone(true)} />;
    }

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
            <div className={`min-h-screen bg-surface`}>
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
                <FUTDashboard onAddHabit={handleAddHabit} onEditHabit={handleEditHabit} onAddGoal={() => setShowGoalWizard(true)} />
            )}
            {activeTab === 'community' && <CommunityPage />}
            {activeTab === 'statistics' && <StatsPage onEditHabit={handleEditHabit} />}
            {activeTab === 'settings' && <SettingsPage />}
            {activeTab === 'achievements' && <AchievementsPage />}

            {/* Achievement Unlock Toast */}
            <AchievementToast />

            {/* Level Up Celebration */}
            <LevelUpModal />

            {/* Quick Log Modal Overlay */}
            {selectedHabitId && <QuickLogModal />}

            {/* Add/Edit Modal Overlay */}
            <HabitModal
                isOpen={showModal}
                onClose={handleCloseModal}
                editHabit={editHabit}
            />

            {/* S.M.A.R.T. Goal Wizard */}
            <SmartGoalWizard
                isOpen={showGoalWizard}
                onClose={() => setShowGoalWizard(false)}
            />
        </AppLayout>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    );
}
