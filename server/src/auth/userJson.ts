import { toIsoTimestamp } from '../util/dates.js';

export type UserRow = {
    id: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarSeed: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export function toPublicUser(u: UserRow) {
    return {
        id: u.id,
        email: u.email,
        user_metadata: {
            display_name: u.displayName ?? undefined,
            bio: u.bio ?? undefined,
            avatar_seed: u.avatarSeed ?? undefined,
        },
        created_at: toIsoTimestamp(u.createdAt),
        updated_at: toIsoTimestamp(u.updatedAt),
    };
}
