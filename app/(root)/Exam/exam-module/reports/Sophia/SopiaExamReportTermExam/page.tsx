'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SopiaExamReportTermExamForm from './_components/report-form';
import SopiaExamReportTermExamView from './_components/report-list';

export default function SopiaExamReportTermExamPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Sophia Exam Report Term Exam' defaultOpen>
                <SopiaExamReportTermExamForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SopiaExamReportTermExamView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
