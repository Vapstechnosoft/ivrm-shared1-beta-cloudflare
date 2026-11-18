'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { exam: 'First Unit Test', Student: 36, ClassTopper: 98, SectionTopper: 75, ClassAvg: 56, SectionAvg: 54 },
    { exam: 'First Term Exam', Student: 40, ClassTopper: 98, SectionTopper: 54, ClassAvg: 86, SectionAvg: 46 },
    { exam: 'Mid Term Exam', Student: 72, ClassTopper: 68, SectionTopper: 98, ClassAvg: 81, SectionAvg: 68 },
    { exam: 'Final Exam', Student: 6, ClassTopper: 37, SectionTopper: 49, ClassAvg: 49, SectionAvg: 46 }
];

export function ExamPerformanceStats() {
    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Exam Wise Student Performance (Column)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='exam' />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey='Student' fill='#2874A6' radius={[4, 4, 0, 0]} name='Student Marks' />
                                <Bar dataKey='ClassTopper' fill='#FFD700' radius={[4, 4, 0, 0]} name='Class Topper' />
                                <Bar dataKey='SectionTopper' fill='#BDB76B' radius={[4, 4, 0, 0]} name='Section Topper' />
                                <Bar dataKey='ClassAvg' fill='#F3A00E' radius={[4, 4, 0, 0]} name='Class Average' />
                                <Bar dataKey='SectionAvg' fill='#008080' radius={[4, 4, 0, 0]} name='Section Average' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Exam Wise Student Performance (Line)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis dataKey='exam' />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type='monotone' dataKey='Student' stroke='#2874A6' strokeWidth={2} name='Student Marks' />
                                <Line type='monotone' dataKey='ClassTopper' stroke='#FFD700' strokeWidth={2} name='Class Topper' />
                                <Line type='monotone' dataKey='SectionTopper' stroke='#BDB76B' strokeWidth={2} name='Section Topper' />
                                <Line type='monotone' dataKey='ClassAvg' stroke='#F3A00E' strokeWidth={2} name='Class Average' />
                                <Line type='monotone' dataKey='SectionAvg' stroke='#008080' strokeWidth={2} name='Section Average' />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
