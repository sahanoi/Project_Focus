import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Droplets, Sparkles } from 'lucide-react';
import mobileBg01Img from '../../assets/Mobile bg01.png';
import webBg01Img from '../../assets/Web bg01.png';
import placeholderImg from '../../assets/placeholder.png';
import AuthStoryBackdropImage from '../auth/AuthStoryBackdropImage';
import {
    setRitualDone,
    setSkippedToAuth,
} from '../../constants/firstSessionStorage';

export type FirstSessionFlowProps = {
    onRitualComplete: () => void;
    onSkipToAuth?: () => void;
};

type Step = 'begin' | 'tavern' | 'water';

const primaryCtaClass =
    'w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed';

function SkipToAuthLink({
    onSkipToAuth,
    tone = 'card',
}: {
    onSkipToAuth: () => void;
    tone?: 'dark' | 'card';
}) {
    const toneClass =
        tone === 'dark'
            ? 'text-white/60 hover:text-primary-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]'
            : 'text-warm-muted/60 dark:text-night-text-muted/60 hover:text-primary dark:hover:text-primary-light';
    return (
        <button
            type="button"
            onClick={() => {
                setSkippedToAuth();
                onSkipToAuth();
            }}
            className={`mt-6 text-center text-[11px] font-bold uppercase tracking-[0.18em] transition-colors underline-offset-4 hover:underline ${toneClass}`}
        >
            I already have an account
        </button>
    );
}

function FirstSessionFlow({ onRitualComplete, onSkipToAuth }: FirstSessionFlowProps) {
    const [step, setStep] = useState<Step>('begin');

    const finishRitual = () => {
        setRitualDone();
        onRitualComplete();
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-warm-page dark:bg-warm-night-page font-inter">
            <AnimatePresence mode="wait">
                {step === 'begin' && (
                    <motion.div
                        key="begin"
                        role="dialog"
                        aria-labelledby="first-session-begin-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="auth-story-backdrop-fill absolute inset-0 flex flex-col items-center justify-end sm:justify-center px-6 pb-14 pt-10 sm:py-12"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a0f0c]/75 via-[#0c0807]/35 to-[#0c0807]/50 dark:from-night-bg/90 dark:via-night-bg/55 dark:to-night-bg/70" />
                        <div className="relative z-10 w-full max-w-md text-center">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 mb-4">
                                First light
                            </p>
                            <h1
                                id="first-session-begin-title"
                                className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
                            >
                                You showed up. The day was already waiting.
                            </h1>
                            <p className="text-sm sm:text-base font-medium text-white/90 leading-relaxed mb-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">
                                One small morning, one habit to tend—no buffet of choices. Trust the rhythm; your first quest line begins here.
                            </p>
                            <button
                                type="button"
                                className={primaryCtaClass}
                                onClick={() => setStep('tavern')}
                            >
                                <Sparkles size={18} aria-hidden />
                                <span>Begin</span>
                                <ArrowRight size={18} aria-hidden />
                            </button>
                            {onSkipToAuth && (
                                <SkipToAuthLink onSkipToAuth={onSkipToAuth} tone="dark" />
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 'tavern' && (
                    <motion.div
                        key="tavern"
                        role="dialog"
                        aria-labelledby="first-session-tavern-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        <div className="auth-story-backdrop-fill absolute inset-0 overflow-hidden" aria-hidden>
                            <AuthStoryBackdropImage
                                responsive={{ mobile: mobileBg01Img, desktop: webBg01Img }}
                                alt=""
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a0f0c]/70 via-[#0c0807]/20 to-transparent dark:from-night-bg/85 dark:via-night-bg/40" />
                        </div>
                        <div className="relative z-10 mt-auto w-full px-5 pb-12 pt-8 sm:pb-14">
                            <div className="mx-auto max-w-md rounded-[28px] border border-warm-border/50 dark:border-night-border/80 bg-warm-card/90 dark:bg-night-surface/90 backdrop-blur-md px-6 py-7 shadow-lg shadow-stone-900/10 dark:shadow-none">
                                <h2
                                    id="first-session-tavern-title"
                                    className="text-xl font-black text-warm-text dark:text-night-text tracking-tight mb-3"
                                >
                                    Tavern morning
                                </h2>
                                <p className="text-sm font-medium text-warm-muted dark:text-night-text-muted leading-relaxed mb-6">
                                    You wake in a quiet room. Here, a{' '}
                                    <span className="text-dark dark:text-night-text font-bold">routine</span> is a time
                                    of day and a mood—not a folder. You level by keeping small promises; check-ins are
                                    how the world knows you were here.
                                </p>
                                <button
                                    type="button"
                                    className={primaryCtaClass}
                                    onClick={() => setStep('water')}
                                >
                                    <span>Continue</span>
                                    <ArrowRight size={18} aria-hidden />
                                </button>
                                {onSkipToAuth && <SkipToAuthLink onSkipToAuth={onSkipToAuth} />}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'water' && (
                    <motion.div
                        key="water"
                        role="dialog"
                        aria-labelledby="first-session-water-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        <div className="auth-story-backdrop-fill absolute inset-0 overflow-hidden" aria-hidden>
                            <AuthStoryBackdropImage src={placeholderImg} alt="" />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0807]/25 to-[#1a0f0c]/80 dark:via-night-bg/30 dark:to-night-bg/90" />
                        </div>
                        <div className="relative z-10 flex flex-1 flex-col items-center justify-end sm:justify-center px-5 pb-14 pt-10">
                            <div className="w-full max-w-md rounded-[28px] border border-warm-border/50 dark:border-night-border/80 bg-warm-card/92 dark:bg-night-surface/92 backdrop-blur-md px-6 py-8 shadow-lg shadow-stone-900/10 dark:shadow-none text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 text-primary dark:text-primary-light mb-4 mx-auto">
                                    <Droplets className="w-7 h-7" aria-hidden />
                                </div>
                                <h2
                                    id="first-session-water-title"
                                    className="text-2xl font-black text-warm-text dark:text-night-text tracking-tight mb-3"
                                >
                                    Drink water
                                </h2>
                                <p className="text-sm font-medium text-warm-muted dark:text-night-text-muted leading-relaxed mb-8">
                                    A glass waits in the stillness—hydration as your gentle anchor. Tap below when
                                    you&apos;ve had a sip; closure matters more than the log.
                                </p>
                                <button type="button" className={primaryCtaClass} onClick={finishRitual}>
                                    <span>I drank — complete the ritual</span>
                                </button>
                                {onSkipToAuth && <SkipToAuthLink onSkipToAuth={onSkipToAuth} />}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export { FirstSessionFlow };
export default FirstSessionFlow;
