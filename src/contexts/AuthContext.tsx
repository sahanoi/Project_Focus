import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isRecovery: boolean;
    signOut: () => Promise<void>;
    clearRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecovery, setIsRecovery] = useState(() => {
        // More aggressive check for recovery
        const hash = window.location.hash;
        const search = window.location.search;
        return hash.includes('type=recovery') || search.includes('type=recovery') || sessionStorage.getItem('isRecovery') === 'true';
    });

    useEffect(() => {
        const isRecoveryUrl = window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery');
        if (isRecoveryUrl) {
            setIsRecovery(true);
            sessionStorage.setItem('isRecovery', 'true');
        }

        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Listen for changes (login, logout, recovery)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true);
                sessionStorage.setItem('isRecovery', 'true');
            } else if (event === 'SIGNED_IN') {
                // If it's a SIGNED_IN event, we MUST NOT clear the recovery state if we are currently recovering.
                // Supabase emits SIGNED_IN immediately after processing a recovery link.
                setIsRecovery((prev) => {
                    if (prev || isRecoveryUrl || sessionStorage.getItem('isRecovery') === 'true') {
                        return true;
                    }
                    return false;
                });
            } else if (event === 'SIGNED_OUT') {
                setIsRecovery(false);
                sessionStorage.removeItem('isRecovery');
            }
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Provide a method to explicitly clear the recovery state
    const clearRecovery = () => {
        setIsRecovery(false);
        sessionStorage.removeItem('isRecovery');
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        clearRecovery();
    };

    const value = {
        session,
        user,
        loading,
        isRecovery,
        signOut,
        clearRecovery,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
