import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import placeholderImg from '../../assets/placeholder.png';
import mobileBg01Img from '../../assets/Mobile bg01.png';
import webBg01Img from '../../assets/Web bg01.png';
import { PLACEHOLDER_MS, AUTH_REVEAL_DELAY_MS } from '../../constants/entryIntro';
import AuthStoryBackdropImage from './AuthStoryBackdropImage';

type Phase = 'placeholder' | 'scene';

type EntryIntroSequenceProps = {
    onComplete: () => void;
};

/**
 * Placeholder → Web bg crossfade; calls onComplete after the same delay as the former auth reveal.
 */
export default function EntryIntroSequence({ onComplete }: EntryIntroSequenceProps) {
    const [phase, setPhase] = useState<Phase>('placeholder');

    useEffect(() => {
        const toScene = window.setTimeout(() => setPhase('scene'), PLACEHOLDER_MS);
        const done = window.setTimeout(() => {
            onComplete();
        }, PLACEHOLDER_MS + AUTH_REVEAL_DELAY_MS);
        return () => {
            window.clearTimeout(toScene);
            window.clearTimeout(done);
        };
    }, [onComplete]);

    const showPlaceholder = phase === 'placeholder';

    return null; // Background is now handled globally by AppBackground
}
