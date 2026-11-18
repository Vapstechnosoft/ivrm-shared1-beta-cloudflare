'use client';

import { useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function BCEHSFinalPromotionReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleFormSubmit = (data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
    };

    const handleReset = () => {
        setReportData(null);
        setReportParams(null);
    };

    return (
        <div className='container overflow-hidden p-0'>
            <div className='flex flex-col gap-4'>
                <ReportForm onReportGenerated={handleFormSubmit} onReset={handleReset} />

                {reportData && <ReportList reportData={reportData} reportParams={reportParams} />}
            </div>
        </div>
    );
}
