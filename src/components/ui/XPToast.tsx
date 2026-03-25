import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPToastProps {
    visible: boolean;
    xp: number;
}

/**
 * XPToast — Brief "+XP" pill that pops up from the bottom on habit completion.
 * Slides up, holds 1.5s, fades out. Positioned fixed bottom-center.
 */
export default function XPToast({ visible, xp }: XPToastProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] pointer-events-none"
                >
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-warning-dark text-white font-black text-sm border border-amber-300/30">
                        <Zap size={16} className="fill-white" />
                        <span>+{xp} XP</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
