'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBcehStudyCertDetails, useBcehStudyCertLoadData } from '@/hooks/admission/preadmission/reports/useBcehStudyCertificate';
import { CheckCircle2, Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { BcehStudyCertPrint } from './_components/bceh-study-cert-print';
import { FilterForm } from './_components/filter-form';

export default function BcehStudyCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [certType, setCertType] = useState<'0' | '2'>('0');
    const printRef = useRef<HTMLDivElement>(null);

    const { data: initialData, isLoading: isLoadLoading } = useBcehStudyCertLoadData();
    const studyDetailsMutation = useBcehStudyCertDetails();

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Preparing Study Certificate...', { id: 'bceh-study-cert' });

            const payload = {
                ASMAY_Id: Number.parseInt(formData.asmaY_Id),
                ASMCL_Id: formData.asmcL_Id ? Number.parseInt(formData.asmcL_Id) : 0,
                ASMC_Id: formData.asmS_Id ? Number.parseInt(formData.asmS_Id) : 0,
                AMST_Id: formData.amsT_Id ? Number.parseInt(formData.amsT_Id) : 0
            };

            const response = await studyDetailsMutation.mutateAsync(payload);
            const data = response.data || response;

            const stList = data.studentlist || data.studentList;

            if (stList && stList.length > 0) {
                const academicList = data.academicList1 || [];
                const acaToDateStr = academicList[0]?.asmaY_To_Date;

                const getMonthName = (dateStr: any) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return '';
                    return [
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
                    ][d.getMonth()];
                };

                const getYear = (dateStr: any) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return '';
                    return d.getFullYear().toString();
                };

                const toMonth = getMonthName(acaToDateStr);
                const toYear = getYear(acaToDateStr);

                const mappedStudentList = stList.map((student: any) => {
                    const joinDateStr = student.joindate || student.AMST_Date || student.admyear;
                    const amstDateMonth = getMonthName(joinDateStr);
                    const joinedYearSplit = student.acadamicyear
                        ? student.acadamicyear.split('-')[0]
                        : getYear(joinDateStr) || (student.JoinedYear || student.joinedYear || '').split('-')[0];

                    return {
                        amsT_Id: student.amsT_Id || student.AMST_Id,
                        studentName: student.studentnam || student.amsT_FirstName || '',
                        fatherName: student.fathername || student.fatherName || '',
                        motherName: student.mothername || '',
                        admNo: student.admno || student.admNo || '',
                        gender: student.AMST_Sex || student.gender || '',
                        joinedClass: student.joinedclass || student.JoinedClass || student.joinedClass || '',
                        joinedYearInfo: `${amstDateMonth ? amstDateMonth + '-' : ''}${joinedYearSplit}`.toUpperCase(),
                        presentClass: student.classstudying || student.PresentClass || student.class || '',
                        presentYearInfo: `${toMonth ? toMonth + '-' : ''}${toYear}`.toUpperCase(),
                        dob: student.dob || '',
                        dobInWords: student.dobwords || '',
                        casteName: student.caste_name || student.casteName || '',
                        motherTongue: student.stumt || student.stuMT || student.motherTongue || '',
                        currentDate: formData.ASA_FromDate
                    };
                });

                const finalData = {
                    studentList: mappedStudentList,
                    principalsign: data.principalsign?.[0]?.ivrmgC_PrincipalSign || null
                };

                setReportData(finalData);
                setCertType((formData.Character === '2' ? '2' : '0') as '0' | '2');
                setShowReport(true);
                toast.success('Certificate details loaded successfully.', { id: 'bceh-study-cert' });
            } else {
                toast.error('No record found for selection.', { id: 'bceh-study-cert' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to generate report.', { id: 'bceh-study-cert' });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `BCEH_Study_Certificate_${reportData?.studentList?.[0]?.admNo || ''}`
    });

    if (isLoadLoading) {
        return (
            <div className='flex h-[400px] flex-col items-center justify-center space-y-4'>
                <Loader2 className='h-10 w-10 animate-spin text-primary' />
                <span className='animate-pulse font-medium text-lg text-slate-500'>Initializing report engine...</span>
            </div>
        );
    }

    return (
        <div className='container mx-auto max-w-7xl space-y-6 p-4'>
            <CollapsibleSection
                title='BCEH Study Certificate Report'
                description='Baldwin Co-Education High School study and bonafide certification module.'
                defaultOpen={!showReport}>
                <Card className='border-none bg-slate-50/50 shadow-none'>
                    <CardContent className='pt-6'>
                        <FilterForm
                            initialData={initialData?.data || initialData}
                            onSubmit={handleReport}
                            onReset={() => {
                                setReportData(null);
                                setShowReport(false);
                                setCertType('0');
                            }}
                        />
                    </CardContent>
                </Card>
            </CollapsibleSection>

            {studyDetailsMutation.isPending && (
                <div className='flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-slate-200 border-dashed bg-white p-16'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='font-medium text-lg text-slate-500'>Fetching student records and generating preview...</p>
                </div>
            )}

            {showReport && reportData && (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500'>
                    <div className='sticky top-0 z-20 flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-full bg-green-100 p-2'>
                                <CheckCircle2 className='h-6 w-6 text-green-600' />
                            </div>
                            <div>
                                <h3 className='font-bold text-slate-800 text-xl'>Certificate Preview</h3>
                                <p className='max-w-[300px] truncate font-medium text-slate-500 text-sm uppercase'>
                                    {reportData.studentList.length > 1
                                        ? `${reportData.studentList.length} Students`
                                        : `Student: ${reportData.studentList[0].studentName}`}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handlePrint()}
                            size='lg'
                            className='min-w-[200px] bg-primary shadow-md transition-all hover:bg-primary/95 active:scale-95'>
                            <Printer className='mr-2 h-5 w-5' /> Print Certificate
                        </Button>
                    </div>

                    <div className='flex min-h-[1000px] justify-center overflow-x-auto rounded-2xl border-4 border-slate-200 border-dashed bg-slate-100 p-4 md:p-12'>
                        <div className='origin-top transform bg-white shadow-2xl transition-all duration-300 hover:scale-[1.005]'>
                            <BcehStudyCertPrint ref={printRef} data={reportData} mode={certType} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
