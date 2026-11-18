'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useAlexanderTcDetails,
    useAlexanderTcLoadData
} from '@/hooks/admission/preadmission/reports/useAlexanderTC';
import { CheckCircle2, Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { AlexanderTCPrint } from './_components/alexander-tc-print';
import { FilterForm } from './_components/filter-form';

export default function AlexanderTCPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: initialData, isLoading: isLoadLoading } = useAlexanderTcLoadData();
    const detailsMutation = useAlexanderTcDetails();

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Preparing Transfer Certificate...', { id: 'alexander-tc' });

            const payload = {
                ASMAY_Id: Number.parseInt(formData.asmaY_Id),
                tctemporper: formData.tctemporper,
                AMST_Id: formData.amsT_Id ? Number.parseInt(formData.amsT_Id) : 0
            };

            const response = await detailsMutation.mutateAsync(payload);
            const data = response.data || response;

            let stList = data.result || data.studentTCList;

            if (stList && stList.length > 0) {
                // Deduplicate the student list to avoid printing multiple reports for the same student
                const uniqueStudentsMap = new Map();
                stList.forEach((student: any) => {
                    const uniqueId = student.amst_admno || student.amsT_AdmNo || student.amst_registrationno || student.amsT_Id || student.AMST_Id;
                    if (!uniqueStudentsMap.has(uniqueId)) {
                        uniqueStudentsMap.set(uniqueId, student);
                    }
                });
                stList = Array.from(uniqueStudentsMap.values());

                const academicList = data.academicList1 || [];
                const acaFromDateStr = academicList[0]?.asmaY_From_Date;
                const acaToDateStr = academicList[0]?.asmaY_To_Date;

                const getYearSubstring = (dateStr: any) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return '';
                    return d.getFullYear().toString().substring(2);
                };

                const fromyear = getYearSubstring(acaFromDateStr);
                const toyear = getYearSubstring(acaToDateStr);

                const mappedStudentList = stList.map((student: any) => {
                    return {
                        amsT_Id: student.amsT_Id || student.AMST_Id,
                        tcno: student.astc_tcno || student.astC_TCNO,
                        admno: student.amst_admno || student.amst_registrationno || student.amsT_AdmNo || student.amsT_RegistrationNo,
                        studentName: student.studentname || `${student.amsT_FirstName || ''} ${student.amsT_MiddleName || ''} ${student.amsT_LastName || ''}`.trim(),
                        fatherName: student.amst_fathername || student.amsT_FatherName || '',
                        lbldoa: student.amst_date || student.amsT_Date,
                        transfer_from: formData.transfer_from || student.institutionname || student.astC_PreviousSchool || data.masterCompany?.[0]?.companyname || '',
                        left_on_date: formData.left_on_date || student.astc_lastattendeddate || student.astC_LastAttendedDate,
                        classname: student.classname || '',
                        fromyear: fromyear,
                        toyear: toyear,
                        lbldob: student.amst_dob || student.amsT_DOB,
                        lbldobwords: student.amst_dob_words || student.amsT_DOB_Words,
                        lblPromotion: student.qualificlass || '',
                        todaydate: formData.ASA_FromDate || student.tcdatess || student.astC_TCIssueDate || new Date(),
                        sex: student.amst_sex || student.sex || student.AMST_Sex || student.amsT_Sex || '',
                        logo: student.logo || data.masterCompany?.[0]?.logo || ''
                    };
                });

                const finalData = {
                    studentList: mappedStudentList
                };

                setReportData(finalData);
                setShowReport(true);
                toast.success('Certificate details loaded successfully.', { id: 'alexander-tc' });
            } else {
                toast.error('No record found for selection.', { id: 'alexander-tc' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to generate report.', { id: 'alexander-tc' });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Alexander_Transfer_Certificate_${reportData?.studentList?.[0]?.admno || ''}`
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
                title='Alexander Transfer Certificate Report'
                description='Alexandra School Amritsar transfer certificate generation module.'
                defaultOpen={!showReport}>
                <Card className='border-none bg-slate-50/50 shadow-none'>
                    <CardContent className='pt-6'>
                        <FilterForm
                            initialData={initialData?.data || initialData}
                            onSubmit={handleReport}
                            onReset={() => {
                                setReportData(null);
                                setShowReport(false);
                            }}
                        />
                    </CardContent>
                </Card>
            </CollapsibleSection>

            {detailsMutation.isPending && (
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
                            <AlexanderTCPrint ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
