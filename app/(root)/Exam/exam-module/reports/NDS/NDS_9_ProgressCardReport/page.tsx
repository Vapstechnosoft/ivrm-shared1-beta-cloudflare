'use client';

import { useState } from 'react';
import { AddForm } from './_components/addForm';
import { ReportView } from './_components/report-view';

export default function NDS9ProgressCardReportPage() {
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
        <div className='container mx-auto space-y-6 py-6'>
            <AddForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
            {reportData && <ReportView data={reportData} params={reportParams} />}
        </div>
    );
}
