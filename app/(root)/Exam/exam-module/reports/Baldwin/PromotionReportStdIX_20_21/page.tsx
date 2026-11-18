'use client';

import { getPromotionReportStdIX2021 } from '@/server/exam/exam-module/reports/Baldwin/BaldwinReports';
import { useState } from 'react';
import { ReportForm } from '../_components/report-form';
import { ReportList } from './_components/report-list';

export default function PromotionReportStdIX2021Page() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleReportGenerated = (data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
        console.log('bbhs IX report data', data);
    };

    const handleReset = () => {
        setReportData(null);
        setReportParams(null);
    };

    return (
        <div className='flex flex-col gap-6 p-4'>
            <ReportForm
                title='Promotion Report Std IX 20-21'
                onReportGenerated={handleReportGenerated}
                onReset={handleReset}
                apiAction={getPromotionReportStdIX2021}
            />

            {reportData && <ReportList data={reportData} params={reportParams} />}
        </div>
    );
}
