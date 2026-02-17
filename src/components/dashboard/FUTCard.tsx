import React from 'react';
import { CharacterStats } from '../../types';
import { Trophy, ChevronUp } from 'lucide-react';

interface FUTCardProps {
    stats: CharacterStats;
    name: string;
    className?: string;
}

export default function FUTCard({ stats, name, className = '' }: FUTCardProps) {
    const { attributes } = stats;

    // Determine card variant based on OVR
    const getCardVariant = (ovr: number) => {
        if (ovr >= 90) return 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 border-2 border-cyan-200 text-white'; // TOTS / Special
        if (ovr >= 85) return 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 border-yellow-500 text-white'; // TOTW / Inform
        if (ovr >= 80) return 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border-2 border-yellow-200 text-yellow-900'; // Gold Rare
        if (ovr >= 75) return 'bg-gradient-to-br from-yellow-100 to-yellow-300 border border-yellow-400 text-gray-800'; // Gold Common
        if (ovr >= 65) return 'bg-gradient-to-br from-gray-200 to-gray-400 border border-gray-400 text-gray-800'; // Silver
        return 'bg-gradient-to-br from-orange-200 to-orange-400 border border-orange-500 text-orange-900'; // Bronze
    };

    const cardStyle = getCardVariant(attributes.ovr);
    const glowColor = attributes.ovr >= 85 ? 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'shadow-lg';

    return (
        <div className={`relative w-full max-w-[320px] aspect-[2/3] mx-auto ${className}`}>
            {/* Card Shape Container */}
            <div className={`absolute inset-0 rounded-t-2xl rounded-b-[3rem] ${cardStyle} ${glowColor} overflow-hidden flex flex-col items-center pt-6 pb-8 px-4 transition-transform hover:scale-105 duration-300 transform-gpu`}>

                {/* Header: Rating & Position */}
                <div className="flex w-full justify-between items-start px-4 mb-2">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-black leading-none">{attributes.ovr}</span>
                        <span className="text-sm font-bold opacity-80 uppercase tracking-widest">OVR</span>
                    </div>
                    {/* Country/Team placeholder */}
                    <div className="flex flex-col gap-1 items-center opacity-80 pointer-events-none">
                        <div className="w-8 h-5 bg-red-600 rounded-sm shadow-sm relative overflow-hidden">
                            <div className="absolute left-2 top-0 bottom-0 w-4 bg-white flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avatar / Image */}
                <div className="relative w-32 h-32 mb-4">
                    <div className="absolute inset-0 bg-black/20 rounded-full blur-xl transform translate-y-2"></div>
                    {/* Placeholder Avatar - replace with user image later */}
                    <div className="w-full h-full relative z-10 flex items-center justify-center">
                        {/* Dynamic Emoji based on VIT/FOC stats */}
                        <span className="text-8xl filter drop-shadow-2xl">
                            {attributes.vit > 80 ? '🦁' : attributes.foc > 80 ? '🦉' : '👤'}
                        </span>
                    </div>
                </div>

                {/* Name */}
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1 text-center truncate w-full border-b border-black/10 pb-2">
                    {name || 'Player'}
                </h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 w-full px-4 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{attributes.dsc}</span>
                        <span className="text-xs font-semibold opacity-70 uppercase">DSC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{attributes.foc}</span>
                        <span className="text-xs font-semibold opacity-70 uppercase">FOC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{attributes.stk}</span>
                        <span className="text-xs font-semibold opacity-70 uppercase">STK</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{attributes.bal}</span>
                        <span className="text-xs font-semibold opacity-70 uppercase">BAL</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{attributes.grt}</span>
                        <span className="text-xs font-semibold opacity-70 uppercase">GRT</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{attributes.vit}</span>
                        <span className="text-xs font-semibold opacity-70 uppercase">VIT</span>
                    </div>
                </div>

                {/* Chem Style / Bottom Decor */}
                <div className="mt-auto pt-4 flex items-center gap-1 opacity-60">
                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-4 bg-black/30 rounded-full"></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] font-bold uppercase ml-1">BASIC</span>
                </div>

                {/* Shine Effect */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            </div>
        </div>
    );
}
