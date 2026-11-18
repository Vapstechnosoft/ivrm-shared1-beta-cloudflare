'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    Bell,
    ChevronRight,
    DollarSign,
    Download,
    Mail,
    MessageSquare,
    MoreHorizontal,
    UserMinus,
    Users,
    Wallet
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

const StudentStrengthChart = dynamic(() => import('./_components/dashboard-charts').then((mod) => mod.StudentStrengthChart), {
    ssr: false
});
const EmployeeStrengthChart = dynamic(() => import('./_components/dashboard-charts').then((mod) => mod.EmployeeStrengthChart), {
    ssr: false
});
const FeeDetailsChart = dynamic(() => import('./_components/dashboard-charts').then((mod) => mod.FeeDetailsChart), { ssr: false });
import { cn } from '@/lib/utils';
import { GetChairmanDashBoardFeesdata, getDashboardCounts } from '@/server/dashboards/chairman-dashboard';
// --- Data from Reference Images ---

const studentStrengthData = [
    { name: 'PCMB', value: 280, color: '#06b6d4' },
    { name: 'PCMC', value: 290, color: '#ef4444' },
    { name: 'CEBA', value: 245, color: '#8b5cf6' },
    { name: 'SEBA', value: 232, color: '#84cc16' },
    { name: 'HEBA', value: 218, color: '#22d3ee' },
    { name: 'SBAC', value: 202, color: '#f59e0b' },
    { name: 'MSBA', value: 188, color: '#ec4899' },
    { name: 'I PUC MSBA', value: 85, color: '#6366f1' },
    { name: 'II PUC PCMC', value: 92, color: '#4f46e5' }
];

const employeeStrengthData = [
    { name: 'Lecturer', value: 148, color: '#3b82f6' },
    { name: 'Office Admin', value: 28, color: '#8b5cf6' },
    { name: 'Accountant', value: 12, color: '#06b6d4' },
    { name: 'Principal', value: 8, color: '#10b981' },
    { name: 'Receptionist', value: 5, color: '#ec4899' },
    { name: 'Staff', value: 45, color: '#f59e0b' },
    { name: 'SDA', value: 15, color: '#6366f1' },
    { name: 'Attender', value: 10, color: '#ef4444' }
];

const eventDetails = [
    { id: 1, event: 'Annual Sports Meet', month: 'February', start: '2026-02-24', end: '2026-02-26' },
    { id: 2, event: 'Science Exhibition', month: 'February', start: '2026-02-28', end: '2026-03-01' }
];

// --- Sub-Components ---

const StatCard = ({ item }: { item: any }) => (
    <Card
        className={cn(
            'group card-premium relative overflow-hidden rounded-3xl border-none shadow-xl transition-all duration-500 hover:scale-[1.02]',
            item.glow
        )}>
        <CardContent className='p-6'>
            <div className='mb-6 flex items-center justify-between'>
                <div className={cn('rounded-2xl p-4', item.bg)}>
                    <item.icon className={item.color} size={24} />
                </div>
                <div className='flex flex-col items-end'>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                    <button className='group/btn flex items-center gap-1 font-black text-[10px] text-slate-400 uppercase tracking-widest transition-colors hover:text-primary'>
                        More info <ChevronRight size={12} className='transition-transform group-hover/btn:translate-x-0.5' />
                    </button>
                </div>
            </div>
            <div>
                <p className='mb-1 font-bold text-[10px] text-slate-500 uppercase tracking-[0.15em]'>{item.title}</p>
                {item.subtitle && <p className='mb-2 font-black text-[9px] text-slate-400 uppercase'>{item.subtitle}</p>}
                <h3 className='font-black text-2xl text-slate-900 tracking-tight'>{item.value}</h3>
            </div>

            {/* Background Decorative Element */}
            <div
                className={cn('-right-4 -bottom-4 absolute opacity-5 transition-transform duration-700 group-hover:scale-110', item.color)}>
                <item.icon size={120} />
            </div>
        </CardContent>
    </Card>
);

const ChartCard = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
    <Card className={cn('card-premium rounded-[32px] border-none bg-white shadow-premium', className)}>
        <CardHeader className='px-8 pt-8 pb-4'>
            <div className='flex items-center justify-between'>
                <CardTitle className='font-black text-slate-900 text-sm uppercase tracking-[0.1em]'>{title}</CardTitle>
                <div className='flex gap-2'>
                    <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600'>
                        <Download size={14} />
                    </Button>
                    <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600'>
                        <MoreHorizontal size={14} />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className='px-8 pb-8'>{children}</CardContent>
    </Card>
);

