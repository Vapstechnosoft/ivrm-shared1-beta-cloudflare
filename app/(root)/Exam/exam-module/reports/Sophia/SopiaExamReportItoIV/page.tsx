'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SopiaExamReportItoIVForm from './_components/report-form';
import SopiaExamReportItoIVView from './_components/report-list';

export default function SopiaExamReportItoIVPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Sophia Exam Report I to IV' defaultOpen>
                <SopiaExamReportItoIVForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SopiaExamReportItoIVView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
