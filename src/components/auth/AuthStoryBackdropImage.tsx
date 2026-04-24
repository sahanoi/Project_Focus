import React from 'react';

/** Shared layout for full-viewport story PNGs (pixel-art, letterboxed). */
export const AUTH_STORY_BACKDROP_IMG_CLASS =
    'pixel-art-image pointer-events-none absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-cover object-center';

export type AuthStoryBackdropImageProps = {
    alt?: string;
    className?: string;
} & (
    | { src: string; responsive?: never }
    | { responsive: { mobile: string; desktop: string }; src?: never }
);

/**
 * Single PNG or responsive pair (mobile default, desktop from `md` / 768px).
 */
export default function AuthStoryBackdropImage({
    alt = '',
    className = '',
    ...rest
}: AuthStoryBackdropImageProps) {
    const cls = [AUTH_STORY_BACKDROP_IMG_CLASS, className].filter(Boolean).join(' ');

    if ('responsive' in rest && rest.responsive) {
        const { mobile, desktop } = rest.responsive;
        return (
            <picture className="pointer-events-none absolute inset-0 block">
                <source media="(min-width: 768px)" srcSet={desktop} />
                <img src={mobile} alt={alt} className={cls} />
            </picture>
        );
    }

    const src = 'src' in rest ? rest.src : '';
    return <img src={src} alt={alt} className={cls} />;
}
