'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getPromotionReportTBSchool } from '@/server/exam/exam-module/reports/Turnbridge/PromotionReportTBSchool';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';
import ProgressCardReport from './_components/progress-card-report';

export default function PromotionReportTBSchoolPage() {
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

            console.log('====================================');
            console.log('REPORT TYPE :', type);
            console.log('REQUEST PAYLOAD :', payload);
            console.log('====================================');

            const res = await getPromotionReportTBSchool(payload);

            console.log('FULL RESPONSE :', res);
            console.log('SUCCESS :', res?.success);
            console.log('DATA :', res?.data);

            const reportContent = res?.data || res;

            if (!res?.success && (!reportContent || Object.keys(reportContent).length === 0)) {
                console.error('API returned no data');
                setIsReportVisible(false);
                toast.error('No data found for the selected criteria');
                return;
            }

            setReportData(reportContent);
            setIsReportVisible(true);

            toast.success('Report generated successfully!');
        } catch (e: any) {
            console.error('ERROR OCCURRED', e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='TunBridge I to VIII Report Card (Promotion Report)' defaultOpen>
                <ProgressCardReportForm
                    onSuccess={handleReportSuccess}
                    onPrint={handlePrint}
                    onReportTypeChange={(type) => setReportType(type)}
                />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='TunBridge Report Cards' defaultOpen>
                    <div ref={printRef}>
                        <ProgressCardReport reportData={reportData} onPrint={handlePrint} reportType={reportType} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
