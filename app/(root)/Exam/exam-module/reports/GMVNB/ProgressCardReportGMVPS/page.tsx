'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function ProgressCardReportGMVPSPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [academicYear, setAcademicYear] = useState<string>('');
    const [generatedDate, setGeneratedDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (data: any, year: string, gDate?: Date) => {
        setReportData(data);
        setAcademicYear(year);
        setGeneratedDate(gDate);
    };

    const handleReset = useCallback(() => {
        setReportData(null);
        setAcademicYear('');
    }, []);

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
                    <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} onLoading={setIsLoading} />
                </section>

                <div ref={listRef} className='relative min-h-[200px] transition-all duration-500'>
                    {isLoading ? (
                        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 pt-12 backdrop-blur-sm'>
                            <Loader2 className='mb-4 h-10 w-10 animate-spin text-sky-800' />
                            <p className='animate-pulse font-medium text-sky-800 text-sm'>Generating Report...</p>
                        </div>
                    ) : (
                        reportData && (
                            <section className='slide-in-from-bottom-4 animate-in duration-500'>
                                <ReportList data={reportData} academicYear={academicYear} generatedDate={generatedDate} />
                            </section>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
