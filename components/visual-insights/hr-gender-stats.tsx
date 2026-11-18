'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { department: 'HIGH SCHOOL', Male: 55, Female: 88, Other: 12 },
    { department: 'MIDDLE SCHOOL', Male: 5, Female: 8, Other: 8 },
    { department: 'PRIMARY SCHOOL', Male: 88, Female: 2, Other: 8 },
    { department: 'PE DEPT', Male: 5, Female: 5, Other: 23 },
    { department: 'NCC', Male: 18, Female: 77, Other: 5 }
];

export function HrGenderStats() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Department Wise Gender Count</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='h-[400px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                            <XAxis dataKey='department' />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey='Male' fill='#2874A6' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='Female' fill='#F3A00E' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='Other' fill='#5D6D7E' radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
