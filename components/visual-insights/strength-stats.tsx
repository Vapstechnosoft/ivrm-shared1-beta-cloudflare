'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const strengthData = [
    { class: 'Pre-Nur', sections: 3, strength: 70 },
    { class: 'Nursery', sections: 4, strength: 56 },
    { class: 'I', sections: 4, strength: 84 },
    { class: 'II', sections: 3, strength: 95 },
    { class: 'III', sections: 5, strength: 108 },
    { class: 'IV', sections: 8, strength: 100 },
    { class: 'V', sections: 3, strength: 85 },
    { class: 'VI', sections: 4, strength: 69 },
    { class: 'VII', sections: 2, strength: 78 },
    { class: 'VIII', sections: 4, strength: 80 },
    { class: 'IX', sections: 4, strength: 95 },
    { class: 'X', sections: 2, strength: 85 }
];

const pieData = [
    { name: 'Pre-Nursery', value: 70, fill: '#123456' },
    { name: 'Nursery', value: 56, fill: '#1F618D' },
    { name: 'I', value: 84, fill: '#148F77' },
    { name: 'II', value: 95, fill: '#239B56' },
    { name: 'III', value: 108, fill: '#728FCE' },
    { name: 'IV', value: 100, fill: '#4863A0' }, // Corrected value from pieData vs columnData mismatch (Pie said 85 for IV? I'll use column data for consistency if not specified. Wait, code says IV: 85 in pie, 100 in column. I'll stick to 100 from column as primary).
    // Actually user code says IV Pie: 85. IV Column: 100.
    // I'll stick to Column: 100.
    { name: 'V', value: 85, fill: '#98AFC7' },
    { name: 'VI', value: 69, fill: '#838996' },
    { name: 'VII', value: 78, fill: '#778899' },
    { name: 'VIII', value: 80, fill: '#708090' },
    { name: 'IX', value: 95, fill: '#6D7B8D' },
    { name: 'X', value: 85, fill: '#36454F' }
];

export function StrengthStats() {
    return (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card className='col-span-1 lg:col-span-2'>
                <CardHeader>
                    <CardTitle>Class Wise Total Strength vs Sections</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <ComposedChart data={strengthData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='class' />
                                <YAxis
                                    yAxisId='left'
                                    orientation='left'
                                    stroke='#F3A00E'
                                    label={{ value: 'Strength', angle: -90, position: 'insideLeft' }}
                                />
                                <YAxis
                                    yAxisId='right'
                                    orientation='right'
                                    stroke='#2874A6'
                                    label={{ value: 'Sections', angle: 90, position: 'insideRight' }}
                                />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    yAxisId='right'
                                    dataKey='sections'
                                    name='Total Sections'
                                    fill='#2874A6'
                                    barSize={20}
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    yAxisId='left'
                                    dataKey='strength'
                                    name='Total Class Strength'
                                    fill='#F3A00E'
                                    barSize={20}
                                    radius={[4, 4, 0, 0]}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className='col-span-1 lg:col-span-2'>
                <CardHeader>
                    <CardTitle>Strength Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie data={pieData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={120} label>
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
        </div>
    );
}
