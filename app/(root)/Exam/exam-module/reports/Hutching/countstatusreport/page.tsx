'use client';

import type {
    IAdmissionStatusItem,
    IApplicationStatusItem
} from '@/types/exam/exam-module/reports/count-status-report';
import React, { useEffect, useRef, useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function HutchingCountStatusReportPage() {
    const [admissionData, setAdmissionData] = useState<IAdmissionStatusItem[]>([]);
    const [applicationData, setApplicationData] = useState<IApplicationStatusItem[]>([]);
    const [academicYearName, setAcademicYearName] = useState<string>('');
    const [showGraphs, setShowGraphs] = useState<boolean>(true);

    const listRef = useRef<HTMLDivElement>(null);

    const hasReportData = admissionData.length > 0 || applicationData.length > 0;

    const handleReportGenerated = (
        admission: IAdmissionStatusItem[],
        application: IApplicationStatusItem[],
        yearName: string
    ) => {
        setAdmissionData(admission);
        setApplicationData(application);
        setAcademicYearName(yearName);
    };

    const handleReset = () => {
        setAdmissionData([]);
        setApplicationData([]);
        setAcademicYearName('');
    };

    const handleToggleGraphs = () => {
        setShowGraphs((prev) => !prev);
    };

    // Auto-scroll to report when generated
    useEffect(() => {
        if (hasReportData && listRef.current) {
            const timer = setTimeout(() => {
                listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [hasReportData]);

    return (
        <div className='container mx-auto space-y-8 py-6 px-2 sm:px-4 fade-in animate-in duration-500'>
            {/* Filter Section */}
            <section className='transition-all duration-300'>
                <ReportForm
                    onReportGenerated={handleReportGenerated}
                    onReset={handleReset}
                    showGraphs={showGraphs}
                    onToggleGraphs={handleToggleGraphs}
                    hasReportData={hasReportData}
                />
            </section>

            {/* Report & Analytics Results */}
            <div ref={listRef} className='transition-all duration-500'>
                {hasReportData && (
                    <section className='slide-in-from-bottom-4 animate-in duration-500'>
                        <ReportList
                            admissionData={admissionData}
                            applicationData={applicationData}
                            academicYearName={academicYearName}
                            showGraphs={showGraphs}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
