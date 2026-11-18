'use client';

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import PromotionReportCardNDAForm from '@/app/(root)/Exam/exam-module/reports/NDA/PromotionReportCardNDA/_components/report-form';
import PromotionReportCardNDASListView from '@/app/(root)/Exam/exam-module/reports/NDA/PromotionReportCardNDA/_components/report-list';

export default function PromotionReportCardNDAPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Promotion Report Card NDA' defaultOpen>
                <PromotionReportCardNDAForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <PromotionReportCardNDASListView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
