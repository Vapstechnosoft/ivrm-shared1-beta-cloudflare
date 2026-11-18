'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getGmvpsProgressCardIXReport } from '@/server/exam/exam-module/reports/gmvps-report-card-ix';
import { useState } from 'react';
import { toast } from 'sonner';
import BurnpurProgressCardReport from './_components/burnpur-progress-card-report';
import BurnpurReportCardForm from './_components/burnpur-report-form';

export default function BurnpurProgressCardReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportDate, setReportDate] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getGmvpsProgressCardIXReport(payload);
            console.log('response data: ', res);

            const reportContent = res?.data || res; // Fallback if not wrapped

            if (!reportContent || !reportContent.getstudentdetails || reportContent.getstudentdetails.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            setReportData(reportContent);
            setReportDate(payload.date);
            setIsReportVisible(true);
            toast.success('Report generated successfully!');
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Error generating report');
            setIsReportVisible(false);
        }
    };

    const handleCancel = () => {
        setReportData(null);
        setReportDate('');
        setIsReportVisible(false);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Burnpur Progress Card Report' defaultOpen>
                <BurnpurReportCardForm onSuccess={handleReportSuccess} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <BurnpurProgressCardReport data={reportData} date={reportDate} />
                </CollapsibleSection>
            )}
        </div>
    );
}
