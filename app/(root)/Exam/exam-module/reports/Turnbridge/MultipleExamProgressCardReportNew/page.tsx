'use client';

import { useState } from 'react';
import { AddForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

/**
 * Multiple Exam Progress Card Report New Page
 * This page serves as the entry point for the report, coordinating the filter form
 * and the rendered report list.
 */

export default function MultipleExamProgressCardReportNewPage() {
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
            {/* Filter Form */}
            <AddForm onReportGenerated={handleReportGenerated} onReset={handleReset} />

            {/* Generated Report View */}
            {reportData && <ReportList data={reportData} params={reportParams} />}
        </div>
    );
}
