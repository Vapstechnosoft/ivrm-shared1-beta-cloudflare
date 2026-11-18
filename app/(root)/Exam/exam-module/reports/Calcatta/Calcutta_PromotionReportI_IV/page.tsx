'use client';

import { getCalcuttaPromotionReportI_IV } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CalcuttaPromotionReportForm from './_components/report-form';
import CalcuttaPromotionReportView from './_components/report-list';

export default function CalcuttaPromotionReportItoIVPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFormSubmit = async (payload: any) => {
        try {
            setLoading(true);
            setReportData(null);
            const res = await getCalcuttaPromotionReportI_IV(payload);
            console.log('calcutta promotion report i to iv', res);
            setReportData({
                ...res,
                EMPG_GroupName: payload.empG_GroupName || payload.EMPG_GroupName,
                ASMAY_Year: payload.ASMAY_Year || ''
            });
            toast.success('Report generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 p-6'>
            <div className='flex flex-col gap-6'>
                <CalcuttaPromotionReportForm onSuccess={handleFormSubmit} />
                {loading && (
                    <div className='flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm print:hidden'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    </div>
                )}
                {!loading && reportData && (
                    <CalcuttaPromotionReportView
                        data={reportData}
                        institution={reportData?.getinstitution?.[0] || null}
                        examwisetotal={reportData?.examwisetotal}
                    />
                )}
            </div>
        </div>
    );
}
