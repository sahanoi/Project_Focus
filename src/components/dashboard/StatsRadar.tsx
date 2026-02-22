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
            <div className="absolute inset-0 bg-white rounded-2xl border border-[#E6DDF2] shadow-lg overflow-hidden">

                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center border border-primary/20">
                            <span className="text-primary transform -rotate-45 font-bold">⚡</span>
                        </div>
                        <span className="text-dark font-bold tracking-wider">STATS</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-warning/50 flex items-center justify-center text-warning text-xs font-serif italic">
                        i
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="w-full h-full p-4 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="#E6DDF2" strokeDasharray="4 4" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#4A4453', fontSize: 12, fontWeight: 'bold' }}
                            />
                            <Radar
                                name="Stats"
                                dataKey="A"
                                stroke="#9B8BB4"
                                strokeWidth={3}
                                fill="#D8B4E2"
                                fillOpacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#FFFBF0', borderColor: '#E6DDF2', color: '#4A4453' }}
                                itemStyle={{ color: '#9B8BB4' }}
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
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dark font-mono">
                        {attributes.ovr}
                    </div>
                    <div className="text-xs text-primary font-bold tracking-widest uppercase">OVR</div>
                </div>
            </div>
        </div>
    );
}
