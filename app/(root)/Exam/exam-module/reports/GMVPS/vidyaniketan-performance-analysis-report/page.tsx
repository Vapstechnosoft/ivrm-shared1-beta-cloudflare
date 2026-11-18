'use client';
import { useEffect, useRef, useState } from 'react';
import { mockData } from './_components/mockData';
import { ReportForm } from './_components/report_form';
import { ReportList } from './_components/report_list';

export default function MarksEntryReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportVisible, setReportVisible] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (data: any, _info: any) => {
        setReportData(data);
        setReportVisible(true);
    };

    const handleReset = () => {
        if (reportData) {
            setReportData(null);
        }
    };

    // Auto-scroll effect
    useEffect(() => {
        if (reportData && listRef.current) {
            const timer = setTimeout(() => {
                listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [reportData]);

    return (
        <div className='container mx-auto space-y-6 py-6 transition-all duration-500 ease-in-out'>
            <ReportForm onReportGenerated={handleReportGenerated} onReset={handleReset} />

            <div ref={listRef} className='mt-6 duration-300 ease-in-out'>
                {reportVisible && (
                    <div className='fade-in slide-in-from-bottom-4 animate-in duration-500'>
                        <ReportList mockdata={mockData} />
                    </div>
                )}
            </div>
        </div>
    );
}
