'use client';

import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportList from './_components/report-list';

export default function SamarthaProgressCardReportPromotionPage() {
    const [reportData, setReportData] = useState<any>(null);

    return (
        <div className='flex flex-col gap-4 p-4'>
            <div className='flex flex-col gap-1'>
                <h1 className='text-2xl font-bold tracking-tight'>Samartha Progress Card Report Promotion</h1>
                <p className='text-muted-foreground'>Generate and view student promotion progress cards.</p>
            </div>

            <ReportForm onSuccess={(data) => setReportData(data)} />

            {reportData && (
                <div className='mt-6'>
                    <ReportList data={reportData} />
                </div>
            )}
        </div>
    );
}
