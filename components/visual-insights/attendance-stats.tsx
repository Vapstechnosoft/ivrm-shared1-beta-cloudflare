'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const attendanceData = [
    { year: '2019-20', VI: 75, VII: 47, VIII: 74, IX: 92, X: 67 },
    { year: '2020-21', VI: 78, VII: 82, VIII: 64, IX: 89, X: 79 },
    { year: '2021-22', VI: 82, VII: 59, VIII: 76, IX: 66, X: 54 }
];

export function AttendanceStats() {
    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Class Wise Attendance Trend (Line)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='year' />
                                <YAxis unit='%' />
                                <Tooltip />
                                <Legend />
                                <Line type='monotone' dataKey='VI' stroke='#2874A6' strokeWidth={2} />
                                <Line type='monotone' dataKey='VII' stroke='#F3A00E' strokeWidth={2} />
                                <Line type='monotone' dataKey='VIII' stroke='#5D6D7E' strokeWidth={2} />
                                <Line type='monotone' dataKey='IX' stroke='#979A9A' strokeWidth={2} />
                                <Line type='monotone' dataKey='X' stroke='#7B241C' strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Class Wise Attendance Comparison (Column)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='year' />
                                <YAxis unit='%' />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='VI' fill='#2874A6' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='VII' fill='#F3A00E' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='VIII' fill='#5D6D7E' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='IX' fill='#979A9A' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='X' fill='#7B241C' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
