'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const columnData = [
    { year: '2021-2022', PreKG: 48, LKG: 80, UKG: 93 },
    { year: '2020-2021', PreKG: 45, LKG: 75, UKG: 77 },
    { year: '2019-2020', PreKG: 55, LKG: 95, UKG: 85 },
    { year: '2018-2019', PreKG: 51, LKG: 82, UKG: 73 }
];

const pieData = [
    { name: '2021-2022', value: 25.57, fill: '#e1f15d' },
    { name: '2020-2021', value: 22.93, fill: '#72b954' },
    { name: '2019-2020', value: 26.25, fill: '#2f85cf' },
    { name: '2018-2019', value: 23.01, fill: '#562323' }
];

export function YearAdmissionStats() {
    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Year Wise Admission Count</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={columnData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='year' tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='PreKG' fill='#c6d9ed' name='Pre-KG' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='LKG' fill='#3770ad' name='LKG' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='UKG' fill='#0c437e' name='UKG' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>YearWise Admission %</CardTitle>
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
                                    outerRadius={100}
                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
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
