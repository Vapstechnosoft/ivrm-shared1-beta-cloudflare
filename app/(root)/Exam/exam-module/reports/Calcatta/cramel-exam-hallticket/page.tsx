'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReportForm from './_components/report-form';
import ReportList from './_components/report-list';

export default function CramelExamHallticketPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = useCallback((data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
    }, []);

    const handleReset = useCallback(() => {
        setReportData(null);
        setReportParams(null);
    }, []);

    useEffect(() => {
        if (reportData && listRef.current) {
            setTimeout(() => {
                listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
    }, [reportData]);

    return (
        <div className='container mx-auto space-y-8 py-8'>
            <div className='no-print'>
                <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
            </div>

            <div ref={listRef} className='transition-all duration-300'>
                {reportData && <ReportList data={reportData} params={reportParams} />}
            </div>
        </div>
    );
}
