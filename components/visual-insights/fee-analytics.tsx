'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Data for Year Wise Collection (2017-2022)
const yearlyData = [
    { year: '2017-18', online: 25396774, cash: 15295992, bank: 21224178, total: 61916944 },
    { year: '2018-19', online: 13622151, cash: 11831328, bank: 18892284, total: 44345763 },
    { year: '2019-20', online: 12548385, cash: 36124400, bank: 44115884, total: 92788669 },
    { year: '2020-21', online: 21207537, cash: 19752824, bank: 28672712, total: 69633073 },
    { year: '2021-22', online: 5511303, cash: 7204160, bank: 11232446, total: 23947909 }
];

// Data for Month Wise Collection (Stacked) - Sampled/Inferred from code (Jan-Dec)
// The user code repeats data blocks, I'll use the first distinct set for Jan-May and repeat as per code logic or simplify.
// Code repeats the same 5 values for 12 months in a pattern. I'll replicate the pattern partially.
const monthlyData = [
    { month: 'Jan', online: 25396774, cash: 15295992, bank: 21224178 },
    { month: 'Feb', online: 13622151, cash: 11831328, bank: 18892284 },
    { month: 'Mar', online: 12548385, cash: 36124400, bank: 44115884 },
    { month: 'Apr', online: 21207537, cash: 19752824, bank: 28672712 },
    { month: 'May', online: 5511303, cash: 7204160, bank: 11232446 },
    { month: 'Jun', online: 25396774, cash: 15295992, bank: 21224178 },
    { month: 'Jul', online: 13622151, cash: 11831328, bank: 18892284 },
    { month: 'Aug', online: 12548385, cash: 36124400, bank: 44115884 },
    { month: 'Sep', online: 21207537, cash: 19752824, bank: 28672712 },
    { month: 'Oct', online: 5511303, cash: 7204160, bank: 23947909 },
    { month: 'Nov', online: 13622151, cash: 11831328, bank: 18892284 },
    { month: 'Dec', online: 12548385, cash: 36124400, bank: 44115884 }
];

// Data for Pie Charts (Yearly Breakdown)
const pieYears = [
    {
        year: '2017-2018',
        data: [
            { name: 'Online', value: 25396774, fill: '#139ee1' },
            { name: 'Cash', value: 15295992, fill: '#5eabd1' },
            { name: 'Bank', value: 21224178, fill: '#a6d0e5' }
        ]
    },
    {
        year: '2018-2019',
        data: [
            { name: 'Online', value: 13622151, fill: '#139ee1' },
            { name: 'Cash', value: 11831328, fill: '#5eabd1' },
            { name: 'Bank', value: 18892284, fill: '#a6d0e5' }
        ]
    },
    {
        year: '2019-2020',
        data: [
            { name: 'Online', value: 12548385, fill: '#139ee1' },
            { name: 'Cash', value: 36124400, fill: '#5eabd1' },
            { name: 'Bank', value: 44115884, fill: '#a6d0e5' }
        ]
    },
    {
        year: '2020-2021',
        data: [
            { name: 'Online', value: 21207537, fill: '#139ee1' },
            { name: 'Cash', value: 19752824, fill: '#5eabd1' },
            { name: 'Bank', value: 28672712, fill: '#a6d0e5' }
        ]
    },
    {
        year: '2021-2022',
        data: [
            { name: 'Online', value: 5511303, fill: '#139ee1' },
            { name: 'Cash', value: 7204160, fill: '#5eabd1' },
            { name: 'Bank', value: 11232446, fill: '#a6d0e5' }
        ]
    }
];

export function FeeAnalytics() {
    return (
        <div className='space-y-6'>
            {/* Year Wise Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Year Wise Fee Collection Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={yearlyData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='year' />
                                <YAxis tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} />
                                <Legend />
                                <Line type='monotone' dataKey='online' name='Online' stroke='#139ee1' strokeWidth={2} />
                                <Line type='monotone' dataKey='cash' name='Cash' stroke='#5eabd1' strokeWidth={2} />
                                <Line type='monotone' dataKey='bank' name='Bank' stroke='#a6d0e5' strokeWidth={2} />
                                <Line type='monotone' dataKey='total' name='Total' stroke='#cadce5' strokeWidth={2} strokeDasharray='5 5' />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Month Wise Stacked */}
            <Card>
                <CardHeader>
                    <CardTitle>Month Wise Fee Collection (Stacked)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='month' />
                                <YAxis tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='online' name='Online' stackId='a' fill='#139ee1' />
                                <Bar dataKey='cash' name='Cash' stackId='a' fill='#5eabd1' />
                                <Bar dataKey='bank' name='Bank' stackId='a' fill='#a6d0e5' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Yearly Composition Pies */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {pieYears.map((item, idx) => (
                    <Card key={idx}>
                        <CardHeader>
                            <CardTitle className='text-center'>{item.year} Collection Mode</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='h-[250px] w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart>
                                        <Pie
                                            data={item.data}
                                            dataKey='value'
                                            nameKey='name'
                                            cx='50%'
                                            cy='50%'
                                            innerRadius={40}
                                            outerRadius={80}
                                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                            {item.data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} />
                                        <Legend verticalAlign='bottom' height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
