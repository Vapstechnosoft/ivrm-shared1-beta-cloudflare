'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SopiaExamReportVtoVIIIForm from './_components/report-form';
import SopiaExamReportVtoVIIIView from './_components/report-list';

export default function SopiaExamReportVtoVIIIPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Sophia Exam Report V to VIII' defaultOpen>
                <SopiaExamReportVtoVIIIForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SopiaExamReportVtoVIIIView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
