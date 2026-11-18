'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    getBbkvCustomReportDetails,
    getBbkvCustomReportNameRegNo,
    getBbkvCustomReportStdNameChange,
    getBbkvCustomReportTcDetails,
    getBbkvCustomReportTempPerChange
} from '@/server/admission/preadmission/reports/bbkv_custom_report';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Printer, RotateCcw } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { TcCustomReportNagarjunaPrint } from './_components/tc-custom-report-print';

/**
 * Migration of TC Custom Report (Nagarjuna/Tunbridge style)
 * Matches the classic IVRM layout from the provided screenshots
 */
export default function TcCustomReportNagarjunaPage() {
    const printRef = useRef<HTMLDivElement>(null);

    const [tctemporper, setTcTemporPer] = useState<'temp' | 'per'>('per');
    const [asmaY_Id, setAsmayId] = useState<number>(0);
    const [admname, setAdmName] = useState<'regno' | 'stdname' | ''>('stdname');
    const [amsT_Id, setAmstId] = useState<number>(0);

    const [studentList, setStudentList] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { data: loadRes, isLoading: loadLoading } = useQuery({
        queryKey: ['bbkv-custom-report', 'load'],
        queryFn: async () => getBbkvCustomReportDetails(),
        staleTime: 0
    });

    const yearDropdown = useMemo(() => {
        const res: any = loadRes;
        const years = (res?.accyear ?? res?.data?.accyear ?? []) as any[];
        const seen = new Set();
        return years.filter((y: any) => {
            if (y.asmaY_Id && !seen.has(y.asmaY_Id)) {
                seen.add(y.asmaY_Id);
                return true;
            }
            return false;
        });
    }, [loadRes]);

    const deduplicatedStudentList = useMemo(() => {
        const seen = new Set();
        return studentList.filter((s: any) => {
            if (s.amsT_Id && !seen.has(s.amsT_Id)) {
                seen.add(s.amsT_Id);
                return true;
            }
            return false;
        });
    }, [studentList]);

    const nameRegNoMutation = useMutation({
        mutationFn: getBbkvCustomReportNameRegNo,
        onSuccess: (r: any) => {
            const list = (r?.studentlist ?? (Array.isArray(r?.data) ? r.data : r?.data?.studentlist) ?? []) as any[];
            if (list.length > 0) {
                setStudentList(list);
            } else {
                toast.error('Student is not available for this selection');
                setStudentList([]);
            }
        }
    });

    const tempPerMutation = useMutation({
        mutationFn: getBbkvCustomReportTempPerChange,
        onSuccess: (r: any) => {
            const list = (r?.studentlist ??
                (Array.isArray(r?.data) ? r.data : r?.data?.studentlist) ??
                (Array.isArray(r) ? r : [])) as any[];
            if (list.length > 0) {
                setStudentList(list);
            } else {
                toast.error('Student is not available for this selection');
                setStudentList([]);
            }
        }
    });

    const stdNameChangeMutation = useMutation({
        mutationFn: getBbkvCustomReportStdNameChange
    });

    const tcDetailsMutation = useMutation({
        mutationFn: getBbkvCustomReportTcDetails
    });

    const fetchStudentList = async (yearId: number, type: string, mode: string) => {
        try {
            await nameRegNoMutation.mutateAsync({
                admnoorname: mode,
                ASMAY_Id: yearId,
                tctemporper: type as 'temp' | 'per'
            });
        } catch (e) {
            console.error(e);
        }
    };

    const onYearChange = (v: string) => {
        const id = Number(v);
        setAsmayId(id);
        setAmstId(0);
        setStudentList([]);
        if (id && admname) {
            fetchStudentList(id, tctemporper, admname);
        }
    };

    const onclickregnoname = async (mode: 'regno' | 'stdname') => {
        setAdmName(mode);
        setAmstId(0);
        if (!asmaY_Id) return;
        fetchStudentList(asmaY_Id, tctemporper, mode);
    };

    const handleTempPerChange = async (value: 'temp' | 'per') => {
        setTcTemporPer(value);
        setAmstId(0);
        if (!asmaY_Id || !admname) return;
        try {
            await tempPerMutation.mutateAsync({
                ASMAY_Id: asmaY_Id,
                admnoorname: admname,
                tctemporper: value
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleStudentChange = async (value: string) => {
        const id = Number(value);
        setAmstId(id);
        if (!id || !asmaY_Id) return;
        try {
            await stdNameChangeMutation.mutateAsync({ AMST_Id: id, ASMAY_Id: asmaY_Id });
        } catch (e) {
            console.error(e);
        }
    };

    const handleGenerate = async () => {
        setSubmitted(true);
        if (!asmaY_Id || !amsT_Id) {
            toast.error('Please select all required fields');
            return;
        }
        try {
            const res = await tcDetailsMutation.mutateAsync({ ASMAY_Id: asmaY_Id, AMST_Id: amsT_Id, tctemporper });
            const data = res?.data ?? res;
            if (data?.studentTCList) {
                setReportData(data);
                setShowReport(true);
            } else {
                toast.error('Select any Student');
            }
        } catch (e) {
            toast.error('Failed to generate TC');
        }
    };

    const handleClear = () => {
        setTcTemporPer('per');
        setAsmayId(0);
        setAdmName('');
        setAmstId(0);
        setStudentList([]);
        setReportData(null);
        setShowReport(false);
        setSubmitted(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'TC_Custom_Report',
        suppressErrors: true
    });

    return (
        <div className='min-h-screen bg-[#E7EBEE] p-4'>
            {/* Header matching the screenshots */}
            <div className='mb-4 border-[#3A5999] border-b bg-white shadow-sm'>
                <div className='p-3'>
                    <h1 className='font-bold text-[#3A5999] text-sm uppercase tracking-tight'>TC Custom Report</h1>
                </div>
            </div>

            <div className='rounded-sm border border-gray-300 bg-white shadow-sm'>
                <div className='space-y-6 p-6'>
                    <div className='grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2'>
                        {/* Student Type Selection (Left) */}
                        <div className='flex flex-col gap-4'>
                            <div className='flex justify-center gap-8 rounded border border-gray-200 bg-white p-3'>
                                <label className='flex cursor-pointer items-center gap-2 font-medium text-xs'>
                                    <input
                                        type='radio'
                                        name='tctemporper'
                                        value='temp'
                                        checked={tctemporper === 'temp'}
                                        onChange={() => handleTempPerChange('temp')}
                                        className='accent-[#3A5999]'
                                    />
                                    Temp Student
                                </label>
                                <label className='flex cursor-pointer items-center gap-2 font-medium text-xs'>
                                    <input
                                        type='radio'
                                        name='tctemporper'
                                        value='per'
                                        checked={tctemporper === 'per'}
                                        onChange={() => handleTempPerChange('per')}
                                        className='accent-[#3A5999]'
                                    />
                                    Permanent Student
                                </label>
                            </div>

                            <div className='flex justify-center gap-12 rounded border border-gray-200 bg-white p-3'>
                                <label className='flex cursor-pointer items-center gap-2 font-medium text-xs'>
                                    <input
                                        type='radio'
                                        name='admname'
                                        value='regno'
                                        checked={admname === 'regno'}
                                        onChange={() => onclickregnoname('regno')}
                                        className='accent-[#3A5999]'
                                    />
                                    Admno
                                </label>
                                <label className='flex cursor-pointer items-center gap-2 font-medium text-xs'>
                                    <input
                                        type='radio'
                                        name='admname'
                                        value='stdname'
                                        checked={admname === 'stdname'}
                                        onChange={() => onclickregnoname('stdname')}
                                        className='accent-[#3A5999]'
                                    />
                                    Name
                                </label>
                            </div>
                        </div>

                        {/* Dropdowns (Right) */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <Label className='w-24 whitespace-nowrap font-bold text-xs'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select value={asmaY_Id ? String(asmaY_Id) : undefined} onValueChange={onYearChange}>
                                        <SelectTrigger className='h-8 rounded-sm border-gray-300 text-xs'>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearDropdown?.map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)} className='text-xs'>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {submitted && !asmaY_Id && <FormError className='mt-1'>please select academic year</FormError>}
                                </div>
                            </div>

                            <div className='fade-in slide-in-from-top-1 flex animate-in items-center gap-4 duration-200'>
                                <Label className='w-24 whitespace-nowrap font-bold text-xs'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select value={amsT_Id ? String(amsT_Id) : undefined} onValueChange={handleStudentChange}>
                                        <SelectTrigger className='h-8 rounded-sm border-gray-300 text-xs'>
                                            <SelectValue placeholder={nameRegNoMutation.isPending ? 'Loading...' : 'Select Student'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {deduplicatedStudentList?.map((s: any) => (
                                                <SelectItem key={s.amsT_Id} value={String(s.amsT_Id)} className='pb-2 text-xs'>
                                                    <div className='flex flex-col'>
                                                        <span className='font-bold'>{s.studentname}</span>
                                                        {(s.amsT_RegistrationNo || s.asmcL_ClassName) && (
                                                            <span className='text-[9px] text-gray-500'>
                                                                {s.amsT_RegistrationNo && `REG: ${s.amsT_RegistrationNo}`}
                                                                {s.amsT_RegistrationNo && s.asmcL_ClassName && ' | '}
                                                                {s.asmcL_ClassName && `${s.asmcL_ClassName} (${s.asmC_SectionName || ''})`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {submitted && !amsT_Id && <FormError className='mt-1'>please select student name</FormError>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Button Row matching the screenshot */}
                    <div className='flex justify-center gap-2 pt-4'>
                        <Button
                            onClick={handleGenerate}
                            className='h-8 rounded-sm bg-[#3A5999] px-4 font-bold text-[10px] text-white shadow-sm hover:bg-[#2F477A]'>
                            <FileText className='mr-2 h-3 w-3' />
                            REPORT
                        </Button>
                        <Button
                            onClick={handleClear}
                            className='h-8 rounded-sm bg-[#FF5722] px-4 font-bold text-[10px] text-white shadow-sm hover:bg-[#E64A19]'>
                            <RotateCcw className='mr-2 h-3 w-3' />
                            CANCEL
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='h-8 rounded-sm bg-[#3A5999] px-4 font-bold text-[10px] text-white shadow-sm hover:bg-[#2F477A]'>
                            <Printer className='mr-2 h-3 w-3' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            {showReport && reportData && (
                <div className='mt-8 flex justify-center overflow-x-auto rounded-sm border border-gray-300 bg-gray-100 p-4'>
                    <div className='bg-white p-0 shadow-lg'>
                        <TcCustomReportNagarjunaPrint ref={printRef} reportData={reportData} />
                    </div>
                </div>
            )}
        </div>
    );
}
