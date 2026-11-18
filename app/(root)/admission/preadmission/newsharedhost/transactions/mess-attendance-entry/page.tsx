'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useAttendanceDeleteRecordWise,
    useDeleteAttendance,
    useGetBatchList,
    useGetDatewiseAttMDM,
    useGetMonthClassHeld,
    useGetStdListPeriod,
    useGetStudentData,
    useGetStudents,
    useMessAttendanceLoadData,
    useSaveMessStudentAttendance,
    useViewAttendanceDetailsStaffWise
} from '@/hooks/admission/preadmission/transactions/useMessAttendanceEntry';
import { Calendar as CalendarIcon, Eye, Loader2, Save, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function MessAttendanceEntryPage() {
    // --- State Management ---
    const [academicYearId, setAcademicYearId] = useState<string>('');
    const [classId, setClassId] = useState<string>('');
    const [sectionId, setSectionId] = useState<string>('');
    const [entryType, setEntryType] = useState<string>('Dailyonce'); // Dailyonce, Dailytwice, monthly, period
    const [doe, setDoe] = useState<string>(new Date().toISOString().split('T')[0]);
    const [monthId, setMonthId] = useState<string>('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [periodId, setPeriodId] = useState<string>('');
    const [batchId, setBatchId] = useState<string>('');
    const [attendanceType, setAttendanceType] = useState<'Regular' | 'Extra Period'>('Regular');
    const [session1, setSession1] = useState<boolean>(false);
    const [session2, setSession2] = useState<boolean>(false);

    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [totalClassHeld, setTotalClassHeld] = useState<number>(0);

    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');
    const [updateCount, setUpdateCount] = useState<number>(0);
    const [saveDis, setSaveDis] = useState<boolean>(false);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historySearch, setHistorySearch] = useState('');

    // --- Configuration State ---
    const [showAdmNo, setShowAdmNo] = useState(true);
    const [showRegNo, setShowRegNo] = useState(false);
    const [showRollNo, setShowRollNo] = useState(true);
    const [sortKey, setSortKey] = useState<string>('studentname');
    const [sortReverse, setSortReverse] = useState<boolean>(false);
    const [isBatchRequired, setIsBatchRequired] = useState(false);

    // --- Queries & Mutations ---
    const { data: loadData, isLoading: isLoadLoading } = useMessAttendanceLoadData();

    useEffect(() => {
        if (loadData) {
            if (loadData.currentYear?.length > 0 && !academicYearId) {
                const curYear = loadData.currentYear[0];
                setAcademicYearId(curYear.asmaY_Id.toString());
                // In legacy, if yearid === 0, doe = new Date(), else from_date
                // Here we default to current date or from_date
            }

            // Check default entry type from loadData if available
            if (loadData.asA_Att_EntryType && !entryType) {
                const types: any = { D: 'Dailyonce', H: 'Dailytwice', M: 'monthly', P: 'period' };
                setEntryType(types[loadData.asA_Att_EntryType] || '');
            }
        }
    }, [loadData]);

    const studentDataMutation = useGetStudentData();
    const studentsMutation = useGetStudents();
    const monthClassHeldMutation = useGetMonthClassHeld();
    const datewiseAttMutation = useGetDatewiseAttMDM();
    const batchListMutation = useGetBatchList();
    const stdListPeriodMutation = useGetStdListPeriod();
    const viewHistoryMutation = useViewAttendanceDetailsStaffWise();
    const saveMutation = useSaveMessStudentAttendance();
    const deleteMutation = useDeleteAttendance();
    const deleteRecordWiseMutation = useAttendanceDeleteRecordWise();

    // --- Derived Data ---
    const years = loadData?.academicYearList || [];
    const classes = loadData?.classList || [];
    const sections = loadData?.sectionList || [];

    // Sort Month List based on Academic Year Start
    const sortedMonths = useMemo(() => {
        if (!loadData?.monthList || !loadData?.currentYear?.[0]) return loadData?.monthList || [];
        const fromDate = new Date(loadData.currentYear[0].asmaY_From_Date);
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        const monthsOrder: string[] = [];
        const date = new Date(fromDate);
        for (let i = 0; i < 12; i++) {
            monthsOrder.push(monthNames[date.getMonth()].toLowerCase());
            date.setMonth(date.getMonth() + 1);
        }

        return [...loadData.monthList].sort((a, b) => {
            return (
                monthsOrder.indexOf(a.ivrM_Month_Name.toLowerCase().trim()) - monthsOrder.indexOf(b.ivrM_Month_Name.toLowerCase().trim())
            );
        });
    }, [loadData]);

    const subjects = loadData?.subjectList || [];
    const periods = loadData?.periodlist || [];
    const [subjectBatches, setSubjectBatches] = useState<any[]>([]);
    const batches = subjectBatches.length > 0 ? subjectBatches : loadData?.batchList || [];

    const processedStudents = useMemo(() => {
        const list = [...studentList];

        // Sorting logic based on sortKey
        list.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortReverse ? 1 : -1;
            if (valA > valB) return sortReverse ? -1 : 1;
            return 0;
        });

        if (!searchValue) return list;
        const search = searchValue.toLowerCase();
        return list.filter(
            (s) =>
                s.studentname?.toLowerCase().includes(search) ||
                s.amsT_AdmNo?.toLowerCase().includes(search) ||
                s.amsT_RegistrationNo?.toLowerCase().includes(search) ||
                s.amaY_RollNo?.toString().includes(search)
        );
    }, [studentList, searchValue, sortKey, sortReverse]);

    // --- Handlers ---
    const handleYearChange = (val: string) => {
        setAcademicYearId(val);
        setClassId('');
        setSectionId('');
        setEntryType('');
        setStudentList([]);
        setSelectedStudentIds([]);
    };

    const [classSections, setClassSections] = useState<any[]>(sections);

    useEffect(() => {
        if (loadData?.sectionList) {
            setClassSections(loadData.sectionList);
        }
    }, [loadData]);

    const handleClassChange = async (val: string) => {
        setClassId(val);
        setSectionId('');
        setEntryType('');
        setStudentList([]);
        setSelectedStudentIds([]);

        try {
            const res = await studentDataMutation.mutateAsync({
                asmay_Id: Number(academicYearId),
                asmcl_Id: Number(val),
                asmS_Id: 0,
                asamdM_Entry_DateTime: doe,
                monthflag: '0',
                monthflag1: '0',
                classsecflag: '1',
                checksubject: '0'
            });

            if (res) {
                if (res.isHoliday) {
                    toast.warning(res.holidayMessage || 'Selected date is a holiday.');
                    return;
                }

                if (res.asA_Att_EntryType) {
                    const types: any = { D: 'Dailyonce', H: 'Dailytwice', M: 'monthly', P: 'period' };
                    setEntryType(types[res.asA_Att_EntryType] || 'Dailyonce');
                } else {
                    setEntryType('Dailyonce');
                }

                if (res.section?.length > 0) {
                    setClassSections(res.section);
                }
            }
        } catch (error) {
            toast.error('Failed to load class configuration');
        }
    };

    const applyConfiguration = (promise: any) => {
        if (promise.admissionstandarad?.length > 0) {
            const config = promise.admissionstandarad[0];
            const orderFlags: any = {
                1: 'studentname',
                2: 'studentname',
                3: 'amaY_RollNo',
                4: 'studentname',
                5: 'studentname',
                6: 'amsT_RegistrationNo',
                7: 'amsT_AdmNo'
            };
            setSortKey(orderFlags[config.asC_Att_Default_OrderFlag] || 'studentname');
        }

        if (promise.getstandarad?.length > 0) {
            const std = promise.getstandarad[0];
            setShowAdmNo(std.ivrmgC_AdmnoColumnDisplay === 1);
            setShowRegNo(std.ivrmgC_RegnoColumnDisplay === 1);
            setShowRollNo(std.ivrmgC_RollnoColumnDisplay === 1);
            if (std.ivrmgC_AdmnoColumnDisplay !== 1 && std.ivrmgC_RegnoColumnDisplay !== 1 && std.ivrmgC_RollnoColumnDisplay !== 1) {
                setShowAdmNo(true);
                setShowRollNo(true);
            }
        }
    };

    const fetchStudents = async (sId?: string, d?: string) => {
        const sid = sId || sectionId;
        const entryDate = d || doe;
        if (!academicYearId || !classId || !sid) return;

        try {
            let res;
            if (entryType === 'monthly') {
                if (!monthId) return;
                res = await monthClassHeldMutation.mutateAsync({
                    asmay_Id: Number(academicYearId),
                    asmcl_Id: Number(classId),
                    asmS_Id: Number(sid),
                    monthid: Number(monthId),
                    monthflag: 'M',
                    monthflag1: 'monthly',
                    asamdM_Entry_DateTime: entryDate
                });
            } else if (entryType === 'period') {
                if (!periodId) return;
                res = await stdListPeriodMutation.mutateAsync({
                    asmay_Id: Number(academicYearId),
                    asmcl_Id: Number(classId),
                    asmS_Id: Number(sid),
                    ismS_Id: Number(subjectId),
                    ttmP_Id: Number(periodId),
                    monthflag: 'P',
                    monthflag1: 'period',
                    asamdM_Entry_DateTime: entryDate,
                    asasB_Id: Number(batchId) || 0
                });
            } else {
                res = await studentsMutation.mutateAsync({
                    asmay_Id: Number(academicYearId),
                    asmcl_Id: Number(classId),
                    asmS_Id: Number(sid),
                    asamdM_Entry_DateTime: entryDate,
                    monthflag: entryType === 'Dailyonce' ? 'D' : 'H',
                    monthflag1: entryType === 'Dailyonce' ? 'Dailyonce' : 'Dailytwice',
                    classsecflag: '1',
                    checksubject: '1'
                });
            }

            if (res) {
                if (res.isHoliday) {
                    toast.warning(res.holidayMessage || 'Selected date is a holiday.');
                    setStudentList([]);
                    return;
                }

                applyConfiguration(res);

                const list = res.studentList || res.studestudentList1 || res.students || [];
                setStudentList(list);

                const updateCnt = res.countclass1 || (res.monthList && res.monthList[0]?.attcount) || 0;
                setUpdateCount(updateCnt);

                if (entryType === 'monthly') {
                    setTotalClassHeld(res.countclass || 0);
                    if (res.startdate) setFromDate(new Date(res.startdate).toISOString().split('T')[0]);
                    if (res.enddate) setToDate(new Date(res.enddate).toISOString().split('T')[0]);
                }

                // Set selected based on pdays
                const selected = list
                    .filter((s: any) => {
                        if (res.attendanceentryflag === 'A') return s.pdays === 0;
                        return s.pdays > 0;
                    })
                    .map((s: any) => s.amsT_Id);
                setSelectedStudentIds(selected);
            }
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    const handleSectionChange = (val: string) => {
        setSectionId(val);
        setStudentList([]);
        if (entryType !== 'monthly' && entryType !== 'period') {
            fetchStudents(val);
        }
    };

    const handleDOEChange = async (val: string) => {
        setDoe(val);
        if (sectionId) {
            if (entryType === 'period') {
                if (subjectId && periodId) fetchStudents(undefined, val);
            } else if (entryType !== 'monthly') {
                try {
                    const res = await datewiseAttMutation.mutateAsync({
                        asmay_Id: Number(academicYearId),
                        asmcl_Id: Number(classId),
                        asmS_Id: Number(sectionId),
                        asamdM_Entry_DateTime: val,
                        monthflag: entryType === 'Dailyonce' ? 'D' : 'H',
                        monthid: 0
                    });
                    if (res) {
                        applyConfiguration(res);
                        const list = res.studentList || res.studestudentList1 || res.students || [];
                        setStudentList(list);

                        const updateCnt = res.countclass1 || (res.monthList && res.monthList[0]?.attcount) || 0;
                        setUpdateCount(updateCnt);
                        const selected = list
                            .filter((s: any) => {
                                if (res.attendanceentryflag === 'A') return s.pdays === 0;
                                return s.pdays > 0;
                            })
                            .map((s: any) => s.amsT_Id);
                        setSelectedStudentIds(selected);
                    }
                } catch (error) {
                    toast.error('Failed to fetch attendance data for the selected date');
                }
            }
        }
    };

    const handleMonthChange = async (val: string) => {
        setMonthId(val);
        if (!academicYearId || !classId || !sectionId) return;
        fetchStudents(undefined, doe);
    };

    const handleSubjectChange = async (val: string) => {
        setSubjectId(val);
        setPeriodId('');
        setBatchId('');
        setStudentList([]);
        try {
            const res = await batchListMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                ismS_Id: Number(val)
            });
            if (res?.batchList?.length > 0) {
                setSubjectBatches(res.batchList);
                setIsBatchRequired(true);
            } else {
                setSubjectBatches([]);
                setIsBatchRequired(false);
            }
        } catch (error) {
            toast.error('Failed to fetch batch list');
        }
    };

    const handlePeriodChange = async (pId: string) => {
        setPeriodId(pId);
        if (academicYearId && classId && sectionId && subjectId && pId) {
            fetchStudents();
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(processedStudents.map((s) => s.amsT_Id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleStudentSelect = (sId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds((prev) => [...prev, sId]);
        } else {
            setSelectedStudentIds((prev) => prev.filter((id) => id !== sId));
        }
    };

    const handleSave = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please complete all required fields');
            return;
        }

        const formattedList = studentList.map((s) => ({
            amsT_Id: s.amsT_Id,
            selected: entryType === 'monthly' ? Number(s.pdays) > 0 : selectedStudentIds.includes(s.amsT_Id),
            pdays: entryType === 'monthly' ? Number(s.pdays || 0) : selectedStudentIds.includes(s.amsT_Id) ? 1.0 : 0.0,
            asamdM_Id: s.asamdM_Id || 0,
            asasmdM_Id: s.asasmdM_Id || 0
        }));

        const payload = {
            asmay_Id: Number(academicYearId),
            asmcl_Id: Number(classId),
            asmS_Id: Number(sectionId),
            asamdm_Entry_DateTime: doe,
            asamdm_Network_IP: '127.0.0.1', // Placeholder as per required structure
            stdList: formattedList,
            // Keeping auxiliary fields if they are useful, but prioritizing requested ones
            TTMP_Id: Number(periodId) || 0,
            ismS_Id: Number(subjectId) || 0,
            asasB_Id: Number(batchId) || 0
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            if (res?.success || res?.returnval) {
                toast.success(res.message || 'Attendance saved successfully.');
                handleClear();
            } else if (res?.message) {
                toast.error(res.message);
            } else {
                toast.error('Failed to save attendance record');
            }
        } catch (error) {
            toast.error('Error during save operation');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Do You Want To Delete The Selected Attendace Details ?')) return;

        let fromD = doe;
        let toD = doe;
        let classHeld = '1.00';

        if (entryType === 'monthly') {
            fromD = fromDate;
            toD = toDate;
            classHeld = totalClassHeld.toString();
        }

        const payload = {
            ASMAY_Id: Number(academicYearId),
            ASMCL_Id: Number(classId),
            ASMS_Id: Number(sectionId),
            ismS_Id: Number(subjectId) || 0,
            TTMP_Id: Number(periodId) || 0,
            ASA_Entry_DateTime: new Date().toISOString().split('T')[0],
            ASA_FromDate: fromD,
            ASA_ToDate: toD,
            ASA_ClassHeld: classHeld,
            ASA_Regular_Extra: attendanceType,
            asasB_Id: Number(batchId) || 0,
            stdList: studentList
        };

        try {
            const res = await deleteMutation.mutateAsync(payload);
            if (res?.returnval) {
                toast.success('Record Deleted Successfully');
                handleClear();
            } else {
                toast.error('Failed to delete record');
            }
        } catch (error) {
            toast.error('Error during deletion');
        }
    };

    const handleClear = () => {
        window.location.reload();
    };

    const openHistory = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please select academic year, class, and section');
            return;
        }
        try {
            const res = await viewHistoryMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                att_entry_type: entryType
            });

            // Handle different response structures
            const historyList = res?.viewStudentPeriodWiseAttDetails || (Array.isArray(res) ? res : []);

            if (historyList.length > 0) {
                setHistoryData(historyList);
                setIsHistoryOpen(true);
            } else {
                toast.info('No attendance records found for the selection');
            }
        } catch (error) {
            toast.error('Failed to load history');
        }
    };

    const deleteHistoryRecord = async (userDelete: any) => {
        if (!window.confirm('Do you want to delete this record?')) return;
        try {
            const res = await deleteRecordWiseMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                ASA_Id: userDelete.ASA_Id,
                att_entry_type: entryType
            });
            if (res?.returnval) {
                toast.success('Deleted successfully');
                // Refresh list
                setHistoryData((prev) => prev.filter((h) => h.ASA_Id !== userDelete.ASA_Id));
            } else {
                toast.error('Deletion failed');
            }
        } catch (error) {
            toast.error('Error during record deletion');
        }
    };

    return (
        <div className='fade-in mx-auto max-w-[1600px] animate-in space-y-8 p-6 duration-500'>
            {/* --- Filter Card --- */}
            <Card className='overflow-hidden rounded-3xl border-none bg-gradient-to-br from-white to-slate-50 shadow-xl'>
                <CardHeader className='border-white/10 border-b bg-slate-900 px-8 py-6'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-xl bg-indigo-500/20 p-2'>
                                <CalendarIcon className='h-6 w-6 text-indigo-400' />
                            </div>
                            <div>
                                <CardTitle className='font-black text-2xl text-white tracking-tight'>Mess Attendance Entry</CardTitle>
                                <p className='font-medium text-indigo-200/60 text-sm'>
                                    Record student attendance daily, monthly, or by period
                                </p>
                            </div>
                        </div>
                        <Badge variant='outline' className='rounded-full border-white/10 bg-white/5 px-4 py-1.5 font-bold text-indigo-300'>
                            Attendance Module
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className='space-y-6 p-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label className='flex items-center gap-1.5 font-bold text-slate-700 text-sm'>
                                Academic Year <span className='text-rose-500'>*</span>
                            </Label>
                            <Select value={academicYearId} onValueChange={handleYearChange}>
                                <SelectTrigger className='h-12 w-full rounded-xl border-2 border-slate-200 bg-white font-semibold text-base transition-all focus:ring-indigo-500'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent className='rounded-xl border-slate-200 shadow-2xl'>
                                    {years.map((y: any) => (
                                        <SelectItem
                                            key={y.asmaY_Id}
                                            value={y.asmaY_Id.toString()}
                                            className='cursor-pointer py-3 font-medium'>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='flex items-center gap-1.5 font-bold text-slate-700 text-sm'>
                                Class <span className='text-rose-500'>*</span>
                            </Label>
                            <Select value={classId} onValueChange={handleClassChange} disabled={!academicYearId}>
                                <SelectTrigger className='h-12 w-full rounded-xl border-2 border-slate-200 bg-white font-semibold text-base transition-all focus:ring-indigo-500'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent className='rounded-xl border-slate-200 shadow-2xl'>
                                    {classes.map((c: any) => (
                                        <SelectItem
                                            key={c.asmcL_Id}
                                            value={c.asmcL_Id.toString()}
                                            className='cursor-pointer py-3 font-medium'>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Entry Inputs Card --- */}
            {classId && (
                <Card className='slide-in-from-bottom-5 animate-in overflow-hidden rounded-3xl border-none bg-white shadow-xl duration-500'>
                    <CardHeader className='border-slate-100 border-b bg-slate-50/50 px-8 py-4'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='flex items-center gap-2 font-bold text-lg text-slate-800'>
                                <Badge className='bg-indigo-600'>
                                    {entryType.toUpperCase().replace('ONCE', ' ONCE').replace('TWICE', ' TWICE') || 'ATTENDANCE ENTRY'}
                                </Badge>
                            </CardTitle>
                            <Button variant='ghost' size='sm' onClick={openHistory} className='font-bold text-indigo-600 hover:bg-white'>
                                <Eye className='mr-2 h-4 w-4' /> View Attendance
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-8 p-8'>
                        {/* Entry Type Radio Group */}
                        <div className='flex justify-center'>
                            <RadioGroup
                                value={entryType}
                                onValueChange={(val) => {
                                    setEntryType(val);
                                    setStudentList([]);
                                    setSelectedStudentIds([]);
                                }}
                                className='flex flex-wrap items-center justify-center gap-8 rounded-[2rem] border-2 border-slate-100 bg-slate-50/80 p-6'>
                                {[
                                    { id: 'Dailyonce', label: 'Daily Once' },
                                    { id: 'Dailytwice', label: 'Daily Twice' },
                                    { id: 'monthly', label: 'Monthly' },
                                    { id: 'period', label: 'Period Wise' }
                                ].map((type) => (
                                    <div key={type.id} className='group flex cursor-pointer items-center space-x-2.5'>
                                        <RadioGroupItem
                                            value={type.id}
                                            id={type.id}
                                            className='h-5 w-5 border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500'
                                        />
                                        <Label
                                            htmlFor={type.id}
                                            className='cursor-pointer font-black text-slate-600 text-sm uppercase tracking-tight transition-colors group-hover:text-indigo-600'>
                                            {type.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
                            {/* Left Side: Parameters */}
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-slate-700 text-sm'>
                                        Section <span className='text-rose-500'>*</span>
                                    </Label>
                                    <Select value={sectionId} onValueChange={handleSectionChange}>
                                        <SelectTrigger className='h-12 rounded-2xl border-2 bg-white font-semibold'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classSections.map((s: any) => (
                                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {entryType === 'monthly' && (
                                    <div className='slide-in-from-left-4 animate-in space-y-4'>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-700 text-sm'>
                                                Month <span className='text-rose-500'>*</span>
                                            </Label>
                                            <Select value={monthId} onValueChange={handleMonthChange}>
                                                <SelectTrigger className='h-12 rounded-2xl border-2 bg-white font-semibold'>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sortedMonths.map((m: any) => (
                                                        <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>
                                                            {m.ivrM_Month_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-400 text-xs'>From Date</Label>
                                                <Input
                                                    type='date'
                                                    value={fromDate}
                                                    readOnly
                                                    className='rounded-xl border-none bg-slate-50'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-400 text-xs'>To Date</Label>
                                                <Input type='date' value={toDate} readOnly className='rounded-xl border-none bg-slate-50' />
                                            </div>
                                        </div>
                                        <div className='flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 p-4'>
                                            <span className='font-bold text-indigo-700'>Total Class Helds:</span>
                                            <Badge className='flex h-9 w-12 items-center justify-center border-indigo-200 bg-white text-indigo-600 text-lg'>
                                                {totalClassHeld}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {entryType === 'period' && (
                                    <div className='slide-in-from-left-4 animate-in space-y-6'>
                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-700 text-sm'>
                                                    Subject <span className='text-rose-500'>*</span>
                                                </Label>
                                                <Select value={subjectId} onValueChange={handleSubjectChange}>
                                                    <SelectTrigger className='h-12 rounded-2xl border-2 bg-white font-semibold'>
                                                        <SelectValue placeholder='Select Subject' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjects.map((s: any) => (
                                                            <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()}>
                                                                {s.ismS_SubjectName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-slate-700 text-sm'>
                                                    Batch {isBatchRequired && <span className='text-rose-500'>*</span>}
                                                </Label>
                                                <Select value={batchId} onValueChange={setBatchId}>
                                                    <SelectTrigger className='h-12 rounded-2xl border-2 bg-white font-semibold'>
                                                        <SelectValue placeholder='Select Batch' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {batches.map((b: any) => (
                                                            <SelectItem key={b.asasB_Id} value={b.asasB_Id.toString()}>
                                                                {b.asasB_BatchName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-bold text-slate-700 text-sm'>
                                                Period <span className='text-rose-500'>*</span>
                                            </Label>
                                            <Select value={periodId} onValueChange={handlePeriodChange}>
                                                <SelectTrigger className='h-12 rounded-2xl border-2 bg-white font-semibold'>
                                                    <SelectValue placeholder='Select Period' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {periods.map((p: any) => (
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

                            {/* Right Side: DOE & Status */}
                            <div className='space-y-8'>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-slate-700 text-sm'>
                                        Date of Entry (DOE) <span className='text-rose-500'>*</span>
                                    </Label>
                                    <div className='relative'>
                                        <Input
                                            type='date'
                                            value={doe}
                                            onChange={(e) => handleDOEChange(e.target.value)}
                                            className='h-12 rounded-2xl border-2 bg-white pl-12 font-semibold shadow-sm focus:ring-indigo-500'
                                        />
                                        <CalendarIcon className='absolute top-3.5 left-4 h-5 w-5 text-indigo-500' />
                                    </div>
                                </div>

                                {entryType === 'Dailytwice' && (
                                    <div className='space-y-5 rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6 shadow-sm'>
                                        <div className='flex items-center gap-2'>
                                            <div className='h-4 w-1 rounded-full bg-indigo-500' />
                                            <Label className='font-black text-slate-400 text-xs uppercase tracking-wider'>
                                                Session Configuration
                                            </Label>
                                        </div>
                                        <div className='flex gap-8'>
                                            <div className='group flex cursor-pointer items-center space-x-3'>
                                                <Checkbox
                                                    id='session1'
                                                    checked={session1}
                                                    onCheckedChange={(val: any) => setSession1(!!val)}
                                                    className='h-6 w-6 rounded-lg'
                                                />
                                                <Label
                                                    htmlFor='session1'
                                                    className='cursor-pointer font-black text-slate-600 text-sm transition-colors group-hover:text-indigo-600'>
                                                    1st Half
                                                </Label>
                                            </div>
                                            <div className='group flex cursor-pointer items-center space-x-3'>
                                                <Checkbox
                                                    id='session2'
                                                    checked={session2}
                                                    onCheckedChange={(val: any) => setSession2(!!val)}
                                                    className='h-6 w-6 rounded-lg'
                                                />
                                                <Label
                                                    htmlFor='session2'
                                                    className='cursor-pointer font-black text-slate-600 text-sm transition-colors group-hover:text-indigo-600'>
                                                    2nd Half
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {entryType === 'period' && (
                                    <div className='space-y-5 rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6 shadow-sm'>
                                        <div className='flex items-center gap-2'>
                                            <div className='h-4 w-1 rounded-full bg-indigo-500' />
                                            <Label className='font-black text-slate-400 text-xs uppercase tracking-wider'>
                                                Attendance Mode
                                            </Label>
                                        </div>
                                        <RadioGroup
                                            value={attendanceType}
                                            onValueChange={(val: any) => setAttendanceType(val)}
                                            className='flex flex-row gap-6'>
                                            <div className='flex cursor-not-allowed items-center space-x-3 rounded-xl p-1 transition-all'>
                                                <RadioGroupItem value='Regular' id='regular' className='h-5 w-5 text-indigo-600' />
                                                <Label htmlFor='regular' className='cursor-pointer font-bold text-slate-800 text-sm'>
                                                    Regular
                                                </Label>
                                            </div>
                                            <div className='flex cursor-pointer items-center space-x-3 rounded-xl p-1 transition-all'>
                                                <RadioGroupItem value='Extra Period' id='extra' className='h-5 w-5 text-indigo-600' />
                                                <Label htmlFor='extra' className='cursor-pointer font-bold text-slate-800 text-sm'>
                                                    Extra Period
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- Student Grid Card --- */}
            {studentList.length > 0 && (
                <Card className='fade-in animate-in overflow-hidden rounded-none border border-slate-200 bg-white shadow-none duration-700'>
                    <CardHeader className='rounded-none border-slate-300 border-b bg-[#3a5998] px-6 py-3'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='font-bold text-sm text-white uppercase tracking-tight'>STUDENT DETAILS</CardTitle>
                            <div className='flex items-center gap-3 rounded-sm bg-white p-1 shadow-inner'>
                                <Search className='ml-2 h-4 w-4 text-slate-400' />
                                <Input
                                    placeholder='search here...'
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className='h-8 w-[400px] border-none text-xs italic shadow-none focus-visible:ring-0'
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <div className='overflow-x-auto'>
                            <Table className='border-collapse'>
                                <TableHeader className='bg-[#006699]'>
                                    <TableRow className='border-none hover:bg-[#006699]'>
                                        <TableHead className='w-20 whitespace-nowrap border-white/20 border-r px-2 text-center font-bold text-[11px] text-white uppercase'>
                                            SL. NO.
                                        </TableHead>
                                        <TableHead className='border-white/20 border-r px-8 text-center font-bold text-[11px] text-white uppercase'>
                                            Student Name
                                        </TableHead>
                                        {showAdmNo && (
                                            <TableHead
                                                className='cursor-pointer whitespace-nowrap border-white/20 border-r px-6 text-center font-bold text-[11px] text-white uppercase hover:bg-white/10'
                                                onClick={() => {
                                                    setSortKey('amsT_AdmNo');
                                                    setSortReverse(!sortReverse);
                                                }}>
                                                Admission No. {sortKey === 'amsT_AdmNo' && (sortReverse ? '↓' : '↑')}
                                            </TableHead>
                                        )}
                                        {showRollNo && (
                                            <TableHead
                                                className='cursor-pointer whitespace-nowrap border-white/20 border-r px-6 text-center font-bold text-[11px] text-white uppercase hover:bg-white/10'
                                                onClick={() => {
                                                    setSortKey('amaY_RollNo');
                                                    setSortReverse(!sortReverse);
                                                }}>
                                                Roll No. {sortKey === 'amaY_RollNo' && (sortReverse ? '↓' : '↑')}
                                            </TableHead>
                                        )}
                                        {showRegNo && (
                                            <TableHead
                                                className='cursor-pointer whitespace-nowrap border-white/20 border-r px-6 text-center font-bold text-[11px] text-white uppercase hover:bg-white/10'
                                                onClick={() => {
                                                    setSortKey('amsT_RegistrationNo');
                                                    setSortReverse(!sortReverse);
                                                }}>
                                                Reg No. {sortKey === 'amsT_RegistrationNo' && (sortReverse ? '↓' : '↑')}
                                            </TableHead>
                                        )}
                                        <TableHead className='px-4 text-center font-bold text-[11px] text-white uppercase'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <Checkbox
                                                    checked={
                                                        selectedStudentIds.length === processedStudents.length &&
                                                        processedStudents.length > 0
                                                    }
                                                    onCheckedChange={handleSelectAll}
                                                    className='h-4 w-4 border-white data-[state=checked]:bg-white data-[state=checked]:text-[#006699]'
                                                />
                                                <span>{entryType === 'Dailyonce' ? 'Daily' : 'Attendance'}</span>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {processedStudents.map((s, index) => {
                                        const isSelected = selectedStudentIds.includes(s.amsT_Id);
                                        return (
                                            <TableRow
                                                key={s.amsT_Id}
                                                className={`h-12 border-slate-200 border-b transition-colors ${isSelected ? 'bg-[#d9edf7]' : 'hover:bg-slate-50'}`}>
                                                <TableCell className='border-slate-200 border-r px-2 text-center font-bold text-slate-700 text-xs'>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className='border-slate-200 border-r px-8 font-bold text-[11px] text-slate-800 uppercase'>
                                                    {s.studentname}
                                                </TableCell>
                                                {showAdmNo && (
                                                    <TableCell className='border-slate-200 border-r px-6 text-center font-bold text-[11px] text-slate-600'>
                                                        {s.amsT_AdmNo}
                                                    </TableCell>
                                                )}
                                                {showRollNo && (
                                                    <TableCell className='border-slate-200 border-r px-6 text-center font-bold text-[11px] text-slate-600'>
                                                        {s.amaY_RollNo}
                                                    </TableCell>
                                                )}
                                                {showRegNo && (
                                                    <TableCell className='border-slate-200 border-r px-6 text-center font-bold text-[11px] text-slate-600'>
                                                        {s.amsT_RegistrationNo}
                                                    </TableCell>
                                                )}
                                                <TableCell className='px-4 text-center'>
                                                    {entryType === 'monthly' ? (
                                                        <Input
                                                            type='number'
                                                            value={s.pdays || 0}
                                                            max={totalClassHeld}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                setStudentList((prev) =>
                                                                    prev.map((p) => (p.amsT_Id === s.amsT_Id ? { ...p, pdays: val } : p))
                                                                );
                                                            }}
                                                            className='mx-auto h-8 w-20 border-slate-300 text-center font-bold'
                                                        />
                                                    ) : (
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleStudentSelect(s.amsT_Id, !!checked)}
                                                            className='h-4 w-4 border-slate-400'
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Centered Footer Buttons */}
                        <div className='mt-6 flex flex-wrap items-center justify-center gap-4 border-slate-200 border-t bg-slate-50 py-8'>
                            <Button
                                onClick={handleSave}
                                disabled={saveMutation.isPending || saveDis}
                                className='flex h-10 items-center gap-2 rounded-sm bg-[#3a5998] px-8 font-bold text-white text-xs uppercase shadow-md transition-transform hover:bg-[#2d4373] active:scale-95'>
                                {saveMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                                {updateCount > 0 ? 'UPDATE' : 'SAVE'}
                            </Button>

                            {updateCount > 0 && (
                                <Button
                                    onClick={handleDelete}
                                    className='flex h-10 items-center gap-2 rounded-sm bg-[#444444] px-8 font-bold text-white text-xs uppercase shadow-md transition-transform hover:bg-slate-800 active:scale-95'>
                                    <Trash2 className='h-4 w-4' /> DELETE
                                </Button>
                            )}

                            <Button
                                onClick={handleClear}
                                className='flex h-10 items-center gap-2 rounded-sm bg-[#ff6f00] px-8 font-bold text-white text-xs uppercase shadow-md transition-transform hover:bg-[#e65100] active:scale-95'>
                                <X className='h-4 w-4' /> CANCEL
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- History Modal --- */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className='max-w-7xl overflow-hidden rounded-none border-none bg-white p-0 shadow-2xl'>
                    <DialogHeader className='flex flex-row items-center justify-between bg-[#3a5998] px-8 py-4 text-white'>
                        <DialogTitle className='font-bold text-lg uppercase tracking-tight'>ATTENDANCE DETAILS</DialogTitle>
                        <div className='flex items-center gap-4'>
                            <div className='relative'>
                                <Search className='absolute top-2.5 right-3 h-4 w-4 text-slate-400' />
                                <Input
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    placeholder='search here...'
                                    className='h-9 w-64 rounded-none border-none bg-white pr-10 text-slate-900 text-xs italic shadow-inner'
                                />
                            </div>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => setIsHistoryOpen(false)}
                                className='h-8 w-8 text-white hover:bg-white/20'>
                                <X className='h-5 w-5' />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className='custom-scrollbar max-h-[70vh] overflow-auto border-slate-200 border-x'>
                        <Table className='border-collapse'>
                            <TableHeader>
                                <TableRow className='border-slate-200 border-b bg-[#006699] hover:bg-[#006699]'>
                                    <TableHead className='w-16 whitespace-nowrap border-white/20 border-r text-center font-bold text-[11px] text-white uppercase'>
                                        Sl.No
                                    </TableHead>
                                    <TableHead className='border-white/20 border-r px-4 text-center font-bold text-[11px] text-white uppercase'>
                                        Attendance Details
                                    </TableHead>
                                    <TableHead className='whitespace-nowrap border-white/20 border-r px-6 text-center font-bold text-[11px] text-white uppercase'>
                                        Attendance Date
                                    </TableHead>
                                    <TableHead className='whitespace-nowrap border-white/20 border-r px-6 text-center font-bold text-[11px] text-white uppercase'>
                                        Entry Date
                                    </TableHead>
                                    <TableHead className='border-white/20 border-r text-center font-bold text-[11px] text-white uppercase'>
                                        Entry By
                                    </TableHead>
                                    <TableHead className='text-center font-bold text-[11px] text-white uppercase'>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData
                                    .filter(
                                        (h) =>
                                            h.ASMAY_Year?.toLowerCase().includes(historySearch.toLowerCase()) ||
                                            h.EMPLOYEENAME?.toLowerCase().includes(historySearch.toLowerCase()) ||
                                            h.ASMCL_ClassName?.toLowerCase().includes(historySearch.toLowerCase())
                                    )
                                    .map((h, i) => (
                                        <TableRow key={i} className='h-16 border-slate-200 border-b hover:bg-slate-50'>
                                            <TableCell className='border-slate-200 border-r text-center font-bold text-slate-700 text-xs'>
                                                {i + 1}
                                            </TableCell>
                                            <TableCell className='border-slate-200 border-r px-6'>
                                                <div className='flex flex-col gap-0.5'>
                                                    <span className='font-black text-[13px] text-slate-800 leading-tight'>
                                                        Academic Year : {h.ASMAY_Year}
                                                    </span>
                                                    <span className='font-black text-[13px] text-slate-800 leading-tight'>
                                                        Class : {h.ASMCL_ClassName}
                                                    </span>
                                                    <span className='font-black text-[13px] text-slate-800 leading-tight'>
                                                        Section : {h.ASMC_SectionName}
                                                    </span>
                                                    {h.ISMS_SUBJECTNAME && (
                                                        <span className='font-black text-[13px] text-indigo-600 italic leading-tight'>
                                                            Subject : {h.ISMS_SUBJECTNAME}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className='whitespace-nowrap border-slate-200 border-r px-6 text-center font-bold text-[12px] text-slate-700'>
                                                {h.ASA_FROMDATE}
                                            </TableCell>
                                            <TableCell className='whitespace-nowrap border-slate-200 border-r px-6 text-center font-bold text-[12px] text-slate-700'>
                                                {h.ASA_Entry_DateTime?.split(' ')[0]}
                                            </TableCell>
                                            <TableCell className='border-slate-200 border-r px-6 text-center font-bold text-[12px] text-slate-700'>
                                                {h.EMPLOYEENAME}
                                            </TableCell>
                                            <TableCell className='px-4 text-center'>
                                                {h.DELETE_FLAG === 1 || h.delete_flag === 1 ? (
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => deleteHistoryRecord(h)}
                                                        className='rounded-lg text-rose-600 transition-all hover:bg-rose-50'>
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                ) : (
                                                    <Badge
                                                        variant='secondary'
                                                        className='bg-slate-100 font-black text-[9px] text-slate-400 uppercase tracking-tighter'>
                                                        Locked
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {historyData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className='h-40 text-center font-bold text-slate-400'>
                                            No records found for the selected criteria
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter className='flex justify-end gap-3 bg-slate-50 p-6'>
                        <Button
                            variant='outline'
                            onClick={() => setIsHistoryOpen(false)}
                            className='rounded-xl px-8 font-black text-slate-500'>
                            CLOSE
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
