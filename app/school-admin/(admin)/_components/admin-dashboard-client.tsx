'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GetChairmanDashBoardFeesdata, GetTeacherCount, getDashboardCounts } from '@/server/dashboards/chairman-dashboard';
import {
    Bell,
    Briefcase,
    Building2,
    Calendar,
    ChevronRight,
    CreditCard,
    FileText,
    GraduationCap,
    UserCircle,
    Users,
    Wallet
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { AdmissionAnalyticsDashboard } from '../../_components/admission-analytics-dashboard';
import { PrincipalAssistant } from '../../_components/principal-assistant';

// --- Data & Constants ---

export interface StatItem {
    title: string;
    value: string | number;
    icon: any;
    gradient: string;
    badgeIcon: any;
    url?: string;
}

const performanceData = [
    { name: 'Mon', value: 30 },
    { name: 'Tue', value: 45 },
    { name: 'Wed', value: 65 },
    { name: 'Thu', value: 55 },
    { name: 'Fri', value: 85 }
];

const feeOverviewData = [
    { name: 'Jan 22', upcoming: 200, overdue: 150, unpaid: 100 },
    { name: 'Feb 22', upcoming: 180, overdue: 210, unpaid: 130 },
    { name: 'Mar 36', upcoming: 250, overdue: 190, unpaid: 170 },
    { name: 'Apr 35', upcoming: 220, overdue: 230, unpaid: 150 }
];

const miniFeeData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 450 },
    { name: 'Apr', value: 700 },
    { name: 'May', value: 550 },
    { name: 'Jun', value: 800 },
    { name: 'Jul', value: 650 },
    { name: 'Aug', value: 900 },
    { name: 'Sep', value: 750 }
];

const announcements = [
    { title: 'New Circulars', date: 'April 24, 2024', status: 'New', color: 'bg-indigo-600' },
    { title: 'Upcoming Exam Timetable', date: 'April 20, 2024', status: 'Released', color: 'bg-orange-500' },
    { title: 'Library Renovation', date: 'April 16, 2024', status: 'Completed', color: 'bg-emerald-500' }
];

const pendingApplications = [
    { name: 'Akash Verma', id: 'STU-02341', class: 'LKG', status: 'Pending', date: 'April 25, 2024' },
    { name: 'Kavya Jadhav', id: 'STU-01782', class: 'II STD', status: 'Pending', date: 'April 22, 2024' },
    { name: 'Sandeep Reddy', id: 'STU-02356', class: 'IV STD', status: 'Pending', date: 'April 21, 2024' }
];

const events = [
    { title: 'Parent-Teacher Meeting', date: 'April 25, 2024', scheduled: 'April 29, 2024' },
    { title: 'Annual Sports Day', date: 'April 30, 2024', status: 'New' },
    { title: 'Science Exhibition', date: 'May 05, 2024', scheduled: 'May 10, 2024' }
];

// --- Sub-Components ---

