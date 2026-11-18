'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SopiaExamReportIVTermForm from './_components/report-form';
import SopiaExamReportIVTermView from './_components/report-list';

export default function SopiaExamReportIVTermPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Sophia Exam Report IV Term' defaultOpen>
                <SopiaExamReportIVTermForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SopiaExamReportIVTermView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
