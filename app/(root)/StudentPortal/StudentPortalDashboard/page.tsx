'use client';

import {
    Atom,
    BookMarked,
    BookOpen,
    Calculator,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    Globe,
    GraduationCap,
    Languages,
    Trophy,
    Wallet
} from 'lucide-react';
import { useState } from 'react';
import { PerformanceDonut, PerformanceSparkline, SubjectRadarChart } from './_components/dashboard-charts';
import {
    AnnouncementItem,
    AssignmentItem,
    DashboardStatCard,
    EventCard,
    LibraryStatus,
    RecentResultsTable,
    ReservationHistoryModal,
    SectionHeader,
    TimetableRow
} from './_components/dashboard-widgets';

// Mock Data
const announcements: any[] = [
    { title: 'Pre-Board Examination', date: 'Due in 3 days', status: 'Due', icon: <FileText className='h-5 w-5' />, color: 'bg-rose-500' },
    { title: 'New Study Materials', date: 'April 20, 2024', status: 'New', icon: <BookOpen className='h-5 w-5' />, color: 'bg-indigo-600' },
    {
        title: 'Annual Sports Meet',
        date: 'April 16, 2024',
        status: 'Released',
        icon: <Trophy className='h-5 w-5' />,
        color: 'bg-orange-500'
    }
];

const myHomework = [
    { subject: 'Math', task: 'Quadratic Equations Worksheet', dueDate: 'Tomorrow', progress: 85, color: 'bg-indigo-600' },
    { subject: 'Science', task: 'Photosynthesis Lab Report', dueDate: 'April 28', progress: 40, color: 'bg-teal-600' },
    { subject: 'English', task: 'Poetry Analysis Essay', dueDate: 'May 02', progress: 10, color: 'bg-orange-500' }
];

const todayClasses = [
    {
        time: '09:00 AM',
        subject: 'Mathematics',
        teacher: 'Ananya Sharma',
        icon: <Calculator className='h-5 w-5' />,
        color: 'bg-indigo-600'
    },
    { time: '10:30 AM', subject: 'Physics', teacher: 'Prof. Rajesh Kumar', icon: <Atom className='h-5 w-5' />, color: 'bg-teal-600' },
    { time: '12:00 PM', subject: 'English', teacher: 'Ms. Priya Varma', icon: <Languages className='h-5 w-5' />, color: 'bg-orange-500' },
    { time: '02:00 PM', subject: 'History', teacher: 'Mr. Amit Patel', icon: <Globe className='h-5 w-5' />, color: 'bg-rose-500' }
];

const recentResults = [
    { subject: 'Mathematics', exam: 'Mid-Term', marks: 88, total: 100, grade: 'A' },
    { subject: 'Science', exam: 'Mid-Term', marks: 95, total: 100, grade: 'A+' },
    { subject: 'History', exam: 'Unit Test 2', marks: 45, total: 50, grade: 'A' }
];

const libraryBooks = [{ title: 'Advanced Calculus', dueDate: 'April 30, 2024' }];

