'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import PromotionReportCardSophiaForm from './_components/report-form';
import PromotionReportCardSophiaView from './_components/report-list';

export default function PromotionReportCardSophiaPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Promotion Report Card Sophia' defaultOpen>
                <PromotionReportCardSophiaForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <PromotionReportCardSophiaView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
