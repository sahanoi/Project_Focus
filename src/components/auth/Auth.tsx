import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loginApi, registerApi } from '../../lib/api';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from '../ui/AppLogo';

export type AuthVariant = 'standalone' | 'atmosphere';

type AuthProps = {
    variant?: AuthVariant;
};

export default function Auth({ variant = 'standalone' }: AuthProps) {
    const { refreshAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                await registerApi(email, password);
                setMessage('Account created — welcome!');
            } else {
                await loginApi(email, password);
            }
            await refreshAuth();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        setError(
            'Password reset is not available yet. If you use a local dev database, an admin can reset your account in PostgreSQL; otherwise contact support for your deployment.'
        );
        setLoading(false);
    };

    const rootClass =
        variant === 'standalone'
            ? 'bg-warm-page dark:bg-warm-night-page'
            : 'bg-transparent';

    const rootLayout =
        variant === 'atmosphere'
            ? 'min-h-[100dvh] justify-center py-10 pb-12 sm:py-14 px-4'
            : 'min-h-screen justify-center p-4';

    const formLabelClass =
        'block font-label text-[10px] font-bold uppercase tracking-[0.15em] text-hearth-on-surface-variant dark:text-warm-night-text ml-1';
    const formLabelClassMb = `${formLabelClass} mb-2`;
    const inputIconClass =
        'absolute right-4 top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-hearth-outline-variant/50 group-focus-within:text-primary/60 dark:text-warm-night-muted dark:group-focus-within:text-primary-light transition-colors pointer-events-none';
    const inputFieldClass =
        'auth-form-input w-full bg-white dark:bg-warm-night-field border-0 rounded-xl px-5 py-4 pr-12 text-base font-body font-medium placeholder:text-hearth-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/35 transition-all shadow-[inset_0_0_0_1px_rgba(219,194,176,0.35)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]';
    const formFooterClass =
        'text-sm font-body text-hearth-on-surface-variant dark:text-warm-night-text';

    return (
        <div
            className={`flex flex-col items-center ${rootLayout} relative overflow-hidden font-body z-10 ${rootClass}`}
        >

            {/* Global Floating Toasts for Auth */}
            <div className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="w-full max-w-sm p-4 bg-hearth-surface-highest dark:bg-warm-night-card border-0 text-hearth-tertiary dark:text-red-200 rounded-xl text-sm font-semibold flex items-center gap-3 pointer-events-auto shadow-[0_8px_24px_rgba(37,25,13,0.08)]"
                        >
                            <span className="bg-danger/10 dark:bg-danger/20 shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm">!</span>
                            <span className="flex-1">{error}</span>
                            <button type="button" onClick={() => setError(null)} className="text-danger/50 hover:text-danger transition-colors p-1">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="w-full max-w-sm p-4 bg-hearth-secondary-container/90 dark:bg-warm-night-card border-0 text-hearth-secondary dark:text-emerald-200 rounded-xl text-sm font-semibold flex items-center gap-3 pointer-events-auto shadow-[0_8px_24px_rgba(37,25,13,0.08)]"
                        >
                            <span className="bg-success/10 dark:bg-success/20 shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm">✨</span>
                            <span className="flex-1">{message}</span>
                            <button type="button" onClick={() => setMessage(null)} className="text-success/50 hover:text-success transition-colors p-1">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Traveler’s log — parchment card (stitch / Adventurer’s Hearth) */}
                <div className="parchment-texture rounded-2xl border border-hearth-outline-variant/10 dark:border-warm-night-border/40 p-8 md:p-12 shadow-[0_20px_50px_rgba(37,25,13,0.28)] dark:bg-warm-night-card/90 dark:backdrop-blur-md">
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.45, delay: 0.1 }}
                            className="inline-flex items-center justify-center mb-5"
                        >
                            <AppLogo size={56} />
                        </motion.div>
                        <h1 className="font-headline text-3xl md:text-4xl font-medium text-primary dark:text-primary-light tracking-tight leading-tight">
                            {isForgotPassword
                                ? 'When the path is lost'
                                : isSignUp
                                  ? 'Start your journey'
                                  : 'Begin your journey'}
                        </h1>
                        <p className="font-body text-hearth-on-surface-variant dark:text-warm-night-text mt-3 text-sm italic max-w-xs mx-auto leading-relaxed">
                            {isForgotPassword
                                ? 'We’ll point you toward help when the road returns.'
                                : isSignUp
                                  ? 'Every quest log opens with a single line of intent.'
                                  : '“Every great chronicler begins with a single drop of ink.”'}
                        </p>
                        <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-hearth-on-surface-variant/70 dark:text-warm-night-muted mt-4">
                            Focus FTP — habits, goals, and the map of your days
                        </p>
                    </div>

                    <form onSubmit={isForgotPassword ? handleForgotInfo : handleAuth} className="space-y-8">
                        <div className="space-y-2">
                            <label className={formLabelClassMb}>Email address</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    required={!isForgotPassword}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputFieldClass}
                                    placeholder="traveler@hearth.com"
                                />
                                <Mail className={inputIconClass} strokeWidth={2} aria-hidden />
                            </div>
                            <p className="text-[11px] text-hearth-on-surface-variant/70 dark:text-warm-night-muted italic ml-1">
                                The owl needs a destination for your scrolls.
                            </p>
                        </div>

                        {!isForgotPassword && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <label className={formLabelClass}>Secret cipher</label>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputFieldClass}
                                        placeholder="••••••••"
                                        minLength={isSignUp ? 8 : 1}
                                    />
                                    <Lock className={inputIconClass} strokeWidth={2} aria-hidden />
                                </div>
                                <p className="text-[11px] text-hearth-on-surface-variant/70 dark:text-warm-night-muted italic ml-1">
                                    Keep it guarded like a dragon&apos;s hoard.
                                </p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full min-h-[48px] bg-primary hover:bg-primary-dark text-white font-body font-bold py-4 rounded-xl sigil-shadow active:scale-[0.98] transition-transform flex items-center justify-center gap-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>
                                            {isForgotPassword
                                                ? 'Show help'
                                                : isSignUp
                                                  ? 'Open your log'
                                                  : 'Enter the inn'}
                                        </span>
                                        {!isForgotPassword && <LogIn className="w-5 h-5" strokeWidth={2.25} aria-hidden />}
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-hearth-outline-variant/20 dark:border-warm-night-border/60 space-y-4 text-center">
                            <p className={formFooterClass}>
                                {isForgotPassword ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(false)}
                                        className="font-semibold text-primary hover:text-primary-dark underline-offset-4 hover:underline transition-colors"
                                    >
                                        ← Back to sign in
                                    </button>
                                ) : (
                                    <>
                                        {isSignUp ? 'Already mapping your days? ' : 'New to the journey? '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsSignUp(!isSignUp);
                                                setError(null);
                                                setMessage(null);
                                            }}
                                            className="text-primary font-bold ml-1 hover:underline underline-offset-4 transition-all"
                                        >
                                            {isSignUp ? 'Sign in' : 'Create account'}
                                        </button>
                                    </>
                                )}
                            </p>
                            {!isForgotPassword && !isSignUp && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setError(null);
                                        setMessage(null);
                                    }}
                                    className="inline-block pt-1 font-label text-[10px] font-bold uppercase tracking-widest text-hearth-outline-variant hover:text-primary dark:text-warm-night-muted dark:hover:text-primary-light transition-colors"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer note */}
                <p
                    className={
                        variant === 'atmosphere'
                            ? 'text-center text-white text-[11px] font-bold uppercase tracking-[0.2em] mt-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                            : 'text-center text-warm-muted/50 dark:text-warm-night-muted/90 text-[11px] font-bold uppercase tracking-[0.2em] mt-8'
                    }
                >
                    One log at a time — your journey, your map
                </p>
            </motion.div>
        </div>
    );
}