const StatCard = ({ item }: { item: StatItem }) => {
    const CardContentUI = (
        <Card className='group card-premium cursor-pointer overflow-hidden rounded-2xl border-none shadow-lg transition-all duration-500 hover:scale-[1.01]'>
            <CardContent className='flex h-full p-0'>
                <div className={cn('flex w-14 items-center justify-center bg-gradient-to-b text-white', item.gradient)}>
                    <item.icon size={22} strokeWidth={2.5} />
                </div>
                <div className='flex flex-1 items-center justify-between p-4'>
                    <div>
                        <p className='font-bold text-[10px] text-slate-500 uppercase tracking-widest'>{item.title}</p>
                        <h3 className='mt-0.5 font-black text-slate-900 text-xl'>{item.value}</h3>
                    </div>
                    <div className='rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-600'>
                        <item.badgeIcon size={16} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (item.url) {
        return (
            <Link href={item.url} className='block no-underline'>
                {CardContentUI}
            </Link>
        );
    }

    return CardContentUI;
};

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

interface AdminDashboardClientProps {
    initialDashboardData?: any;
    initialTeachers?: number | null;
    initialTotalFeeCollected?: number;
    initialFeeDetailsData?: any[];
}

export function AdminDashboardClient({
    initialDashboardData = null,
    initialTeachers = null,
    initialTotalFeeCollected = 0,
    initialFeeDetailsData = []
}: AdminDashboardClientProps) {
    const [dashboardData, setDashboardData] = useState<any>(initialDashboardData);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const [feeDetailsData, setFeeDetailsData] = useState<any[]>(initialFeeDetailsData);
    const [teachers, setTeachers] = useState<any>(initialTeachers);
    const [totalFeeCollected, setTotalFeeCollected] = useState<number>(initialTotalFeeCollected);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [response, feesResponse, teacherResponse] = await Promise.allSettled([
                    getDashboardCounts(),
                    GetChairmanDashBoardFeesdata(),
                    GetTeacherCount()
                ]);

                if (teacherResponse.status === 'fulfilled') {
                    const teacherResult = teacherResponse.value?.data;
                    const teacherData = Array.isArray(teacherResult) ? teacherResult[0] : teacherResult;
                    const totalTeachers = teacherData?.activeEmp?.length || 0;
                    setTeachers(totalTeachers);
                }

                if (response.status === 'fulfilled') {
                    const countResult = response.value;
                    const finalData = countResult?.data ? countResult.data : countResult;
                    setDashboardData(finalData);
                }

                if (feesResponse.status === 'fulfilled') {
                    const feesResult = feesResponse.value;
                    const feesDataArray = feesResult?.data || [];
                    if (Array.isArray(feesDataArray)) {
                        const totalCollected = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.callected || 0), 0);
                        setTotalFeeCollected(totalCollected);

                        const mappedFees = feesDataArray.map((item: any) => ({
                            name: item.classname || 'Unknown',
                            Collected: item.callected || 0,
                            Receivable: item.receivable || 0,
                            Balance: item.ballance || 0
                        }));
                        setFeeDetailsData(mappedFees);
                    }
                }
            } catch (error) {
                console.error('Error fetching dashboard counts:', error);
            }
        };

        fetchData();
    }, []);

    const applicationsCount = dashboardData?.applicationsCount ?? initialDashboardData?.applicationsCount ?? 0;
    const studentsCount = dashboardData?.studentCount ?? initialDashboardData?.studentCount ?? 0;
    const teachersCount = teachers ?? initialTeachers ?? 0;
    const feeCollected = totalFeeCollected || initialTotalFeeCollected || 0;

    const statsData: StatItem[] = [
        {
            title: 'Applications',
            value: applicationsCount,
            icon: FileText,
            gradient: 'from-blue-600 to-indigo-600',
            badgeIcon: Briefcase,
            url: '/admission/preadmission/reports/admission-register'
        },
        {
            title: 'Students',
            value: studentsCount,
            icon: Users,
            gradient: 'from-orange-500 to-amber-600',
            badgeIcon: UserCircle,
            url: '/admission/preadmission/reports/class-wise-student-details'
        },
        {
            title: 'Teachers',
            value: teachersCount,
            icon: GraduationCap,
            gradient: 'from-teal-500 to-emerald-600',
            badgeIcon: Building2,
            url: '/hrms/employee'
        },
        {
            title: 'Fee Collection',
            value: `₹${feeCollected.toLocaleString('en-IN')}`,
            icon: Wallet,
            gradient: 'from-purple-600 to-violet-600',
            badgeIcon: CreditCard,
            url: '/fees/feereports/feeconsolidatedreport'
        }
    ];

    return (
        <div className='fade-in animate-in space-y-6 pb-12 duration-700'>
            {/* Top Bar */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='font-black text-lg text-slate-900 tracking-tight'>System Overview</h2>
                    <p className='font-bold text-[11px] text-slate-400 uppercase tracking-wider'>Metrics & Analytics</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {statsData.map((item, i) => (
                    <StatCard key={i} item={item} />
                ))}
            </div>

            {/* Principal AI Assistant */}
            <PrincipalAssistant />

            <AdmissionAnalyticsDashboard />

            {false && (
                <>
                    {/* Middle Section: Overview & Charts */}
                    <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* Performance Overview */}
                        <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm lg:col-span-4'>
                            <SectionHeader title='Performance Overview' showViewAll={false} />
                            <div className='relative mt-2 flex flex-col items-center justify-center'>
                                <div className='h-48 w-48'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <PieChart>
                                            <Pie
                                                data={[{ value: 96.8 }, { value: 3.2 }]}
                                                innerRadius={60}
                                                outerRadius={75}
                                                startAngle={90}
                                                endAngle={450}
                                                paddingAngle={0}
                                                dataKey='value'>
                                                <Cell fill='url(#purpleGradient)' stroke='none' />
                                                <Cell fill='#f1f5f9' stroke='none' />
                                            </Pie>
                                            <defs>
                                                <linearGradient id='purpleGradient' x1='0' y1='0' x2='1' y2='0'>
                                                    <stop offset='0%' stopColor='#f97316' />
                                                    <stop offset='100%' stopColor='#8b5cf6' />
                                                </linearGradient>
                                            </defs>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className='absolute inset-0 flex flex-col items-center justify-center'>
                                        <span className='font-black text-2xl text-slate-900'>96.8%</span>
                                    </div>
                                </div>
                                <div className='mt-2 h-16 w-full'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <LineChart data={performanceData}>
                                            <Line
                                                type='monotone'
                                                dataKey='value'
                                                stroke='#8b5cf6'
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>

                        {/* Fee Collection Overview */}
                        <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm lg:col-span-5'>
                            <SectionHeader title='Fee Trends' />
                            <div className='mt-2 h-60'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <LineChart data={feeOverviewData}>
                                        <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                        <XAxis
                                            dataKey='name'
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)',
                                                fontSize: '10px'
                                            }}
                                        />
                                        <Line type='monotone' dataKey='upcoming' stroke='#8b5cf6' strokeWidth={2.5} dot={{ r: 3 }} />
                                        <Line type='monotone' dataKey='overdue' stroke='#f97316' strokeWidth={2.5} dot={{ r: 3 }} />
                                        <Line type='monotone' dataKey='unpaid' stroke='#10b981' strokeWidth={2.5} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className='mt-4 flex items-center justify-center gap-4'>
                                <div className='flex items-center gap-1.5'>
                                    <div className='h-2 w-2 rounded-full bg-violet-500' />
                                    <span className='font-bold text-[10px] text-slate-500'>Upcoming</span>
                                </div>
                                <div className='flex items-center gap-1.5'>
                                    <div className='h-2 w-2 rounded-full bg-orange-500' />
                                    <span className='font-bold text-[10px] text-slate-500'>Overdue</span>
                                </div>
                                <div className='flex items-center gap-1.5'>
                                    <div className='h-2 w-2 rounded-full bg-emerald-500' />
                                    <span className='font-bold text-[10px] text-slate-500'>Unpaid</span>
                                </div>
                            </div>
                        </Card>

                        {/* Announcements */}
                        <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm lg:col-span-3'>
                            <SectionHeader title='Notices' />
                            <div className='space-y-4'>
                                {announcements.map((item, i) => (
                                    <div key={i} className='group flex cursor-pointer gap-3'>
                                        <div
                                            className={cn(
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-slate-100 transition-all group-hover:scale-105',
                                                item.color
                                            )}>
                                            <Bell size={16} />
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center justify-between gap-2'>
                                                <p className='truncate font-black text-[11px] text-slate-900 leading-tight'>{item.title}</p>
                                                <Badge
                                                    variant='outline'
                                                    className='h-4 shrink-0 border-slate-100 px-1 font-black text-[8px] uppercase tracking-tighter'
                                                    toolTip={`Action required: ${item.status === 'New' ? 'Review this circular immediately.' : 'Already released to public.'}`}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <p className='mt-0.5 font-bold text-[9px] text-slate-400'>{item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Bottom Section */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* Pending Student Applications */}
                        <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm lg:col-span-7'>
                            <SectionHeader title='Student Applications' />
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left'>
                                    <thead>
                                        <tr className='border-slate-50 border-b font-black text-[10px] text-slate-400 uppercase tracking-widest'>
                                            <th className='pb-3'>Student</th>
                                            <th className='pb-3'>Class</th>
                                            <th className='pb-3 text-center'>Status</th>
                                            <th className='pb-3'>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-50'>
                                        {pendingApplications.map((app, i) => (
                                            <tr key={i} className='group transition-colors hover:bg-slate-50/50'>
                                                <td className='py-3'>
                                                    <p className='font-black text-slate-900 text-xs'>{app.name}</p>
                                                    <p className='font-bold text-[9px] text-slate-400 uppercase tracking-wider'>{app.id}</p>
                                                </td>
                                                <td className='py-3 font-bold text-slate-600 text-xs'>{app.class}</td>
                                                <td className='py-3 text-center'>
                                                    <Badge
                                                        className='rounded-md border-none bg-orange-50 px-2 py-0.5 font-black text-[9px] text-orange-600'
                                                        toolTip="Verification in progress. Awaiting principal's final approval.">
                                                        {app.status}
                                                    </Badge>
                                                </td>
                                                <td className='py-3 font-black text-[10px] text-slate-400'>{app.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Right Side Widgets */}
                        <div className='space-y-6 lg:col-span-5'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                {/* Staff Overview */}
                                <Card className='card-premium rounded-3xl border-none bg-white p-5 shadow-sm'>
                                    <SectionHeader title='Staff' showViewAll={false} />
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div className='flex flex-col items-center rounded-2xl bg-slate-50 p-3'>
                                            <div className='mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600'>
                                                <Users size={14} />
                                            </div>
                                            <span className='font-black text-slate-900 text-xl'>35</span>
                                            <span className='font-bold text-[9px] text-slate-400 uppercase'>On Duty</span>
                                        </div>
                                        <div className='flex flex-col items-center rounded-2xl bg-slate-50 p-3'>
                                            <div className='mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600'>
                                                <UserCircle size={14} />
                                            </div>
                                            <span className='font-black text-slate-900 text-xl'>5</span>
                                            <span className='font-bold text-[9px] text-slate-400 uppercase'>On Leave</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Mini Fee Chart */}
                                <Card className='card-premium rounded-3xl border-none bg-white p-5 shadow-sm'>
                                    <SectionHeader title='Revenue' showViewAll={false} />
                                    <div className='h-20'>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <AreaChart data={miniFeeData}>
                                                <Area
                                                    type='monotone'
                                                    dataKey='value'
                                                    stroke='#8b5cf6'
                                                    fill='#8b5cf6'
                                                    fillOpacity={0.15}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className='mt-2 text-center font-bold text-[9px] text-slate-400'>Daily Fee Collection</p>
                                </Card>
                            </div>

                            {/* Upcoming Events */}
                            <Card className='card-premium rounded-3xl border-none bg-white p-6 shadow-sm'>
                                <SectionHeader title='Calendar Events' />
                                <div className='scrollbar-hide flex gap-4 overflow-x-auto pb-2'>
                                    {events.map((ev, i) => (
                                        <div
                                            key={i}
                                            className='flex min-w-[220px] flex-col justify-between rounded-[20px] border border-slate-100 bg-slate-50 p-4'>
                                            <div>
                                                <div className='mb-1.5 flex items-center justify-between'>
                                                    <Badge
                                                        variant='outline'
                                                        className='px-1.5 py-0 font-black text-[8px] uppercase tracking-tighter'>
                                                        Event
                                                    </Badge>
                                                    {ev.status && (
                                                        <Badge className='border-none bg-indigo-600 px-1.5 py-0 text-[8px] text-white'>
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className='line-clamp-1 font-black text-slate-900 text-sm leading-tight'>{ev.title}</h4>
                                            </div>
                                            <div className='mt-4 flex items-center justify-between'>
                                                <div className='flex items-center gap-1.5'>
                                                    <Calendar size={12} className='text-indigo-600' />
                                                    <span className='font-black text-[10px] text-slate-400'>{ev.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
