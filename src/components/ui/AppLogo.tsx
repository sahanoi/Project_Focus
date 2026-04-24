import React from 'react';
import logoSrc from '../../assets/Logo01.png';

interface AppLogoProps {
    size?: number;
    className?: string;
}

/** Focus FTP brand mark — `src/assets/Logo01.png` */
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
