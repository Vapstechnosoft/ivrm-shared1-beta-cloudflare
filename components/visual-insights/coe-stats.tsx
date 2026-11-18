'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const coeData = [
    { month: 'Jan', y19: 44, y20: 40, y21: 50 },
    { month: 'Feb', y19: 68, y20: 56, y21: 96 },
    { month: 'Mar', y19: 72, y20: 89, y21: 63 },
    { month: 'Apr', y19: 89, y20: 49, y21: 89 },
    { month: 'May', y19: 20, y20: 35, y21: 20 },
    { month: 'Jun', y19: 100, y20: 45, y21: 100 },
    { month: 'Jul', y19: 74, y20: 34, y21: 74 },
    { month: 'Aug', y19: 86, y20: 43, y21: 86 },
    { month: 'Sep', y19: 62, y20: 64, y21: 62 },
    { month: 'Oct', y19: 43, y20: 47, y21: 43 },
    { month: 'Nov', y19: 44, y20: 49, y21: 44 },
    { month: 'Dec', y19: 56, y20: 47, y21: 56 }
];

const pieData = [
    { name: '2019-2020', value: 83.8, fill: '#FFD700' },
    { name: '2020-2021', value: 91.1, fill: '#FFA500' },
    { name: '2021-2022', value: 98.3, fill: '#808080' }
];

export function CoeStats() {
    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card className='col-span-1 md:col-span-2'>
                <CardHeader>
                    <CardTitle>Year Wise COE Count Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={coeData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='month' />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='y19' name='2019-2020' fill='#808080' />
                                <Bar dataKey='y20' name='2020-2021' fill='#F3A00E' />
                                <Bar dataKey='y21' name='2021-2022' fill='#2874A6' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>COE Count Percentage</CardTitle>
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
                                    label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
