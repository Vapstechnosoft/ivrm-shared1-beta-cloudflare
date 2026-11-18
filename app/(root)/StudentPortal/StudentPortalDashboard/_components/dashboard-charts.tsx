'use client';

import type React from 'react';
import {
    Area,
    AreaChart,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// --- Performance Donut Chart ---
const performanceData = [
    { name: 'Completed', value: 92.4, color: '#f59e0b' },
    { name: 'Remaining', value: 7.6, color: '#f3f4f6' }
];

export const PerformanceDonut: React.FC = () => {
    return (
        <div className='relative mx-auto h-48 w-48'>
            <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                    <Pie
                        data={performanceData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey='value'
                        startAngle={90}
                        endAngle={-270}>
                        {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke='none' />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                <span className='font-black text-3xl text-slate-800'>92.4%</span>
            </div>
        </div>
    );
};

// --- Fee Collection Line Chart ---
const feeData = [
    { name: 'Jan 22', upcoming: 100, overdue: 120, unpaid: 150 },
    { name: 'Feb 22', upcoming: 150, overdue: 180, unpaid: 220 },
    { name: 'Mar 36', upcoming: 250, overdue: 200, unpaid: 180 },
    { name: 'Apr 35', upcoming: 350, overdue: 290, unpaid: 250 }
];

export const FeeCollectionChart: React.FC = () => {
    return (
        <div className='h-64 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={feeData}>
                    <XAxis
                        dataKey='name'
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Line
                        type='monotone'
                        dataKey='upcoming'
                        stroke='#6366f1'
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type='monotone'
                        dataKey='overdue'
                        stroke='#f59e0b'
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type='monotone'
                        dataKey='unpaid'
                        stroke='#ec4899'
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Small Performance Sparkline ---
const sparkData = [{ value: 40 }, { value: 35 }, { value: 55 }, { value: 45 }, { value: 70 }, { value: 85 }];

export const PerformanceSparkline: React.FC = () => {
    return (
        <div className='h-24 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={sparkData}>
                    <defs>
                        <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='5%' stopColor='#818cf8' stopOpacity={0.3} />
                            <stop offset='95%' stopColor='#818cf8' stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type='monotone'
                        dataKey='value'
                        stroke='#6366f1'
                        strokeWidth={3}
                        fill='url(#gradient)'
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Subject Performance Radar Chart ---
const radarData = [
    { subject: 'Math', score: 85, fullMark: 100 },
    { subject: 'Science', score: 92, fullMark: 100 },
    { subject: 'English', score: 78, fullMark: 100 },
    { subject: 'History', score: 88, fullMark: 100 },
    { subject: 'Computer', score: 95, fullMark: 100 }
];

export const SubjectRadarChart: React.FC = () => {
    return (
        <div className='h-64 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
                <RadarChart cx='50%' cy='50%' outerRadius='80%' data={radarData}>
                    <PolarGrid stroke='#e2e8f0' />
                    <PolarAngleAxis dataKey='subject' tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar name='Student' dataKey='score' stroke='#6366f1' fill='#6366f1' fillOpacity={0.6} />
                    <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
