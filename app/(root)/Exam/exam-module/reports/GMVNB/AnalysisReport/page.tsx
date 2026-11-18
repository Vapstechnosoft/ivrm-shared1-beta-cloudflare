'use client';

import { useState } from 'react';
import { AnalysisReportForm } from './_components/report-form';
import { AnalysisReportList } from './_components/report-list';

export default function GMVNBAnalysisReportPage() {
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
        <div className='flex flex-col gap-6 p-4'>
            <AnalysisReportForm title='GMVNB Performance Analysis Report' onReportGenerated={handleReportGenerated} onReset={handleReset} />
            {reportData && <AnalysisReportList data={reportData} params={reportParams} />}
        </div>
    );
}