export default function ChairmanDashboard() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [feeDetailsData, setFeeDetailsData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            console.log('fetching preadmission data');
            try {
                const response = await getDashboardCounts();
                const feesResponse = await GetChairmanDashBoardFeesdata(231);
                console.log('preadmission data raw response', response);

                // If the response has a data property (nested wrapper), use it, otherwise use the response itself
                const finalData = response?.data ? response.data : response;

                console.log('preadmission final data', finalData);
                setDashboardData(finalData);

                // Format fees data specifically for the FeeDetailsChart
                const feesDataArray = feesResponse?.data || [];
                if (Array.isArray(feesDataArray)) {
                    console.log('feesDataArray', feesDataArray);
                    const mappedFees = feesDataArray.map((item: any) => ({
                        name: item.classname || 'Unknown',
                        Collected: item.callected || 0,
                        Receivable: item.receivable || 0,
                        Balance: item.ballance || 0
                    }));
                    setFeeDetailsData(mappedFees);
                    console.log('mappedFees', mappedFees);
                }
            } catch (error) {
                console.error('Error fetching dashboard counts:', error);
            }
        };

        fetchData();
    }, []);

    const statsCards = [
        {
            title: 'SMS SENT FROM PRINCIPAL',
            value: '0',
            icon: MessageSquare,
            color: 'text-cyan-600',
            bg: 'bg-cyan-500/10',
            glow: 'shadow-cyan-500/20'
        },
        {
            title: 'EMAIL SENT FROM PRINCIPAL',
            value: '0',
            icon: Mail,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10',
            glow: 'shadow-emerald-500/20'
        },
        {
            title: 'Total Collected Fee',
            value: '₹ 19,54,75,970',
            icon: DollarSign,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10',
            glow: 'shadow-amber-500/20'
        },

        {
            title: 'Total Student',
            value: dashboardData?.studentCount ?? '0',
            icon: Users,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10',
            glow: 'shadow-rose-500/20'
        },

        {
            title: 'Over All Institution Collected Fee',
            value: '₹ 25.4M',
            icon: Wallet,
            color: 'text-indigo-600',
            bg: 'bg-indigo-500/10',
            glow: 'shadow-indigo-500/20'
        },
        {
            title: 'STUDENT ABSENT',
            subtitle: '(Feb 21, 2026)',
            value: '142',
            icon: UserMinus,
            color: 'text-green-700',
            bg: 'bg-green-600/10',
            glow: 'shadow-green-500/20'
        }
    ];

    return (
        <div className='fade-in slide-in-from-bottom-6 animate-in space-y-10 pb-20 duration-1000'>
            {/* Header Section */}
            <div className='flex flex-col justify-between gap-6 px-2 md:flex-row md:items-center'>
                <div>
                    <h1 className='font-black text-4xl text-slate-900 tracking-tighter'>
                        Chairman <span className='text-primary italic'>Dashboard</span>
                    </h1>
                    <div className='mt-2 flex items-center gap-2 font-bold text-slate-400 text-xs uppercase tracking-[0.2em]'>
                        Institutional Strategic Overview <div className='h-1 w-1 rounded-full bg-slate-300' /> Feb 21, 2026
                    </div>
                </div>

                <div className='flex items-center gap-4 rounded-2xl border border-white/50 bg-white/50 p-2 shadow-sm backdrop-blur-sm'>
                    <div className='-space-x-3 flex'>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 font-black text-[11px] text-slate-600 shadow-sm'>
                                {`U${i}`}
                            </div>
                        ))}
                    </div>
                    <Button className='flex h-12 items-center gap-2 rounded-xl bg-slate-900 px-6 font-black text-white text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800'>
                        <Bell size={18} className='text-amber-400' /> Notifications
                    </Button>
                </div>
            </div>

            {/* Top Stats Grid (6 cards) */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
                {statsCards.map((stat, i) => (
                    <StatCard key={i} item={stat} />
                ))}
            </div>

            {/* Middle Section: Strength Charts */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                {/* Student Strength */}
                <ChartCard title='Student Strength Academic Year 2025-2026'>
                    <div className='mt-6 h-[380px]'>
                        <StudentStrengthChart data={studentStrengthData} />
                    </div>
                </ChartCard>

                {/* Employee Strength */}
                <ChartCard title='Employee Role-wise Strength'>
                    <div className='mt-6 h-[380px]'>
                        <EmployeeStrengthChart data={employeeStrengthData} />
                    </div>
                </ChartCard>
            </div>

            {/* Lower Section: Fee Details & Events */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
                {/* Fee Details Grouped Bar Chart */}
                <ChartCard title='Classwise Fee Details 2025-2026' className='lg:col-span-8'>
                    <div className='mt-8 h-[400px]'>
                        <FeeDetailsChart data={feeDetailsData} />
                    </div>
                </ChartCard>

                {/* Event Details Table */}
                <ChartCard title='Current Month Event Details' className='overflow-hidden lg:col-span-4'>
                    <div className='mt-6 overflow-hidden rounded-2xl border border-slate-100'>
                        <table className='w-full text-left'>
                            <thead>
                                <tr className='border-slate-100 border-b bg-slate-50'>
                                    <th className='whitespace-nowrap px-5 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest'>
                                        SL.NO
                                    </th>
                                    <th className='px-5 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest'>Event</th>
                                    <th className='px-5 py-4 font-black text-[10px] text-slate-500 uppercase tracking-widest'>
                                        Start Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventDetails.map((event, idx) => (
                                    <tr
                                        key={event.id}
                                        className='group border-slate-50 border-b transition-colors last:border-0 hover:bg-slate-50/50'>
                                        <td className='px-5 py-4 font-black text-slate-400 text-xs'>0{idx + 1}</td>
                                        <td className='px-5 py-4 font-black text-slate-900 text-xs transition-colors group-hover:text-primary'>
                                            {event.event}
                                        </td>
                                        <td className='px-5 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-tighter'>
                                            Feb {event.start.split('-')[2]}
                                        </td>
                                    </tr>
                                ))}
                                {eventDetails.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className='px-5 py-12 text-center font-bold text-slate-400 text-sm italic'>
                                            No events scheduled for this month
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='mt-8 flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/5 p-4'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white'>
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className='font-black text-[10px] text-slate-600 uppercase'>Upcoming Audit</p>
                                <p className='font-bold text-[9px] text-slate-400 uppercase'>March 05, 2026</p>
                            </div>
                        </div>
                        <Button size='sm' variant='ghost' className='h-8 w-8 rounded-full text-primary hover:bg-primary/10'>
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}
