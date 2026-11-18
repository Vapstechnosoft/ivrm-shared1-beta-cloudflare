'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    Activity,
    AlertTriangle,
    AreaChart,
    Award,
    BarChart,
    BarChart2,
    ChevronDown,
    GraduationCap,
    IndianRupee,
    MessageSquare,
    PieChart as PieIcon,
    TrendingUp,
    UserCheck,
    UserCog,
    Users2
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdmissionStats } from '@/components/visual-insights/admission-stats';
import { AttendanceStats } from '@/components/visual-insights/attendance-stats';
import { BirthdayStats } from '@/components/visual-insights/birthday-stats';
import { CoeStats } from '@/components/visual-insights/coe-stats';
import { ExamPerformanceStats } from '@/components/visual-insights/exam-performance-stats';
import { FeeAnalytics } from '@/components/visual-insights/fee-analytics';
import { FeeCollectionStats } from '@/components/visual-insights/fee-collection-stats';
import { FeeDefaulterStats } from '@/components/visual-insights/fee-defaulter-stats';
import { HeadWiseFeeStats } from '@/components/visual-insights/head-wise-fee-stats';
import { HrGenderStats } from '@/components/visual-insights/hr-gender-stats';
import { HrSalaryStats } from '@/components/visual-insights/hr-salary-stats';
import { SmsEmailStats } from '@/components/visual-insights/sms-email-stats';
import { StrengthStats } from '@/components/visual-insights/strength-stats';
import { StudentFeeStats } from '@/components/visual-insights/student-fee-stats';
import { YearAdmissionStats } from '@/components/visual-insights/year-admission-stats';
import { YearPerformanceStats } from '@/components/visual-insights/year-performance-stats';

