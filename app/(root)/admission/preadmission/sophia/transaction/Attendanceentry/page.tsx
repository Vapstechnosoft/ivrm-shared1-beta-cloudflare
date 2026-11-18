'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronRight, Eye, Loader2, Save, Search, Trash2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import {
    useDeleteAttendance,
    useGetDateWiseAttendance,
    useGetMonthClassHeld,
    useGetStdListPeriod,
    useGetStudentData,
    useSaveAttendance,
    useStudentAttendanceInitialData,
    useViewAttendance
} from '@/hooks/admission/preadmission/transactions/useStudentAttendanceEntry';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentAttendanceEntryPage() {
    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<number>(0);
    const [asmclId, setAsmclId] = useState<number>(0);
    const [asmsId, setAsmsId] = useState<number>(0);
    const [attDate, setAttDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [entryType, setEntryType] = useState<string>('');
    const [monthId, setMonthId] = useState<number>(0);
    const [periodId, setPeriodId] = useState<number>(0);
    const [subjectId, setSubjectId] = useState<number>(0);
    const [attEntryTypeFlag, setAttEntryTypeFlag] = useState<string>('');
    const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [viewAttendanceList, setViewAttendanceList] = useState<any[]>([]);

    /* -------------------- Hooks -------------------- */
    const { data: initialData } = useStudentAttendanceInitialData();
    const getStudentDataMutation = useGetStudentData();
    const saveMutation = useSaveAttendance();
    const getMonthClassHeldMutation = useGetMonthClassHeld();
    const getDateWiseAttendanceMutation = useGetDateWiseAttendance();
    const getStdListPeriodMutation = useGetStdListPeriod();
    const deleteMutation = useDeleteAttendance();
    const viewAttendanceMutation = useViewAttendance();
    const [isPending, startTransition] = useTransition();

    /* -------------------- Helper -------------------- */
    const getMappedEntryType = (flag?: string | null): string => {
        if (!flag) return '';
        const clean = flag.toString().trim().toUpperCase();
        if (clean === 'DT' || clean === 'H' || clean === 'DAILYTWICE' || clean === 'DAILY TWICE') {
            return 'Dailytwice';
        }
        if (clean === 'D' || clean === 'DAILYONCE' || clean === 'DAILY ONCE' || clean === 'EOD') {
            return 'Dailyonce';
        }
        if (clean === 'M' || clean === 'MONTHLY') {
            return 'monthly';
        }
        if (clean === 'P' || clean === 'PERIOD' || clean === 'PERIOD WISE') {
            return 'period';
        }
        return '';
    };

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData?.data) {
            const data = initialData.data as any;

            // Auto-select Current Year
            const current = data.currentYear?.[0];
            if (current && asmayId === 0) {
                setAsmayId(current.asmaY_Id);
            }

            // Populate Initial Sections if available
            const initialSections = data.sectionList?.length > 0 ? data.sectionList : data.section?.length > 0 ? data.section : [];
            if (initialSections.length > 0 && sectionList.length === 0) {
                setSectionList(initialSections);
            }

            // Configure Entry Type from settings
            const entryConfig = data.attendance_entrytype?.[0];
            const dataEntryType = data.asA_Att_EntryType || entryConfig?.asA_Att_EntryType;
            if (dataEntryType && !entryType) {
                const mapped = getMappedEntryType(dataEntryType);
                if (mapped) setEntryType(mapped);
            } else if (entryConfig) {
                if (!attEntryTypeFlag) {
                    setAttEntryTypeFlag(
                        entryConfig.asC_Att_DefaultEntry_Type === 'A'
                            ? 'Attendance Entry Type Is Absent'
                            : 'Attendance Entry Type Is Present'
                    );
                }
                if (!entryType) {
                    const scheduler = entryConfig.asC_Att_Scheduler_Flag;
                    const mapped = getMappedEntryType(scheduler);
                    if (mapped) setEntryType(mapped);
                }
            }
        }
    }, [initialData, asmayId, attEntryTypeFlag, entryType, sectionList.length]);

    /* -------------------- Handlers -------------------- */
    const handleClassChange = async (cId: number) => {
        setAsmclId(cId);
        setAsmsId(0);
        setStudentList([]);
        try {
            const res = await getStudentDataMutation.mutateAsync({
                asmaY_Id: asmayId,
                asmcL_Id: cId,
                asmS_Id: 0,
                asa_FromDate: attDate,
                monthflag: '0',
                monthflag1: '0',
                classsecflag: '1',
                checksubject: '0',
                monthid: 0,
                ismS_Id: 0,
                ttmP_Id: 0
            });
            const pData = res?.data?.data || res?.data || res;
            if (pData) {
                const sList = pData.sectionList || pData.section || pData.data?.sectionList || pData.data?.section || [];
                setSectionList(sList);
                const flag = pData.asA_Att_EntryType || pData.data?.asA_Att_EntryType || res?.asA_Att_EntryType;
                if (flag) {
                    const clean = flag.toString().trim().toUpperCase();
                    if (clean === 'DT') {
                        setEntryType('Dailytwice');
                    } else if (clean === 'D') {
                        setEntryType('Dailyonce');
                    } else if (clean === 'M') {
                        setEntryType('monthly');
                    } else if (clean === 'P') {
                        setEntryType('period');
                    } else {
                        const mappedType = getMappedEntryType(flag);
                        if (mappedType) setEntryType(mappedType);
                    }
                }
                const attFlag = pData.attendanceentryflag || pData.data?.attendanceentryflag;
                if (attFlag)
                    setAttEntryTypeFlag(
                        attFlag === 'A' ? 'Attendance Entry Type Is Absent' : 'Attendance Entry Type Is Present'
                    );
            }
        } catch (error) {
            toast.error('Error loading class details');
        }
    };

    const fetchStudents = async () => {
        if (!asmayId || !asmclId || !asmsId) return;
        startTransition(async () => {
            try {
                let res: any;
                const getFlag = (type: string) => {
                    if (type === 'Dailyonce') return 'Dailyonce';
                    if (type === 'Dailytwice') return 'Dailytwice';
                    if (type === 'monthly') return 'monthly';
                    if (type === 'period') return 'period';
                    return 'D';
                };
                const flag = getFlag(entryType);

                if (entryType === 'period') {
                    res = await getStdListPeriodMutation.mutateAsync({
                        ASMAY_Id: asmayId,
                        ASMCL_Id: asmclId,
                        ASMS_Id: asmsId,
                        ismS_Id: subjectId,
                        TTMP_Id: periodId,
                        ASA_Entry_DateTime: attDate,
                        att_entry_type: 'period'
                    });
                } else if (entryType === 'monthly') {
                    res = await getMonthClassHeldMutation.mutateAsync({
                        ASMAY_Id: asmayId,
                        ASMCL_Id: asmclId,
                        ASMS_Id: asmsId,
                        IVRM_Month_Id: monthId,
                        monthflag1: 'monthly',
                        asamdM_Entry_DateTime: attDate
                    });
                } else {
                    res = await getStudentDataMutation.mutateAsync({
                        asmaY_Id: asmayId,
                        asmcL_Id: asmclId,
                        asmS_Id: asmsId,
                        asa_FromDate: attDate,
                        monthflag: flag,
                        monthflag1: flag,
                        classsecflag: '0',
                        checksubject: '0',
                        monthid: monthId,
                        ismS_Id: subjectId,
                        ttmP_Id: periodId
                    });
                }

                // Resilient data extraction
                const responseData = res?.data?.data || res?.data || res;
                const entryFlag = responseData?.asA_Att_EntryType || responseData?.data?.asA_Att_EntryType || res?.asA_Att_EntryType;
                const mappedType = getMappedEntryType(entryFlag);
                if (mappedType && mappedType !== entryType) {
                    setEntryType(mappedType);
                }

                const sList =
                    responseData?.studentList ||
                    responseData?.studestudentList1 ||
                    responseData?.studentList1 ||
                    responseData?.students ||
                    responseData?.studentList5 ||
                    responseData?.data?.studentList ||
                    responseData?.data?.studestudentList1 ||
                    responseData?.data?.studentList1 ||
                    responseData?.data?.students ||
                    [];

                if (sList.length > 0) {
                    const isAbsentMode = attEntryTypeFlag.includes('Absent');
                    const isDailyTwice = entryFlag === 'DT' || mappedType === 'Dailytwice' || entryType === 'Dailytwice';

                    setStudentList(
                        sList.map((s: any) => {
                            let isSelected = false;
                            let firstHalf = false;
                            let secondHalf = false;

                            if (s.asA_Id > 0 || s.asaS_Id > 0 || s.ASAS_Id > 0) {
                                if (isDailyTwice) {
                                    if (isAbsentMode) {
                                        if (s.pdays === 0) {
                                            firstHalf = true;
                                            secondHalf = true;
                                        } else if (s.pdays === 0.5) {
                                            const flag = (s.asA_Dailytwice_Flag || '').toLowerCase();
                                            firstHalf = flag !== 'firsthalf';
                                            secondHalf = flag === 'firsthalf';
                                        } else {
                                            firstHalf = false;
                                            secondHalf = false;
                                        }
                                    } else {
                                        if (s.pdays === 1) {
                                            firstHalf = true;
                                            secondHalf = true;
                                        } else if (s.pdays === 0.5) {
                                            const flag = (s.asA_Dailytwice_Flag || '').toLowerCase();
                                            firstHalf = flag === 'firsthalf' || s.firstHalfflag === true;
                                            secondHalf = flag === 'secondhalf' || s.secondHalfflag === true;
                                        } else {
                                            firstHalf = s.firstHalfflag === true;
                                            secondHalf = s.secondHalfflag === true;
                                        }
                                    }
                                } else {
                                    isSelected = isAbsentMode
                                        ? s.pdays === 0
                                        : s.pdays > 0 || s.selected === true;
                                }
                            } else {
                                isSelected = !isAbsentMode;
                                firstHalf = !isAbsentMode;
                                secondHalf = !isAbsentMode;
                            }

                            return {
                                ...s,
                                AMST_Id: s.amsT_Id || s.AMST_Id,
                                studentName: s.studentname || s.studentName,
                                selected: isSelected,
                                FirstHalfflag: firstHalf,
                                SecondHalfflag: secondHalf
                            };
                        })
                    );
                } else {
                    setStudentList([]);
                }
            } catch (error) {
                setStudentList([]);
            }
        });
    };

    useEffect(() => {
        if (asmayId && asmclId && asmsId) {
            fetchStudents();
        } else {
            setStudentList([]);
        }
    }, [asmayId, asmclId, asmsId, attDate, subjectId, periodId, monthId, entryType]);

    const onSave = async () => {
        if (studentList.length === 0) return toast.error('Fetch student list first');

        const now = new Date().toISOString();
        const formattedDate = attDate.includes('T') ? attDate : `${attDate}T00:00:00Z`;

        const payload: any = {
            ASMAY_Id: asmayId,
            ASMCL_Id: asmclId,
            ASMS_Id: asmsId,
            ASA_Att_Type: entryType,
            ASA_FromDate: formattedDate,
            ASA_ToDate: formattedDate,
            ASA_ClassHeld: '1',
            ASA_Entry_DateTime: now,
            ASA_Network_IP: '192.168.1.1'
        };

        if (entryType === 'period') {
            payload.ismS_Id = subjectId;
            payload.ISMP_Id = periodId;
            payload.TTMP_Id = periodId;
            payload.ASA_Regular_Extra = 'Regular';
            payload.asasB_Id = 1; // Default as per example
            payload.stdList = studentList.map((s) => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                selected: s.selected,
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        } else if (entryType === 'Dailytwice') {
            payload.stdList = studentList.map((s) => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                FirstHalfflag: s.FirstHalfflag,
                SecondHalfflag: s.SecondHalfflag,
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        } else if (entryType === 'monthly') {
            payload.stdList = studentList.map((s) => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                pdays: Number(s.pdays || 0),
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        } else {
            // Dailyonce or general
            payload.stdList = studentList.map((s) => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                selected: s.selected,
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        }

        const res = await saveMutation.mutateAsync(payload);
        if (res.success) {
            await Swal.fire('Success', res.message || 'Attendance saved successfully', 'success');
            window.location.reload();
        } else {
            toast.error(res.message || 'Failed to save attendance');
        }
    };

    const onViewAttendance = async () => {
        if (!asmayId || !asmclId || !asmsId) {
            return toast.error('Please select Academic Year, Class and Section');
        }
        try {
            const res = await viewAttendanceMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                att_entry_type: entryType
            });
            const list: any[] = (res as any)?.viewStudentPeriodWiseAttDetails || (res as any)?.data || (Array.isArray(res) ? res : []);
            if (list && list.length > 0) {
                setViewAttendanceList(list);
                setIsViewModalOpen(true);
            } else {
                toast.info('No records found for the selection');
            }
        } catch (error) {
            toast.error('Failed to load attendance details');
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Delete Attendance?',
            text: 'This will remove the selected attendance record permanently.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete'
        });
        if (result.isConfirmed) {
            const res = await deleteMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                ASA_Entry_DateTime: attDate,
                att_entry_type: entryType
            });
            if (res.success) {
                Swal.fire('Deleted', res.message || 'Record removed.', 'success');
                setStudentList([]);
            } else {
                toast.error(res.message || 'Failed to delete record');
            }
        }
    };

    const getEntryTypeLabel = () => {
        switch (entryType) {
            case 'Dailyonce':
                return 'DAILY ONCE';
            case 'Dailytwice':
                return 'DAILY TWICE';
            case 'monthly':
                return 'MONTHLY';
            case 'period':
                return 'PERIOD WISE';
            default:
                return 'ATTENDANCE ENTRY DETAILS';
        }
    };

    const filteredStudents = studentList.filter((s) => {
        const sName = (s.studentname || s.studentName || '').toString().toLowerCase();
        const sAdm = (s.amsT_AdmNo || '').toString().toLowerCase();
        const search = searchTerm.toLowerCase();
        return sName.includes(search) || sAdm.includes(search);
    });

    if (!initialData)
        return (
            <div className='flex h-screen items-center justify-center bg-[#edf2f9]'>
                <Loader2 className='h-8 w-8 animate-spin text-[#3c8dbc]' />
            </div>
        );

    return (
        <div className='min-h-screen space-y-4 bg-[#edf2f9] p-4 font-sans'>
            {/* Header / Breadcrumbs */}
            <div className='mb-1 flex items-center justify-between font-bold text-[#003366] text-[11px] uppercase tracking-tight'>
                <div className='flex items-center gap-1'>
                    <span>ATTENDANCE</span>
                    <ChevronRight className='h-3 w-3' />
                    <span className='text-gray-400'>Student Attendance Entry</span>
                </div>
            </div>

            {/* Card 1: Initial Selection */}
            <Card className='rounded-none border-t-2 border-t-[#3c8dbc] shadow-sm'>
                <CardHeader className='flex min-h-[36px] flex-row items-center justify-between border-b bg-white px-4 py-1'>
                    <CardTitle className='font-bold text-[#003366] text-[11px]'>ATTENDANCE ENTRY</CardTitle>
                    <div className='cursor-pointer font-bold text-gray-400 text-xs'>_</div>
                </CardHeader>
                <CardContent className='p-6'>
                    <div className='mx-auto max-w-2xl space-y-3'>
                        <div className='flex items-center gap-4'>
                            <Label className='w-40 text-right font-bold text-[11px] text-gray-700'>
                                Academic Year: <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-64'>
                                <Select value={asmayId.toString()} onValueChange={(v) => setAsmayId(Number(v))}>
                                    <SelectTrigger className='h-7 w-full rounded-sm border-gray-300 text-[11px]'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(initialData?.data as any)?.academicYearList?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='w-40 text-right font-bold text-[11px] text-gray-700'>
                                Class: <span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative w-64'>
                                <Select value={asmclId.toString()} onValueChange={(v) => handleClassChange(Number(v))}>
                                    <SelectTrigger className='h-7 w-full rounded-sm border-gray-300 px-2 text-[11px]'>
                                        <div className='flex items-center gap-2'>
                                            <Search className='h-3 w-3 text-gray-400' />
                                            <SelectValue placeholder='Search...' />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(initialData?.data as any)?.classList?.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Configuration */}
            {asmclId > 0 && (
                <Card className='rounded-none border-t-2 border-t-[#3c8dbc] shadow-sm'>
                    <CardHeader className='flex min-h-[36px] flex-row items-center justify-between border-b bg-white px-4 py-1'>
                        <CardTitle className='font-bold text-[#003366] text-[11px] uppercase'>{getEntryTypeLabel()}</CardTitle>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                onClick={onViewAttendance}
                                disabled={viewAttendanceMutation.isPending}
                                className='h-6 rounded-sm bg-[#3c8dbc] px-3 font-bold text-[10px] text-white hover:bg-[#367fa9]'>
                                {viewAttendanceMutation.isPending ? (
                                    <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                ) : (
                                    <Eye className='mr-1 h-3 w-3' />
                                )}
                                View Period Wise Attendance
                            </Button>
                            <div className='cursor-pointer font-bold text-gray-400 text-xs'>_</div>
                        </div>
                    </CardHeader>
                    <CardContent className='p-6'>
                        <div className='mx-auto max-w-5xl space-y-6'>
                            <div className='flex justify-center'>
                                <div className='rounded-sm border bg-[#f9fafc] p-2'>
                                    <RadioGroup value={entryType} onValueChange={setEntryType} className='flex gap-8'>
                                        {[
                                            { label: 'Daily Once', value: 'Dailyonce' },
                                            { label: 'Daily Twice', value: 'Dailytwice' },
                                            { label: 'Monthly', value: 'monthly' },
                                            { label: 'Period Wise', value: 'period' }
                                        ].map((item) => (
                                            <div key={item.value} className='flex items-center space-x-1.5'>
                                                <RadioGroupItem
                                                    value={item.value}
                                                    id={item.value}
                                                    className='h-3 w-3 border-gray-400'
                                                />
                                                <Label htmlFor={item.value} className='cursor-pointer font-bold text-[10px] text-gray-600'>
                                                    {item.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2'>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-40 text-right font-bold text-[11px] text-gray-700'>
                                        Section: <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='w-64'>
                                        <Select value={asmsId.toString()} onValueChange={(v) => setAsmsId(Number(v))}>
                                            <SelectTrigger className='h-7 w-full rounded-sm border-gray-300 text-[11px]'>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectionList.map((s: any) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <Label className='w-40 text-right font-bold text-[11px] text-gray-700'>
                                        DOE: <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='relative w-64'>
                                        <Input
                                            type='date'
                                            value={attDate}
                                            onChange={(e) => setAttDate(e.target.value)}
                                            className='relative z-10 h-7 cursor-pointer rounded-sm border-gray-300 bg-transparent pr-8 pl-2 text-[11px]'
                                        />
                                        <CalendarIcon className='-translate-y-1/2 pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 text-gray-400' />
                                        <style
                                            dangerouslySetInnerHTML={{
                                                __html: `
                                            input[type="date"]::-webkit-calendar-picker-indicator {
                                                position: absolute;
                                                left: 0;
                                                top: 0;
                                                width: 100%;
                                                height: 100%;
                                                margin: 0;
                                                padding: 0;
                                                cursor: pointer;
                                                opacity: 0;
                                            }
                                        `
                                            }}
                                        />
                                    </div>
                                </div>

                                {entryType === 'monthly' && (
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-40 text-right font-bold text-[11px] text-gray-700'>
                                            Month: <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='w-64'>
                                            <Select value={monthId.toString()} onValueChange={(v) => setMonthId(Number(v))}>
                                                <SelectTrigger className='h-7 w-full rounded-sm border-gray-300 text-[11px]'>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.monthList?.map((m: any) => (
                                                        <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>
                                                            {m.ivrM_Month_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                                {/* {(entryType === 'period' || (initialData?.data as any)?.subjectList?.length > 0) && (
                                    <div className='flex items-center gap-4'>
                                        <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Subject: <span className='text-red-500'>*</span></Label>
                                        <Select value={subjectId.toString()} onValueChange={(v) => setSubjectId(Number(v))}>
                                            <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px]'><SelectValue placeholder='Select Subject' /></SelectTrigger>
                                            <SelectContent>
                                                {(initialData?.data as any)?.subjectList?.map((s: any) => (
                                                    <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()}>{s.ismS_SubjectName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )} */}
                                {entryType === 'period' && (
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-40 text-right font-bold text-[11px] text-gray-700'>
                                            Period: <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='w-64'>
                                            <Select value={periodId.toString()} onValueChange={(v) => setPeriodId(Number(v))}>
                                                <SelectTrigger className='h-7 w-full rounded-sm border-gray-300 text-[11px]'>
                                                    <SelectValue placeholder='Select Period' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.periodlist?.map((p: any) => (
                                                        <SelectItem key={p.ttmP_Id} value={p.ttmP_Id.toString()}>
                                                            {p.ttmP_PeriodName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Card 3: Student Details */}
            {asmsId > 0 && (
                <Card className='fade-in slide-in-from-bottom-2 animate-in rounded-none border-t-2 border-t-[#3c8dbc] shadow-sm duration-500'>
                    <CardHeader className='flex min-h-[36px] flex-row items-center justify-between border-b bg-white px-4 py-1'>
                        <CardTitle className='font-bold text-[#003366] text-[11px]'>STUDENT DETAILS</CardTitle>
                        <div className='cursor-pointer font-bold text-gray-400 text-xs'>_</div>
                    </CardHeader>
                    <CardContent className='space-y-4 p-4'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold text-[#3c8dbc] text-[11px]'>{attEntryTypeFlag}</span>
                            <div className='flex w-[250px] items-center gap-2 rounded-sm border bg-white px-2 py-1 shadow-inner'>
                                <Search className='h-3 w-3 text-gray-400' />
                                <Input
                                    placeholder='search here...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className='h-5 border-none p-0 text-[11px] shadow-none focus-visible:ring-0'
                                />
                            </div>
                        </div>

                        {isPending ? (
                            <div className='flex h-40 items-center justify-center'>
                                <Loader2 className='h-6 w-6 animate-spin text-[#3c8dbc]' />
                            </div>
                        ) : (
                            <div className='overflow-x-auto border'>
                                <Table className='border-collapse'>
                                    <TableHeader className='bg-[#3c8dbc]'>
                                        <TableRow className='h-9'>
                                            <TableHead className='w-16 border-r text-center font-bold text-[10px] text-white'>
                                                SL NO
                                            </TableHead>
                                            <TableHead className='w-20 border-r text-center font-bold text-[10px] text-white'>
                                                ROLL NO
                                            </TableHead>
                                            <TableHead className='border-r font-bold text-[10px] text-white'>STUDENT NAME</TableHead>
                                            <TableHead className='border-r font-bold text-[10px] text-white'>ADMISSION NO</TableHead>
                                            {entryType === 'Dailytwice' ? (
                                                <>
                                                    <TableHead className='w-24 border-r text-center font-bold text-[10px] text-white'>
                                                        FIRST HALF
                                                    </TableHead>
                                                    <TableHead className='w-24 text-center font-bold text-[10px] text-white'>
                                                        SECOND HALF
                                                    </TableHead>
                                                </>
                                            ) : (
                                                <TableHead className='w-24 text-center font-bold text-[10px] text-white'>
                                                    ATTENDANCE
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((s, idx) => (
                                                <TableRow
                                                    key={idx}
                                                    className='h-10 border-gray-100 border-b transition-colors hover:bg-[#f1f4f9]'>
                                                    <TableCell className='border-r text-center text-[11px] text-gray-500'>
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell className='border-r text-center text-[11px] text-gray-500'>
                                                        {s.amaY_RollNo || '-'}
                                                    </TableCell>
                                                    <TableCell className='border-r font-bold text-[11px] text-gray-700 uppercase'>
                                                        {s.studentname || s.studentName}
                                                    </TableCell>
                                                    <TableCell className='border-r text-[11px] text-gray-500'>{s.amsT_AdmNo}</TableCell>
                                                    {entryType === 'Dailytwice' ? (
                                                        <>
                                                            <TableCell className='border-r text-center'>
                                                                <Checkbox
                                                                    checked={s.FirstHalfflag}
                                                                    onCheckedChange={(v) => {
                                                                        const newList = [...studentList];
                                                                        const actualIdx = studentList.findIndex(
                                                                            (item) => item.AMST_Id === s.AMST_Id
                                                                        );
                                                                        if (actualIdx > -1) {
                                                                            newList[actualIdx].FirstHalfflag = !!v;
                                                                            setStudentList(newList);
                                                                        }
                                                                    }}
                                                                    className='h-3.5 w-3.5 border-gray-400 data-[state=checked]:border-[#3c8dbc] data-[state=checked]:bg-[#3c8dbc]'
                                                                />
                                                            </TableCell>
                                                            <TableCell className='text-center'>
                                                                <Checkbox
                                                                    checked={s.SecondHalfflag}
                                                                    onCheckedChange={(v) => {
                                                                        const newList = [...studentList];
                                                                        const actualIdx = studentList.findIndex(
                                                                            (item) => item.AMST_Id === s.AMST_Id
                                                                        );
                                                                        if (actualIdx > -1) {
                                                                            newList[actualIdx].SecondHalfflag = !!v;
                                                                            setStudentList(newList);
                                                                        }
                                                                    }}
                                                                    className='h-3.5 w-3.5 border-gray-400 data-[state=checked]:border-[#3c8dbc] data-[state=checked]:bg-[#3c8dbc]'
                                                                />
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <TableCell className='text-center'>
                                                            <Checkbox
                                                                checked={s.selected}
                                                                onCheckedChange={(v) => {
                                                                    const newList = [...studentList];
                                                                    const actualIdx = studentList.findIndex(
                                                                        (item) =>
                                                                            (item.AMST_Id || item.amsT_Id) === (s.AMST_Id || s.amsT_Id)
                                                                    );
                                                                    if (actualIdx > -1) {
                                                                        newList[actualIdx].selected = !!v;
                                                                        setStudentList(newList);
                                                                    }
                                                                }}
                                                                className='h-3.5 w-3.5 border-gray-400 data-[state=checked]:border-[#3c8dbc] data-[state=checked]:bg-[#3c8dbc]'
                                                            />
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className='py-10 text-center text-gray-400 text-xs'>
                                                    No student data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {studentList.length > 0 && (
                            <div className='flex justify-center gap-2 pt-2'>
                                <Button
                                    onClick={onSave}
                                    disabled={saveMutation.isPending}
                                    className='h-7 rounded-sm bg-[#00a65a] px-6 font-bold text-[10px] hover:bg-[#008d4c]'>
                                    {saveMutation.isPending ? (
                                        <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                                    ) : (
                                        <Save className='mr-1.5 h-3.5 w-3.5' />
                                    )}
                                    {saveMutation.isPending ? 'SAVING...' : 'SAVE'}
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    className='h-7 rounded-sm bg-[#dd4b39] px-6 font-bold text-[10px] hover:bg-[#d73925]'>
                                    <Trash2 className='mr-1.5 h-3.5 w-3.5' /> DELETE
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={() => window.location.reload()}
                                    className='h-7 rounded-sm border-gray-300 px-6 font-bold text-[10px]'>
                                    CANCEL
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View Attendance Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className='max-w-5xl overflow-hidden rounded-none border-none p-0'>
                    <DialogHeader className='flex flex-row items-center justify-between bg-[#3c8dbc] px-4 py-2 text-white'>
                        <DialogTitle className='font-bold text-[11px] uppercase'>View Attendance Details</DialogTitle>
                    </DialogHeader>
                    <div className='max-h-[70vh] overflow-y-auto bg-white p-4'>
                        <div className='overflow-x-auto border'>
                            <Table className='border-collapse'>
                                <TableHeader className='bg-[#f4f4f4]'>
                                    <TableRow className='h-9'>
                                        <TableHead className='w-16 border-r text-center font-bold text-[10px] text-gray-700'>
                                            SL NO
                                        </TableHead>
                                        <TableHead className='border-r font-bold text-[10px] text-gray-700'>DATE</TableHead>
                                        <TableHead className='border-r font-bold text-[10px] text-gray-700'>STAFF NAME</TableHead>
                                        <TableHead className='border-r text-center font-bold text-[10px] text-gray-700'>TOTAL</TableHead>
                                        <TableHead className='border-r text-center font-bold text-[10px] text-gray-700'>PRESENT</TableHead>
                                        <TableHead className='border-r text-center font-bold text-[10px] text-gray-700'>ABSENT</TableHead>
                                        <TableHead className='border-r font-bold text-[10px] text-gray-700'>ENTRY DATE</TableHead>
                                        <TableHead className='w-24 text-center font-bold text-[10px] text-gray-700'>ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewAttendanceList.map((item, idx) => (
                                        <TableRow key={idx} className='h-10 border-gray-100 border-b hover:bg-[#f9fafc]'>
                                            <TableCell className='border-r text-center text-[11px] text-gray-500'>{idx + 1}</TableCell>
                                            <TableCell className='border-r font-medium text-[11px] text-gray-700'>
                                                {item.ASA_FROMDATE ||
                                                    (item.asA_FromDate ? format(new Date(item.asA_FromDate), 'dd/MM/yyyy') : '-')}
                                            </TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600 uppercase'>
                                                {item.EMPLOYEENAME || '-'}
                                            </TableCell>
                                            <TableCell className='border-r text-center font-bold text-[11px] text-blue-600 text-gray-600'>
                                                {item.TotalCount ?? '-'}
                                            </TableCell>
                                            <TableCell className='border-r text-center font-bold text-[11px] text-gray-600 text-green-600'>
                                                {item.PresentCount ?? '-'}
                                            </TableCell>
                                            <TableCell className='border-r text-center font-bold text-[11px] text-gray-600 text-red-600'>
                                                {item.AbsentCount ?? '-'}
                                            </TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600'>
                                                {item.ASA_Entry_DateTime || '-'}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700'
                                                    onClick={() => {
                                                        // Handle delete record wise if needed
                                                        Swal.fire({
                                                            title: 'Delete Record?',
                                                            text: 'Are you sure you want to delete this specific record?',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Yes, Delete'
                                                        }).then(async (result) => {
                                                            if (result.isConfirmed) {
                                                                // Call delete logic here
                                                                toast.info('Delete functionality to be implemented');
                                                            }
                                                        });
                                                    }}>
                                                    <Trash2 className='h-3.5 w-3.5' />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 border-t bg-gray-50 px-4 py-3'>
                        <Button
                            variant='outline'
                            onClick={() => setIsViewModalOpen(false)}
                            className='h-7 rounded-sm border-gray-300 px-6 font-bold text-[10px]'>
                            CLOSE
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
