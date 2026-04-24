import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, X, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { sendFriendRequest } from '../../lib/communityApi';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FriendRequestModalProps {
    onClose: () => void;
    onSent?: () => void;
}

// ─── State machine ────────────────────────────────────────────────────────────

type ModalState = 'idle' | 'loading' | 'success' | 'error';

// ─── Main component ───────────────────────────────────────────────────────────

export function FriendRequestModal({ onClose, onSent }: FriendRequestModalProps) {
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<ModalState>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
        return () => {
            if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
        };
    }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            await sendFriendRequest(trimmed);
            setStatus('success');
            autoCloseRef.current = setTimeout(() => {
                onSent?.();
                onClose();
            }, 2000);
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try again.');
        }
    };

    const handleRetry = () => {
        setStatus('idle');
        setErrorMsg('');
        setValue('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={status !== 'loading' ? onClose : undefined}
                className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-sm bg-white dark:bg-night-surface rounded-3xl border border-[#D4C8E8] dark:border-night-border shadow-2xl overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="friend-modal-title"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light transition-colors">
                                <Users size={20} />
                            </div>
                            <div>
                                <h2
                                    id="friend-modal-title"
                                    className="text-lg font-black text-dark dark:text-night-text tracking-wide transition-colors"
                                >
                                    Add Friend
                                </h2>
                                <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                                    Send a friend request
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={status === 'loading'}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-dark-lighter dark:text-night-text-muted hover:bg-gray-100 dark:hover:bg-night-border disabled:opacity-40 transition-colors"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="px-6 pb-6">
                        {/* Success state */}
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-3 py-6 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                                >
                                    <CheckCircle size={48} className="text-green-500" />
                                </motion.div>
                                <p className="text-sm font-bold text-dark dark:text-night-text transition-colors">
                                    Request sent!
                                </p>
                                <p className="text-xs text-dark-lighter dark:text-night-text-muted transition-colors">
                                    They'll be notified. This window closes automatically.
                                </p>
                                <div className="w-full h-1 bg-gray-100 dark:bg-night-border rounded-full overflow-hidden mt-1">
                                    <motion.div
                                        className="h-full bg-green-500 rounded-full"
                                        initial={{ width: '100%' }}
                                        animate={{ width: '0%' }}
                                        transition={{ duration: 2, ease: 'linear' }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Idle / loading / error states */}
                        {status !== 'success' && (
                            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                                <div>
                                    <p className="text-sm text-dark-lighter dark:text-night-text-muted mb-3 transition-colors">
                                        Enter their username or email to send a friend request.
                                    </p>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={value}
                                        onChange={e => setValue(e.target.value)}
                                        placeholder="username or email..."
                                        disabled={status === 'loading'}
                                        className="w-full px-4 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border bg-surface dark:bg-night-bg text-dark dark:text-night-text placeholder:text-dark-lighter/50 dark:placeholder:text-night-text-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/40 transition-colors disabled:opacity-60"
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                </div>

                                {/* Error message */}
                                {status === 'error' && errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                                    >
                                        <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                                    </motion.div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={status === 'error' ? handleRetry : onClose}
                                        className="flex-1 py-3 rounded-2xl border border-[#D4C8E8] dark:border-night-border text-sm font-bold text-dark-lighter dark:text-night-text-muted hover:bg-gray-50 dark:hover:bg-night-border/30 transition-colors"
                                    >
                                        {status === 'error' ? 'Try again' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={status === 'loading' || value.trim() === ''}
                                        className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send size={14} />
                                                Send Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}

export default FriendRequestModal;
