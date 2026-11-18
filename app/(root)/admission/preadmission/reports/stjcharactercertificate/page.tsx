'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useStjCharacterCertificate } from '@/hooks/admission/preadmission/reports/useStjCharacterCertificate';
import { Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { CharacterCertificatePrint } from './_components/character-certificate-print';
import { FilterForm } from './_components/filter-form';

export default function StjCharacterCertificatePage() {
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { studDetailsMutation } = useStjCharacterCertificate();

    const handleReport = async (formData: any) => {
        try {
            toast.loading('Generating Character Certificate...', { id: 'character-report' });
            console.info('🚀 [CLIENT] handleReport initiated');

            const classId = formData.allorindi === 'A' ? 0 : formData.ASMCL_Id || 0;
            const sectionId = formData.allorindi === 'A' ? 0 : formData.ASMS_Id || 0;

            const payload = {
                ASMAY_Id: formData.ASMAY_Id,
                ASMCL_Id: classId,
                ASMC_Id: sectionId,
                AMST_Id: formData.AMST_Id
            };

            console.info('🚀 [CLIENT] Ready to call mutateAsync with payload:', payload);
            const response = (await studDetailsMutation.mutateAsync(payload)) as any;
            console.info('🚀 [CLIENT] mutateAsync RESPONSE:', response);
            const data = response.data?.data || response.data;

            if (data && data.studentList && data.studentList.length > 0) {
                const student = data.studentList[0];

                const mappedData = {
                    studentname: student.studentnam,
                    className: student.class,
                    AMST_RegistrationNo: student.AMST_RegistrationNo,
                    dob: student.dob,
                    admdate: student.admdate,
                    admitedclass: student.admitedclass,
                    SPCCMH_HouseName: student.SPCCMH_HouseName,

                    // From form data
                    Posts: formData.Posts,
                    Principal: formData.Principal,
                    Year: formData.Year,
                    Final: formData.Final,
                    Year1: formData.Year1,
                    Final1: formData.Final1,
                    staticActivities: formData.staticActivities,
                    activities: formData.activities,
                    House: formData.House,
                    School: formData.School
                };

                setReportData(mappedData);
                setShowReport(true);
                toast.success('Report generated successfully', { id: 'character-report' });
            } else {
                toast.error('Record not found', { id: 'character-report' });
                setShowReport(false);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report', { id: 'character-report' });
        }
    };

    const handleReset = () => {
        setReportData(null);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Character_Certificate_${reportData?.studentname || 'Student'}`
    });

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection
                title='Character Certificate'
                description='Generate and print Character Certificates for St. James School'
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
                        <div className='origin-top bg-white shadow-2xl'>
                            <CharacterCertificatePrint ref={printRef} data={reportData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
