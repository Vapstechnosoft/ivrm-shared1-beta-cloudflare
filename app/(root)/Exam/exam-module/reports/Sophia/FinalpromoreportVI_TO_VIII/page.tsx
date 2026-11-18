'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import FinalpromoreportForm from './_components/report-form';
import FinalpromoreportView from './_components/report-list';

export default function FinalpromoreportVI_TO_VIIIPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='6-8 Progress Card Report' defaultOpen>
                <FinalpromoreportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <FinalpromoreportView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
