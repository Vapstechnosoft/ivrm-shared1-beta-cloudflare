'use client';

import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';
import type { ISportsYearEndReportData } from './types';

export default function SportsYearEndReportPage() {
    const [reportData, setReportData] = useState<ISportsYearEndReportData[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className='flex flex-col gap-6'>
            <ReportForm onReportGenerated={setReportData} onReset={() => setReportData(null)} />
            {reportData && <ReportGrid data={reportData} searchQuery={searchQuery} onSearchChange={setSearchQuery} />}
        </div>
    );
}
