'use client';
import { Card, CardContent } from '@/components/ui/card';
import type { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import { useState } from 'react';
import FeeIncomeTaxForm from './components/feeIncomeTax_Form';
import FeeIncomeTaxReport from './components/feeIncomeTax_report';

export default function FeeIncomeTaxReportPage() {
    const [reportData, setReportData] = useState<IFeeIncomeTaxReportResult[]>([]);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = (data: IFeeIncomeTaxReportResult[]) => {
        setReportData(data);
        setShowReport(true);
    };

    const handleCloseReport = () => {
        setShowReport(false);
    };
    const handleResetForm = () => {
        setReportData([]);
        setShowReport(false);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <Card className='shadow-lg'>
                <CardContent className='p-6'>
                    <FeeIncomeTaxForm onReportGenerated={handleReportGenerated} onReset={handleResetForm} />
                </CardContent>
            </Card>

            {showReport && reportData.length > 0 && <FeeIncomeTaxReport data={reportData} onClose={handleCloseReport} />}
        </div>
    );
}
