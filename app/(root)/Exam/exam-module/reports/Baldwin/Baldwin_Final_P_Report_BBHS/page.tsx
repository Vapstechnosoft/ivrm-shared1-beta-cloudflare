'use client';

import { getBBHSFinalPromotionReportBBHS } from '@/server/exam/exam-module/reports/Baldwin/BaldwinReports';
import { useState } from 'react';
import { ReportForm } from '../_components/report-form';
import { ReportList } from './_components/report-list';

export default function Baldwin_Final_P_Report_BBHS_Page() {
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
    console.log('reportData', reportData);
    return (
        <div className='flex flex-col gap-6 p-4'>
            <ReportForm
                title='Baldwin Final Promotion Report BBHS'
                onReportGenerated={handleReportGenerated}
                onReset={handleReset}
                apiAction={getBBHSFinalPromotionReportBBHS}
            />
            {reportData && <ReportList data={reportData} params={reportParams} />}
        </div>
    );
}
