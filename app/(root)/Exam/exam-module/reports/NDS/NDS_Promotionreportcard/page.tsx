'use client';

import type { NDSPromotionReportResponse } from '@/types/exam/NDS/NDS_Promotionreportcard';
import { useState } from 'react';
import AddForm from './_components/addForm';
import ReportView from './_components/report-view';

export default function NDSPromotionReportCard() {
    const [reportData, setReportData] = useState<NDSPromotionReportResponse | null>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleReportGenerated = (data: NDSPromotionReportResponse, params: any) => {
        setReportData(data);
        setReportParams(params);
    };

    const handleReset = () => {
        setReportData(null);
        setReportParams(null);
    };

    return (
        <div className='flex flex-col gap-4 p-4'>
            <div className='flex items-center justify-between'>
                {/* <h1 className="text-2xl font-bold text-primary">NDS Promotion Report Card</h1> */}
            </div>

            <AddForm onReportGenerated={handleReportGenerated} onReset={handleReset} />

            {reportData && (
                <div className='mt-8'>
                    <ReportView data={reportData} params={reportParams} />
                </div>
            )}
        </div>
    );
}
