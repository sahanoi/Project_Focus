import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    FIRST_SESSION_RITUAL_DONE_KEY,
    FIRST_SESSION_SKIP_KEY,
    hasSkippedToAuth,
    isRitualDone,
    setRitualDone,
    setSkippedToAuth,
} from '../firstSessionStorage';

describe('firstSessionStorage', () => {
    beforeEach(() => {
        localStorage.removeItem(FIRST_SESSION_RITUAL_DONE_KEY);
        localStorage.removeItem(FIRST_SESSION_SKIP_KEY);
    });
    afterEach(() => {
        localStorage.removeItem(FIRST_SESSION_RITUAL_DONE_KEY);
        localStorage.removeItem(FIRST_SESSION_SKIP_KEY);
    });

    it('setRitualDone / isRitualDone round-trip; removing key clears ritual state', () => {
        expect(isRitualDone()).toBe(false);
        setRitualDone();
        expect(isRitualDone()).toBe(true);
        localStorage.removeItem(FIRST_SESSION_RITUAL_DONE_KEY);
        expect(isRitualDone()).toBe(false);
    });

    it('setSkippedToAuth / hasSkippedToAuth round-trip', () => {
        expect(hasSkippedToAuth()).toBe(false);
        setSkippedToAuth();
        expect(hasSkippedToAuth()).toBe(true);
    });
});
