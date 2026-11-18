'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useCbsTcReport, useCbsTcSave } from '@/hooks/admission/preadmission/useCbsStudentTc';
import type { CbsStudentTcFields } from '@/schemas/admission/preadmission/reports/cbs-student-tc.schema';
import { Loader2, Printer, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { TcPrint } from './_components/tc-print';

export default function CbsStudentTcPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useCbsTcReport();
    const tcSaveMutation = useCbsTcSave();

    // Normalizes legacy arrays that might be wrapped in $values
    const normalizeArray = (arr: any) => {
        if (!arr) return [];
        if (arr.$values) return Array.isArray(arr.$values) ? arr.$values : [arr.$values];
        return Array.isArray(arr) ? arr : [arr];
    };

    const switchFunction = (sno: string | undefined | null) => {
        if (!sno) return '';
        try {
            const val = sno.toString().trim().toUpperCase();
            switch (val) {
                case 'I':
                    return 'FIRST';
                case 'II':
                    return 'SECOND';
                case 'III':
                    return 'THIRD';
                case 'IV':
                    return 'FOURTH';
                case 'V':
                    return 'FIFTH';
                case 'VI':
                    return 'SIXTH';
                case 'VII':
                    return 'SEVENTH';
                case 'VIII':
                    return 'EIGHTH';
                case 'IX':
                    return 'NINTH';
                case 'X':
                    return 'TENTH';
                case 'XI':
                    return 'Eleventh';
                case 'XII':
                    return 'Twelfth';
                case 'NURSERY':
                    return 'Nursery';
                case 'TRANSITION':
                    return 'Transition';
                default:
                    return sno || '';
            }
        } catch (e) {
            return sno || '';
        }
    };

    const getMonthNames = (monthId: number) => {
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
    };

    const handleReport = async (formData: CbsStudentTcFields) => {
        try {
            if (formData.reporttype === 'indi' && !formData.amsT_Id) {
                toast.error('Please select a student');
                return;
            }

            toast.loading('Generating CBS Student Transfer Certificate...', { id: 'cbs-tc' });

            const payload: any = {
                ASMAY_Id: Number(formData.asmaY_Id),
                AMST_Id: formData.amsT_Id?.amsT_Id || 0,
                tctemporper: formData.temporper,
                ASCISS_CertificateFlg: 'TC',
                report_type: formData.amsT_Id ? 'indi' : formData.reporttype,
                Boardtype: formData.Boardtype,
                BSPID: formData.BSPID,
                Previous_School_Name: formData.Previous_School_Name
            };

            // Only add class/section if it's a bulk/search-based "All" report
            if (!formData.amsT_Id) {
                payload.ASMCL_Id = Number(formData.asmcL_Id) || 0;
                payload.ASMS_Id = Number(formData.asmS_Id) || 0;
                payload.search = formData.search || '';
            }
            const response = (await tcReportMutation.mutateAsync(payload)) as any;
            const data = response?.data || response;

            const studentTCList = normalizeArray(data.studentTCList || data.result);
            const academicList = normalizeArray(data.academicList1);
            const classJoinList = normalizeArray(data.classnamejoin);
            const accYearList = normalizeArray(data.accyear);

            if (!data || studentTCList.length === 0) {
                toast.error('Failed to fetch certificate data or no records found', { id: 'cbs-tc' });
                return;
            }

            // Porting legacy mapping logic for ALL found students
            const academicInfo = academicList[0] || {};
            const dateFrom = academicInfo.asmaY_From_Date ? new Date(academicInfo.asmaY_From_Date) : null;
            const dateTo = academicInfo.asmaY_To_Date ? new Date(academicInfo.asmaY_To_Date) : null;

            const fromMonth = dateFrom && !isNaN(dateFrom.getTime()) ? getMonthNames(dateFrom.getMonth()) : '';
            const toMonth = dateTo && !isNaN(dateTo.getTime()) ? getMonthNames(dateTo.getMonth()) : '';
            const fromYear = dateFrom && !isNaN(dateFrom.getTime()) ? dateFrom.getFullYear() : '';
            const toYear = dateTo && !isNaN(dateTo.getTime()) ? dateTo.getFullYear() : '';

            let studentListTransformed = studentTCList
                .map((tcData: any) => {
                    if (!tcData) return null;
                    const studId = tcData.amsT_Id || tcData.AMST_Id || tcData.amst_id || 0;
                    const lastStudiedWord = switchFunction(tcData.Last_Class_Studied || tcData.last_class_studied);
                    const gender = (tcData.amsT_Sex || tcData.amst_sex || '').toString().toLowerCase();

                    return {
                        ...tcData,
                        amsT_Id: studId,
                        imgname: tcData.logo || data.logo || 'https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg',
                        tcno: tcData.astC_TCNO || tcData.astc_tcno || '',
                        admno: tcData.amsT_RegistrationNo || tcData.amst_registrationno || '',
                        lblstdname: tcData.studentname || tcData.amsT_FirstName || '',
                        lblfathername: tcData.amsT_FatherName || tcData.amst_fathername || '',
                        abbrivation: gender === 'male' ? 'Master. ' : 'Miss. ',
                        lbldob: tcData.amsT_DOB || tcData.amst_dob,
                        lbldobwords: (tcData.amsT_DOB_Words || tcData.amst_dob_words || '').toString(),
                        lbldoa: tcData.amsT_Date || tcData.amst_date,
                        leftdate: tcData.leftdate || tcData.astC_TCIssueDate || tcData.astc_tcissuedate || tcData.last_date_attended,
                        lblconduct: (tcData.astC_Conduct || tcData.astc_conduct || 'GOOD').toString(),
                        laststudied: (tcData.Last_Class_Studied || tcData.last_class_studied || '').toString(),
                        laststudiedinwords: lastStudiedWord,
                        asmC_SectionName: (tcData.asmC_SectionName || tcData.asmc_sectionname || '').toString(),
                        Boardtype: formData.Boardtype || 'ICSE',
                        resulttype: formData.resulttype || '',
                        BSPID: formData.BSPID || tcData.BSPID || '',
                        Previous_School_Name: formData.Previous_School_Name || tcData.Previous_School_Name || '',
                        joinclass: (classJoinList[0]?.classjoinname || '').toString(),
                        currentyear: (
                            academicInfo.asmaY_Year ||
                            accYearList.find((y: any) => y.asmaY_Id == Number(formData.asmaY_Id))?.asmaY_Year ||
                            ''
                        ).toString(),
                        frommonth: fromMonth,
                        tomonth: toMonth,
                        fromyear: fromYear,
                        toyear: toYear,
                        lblschoolbegins: fromMonth && toMonth ? `${fromMonth} ${fromYear} TO ${toMonth} ${toYear}` : '',
                        astC_TCIssueDate: tcData.astC_TCIssueDate || tcData.astc_tcissuedate || new Date().toISOString(),
                        ASCISS_QRCode: (tcData.ascisS_QRCode || data.ascisS_QRCode || data.asciss_qrcode || '').toString()
                    };
                })
                .filter(Boolean);

            // If a specific student was picked, we only want that student even if backend returned more
            if (formData.amsT_Id && studentListTransformed.length > 0) {
                studentListTransformed = studentListTransformed.slice(0, 1);
            }

            setReportData({
                studentList: studentListTransformed
            });
            setShowReport(true);
            toast.success(`${studentListTransformed.length} certificates generated successfully`, { id: 'cbs-tc' });

            // Auto-save logic
            handleSave(studentListTransformed, formData);
        } catch (error) {
            console.error('CBS TC Generation Error:', error);
            toast.error('Failed to generate certificates', { id: 'cbs-tc' });
        }
    };

    const handleSave = async (students: any[], formData: CbsStudentTcFields) => {
        try {
            for (const stud of students) {
                const studId = Number(stud.amsT_Id || stud.AMST_Id || stud.amst_id || 0);
                if (studId === 0) {
                    console.warn('Skipping save for student with ID 0');
                    continue;
                }
                const savePayload = {
                    ASMAY_Id: Number(formData.asmaY_Id),
                    ASMCL_Id: Number(formData.asmcL_Id) || 0,
                    ASMC_Id: Number(formData.asmS_Id) || 0,
                    AMST_Id: studId,
                    ASCISS_HtmlTemplate: '',
                    ASCISS_CertificateFlg: 'TC',
                    ASCISS_QRCode: (stud.ASCISS_QRCode || '').toString()
                };
                await tcSaveMutation.mutateAsync(savePayload);
            }
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CBS_TC_${reportData?.lblstdname || 'Student'}`
    });

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection
                title='CBS Student TC Report'
                description='Search and generate Transfer Certificate'
                defaultOpen={true}
                className='shadow-md'>
                <div className='rounded-lg bg-white p-4'>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} onPrint={handlePrint} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <Card className='fade-in slide-in-from-bottom-4 animate-in overflow-hidden shadow-lg duration-500'>
                    <CardHeader className='flex flex-row items-center justify-between border-b bg-slate-50 py-3'>
                        <CardTitle className='flex items-center gap-2 font-semibold text-lg'>
                            <Printer className='h-5 w-5 text-indigo-600' />
                            Certificate Preview
                        </CardTitle>
                        <div className='flex gap-3'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleReset}
                                className='border-red-200 text-red-500 hover:bg-red-50'>
                                <RotateCcw className='mr-2 h-4 w-4' /> Reset
                            </Button>
                            <Button onClick={() => handlePrint()} className='bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'>
                                <Printer className='mr-2 h-4 w-4' /> Print Certificates
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='flex max-h-[800px] justify-center overflow-auto bg-slate-200 p-0 py-8'>
                        <div className='mb-8 origin-top scale-95 bg-white shadow-2xl transition-transform duration-300 hover:scale-100'>
                            <TcPrint ref={printRef} data={reportData} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {tcReportMutation.isPending && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]'>
                    <Card className='zoom-in-95 w-64 animate-in p-6 text-center shadow-2xl'>
                        <Loader2 className='mx-auto mb-4 h-12 w-12 animate-spin text-indigo-600' />
                        <h4 className='font-bold text-lg text-slate-800'>Generating Report</h4>
                        <p className='text-slate-500 text-sm'>Please wait...</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
