import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '../lib/authTypes';
import {
    clearLocalSession,
    ensureSeedLocalUser,
    getLocalSession,
    LOCAL_AUTH_CHANGED_EVENT,
} from '../lib/localAuth';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ensureSeedLocalUser();

        const applyLocal = () => {
            const s = getLocalSession();
            setSession(s);
            setUser(s?.user ?? null);
            setLoading(false);
        };

        applyLocal();
        const onLocalAuth = () => applyLocal();
        window.addEventListener(LOCAL_AUTH_CHANGED_EVENT, onLocalAuth);
        return () => window.removeEventListener(LOCAL_AUTH_CHANGED_EVENT, onLocalAuth);
    }, []);

    const signOut = async () => {
        clearLocalSession();
    };

    const value = {
        session,
        user,
        loading,
        signOut,
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
