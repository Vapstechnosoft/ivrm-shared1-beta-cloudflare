'use client';

import type { ISRKVSReportData } from '@/types/sports/reports/srkvs-sports-report';
import { useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportGrid } from './_components/report-grid';

export default function SRKVSSportsReportPage() {
    const [reportData, setReportData] = useState<ISRKVSReportData[]>([]);
    const [reportType, setReportType] = useState<string>('Record');

    return (
        <div className='space-y-6'>
            <ReportForm onReportGenerated={setReportData} onTypeChange={setReportType} />
            <ReportGrid data={reportData} type={reportType} />
        </div>
    );
}
