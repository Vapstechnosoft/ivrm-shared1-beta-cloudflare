'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const feeData = [
    { category: 'I-IV', strength: 150, mapped: 100, collected: 5000, pending: 5000, total: 10000 },
    { category: 'V-VI', strength: 180, mapped: 120, collected: 15000, pending: 5000, total: 20000 },
    { category: 'VII-X', strength: 250, mapped: 200, collected: 7000, pending: 8000, total: 15000 },
    { category: 'XI-XII', strength: 200, mapped: 150, collected: 25000, pending: 5000, total: 35000 }
];

export function FeeCollectionStats() {
    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Consolidated Category Wise Statistics (Line)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={feeData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='category' />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type='monotone' dataKey='collected' name='Collected' stroke='#00C49F' strokeWidth={2} />
                                <Line type='monotone' dataKey='pending' name='Pending' stroke='#FF8042' strokeWidth={2} />
                                <Line type='monotone' dataKey='total' name='Total Payable' stroke='#0088FE' strokeDasharray='5 5' />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Consolidated Category Wise Statistics (Column)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={feeData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='category' />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='strength' name='Total Strength' fill='#8884d8' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='mapped' name='Mapped Students' fill='#82ca9d' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
