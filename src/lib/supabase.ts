import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    if (typeof window !== 'undefined') {
        console.warn('Supabase credentials missing. App will run in Offline/Guest mode.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
