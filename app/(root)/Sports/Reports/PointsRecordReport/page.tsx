'use client';

import type { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';
import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportGrid from './_components/report-grid';
import type { PointsRecordReportFormSchema } from './schema';

export default function PointsRecordReportPage() {
    const [reportData, setReportData] = useState<IPointsRecordReportData[] | null>(null);
    const [formData, setFormData] = useState<PointsRecordReportFormSchema | null>(null);

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <ReportForm setReportData={setReportData} setFormData={setFormData} />

            {reportData && <ReportGrid data={reportData} formData={formData} />}
        </div>
    );
}
