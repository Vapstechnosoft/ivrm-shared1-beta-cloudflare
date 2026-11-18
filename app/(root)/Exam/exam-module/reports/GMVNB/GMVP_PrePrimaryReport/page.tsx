'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import { ReportForm } from './_components/report-form';
import { ReportList } from './_components/report-list';

export default function GMVP_PrePrimaryReport_Page() {
    const [reportData, setReportData] = useState<any>(null);
    const [reportParams, setReportParams] = useState<any>(null);

    const handleReportGenerated = (data: any, params: any) => {
        setReportData(data);
        setReportParams(params);
    };

    const handleReset = () => {
        setReportData(null);
        setReportParams(null);
    };

    return (
        <div className='flex flex-col gap-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <ReportForm title='Progress Card Report' onReportGenerated={handleReportGenerated} onReset={handleReset} />
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection title='Progress Card Report' defaultOpen>
                    <ReportList data={reportData} params={reportParams} />
                </CollapsibleSection>
            )}
        </div>
    );
}
