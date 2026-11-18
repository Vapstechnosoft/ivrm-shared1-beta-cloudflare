'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useState } from 'react';
import { toast } from 'sonner';
import ConstraintReportForm from './_components/constraint-report-form';
import ConstraintReportGrid from './_components/constraint-report-grid';

export default function ConstraintReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);

    const handleReportGenerated = (response: any, payload: any) => {
        const data = response.data || response;
        if (data && data.getreportdata && data.getreportdata.length > 0) {
            setReportData(data.getreportdata);
            setFormData(payload);
            setIsReportVisible(true);
            toast.success('Report generated successfully');
        } else {
            toast.error('Record Not Found');
            setReportData([]);
            setFormData(null);
            setIsReportVisible(false);
        }
    };

    const handleCancel = () => {
        setReportData([]);
        setFormData(null);
        setIsReportVisible(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='TimeTable Constraint Report' defaultOpen={true}>
                <ConstraintReportForm onReportGenerated={handleReportGenerated} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report Details' defaultOpen={true}>
                    <ConstraintReportGrid reportData={reportData} formData={formData} onPrint={handlePrint} />
                </CollapsibleSection>
            )}
        </div>
    );
}
