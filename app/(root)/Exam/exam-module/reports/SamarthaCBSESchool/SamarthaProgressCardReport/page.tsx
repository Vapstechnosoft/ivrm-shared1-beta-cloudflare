'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SamarthaProgressCardReportForm from './_components/report-form';
import SamarthaProgressCardReportView from './_components/report-list';

export default function SamarthaProgressCardReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <SamarthaProgressCardReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && reportData && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SamarthaProgressCardReportView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
