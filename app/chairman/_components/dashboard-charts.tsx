'use client';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function StudentStrengthChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                    angle={-45}
                    textAnchor='end'
                    interval={0}
                    height={60}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Bar dataKey='value' radius={[8, 8, 0, 0]} barSize={28}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function EmployeeStrengthChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                    angle={-45}
                    textAnchor='end'
                    interval={0}
                    height={60}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Bar dataKey='value' fill='#3b82f6' radius={[8, 8, 0, 0]} barSize={28}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function FeeDetailsChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                    height={40}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
                    tickFormatter={(val) => `₹${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.14)',
                        fontWeight: 800
                    }}
                />
                <Legend
                    verticalAlign='top'
                    align='right'
                    iconType='circle'
                    wrapperStyle={{
                        paddingBottom: '30px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                />
                <Bar dataKey='Collected' fill='#10b981' radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey='Receivable' fill='#f59e0b' radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey='Balance' fill='#ef4444' radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
        </ResponsiveContainer>
    );
}
