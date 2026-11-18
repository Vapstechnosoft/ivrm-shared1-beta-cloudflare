'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useStjMigrationCertificate } from '@/hooks/admission/preadmission/reports/useStjMigrationCertificate';
import { Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FilterForm } from './_components/filter-form';
import { MigrationCertificatePrint } from './_components/migration-certificate-print';

export default function StjamesMigrationCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { studDetailsMutation } = useStjMigrationCertificate();

    const handleReport = async (formData: any) => {
        try {
            const confirmSave = confirm('Do you Want To Save The Record?');
            const saveFlag = confirmSave ? 'yes' : 'No';

            toast.loading('Generating Migration Certificate...', { id: 'migration-report' });

            const classId = formData.allorindi === 'A' ? 0 : formData.ASMCL_Id || 0;
            const sectionId = formData.allorindi === 'A' ? 0 : formData.ASMS_Id || 0;

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: classId,
                ASMC_Id: sectionId,
                AMST_Id: formData.AMST_Id,
                save_flag: saveFlag
            };

            const response = (await studDetailsMutation.mutateAsync(payload)) as any;
            const data = response.data?.data || response.data;

            if (data && data.studentlist && data.studentlist.length > 0) {
                const student = data.studentlist[0];

                const capitalize = (str: string) => {
                    if (!str) return '';
                    const cleanStr = str.split(':')[0];
                    return cleanStr
                        .split(' ')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                };

                const mappedData = {
                    studentname: capitalize(student.studentnam),
                    fathername: capitalize(student.fatherName),
                    mothername: capitalize(student.mothername),
                    registernumber: formData.certificatenameregno,
                    certificatename: formData.examcertificatename,
                    ASA_FromDate: formData.ASA_FromDate
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'migration-report' });
            } else {
                toast.error('Record not found', { id: 'migration-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'migration-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Migration_Certificate_${reportData?.studentname || 'Student'}`
    });

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection
                title='Migration Certificate'
                description='Generate and print Migration Certificates for St. James School'
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
                        <Button onClick={() => handlePrint()} className='bg-indigo-600 hover:bg-indigo-700'>
                            <Printer className='mr-2 h-4 w-4' /> Print
                        </Button>
                    </div>

                    <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-slate-300 border-dashed bg-slate-100 p-8'>
                        <div className='origin-top bg-[#fffacd] shadow-2xl'>
                            <MigrationCertificatePrint ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
