import React, { useState, useMemo } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { HABIT_CATEGORIES } from '../../types';
import { Target, ChevronRight, ChevronLeft, Check, Sparkles, X, Calendar, BarChart2, Award, Compass, Clock } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface SmartGoalWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

type SmartStep = 'specific' | 'measurable' | 'achievable' | 'relevant' | 'timebound' | 'review';

const STEPS: { key: SmartStep; letter: string; label: string; description: string; icon: React.ReactNode }[] = [
    { key: 'specific', letter: 'S', label: 'Specific', description: 'What exactly do you want to achieve?', icon: <Target size={18} /> },
    { key: 'measurable', letter: 'M', label: 'Measurable', description: 'How will you track progress?', icon: <BarChart2 size={18} /> },
    { key: 'achievable', letter: 'A', label: 'Achievable', description: 'Is this realistic for you right now?', icon: <Award size={18} /> },
    { key: 'relevant', letter: 'R', label: 'Relevant', description: 'Why does this matter to you?', icon: <Compass size={18} /> },
    { key: 'timebound', letter: 'T', label: 'Time-bound', description: 'When will you achieve this by?', icon: <Clock size={18} /> },
    { key: 'review', letter: '✓', label: 'Review', description: 'Your S.M.A.R.T. goal is ready!', icon: <Sparkles size={18} /> },
];

const DEADLINE_PRESETS = [
    { label: '1 Week', getValue: () => format(addWeeks(new Date(), 1), 'yyyy-MM-dd') },
    { label: '2 Weeks', getValue: () => format(addWeeks(new Date(), 2), 'yyyy-MM-dd') },
    { label: '1 Month', getValue: () => format(addMonths(new Date(), 1), 'yyyy-MM-dd') },
    { label: '3 Months', getValue: () => format(addMonths(new Date(), 3), 'yyyy-MM-dd') },
    { label: '6 Months', getValue: () => format(addMonths(new Date(), 6), 'yyyy-MM-dd') },
];