export default function StatisticsGraphsPage() {
    const searchParams = useSearchParams();
    const queryTab = searchParams.get('tab');
    // Default to the first item alphabetically: Admissions -> Admission Status
    const defaultTab = queryTab || 'admission';
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Sync local state with URL query params changes
    useEffect(() => {
        if (queryTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab]);

    const isFeeActive = ['fees', 'defaulters', 'fee_analytics', 'head_fee', 'student_fee'].includes(activeTab);
    const isHrActive = ['hr_gender', 'hr_salary'].includes(activeTab);
    const isAdmissionActive = ['admission', 'year_admission'].includes(activeTab);
    const isPerformanceActive = ['exam_perf', 'year_perf'].includes(activeTab);

    return (
        <div className='container space-y-6 p-4'>
            <div className='mb-6 flex items-center gap-2'>
                <BarChart className='h-6 w-6 text-primary' />
                <h1 className='font-bold text-2xl'>Visual Insights: Statistics & Graphs</h1>
            </div>

            <p className='text-muted-foreground'>
                Explore comprehensive graphical reports and analytics. Select a category from the tabs below to view detailed insights on
                Fees, Admissions, Performance, HR, and more.
            </p>

            {/* Tabbed Reports */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
                <TabsList className='grid h-auto w-full grid-cols-2 gap-1 bg-muted p-1 md:grid-cols-5 lg:grid-cols-9'>
                    {/* 1. Admissions Dropdown Group */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                size='sm'
                                className={cn(
                                    'inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                    isAdmissionActive
                                        ? 'bg-background text-foreground shadow hover:bg-background'
                                        : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                                )}>
                                <GraduationCap className='mr-2 hidden h-4 w-4 xl:block' />
                                Admissions
                                <ChevronDown className='ml-1 h-3 w-3 opacity-50' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side='bottom' align='center' className='w-48'>
                            <DropdownMenuItem onClick={() => setActiveTab('admission')}>
                                <Activity className='mr-2 h-4 w-4' /> Admission Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('year_admission')}>
                                <BarChart2 className='mr-2 h-4 w-4' /> Year Wise Count
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 2. Attendance */}
                    <TabsTrigger value='attendance' className='flex w-full items-center justify-center gap-2'>
                        <UserCheck className='hidden h-4 w-4 xl:block' /> Attendance
                    </TabsTrigger>

                    {/* 3. B'day */}
                    <TabsTrigger value='birthday' className='flex w-full items-center justify-center gap-2'>
                        <PieIcon className='hidden h-4 w-4 xl:block' /> B'day
                    </TabsTrigger>

                    {/* 4. COE */}
                    <TabsTrigger value='coe' className='flex w-full items-center justify-center gap-2'>
                        <Award className='hidden h-4 w-4 xl:block' /> COE
                    </TabsTrigger>

                    {/* 5. Fees Dropdown Group */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                size='sm'
                                className={cn(
                                    'inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                    isFeeActive
                                        ? 'bg-background text-foreground shadow hover:bg-background'
                                        : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                                )}>
                                <IndianRupee className='mr-2 hidden h-4 w-4 xl:block' />
                                Fees
                                <ChevronDown className='ml-1 h-3 w-3 opacity-50' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side='bottom' align='center' className='w-48'>
                            <DropdownMenuItem onClick={() => setActiveTab('fees')}>
                                <IndianRupee className='mr-2 h-4 w-4' /> Fee Overview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('defaulters')}>
                                <AlertTriangle className='mr-2 h-4 w-4' /> Fee Defaulters
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('fee_analytics')}>
                                <TrendingUp className='mr-2 h-4 w-4' /> Collection Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('head_fee')}>
                                <BarChart2 className='mr-2 h-4 w-4' /> Head Wise Fee
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('student_fee')}>
                                <UserCheck className='mr-2 h-4 w-4' /> Student Fee Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 6. Performance Dropdown Group */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                size='sm'
                                className={cn(
                                    'inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                    isPerformanceActive
                                        ? 'bg-background text-foreground shadow hover:bg-background'
                                        : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                                )}>
                                <AreaChart className='mr-2 hidden h-4 w-4 xl:block' />
                                Performance
                                <ChevronDown className='ml-1 h-3 w-3 opacity-50' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side='bottom' align='center' className='w-48'>
                            <DropdownMenuItem onClick={() => setActiveTab('exam_perf')}>
                                <BarChart2 className='mr-2 h-4 w-4' /> Exam Wise
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('year_perf')}>
                                <TrendingUp className='mr-2 h-4 w-4' /> Year Wise Trend
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 7. SMS */}
                    <TabsTrigger value='sms' className='flex w-full items-center justify-center gap-2'>
                        <MessageSquare className='hidden h-4 w-4 xl:block' /> SMS
                    </TabsTrigger>

                    {/* 8. Staff & HR Dropdown Group */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                size='sm'
                                className={cn(
                                    'inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                    isHrActive
                                        ? 'bg-background text-foreground shadow hover:bg-background'
                                        : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
                                )}>
                                <UserCog className='mr-2 hidden h-4 w-4 xl:block' />
                                Staff & HR
                                <ChevronDown className='ml-1 h-3 w-3 opacity-50' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side='bottom' align='center' className='w-48'>
                            <DropdownMenuItem onClick={() => setActiveTab('hr_gender')}>
                                <Users2 className='mr-2 h-4 w-4' /> Gender Analysis
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveTab('hr_salary')}>
                                <IndianRupee className='mr-2 h-4 w-4' /> Salary Reports
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 9. Strength */}
                    <TabsTrigger value='strength' className='flex w-full items-center justify-center gap-2'>
                        <Users2 className='hidden h-4 w-4 xl:block' /> Strength
                    </TabsTrigger>
                </TabsList>

                {/* Content - Organized Alphabetically by Section */}

                {/* Admissions */}
                <TabsContent value='admission' className='space-y-4'>
                    <AdmissionStats />
                </TabsContent>
                <TabsContent value='year_admission' className='space-y-4'>
                    <YearAdmissionStats />
                </TabsContent>

                {/* Attendance */}
                <TabsContent value='attendance' className='space-y-4'>
                    <AttendanceStats />
                </TabsContent>

                {/* B'day */}
                <TabsContent value='birthday' className='space-y-4'>
                    <BirthdayStats />
                </TabsContent>

                {/* COE */}
                <TabsContent value='coe' className='space-y-4'>
                    <CoeStats />
                </TabsContent>

                {/* Fees */}
                <TabsContent value='fees' className='space-y-4'>
                    <FeeCollectionStats />
                </TabsContent>
                <TabsContent value='defaulters' className='space-y-4'>
                    <FeeDefaulterStats />
                </TabsContent>
                <TabsContent value='fee_analytics' className='space-y-4'>
                    <FeeAnalytics />
                </TabsContent>
                <TabsContent value='head_fee' className='space-y-4'>
                    <HeadWiseFeeStats />
                </TabsContent>
                <TabsContent value='student_fee' className='space-y-4'>
                    <StudentFeeStats />
                </TabsContent>

                {/* Performance */}
                <TabsContent value='exam_perf' className='space-y-4'>
                    <ExamPerformanceStats />
                </TabsContent>
                <TabsContent value='year_perf' className='space-y-4'>
                    <YearPerformanceStats />
                </TabsContent>

                {/* SMS */}
                <TabsContent value='sms' className='space-y-4'>
                    <SmsEmailStats />
                </TabsContent>

                {/* Staff & HR */}
                <TabsContent value='hr_gender' className='space-y-4'>
                    <HrGenderStats />
                </TabsContent>
                <TabsContent value='hr_salary' className='space-y-4'>
                    <HrSalaryStats />
                </TabsContent>

                {/* Strength */}
                <TabsContent value='strength' className='space-y-4'>
                    <StrengthStats />
                </TabsContent>
            </Tabs>
        </div>
    );
}
