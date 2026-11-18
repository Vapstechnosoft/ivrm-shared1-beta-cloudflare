'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getNDS9Report } from '@/server/exam/exam-module/reports/NDS/NDS_9_ProgressNewCardReport';
import { useState } from 'react';
import { toast } from 'sonner';
import FinalPromReportSTMaryDisplay from './_components/final-prom-report-stmary-display';
import FinalPromReportSTMaryForm from './_components/final-prom-report-stmary-form';

export default function FinalPromReportSTMaryPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportDate, setReportDate] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getNDS9Report(payload);

            console.log('response data', res);

            const reportContent = res?.data || res;

            if (!reportContent || !reportContent.getstudentdetails || reportContent.getstudentdetails.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            setReportData(reportContent);
            setReportDate(payload.date);
            setRemarks(payload.remarks);
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
        setRemarks('');
        setIsReportVisible(false);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <FinalPromReportSTMaryForm onSuccess={handleReportSuccess} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <FinalPromReportSTMaryDisplay data={reportData} date={reportDate} remarks={remarks} />
                </CollapsibleSection>
            )}
        </div>
    );
}
