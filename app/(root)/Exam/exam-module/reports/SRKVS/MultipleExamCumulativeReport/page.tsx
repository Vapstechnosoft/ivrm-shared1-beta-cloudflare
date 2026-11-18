'use client';

import { useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function MultipleExamCumulativeReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleReportGenerated = (data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
    };

    const handleReset = () => {
        setReportData(null);
        setReportParams(null);
    };

    return (
        <div className='container mx-auto space-y-8 py-6'>
            <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
            {reportData && reportParams && <ReportList data={reportData} params={reportParams} />}
        </div>
    );
}
