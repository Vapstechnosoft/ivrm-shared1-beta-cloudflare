'use client';

import { Separator } from '@/components/ui/separator';
import { useEffect, useRef, useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function NDSCoScholasticReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [academicYear, setAcademicYear] = useState<string>('');
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (data: any, year: string) => {
        setReportData(data);
        setAcademicYear(year);
    };

    const handleReset = () => {
        setReportData(null);
        setAcademicYear('');
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
            <div className='space-y-2'>
                <h1 className='font-bold text-3xl text-primary tracking-tight'>Exam Reports</h1>
                <p className='text-muted-foreground'>Generate and print Co-Scholastic area reports for students.</p>
            </div>

            <Separator />

            <div className='grid grid-cols-1 gap-8'>
                <section className='transition-all duration-500'>
                    <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />
                </section>

                <div ref={listRef} className='transition-all duration-500'>
                    {reportData && (
                        <section className='slide-in-from-bottom-4 animate-in duration-500'>
                            <ReportList data={reportData} academicYear={academicYear} />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
