'use client';

import { useStAnnsTcDetails } from '@/hooks/admission/preadmission/useStAnnsTcReport';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import TcReport from './_components/tc-report';

export default function StAnnsTcCustomReportPage() {
    const detailsMutation = useStAnnsTcDetails();
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Fetching TC details...', { id: 'tc-report' });

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id || 0,
                ASMS_Id: formData.ASMS_Id || 0,
                AMST_Id: formData.AMST_Id,
                tctemporper: formData.temporper
            };

            const response = await detailsMutation.mutateAsync(payload);

            if (response?.data?.result?.length > 0) {
                setReportData(response.data);
                setShowReport(true);
                toast.success('Report generated successfully!', { id: 'tc-report' });
            } else {
                toast.error('TC Details not found for the selected student.', { id: 'tc-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please check server logs.', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `StAnns_TC_Report_${new Date().getTime()}`
    });

    return (
        <div className='min-h-screen bg-white p-2'>
            {/* Legacy Style Header Bar */}
            <div className='flex w-full items-center justify-between bg-[#3a5999] px-4 py-1 shadow-sm'>
                <h1 className='flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider'>STUDENT TC CUSTOM REPORT</h1>
                <div className='cursor-pointer text-white hover:opacity-80'>
                    <span className='text-xl leading-none'>−</span>
                </div>
            </div>

            {/* Form Section */}
            <div className='border border-t-0 bg-white p-4'>
                <FilterForm onSubmit={handleReport} onReset={handleReset} onPrint={() => handlePrint()} hasData={showReport} />
            </div>

            {/* Report Preview Section */}
            {showReport && reportData && (
                <div className='mt-8 flex flex-col items-center'>
                    <div className='flex w-full justify-center overflow-x-auto bg-slate-100 p-8'>
                        <div className='bg-white p-0 shadow-2xl'>
                            <TcReport ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}

            {!showReport && (
                <div className='mt-10 flex flex-col items-center justify-center opacity-30'>
                    <Search className='mb-2 h-12 w-12 text-slate-400' />
                    <p className='font-bold text-[10px] text-slate-500 uppercase tracking-widest'>
                        Select criteria and click report to view certificate
                    </p>
                </div>
            )}
        </div>
    );
}
