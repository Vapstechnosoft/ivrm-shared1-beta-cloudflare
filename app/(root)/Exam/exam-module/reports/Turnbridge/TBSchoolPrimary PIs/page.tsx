'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getTBSchoolPrimaryReport } from '@/server/exam/exam-module/reports/tbschoolprimary';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';
import ProgressCardReport from './_components/progress-card-report';

export default function TBSchoolPrimaryReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportType, setReportType] = useState<string>('REPORT');
    const [isReportVisible, setIsReportVisible] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    const handleReportSuccess = async (payload: any, type: string) => {
        try {
            setReportType(type);
            const res = await getTBSchoolPrimaryReport(payload);

            console.log(res, 'response');

            if (!res?.success || !res?.data) {
                setIsReportVisible(false);
                toast.error('No data found for the selected criteria');
                return;
            }

            setReportData(res.data);
            setIsReportVisible(true);
            toast.success(`Report generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='TBSchool Primary Report' defaultOpen>
                <ProgressCardReportForm
                    onSuccess={handleReportSuccess}
                    onPrint={handlePrint}
                    onReportTypeChange={(type) => setReportType(type)}
                />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='TBSchool Primary Report Cards' defaultOpen>
                    <div ref={printRef}>
                        <ProgressCardReport reportData={reportData} reportType={reportType} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
