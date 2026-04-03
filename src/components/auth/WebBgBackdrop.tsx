import React from 'react';
import { motion } from 'framer-motion';
import mobileBg01Img from '../../assets/Mobile bg01.png';
import webBg01Img from '../../assets/Web bg01.png';
import placeholderImg from '../../assets/placeholder.png';
import AuthStoryBackdropImage from './AuthStoryBackdropImage';
import { PLACEHOLDER_MS } from '../../constants/entryIntro';

type WebBgBackdropProps = {
    /** Dark gradient for readability over auth form */
    showReadabilityScrim?: boolean;
};

// Simple singleton to track if intro has played in this session
let hasPlayedIntro = false;

/**
 * Full-viewport story art behind atmosphere Auth or post-intro loading.
 */
export default function WebBgBackdrop({ showReadabilityScrim = true }: WebBgBackdropProps) {
    const [phase, setPhase] = React.useState<'placeholder' | 'scene'>(hasPlayedIntro ? 'scene' : 'placeholder');

    React.useEffect(() => {
        if (hasPlayedIntro) return;
        const timer = window.setTimeout(() => {
            setPhase('scene');
            hasPlayedIntro = true;
        }, PLACEHOLDER_MS);
        return () => window.clearTimeout(timer);
    }, []);

    const isPlaceholder = phase === 'placeholder';

    return (
        <div className="auth-story-backdrop-fill fixed inset-0 z-0 overflow-hidden" aria-hidden>
            {/* Placeholder Background */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={false}
                animate={{ opacity: isPlaceholder ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <AuthStoryBackdropImage src={placeholderImg} alt="" />
            </motion.div>

            {/* Real Background */}
            <motion.div
                className="absolute inset-0 z-10"
                initial={false}
                animate={{ opacity: isPlaceholder ? 0 : 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <AuthStoryBackdropImage
                    responsive={{ mobile: mobileBg01Img, desktop: webBg01Img }}
                    alt=""
                />
            </motion.div>

            {showReadabilityScrim && (
                <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#1a0f0c]/60 via-[#0c0807]/25 to-transparent" />
            )}
        </div>
    );
}
