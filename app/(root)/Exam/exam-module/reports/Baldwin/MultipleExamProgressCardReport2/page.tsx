'use client';

import { useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportView } from './_components/report-view';

/**
 * Multiple Exam Progress Card Report 2 (Baldwin) - Page
 */
export default function MultipleExamProgressCardReport2Page() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleReportGenerated = (data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
    };

    return (
        <div className='container space-y-6 p-4'>
            <ReportForm onReportGenerated={handleReportGenerated} />

            {reportData && <ReportView reportData={reportData} reportParams={reportParams} />}
        </div>
    );
}
