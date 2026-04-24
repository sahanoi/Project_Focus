import React, { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HABIT_TEMPLATES } from '../../types';
import { habitPayloadFromTemplate } from '../../utils/habitPayloadFromTemplate';
import { ChevronRight, Eye, Map } from 'lucide-react';
import AppLogo from '../ui/AppLogo';
import { motion } from 'framer-motion';

interface OnboardingProps {
    onComplete: () => void;
}

/**
 * First launch: collect display name, introduce the Drink Water anchor habit, then free play on the main dashboard.
 * Story-style quests, missions, and level roadmap live on the JOURNEY tab — not in this flow.
 */
export default function OnboardingWizard({ onComplete }: OnboardingProps) {
    const [name, setName] = useState('');
    const addHabit = useHabitStore(s => s.addHabit);
    const stats = useHabitStore(s => s.stats);
    const loadDummyData = useHabitStore(s => s.loadDummyData);

    const waterTemplate = HABIT_TEMPLATES.health[0];

    const handleFinish = () => {
        addHabit(habitPayloadFromTemplate(waterTemplate, stats));
        onComplete();
    };

    return (
        <div className="min-h-screen bg-surface dark:bg-night-bg flex items-center justify-center px-4 py-10 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-6 relative z-10"
            >
                <div className="text-center space-y-3">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center justify-center"
                    >
                        <AppLogo size={72} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-dark dark:text-night-text tracking-tight">
                        Focus FTP
                    </h1>
                    <p className="text-dark-lighter dark:text-night-text-muted text-sm">
                        What should we call you?
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="onboard-name" className="text-sm text-dark-lighter dark:text-night-text-muted block font-semibold">
                        Your name
                    </label>
                    <input
                        id="onboard-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full px-4 py-3 rounded-xl bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border text-dark dark:text-night-text placeholder-dark-lighter/40 dark:placeholder-night-text-muted/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors text-lg"
                        autoFocus
                    />
                </div>

                <div className="rounded-2xl p-5 border border-primary/15 bg-primary/5 dark:bg-primary/10 space-y-3">
                    <div className="flex items-center gap-2 text-primary dark:text-primary-light">
                        <span className="text-2xl" aria-hidden>{waterTemplate.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wider">First habit: Drink Water</span>
                    </div>
                    <p className="text-sm text-dark-light dark:text-night-text leading-relaxed">
                        {name
                            ? `${name}, we start with one simple anchor — log glasses of water so streaks and XP have something to count.`
                            : 'We start with one simple anchor — log glasses of water so streaks and XP have something to count.'}
                        {' '}You can add more habits from the home dashboard whenever you like.
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl p-4 bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border text-left">
                    <Map className="w-5 h-5 text-primary dark:text-primary-light flex-shrink-0 mt-0.5" aria-hidden />
                    <p className="text-xs text-dark-lighter dark:text-night-text-muted leading-relaxed">
                        <span className="font-semibold text-dark dark:text-night-text">Journey: </span>
                        Guideline habits, daily quests, and the longer “isekai” progression path live in the{' '}
                        <span className="font-bold text-primary dark:text-primary-light">Journey</span> tab in the side menu — your main screen stays a clean habit tracker.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                >
                    Enter app
                    <ChevronRight size={20} />
                </button>

                <button
                    type="button"
                    onClick={() => { loadDummyData(); onComplete(); }}
                    className="w-full text-dark-lighter dark:text-night-text-muted text-sm hover:text-primary transition-colors font-medium flex items-center justify-center gap-1.5"
                >
                    <Eye size={14} />
                    Preview with sample data
                </button>
            </motion.div>
        </div>
    );
}
