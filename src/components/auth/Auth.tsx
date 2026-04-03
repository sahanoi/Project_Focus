import React, { useState } from 'react';
import { localSignIn, localSignUp } from '../../lib/localAuth';
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from '../ui/AppLogo';

export type AuthVariant = 'standalone' | 'atmosphere';

type AuthProps = {
    variant?: AuthVariant;
};

export default function Auth({ variant = 'standalone' }: AuthProps) {
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
                const { error: err } = localSignUp(email, password);
                if (err) throw err;
                setMessage('Account created — you are signed in locally.');
            } else {
                const { error: err } = localSignIn(email, password);
                if (err) throw err;
            }
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
            'Accounts and passwords are stored only on this device. There is no email reset. If you forgot your password, clear site data for this app and create the account again (your habit data in this browser profile is separate).'
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

    const isAtmosphere = variant === 'atmosphere';
    /** Labels / links: full opacity. Inputs use solid fill — transparency stays on the glass card only. */
    const formLabelClass = isAtmosphere
        ? 'block text-[11px] font-bold text-black uppercase tracking-[0.2em] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]'
        : 'block text-[11px] font-bold text-black uppercase tracking-[0.2em]';
    const formLabelClassMb = `${formLabelClass} mb-3 ml-1`;
    const forgotLinkClass = isAtmosphere
        ? 'text-[11px] font-bold text-black uppercase tracking-wider underline transition-colors hover:brightness-110'
        : 'text-[11px] font-bold text-black hover:underline transition-colors uppercase tracking-wider';
    const inputIconClass = isAtmosphere
        ? 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-black transition-colors'
        : 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-black transition-colors';
    const inputFieldClass =
        'auth-form-input w-full bg-white border-2 border-black rounded-2xl py-4 pl-12 pr-4 text-black placeholder:text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-black/10 transition-all text-sm font-bold shadow-none';
    const formFooterClass = isAtmosphere
        ? 'text-sm font-bold text-black'
        : 'text-sm font-bold text-black';

    return (
        <div
            className={`flex flex-col items-center ${rootLayout} relative overflow-hidden font-inter z-10 ${rootClass}`}
        >

            {/* Global Floating Toasts for Auth */}
            <div className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none">
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="w-full max-w-sm p-4 bg-warm-card dark:bg-warm-night-card border border-danger/35 dark:border-danger/40 text-danger-dark dark:text-red-200 rounded-2xl text-sm font-semibold flex items-center gap-3 pointer-events-auto shadow-sm shadow-stone-900/5 dark:shadow-none"
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
                            className="w-full max-w-sm p-4 bg-warm-card dark:bg-warm-night-card border border-success/40 dark:border-emerald-400/35 text-success-dark dark:text-emerald-200 rounded-2xl text-sm font-semibold flex items-center gap-3 pointer-events-auto shadow-sm shadow-stone-900/5 dark:shadow-none"
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
                {/* Logo area */}
                <div
                    className={
                        variant === 'atmosphere'
                            ? 'text-center mb-10 [&_h1]:text-white [&_p]:text-white [&_h1]:drop-shadow-md [&_p]:drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)]'
                            : 'text-center mb-10'
                    }
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center mb-6 group"
                    >
                        <AppLogo size={64} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-warm-text dark:text-warm-night-text tracking-tight leading-none mb-2">
                        Focus FTP
                    </h1>
                    <p className="text-warm-muted dark:text-warm-night-muted font-medium max-w-[280px] mx-auto leading-relaxed">
                        {isForgotPassword ? 'Local account help' : isSignUp ? 'Begin your 7-day journey to mastery' : 'Your ultimate habit tracker awaits'}
                    </p>
                </div>

                {/* Warm cream card; purple stays on CTAs + focus */}
                <div className="rounded-[32px] border border-warm-border/70 dark:border-warm-night-border/80 bg-warm-card/25 dark:bg-warm-night-card/25 backdrop-blur-md p-8 md:p-10 shadow-sm shadow-amber-950/5 dark:shadow-none">

                    <form onSubmit={isForgotPassword ? handleForgotInfo : handleAuth} className="space-y-6">
                        <div>
                            <label className={formLabelClassMb}>Email Address</label>
                            <div className="relative group">
                                <Mail className={inputIconClass} />
                                <input
                                    type="email"
                                    required={!isForgotPassword}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputFieldClass}
                                    placeholder="name@energy.com"
                                />
                            </div>
                        </div>

                        {!isForgotPassword && (
                            <div>
                                <div className="flex justify-between items-center mb-3 ml-1">
                                    <label className={formLabelClass}>Password</label>
                                    {!isSignUp && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsForgotPassword(true);
                                                setError(null);
                                                setMessage(null);
                                            }}
                                            className={forgotLinkClass}
                                        >
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className={inputIconClass} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputFieldClass}
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isForgotPassword ? (
                                        <>
                                            <Mail size={18} />
                                            <span>Show help</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            <span>{isSignUp ? 'Initialize Journey' : 'Enter Dashboard'}</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </>
                            )}
                        </button>

                        <div className="mt-8 text-center">
                            <p className={formFooterClass}>
                                {isForgotPassword ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(false)}
                                        className={`font-bold transition-all underline-offset-4 hover:underline ${
                                            isAtmosphere
                                                ? 'text-primary-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] hover:brightness-110'
                                                : 'text-primary hover:text-primary-light'
                                        }`}
                                    >
                                        ← Back to Sign In
                                    </button>
                                ) : (
                                    <>
                                        {isSignUp ? 'Already a player?' : 'New to Focus FTP?'}{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsSignUp(!isSignUp);
                                                setError(null);
                                                setMessage(null);
                                            }}
                                            className={`font-bold transition-all underline-offset-4 hover:underline ${
                                                isAtmosphere
                                                    ? 'text-primary-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] hover:brightness-110'
                                                    : 'text-primary hover:text-primary-light'
                                            }`}
                                        >
                                            {isSignUp ? 'Sign In' : 'Create Account'}
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer note */}
                <p
                    className={
                        variant === 'atmosphere'
                            ? 'text-center text-white text-[11px] font-bold uppercase tracking-[0.2em] mt-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
                            : 'text-center text-warm-muted/50 dark:text-warm-night-muted/45 text-[11px] font-bold uppercase tracking-[0.2em] mt-8'
                    }
                >
                    Level up your habits, one day at a time ✨
                </p>
            </motion.div>
        </div>
    );
}
