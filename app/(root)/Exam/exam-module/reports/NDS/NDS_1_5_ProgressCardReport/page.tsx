'use client';

import { useState } from 'react';
import { AddForm } from './_components/addForm';
import { ReportView } from './_components/report-view';

const NDS15ProgressCardReport = () => {
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
            <AddForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
            {reportData && <ReportView data={reportData} params={reportParams} />}
        </div>
    );
};

export default NDS15ProgressCardReport;
