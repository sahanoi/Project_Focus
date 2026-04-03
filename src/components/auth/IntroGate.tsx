import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EntryIntroSequence from './EntryIntroSequence';

type IntroGateProps = {
    children: React.ReactNode;
};

/**
 * Runs entry intro on every full load.
 * After intro, if auth is still resolving, keeps story backdrop + spinner.
 */
export default function IntroGate({ children }: IntroGateProps) {
    const { loading } = useAuth();
    const [introDone, setIntroDone] = useState(false);

    const handleIntroComplete = useCallback(() => {
        setIntroDone(true);
    }, []);

    if (!introDone) {
        return <EntryIntroSequence onComplete={handleIntroComplete} />;
    }

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[100dvh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-light" />
            </div>
        );
    }

    return <>{children}</>;
}
