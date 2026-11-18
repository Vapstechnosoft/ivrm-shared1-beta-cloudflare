'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaffDashboard } from '@/hooks/staff-portal/useStaffDashboard';
import { Bell, Book, Box, Calendar, Camera, Clock, FileText, ShoppingCart, User, Users } from 'lucide-react';
import { useState } from 'react';
import { CalendarWidget } from './_components/calendar-widget';
import {
    AssetListModal,
    BookListModal,
    EventsModal,
    MedicalRecordModal,
    NoticeBoardModal,
    PhotoUploadModal,
    ProfileModal,
    PurchaseListModal,
    TimeTableModal
} from './_components/dashboard-modals';
import { StaffDashboardWidget } from './_components/staff-dashboard-widget';

export default function StaffDashboardPage() {
    const { data: dashboard, isLoading } = useStaffDashboard();
    const [modals, setModals] = useState({
        profile: false,
        notice: false,
        events: false,
        assets: false,
        purchase: false,
        books: false,
        medical: false,
        timetable: false,
        upload: false
    });

    const toggleModal = (key: keyof typeof modals, val: boolean) => {
        setModals((prev) => ({ ...prev, [key]: val }));
    };

    if (isLoading) {
        return (
            <div className='grid grid-cols-1 gap-8 p-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className='h-[200px] w-full rounded-[2.5rem] shadow-sm' />
                ))}
            </div>
        );
    }

    const basicDetails = dashboard?.filldepartment?.[0]!;
    const profileStatus = dashboard?.empProfile?.[0];
    const isTeaching = dashboard?.hrmE_TechNonTeachingFlg === 'Teaching';

    return (
        <div className='min-h-screen bg-slate-50/50 p-8 dark:bg-zinc-950/50'>
            <div className='mx-auto max-w-[1600px]'>
                <header className='mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
                    <div>
                        <h1 className='mb-2 font-black text-3xl text-slate-900 uppercase tracking-tight dark:text-white'>
                            EMPLOYEE <span className='text-primary italic'>DASHBOARD</span>
                        </h1>
                        <p className='font-medium text-slate-500 dark:text-slate-400'>
                            Welcome back,{' '}
                            <span className='font-bold text-slate-900 dark:text-slate-100'>{basicDetails?.hrmE_EmployeeFirstName}</span>!
                            Here's what's happening today.
                        </p>
                    </div>
                </header>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {/* 1. Employee Profile */}
                    <StaffDashboardWidget
                        title='Profile'
                        icon={<User />}
                        colorClass='bg-gradient-to-br from-[#00c0ef] to-[#0073b7]'
                        footerText='View Full Profile'
                        onViewClick={() => toggleModal('profile', true)}>
                        <div className='flex flex-col items-start gap-1'>
                            <span className='w-full truncate'>{basicDetails?.hrmE_EmployeeFirstName}</span>
                            <span className='font-bold text-slate-400 text-xs uppercase tracking-widest'>
                                {basicDetails?.hrmdeS_DesignationName}
                            </span>
                            <Button
                                variant='outline'
                                size='xs'
                                className='mt-3 h-8 gap-2 rounded-full border-slate-200 px-3 text-[10px] hover:border-primary/50'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleModal('upload', true);
                                }}>
                                <Camera className='h-3 w-3' /> Update Photo
                            </Button>
                        </div>
                    </StaffDashboardWidget>

                    {/* 2. Notice Board */}
                    <StaffDashboardWidget
                        title='Notice Board'
                        icon={<Bell />}
                        colorClass='bg-gradient-to-br from-[#605ca8] to-[#4b4789]'
                        footerText='View Notices'
                        onViewClick={() => toggleModal('notice', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>{dashboard?.noticeboard?.length || 0}</span>
                            <span className='font-medium text-slate-400 text-sm'>Notices</span>
                        </div>
                    </StaffDashboardWidget>

                    {/* 3. Calendar of Events */}
                    <StaffDashboardWidget
                        title='Events'
                        icon={<Calendar />}
                        colorClass='bg-gradient-to-br from-[#00a65a] to-[#00733e]'
                        footerText='View All Events'
                        onViewClick={() => toggleModal('events', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>{dashboard?.calenderlist?.length || 0}</span>
                            <span className='font-medium text-slate-400 text-sm'>Events</span>
                        </div>
                    </StaffDashboardWidget>

                    {/* 4. Asset List */}
                    <StaffDashboardWidget
                        title='Asset List'
                        icon={<Box />}
                        colorClass='bg-gradient-to-br from-[#f39c12] to-[#db8b0b]'
                        footerText='View Asset Details'
                        onViewClick={() => toggleModal('assets', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>{dashboard?.assetcount || 0}</span>
                            <span className='font-medium text-slate-400 text-sm'>Assets</span>
                        </div>
                    </StaffDashboardWidget>

                    {/* 5. Purchase List */}
                    <StaffDashboardWidget
                        title='Purchase List'
                        icon={<ShoppingCart />}
                        colorClass='bg-gradient-to-br from-[#ff851b] to-[#e67000]'
                        footerText='View Purchase History'
                        onViewClick={() => toggleModal('purchase', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>{dashboard?.purchasecount || 0}</span>
                            <span className='font-medium text-slate-400 text-sm'>Purchases</span>
                        </div>
                    </StaffDashboardWidget>

                    {/* 6. Time Table */}
                    <StaffDashboardWidget
                        title='Time Table'
                        icon={<Clock />}
                        colorClass='bg-gradient-to-br from-[#dd4b39] to-[#c23321]'
                        footerText='View Full Time Table'
                        onViewClick={() => toggleModal('timetable', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>{dashboard?.tT_final_generation?.length || 0}</span>
                            <span className='font-medium text-slate-400 text-sm'>Sessions</span>
                        </div>
                    </StaffDashboardWidget>

                    {/* 7. Student Count (Conditional) */}
                    {isTeaching && (
                        <StaffDashboardWidget
                            title='Student Count'
                            icon={<Users />}
                            colorClass='bg-gradient-to-br from-[#00c0ef] to-[#0073b7]'
                            footerText='View Student List'>
                            <div className='flex items-baseline gap-2'>
                                <span>{dashboard?.studentcount || 0}</span>
                                <span className='font-medium text-slate-400 text-sm'>Students</span>
                            </div>
                        </StaffDashboardWidget>
                    )}

                    {/* 8. Book List */}
                    <StaffDashboardWidget
                        title='Book List'
                        icon={<Book />}
                        colorClass='bg-gradient-to-br from-[#605ca8] to-[#4b4789]'
                        footerText='View Library Books'
                        onViewClick={() => toggleModal('books', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>{dashboard?.bookcount || 0}</span>
                            <span className='font-medium text-slate-400 text-sm'>Books</span>
                        </div>
                    </StaffDashboardWidget>

                    {/* 9. Medical PDF List */}
                    <StaffDashboardWidget
                        title='Medical Record'
                        icon={<FileText />}
                        colorClass='bg-gradient-to-br from-[#001f3f] to-[#000e1f]'
                        footerText='View Medical Records'
                        onViewClick={() => toggleModal('medical', true)}>
                        <div className='flex items-baseline gap-2'>
                            <span>Records</span>
                            <span className='font-medium text-slate-400 text-sm'>(PDF)</span>
                        </div>
                    </StaffDashboardWidget>
                </div>

                {/* Calendar of Events Section */}
                <div className='mt-10'>
                    <CalendarWidget events={dashboard?.calenderlist || []} />
                </div>
            </div>

            {/* Modals */}
            <ProfileModal
                open={modals.profile}
                onOpenChange={(v) => toggleModal('profile', v)}
                empData={basicDetails}
                profileStatus={profileStatus}
            />

            <NoticeBoardModal
                open={modals.notice}
                onOpenChange={(v) => toggleModal('notice', v)}
                years={dashboard?.yearlist || []}
                initialYear={dashboard?.asmaY_Id || 0}
            />

            <EventsModal open={modals.events} onOpenChange={(v) => toggleModal('events', v)} />

            <AssetListModal open={modals.assets} onOpenChange={(v) => toggleModal('assets', v)} />

            <PurchaseListModal open={modals.purchase} onOpenChange={(v) => toggleModal('purchase', v)} />

            <BookListModal open={modals.books} onOpenChange={(v) => toggleModal('books', v)} books={dashboard?.booklist || []} />

            <MedicalRecordModal
                open={modals.medical}
                onOpenChange={(v) => toggleModal('medical', v)}
                empId={profileStatus?.hrmE_Id || basicDetails?.hrmE_Id || 0}
            />

            <TimeTableModal
                open={modals.timetable}
                onOpenChange={(v) => toggleModal('timetable', v)}
                timetable={dashboard?.tT_final_generation || []}
                days={dashboard?.allperiods || []}
            />

            <PhotoUploadModal
                open={modals.upload}
                onOpenChange={(v) => toggleModal('upload', v)}
                empId={profileStatus?.hrmE_Id || basicDetails?.hrmE_Id || 0}
            />
        </div>
    );
}
