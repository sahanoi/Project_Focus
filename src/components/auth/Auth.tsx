import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Lock, Sparkles, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function Auth() {
    const { isRecovery, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: email.split('@')[0],
                        }
                    }
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            setResetSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            // Clears the recovery hash from the URL
            window.history.replaceState(null, '', window.location.pathname);
            // Sign the user out to force them back to the sign-in screen
            await signOut();
            setMessage('Password updated successfully! Please sign in with your new password.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F6FB] dark:bg-[#0D0B14] p-4 relative overflow-hidden font-inter">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary-light/10 rounded-full blur-[120px]"
                />
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full blur-sm animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-primary-light/30 rounded-full blur-sm animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo area */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center p-0.5 bg-gradient-to-tr from-primary via-primary-light to-primary rounded-[22px] shadow-2xl shadow-primary/30 mb-6 group"
                    >
                        <div className="bg-white dark:bg-neutral-900 w-16 h-16 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-[0.98]">
                            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-primary-light font-black text-3xl">F</span>
                        </div>
                    </motion.div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-none mb-2">
                        Focus FTP
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-[280px] mx-auto leading-relaxed">
                        {isRecovery ? 'Set your new secure password' : isForgotPassword ? 'Don\'t worry, let\'s get you back in' : isSignUp ? 'Begin your 7-day journey to mastery' : 'Your ultimate habit tracker awaits'}
                    </p>
                </div>

                {/* Main Glass Card */}
                <div className="bg-white/70 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-neutral-800/50 rounded-[32px] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger-dark dark:text-danger-light rounded-2xl text-sm font-semibold flex items-center gap-3"
                            >
                                <span className="bg-danger/20 w-6 h-6 flex items-center justify-center rounded-full text-xs">!</span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-success/10 border border-success/20 text-success-dark dark:text-success-light rounded-2xl text-sm font-semibold flex items-center gap-3"
                            >
                                <span className="bg-success/20 w-6 h-6 flex items-center justify-center rounded-full text-xs">✉️</span>
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {resetSent ? (
                        /* Check Your Inbox Screen */
                        <div className="text-center space-y-6 py-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-3xl mb-2">
                                <CheckCircle2 size={40} className="text-success" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">Check Your Inbox</h2>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                                    A magic link has been sent to <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">{email}</span>
                                </p>
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-700/50 text-left">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                    <span className="font-bold text-primary">Pro Tip:</span> If you don't see it, check your spam folder or wait a few minutes.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setResetSent(false);
                                    setIsForgotPassword(false);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="w-full text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light font-bold transition-all text-sm py-2 hover:bg-primary/5 rounded-xl underline-offset-4 hover:underline"
                            >
                                ← Back to Sign In
                            </button>
                        </div>
                    ) : isRecovery ? (
                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02, y: -2 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className="w-full bg-gradient-to-r from-primary via-primary to-primary-light text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <KeyRound size={18} className="group-hover:rotate-12 transition-transform" />
                                        <span>Update Password</span>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={isForgotPassword ? handleResetPassword : handleAuth} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-3 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                                        placeholder="name@energy.com"
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
                                <div>
                                    <div className="flex justify-between items-center mb-3 ml-1">
                                        <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
                                            Password
                                        </label>
                                        {!isSignUp && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsForgotPassword(true);
                                                    setError(null);
                                                    setMessage(null);
                                                }}
                                                className="text-[11px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-wider"
                                            >
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02, y: -2 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className="w-full bg-gradient-to-r from-primary via-primary to-primary-light text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isForgotPassword ? (
                                            <>
                                                <Mail size={18} className="group-hover:-rotate-12 transition-transform" />
                                                <span>Send Recovery Link</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                                <span>{isSignUp ? 'Initialize Journey' : 'Enter Dashboard'}</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </>
                                )}
                            </motion.button>

                            <div className="mt-8 text-center">
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                                    {isForgotPassword ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(false)}
                                            className="text-primary hover:text-primary-light font-bold transition-all underline-offset-4 hover:underline"
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
                                                className="text-primary hover:text-primary-light font-bold transition-all underline-offset-4 hover:underline"
                                            >
                                                {isSignUp ? 'Sign In' : 'Create Account'}
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-center text-neutral-500/50 dark:text-neutral-500/30 text-[11px] font-bold uppercase tracking-[0.2em] mt-8">
                    Level up your habits, one day at a time ✨
                </p>
            </motion.div>
        </div>
    );
}
