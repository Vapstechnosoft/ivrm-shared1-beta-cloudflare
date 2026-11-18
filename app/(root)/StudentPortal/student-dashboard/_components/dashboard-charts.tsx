'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const attendanceData = [
    { month: 'Jun', present: 22, total: 24 },
    { month: 'Jul', present: 20, total: 24 },
    { month: 'Aug', present: 23, total: 24 },
    { month: 'Sep', present: 21, total: 23 },
    { month: 'Oct', present: 18, total: 20 }
];

interface DashboardChartsProps {
    isFeeMapped?: boolean;
    feeSummary?: {
        charges?: number;
        paid?: number;
        outstanding?: number;
        concession?: number;
    };
}

export function DashboardCharts({ isFeeMapped = false, feeSummary }: DashboardChartsProps = {}) {
    const feesData = [
        { name: 'Total', amount: feeSummary?.charges ?? 0, fill: '#3b82f6' },
        { name: 'Paid', amount: feeSummary?.paid ?? 0, fill: '#10b981' },
        { name: 'Balance', amount: feeSummary?.outstanding ?? 0, fill: '#ef4444' }
    ];

    return (
        // Always use 2 columns on medium screens since we are always showing both cards now
        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Academic Year Fees Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {isFeeMapped ? (
                        <div className='h-[300px]'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart data={feesData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='name' />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey='amount' radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className='flex h-[300px] items-center justify-center'>
                            <p className='text-muted-foreground italic text-sm'>No fee data available</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Academic Year Attendance Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Attendance chart code remains unchanged */}
                    <div className='h-[300px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='month' />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey='present' name='Present' fill='#10b981' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='total' name='Total Classes' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}