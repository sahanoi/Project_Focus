import React, { useState, useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HABIT_CATEGORIES, HABIT_TEMPLATES, HabitCategory, HabitTemplate } from '../../types';
import { getMinLevelForHabitType, isHabitTypeAvailable } from '../../utils/featureGateUtils';
import { Sparkles, ChevronRight, Check, Zap, Target, Eye, ArrowLeft, Flame, Unlock } from 'lucide-react';
import AppLogo from '../ui/AppLogo';
import { motion, AnimatePresence } from 'framer-motion';

/** Anchor habits — all **regular** so Level 1 (novice) can create them before numerical unlocks. */
const ANCHOR_HABITS: HabitTemplate[] = [
    HABIT_TEMPLATES.health[1],        // Take Vitamins
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
    const stats = useHabitStore(s => s.stats);
    const loadDummyData = useHabitStore(s => s.loadDummyData);
    const clearAllData = useHabitStore(s => s.clearAllData);

    const habitPayloadFromTemplate = (template: HabitTemplate) => {
        const type = isHabitTypeAvailable(stats, template.type) ? template.type : 'regular';
        const base = {
            name: template.name,
            type,
            category: template.category,
            color: template.color,
            icon: template.icon,
            schedule: template.schedule,
        };
        if (type === 'numerical') {
            return {
                ...base,
                dailyTarget: template.dailyTarget,
                goalValue: template.goalValue,
                unit: template.unit,
            };
        }
        if (type === 'infinite') {
            return base;
        }
        return base;
    };

    const toggleTemplate = (template: HabitTemplate) => {
        if (!isHabitTypeAvailable(stats, template.type)) return;
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
            addHabit(habitPayloadFromTemplate(template));
        });
        onComplete();
    };

    // Step 0: Welcome
    if (step === 0) {
        return (
            <div className="min-h-screen bg-surface dark:bg-night-bg flex items-center justify-center px-4 relative overflow-hidden">

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
                            className="inline-flex items-center justify-center"
                        >
                            <AppLogo size={80} />
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
                            className="w-full px-4 py-3 rounded-xl bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border text-dark dark:text-night-text placeholder-dark-lighter/40 dark:placeholder-night-text-muted/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors text-lg"
                            autoFocus
                        />
                    </div>

                    {/* Philosophy */}
                    <div className="bg-surface dark:bg-night-surface rounded-xl p-5 border border-dark-border dark:border-night-border text-left space-y-3">
                        <p className="text-sm text-dark-light dark:text-night-text">
                            <span className="text-primary font-bold">Your life companion.</span> Track habits, build routines, and watch yourself evolve — no forced gamification, just natural growth.
                        </p>
                        <p className="text-xs text-dark-lighter dark:text-night-text-muted italic">
                            "What would this look like if it were fun?" — Ali Abdaal
                        </p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        Let's begin
                        <ChevronRight size={20} />
                    </button>

                    {/* Demo Preview */}
                    <button
                        onClick={() => { loadDummyData(); setDemoMode(true); onComplete(); }}
                        className="text-dark-lighter dark:text-night-text-muted text-sm hover:text-primary transition-colors font-medium flex items-center justify-center gap-1.5 mx-auto"
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
                        <h2 className="text-2xl font-black text-dark dark:text-night-text">
                            {name ? `${name}, let\u2019s` : `Let\u2019s`} start with habits you already do
                        </h2>
                        <p className="text-dark-lighter dark:text-night-text-muted text-sm">
                            We've pre-selected 3 easy morning habits. Deselect any you don't want, or add more below.
                        </p>
                    </div>

                    {/* Anchor Habits — Pre-selected */}
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">🌱 Recommended Starters</p>
                        {ANCHOR_HABITS.map(template => (
                            <button
                                key={template.name}
                                onClick={() => toggleTemplate(template)}
                                className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all duration-200 ${isSelected(template)
                                    ? 'bg-white dark:bg-night-surface border border-primary/30 dark:border-primary/30'
                                    : 'bg-white/50 dark:bg-night-bg/50 border border-transparent hover:border-primary/20 dark:hover:border-primary/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{template.icon}</span>
                                    <span className="text-sm font-medium text-dark dark:text-night-text">{template.name}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected(template) ? 'bg-primary' : 'border border-dark-border dark:border-night-border'
                                    }`}>
                                    {isSelected(template) && <Check size={14} className="text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 h-px bg-dark-border dark:bg-night-border" />
                        <span className="text-xs text-dark-lighter dark:text-night-text-muted font-medium">or add more</span>
                        <div className="flex-1 h-px bg-dark-border dark:bg-night-border" />
                    </div>

                    {/* Selection Counter */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-night-surface border border-dark-border dark:border-night-border">
                        <span className="text-sm text-dark-lighter dark:text-night-text-muted font-medium">Selected</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= selectedTemplates.length
                                        ? 'bg-primary scale-110'
                                        : 'bg-dark-border dark:bg-night-border'
                                        }`}
                                />
                            ))}
                            <span className="text-sm text-dark dark:text-night-text font-bold ml-2">
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
                                <div key={cat.value} className="rounded-xl bg-white dark:bg-night-surface border border-dark-border dark:border-night-border overflow-hidden">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => setExpandedCategory(isExpanded ? null : cat.value)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-sm font-bold text-dark dark:text-night-text">{cat.label}</span>
                                            {selectedInCat > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {selectedInCat}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight
                                            size={16}
                                            className={`text-dark-lighter dark:text-night-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
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
                                                {templates.map(template => {
                                                    const typeLocked = !isHabitTypeAvailable(stats, template.type);
                                                    const maxLocked = !isSelected(template) && selectedTemplates.length >= 5;
                                                    const disabled = typeLocked || maxLocked;
                                                    return (
                                                    <button
                                                        key={template.name}
                                                        onClick={() => toggleTemplate(template)}
                                                        disabled={disabled}
                                                        className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all duration-200 ${isSelected(template)
                                                            ? 'bg-primary/5 border border-primary/30'
                                                            : 'bg-surface dark:bg-night-bg border border-dark-border dark:border-night-border hover:border-primary/30 dark:hover:border-primary/30'
                                                            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{template.icon}</span>
                                                            <div>
                                                                <span className="text-sm font-medium text-dark dark:text-night-text block">{template.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}</span>
                                                                {typeLocked ? (
                                                                    <span className="text-[10px] font-bold text-primary">
                                                                        Unlocks Lv.{getMinLevelForHabitType(template.type)}
                                                                    </span>
                                                                ) : template.goalValue ? (
                                                                    <span className="text-xs text-dark-lighter dark:text-night-text-muted">
                                                                        {template.goalValue} {template.unit}/day
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected(template)
                                                            ? 'bg-primary'
                                                            : 'border border-dark-border dark:border-night-border'
                                                            }`}>
                                                            {isSelected(template) && <Check size={14} className="text-white" />}
                                                        </div>
                                                    </button>
                                                );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Continue */}
                    <div className="sticky bottom-4 pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedTemplates.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${selectedTemplates.length > 0
                                ? 'bg-primary hover:bg-primary-dark text-white'
                                : 'bg-dark-border dark:bg-night-border text-dark-lighter dark:text-night-text-muted cursor-not-allowed'
                                }`}
                        >
                            Continue
                            <ChevronRight size={20} />
                        </button>
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
                                className="flex items-start gap-4 px-5 py-4 rounded-xl bg-surface dark:bg-night-surface border border-dark-border dark:border-night-border text-left"
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
                        onClick={() => setStep(3)}
                        className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
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
                    <h2 className="text-2xl font-black text-dark dark:text-night-text">
                        You're all set{name ? `, ${name}` : ''}! 🔥
                    </h2>
                    <p className="text-dark-lighter dark:text-night-text-muted text-sm">
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
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-night-surface border border-dark-border dark:border-night-border"
                        >
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-sm font-medium text-dark dark:text-night-text flex-1 text-left">
                                {t.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}
                            </span>
                            <span className="text-xs text-dark-lighter dark:text-night-text-muted capitalize bg-surface-dark dark:bg-night-bg px-2 py-0.5 rounded-full">
                                {t.schedule.type}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Motivational Note */}
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 text-left">
                    <p className="text-sm text-dark-light dark:text-night-text leading-relaxed">
                        <span className="text-primary font-bold">Remember:</span> Start small, stay consistent. Your habits compound over time — what feels like nothing today becomes everything tomorrow.
                    </p>
                </div>

                {/* Launch Button */}
                <button
                    onClick={handleFinish}
                    className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Sparkles size={20} />
                    Launch My Journey
                </button>

                {/* Back */}
                <button
                    onClick={() => setStep(2)}
                    className="text-dark-lighter dark:text-night-text-muted text-sm hover:text-dark dark:hover:text-night-text transition-colors font-medium"
                >
                    ← Go back and change habits
                </button>
            </motion.div>
        </div>
    );
}
