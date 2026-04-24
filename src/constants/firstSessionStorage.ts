export const FIRST_SESSION_RITUAL_DONE_KEY = 'focus_ftp_first_session_ritual_v1';
export const FIRST_SESSION_SKIP_KEY = 'focus_ftp_first_session_skip_v1';

const DONE_VALUE = '1';

export function setRitualDone(): void {
    try {
        localStorage.setItem(FIRST_SESSION_RITUAL_DONE_KEY, DONE_VALUE);
    } catch {
        /* private mode / SSR / quota */
    }
}

export function isRitualDone(): boolean {
    try {
        return localStorage.getItem(FIRST_SESSION_RITUAL_DONE_KEY) === DONE_VALUE;
    } catch {
        return false;
    }
}

export function setSkippedToAuth(): void {
    try {
        localStorage.setItem(FIRST_SESSION_SKIP_KEY, DONE_VALUE);
    } catch {
        /* private mode / SSR / quota */
    }
}

export function hasSkippedToAuth(): boolean {
    try {
        return localStorage.getItem(FIRST_SESSION_SKIP_KEY) === DONE_VALUE;
    } catch {
        return false;
    }
}
