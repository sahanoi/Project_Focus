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
            <div className="absolute inset-0 bg-white dark:bg-night-surface rounded-2xl border border-[#D4C8E8] dark:border-night-border shadow-lg overflow-hidden transition-colors">

                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded flex items-center justify-center border border-primary/20 dark:border-primary/30 transition-colors">
                            <span className="text-primary dark:text-primary-light transform -rotate-45 font-bold transition-colors">⚡</span>
                        </div>
                        <span className="text-dark dark:text-night-text font-bold tracking-wider transition-colors">STATS</span>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-warning/50 dark:border-warning/70 flex items-center justify-center text-warning dark:text-warning-light text-xs font-serif italic transition-colors">
                        i
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="w-full h-full p-4 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="currentColor" className="text-[#D4C8E8] dark:text-night-border" strokeDasharray="4 4" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={({ payload, x, y, textAnchor, stroke, radius }) => {
                                    return (
                                        <g className="recharts-layer recharts-polar-angle-axis-tick">
                                            <text
                                                radius={radius}
                                                stroke={stroke}
                                                x={x}
                                                y={y}
                                                className="recharts-text recharts-polar-angle-axis-tick-value fill-[#4A4453] dark:fill-night-text-muted text-[12px] font-bold"
                                                textAnchor={textAnchor}
                                            >
                                                <tspan x={x} dy="0em">{payload.value}</tspan>
                                            </text>
                                        </g>
                                    );
                                }}
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
                                contentStyle={{ backgroundColor: 'var(--tw-colors-surface-dark)', borderColor: 'var(--tw-colors-night-border)', color: 'var(--tw-colors-night-text)' }}
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
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dark dark:from-primary-light dark:to-primary font-mono transition-colors">
                        {attributes.ovr}
                    </div>
                    <div className="text-xs text-primary dark:text-primary-light font-bold tracking-widest uppercase transition-colors">OVR</div>
                </div>
            </div>
        </div>
    );
}
