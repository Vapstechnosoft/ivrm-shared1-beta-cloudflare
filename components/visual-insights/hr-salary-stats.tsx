'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const salaryData = [
    {
        year: '2018-19',
        Jan: 252000,
        Feb: 200000,
        Mar: 215000,
        Apr: 215000,
        May: 215000,
        Jun: 85000,
        Jul: 40000,
        Aug: 215000,
        Sep: 80000,
        Oct: 215000,
        Nov: 215000,
        Dec: 6000
    },
    {
        year: '2019-20',
        Jan: 274000,
        Feb: 241000,
        Mar: 218000,
        Apr: 218000,
        May: 218000,
        Jun: 70000,
        Jul: 80000,
        Aug: 218000,
        Sep: 218000,
        Oct: 12500,
        Nov: 65000,
        Dec: 218000
    },
    {
        year: '2020-21',
        Jan: 278000,
        Feb: 241000,
        Mar: 204000,
        Apr: 20400,
        May: 60000,
        Jun: 204000,
        Jul: 204000,
        Aug: 55000,
        Sep: 60000,
        Oct: 204000,
        Nov: 204000,
        Dec: 10000
    },
    {
        year: '2021-22',
        Jan: 310000,
        Feb: 188000,
        Mar: 216000,
        Apr: 216000,
        May: 216000,
        Jun: 216000,
        Jul: 216000,
        Aug: 216000,
        Sep: 216000,
        Oct: 216000,
        Nov: 216000,
        Dec: 216000
    }
];

const colors = [
    '#2874A6',
    '#F3A00E',
    '#5D6D7E',
    '#979A9A',
    '#7B241C',
    '#1ABC9C',
    '#2ECC71',
    '#3498DB',
    '#9B59B6',
    '#34495E',
    '#16A085',
    '#27AE60'
];

export function HrSalaryStats() {
    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Employee Monthly Salary (Bar Graph)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[450px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={salaryData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='year' />
                                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                                    <Bar key={month} dataKey={month} fill={colors[idx]} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Monthly Salary (Line Graph)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[450px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={salaryData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='year' />
                                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} />
                                <Legend />
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                                    <Line key={month} type='monotone' dataKey={month} stroke={colors[idx]} strokeWidth={2} dot={{ r: 4 }} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
