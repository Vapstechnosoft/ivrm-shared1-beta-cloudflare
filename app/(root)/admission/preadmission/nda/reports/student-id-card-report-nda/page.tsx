'use client';

import { Card } from '@/components/ui/card';
import { useIdCardInitialData, useIdCardReport } from '@/hooks/admission/preadmission/useStudentIdCardReportNda';
import { CreditCard, Loader2, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { StudentIdCardPrint } from './_components/StudentIdCardPrint';
import { StudentIdCardSearch } from './_components/StudentIdCardSearch';

export default function StudentIdCardReportNdaPage() {
    const [houseColor, setHouseColor] = useState('WHITE');
    const [reportData, setReportData] = useState<any[]>([]);
    const [showReport, setShowReport] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Initial data (using pageId = 2 as per legacy code)
    const { data: initialData, isLoading: isInitialLoading } = useIdCardInitialData();
    const reportMutation = useIdCardReport();

    const handleSearch = async (formData: any, selectedStudents: any[]) => {
        try {
            setHouseColor(formData.house);
            const payload = {
                ASMAY_Id: Number(formData.academic_year),
                ASMCL_Id: Number(formData.classname),
                ASMS_Id: Number(formData.sectionname),
                StudentTempList: selectedStudents.map((s) => ({
                    AMST_Id: s.amsT_Id,
                    StudentName: s.studentName
                }))
            };

            const res = (await reportMutation.mutateAsync(payload)) as any;
            const list = res?.data?.studentList || res?.studentList || [];

            if (list && list.length > 0) {
                setReportData(list);
                setShowReport(true);
                toast.success(`Generated ID cards for ${list.length} students`);
            } else {
                setReportData([]);
                setShowReport(false);
                toast.error('No ID card data found for selected criteria');
            }
        } catch (error) {
            console.error('Report error:', error);
            toast.error('An error occurred while generating the report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef
    });

    const handleReset = () => {
        setShowReport(false);
        setReportData([]);
    };

    if (isInitialLoading) {
        return (
            <div className='flex h-screen w-full flex-col items-center justify-center gap-6 bg-slate-50'>
                <div className='relative'>
                    <Loader2 className='h-20 w-20 animate-spin text-indigo-600' />
                    <CreditCard className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-8 w-8 text-indigo-400' />
                </div>
                <div className='text-center'>
                    <h2 className='font-black text-2xl text-slate-800 tracking-tight'>INITIALIZING ID CARD SYSTEM</h2>
                    <p className='mt-2 font-bold text-slate-400 text-xs uppercase tracking-[0.3em]'>
                        Loading academic records & configurations
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='p-4'>
            <div className='grid grid-cols-1 gap-6'>
                {/* Filter Section */}
                <div className='w-full'>
                    <StudentIdCardSearch
                        academicList={initialData?.getAcademicYearList || []}
                        initialClassList={initialData?.getClassList || []}
                        onSubmit={handleSearch}
                        onReset={handleReset}
                        onPrint={handlePrint}
                        showPrint={showReport}
                        isLoading={reportMutation.isPending}
                    />
                </div>

                {/* Report Preview Section */}
                {showReport && (
                    <div className='slide-in-from-bottom animate-in space-y-8 duration-700'>
                        <div className='flex items-center justify-between px-6'>
                            <div className='flex items-center gap-4'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
                                    <Printer className='h-5 w-5' />
                                </div>
                                <h2 className='font-black text-2xl text-slate-800 tracking-tight'>PRINT PREVIEW</h2>
                            </div>
                            <p className='font-black text-slate-400 text-xs uppercase tracking-widest'>
                                Ready to print {reportData.length} records
                            </p>
                        </div>

                        <Card className='flex min-h-[600px] justify-center overflow-hidden overflow-x-auto rounded-[3rem] border-none bg-slate-900 p-12 shadow-2xl'>
                            <div className='origin-top scale-75 rounded-sm bg-white p-1 shadow-2xl sm:scale-100'>
                                <StudentIdCardPrint ref={printRef} cardData={reportData} houseColor={houseColor} />
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            <div className='h-20' />
        </div>
    );
}
