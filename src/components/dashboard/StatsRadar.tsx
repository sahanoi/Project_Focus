import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { CharacterStats } from '../../types';

interface StatsRadarProps {
    stats: CharacterStats;
    className?: string;
}

export default function StatsRadar({ stats, className = '' }: StatsRadarProps) {
    const { attributes } = stats;

    const data = [
        { subject: 'DSC', A: attributes.dsc, fullMark: 100, tooltip: 'Discipline' },
        { subject: 'FOC', A: attributes.foc, fullMark: 100, tooltip: 'Focus' },
        { subject: 'STK', A: attributes.stk, fullMark: 100, tooltip: 'Streak' },
        { subject: 'BAL', A: attributes.bal, fullMark: 100, tooltip: 'Balance' },
        { subject: 'GRT', A: attributes.grt, fullMark: 100, tooltip: 'Grit' },
        { subject: 'VIT', A: attributes.vit, fullMark: 100, tooltip: 'Vitality' },
    ];

    return (
        <div className={`w-full aspect-square relative ${className}`}>
            {/* Background Container */}
            <div className="absolute inset-0 bg-[#1e1b4b] rounded-2xl border border-indigo-900/50 shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center border border-indigo-400/30">
                            <span className="text-indigo-300 transform -rotate-45 font-bold">⚡</span>
                        </div>
                        <span className="text-white font-bold tracking-wider">STATS</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-yellow-500/50 flex items-center justify-center text-yellow-500 text-xs font-serif italic">
                        i
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="w-full h-full p-4 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="#4338ca" strokeDasharray="4 4" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#e0e7ff', fontSize: 12, fontWeight: 'bold' }}
                            />
                            <Radar
                                name="Stats"
                                dataKey="A"
                                stroke="#facc15"
                                strokeWidth={3}
                                fill="#facc15"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4338ca', color: '#fff' }}
                                itemStyle={{ color: '#facc15' }}
                                formatter={(val: number, _name: string, props: any) => {
                                    const tooltip = props?.payload?.tooltip || '';
                                    return [`${val}`, tooltip];
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* OVR Overlay */}
                <div className="absolute bottom-4 right-4 text-right">
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 font-mono">
                        {attributes.ovr}
                    </div>
                    <div className="text-xs text-indigo-300 font-bold tracking-widest uppercase">OVR</div>
                </div>
            </div>
        </div>
    );
}