export default function SmartGoalWizard({ isOpen, onClose }: SmartGoalWizardProps) {
    const { habits, addGoal } = useHabitStore();
    const [currentStep, setCurrentStep] = useState(0);

    // Form state
    const [goalName, setGoalName] = useState('');
    const [linkedHabitId, setLinkedHabitId] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [unit, setUnit] = useState('');
    const [whyItMatters, setWhyItMatters] = useState('');
    const [deadline, setDeadline] = useState('');
    const [difficulty, setDifficulty] = useState<'stretch' | 'moderate' | 'easy'>('moderate');

    const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits]);
    const linkedHabit = useMemo(() => activeHabits.find(h => h.id === linkedHabitId), [activeHabits, linkedHabitId]);

    const step = STEPS[currentStep];

    const canProceed = () => {
        switch (step.key) {
            case 'specific': return goalName.trim().length > 3;
            case 'measurable': return targetValue && unit;
            case 'achievable': return difficulty;
            case 'relevant': return true; // Why is optional
            case 'timebound': return deadline;
            case 'review': return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const handleCreate = () => {
        addGoal({
            habitId: linkedHabitId || '',
            name: goalName,
            targetValue: Number(targetValue) || 0,
            unit: unit,
            deadline: deadline || undefined,
        });
        // Reset
        setCurrentStep(0);
        setGoalName('');
        setLinkedHabitId('');
        setTargetValue('');
        setUnit('');
        setWhyItMatters('');
        setDeadline('');
        setDifficulty('moderate');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1a1d24] rounded-2xl border border-gray-700/30 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-700/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                            <Target size={16} className="text-black" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">S.M.A.R.T. Goal</h3>
                            <p className="text-xs text-gray-500">Step {currentStep + 1} of {STEPS.length}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                        <X size={16} className="text-gray-400" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1 px-5 pt-3">
                    {STEPS.map((s, i) => (
                        <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`h-1 w-full rounded-full transition-all duration-500 ${i <= currentStep
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                    : 'bg-gray-700'
                                    }`}
                            />
                            <span className={`text-[10px] font-bold ${i <= currentStep ? 'text-yellow-400' : 'text-gray-600'}`}>
                                {s.letter}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="px-5 py-6 min-h-[280px]">
                    {/* Step Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentStep < STEPS.length - 1
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            {step.icon}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white">{step.label}</h4>
                            <p className="text-xs text-gray-400">{step.description}</p>
                        </div>
                    </div>

                    {/* Step: Specific */}
                    {step.key === 'specific' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1.5">Goal name</label>
                                <input
                                    type="text"
                                    value={goalName}
                                    onChange={e => setGoalName(e.target.value)}
                                    placeholder="e.g. Run 100km this month"
                                    className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-gray-700/50 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1.5">Link to a habit (optional)</label>
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                    {activeHabits.map(h => (
                                        <button
                                            key={h.id}
                                            onClick={() => setLinkedHabitId(h.id === linkedHabitId ? '' : h.id)}
                                            className={`px-3 py-2 rounded-lg text-left text-xs flex items-center gap-2 transition-all ${linkedHabitId === h.id
                                                ? 'bg-yellow-500/10 border border-yellow-500/30 text-white'
                                                : 'bg-[#111318] border border-gray-700/20 text-gray-300 hover:border-gray-600'
                                                }`}
                                        >
                                            <span>{h.icon}</span>
                                            <span className="truncate">{h.name.replace(/\s*[\u{1F300}-\u{1FAD6}]/u, '')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Measurable */}
                    {step.key === 'measurable' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1.5">Target value</label>
                                    <input
                                        type="number"
                                        value={targetValue}
                                        onChange={e => setTargetValue(e.target.value)}
                                        placeholder="100"
                                        className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-gray-700/50 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1.5">Unit</label>
                                    <input
                                        type="text"
                                        value={unit}
                                        onChange={e => setUnit(e.target.value)}
                                        placeholder="km, reps, pages..."
                                        className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-gray-700/50 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {linkedHabit && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400">
                                    <span>💡</span>
                                    <span>
                                        {linkedHabit.unit ? `Your "${linkedHabit.name}" is tracked in ${linkedHabit.unit}` : `Linked to ${linkedHabit.name}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Achievable */}
                    {step.key === 'achievable' && (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-400">How challenging is this goal for you?</p>
                            <div className="space-y-2">
                                {([
                                    { key: 'easy' as const, label: '🟢 Comfortable', desc: 'I can do this with my current routine' },
                                    { key: 'moderate' as const, label: '🟡 Stretch', desc: 'Challenging but realistic with effort' },
                                    { key: 'stretch' as const, label: '🔴 Ambitious', desc: 'Pushing my limits — requires discipline' },
                                ]).map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setDifficulty(opt.key)}
                                        className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all ${difficulty === opt.key
                                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                                            : 'bg-[#111318] border border-gray-700/20 hover:border-gray-600'
                                            }`}
                                    >
                                        <div>
                                            <span className="text-sm font-medium text-white">{opt.label}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                        {difficulty === opt.key && (
                                            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                                                <Check size={12} className="text-black" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: Relevant */}
                    {step.key === 'relevant' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1.5">Why does this goal matter to you? (optional)</label>
                                <textarea
                                    value={whyItMatters}
                                    onChange={e => setWhyItMatters(e.target.value)}
                                    placeholder="This matters because..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-gray-700/50 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all resize-none"
                                    autoFocus
                                />
                            </div>
                            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <span className="text-amber-400 font-semibold">Tip:</span> Goals that connect to your deeper values are 2-3x more likely to be achieved. Think about <em>who you want to become</em>, not just what you want to do.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step: Time-bound */}
                    {step.key === 'timebound' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1.5">Deadline</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                                    className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-gray-700/50 text-white focus:border-yellow-500/50 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {DEADLINE_PRESETS.map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => setDeadline(preset.getValue())}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deadline === preset.getValue()
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-[#111318] text-gray-400 border border-gray-700/20 hover:border-gray-600'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step: Review */}
                    {step.key === 'review' && (
                        <div className="space-y-3">
                            <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 rounded-xl p-4 border border-yellow-500/10 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                        <Target size={14} className="text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{goalName}</p>
                                        {linkedHabit && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Linked to {linkedHabit.icon} {linkedHabit.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[#111318] rounded-lg px-3 py-2">
                                        <span className="text-[10px] text-gray-500 block">Target</span>
                                        <span className="text-sm font-bold text-white">{targetValue} {unit}</span>
                                    </div>
                                    <div className="bg-[#111318] rounded-lg px-3 py-2">
                                        <span className="text-[10px] text-gray-500 block">Deadline</span>
                                        <span className="text-sm font-bold text-white">{deadline ? format(new Date(deadline), 'MMM d, yyyy') : '-'}</span>
                                    </div>
                                    <div className="bg-[#111318] rounded-lg px-3 py-2">
                                        <span className="text-[10px] text-gray-500 block">Difficulty</span>
                                        <span className="text-sm font-bold text-white capitalize">{difficulty}</span>
                                    </div>
                                    {whyItMatters && (
                                        <div className="bg-[#111318] rounded-lg px-3 py-2 col-span-2">
                                            <span className="text-[10px] text-gray-500 block">Why</span>
                                            <p className="text-xs text-gray-300 mt-0.5">{whyItMatters}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="px-5 py-4 border-t border-gray-700/30 flex items-center justify-between">
                    <button
                        onClick={currentStep === 0 ? onClose : handleBack}
                        className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                    >
                        {currentStep === 0 ? 'Cancel' : (
                            <span className="flex items-center gap-1">
                                <ChevronLeft size={14} /> Back
                            </span>
                        )}
                    </button>

                    {step.key === 'review' ? (
                        <button
                            onClick={handleCreate}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm flex items-center gap-2 hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-[0.98]"
                        >
                            <Sparkles size={14} />
                            Create Goal
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1 transition-all active:scale-[0.98] ${canProceed()
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/20'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
