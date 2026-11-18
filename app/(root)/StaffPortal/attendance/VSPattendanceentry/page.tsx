'use client';

import { Suspense } from 'react';
import AttendanceEntryForm from './_components/attendance-entry-form';

export default function AttendanceEntryPage() {
    return (
        <div className='container mx-auto min-h-screen space-y-6 p-4'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-2xl tracking-tight'>Attendance Entry</h1>
            </div>

            <Suspense fallback={<div>Loading attendance entry...</div>}>
                <AttendanceEntryForm />
            </Suspense>
        </div>
    );
}
