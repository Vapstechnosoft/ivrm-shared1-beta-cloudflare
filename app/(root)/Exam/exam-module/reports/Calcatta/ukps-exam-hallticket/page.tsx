'use client';

import { useState } from 'react';
import ReportForm from './_components/report-form';
import ReportList from './_components/report-list';

export default function UKPSExamHallticketPage() {
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
        <div className='flex flex-col gap-6 p-6'>
            <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
            {reportData && <ReportList data={reportData} params={reportParams} />}
        </div>
    );
}
