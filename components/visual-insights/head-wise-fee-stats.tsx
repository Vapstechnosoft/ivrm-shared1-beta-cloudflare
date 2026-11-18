'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
    { category: 'Exam Fee', Total: 25000, Paid: 10000, Concession: 5000, Balance: 10000 },
    { category: 'Admission Fee', Total: 35000, Paid: 15000, Concession: 15000, Balance: 5000 },
    { category: 'Registration Fee', Total: 15000, Paid: 12000, Concession: 0, Balance: 3000 },
    { category: 'Regular Fee', Total: 65000, Paid: 20000, Concession: 20000, Balance: 25000 }
];

export function HeadWiseFeeStats() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Head Wise Collection</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='h-[400px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                            <XAxis dataKey='category' />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey='Total' fill='#2874A6' name='Total Charges' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='Paid' fill='#F3A00E' name='Paid' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='Concession' fill='#5D6D7E' name='Concession' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='Balance' fill='#979A9A' name='Balance' radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
