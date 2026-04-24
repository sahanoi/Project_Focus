import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    clearLocalSession,
    ensureSeedLocalUser,
    getLocalSession,
    localSignIn,
    localSignUp,
} from '../localAuth';

describe('localAuth', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubEnv('VITE_LOCAL_AUTH_EMAIL', 'seed@test.com');
        vi.stubEnv('VITE_LOCAL_AUTH_PASSWORD', 'seed-pass');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('seeds user from env and allows sign-in', () => {
        ensureSeedLocalUser();
        expect(getLocalSession()).toBeNull();
        const { error } = localSignIn('seed@test.com', 'seed-pass');
        expect(error).toBeNull();
        expect(getLocalSession()?.user?.email).toBe('seed@test.com');
    });

    it('signUp creates account and session', () => {
        const { error } = localSignUp('new@test.com', 'pw');
        expect(error).toBeNull();
        clearLocalSession();
        expect(getLocalSession()).toBeNull();
        expect(localSignIn('new@test.com', 'pw').error).toBeNull();
    });
});
