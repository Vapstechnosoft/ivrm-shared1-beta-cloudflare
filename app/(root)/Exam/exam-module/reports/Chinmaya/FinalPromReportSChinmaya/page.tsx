'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import FinalPromReportSChinmayaForm from './_components/report-form';
import FinalPromReportSChinmayaView from './_components/report-list';

export default function FinalPromReportSChinmayaPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Chinmaya 1-5 Progress Card Report' defaultOpen>
                <FinalPromReportSChinmayaForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <FinalPromReportSChinmayaView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
