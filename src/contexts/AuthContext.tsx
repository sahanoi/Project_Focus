import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '../lib/authTypes';
import { fetchMe, logoutApi, type AuthMeUser } from '../lib/api';
import { useHabitStore, withServerSyncSuppressed } from '../store/habitStore';

function meToUser(me: AuthMeUser): User {
    return {
        id: me.id,
        email: me.email,
        user_metadata: me.user_metadata,
        created_at: me.created_at,
        updated_at: me.updated_at,
        aud: 'authenticated',
        app_metadata: {},
    };
}

function meToSession(me: AuthMeUser): Session {
    const user = meToUser(me);
    return {
        access_token: 'cookie',
        refresh_token: '',
        token_type: 'bearer',
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        user,
    };
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const applyMe = useCallback((me: AuthMeUser | null) => {
        if (!me) {
            setSession(null);
            setUser(null);
            return;
        }
        setUser(meToUser(me));
        setSession(meToSession(me));
    }, []);

    const refreshAuth = useCallback(async () => {
        const { user: me } = await fetchMe();
        applyMe(me);
    }, [applyMe]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { user: me } = await fetchMe();
                if (!cancelled) applyMe(me);
            } catch {
                if (!cancelled) applyMe(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [applyMe]);

    const signOut = async () => {
        await logoutApi();
        withServerSyncSuppressed(() => {
            useHabitStore.getState().clearAllData();
        });
        applyMe(null);
    };

    const value = {
        session,
        user,
        loading,
        signOut,
        refreshAuth,
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
