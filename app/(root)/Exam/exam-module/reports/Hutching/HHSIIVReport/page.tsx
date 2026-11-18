'use client';

import { useEffect, useRef, useState } from 'react';
import ReportForm from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function HHSIIVReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [academicYearName, setAcademicYearName] = useState<string>('');
    const [className, setClassName] = useState<string>('');
    const [sectionName, setSectionName] = useState<string>('');
    const [reOpenDate, setReOpenDate] = useState<Date | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (data: any, year: string, cls: string, sec: string, reOpen: Date | null) => {
        setReportData(data);
        setAcademicYearName(year);
        setClassName(cls);
        setSectionName(sec);
        setReOpenDate(reOpen);
    };

    const handleReset = () => {
        setReportData(null);
        setAcademicYearName('');
        setClassName('');
        setSectionName('');
        setReOpenDate(null);
    };

    // Auto-scroll to report when generated
    useEffect(() => {
        if (reportData && listRef.current) {
            const timer = setTimeout(() => {
                listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [reportData]);

    return (
        <div className='fade-in container mx-auto animate-in space-y-8 py-8 duration-700'>
            <div className='grid grid-cols-1 gap-8'>
                <section className='transition-all duration-500'>
                    <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
                </section>

                <div ref={listRef} className='transition-all duration-500'>
                    {reportData && (
                        <section className='slide-in-from-bottom-4 animate-in duration-500'>
                            <ReportList
                                data={reportData}
                                academicYearName={academicYearName}
                                classNameVal={className}
                                sectionNameVal={sectionName}
                                reOpenDate={reOpenDate}
                            />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
