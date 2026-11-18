'use client';

import { Suspense } from 'react';
import ReportFilters from './_components/report-filters';

export default function StudentAttendanceReportPage() {
    return (
        <div className='container mx-auto min-h-screen space-y-6 p-4'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-2xl tracking-tight'>Student Attendance Report</h1>
            </div>

            <Suspense fallback={<div>Loading report filters...</div>}>
                <ReportFilters />
            </Suspense>
        </div>
    );
}
