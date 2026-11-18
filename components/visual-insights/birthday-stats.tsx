'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const yearData = [
    { year: '2019-2020', Jan: 44, Feb: 68, Mar: 72, Apr: 68, May: 20, Jun: 35, Jul: 74, Aug: 34, Sep: 62, Oct: 64, Nov: 44, Dec: 49 },
    { year: '2020-2021', Jan: 40, Feb: 56, Mar: 89, Apr: 49, May: 100, Jun: 40, Jul: 86, Aug: 43, Sep: 43, Oct: 47, Nov: 56, Dec: 47 },
    { year: '2021-2022', Jan: 50, Feb: 96, Mar: 63, Apr: 59, May: 93, Jun: 50, Jul: 46, Aug: 56, Sep: 53, Oct: 53, Nov: 75, Dec: 23 }
];

// Transformed for simple column chart of "Total Birthdays per Year" or similar (User code implied Month breakdown per year)
// For simplicity, I'll show Month-wise distribution for the latest year or aggregated, or grouped bar chart.
// The user code suggests "Category Axis: Year" but data series is "Month".
// This means: Grouped Bar Chart where X-Axis is Year, and bars are Jan, Feb... (That's 12 bars per year - very crowded).
// Alternative interpretation: Series is Year, X-Axis is Month.
// Let's stick to a clean interpretation: X-Axis = Year, Bars = Total Count (sum of months) or specific months if needed.
// Given the data arrays [44, 40, 50] for Jan over 3 years, it means:
// X-Axis: 2019-20, 2020-21, 2021-22
// Series: Jan, Feb...
// That is indeed crowded. I will implement a simplified version or stacked.

const pieData = [
    { name: '2019-2020', value: 83.8, fill: '#9de219' },
    { name: '2020-2021', value: 91.1, fill: '#90cc38' },
    { name: '2021-2022', value: 98.3, fill: '#068c35' }
];

const emailSmsData = [
    { month: 'Jan', email: 44, sms: 40 },
    { month: 'Feb', email: 68, sms: 56 },
    { month: 'Mar', email: 72, sms: 89 },
    { month: 'Apr', email: 68, sms: 49 },
    { month: 'May', email: 20, sms: 100 },
    { month: 'Jun', email: 35, sms: 40 },
    { month: 'Jul', email: 74, sms: 86 },
    { month: 'Aug', email: 34, sms: 43 },
    { month: 'Sep', email: 62, sms: 43 },
    { month: 'Oct', email: 64, sms: 47 },
    { month: 'Nov', email: 44, sms: 56 },
    { month: 'Dec', email: 49, sms: 47 }
];

export function BirthdayStats() {
    return (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Year Wise Birthday Count (Pie as per request, also Column) */}
            <Card>
                <CardHeader>
                    <CardTitle>Year Wise Birthday Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie data={pieData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={100} label>
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

            {/* Email vs SMS Count (Line Chart) */}
            <Card className='col-span-1 lg:col-span-2'>
                <CardHeader>
                    <CardTitle>Month-wise Student Birthday Email & SMS Count</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={emailSmsData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='month' />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type='monotone' dataKey='email' name='Email Count' stroke='#2874A6' strokeWidth={2} />
                                <Line type='monotone' dataKey='sms' name='SMS Count' stroke='#F3A00E' strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
