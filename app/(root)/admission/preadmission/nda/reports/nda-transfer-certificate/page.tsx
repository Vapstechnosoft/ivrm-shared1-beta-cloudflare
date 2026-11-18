'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useNdaTcReportDetails } from '@/hooks/admission/preadmission/useNdaTransferCertificate';
import type { NdaTcFields } from '@/schemas/admission/preadmission/reports/nda-transfer-certificate';
import { Download, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/FilterForm';
import { NdaTcPrint } from './_components/NdaTcPrint';

export default function NdaTransferCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [issuedDate, setIssuedDate] = useState<Date>(new Date());
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useNdaTcReportDetails();

    const handleReport = async (formData: NdaTcFields) => {
        try {
            if (!formData.amsT_Id) {
                toast.error('Please select a student');
                return;
            }

            toast.loading('Generating NDA Transfer Certificate...', { id: 'nda-tc' });
            setIssuedDate(formData.Date11);

            const payload = {
                ASMAY_Id: Number(formData.asmaY_Id),
                AMST_Id: formData.amsT_Id?.amsT_Id || (formData.amsT_Id as any),
                tctemporper: formData.tctemporper
            };

            const response = (await tcReportMutation.mutateAsync(payload)) as any;
            const data = response?.data || response;

            if (!data) {
                toast.error('Failed to fetch certificate data', { id: 'nda-tc' });
                return;
            }

            const studentTCList = data.studentTCList;

            if (studentTCList && Array.isArray(studentTCList) && studentTCList.length > 0) {
                const tcData = studentTCList[0];

                // Merge lists for the print component as per legacy logic
                const mappedData = {
                    ...tcData,
                    studenttcdetails: data.studenttcdetails,
                    academicList1: data.academicList1,
                    masterCompany: data.masterCompany,
                    admno: tcData.amst_admno || tcData.amsT_AdmNo || '',
                    tcno: tcData.astc_tcno || tcData.astC_TCNO || '',
                    lblstdname: tcData.studentname || tcData.lblstdname || '',
                    lblfathername: tcData.amst_fathername || tcData.amsT_FatherName || '',
                    lblmothername: tcData.amst_mothername || tcData.amsT_MotherName || '',
                    lblreligioncaste: tcData.religion || '',
                    studcaste: tcData.caste || '',
                    lblnationality: tcData.nationality || tcData.lblnationality || '',
                    lbldob: tcData.amst_dob || tcData.amsT_DOB || '',
                    lbldoa: tcData.amst_date || tcData.amsT_Date || '',
                    lblconduct: tcData.astc_conduct || tcData.astC_Conduct || '',
                    last_date_attended: tcData.astc_lastattendeddate || tcData.astC_LastAttendedDate || '',
                    Last_Class_Studied: tcData.last_class_studied || tcData.Last_Class_Studied || '',
                    asmC_SectionName: tcData.asmc_sectionname || tcData.asmC_SectionName || '',
                    ASTC_Remarks: tcData.astc_remarks || tcData.astC_Remarks || '',
                    govtno: tcData.govtno || '',
                    AMST_PENNo: tcData.amst_penno || tcData.AMST_PENNo || '',
                    AMST_APAAANO: tcData.amst_apaaano || tcData.AMST_APAAANO || '',
                    lbllastschool: data.masterCompany?.[0]?.companyname || ''
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Certificate generated successfully', { id: 'nda-tc' });
            } else {
                toast.error('No TC records found for this student', { id: 'nda-tc' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('NDA TC Generation Error:', error);
            toast.error('Failed to generate certificate', { id: 'nda-tc' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `NDA_TC_${reportData?.lblstdname || 'Student'}`
    });

    return (
        <div className='fade-in container mx-auto animate-in space-y-8 p-6 duration-700'>
            <CollapsibleSection
                title='Search Filter'
                description='Select student type and year to generate certificate'
                defaultOpen={true}
                className='rounded-3xl border-none bg-white/60 shadow-xl backdrop-blur-md'>
                <div className='p-2'>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className='slide-in-from-bottom-10 animate-in space-y-6 pb-20 duration-700'>
                    <Card className='overflow-hidden rounded-3xl border-none bg-indigo-50/80 shadow-2xl ring-1 ring-indigo-100 backdrop-blur-lg'>
                        <CardContent className='p-6'>
                            <div className='flex flex-col items-center justify-between gap-6 md:flex-row'>
                                <div className='flex items-center gap-5'>
                                    <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg'>
                                        <Printer className='h-8 w-8' />
                                    </div>
                                    <div>
                                        <h3 className='font-black text-2xl text-indigo-950'>{reportData.lblstdname}</h3>
                                        <p className='font-bold text-indigo-600 tracking-wider'>
                                            {reportData.admno} | {reportData.Last_Class_Studied}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex w-full flex-wrap gap-3 md:w-auto'>
                                    <Button
                                        onClick={() => handlePrint()}
                                        className='h-12 flex-1 rounded-full bg-indigo-600 px-8 font-bold text-white shadow-indigo-100 shadow-xl transition-all hover:bg-indigo-700 md:flex-none'>
                                        <Printer className='mr-2 h-5 w-5' /> PRINT TC
                                    </Button>
                                    <Button
                                        variant='outline'
                                        onClick={handleReset}
                                        className='h-12 flex-1 rounded-full border-indigo-200 font-bold text-indigo-700 hover:bg-white md:flex-none'>
                                        <RotateCcw className='mr-2 h-5 w-5' /> REFRESH
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className='preview-container flex min-h-[800px] justify-center overflow-x-auto rounded-[2rem] border-2 border-slate-300 border-dashed bg-slate-200/50 p-4 shadow-inner md:p-12'>
                        <div className='shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:scale-[1.01]'>
                            <NdaTcPrint ref={printRef} data={reportData} issuedDate={issuedDate} />
                        </div>
                    </div>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm'>
                    <Card className='zoom-in-90 w-80 animate-in rounded-3xl border-none p-8 text-center shadow-2xl'>
                        <div className='relative mb-6'>
                            <Loader2 className='mx-auto h-20 w-20 animate-spin text-indigo-600' />
                            <Download className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-8 w-8 text-indigo-400' />
                        </div>
                        <h4 className='mb-2 font-black text-slate-800 text-xl'>Generating...</h4>
                        <p className='font-medium text-slate-500 text-sm'>Please wait while we compile the official records.</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
