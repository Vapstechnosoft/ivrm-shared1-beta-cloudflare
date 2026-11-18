'use client';

import { useNdaStudentProfileInitialData, useNdaStudentProfileReport } from '@/hooks/admission/preadmission/useNdaStudentProfileReport';
import type { NdaStudentProfileReportFields } from '@/schemas/admission/preadmission/reports/nda-student-profile-report';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProfileReportForm } from './_components/ProfileReportForm';
import { StaffStatusGrid } from './_components/StaffStatusGrid';
import { StudentStatusGrid } from './_components/StudentStatusGrid';

export default function NdaStudentProfileReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<'Student' | 'Staff' | null>(null);
    const [showResults, setShowResults] = useState(false);

    const { data: initialData, isLoading: isInitialLoading } = useNdaStudentProfileInitialData();
    const reportMutation = useNdaStudentProfileReport();

    const handleGenerateReport = async (formData: NdaStudentProfileReportFields) => {
        try {
            const payload = {
                dup: formData.type,
                ASMAY_Id: formData.academic_year ? Number(formData.academic_year) : undefined,
                ASMCL_Id: formData.classname ? Number(formData.classname) : undefined,
                ASMS_Id: formData.sectionname ? Number(formData.sectionname) : undefined
            };

            const res = (await reportMutation.mutateAsync(payload)) as any;
            const records = Array.isArray(res)
                ? res
                : res?.studentList ||
                  res?.studentList1 ||
                  res?.studentreportdata ||
                  res?.headernamelist ||
                  res?.data?.studentList ||
                  res?.data ||
                  [];

            if (records.length > 0) {
                setReportData(records);
                setReportType(formData.type);
                setShowResults(true);
                toast.success(`Generated report with ${records.length} records`);
            } else {
                toast.error(`No ${formData.type.toLowerCase()} records found for the selected criteria`);
            }
        } catch (error) {
            console.error('Report generation error:', error);
            toast.error('Failed to generate report. Please try again.');
        }
    };

    const handleReset = () => {
        setReportData([]);
        setReportType(null);
        setShowResults(false);
    };

    if (isInitialLoading) {
        return (
            <div className='flex h-[80vh] w-full flex-col items-center justify-center gap-6'>
                <div className='relative'>
                    <Loader2 className='h-20 w-20 animate-spin text-indigo-600' />
                    <ShieldCheck className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-8 w-8 text-indigo-400' />
                </div>
                <div className='animate-pulse text-center'>
                    <h2 className='font-black text-2xl text-slate-800 uppercase tracking-tight'>INITIALIZING REPORT SYSTEM</h2>
                    <p className='mt-2 text-center font-bold text-slate-400 text-xs uppercase tracking-[0.3em]'>
                        Loading academic configurations & dropdowns
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='fade-in container mx-auto animate-in space-y-12 p-4 duration-1000 md:p-10'>
            {/* Header Section */}
            {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-xl shadow-indigo-100/20 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <History className="w-12 h-12" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">PROFILE STATUS REPORT</h1>
                        <p className="text-indigo-600 font-black tracking-[0.3em] uppercase text-xs mt-3 flex items-center gap-2">
                             Notre Dame Academy <span className="w-2 h-2 rounded-full bg-indigo-200" /> Verification Portal
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Filter Section */}
            <div className='relative'>
                <ProfileReportForm
                    academicList={initialData?.academicList || []}
                    classList={initialData?.classlist || []}
                    sectionList={initialData?.sectionList || []}
                    onSubmit={handleGenerateReport}
                    onReset={handleReset}
                    isPending={reportMutation.isPending}
                />
            </div>

            {/* Results Section */}
            {showResults && (
                <div className='fade-in slide-in-from-bottom-8 animate-in duration-700'>
                    {reportType === 'Student' ? <StudentStatusGrid data={reportData} /> : <StaffStatusGrid data={reportData} />}
                </div>
            )}

            <div className='h-20' />
        </div>
    );
}
