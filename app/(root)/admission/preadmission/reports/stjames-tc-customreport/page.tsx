'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useStjamesTcReport } from '@/hooks/admission/preadmission/useStjamesTcCustomReport';
import type { StjamesTcCustomReportFields } from '@/schemas/admission/preadmission/reports/stjames-tc-custom-report';
import { Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { StJamesTcPrint } from './_components/stjames-tc-print';

interface StjamesTcReportResponse {
    result: any[];
    masterCompany?: any[];
    academicList1?: any[];
    previousschool?: any[];
    studenttcdetails?: any[];
    getnextclass?: any[];
    classnamejoin?: any[];
    ascisS_QRCode?: string;
}

export default function StjamesTcCustomReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const tcReportMutation = useStjamesTcReport();

    const handleReport = async (formData: StjamesTcCustomReportFields) => {
        try {
            toast.loading('Generating TC Report...', { id: 'tc-report' });

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: formData.ASMCL_Id as number,
                ASMS_Id: formData.ASMS_Id as number,
                AMST_Id: formData.AMST_Id as number,
                tctemporper: formData.temporper
            };

            const response = (await tcReportMutation.mutateAsync(payload)) as any;
            const data = response.data as StjamesTcReportResponse;

            if (data && data.result && data.result.length > 0) {
                const student = data.result[0];
                const tcDetail = data.studenttcdetails?.[0] || {};
                const academic = data.academicList1?.[0] || {};
                const prevSchool = data.previousschool?.[0] || {};
                const nextClass = data.getnextclass?.[0] || {};
                const joinedClass = data.classnamejoin?.[0] || {};

                // Process Dates for Academic Range
                const fromDate = academic.asmaY_From_Date ? new Date(academic.asmaY_From_Date) : null;
                const toDate = academic.asmaY_To_Date ? new Date(academic.asmaY_To_Date) : null;

                const fromMonthStr = fromDate ? getMonthName(fromDate.getMonth()) : 'MARCH';
                const toMonthStr = toDate ? getMonthName(toDate.getMonth()) : 'FEBRUARY';
                const fromYear = fromDate ? fromDate.getFullYear() : '';
                const toYear = toDate ? toDate.getFullYear() : '';

                // Gender logic
                const isFemale = student.amst_sex?.toLowerCase() === 'female' || student.amst_sex?.toLowerCase() === 'f';
                const gender = {
                    title: isFemale ? 'miss' : 'master',
                    sonOf: isFemale ? 'Daughter of' : 'Son of',
                    hisHer: isFemale ? 'her' : 'his',
                    heShe: isFemale ? 'She' : 'He'
                };

                // Full Legacy Mapping with verified keys
                const mappedData = {
                    tcno: student.astc_tcno || '',
                    admno: student.amst_admno || '',
                    lblstdname: student.studentname || '',
                    lblfathername: student.amst_fathername || '',
                    lblmothername: student.amst_mothername || '',
                    lblreligioncaste: student.religion || '',
                    lblnationality: student.nationality || 'Indian',
                    lbldob: student.amst_dob || '',
                    lbldobwords: student.amst_dob_words || (student.amst_dob ? '' : ''), // Logic for conversion usually on backend or helper
                    lbldoa: student.amst_date || '',
                    lblconduct: student.astc_conduct || 'Good',
                    lblPromotion: nextClass.asmcL_ClassName || student.qualificlass || 'GRANTED',
                    todaydate: student.astc_tcissuedate || new Date().toISOString(),
                    frommonth1: fromMonthStr,
                    tomonth1: toMonthStr,
                    fromyear: fromYear,
                    toyear: toYear,
                    feeconcession: student.fee_concesion || '',
                    laststudied: student.classname || student.last_class_studied || '',
                    laststudiedinwords: switchFunction(student.classname || student.last_class_studied),
                    subjectsstudied: student.subjectstudied || '',
                    streamname: student.streamname || 'ICSE & ISC',
                    previousschoolname: student.previousschoolname || prevSchool.amstpS_PrvSchoolName || '',
                    lbldol: student.astc_lastattendeddate || student.astc_tcissuedate || '',
                    gender,
                    qrcode: data.ascisS_QRCode || '',
                    joiningclass: joinedClass.classjoinname || '',
                    institution: data.masterCompany?.[0]?.name || student.institutionname || "St. James' School",
                    logo: data.masterCompany?.[0]?.logo || student.logo || '',
                    lblreasonleaving: student.astc_leavingreason || '',
                    remarks: student.astc_remarks || '',
                    religion: student.religion || '',
                    caste: student.caste || '',
                    section: student.asmc_sectionname || ''
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'tc-report' });
            } else {
                toast.error('No data found for the selected student', { id: 'tc-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `TC_Report_${reportData?.lblstdname || 'Student'}`
    });

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection
                title='Student TC Custom Report'
                description='Generate and print custom Transfer Certificates for St. James School'
                defaultOpen={true}>
                <div className='bg-white p-6'>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className='fade-in animate-in space-y-4 duration-500'>
                    <div className='flex justify-end gap-4 rounded-lg border bg-slate-50 p-4'>
                        <Button onClick={() => handlePrint()} className='bg-indigo-600 hover:bg-indigo-700'>
                            <Printer className='mr-2 h-4 w-4' /> Print TC
                        </Button>
                    </div>

                    <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-slate-300 border-dashed bg-slate-100 p-8'>
                        <div className='origin-top bg-white shadow-2xl'>
                            <StJamesTcPrint ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}

            {tcReportMutation.isPending && (
                <div className='flex flex-col items-center justify-center space-y-4 p-12'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='animate-pulse text-muted-foreground'>Generating certificate preview...</p>
                </div>
            )}
        </div>
    );
}

// Legacy helper functions
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

function switchFunction(className: string): string {
    if (!className) return '';
    const cleanName = className.trim().toUpperCase();
    const map: Record<string, string> = {
        I: 'FIRST',
        '1ST': 'FIRST',
        II: 'SECOND',
        '2ND': 'SECOND',
        III: 'THIRD',
        '3RD': 'THIRD',
        IV: 'FOURTH',
        '4TH': 'FOURTH',
        V: 'FIFTH',
        '5TH': 'FIFTH',
        VI: 'SIXTH',
        '6TH': 'SIXTH',
        VII: 'SEVENTH',
        '7TH': 'SEVENTH',
        VIII: 'EIGHTH',
        '8TH': 'EIGHTH',
        IX: 'NINTH',
        '9TH': 'NINTH',
        X: 'TENTH',
        '10TH': 'TENTH',
        XI: 'Eleventh',
        '11TH': 'ELEVENTH',
        XII: 'Twelfth',
        '12TH': 'TWELFTH',
        NURSERY: 'Nursery',
        TRANSITION: 'Transition',
        'UPPER NURSERY': 'Upper Nursery',
        'LOWER NURSERY': 'Lower Nursery',
        'K G': 'K G'
    };
    return map[cleanName] || className;
}
