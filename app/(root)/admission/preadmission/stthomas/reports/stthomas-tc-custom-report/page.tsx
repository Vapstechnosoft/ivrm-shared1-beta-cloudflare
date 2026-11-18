'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useStthomasTcReport } from '@/hooks/admission/preadmission/useStthomasTcCustomReport';
import type { StthomasTcCustomReportFields } from '@/schemas/admission/preadmission/reports/stthomas-tc-custom-report';
import { format } from 'date-fns';
import { FileCheck, Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { StThomasTcPrint } from './_components/stthomas-tc-print';

export default function StThomasTcCustomReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useStthomasTcReport();

    const handleReport = async (formData: StthomasTcCustomReportFields) => {
        try {
            toast.loading('Generating TC Report...', { id: 'stthomas-tc' });

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id || 0,
                ASMS_Id: formData.ASMS_Id || 0,
                AMST_Id: formData.AMST_Id as number,
                tctemporper: formData.temporper
            };

            const response = (await tcReportMutation.mutateAsync(payload)) as any;

            if (response.success && response.data?.result?.[0]) {
                const mainData = response.data.result[0];
                const academic = response.data.academicList1?.[0];

                // Map the data for the print component
                const mappedData = {
                    tcno: mainData.astc_tcno || '',
                    addno: mainData.amst_admno || '',
                    lblstdname: mainData.studentname || '',
                    lblfathername: mainData.amst_fathername || '',
                    lblmothername: mainData.amst_mothername || '',
                    leftdate: mainData.astc_tcissuedate || mainData.astc_lastattendeddate || '',
                    lblconduct: mainData.astc_conduct || 'Good',
                    astC_FeePaid: mainData.astc_feepaid || 'Yes',
                    laststudied: mainData.last_class_studied || mainData.classname || '',
                    lblPromotion: mainData.promotionflag || 'Granted',
                    lbldob: mainData.amst_dob || '',
                    lbldoa: mainData.amst_date || '',
                    lbldobwords: mainData.amst_dob_words || '',
                    todaydate: mainData.tcdatess || new Date().toISOString(),
                    logo: mainData.logo || '',

                    // Academic Year Details
                    frommonth1: academic?.asmaY_From_Date ? format(new Date(academic.asmaY_From_Date), 'MMMM') : 'April',
                    fromyear: academic?.asmaY_From_Date ? format(new Date(academic.asmaY_From_Date), 'yyyy') : '',
                    tomonth1: academic?.asmaY_To_Date ? format(new Date(academic.asmaY_To_Date), 'MMMM') : 'March',
                    toyear: academic?.asmaY_To_Date ? format(new Date(academic.asmaY_To_Date), 'yyyy') : '',

                    // Extra Info
                    subjectstudied: mainData.subjectstudied || '',
                    nationality: mainData.nationality || 'Indian',
                    religion: mainData.religion || '',
                    caste: mainData.caste || '',
                    leavingreason: mainData.astc_leavingreason || 'seeking admission elsewhere'
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'stthomas-tc' });
            } else {
                toast.error('No TC data found for the selected student', { id: 'stthomas-tc' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'stthomas-tc' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `ST_THOMAS_TC_${reportData?.lblstdname || 'Report'}`
    });

    return (
        <div className='container-fluid mx-auto min-h-screen space-y-8 bg-slate-50/30 p-6'>
            <header className='flex flex-col gap-2'>
                <h1 className='font-bold text-3xl text-slate-900 tracking-tight'>St. Thomas' Custom TC Report</h1>
                <p className='text-slate-500'>Generate and print official Transfer Certificates for students.</p>
            </header>

            <CollapsibleSection
                title='Search Criteria'
                description='Select student and report parameters'
                defaultOpen={true}
                className='border-slate-200 shadow-sm'>
                <div className='bg-white p-2'>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-700'>
                    <Card className='border-indigo-100 border-dashed bg-indigo-50/30'>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <CardTitle className='flex items-center gap-2 font-medium text-lg'>
                                <FileCheck className='h-5 w-5 text-indigo-600' />
                                Certificate Preview
                            </CardTitle>
                            <Button
                                onClick={() => handlePrint()}
                                size='lg'
                                className='bg-indigo-600 shadow-indigo-200 shadow-lg hover:bg-indigo-700'>
                                <Printer className='mr-2 h-5 w-5' /> Print TC
                            </Button>
                        </CardHeader>
                        <CardContent className='flex justify-center bg-slate-200 p-8'>
                            <div className='transform bg-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transition-all hover:scale-[1.01]'>
                                <StThomasTcPrint ref={printRef} data={reportData} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className='flex flex-col items-center justify-center space-y-4 p-24'>
                    <div className='relative'>
                        <Loader2 className='h-16 w-16 animate-spin text-indigo-600' />
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <div className='h-4 w-4 animate-pulse rounded-full bg-indigo-600'></div>
                        </div>
                    </div>
                    <div className='text-center'>
                        <h3 className='font-semibold text-slate-800 text-xl'>Processing Requirements</h3>
                        <p className='text-slate-500'>Generating certificate preview, please wait...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper to map month ID to Full Month Name as per legacy logic
function getMonthName(monthId: number): string {
    const months = [
        'JANUARY',
        'FEBRUARY',
        'MARCH',
        'APRIL',
        'MAY',
        'JUNE',
        'JULY',
        'AUGUST',
        'SEPTEMBER',
        'OCTOBER',
        'NOVEMBER',
        'DECEMBER'
    ];
    return months[monthId] || '';
}
