'use client';

import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface ChartDataItem {
    name: string;
    PASS: number;
    FAIL: number;
}

interface ExamReportChartProps {
    data: ChartDataItem[];
}

export default function ExamReportChart({ data }: ExamReportChartProps) {
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className="h-[380px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        tick={{ fontSize: 12 }}
                        height={60}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                        dataKey="PASS"
                        fill="#16a34a"
                        radius={[4, 4, 0, 0]}
                        name="PASS"
                    />
                    <Bar
                        dataKey="FAIL"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        name="FAIL"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
