import React, { useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HABIT_CATEGORIES, HABIT_TEMPLATES, HabitCategory, HabitTemplate } from '../../types';
import { Sparkles, ChevronRight, Check, Zap, Target } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [selectedTemplates, setSelectedTemplates] = useState<HabitTemplate[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<HabitCategory | null>(null);
    const addHabit = useHabitStore(s => s.addHabit);

    const toggleTemplate = (template: HabitTemplate) => {
        setSelectedTemplates(prev => {
            const exists = prev.find(t => t.name === template.name);
            if (exists) return prev.filter(t => t.name !== template.name);
            if (prev.length >= 5) return prev; // Max 5 starter habits
            return [...prev, template];
        });
    };

    const isSelected = (template: HabitTemplate) =>
        selectedTemplates.some(t => t.name === template.name);

    const handleFinish = () => {
        // Add all selected habits to the store (which syncs to Supabase)
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
            <div className="min-h-screen bg-[#111318] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-8">
                    {/* Logo / Brand */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/20">
                            <Zap size={40} className="text-black" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            Project Focus
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Sharp · Hard · Fun
                        </p>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-3">
                        <label className="text-sm text-gray-400 block text-left">What should we call you?</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your name..."
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1d24] border border-gray-700/50 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 transition-all text-lg"
                            autoFocus
                        />
                    </div>

                    {/* Philosophy */}
                    <div className="bg-[#1a1d24] rounded-xl p-5 border border-gray-700/30 text-left space-y-3">
                        <p className="text-sm text-gray-300">
                            <span className="text-yellow-400 font-semibold">Your life companion.</span> Track habits, build routines, and watch yourself evolve — no forced gamification, just natural growth.
                        </p>
                        <p className="text-xs text-gray-500 italic">
                            "What would this look like if it were fun?" — Ali Abdaal
                        </p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-lg flex items-center justify-center gap-2 hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98]"
                    >
                        Let's begin
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // Step 1: Pick Starter Habits
    if (step === 1) {
        return (
            <div className="min-h-screen bg-[#111318] px-4 py-8">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                            <Sparkles size={14} />
                            Step 1 of 2
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {name ? `${name}, pick` : 'Pick'} your first habits
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Start small — choose 1 to 5 habits. You can always add more later.
                        </p>
                    </div>

                    {/* Selection Counter */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1d24] border border-gray-700/30">
                        <span className="text-sm text-gray-400">Selected</span>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= selectedTemplates.length
                                        ? 'bg-yellow-400 scale-110'
                                        : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                            <span className="text-sm text-white font-bold ml-2">
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
                                <div key={cat.value} className="rounded-xl bg-[#1a1d24] border border-gray-700/30 overflow-hidden">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => setExpandedCategory(isExpanded ? null : cat.value)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-sm font-semibold text-white">{cat.label}</span>
                                            {selectedInCat > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                                                    {selectedInCat}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight
                                            size={16}
                                            className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                        />
                                    </button>

                                    {/* Templates */}
                                    {isExpanded && (
                                        <div className="px-4 pb-3 space-y-2">
                                            {templates.map(template => (
                                                <button
                                                    key={template.name}
                                                    onClick={() => toggleTemplate(template)}
                                                    disabled={!isSelected(template) && selectedTemplates.length >= 5}
                                                    className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between text-left transition-all duration-200 ${isSelected(template)
                                                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                                                        : 'bg-[#111318] border border-gray-700/20 hover:border-gray-600/40'
                                                        } ${!isSelected(template) && selectedTemplates.length >= 5
                                                            ? 'opacity-40 cursor-not-allowed'
                                                            : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{template.icon}</span>
                                                        <div>
                                                            <span className="text-sm font-medium text-white block">{template.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}</span>
                                                            {template.goalValue && (
                                                                <span className="text-xs text-gray-500">
                                                                    {template.goalValue} {template.unit}/day
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected(template)
                                                        ? 'bg-yellow-400'
                                                        : 'border border-gray-600'
                                                        }`}>
                                                        {isSelected(template) && <Check size={14} className="text-black" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Continue */}
                    <div className="sticky bottom-4 pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedTemplates.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${selectedTemplates.length > 0
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-yellow-500/20'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                                }`}
                        >
                            Continue
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Confirmation / Launch
    return (
        <div className="min-h-screen bg-[#111318] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                        <Target size={14} />
                        Step 2 of 2
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        You're all set{name ? `, ${name}` : ''}! 🔥
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Here's what you're committing to:
                    </p>
                </div>

                {/* Selected Habits Summary */}
                <div className="space-y-2">
                    {selectedTemplates.map((t, i) => (
                        <div
                            key={t.name}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a1d24] border border-gray-700/30"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-sm font-medium text-white flex-1 text-left">
                                {t.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                                {t.schedule.type}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Motivational Note */}
                <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 rounded-xl p-5 border border-yellow-500/10 text-left">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        <span className="text-yellow-400 font-semibold">Remember:</span> Start small, stay consistent. Your habits compound over time — what feels like nothing today becomes everything tomorrow.
                    </p>
                </div>

                {/* Launch Button */}
                <button
                    onClick={handleFinish}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-lg flex items-center justify-center gap-2 hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98]"
                >
                    <Sparkles size={20} />
                    Launch My Journey
                </button>

                {/* Back */}
                <button
                    onClick={() => setStep(1)}
                    className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
                >
                    ← Go back and change habits
                </button>
            </div>
        </div>
    );
}