export default function StudentPortalDashboard() {
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    return (
        <div className='min-h-screen space-y-8 bg-[#f8f9ff] p-8'>
            {/* Student Header */}
            <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                <div>
                    <h1 className='font-black text-3xl text-slate-800 tracking-tight'>Student Dashboard</h1>
                    <p className='font-medium text-slate-500'>Academic Year 2024-25 | Class 10-A</p>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='hidden text-right sm:block'>
                        <div className='font-bold text-lg text-slate-800'>Abhiram H B</div>
                        <div className='font-black text-indigo-600 text-xs uppercase tracking-widest'>ID: 2024001</div>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg'>
                        <GraduationCap className='h-6 w-6' />
                    </div>
                </div>
            </div>

            {/* My Stats */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                <DashboardStatCard
                    title='My Attendance'
                    value='92.4%'
                    icon={<ClipboardCheck className='h-6 w-6' />}
                    color='bg-indigo-600'
                    secondaryIcon={<CheckCircle2 className='h-24 w-24' />}
                />
                <DashboardStatCard
                    title='Current Rank'
                    value='04 / 45'
                    icon={<Trophy className='h-6 w-6' />}
                    color='bg-orange-500'
                    secondaryIcon={<Trophy className='h-24 w-24' />}
                />
                <DashboardStatCard
                    title='Average Grade'
                    value='A+ (9.2)'
                    icon={<GraduationCap className='h-6 w-6' />}
                    color='bg-teal-600'
                    secondaryIcon={<Trophy className='h-24 w-24' />}
                />
                <DashboardStatCard
                    title='Fee Balance'
                    value='₹12,500'
                    icon={<Wallet className='h-6 w-6' />}
                    color='bg-rose-500'
                    secondaryIcon={<Wallet className='h-24 w-24' />}
                />
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
                {/* Left Column: Schedule & Performance */}
                <div className='space-y-8 lg:col-span-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Attendance Trend */}
                        <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                            <SectionHeader title='Attendance Overview' />
                            <PerformanceDonut />
                            <div className='mt-8'>
                                <div className='mb-4 flex items-center justify-between'>
                                    <span className='font-bold text-slate-400 text-xs uppercase tracking-wider'>Weekly Attendance</span>
                                    <span className='text-[10px] text-slate-300'>April 2024</span>
                                </div>
                                <PerformanceSparkline />
                            </div>
                        </div>

                        {/* Subject Performance */}
                        <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                            <SectionHeader title='Subject Proficiency' />
                            <SubjectRadarChart />
                            <div className='mt-2 text-center'>
                                <p className='text-wrap font-bold text-[10px] text-slate-400 uppercase tracking-widest'>
                                    Proficiency levels across core subjects
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Timetable */}
                    <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                        <SectionHeader title="Today's Timetable" onActionClick={() => {}} actionLabel='Full Schedule' />
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {todayClasses.map((cls, idx) => (
                                <TimetableRow key={idx} {...cls} />
                            ))}
                        </div>
                    </div>

                    {/* Lower Left Combined Grid */}
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Recent Exam Results */}
                        <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                            <SectionHeader title='Recent Results' onActionClick={() => {}} />
                            <RecentResultsTable data={recentResults} />
                        </div>

                        {/* Upcoming Events (Moved here from Right) */}
                        <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                            <SectionHeader title='Upcoming Events' onActionClick={() => {}} />
                            <div className='space-y-3'>
                                <EventCard dateRange='April 25 - 29' title='Inter-School Tech Fest' isNew />
                                <EventCard dateRange='May 05' title='Annual Parents Day' />
                                <EventCard dateRange='May 12' title='Summer Camp Registration' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Homework & Alerts */}
                <div className='space-y-8 lg:col-span-4'>
                    {/* My Homework */}
                    <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                        <SectionHeader title='My Assignments' onActionClick={() => {}} />
                        <div className='space-y-4'>
                            {myHomework.map((hw, idx) => (
                                <AssignmentItem key={idx} {...hw} />
                            ))}
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                        <SectionHeader title='Recent Alerts' onActionClick={() => {}} />
                        <div className='space-y-4'>
                            {announcements.map((ann, idx) => (
                                <AnnouncementItem key={idx} {...ann} />
                            ))}
                        </div>
                    </div>

                    {/* Library Resources (New Section) */}
                    <div className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm'>
                        <SectionHeader title='Library Status' onActionClick={() => {}} actionLabel='Explore' />
                        <div className='space-y-3'>
                            {libraryBooks.map((book, idx) => (
                                <LibraryStatus key={idx} {...book} />
                            ))}
                            <div className='border-slate-50 border-t pt-4'>
                                <div className='mb-2 flex items-center justify-between font-black text-[10px] text-slate-400 uppercase tracking-widest'>
                                    <span>Library Hours</span>
                                    <span className='text-indigo-600'>Open Now</span>
                                </div>
                                <div
                                    onClick={() => setIsReservationModalOpen(true)}
                                    className='group flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3 transition-colors hover:bg-indigo-50'>
                                    <span className='font-bold text-slate-700 text-xs underline group-hover:text-indigo-600'>
                                        View Reservation History
                                    </span>
                                    <BookMarked className='h-4 w-4 text-slate-400 transition-all group-hover:rotate-12 group-hover:text-indigo-600' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReservationHistoryModal isOpen={isReservationModalOpen} onClose={() => setIsReservationModalOpen(false)} />
        </div>
    );
}
