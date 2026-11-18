'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import NDAReportCardItoXIITermForm from './_components/report-form';
import NDAReportCardItoXIITermView from './_components/report-list';

export default function NDAReportCardItoXIITermPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='NDA Report Card I to XII Term' defaultOpen>
                <NDAReportCardItoXIITermForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <NDAReportCardItoXIITermView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
