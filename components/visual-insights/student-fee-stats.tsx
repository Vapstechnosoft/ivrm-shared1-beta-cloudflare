'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { category: 'Concession', y21: 10000, y20: 5000, y19: 2000 },
    { category: 'Opening Balance', y21: 5000, y20: 8000, y19: 0 }
];

export function StudentFeeStats() {
    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Student Fee Details (Comparison)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='category' />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='y21' fill='#2874A6' name='2021-2022' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='y20' fill='#F3A00E' name='2020-2021' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='y19' fill='#5D6D7E' name='2019-2020' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student Fee Trend (Line)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='category' />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} />
                                <Legend />
                                <Line type='monotone' dataKey='y21' stroke='#2874A6' strokeWidth={2} name='2021-2022' />
                                <Line type='monotone' dataKey='y20' stroke='#F3A00E' strokeWidth={2} name='2020-2021' />
                                <Line type='monotone' dataKey='y19' stroke='#5D6D7E' strokeWidth={2} name='2019-2020' />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
