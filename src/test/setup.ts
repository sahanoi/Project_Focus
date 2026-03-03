import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] || null,
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset localStorage before each test
beforeEach(() => {
    localStorageMock.clear();
});

// Mock Supabase
import { vi } from 'vitest';

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signUp: vi.fn(() => Promise.resolve({ data: { user: {} }, error: null })),
            signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: {} }, error: null })),
            signOut: vi.fn(() => Promise.resolve({ error: null })),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
        })),
    },
}));
