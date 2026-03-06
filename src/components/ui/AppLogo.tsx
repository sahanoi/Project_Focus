import React from 'react';

interface AppLogoProps {
    size?: number;
    className?: string;
}

/**
 * Focus FTP brand logo — SVG-based, inherently transparent.
 * A hexagonal shield with a rising flame/arrow motif in brand purple.
 */
export default function AppLogo({ size = 32, className = '' }: AppLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Definitions */}
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6E44FF" />
                    <stop offset="100%" stopColor="#9B72FF" />
                </linearGradient>
                <linearGradient id="flameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#E0D4FF" stopOpacity="0.95" />
                </linearGradient>
                <filter id="logoGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Hexagonal shield shape */}
            <path
                d="M32 4L56 18V46L32 60L8 46V18L32 4Z"
                fill="url(#logoGrad)"
                stroke="url(#logoGrad)"
                strokeWidth="1"
                filter="url(#logoGlow)"
            />

            {/* Inner bevel */}
            <path
                d="M32 8L52 20V44L32 56L12 44V20L32 8Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.2"
            />

            {/* Rising flame / arrow motif */}
            <path
                d="M32 16L40 30H36V44H28V30H24L32 16Z"
                fill="url(#flameGrad)"
            />

            {/* Small sparkle accent */}
            <circle cx="44" cy="22" r="2" fill="white" fillOpacity="0.4" />
        </svg>
    );
}
