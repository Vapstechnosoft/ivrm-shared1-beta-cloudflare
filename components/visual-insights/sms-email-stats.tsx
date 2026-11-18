'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const emailSmsData = [
    { month: 'Jan', email: 44, sms: 68 },
    { month: 'Feb', email: 40, sms: 56 },
    { month: 'Mar', email: 72, sms: 68 },
    { month: 'Apr', email: 89, sms: 49 },
    { month: 'May', email: 20, sms: 35 },
    { month: 'Jun', email: 100, sms: 45 },
    { month: 'Jul', email: 74, sms: 34 },
    { month: 'Aug', email: 86, sms: 43 },
    { month: 'Sep', email: 62, sms: 64 },
    { month: 'Oct', email: 43, sms: 47 },
    { month: 'Nov', email: 44, sms: 49 },
    { month: 'Dec', email: 56, sms: 47 }
];

export function SmsEmailStats() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Birthday Communication: Email vs SMS</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='h-[400px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={emailSmsData}>
                            <CartesianGrid strokeDasharray='3 3' vertical={false} />
                            <XAxis dataKey='month' />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey='email' name='Email Count' fill='#2874A6' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='sms' name='SMS Count' fill='#F3A00E' radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
