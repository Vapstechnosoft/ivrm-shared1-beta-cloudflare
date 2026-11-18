'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { year: 'V (16-17)', Student: 60, ClassTopper: 40, SectionTopper: 27, ClassAvg: 63, SectionAvg: 54 },
    { year: 'VI (17-18)', Student: 56, ClassTopper: 56, SectionTopper: 36, ClassAvg: 78, SectionAvg: 56 },
    { year: 'VII (18-19)', Student: 60, ClassTopper: 89, SectionTopper: 50, ClassAvg: 12, SectionAvg: 60 },
    { year: 'VIII (19-20)', Student: 54, ClassTopper: 49, SectionTopper: 36, ClassAvg: 64, SectionAvg: 54 },
    { year: 'IX (20-21)', Student: 52, ClassTopper: 100, SectionTopper: 52, ClassAvg: 92, SectionAvg: 52 },
    { year: 'X (21-22)', Student: 58, ClassTopper: 40, SectionTopper: 48, ClassAvg: 38, SectionAvg: 58 }
];

export function YearPerformanceStats() {
    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Year Wise Student Performance (Comparison)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='year' tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey='Student' fill='#2874A6' name='Student Marks' />
                                <Bar dataKey='ClassTopper' fill='#FFD700' name='Class Topper' />
                                <Bar dataKey='SectionTopper' fill='#BDB76B' name='Section Topper' />
                                <Bar dataKey='ClassAvg' fill='#F3A00E' name='Class Avg' />
                                <Bar dataKey='SectionAvg' fill='#008080' name='Section Avg' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Trend (Line)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='year' tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line type='monotone' dataKey='Student' stroke='#2874A6' strokeWidth={2} dot={{ r: 4 }} />
                                <Line type='monotone' dataKey='ClassTopper' stroke='#FFD700' strokeWidth={2} />
                                <Line type='monotone' dataKey='SectionTopper' stroke='#BDB76B' strokeWidth={2} />
                                <Line type='monotone' dataKey='ClassAvg' stroke='#F3A00E' strokeWidth={2} />
                                <Line type='monotone' dataKey='SectionAvg' stroke='#008080' strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
