'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useCbsCharacterCertDetails,
    useCbsStudyCertDetails,
    useCbsStudyCertLoadData,
    useSaveCbsStudyCertQRCode
} from '@/hooks/admission/preadmission/reports/useCbsStudyCertificate';
import { FileText, Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { CbsCertificatePrint } from './_components/cbs-certificate-print';
import { FilterForm } from './_components/filter-form';

export default function CbsStudyCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [certMode, setCertMode] = useState<'0' | '1' | '2'>('0');
    const printRef = useRef<HTMLDivElement>(null);

    // Initial data loading
    const { data: initialData, isLoading: isLoadLoading } = useCbsStudyCertLoadData();
    const studyDetailsMutation = useCbsStudyCertDetails();
    const characterDetailsMutation = useCbsCharacterCertDetails();
    const saveQRMutation = useSaveCbsStudyCertQRCode();

    const handleReport = async (formData: any) => {
        try {
            setCertMode(formData.character as '0' | '1' | '2');
            toast.loading('Generating certificate data...', { id: 'cbs-study-cert' });

            const payload = {
                ASMAY_Id: formData.asmaY_Id,
                ASMCL_Id: formData.asmcL_Id || 0,
                ASMC_Id: formData.asmS_Id || 0,
                AMST_Id: formData.amsT_Id || 0,
                save_flag: true
            };

            let response;
            if (formData.character === '1') {
                response = await characterDetailsMutation.mutateAsync(payload);
            } else {
                response = await studyDetailsMutation.mutateAsync(payload);
            }

            const data = response.data || response; // Handle variations in apiService response

            if (data && data.studentlist && data.studentlist.length > 0) {
                const masterCompany = data.amC_logo?.[0] || data.masterCompany?.[0] || {};
                const milogo =
                    masterCompany.mI_Logo ||
                    masterCompany.amC_FilePath ||
                    'https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg';

                const mappedStudentList = data.studentlist.map((student: any) => {
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
                        parentNameText = fName && mName ? `${fName} & ${mName}` : fName || mName;
                    }

                    // Address mapping based on radio selection
                    let addressData = {
                        street: student.street,
                        area: student.area,
                        city: student.city
                    };
                    if (formData.address_opt === 'address_con') {
                        addressData = {
                            street: student.constreet || student.street,
                            area: student.conarea || student.area,
                            city: student.concity || student.city
                        };
                    }

                    // Robust Year extraction
                    const getYear = (dateStr: any) => {
                        if (!dateStr) return '';
                        const d = new Date(dateStr);
                        return isNaN(d.getTime()) ? dateStr : d.getFullYear().toString();
                    };

                    const admittedYear = getYear(student.joinedyear || student.admitedyear);
                    const leftYear = getYear(student.leftyear || student.acadamicyear);

                    // Academic year range or single year
                    const academicYearRange =
                        admittedYear && leftYear && admittedYear !== leftYear ? `${admittedYear} - ${leftYear}` : leftYear || admittedYear;

                    return {
                        amsT_Id: student.amsT_Id,
                        studentname: student.studentnam || student.amsT_FirstName,
                        fathername: fName,
                        mothername: mName,
                        genderLabel: student.AMST_Sex === 'FEMALE' || student.AMST_Sex === 'Female' ? 'Miss' : 'Master',
                        className: student.leftclass || student.class,
                        section: student.section || '',
                        admno: student.admno || student.amsT_AdmNo,
                        rollNo: student.rollNo,
                        date: formData.date,
                        boardType: formData.boardType,
                        charType: formData.charType,
                        milogo: milogo,
                        acadamicyear: academicYearRange,
                        dob: student.dob,
                        dobinwords: student.dobwords || '',
                        admitedyear: admittedYear,
                        admitedclass: student.joinedclass || student.admitedclass,
                        parentNameText,
                        ...addressData
                    };
                });

                setReportData({
                    studentList: mappedStudentList,
                    masterCompany
                });
                setShowReport(true);
                toast.success(`Generated ${mappedStudentList.length} certificate(s)`, { id: 'cbs-study-cert' });
            } else {
                toast.error('No student records found', { id: 'cbs-study-cert' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('Failed to load certificate details', { id: 'cbs-study-cert' });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CBS_${certMode === '1' ? 'Character' : certMode === '2' ? 'NoObjection' : 'Study'}_${reportData?.studentname || 'Cert'}`
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
                title='Study & Character Certificate'
                description='Generate institutional certificates for current and past students'
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

            {(studyDetailsMutation.isPending || characterDetailsMutation.isPending) && (
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
                                {certMode === '1' ? 'Character' : certMode === '2' ? 'No Objection' : 'Study'} Certificate Preview
                            </h3>
                        </div>
                        <Button onClick={() => handlePrint()} className='bg-primary transition-all hover:bg-primary/90 active:scale-95'>
                            <Printer className='mr-2 h-4 w-4' /> Print Document
                        </Button>
                    </div>

                    <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-slate-300 border-dashed bg-slate-200 p-4 md:p-8'>
                        <div className='mb-12 origin-top bg-white shadow-2xl'>
                            <CbsCertificatePrint ref={printRef} data={reportData} mode={certMode} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
