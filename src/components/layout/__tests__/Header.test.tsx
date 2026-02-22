import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { useHabitStore } from '../../../store/habitStore';

// Reset store before each test
beforeEach(() => {
    useHabitStore.setState({
        habits: [],
        goals: [],
        selectedDate: '2026-02-13',
        activeTab: 'dashboard',
        statsFilter: { dateRange: 'month', habitType: 'all', habitId: 'all' },

        selectedHabitId: null,
    });
});

describe('Header Component', () => {
    const mockOnAddHabit = vi.fn();

    beforeEach(() => {
        mockOnAddHabit.mockClear();
    });


    // ==========================================
    // Title and Branding
    // ==========================================

    describe('Title', () => {
        it('should render the app title', () => {
            render(<Header onAddHabit={mockOnAddHabit} />);
            expect(screen.getByText('Habit')).toBeTruthy();
            expect(screen.getByText('Tracker')).toBeTruthy();
        });
    });

    // ==========================================
    // Add Habit Button
    // ==========================================

    describe('Add Habit Button', () => {
        it('should show add habit button on dashboard tab', () => {
            useHabitStore.setState({ activeTab: 'dashboard' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const addButton = screen.getByText(/new habit/i);
            expect(addButton).toBeTruthy();
        });

        it('should not show add habit button on other tabs', () => {
            useHabitStore.setState({ activeTab: 'statistics' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const addButton = screen.queryByText(/new habit/i);
            expect(addButton).toBeFalsy();
        });

        it('should call onAddHabit when add button is clicked', () => {
            useHabitStore.setState({ activeTab: 'dashboard' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const addButton = screen.getByText(/new habit/i);
            fireEvent.click(addButton);
            expect(mockOnAddHabit).toHaveBeenCalledTimes(1);
        });
    });

    // ==========================================
    // Date Navigation
    // ==========================================

    describe('Date Navigation', () => {
        it('should show date navigator on dashboard tab', () => {
            useHabitStore.setState({ activeTab: 'dashboard' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            expect(screen.getByLabelText(/previous day/i)).toBeTruthy();
            expect(screen.getByLabelText(/next day/i)).toBeTruthy();
        });

        it('should not show date navigator on other tabs', () => {
            useHabitStore.setState({ activeTab: 'settings' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            expect(screen.queryByLabelText(/previous day/i)).toBeFalsy();
            expect(screen.queryByLabelText(/next day/i)).toBeFalsy();
        });

        it('should navigate to previous day when clicking prev button', () => {
            useHabitStore.setState({ activeTab: 'dashboard', selectedDate: '2026-02-13' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const prevButton = screen.getByLabelText(/previous day/i);
            fireEvent.click(prevButton);
            expect(useHabitStore.getState().selectedDate).toBe('2026-02-12');
        });

        it('should navigate to next day when clicking next button', () => {
            useHabitStore.setState({ activeTab: 'dashboard', selectedDate: '2026-02-13' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const nextButton = screen.getByLabelText(/next day/i);
            fireEvent.click(nextButton);
            expect(useHabitStore.getState().selectedDate).toBe('2026-02-14');
        });

        it('should show "Today" text when on today\'s date', () => {
            const today = new Date().toISOString().split('T')[0];
            useHabitStore.setState({ activeTab: 'dashboard', selectedDate: today });
            render(<Header onAddHabit={mockOnAddHabit} />);
            expect(screen.getByText('Today')).toBeTruthy();
        });

        it('should show "Go to Today" button when not on today', () => {
            useHabitStore.setState({ activeTab: 'dashboard', selectedDate: '2020-01-01' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const goToTodayButton = screen.queryByText(/go to today/i);
            expect(goToTodayButton).toBeTruthy();
        });

        it('should jump to today when clicking "Go to Today" button', () => {
            useHabitStore.setState({ activeTab: 'dashboard', selectedDate: '2026-01-01' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const goToTodayButton = screen.getByText(/go to today/i);
            fireEvent.click(goToTodayButton);
            const today = new Date().toISOString().split('T')[0];
            expect(useHabitStore.getState().selectedDate).toBe(today);
        });
    });

    // ==========================================
    // Tab Navigation
    // ==========================================

    describe('Tab Navigation', () => {
        it('should render all three tabs', () => {
            render(<Header onAddHabit={mockOnAddHabit} />);
            expect(screen.getByText('Dashboard')).toBeTruthy();
            expect(screen.getByText('Statistics')).toBeTruthy();
            expect(screen.getByText('Settings')).toBeTruthy();
        });

        it('should mark dashboard tab as active when on dashboard', () => {
            useHabitStore.setState({ activeTab: 'dashboard' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
            expect(dashboardTab.getAttribute('aria-selected')).toBe('true');
        });

        it('should switch to statistics tab when clicked', () => {
            useHabitStore.setState({ activeTab: 'dashboard' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const statsTab = screen.getByRole('tab', { name: /statistics/i });
            fireEvent.click(statsTab);
            expect(useHabitStore.getState().activeTab).toBe('statistics');
        });

        it('should switch to settings tab when clicked', () => {
            useHabitStore.setState({ activeTab: 'dashboard' });
            render(<Header onAddHabit={mockOnAddHabit} />);
            const settingsTab = screen.getByRole('tab', { name: /settings/i });
            fireEvent.click(settingsTab);
            expect(useHabitStore.getState().activeTab).toBe('settings');
        });
    });
});
