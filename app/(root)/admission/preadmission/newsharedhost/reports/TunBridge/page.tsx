'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { History, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    changeTunBridgeTcClass,
    changeTunBridgeTcSection,
    changeTunBridgeTcYear,
    getTunBridgeTcDetails,
    getTunBridgeTcLoadData
} from '@/server/admission/preadmission/reports/tunbridge_student_tc_custom_report';

import { TunBridgeTcPrint } from './_components/tunbridge-tc-print';

function unwrap(res: unknown) {
    const r = res as { data?: any };
    return r?.data ?? res;
}

export default function TunBridgeStudentTcCustomReportPage() {
    const printRef = useRef<HTMLDivElement>(null);

    const [reporttype, setReporttype] = useState<'All' | 'indi'>('All');
    const [temporper, setTemporper] = useState<'Temp' | 'Per'>('Per');
    const [asmaY_Id, setAsmayId] = useState<number>(0);
    const [ASMCL_Id, setAsmclId] = useState<number>(0);
    const [ASMS_Id, setAsmsId] = useState<number>(0);
    const [AMST_Id, setAmstId] = useState<number>(0);

    const [classlist, setClasslist] = useState<any[]>([]);
    const [seclist, setSeclist] = useState<any[]>([]);
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);

    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { data: loadRes, isLoading: loadLoading } = useQuery({
        queryKey: ['tunbridge-tc-custom', 'load'],
        queryFn: getTunBridgeTcLoadData,
        staleTime: 0
    });

    const loadPayload = unwrap(loadRes) as any;
    const yearDropdown = loadPayload?.accyear ?? loadPayload?.allAcademicYear ?? loadPayload?.yearDropdown ?? [];

    useEffect(() => {
        const raw = unwrap(loadRes) as any;
        if (!raw) return;
        if (raw.accclass?.length) setClasslist(raw.accclass);
        if (raw.accsection?.length) setSeclist(raw.accsection);
    }, [loadRes]);

    const yearMutation = useMutation({
        mutationFn: changeTunBridgeTcYear
    });
    const classMutation = useMutation({
        mutationFn: changeTunBridgeTcClass
    });
    const sectionMutation = useMutation({
        mutationFn: changeTunBridgeTcSection
    });
    const tcMutation = useMutation({
        mutationFn: getTunBridgeTcDetails
    });

    const onYearChange = async (v: string) => {
        const id = Number(v);
        setAsmayId(id);
        setAsmclId(0);
        setAsmsId(0);
        setAmstId(0);
        setStudentDropdown([]);
        setReportData(null);
        setShowReport(false);
        if (!id) return;
        try {
            const res = await yearMutation.mutateAsync({
                ASMAY_Id: id,
                tctemporper: temporper,
                report_type: reporttype
            });
            const p = unwrap(res) as any;
            if (p?.accclass) setClasslist(p.accclass);
            if (reporttype === 'All' && p?.studentlist?.length) {
                setStudentDropdown(p.studentlist);
            } else if (reporttype === 'All' && (!p?.studentlist || p.studentlist.length === 0)) {
                toast.error('Student is not available for this selection');
            }
        } catch {
            toast.error('Failed to load classes for the selected year');
        }
    };

    const onClassChange = async (v: string) => {
        const id = Number(v);
        setAsmclId(id);
        setAsmsId(0);
        setAmstId(0);
        setStudentDropdown([]);
        setReportData(null);
        setShowReport(false);
        if (!id || !asmaY_Id) return;
        try {
            const res = await classMutation.mutateAsync({
                ASMAY_Id: asmaY_Id,
                tctemporper: temporper,
                report_type: reporttype,
                ASMCL_Id: id
            });
            const p = unwrap(res) as any;
            if (p?.accsection) setSeclist(p.accsection);
        } catch {
            toast.error('Failed to load sections');
        }
    };

    const onSectionChange = async (v: string) => {
        const id = Number(v);
        setAsmsId(id);
        setAmstId(0);
        setReportData(null);
        setShowReport(false);
        if (!id || !asmaY_Id || !ASMCL_Id) return;
        try {
            const res = await sectionMutation.mutateAsync({
                ASMAY_Id: asmaY_Id,
                ASMCL_Id: ASMCL_Id,
                ASMS_Id: id,
                tctemporper: temporper,
                report_type: reporttype
            });
            const p = unwrap(res) as any;
            if (p?.studentlist?.length) {
                setStudentDropdown(p.studentlist);
            } else {
                toast.error('Student is not available for this selection');
                setStudentDropdown([]);
            }
        } catch {
            toast.error('Failed to load students');
        }
    };

    const handleReport = async () => {
        setSubmitted(true);
        if (!asmaY_Id || !AMST_Id) {
            toast.error('Select Year and Student');
            return;
        }
        if (reporttype === 'indi' && (!ASMCL_Id || !ASMS_Id)) {
            toast.error('Select Class and Section');
            return;
        }
        try {
            const res = await tcMutation.mutateAsync({
                ASMAY_Id: asmaY_Id,
                ASMCL_Id: ASMCL_Id,
                ASMS_Id: ASMS_Id,
                AMST_Id: AMST_Id,
                tctemporper: temporper
            });
            const p = unwrap(res) as any;
            const list = p?.result ?? p?.studentTCList ?? p?.studentTcList;
            if (Array.isArray(list) && list.length > 0) {
                setReportData(p);
                setShowReport(true);
            } else {
                toast.error('Select any Student');
                setShowReport(false);
            }
        } catch {
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        setReporttype('All');
        setTemporper('Per');
        setAsmayId(0);
        setAsmclId(0);
        setAsmsId(0);
        setAmstId(0);
        setClasslist([]);
        setSeclist([]);
        setStudentDropdown([]);
        setReportData(null);
        setShowReport(false);
        setSubmitted(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'TunBridge_TC_Custom_Report'
    });

    const isIndi = reporttype === 'indi';

    return (
        <div className='min-h-screen space-y-6 bg-gray-50/50 p-4'>
            <CollapsibleSection
                title='Student TC Custom Report'
                description='Tunbridge High School — Transfer Certificate'
                defaultOpen={true}
                variant='outline'
                className='border-t-2 border-t-[#3f51b5] shadow-sm'>
                <div className='space-y-6 rounded-b-lg bg-white p-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='flex items-center justify-center rounded-lg border bg-gray-50 p-4'>
                            <RadioGroup
                                value={reporttype}
                                onValueChange={async (v) => {
                                    const next = v as 'All' | 'indi';
                                    setReporttype(next);
                                    setAsmclId(0);
                                    setAsmsId(0);
                                    setAmstId(0);
                                    setStudentDropdown([]);
                                    setReportData(null);
                                    setShowReport(false);
                                    if (!asmaY_Id) return;
                                    try {
                                        const res = await yearMutation.mutateAsync({
                                            ASMAY_Id: asmaY_Id,
                                            tctemporper: temporper,
                                            report_type: next
                                        });
                                        const p = unwrap(res) as any;
                                        if (p?.accclass) setClasslist(p.accclass);
                                        if (next === 'All' && p?.studentlist?.length) {
                                            setStudentDropdown(p.studentlist);
                                        } else if (next === 'All') {
                                            toast.error('Student is not available for this selection');
                                        }
                                    } catch {
                                        /* ignore */
                                    }
                                }}
                                className='flex gap-8'>
                                <div className='flex cursor-pointer items-center gap-2'>
                                    <RadioGroupItem value='All' id='rt-all' />
                                    <span className='font-semibold text-sm'>All</span>
                                </div>
                                <div className='flex cursor-pointer items-center gap-2'>
                                    <RadioGroupItem value='indi' id='rt-indi' />
                                    <span className='font-semibold text-sm'>Individual</span>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className='flex items-center justify-center rounded-lg border bg-gray-50 p-4'>
                            <RadioGroup
                                value={temporper}
                                onValueChange={async (v) => {
                                    const next = v as 'Temp' | 'Per';
                                    setTemporper(next);
                                    setStudentDropdown([]);
                                    setAmstId(0);
                                    setReportData(null);
                                    setShowReport(false);
                                    if (!asmaY_Id) return;
                                    try {
                                        const res = await yearMutation.mutateAsync({
                                            ASMAY_Id: asmaY_Id,
                                            tctemporper: next,
                                            report_type: reporttype
                                        });
                                        const p = unwrap(res) as any;
                                        if (p?.accclass) setClasslist(p.accclass);
                                        if (reporttype === 'All' && p?.studentlist?.length) {
                                            setStudentDropdown(p.studentlist);
                                        }
                                    } catch {
                                        /* ignore */
                                    }
                                }}
                                className='flex gap-8'>
                                <div className='flex cursor-pointer items-center gap-2'>
                                    <RadioGroupItem value='Temp' id='tp-temp' />
                                    <span className='font-semibold text-sm'>Temporary TC</span>
                                </div>
                                <div className='flex cursor-pointer items-center gap-2'>
                                    <RadioGroupItem value='Per' id='tp-per' />
                                    <span className='font-semibold text-sm'>Permanent TC</span>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <Label className='w-32 whitespace-nowrap text-right font-semibold text-sm'>
                                    Year:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Select
                                        value={asmaY_Id ? String(asmaY_Id) : undefined}
                                        onValueChange={onYearChange}
                                        disabled={loadLoading}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder={loadLoading ? 'Loading...' : 'Select Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearDropdown?.map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {submitted && !asmaY_Id && <span className='text-red-500 text-xs'>Select Left Year.</span>}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <Label className='w-32 whitespace-nowrap text-right font-semibold text-sm'>Student Name:</Label>
                                <div className='flex-1'>
                                    <Select
                                        value={AMST_Id ? String(AMST_Id) : undefined}
                                        onValueChange={(v) => setAmstId(Number(v))}
                                        disabled={!studentDropdown.length}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='Select Or Search Student' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {studentDropdown.map((s: any) => (
                                                <SelectItem key={s.amsT_Id} value={String(s.amsT_Id)}>
                                                    {s.studentname ?? s.stuname ?? s.amsT_FirstName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-4'>
                            <div className='flex items-center gap-2'>
                                <Label className='w-32 whitespace-nowrap text-right font-semibold text-sm'>
                                    Class:{isIndi && <span className='text-red-500'>*</span>}
                                </Label>
                                <div className='flex-1'>
                                    <Select
                                        value={ASMCL_Id ? String(ASMCL_Id) : undefined}
                                        onValueChange={onClassChange}
                                        disabled={!isIndi || !asmaY_Id}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classlist?.map((c: any) => (
                                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                    {c.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Label className='w-32 whitespace-nowrap text-right font-semibold text-sm'>
                                    Section:{isIndi && <span className='text-red-500'>*</span>}
                                </Label>
                                <div className='flex-1'>
                                    <Select
                                        value={ASMS_Id ? String(ASMS_Id) : undefined}
                                        onValueChange={onSectionChange}
                                        disabled={!isIndi || !ASMCL_Id}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {seclist?.map((s: any) => (
                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-wrap items-end justify-center gap-4 lg:justify-end'>
                            <Button
                                type='button'
                                onClick={handleReport}
                                disabled={tcMutation.isPending}
                                className='h-10 min-w-[120px] bg-[#3f51b5] font-bold text-white text-xs uppercase shadow-md hover:bg-[#303f9f]'>
                                <History className='mr-2 h-4 w-4' />
                                Report
                            </Button>
                            <Button
                                type='button'
                                onClick={handleClear}
                                className='h-10 min-w-[120px] bg-[#ff5722] font-bold text-white text-xs uppercase shadow-md hover:bg-[#e64a19]'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                onClick={() => handlePrint()}
                                disabled={!showReport}
                                className='h-10 min-w-[120px] bg-[#3f51b5] font-bold text-white text-xs uppercase shadow-md hover:bg-[#303f9f]'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-gray-200 border-dashed bg-white/50 p-4 shadow-inner backdrop-blur-sm lg:p-12'>
                    <div className='bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)]'>
                        <TunBridgeTcPrint ref={printRef} reportData={reportData} />
                    </div>
                </div>
            )}
        </div>
    );
}
