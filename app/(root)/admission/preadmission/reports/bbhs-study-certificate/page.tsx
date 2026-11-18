'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBbhsStudyCertDetails, useBbhsStudyCertLoadData } from '@/hooks/admission/preadmission/reports/useBbhsStudyCertificate';
import { FileText, Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { BbhsCertificatePrint } from './_components/bbhs-certificate-print';
import { FilterForm } from './_components/filter-form';

export default function BbhsStudyCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [certMode, setCertMode] = useState<'0' | '1'>('0');
    const printRef = useRef<HTMLDivElement>(null);

    // Initial data loading
    const { data: initialData, isLoading: isLoadLoading } = useBbhsStudyCertLoadData();
    const studyDetailsMutation = useBbhsStudyCertDetails();

    const handleReport = async (formData: any) => {
        try {
            setCertMode(formData.character as '0' | '1');
            toast.loading('Generating certificate data...', { id: 'bbhs-study-cert' });

            const payload = {
                ASMAY_Id: formData.asmaY_Id,
                ASMCL_Id: formData.asmcL_Id || 0,
                ASMC_Id: formData.asmS_Id || 0,
                AMST_Id: formData.amsT_Id || 0
            };

            const response = await studyDetailsMutation.mutateAsync(payload);
            const data = response.data || response;

            const studentListData = data.studentList || data.studentlist || [];
            if (studentListData.length > 0) {
                const masterCompany = data.masterCompany?.[0] || {};

                const mappedStudentList = studentListData.map((student: any) => {
                    // Parent name logic based on legacy AngularJS requirement
                    const fName = student.fathername || student.fatherName || '';
                    const mName = student.mothername || student.motherName || '';
                    let parentNameText = '';

                    if (formData.paretsnamefather === '0') {
                        parentNameText = `Mr. ${fName}`;
                    } else if (formData.paretsnamefather === '1') {
                        parentNameText = `Mrs. ${mName}`;
                    } else if (formData.paretsnamefather === '2') {
                        parentNameText = `Mr. ${fName} And Mrs. ${mName}`;
                    } else {
                        parentNameText = fName;
                    }

                    // Robust Year extraction
                    const getYear = (dateStr: any) => {
                        if (!dateStr) return '';
                        const d = new Date(dateStr);
                        return isNaN(d.getTime()) ? dateStr : d.getFullYear().toString();
                    };

                    const fromYear = getYear(data.academicList1?.[0]?.asmaY_From_Date);
                    const toYear = getYear(data.academicList1?.[0]?.asmaY_To_Date);

                    return {
                        amsT_Id: student.amsT_Id || student.AMST_Id,
                        studentname: student.studentnam || student.studentname || student.amsT_FirstName,
                        fathername: fName,
                        mothername: mName,
                        parentNameText,
                        className: student.class || student.className || '',
                        section: student.section || '',
                        admNo: student.admno || student.admNo || '',
                        admno: student.admno || student.admNo || '',
                        dob: student.dob,
                        dobinwords: student.dobwords || '',
                        fromYear,
                        toYear,
                        street: student.street,
                        area: student.area,
                        city: student.city,
                        pincode: student.pincode,
                        acadamicyear: student.acadamicyear,
                        currentDate: formData.date
                    };
                });

                setReportData({
                    studentList: mappedStudentList,
                    masterCompany,
                    principalsign: data.principalsign?.[0] || null
                });
                setShowReport(true);
                toast.success(`Generated certificate for ${mappedStudentList[0].studentname}`, { id: 'bbhs-study-cert' });
            } else {
                toast.error('No student records found', { id: 'bbhs-study-cert' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to load certificate details', { id: 'bbhs-study-cert' });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `BBHS_${certMode === '1' ? 'Character' : 'Study'}_Certificate`
    });

    if (isLoadLoading) {
        return (
            <div className='flex h-[400px] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='ml-2 font-medium'>Loading form options...</span>
            </div>
        );
    }

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection
                title='BBHS Study Certificate Report'
                description="Generate Study and Character certificates for Baldwin Boys' High School"
                defaultOpen={true}>
                <Card className='border-none shadow-none'>
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

            {studyDetailsMutation.isPending && (
                <div className='flex flex-col items-center justify-center space-y-4 p-12'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='animate-pulse font-medium text-muted-foreground'>Preparing certificate preview...</p>
                </div>
            )}

            {showReport && reportData && (
                <div className='fade-in zoom-in animate-in space-y-4 duration-300'>
                    <div className='sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-slate-50 p-4 shadow-sm'>
                        <div className='flex items-center gap-2'>
                            <FileText className='h-5 w-5 text-primary' />
                            <h3 className='font-semibold text-lg text-slate-700'>
                                {certMode === '1' ? 'Character' : 'Study'} Certificate Preview
                            </h3>
                        </div>
                        <Button onClick={() => handlePrint()} className='bg-primary transition-all hover:bg-primary/90 active:scale-95'>
                            <Printer className='mr-2 h-4 w-4' /> Print Document
                        </Button>
                    </div>

                    <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-slate-300 border-dashed bg-slate-200 p-4 md:p-8'>
                        <div className='mb-12 origin-top bg-white shadow-2xl'>
                            <BbhsCertificatePrint ref={printRef} data={reportData} mode={certMode} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
