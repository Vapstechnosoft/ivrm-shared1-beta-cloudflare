'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import SophiaReportCardPreForm from './_components/report-form';
import SophiaReportCardPreView from './_components/report-list';

export default function SophiaReportCardPrePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Sophia Report Card Pre' defaultOpen>
                <SophiaReportCardPreForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <SophiaReportCardPreView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
