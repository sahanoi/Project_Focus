import React, { useState, useEffect, useRef } from 'react';
import { useHabitStore } from './store/habitStore';
import AppLayout from './components/layout/AppLayout';
import HabitModal from './components/habits/HabitModal';
import HabitDetailPage from './components/habits/HabitDetailPage';
import QuickLogModal from './components/habits/QuickLogModal';
import StatsPage from './components/stats/StatsPage';
import SettingsPage from './components/settings/SettingsPage';
import Auth from './components/auth/Auth';
import IntroGate from './components/auth/IntroGate';
import WebBgBackdrop from './components/auth/WebBgBackdrop';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import SmartGoalWizard from './components/goals/SmartGoalWizard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useThemeStore } from './store/themeStore';
import { Habit } from './types';
import { Loader2 } from 'lucide-react';
import CollectibleToast from './components/ui/CollectibleToast';

import FUTDashboard from './components/dashboard/FUTDashboard';
import ProfilePage from './components/dashboard/ProfilePage';
import JourneyPage from './components/dashboard/JourneyPage';
import AchievementsPage from './components/dashboard/AchievementsPage';
import CommunityPage from './components/dashboard/CommunityPage';
import AchievementToast from './components/dashboard/AchievementToast';
import LevelUpModal from './components/dashboard/LevelUpModal';

function AuthenticatedApp() {
    const { activeTab, habits, selectedHabitId, setSelectedHabitId, detailViewHabitId, setDetailViewHabitId, showModal, setShowModal, fetchAllData } = useHabitStore();
    const { session, loading } = useAuth();
    const { theme } = useThemeStore();
    const [editHabit, setEditHabit] = useState<Habit | null>(null);
    const [onboardingDone, setOnboardingDone] = useState(false);
    const [showGoalWizard, setShowGoalWizard] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const hasFetchedRef = useRef(false);

    // Run fetchAllData once when session appears (no-op for local-only store; keeps loading UX consistent).
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

    // Handle global dark mode HTML class
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark');
        } else if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-night-bg transition-colors">
                <Loader2 className="w-8 h-8 text-primary dark:text-primary-light animate-spin" />
            </div>
        );
    }

    if (!session) {
        return <Auth variant="atmosphere" />;
    }

    // Only show full-screen loading on initial data fetch, not on subsequent re-renders
    if (!initialLoadDone) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-night-bg transition-colors">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-primary dark:text-primary-light animate-spin mx-auto" />
                    <p className="text-dark-lighter dark:text-night-text-muted text-sm">Loading your data...</p>
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
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'journey' && <JourneyPage />}
            {activeTab === 'community' && <CommunityPage />}
            {activeTab === 'statistics' && <StatsPage onEditHabit={handleEditHabit} />}
            {activeTab === 'settings' && <SettingsPage />}
            {activeTab === 'achievements' && <AchievementsPage />}

            {/* Achievement Unlock Toast */}
            <AchievementToast />

            {/* Collectible Unlock Toast */}
            <CollectibleToast />

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

function AppBackground() {
    const { session, loading } = useAuth();
    // Story art (login.png) is only for the sign-in atmosphere. After auth, use a flat surface
    // so onboarding and the rest of the app are not layered over the irrelevant LOGIN scene.
    if (session) {
        return (
            <div className="fixed inset-0 z-0 bg-surface dark:bg-night-bg" aria-hidden />
        );
    }
    return <WebBgBackdrop showReadabilityScrim={loading || !session} />;
}

export default function App() {
    return (
        <AuthProvider>
            <AppBackground />
            <IntroGate>
                <AuthenticatedApp />
            </IntroGate>
        </AuthProvider>
    );
}
