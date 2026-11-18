'use client';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function PromotionDetailsReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isSuperAverage, setIsSuperAverage] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const [institution, setInstitution] = useState<IMasterInstitution | null>(null);

    useEffect(() => {
        const fetchInstitution = async () => {
            const inst = await getMasterInstitution();
            if (inst.data?.mI_Name.trim() === '') return;
            setInstitution(inst.data);
        };
        fetchInstitution();
    }, []);

    const handleReportGenerated = (data: any, superAverage: boolean) => {
        setReportData(data);
        setIsSuperAverage(superAverage);
    };

    const handleReset = () => {
        if (reportData) {
            setReportData(null);
            setIsSuperAverage(false);
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
                {reportData && institution && (
                    <div className='fade-in slide-in-from-bottom-4 animate-in duration-500'>
                        <ReportList data={reportData} isSuperAverage={isSuperAverage} institution={institution} />
                    </div>
                )}
            </div>
        </div>
    );
}
