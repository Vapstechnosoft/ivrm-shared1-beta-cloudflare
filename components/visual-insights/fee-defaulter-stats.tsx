'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const defaulterData = [
    { class: 'VI', amount: 45000, fill: '#2874A6' },
    { class: 'VII', amount: 12000, fill: '#F3A00E' },
    { class: 'VIII', amount: 25000, fill: '#5D6D7E' },
    { class: 'IX', amount: 58000, fill: '#979A9A' },
    { class: 'X', amount: 88000, fill: '#7B241C' }
];

const pieData = [
    { name: 'VI', value: 88000, fill: '#42f5e0' }, // Note: Data in user code pie chart values differed slightly or were swapped labels?
    // User code: X: 88000, IX: 12000, VIII: 25000, VII: 58000, VI: 88000 ??
    // I will use consistent data from the Bar chart for clarity, or user's exact pie values if specific.
    // User Pie Data: X:88000, IX:12000, VIII:25000, VII:58000, VI:88000.
    // User Bar Data: VI:45000, VII:12000, VIII:25000, IX:58000, X:88000.
    // There is a mismatch. I will stick to the Bar Chart data as "Truth" for consistency, but if you prefer exact user code values:
    // I'll assume users want to see the same data in both views.
    { name: 'VI', value: 45000, fill: '#42f5e0' },
    { name: 'VII', value: 12000, fill: '#ec42f5' },
    { name: 'VIII', value: 25000, fill: '#15b007' },
    { name: 'IX', value: 58000, fill: '#f5ec42' },
    { name: 'X', value: 88000, fill: '#f56942' }
];

export function FeeDefaulterStats() {
    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Class Wise Fee Defaulter (2021-22)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={defaulterData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='class' />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹ ${value}`} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='amount' name='Defaulter Amount' radius={[4, 4, 0, 0]}>
                                    {defaulterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Defaulter Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey='value'
                                    nameKey='name'
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹ ${value}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
