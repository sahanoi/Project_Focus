import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../../store/habitStore';
import { Search, Zap, Check } from 'lucide-react';

export default function LogEntryBar() {
    const { habits, selectedDate, toggleCompletion, setNumericalValue, setSelectedHabitId } = useHabitStore();
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const activeHabits = habits.filter(h => !h.archived);

    const topUncompleted = useMemo(() => {
        return activeHabits
            .filter(h => {
                const c = h.completions[selectedDate];
                if (h.type === 'numerical') return !c?.value || c.value === 0;
                return !c?.completed;
            })
            .slice(0, 4);
    }, [activeHabits, selectedDate]);

    const filteredHabits = useMemo(() => {
        if (!search.trim()) return activeHabits.slice(0, 6);
        return activeHabits.filter(h =>
            h.name.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 6);
    }, [activeHabits, search]);

    const handleQuickToggle = (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;
        if (habit.type === 'numerical') {
            const current = habit.completions[selectedDate]?.value ?? 0;
            setNumericalValue(habitId, selectedDate, current + (habit.dailyTarget || 1));
        } else {
            toggleCompletion(habitId, selectedDate);
        }
    };

    const handleSelectHabit = (habitId: string) => {
        setSelectedHabitId(habitId);
        setSearch('');
        setShowDropdown(false);
    };

    return (
        <div className="flex flex-col gap-2 flex-1">
            {/* Search/Log Input */}
            <motion.div
                layout
                className="relative w-full max-w-2xl"
                animate={{
                    maxWidth: showDropdown ? '100%' : '42rem'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <div className="flex items-center bg-white dark:bg-night-surface rounded-lg border border-dark-border dark:border-night-border px-3 py-2 focus-within:border-primary/50 dark:focus-within:border-primary-light/50 transition-colors w-full">
                    <Search size={16} className="text-dark-lighter dark:text-night-text-muted mr-2 flex-shrink-0 transition-colors" />
                    <input
                        type="text"
                        placeholder="Log a habit completion..."
                        className="bg-transparent text-sm text-dark dark:text-night-text placeholder-dark-lighter/60 dark:placeholder-night-text-muted/60 outline-none w-full transition-colors"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && filteredHabits.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-night-surface border border-dark-border dark:border-night-border rounded-lg z-50 overflow-hidden transition-colors">
                        {filteredHabits.map(h => {
                            const c = h.completions[selectedDate];
                            const isDone = h.type === 'numerical'
                                ? (c?.value ?? 0) > 0
                                : c?.completed === true;

                            return (
                                <button
                                    key={h.id}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectHabit(h.id);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/5 dark:hover:bg-primary-light/10 transition-colors ${isDone ? 'opacity-50' : ''
                                        }`}
                                >
                                    <span className="text-base">{h.icon}</span>
                                    <span className="text-sm text-dark dark:text-night-text flex-1 truncate transition-colors">{h.name}</span>
                                    {isDone && <Check size={14} className="text-success" />}
                                    {!isDone && (
                                        <span className="text-[10px] text-dark-lighter dark:text-night-text-muted font-medium transition-colors">
                                            {h.type === 'numerical' ? `+${h.dailyTarget || 1} ${h.unit}` : 'Toggle'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Quick Toggle Pills (under search) */}
            <AnimatePresence>
                {!showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="flex items-center gap-2 overflow-hidden flex-wrap min-h-[30px]"
                    >
                        {topUncompleted.length === 0 && activeHabits.length > 0 ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 text-xs font-bold text-success dark:text-success-light flex-shrink-0">
                                <Check size={12} />
                                All done today!
                            </span>
                        ) : (
                            <>
                                <Zap size={14} className="text-warning flex-shrink-0" />
                                {topUncompleted.map(h => (
                                    <button
                                        key={h.id}
                                        onClick={() => handleQuickToggle(h.id)}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-night-surface border border-dark-border dark:border-night-border hover:border-primary/30 dark:hover:border-primary-light/30 hover:bg-primary/5 dark:hover:bg-primary/10 text-xs text-dark-light dark:text-night-text transition-colors group flex-shrink-0"
                                        title={`Quick complete: ${h.name}`}
                                    >
                                        <span className="text-sm">{h.icon}</span>
                                        <span className="hidden xl:inline max-w-[80px] truncate">{h.name.replace(/\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, '')}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
