import React from 'react';
import { motion } from 'framer-motion';

export default function JourneyPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24 lg:pb-8">
            <header>
                <h1 className="text-3xl font-bold text-dark dark:text-night-text tracking-tight">Level Journey</h1>
                <p className="text-dark-light dark:text-night-text-muted mt-2">
                    Coming soon. Track your progress, view unlocked collectibles, and see your path ahead.
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface/50 dark:bg-night-surface/50 border border-[#D4C8E8] dark:border-night-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]"
            >
                <div className="text-6xl mb-4">🗺️</div>
                <h2 className="text-xl font-bold text-dark dark:text-night-text mb-2">Journey Map</h2>
                <p className="text-dark-lighter dark:text-night-text-muted max-w-md text-center">
                    This section is currently under construction. Check back soon for exciting new features!
                </p>
            </motion.div>
        </div>
    );
}
