'use client';

import type { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';
import { useState } from 'react';
import { ReportForm } from './_components/record-report-form';
import { ReportGrid } from './_components/record-report-grid';

export default function SportPointsAndRecordReportPage() {
    const [reportData, setReportData] = useState<IPointsRecordReportData[]>([]);

    return (
        <div className='space-y-6'>
            <ReportForm onReportGenerated={setReportData} />
            <ReportGrid data={reportData} />
        </div>
    );
}
