/**
 * Minimal auth types for local-first auth (User / Session shape).
 */
export type AuthUserMetadata = {
    display_name?: string;
    bio?: string;
    avatar_seed?: string;
};

export interface User {
    id: string;
    email?: string;
    user_metadata?: AuthUserMetadata;
    app_metadata?: Record<string, unknown>;
    aud?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Session {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
    user: User;
}
