'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBonafiedStudDetails } from '@/hooks/admission/preadmission/useStjamesBonafiedReport';
import { Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { BonafiedCertificatePrint } from './_components/bonafied-certificate-print';
import { FilterForm } from './_components/filter-form';

export default function StjamesBonafiedReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [reportFormat, setReportFormat] = useState<number>(1);
    const printRef = useRef<HTMLDivElement>(null);

    const studDetailsMutation = useBonafiedStudDetails();

    const handleReport = async (formData: any) => {
        try {
            const confirmSave = confirm('Do you Want To Save The Record?');
            const saveFlag = confirmSave ? 'yes' : 'No';

            toast.loading('Generating Bonafied Certificate...', { id: 'bonafied-report' });

            const classId = formData.allorindi === 'A' ? 0 : formData.ASMCL_Id || 0;
            const sectionId = formData.allorindi === 'A' ? 0 : formData.ASMS_Id || 0;

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: classId,
                ASMS_Id: sectionId,
                AMST_Id: formData.AMST_Id,
                save_flag: saveFlag
            };

            const response = (await studDetailsMutation.mutateAsync(payload)) as any;
            const data = response.data?.data || response.data;

            if (data && data.studentlist && data.studentlist.length > 0) {
                const student = data.studentlist[0];
                const masterCompany = data.masterCompany?.[0] || {};
                const academicList = data.academicList1?.[0] || {};
                const leftStudentDetails = data.leftstudentdetails?.[0] || null;
                const studentList1 = data.studentlist1?.[0] || {};

                // Determine gender-based text
                const isFemale = student.AMST_Sex === 'FEMALE' || student.AMST_Sex === 'Female';
                const genderData = {
                    sonof: isFemale ? 'd/o' : 's/o',
                    gender4: isFemale ? 'She' : 'He',
                    hisHer: isFemale ? 'her' : 'his'
                };

                // Determine report format and active/left text
                let leftoractive = '';
                let isorwas = '';
                let leftoractivedate = '';
                let dot = '';
                let format = 1;

                if (formData.optradio === 'S' || formData.optradio === 'D') {
                    leftoractive = 'is presently';
                    isorwas = 'is';
                    dot = '.';
                    format = 1;
                } else if (formData.optradio === 'L') {
                    leftoractive = 'was';
                    isorwas = 'was';
                    leftoractivedate = 'and Left on';
                    format = 1;
                } else if (formData.optradio === '12') {
                    leftoractive = 'was';
                    leftoractivedate = 'and Left on';
                    format = 2;
                }

                // Process academic year for 12th format
                let yearcode1 = '';
                let fromyear = '';
                let toyear = '';
                const frommonth1 = 'April'; // Typical start month for Indian academic year

                if (formData.yearList) {
                    const selectedYear = formData.yearList.find(
                        (y: any) => Number.parseInt(y.asmaY_Id) === Number.parseInt(formData.ASMAY_Id)
                    );
                    if (selectedYear) {
                        const ddyear = selectedYear.asmaY_Year.split('-');
                        yearcode1 = ddyear[1] || '';
                        fromyear = ddyear[0] || '';
                        toyear = ddyear[1] || '';
                    }
                }

                // Capitalize helper
                const capitalize = (str: string) => {
                    if (!str) return '';
                    const cleanStr = str.split(':')[0];
                    return cleanStr
                        .split(' ')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                };

                const mappedData = {
                    schoolname: masterCompany.companyname,
                    schooladdress: masterCompany.address,
                    milogo: masterCompany.milogo,
                    mi_id: masterCompany.mI_Id,
                    studentname: capitalize(student.studentnam),
                    fathername: capitalize(student.fathername),
                    mothername: capitalize(student.mothername),
                    admno: student.admno,
                    className: student.class,
                    section: student.section,
                    dob: student.dob,
                    stuDoa: student.joindate,
                    admittedclass: studentList1.joinedclass,
                    leftdate: leftStudentDetails ? leftStudentDetails.astC_TCIssueDate : null,
                    selectedDate: formData.ASA_FromDate,
                    ASCISS_QRCode: student.ASCISS_QRCode || data.ASCISS_QRCode || studentList1.ASCISS_QRCode || '',
                    ...genderData,
                    leftoractive,
                    isorwas,
                    leftoractivedate,
                    dot,
                    yearcode1,
                    fromyear,
                    toyear,
                    frommonth1
                };

                setReportFormat(format);
                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'bonafied-report' });
            } else {
                toast.error('Record not found', { id: 'bonafied-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'bonafied-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Bonafied_Certificate_${reportData?.studentname || 'Student'}`
    });

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection
                title='Bonafide Certificate'
                description='Generate and print Bonafide Certificates for St. James School'
                defaultOpen={true}>
                <div className='bg-white p-6'>
                    <FilterForm onSubmit={handleReport} onReset={handleReset} />
                </div>
            </CollapsibleSection>

            {studDetailsMutation.isPending && (
                <div className='flex flex-col items-center justify-center space-y-4 p-12'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='animate-pulse text-muted-foreground'>Generating certificate preview...</p>
                </div>
            )}

            {showReport && reportData && (
                <div className='fade-in animate-in space-y-4 duration-500'>
                    <div className='flex justify-end gap-4 rounded-lg border bg-slate-50 p-4'>
                        <Button onClick={() => handlePrint()} className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                            <Printer className='mr-2 h-4 w-4' /> Print
                        </Button>
                    </div>

                    <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-slate-300 border-dashed bg-slate-100 p-8'>
                        <div className='origin-top bg-white shadow-2xl'>
                            <BonafiedCertificatePrint ref={printRef} data={reportData} reportFormat={reportFormat} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
