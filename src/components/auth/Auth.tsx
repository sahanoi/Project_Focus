import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-primary-light/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo area */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-primary to-primary-light rounded-2xl shadow-lg shadow-primary/20 mb-4"
                    >
                        <span className="text-white font-black text-2xl">F</span>
                    </motion.div>
                    <h1 className="text-3xl font-black text-dark tracking-tight">
                        Focus FTP
                    </h1>
                    <p className="text-dark-lighter mt-1 text-sm">
                        {isSignUp ? 'Create your account to start the journey' : 'Welcome back, Player'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-[#E6DDF2] rounded-2xl p-8 shadow-xl shadow-primary/5">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-3 bg-danger/5 border border-danger/15 text-danger rounded-xl text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-3 bg-success/5 border border-success/15 text-success-dark rounded-xl text-sm font-medium"
                            >
                                ✉️ {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-dark-lighter uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-lighter/60 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-surface border border-[#E6DDF2] rounded-xl py-3 pl-11 pr-4 text-dark placeholder-dark-lighter/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-dark-lighter uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-lighter/60 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-surface border border-[#E6DDF2] rounded-xl py-3 pl-11 pr-4 text-dark placeholder-dark-lighter/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-dark-lighter text-sm">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                    setMessage(null);
                                }}
                                className="text-primary hover:text-primary-dark font-semibold hover:underline transition-colors"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-dark-lighter/50 text-xs mt-6">
                    Level up your habits, one day at a time ✨
                </p>
            </motion.div>
        </div>
    );
}
