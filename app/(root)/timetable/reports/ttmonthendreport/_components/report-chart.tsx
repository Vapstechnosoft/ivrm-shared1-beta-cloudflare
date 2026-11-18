'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ReportChartProps {
    reportData: any[];
}

export default function ReportChart({ reportData }: ReportChartProps) {
    const chartData = useMemo(() => {
        if (!reportData || reportData.length === 0) return [];
        return reportData.map((item: any) => ({
            name: item.ClassName || '',
            SMS: item.count || 0,
            Email: item.count || 0
        }));
    }, [reportData]);

    if (chartData.length === 0) return null;

    return (
        <div className='chart-print-container mt-8'>
            <h4 className='mb-4 text-center font-bold text-gray-800 text-lg'>SMS & EMAIL Counts by Class</h4>
            <div className='h-[350px] w-full rounded-xl border border-slate-100 bg-slate-50/50 p-4'>
                <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                        <XAxis dataKey='name' tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey='SMS' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                        <Bar dataKey='Email' fill='#06b6d4' radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
