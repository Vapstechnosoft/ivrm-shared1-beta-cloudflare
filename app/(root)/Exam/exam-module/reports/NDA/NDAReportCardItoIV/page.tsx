'use client';

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import NDAReportCardItoIVForm from '@/app/(root)/Exam/exam-module/reports/NDA/NDAReportCardItoIV/_components/report-form';
import NDAReportCardItoIVListView from '@/app/(root)/Exam/exam-module/reports/NDA/NDAReportCardItoIV/_components/report-list';

export default function NDAReportCardItoIVPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportSuccess = (data: any) => {
        setReportData(data);
        setIsReportVisible(true);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='NDA Report Card (I to IV)' defaultOpen>
                <NDAReportCardItoIVForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report View' defaultOpen>
                    <NDAReportCardItoIVListView data={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}
