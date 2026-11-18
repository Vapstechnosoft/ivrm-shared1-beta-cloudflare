'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import NDS9ProgressCardForm from './_components/report-form';
import NDS9ProgressCardView from './_components/report-list';

export default function NDS9ProgressCardReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='9 Progress Card Report' defaultOpen>
                <NDS9ProgressCardForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <NDS9ProgressCardView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
