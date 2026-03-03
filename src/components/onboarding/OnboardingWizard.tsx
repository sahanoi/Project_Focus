import React, { useState, useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HABIT_CATEGORIES, HABIT_TEMPLATES, HabitCategory, HabitTemplate } from '../../types';
import { Sparkles, ChevronRight, Check, Zap, Target, Eye, ArrowLeft, Flame, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** Anchor habits — zero-resistance daily habits users already do. */
const ANCHOR_HABITS: HabitTemplate[] = [
    HABIT_TEMPLATES.health[0],        // Drink Water
    HABIT_TEMPLATES.health[4],        // Brush Teeth
    HABIT_TEMPLATES.productivity[0],  // Morning Routine
];

interface OnboardingProps {
    onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [selectedTemplates, setSelectedTemplates] = useState<HabitTemplate[]>([...ANCHOR_HABITS]);
    const [expandedCategory, setExpandedCategory] = useState<HabitCategory | null>(null);
    const [demoMode, setDemoMode] = useState(false);
    const addHabit = useHabitStore(s => s.addHabit);
    const loadDummyData = useHabitStore(s => s.loadDummyData);
    const clearAllData = useHabitStore(s => s.clearAllData);

    const toggleTemplate = (template: HabitTemplate) => {
        setSelectedTemplates(prev => {
            const exists = prev.find(t => t.name === template.name);
            if (exists) return prev.filter(t => t.name !== template.name);
            if (prev.length >= 5) return prev;
            return [...prev, template];
        });
    };

    const isSelected = (template: HabitTemplate) =>
        selectedTemplates.some(t => t.name === template.name);

    const handleFinish = () => {
        selectedTemplates.forEach(template => {
            addHabit({
                name: template.name,
                type: template.type,
                category: template.category,
                color: template.color,
                icon: template.icon,
                schedule: template.schedule,
                dailyTarget: template.dailyTarget,
                goalValue: template.goalValue,
                unit: template.unit,
            });
        });
        onComplete();
    };

    // Step 0: Welcome
    if (step === 0) {
        return (
            <div className="min-h-screen bg-surface dark:bg-night-bg flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-primary-light/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full text-center space-y-8 relative z-10"
                >
                    {/* Logo / Brand */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/20"
                        >
                            <Zap size={40} className="text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-black text-dark dark:text-night-text tracking-tight">
                            Focus FTP
                        </h1>
                        <p className="text-dark-lighter dark:text-night-text-muted text-lg leading-relaxed">
                            Your gamified habit companion
                        </p>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-3">
                        <label className="text-sm text-dark-lighter dark:text-night-text-muted block text-left font-semibold">What should we call you?</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-night-surface border border-[#D4C8E8] dark:border-night-border text-dark dark:text-night-text placeholder-dark-lighter/40 dark:placeholder-night-text-muted/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-lg shadow-sm"
                            autoFocus
                        />
                    </div>

                    {/* Philosophy */}
                    <div className="bg-white dark:bg-night-surface rounded-xl p-5 border border-[#D4C8E8] dark:border-night-border text-left space-y-3 shadow-sm">
                        <p className="text-sm text-dark-light">
                            <span className="text-primary font-bold">Your life companion.</span> Track habits, build routines, and watch yourself evolve — no forced gamification, just natural growth.
                        </p>
                        <p className="text-xs text-dark-lighter italic">
                            "What would this look like if it were fun?" — Ali Abdaal
                        </p>
                    </div>

                    {/* CTA */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(1)}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-lg flex items-center justify-center gap-2 hover:from-primary-dark hover:to-primary transition-all shadow-lg shadow-primary/20"
                    >
                        Let's begin
                        <ChevronRight size={20} />
                    </motion.button>

                    {/* Demo Preview */}
                    <button
                        onClick={() => { loadDummyData(); setDemoMode(true); onComplete(); }}
                        className="text-dark-lighter text-sm hover:text-primary transition-colors font-medium flex items-center justify-center gap-1.5 mx-auto"
                    >
                        <Eye size={14} />
                        Preview what 30 days looks like
                    </button>
                </motion.div>
            </div>
        );
    }

    // Step 1: Pick Starter Habits
    if (step === 1) {
        return (
            <div className="min-h-screen bg-surface dark:bg-night-bg px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg mx-auto space-y-6"
                >
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            <Sparkles size={14} />
                            Step 1 of 3
                        </div>
                        <h2 className="text-2xl font-black text-dark">
                            {name ? `${name}, let\u2019s` : `Let\u2019s`} start with habits you already do
                        </h2>
                        <p className="text-dark-lighter text-sm">
                            We've pre-selected 3 easy morning habits. Deselect any you don't want, or add more below.
                        </p>
                    </div>

                    {/* Anchor Habits — Pre-selected */}
                    <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary-light/5 border border-primary/10 p-4 space-y-2">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">🌱 Recommended Starters</p>
                        {ANCHOR_HABITS.map(template => (
                            <button
                                key={template.name}
                                onClick={() => toggleTemplate(template)}
                                className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all duration-200 ${isSelected(template)
                                    ? 'bg-white border border-primary/30 shadow-sm'
                                    : 'bg-white/50 border border-transparent hover:border-primary/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{template.icon}</span>
                                    <span className="text-sm font-medium text-dark">{template.name}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected(template) ? 'bg-primary' : 'border border-[#D4C8E8]'
                                    }`}>
                                    {isSelected(template) && <Check size={14} className="text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#D4C8E8]" />
                        <span className="text-xs text-dark-lighter font-medium">or add more</span>
                        <div className="flex-1 h-px bg-[#D4C8E8]" />
                    </div>

                    {/* Selection Counter */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#D4C8E8] shadow-sm">
                        <span className="text-sm text-dark-lighter font-medium">Selected</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= selectedTemplates.length
                                        ? 'bg-primary scale-110'
                                        : 'bg-[#D4C8E8]'
                                        }`}
                                />
                            ))}
                            <span className="text-sm text-dark font-bold ml-2">
                                {selectedTemplates.length}/5
                            </span>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        {HABIT_CATEGORIES.map(cat => {
                            const templates = HABIT_TEMPLATES[cat.value] || [];
                            const isExpanded = expandedCategory === cat.value;
                            const selectedInCat = templates.filter(t => isSelected(t)).length;

                            return (
                                <div key={cat.value} className="rounded-xl bg-white border border-[#D4C8E8] overflow-hidden shadow-sm">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => setExpandedCategory(isExpanded ? null : cat.value)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-sm font-bold text-dark">{cat.label}</span>
                                            {selectedInCat > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {selectedInCat}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight
                                            size={16}
                                            className={`text-dark-lighter transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                        />
                                    </button>

                                    {/* Templates */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="px-4 pb-3 space-y-2 overflow-hidden"
                                            >
                                                {templates.map(template => (
                                                    <button
                                                        key={template.name}
                                                        onClick={() => toggleTemplate(template)}
                                                        disabled={!isSelected(template) && selectedTemplates.length >= 5}
                                                        className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all duration-200 ${isSelected(template)
                                                            ? 'bg-primary/5 border border-primary/30'
                                                            : 'bg-surface border border-[#D4C8E8] hover:border-primary/30'
                                                            } ${!isSelected(template) && selectedTemplates.length >= 5
                                                                ? 'opacity-40 cursor-not-allowed'
                                                                : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{template.icon}</span>
                                                            <div>
                                                                <span className="text-sm font-medium text-dark block">{template.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}</span>
                                                                {template.goalValue && (
                                                                    <span className="text-xs text-dark-lighter">
                                                                        {template.goalValue} {template.unit}/day
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected(template)
                                                            ? 'bg-primary'
                                                            : 'border border-[#D4C8E8]'
                                                            }`}>
                                                            {isSelected(template) && <Check size={14} className="text-white" />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Continue */}
                    <div className="sticky bottom-4 pt-4">
                        <motion.button
                            whileHover={{ scale: selectedTemplates.length > 0 ? 1.01 : 1 }}
                            whileTap={{ scale: selectedTemplates.length > 0 ? 0.98 : 1 }}
                            onClick={() => setStep(2)}
                            disabled={selectedTemplates.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${selectedTemplates.length > 0
                                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-primary/20'
                                : 'bg-[#D4C8E8] text-dark-lighter cursor-not-allowed shadow-none'
                                }`}
                        >
                            Continue
                            <ChevronRight size={20} />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Step 2: Why This Works (Motivation)
    if (step === 2) {
        const bullets = [
            { icon: '🌱', text: 'Tiny habits build neural pathways. Consistency beats intensity.' },
            { icon: '🔥', text: '3 days of a habit creates a streak. 7 days starts to feel automatic.' },
            { icon: '⚡', text: 'New features unlock as you level up. Let\u2019s get you to Level 2 first.' },
        ];

        return (
            <div className="min-h-screen bg-surface dark:bg-night-bg flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-8 relative z-10"
                >
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            <Flame size={14} />
                            Why This Works
                        </div>
                        <h2 className="text-2xl font-black text-dark dark:text-night-text">
                            The science is simple
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {bullets.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.3 }}
                                className="flex items-start gap-4 px-5 py-4 rounded-xl bg-white dark:bg-night-surface border border-[#D4C8E8] dark:border-night-border shadow-sm text-left"
                            >
                                <span className="text-2xl mt-0.5">{b.icon}</span>
                                <p className="text-sm font-medium text-dark dark:text-night-text leading-relaxed">{b.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(3)}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-lg flex items-center justify-center gap-2 hover:from-primary-dark hover:to-primary transition-all shadow-lg shadow-primary/20"
                    >
                        Got it, let\u2019s go
                        <ChevronRight size={20} />
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Step 3: Confirmation / Launch
    return (
        <div className="min-h-screen bg-surface dark:bg-night-bg flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-success/5 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center space-y-8 relative z-10"
            >
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        <Target size={14} />
                        Step 3 of 3
                    </div>
                    <h2 className="text-2xl font-black text-dark">
                        You're all set{name ? `, ${name}` : ''}! 🔥
                    </h2>
                    <p className="text-dark-lighter text-sm">
                        Here's what you're committing to:
                    </p>
                </div>

                {/* Selected Habits Summary */}
                <div className="space-y-2">
                    {selectedTemplates.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#D4C8E8] shadow-sm"
                        >
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-sm font-medium text-dark flex-1 text-left">
                                {t.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}
                            </span>
                            <span className="text-xs text-dark-lighter capitalize bg-surface-dark px-2 py-0.5 rounded-full">
                                {t.schedule.type}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Motivational Note */}
                <div className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-xl p-5 border border-primary/10 text-left">
                    <p className="text-sm text-dark-light leading-relaxed">
                        <span className="text-primary font-bold">Remember:</span> Start small, stay consistent. Your habits compound over time — what feels like nothing today becomes everything tomorrow.
                    </p>
                </div>

                {/* Launch Button */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold text-lg flex items-center justify-center gap-2 hover:from-primary-dark hover:to-primary transition-all shadow-lg shadow-primary/20"
                >
                    <Sparkles size={20} />
                    Launch My Journey
                </motion.button>

                {/* Back */}
                <button
                    onClick={() => setStep(2)}
                    className="text-dark-lighter text-sm hover:text-dark transition-colors font-medium"
                >
                    ← Go back and change habits
                </button>
            </motion.div>
        </div>
    );
}
