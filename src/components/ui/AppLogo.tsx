import React from 'react';
import logoSrc from '../../assets/logo.png';

interface AppLogoProps {
    size?: number;
    className?: string;
}

/**
 * Focus FTP brand logo — uses the generated logo.png asset.
 * Transparent background, consistent everywhere it's used.
 */
export default function AppLogo({ size = 32, className = '' }: AppLogoProps) {
    return (
        <img
            src={logoSrc}
            alt="Focus FTP"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            draggable={false}
        />
    );
}
