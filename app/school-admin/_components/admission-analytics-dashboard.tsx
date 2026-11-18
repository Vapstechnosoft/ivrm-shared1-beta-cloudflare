'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Activity, ChevronRight, Lightbulb, TrendingUp, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAdmissionAnalytics } from './actions';

interface AnalyticsData {
    total_admissions: number;
    year_wise: { academic_year: string; total: number }[];
    class_wise: { ASMCL_ClassName: string; total: number }[];
    historical_admissions: { academic_year: string; total: number }[];
    funnel_analysis: { status: string }[];
    regression_values: number[];
    predicted_admissions: number;
    growth_status: string;
    ai_insight: string;
}

const COLORS = ['#6366f1', '#14b8a6', '#0ea5e9', '#f59e0b', '#84cc16', '#64748b'];
const FUNNEL_COLORS = ['bg-green-600', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-600', 'bg-red-500'];

const SectionHeader = ({ title, showViewAll = true }: { title: string; showViewAll?: boolean }) => (
    <div className='mb-4 flex items-center justify-between'>
        <h2 className='font-black text-slate-800 text-sm uppercase tracking-wider'>{title}</h2>
        {showViewAll && (
            <Button
                variant='ghost'
                size='sm'
                className='h-7 rounded-lg px-2 font-bold text-[10px] text-slate-400 hover:bg-slate-50 hover:text-slate-600'>
                View All <ChevronRight size={10} className='ml-0.5' />
            </Button>
        )}
    </div>
);

export function AdmissionAnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistoricalModal, setShowHistoricalModal] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await fetchAdmissionAnalytics();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch admission analytics', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className='flex h-48 w-full items-center justify-center rounded-2xl bg-white shadow-sm'>
                <p className='text-muted-foreground text-xs font-semibold'>Loading Analytics...</p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const lineChartData = data.year_wise.map((item, index) => ({
        name: item.academic_year,
        'Actual Admissions': item.total,
        'Predicted Admissions': Math.round(data.regression_values[index] || 0)
    }));

    // For Pie Chart, showing top 5 and grouping others to match screenshot style
    const sortedClasses = [...data.class_wise].sort((a, b) => b.total - a.total);
    const top5 = sortedClasses.slice(0, 5);
    const othersTotal = sortedClasses.slice(5).reduce((acc, curr) => acc + curr.total, 0);

    const pieData = [
        ...top5.map((item) => ({ name: item.ASMCL_ClassName, value: item.total })),
        ...(othersTotal > 0 ? [{ name: 'Others', value: othersTotal }] : [])
    ];

    const formatPercentage = (value: number) => {
        return ((value / data.total_admissions) * 100).toFixed(1) + '%';
    };

    return (
        <div className='mt-6 space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='font-black text-2xl text-slate-900 tracking-tight'>AI Dashboard Analytics</h2>
                    <p className='font-bold text-[11px] text-slate-400 uppercase tracking-wider'>
                        Comprehensive overview of admissions and trends
                    </p>
                </div>
            </div>

            {/* 4 Top Cards */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card className='card-premium rounded-3xl border-none bg-white p-5 shadow-sm'>
                    <div className='mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100'>
                        <Users size={16} className='text-slate-700' />
                    </div>
                    <p className='font-bold text-[11px] text-slate-400 uppercase tracking-wider'>Total Admissions</p>
                    <h3 className='mt-1 font-black text-3xl text-slate-900'>{data.total_admissions.toLocaleString()}</h3>
                    <p className='mt-4 font-bold text-[10px] text-slate-400'>All academic years</p>
                </Card>

                <Card className='card-premium rounded-3xl border-none bg-white p-5 shadow-sm'>
                    <div className='mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50'>
                        <TrendingUp size={16} className='text-red-500' />
                    </div>
                    <p className='font-bold text-[11px] text-slate-400 uppercase tracking-wider'>Predicted Admissions</p>
                    <h3 className='mt-1 font-black text-3xl text-slate-900'>{data.predicted_admissions}</h3>
                    <p className='mt-4 font-bold text-[10px] text-teal-500'>2027-2028</p>
                </Card>

                <Card className='card-premium rounded-3xl border-none bg-white p-5 shadow-sm'>
                    <div className='mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50'>
                        <Activity size={16} className='text-orange-500' />
                    </div>
                    <p className='font-bold text-[11px] text-slate-400 uppercase tracking-wider'>Growth Status</p>
                    <h3 className='mt-1 font-black text-3xl text-slate-900'>{data.growth_status}</h3>
                    <p className='mt-4 font-bold text-[10px] text-slate-400'>Compared to current trend</p>
                </Card>

                <Card className='rounded-3xl border border-sky-100 border-none bg-sky-50 p-5 shadow-sm'>
                    <div className='mb-2 flex items-center gap-2'>
                        <Lightbulb size={16} className='text-amber-500' />
                        <span className='font-bold text-slate-900 text-sm'>AI Insight</span>
                    </div>
                    <p className='mt-2 font-medium text-slate-700 text-sm leading-relaxed'>{data.ai_insight}</p>
                </Card>
            </div>

            {/* Middle Row Charts */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                {/* Linear Regression */}
                <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm lg:col-span-8'>
                    <SectionHeader title='Linear Regression Prediction' showViewAll={true} />
                    <div className='h-64'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                <XAxis
                                    dataKey='name'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                    interval='preserveStartEnd'
                                    minTickGap={30}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#1e293b',
                                        color: 'white'
                                    }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Line
                                    type='monotone'
                                    dataKey='Actual Admissions'
                                    stroke='#3b82f6'
                                    strokeWidth={2.5}
                                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type='monotone'
                                    dataKey='Predicted Admissions'
                                    stroke='#0f172a'
                                    strokeWidth={2}
                                    strokeDasharray='5 5'
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className='mt-4'>
                        <button
                            onClick={() => setShowHistoricalModal(true)}
                            className='font-bold text-[11px] text-indigo-500 hover:underline'>
                            View historical admissions &rarr;
                        </button>
                    </div>
                </Card>

                {/* Pie Chart */}
                <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm lg:col-span-4'>
                    <SectionHeader title='Class-wise Distribution' showViewAll={false} />
                    <div className='flex flex-col items-center'>
                        <div className='relative mb-4 h-48 w-48'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey='value'>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                                <span className='font-black text-slate-900 text-xl'>{data.total_admissions.toLocaleString()}</span>
                                <span className='font-bold text-[9px] text-slate-400'>Total</span>
                            </div>
                        </div>
                        <div className='w-full space-y-2'>
                            {pieData.map((item, index) => (
                                <div key={index} className='flex items-center justify-between text-xs'>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className='h-2.5 w-2.5 rounded-sm'
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className='font-bold text-slate-600'>{item.name}</span>
                                    </div>
                                    <div className='font-black text-slate-900'>
                                        {item.value.toLocaleString()}{' '}
                                        <span className='font-semibold text-slate-400'>({formatPercentage(item.value)})</span>
                                    </div>
                                </div>
                            ))}
                            <div className='mt-2 flex items-center justify-between border-slate-100 border-t pt-2 font-black text-sm'>
                                <span>Total</span>
                                <span>{data.total_admissions.toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                </Card>
            </div>

            {/* Bottom Row: Funnel */}
            <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm'>
                <SectionHeader title='Admission Funnel' showViewAll={false} />
                <div className='space-y-4 pr-10'>
                    {data.funnel_analysis.map((item, index) => {
                        const widthPercent = Math.max(100 - index * 20, 20); // 100%, 80%, 60%, 40%, 20%
                        const color = FUNNEL_COLORS[index % FUNNEL_COLORS.length];
                        return (
                            <div key={index} className='flex items-center gap-4'>
                                <span className='w-28 text-right font-black text-slate-700 text-xs uppercase tracking-wide'>
                                    {item.status}
                                </span>
                                <div className='h-10 flex-1 overflow-hidden rounded-lg bg-slate-100'>
                                    <div
                                        className={`h-full ${color} rounded-lg transition-all duration-1000`}
                                        style={{ width: `${widthPercent}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className='mt-6 border-slate-50 border-t pt-4 font-bold text-[9px] text-slate-400'>Powered by ML & AI insights v1.0.0</p>
            </Card>

            {/* Historical Admissions Modal */}
            {showHistoricalModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='zoom-in-95 w-full max-w-2xl animate-in overflow-hidden rounded-3xl bg-white shadow-xl duration-200'>
                        <div className='flex items-center justify-between border-slate-100 border-b p-6'>
                            <div>
                                <h3 className='font-black text-lg text-slate-900'>Historical Admissions</h3>
                                <p className='font-bold text-slate-400 text-xs'>Admissions recorded per academic year</p>
                            </div>
                            <button
                                onClick={() => setShowHistoricalModal(false)}
                                className='flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100'>
                                <X size={18} />
                            </button>
                        </div>
                        <div className='h-80 p-6'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <LineChart data={data.historical_admissions} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                    <XAxis
                                        dataKey='academic_year'
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                        minTickGap={30}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='total'
                                        stroke='#6366f1'
                                        strokeWidth={2.5}
                                        dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
