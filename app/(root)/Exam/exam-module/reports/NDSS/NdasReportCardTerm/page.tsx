'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getNdasReportCardTerm } from '@/server/exam/exam-module/reports/NDSS/NdasReportCardTerm';
import { useState } from 'react';
import { toast } from 'sonner';
import NdasReportCardTermDisplay from './_components/report-display';
import NdasReportCardTermForm from './_components/report-form';

export default function NdasReportCardTermPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportDate, setReportDate] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getNdasReportCardTerm(payload);
            console.log('NDAS Term Report response data:', res);

            const reportContent = res?.data || res;

            if (!reportContent || !reportContent.getstudentdetails || reportContent.getstudentdetails.length === 0) {
                toast.error('No student records found for the selected criteria');
                setIsReportVisible(false);
                return;
            }

            setReportData(reportContent);
            setReportDate(payload.date);
            setIsReportVisible(true);
            toast.success('NDAS Term Report Card generated successfully!');
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Error generating NDAS Term Report Card');
            setIsReportVisible(false);
        }
    };

    const handleCancel = () => {
        setReportData(null);
        setReportDate('');
        setIsReportVisible(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='PROGRESS CARD REPORT' defaultOpen>
                <NdasReportCardTermForm onSuccess={handleReportSuccess} onCancel={handleCancel} onPrint={handlePrint} />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='NDAS Term Progress Cards' defaultOpen>
                    <NdasReportCardTermDisplay data={reportData} date={reportDate} onPrint={handlePrint} />
                </CollapsibleSection>
            )}
        </div>
    );
}
