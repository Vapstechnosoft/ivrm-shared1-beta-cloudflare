'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getNDS9Report } from '@/server/exam/exam-module/reports/NDS/NDS_9_ProgressNewCardReport';
import { useState } from 'react';
import { toast } from 'sonner';
import FinalPromReportDisplay from './_components/final-prom-report-display';
import FinalPromReportForm from './_components/final-prom-report-form';

export default function FinalPromReportstpeterPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [metaData, setMetaData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = async (payload: any) => {
        try {
            const res = await getNDS9Report(payload);
            console.log(res, 'response');

            const reportContent = res?.data || res;

            if (!reportContent || !reportContent.getstudentdetails || reportContent.getstudentdetails.length === 0) {
                toast.error('No records found');
                setIsReportVisible(false);
                return;
            }

            setReportData(reportContent);
            setMetaData({
                academicYear: payload.academicYear,
                className: payload.className,
                sectionName: payload.sectionName,
                exmname: payload.exmname,
                logo: payload.logo,
                studentsCount: payload.Temp_AmstIds?.length || 0,
                date: new Date().toISOString()
            });
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
        setMetaData(null);
        setIsReportVisible(false);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Seniors Progress Card Report' defaultOpen>
                <FinalPromReportForm onSuccess={handleReportSuccess} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && reportData && metaData && (
                <CollapsibleSection title='Seniors Progress Card Report Display' defaultOpen>
                    <FinalPromReportDisplay
                        data={reportData}
                        date={metaData.date}
                        exmname={metaData.exmname}
                        logo={metaData.logo}
                        academicYear={metaData.academicYear}
                        className={metaData.className}
                        sectionName={metaData.sectionName}
                        studentsCount={metaData.studentsCount}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
