'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const admissionData = [
    { class: 'PREKG', accepted: 100, waiting: 10, rejected: 55, inprogress: 10 },
    { class: 'LKG', accepted: 100, waiting: 10, rejected: 80, inprogress: 10 },
    { class: 'UKG', accepted: 50, waiting: 42, rejected: 23, inprogress: 80 },
    { class: 'I CLASS', accepted: 50, waiting: 42, rejected: 15, inprogress: 80 },
    { class: 'II CLASS', accepted: 50, waiting: 107, rejected: 56, inprogress: 80 }
];

const pieData = [
    { name: 'PREKG', value: 450, fill: '#9de219' },
    { name: 'LKG', value: 490, fill: '#90cc38' },
    { name: 'UKG', value: 280, fill: '#068c35' },
    { name: 'I CLASS', value: 2207, fill: '#006634' },
    { name: 'II CLASS', value: 800, fill: '#004d38' }
];

export function AdmissionStats() {
    return (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Preadmission Status (Stacked Column) */}
            <Card>
                <CardHeader>
                    <CardTitle className='font-black text-[#1e293b] text-[16px]'>Preadmission Status Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[350px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={admissionData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                <XAxis
                                    dataKey='class'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType='circle' wrapperStyle={{ paddingTop: 20, fontSize: 11, fontWeight: 700 }} />
                                <Bar dataKey='accepted' name='ACCEPTED' stackId='a' fill='#10b981' barSize={30} radius={[0, 0, 0, 0]} />
                                <Bar
                                    dataKey='inprogress'
                                    name='IN PROGRESS'
                                    stackId='a'
                                    fill='#3b82f6'
                                    barSize={30}
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar dataKey='waiting' name='WAITING' stackId='a' fill='#94a3b8' barSize={30} radius={[0, 0, 0, 0]} />
                                <Bar dataKey='rejected' name='REJECTED' stackId='a' fill='#f43f5e' barSize={30} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Caste Category Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className='font-black text-[#1e293b] text-[16px]'>Class-wise Admission Distribution</CardTitle>
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
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke='none' />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType='circle' wrapperStyle={{ paddingTop: 10, fontSize: 11, fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
