'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import NDAReportCardForm from './_components/report-form';
import NDAReportCardView from './_components/report-list';

export default function NDAReportCardPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    const handleClear = () => {
        setReportData(null);
        setIsReportVisible(false);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='NDA Report Card' defaultOpen>
                <NDAReportCardForm onSuccess={handleReportSuccess} onClear={handleClear} isReportVisible={isReportVisible} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <NDAReportCardView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
