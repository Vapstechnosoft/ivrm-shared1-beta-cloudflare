'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBbhsStudentTcDetails, useBbhsStudentTcInitialData } from '@/hooks/admission/preadmission/reports/useBbhsStudentTcReportCustom';
import type { BbhsStudentTcCustomFields } from '@/schemas/admission/preadmission/reports/bbhs-student-tc-custom.schema';
import { Loader2, Printer, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { BbhsTcPrint } from './_components/bbhs-tc-print';
import { FilterForm } from './_components/filter-form';

export default function BbhsStudentTcCustomPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: initialData, isLoading: isInitialLoading } = useBbhsStudentTcInitialData();
    const detailsMutation = useBbhsStudentTcDetails();

    const switchFunction = (sno: string | undefined | null, level = 0) => {
        if (!sno) return '';
        const val = sno.toString().toUpperCase();
        switch (val) {
            case 'I':
                return level === 1 ? 'First' : 'FIRST';
            case 'II':
                return level === 1 ? 'Second' : 'SECOND';
            case 'III':
                return level === 1 ? 'Third' : 'THIRD';
            case 'IV':
                return level === 1 ? 'Fourth' : 'FOURTH';
            case 'V':
                return level === 1 ? 'Fifth' : 'FIFTH';
            case 'VI':
                return level === 1 ? 'Sixth' : 'SIXTH';
            case 'VII':
                return level === 1 ? 'Seventh' : 'SEVENTH';
            case 'VIII':
                return level === 1 ? 'Eighth' : 'EIGHTH';
            case 'IX':
                return level === 1 ? 'Ninth' : 'NINTH';
            case 'X':
                return level === 1 ? 'Tenth' : 'TENTH';
            default:
                return '';
        }
    };

    const getMonthNames = (monthId: number, isMiid4 = false) => {
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
        const monthsMIID4 = [
            'January-',
            'February-',
            'March-',
            'April-',
            'May-',
            'June-',
            'July-',
            'August-',
            'September-',
            'October-',
            'November-',
            'December-'
        ];
        return isMiid4 ? monthsMIID4[monthId] : months[monthId];
    };

    const toCamelCase = (str: string) => {
        return str
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleReport = async (formData: BbhsStudentTcCustomFields) => {
        try {
            toast.loading('Fetching Student TC Details...', { id: 'bbhs-tc' });

            const payload = {
                ASMAY_Id: Number.parseInt(formData.asmaY_Id),
                AMST_Id: formData.AMST_Id.amsT_Id
            };

            const response = await detailsMutation.mutateAsync(payload);
            const data = response.data || response;

            if (!data || !data.studentTCList || data.studentTCList.length === 0 || !initialData) {
                toast.error('Student TC details not available or initial data missing', { id: 'bbhs-tc' });
                return;
            }

            const student = data.studentTCList[0];
            const company = data.masterCompany?.[0] || {};
            const isMiid4 = company.miid === 4 || company.mI_Id === 4;

            const academicInfo = data.academicList1?.[0] || {};
            const dateFrom = academicInfo.asmaY_From_Date ? new Date(academicInfo.asmaY_From_Date) : new Date();
            const dateTo = academicInfo.asmaY_To_Date ? new Date(academicInfo.asmaY_To_Date) : new Date();

            // Transformation logic
            const fromMonth = getMonthNames(dateFrom.getMonth(), isMiid4);
            const lastClass = student.last_class_studied || student.last_Class_Studied || student.asmcL_ClassName;
            const toMonth = lastClass === 'X' ? 'MAY' : fromMonth;

            const studentFullName =
                student.studentname ||
                `${student.amsT_FirstName || ''} ${student.amsT_MiddleName || ''} ${student.amsT_LastName || ''}`.trim() ||
                `${student.AMST_FirstName || ''} ${student.AMST_MiddleName || ''} ${student.AMST_LastName || ''}`.trim();

            const transformedData = {
                ...data,
                studentFullName,
                frommonth1: fromMonth,
                tomonth1: toMonth,
                fromyear: dateFrom.getFullYear(),
                toyear: dateTo.getFullYear(),
                getdate: new Date(),
                stuschoolname:
                    data.previousschool?.length > 0
                        ? data.previousschool[0].amstpS_PrvSchoolName
                        : formData.pervious || student.stuschoolname || '---',
                joinclass: isMiid4
                    ? (initialData as any).fillclass?.find((c: any) => c.asmcL_Id.toString() === formData.asmcL_Id)?.asmcL_ClassName ||
                      student.joinclass ||
                      ''
                    : data.classnamejoin?.[0]?.classjoinname || student.joinclass || '',
                nextclass: student.qualificlass || data.getnextclass?.[0]?.asmcL_ClassName || student.nextclass || '',
                nextclassname:
                    student.qualificlass || data.getnextclass?.[0]?.asmcL_ClassName || student.nextclass
                        ? `[${switchFunction(student.qualificlass || data.getnextclass?.[0]?.asmcL_ClassName || student.nextclass)}]`
                        : '',
                stuDobwords: isMiid4
                    ? toCamelCase(student.amst_dob_words || student.amsT_DOB_Words || student.AMST_DOB_Words || '')
                    : student.amst_dob_words || student.amsT_DOB_Words || student.AMST_DOB_Words || '',
                std1: lastClass && switchFunction(lastClass) ? 'Std' : '',
                std:
                    (student.qualificlass || data.getnextclass?.[0]?.asmcL_ClassName || student.nextclass) &&
                    switchFunction(student.qualificlass || data.getnextclass?.[0]?.asmcL_ClassName || student.nextclass)
                        ? 'Std'
                        : ''
            };

            setReportData(transformedData);
            setShowReport(true);
            toast.success('Report generated successfully', { id: 'bbhs-tc' });
        } catch (error) {
            console.error('Report generating error:', error);
            toast.error('Failed to generate report', { id: 'bbhs-tc' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `BBHS_TC_Report_${reportData?.studentFullName || 'Student'}`
    });

    if (isInitialLoading) {
        return (
            <div className='flex min-h-[400px] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
            </div>
        );
    }

    return (
        <div className='container mx-auto max-w-6xl space-y-6 p-4'>
            <CollapsibleSection
                title='Student TC Report Custom'
                description='Generate institutional TC reports with specific formatting'
                defaultOpen={true}
                className='border-slate-200 shadow-sm'>
                <div className='p-2'>
                    <FilterForm initialData={initialData} onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <Card className='fade-in slide-in-from-bottom-4 animate-in overflow-hidden border-slate-200 shadow-lg duration-500'>
                    <CardHeader className='flex flex-row items-center justify-between border-b bg-slate-50 px-6 py-3'>
                        <CardTitle className='flex items-center gap-2 font-semibold text-lg text-slate-800'>
                            <Printer className='h-5 w-5 text-indigo-600' />
                            Report Preview
                        </CardTitle>
                        <div className='flex gap-3'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleReset}
                                className='border-slate-200 text-slate-600 shadow-sm hover:bg-slate-100'>
                                <RotateCcw className='mr-2 h-4 w-4' /> Reset
                            </Button>
                            <Button
                                onClick={() => handlePrint()}
                                className='bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95'>
                                <Printer className='mr-2 h-4 w-4' /> Print Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='flex max-h-[1000px] justify-center overflow-auto bg-slate-100 p-0 py-12'>
                        <div className='mb-12 origin-top scale-[0.85] bg-white shadow-2xl transition-transform duration-300 sm:scale-95 lg:scale-100'>
                            <BbhsTcPrint ref={printRef} data={reportData} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {detailsMutation.isPending && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]'>
                    <Card className='zoom-in-95 w-64 animate-in border-none p-6 text-center shadow-2xl'>
                        <Loader2 className='mx-auto mb-4 h-12 w-12 animate-spin text-indigo-600' />
                        <h4 className='font-bold text-lg text-slate-800'>Generating Report</h4>
                        <p className='font-medium text-slate-500 text-sm'>Please wait a moment...</p>
                    </Card>
                </div>
            )}
        </div>
    );
}
