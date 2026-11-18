'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDeleteAttendanceRecordWise,
    useGetBatchList,
    useGetDateWiseAttendance,
    useGetMonthClassHeld,
    useGetStdListPeriod,
    useGetStudentData,
    useSaveAttendance,
    useStudentAttendanceInitialData,
    useViewAttendance
} from '@/hooks/admission/preadmission/transactions/useStudentAttendanceEntry';
import {
    useMasterClassDropdown,
    useMasterMonthDropDownList,
    useMasterSectionDropdown
} from '@/hooks/admission/preadmission/useMasters';
import type {
    StudentAttendanceDetail,
    StudentAttendanceStudent
} from '@/server/admission/preadmission/attendance-entry/student_attendance';
import { Eye, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AttendanceDetailsModal } from './_components/AttendanceDetailsModal';
import { getStudentAttendanceColumns } from './_components/columns';

export default function StudentAttendancePage() {
    // Initial Data
    const { data: initialDataRes } = useStudentAttendanceInitialData();
    const initialData = initialDataRes?.data;
    const { data: monthRes } = useMasterMonthDropDownList();
    const monthList: any[] = Array.isArray(monthRes?.data) ? monthRes?.data : (monthRes?.data as any)?.monthList || [];
    const { data: masterClassRes } = useMasterClassDropdown();
    const { data: masterSectionRes } = useMasterSectionDropdown();

    const masterClassList: any[] = useMemo(() => {
        if (!masterClassRes) return [];
        if (Array.isArray(masterClassRes)) return masterClassRes;
        if (Array.isArray((masterClassRes as any).data)) return (masterClassRes as any).data;
        return [];
    }, [masterClassRes]);

    const masterSectionList: any[] = useMemo(() => {
        if (!masterSectionRes) return [];
        if (Array.isArray(masterSectionRes)) return masterSectionRes;
        if (Array.isArray((masterSectionRes as any).data)) return (masterSectionRes as any).data;
        return [];
    }, [masterSectionRes]);

    // Form States
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [dynamicSectionList, setDynamicSectionList] = useState<any[]>([]);
    const [attendanceType, setAttendanceType] = useState<string>('Dailyonce');
    const [doe, setDoe] = useState<string>(new Date().toISOString().slice(0, 10));

    const classList = useMemo(() => {
        const list = initialData?.classList;
        if (Array.isArray(list) && list.length > 0) {
            return list;
        }
        return masterClassList;
    }, [initialData?.classList, masterClassList]);

    const sectionList = useMemo(() => {
        if (dynamicSectionList.length > 0) {
            return dynamicSectionList;
        }
        const initialSections = initialData?.sectionList;
        if (Array.isArray(initialSections) && initialSections.length > 0) {
            return initialSections;
        }
        return masterSectionList;
    }, [dynamicSectionList, initialData?.sectionList, masterSectionList]);

    // Monthly States
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [totalClassHeld, setTotalClassHeld] = useState<number>(0);

    // Period Wise States
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [regularExtra, setRegularExtra] = useState<string>('Regular');

    // Dynamic List States for Period/Batch
    const [batchList, setBatchList] = useState<any[]>([]);
    const [periodList, setPeriodList] = useState<any[]>([]);

    const [searched, setSearched] = useState(false);
    const [students, setStudents] = useState<StudentAttendanceStudent[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentAttendanceStudent[]>([]);
    const [noDataMessage, setNoDataMessage] = useState<string>('');
    const [attendanceEntryMsg, setAttendanceEntryMsg] = useState<string>('');

    // Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<StudentAttendanceDetail[]>([]);

    // API Hooks
    const getStudentData = useGetStudentData();
    const getMonthClassHeld = useGetMonthClassHeld();
    const getDateWiseAttendance = useGetDateWiseAttendance();
    const getBatchListApi = useGetBatchList();
    const getStdListPeriod = useGetStdListPeriod();
    const saveMutation = useSaveAttendance();
    const viewMutation = useViewAttendance();
    const deleteMutation = useDeleteAttendanceRecordWise();

    // Default Academic Year Selection
    useEffect(() => {
        if (initialData?.currentYear?.length > 0 && !selectedYear) {
            setSelectedYear(initialData.currentYear[0].asmaY_Id.toString());
        }
    }, [initialData, selectedYear]);

    // Handle Class Selection -> Fetch Student Data (Determines Attendance Type)
    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setDynamicSectionList([]);
        setSearched(false);
        setStudents([]);

        if (!selectedYear || !classId) return;

        getStudentData.mutate(
            {
                asmaY_Id: Number(selectedYear),
                asmcL_Id: Number(classId),
                asmS_Id: 0,
                asa_FromDate: doe,
                monthflag: '',
                monthflag1: '',
                classsecflag: '1',
                checksubject: '0',
                monthid: 0,
                ismS_Id: 0,
                ttmP_Id: 0
            },
            {
                onSuccess: (res) => {
                    const data = res?.data?.data || res?.data || res;
                    if (data) {
                        const type = data.asA_Att_EntryType || data.ASA_Att_EntryType;
                        if (type === 'D') setAttendanceType('Dailyonce');
                        else if (type === 'H') setAttendanceType('Dailytwice');
                        else if (type === 'M') setAttendanceType('monthly');
                        else if (type === 'P') setAttendanceType('period');

                        const sList = data.sectionList || data.section || [];
                        if (Array.isArray(sList) && sList.length > 0) {
                            setDynamicSectionList(sList);
                        }
                    } else if (res?.message) {
                        toast.error(res.message);
                    }
                }
            }
        );
    };

    // Generic Student Fetch Handler (Search)
    const handleSearch = () => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            toast.error('Please select Academic Year, Class, and Section');
            return;
        }

        let entryFlag = 'D';
        if (attendanceType === 'Dailytwice') entryFlag = 'H';
        else if (attendanceType === 'monthly') entryFlag = 'M';
        else if (attendanceType === 'period') entryFlag = 'P';

        if (attendanceType === 'period') {
            if (!selectedSubject || !selectedPeriod) {
                toast.error('Please select Subject and Period');
                return;
            }
            // Period Wise Search
            getStdListPeriod.mutate(
                {
                    asmay_Id: Number(selectedYear),
                    asmcl_Id: Number(selectedClass),
                    asmS_Id: Number(selectedSection),
                    ismS_Id: Number(selectedSubject),
                    ttmP_Id: Number(selectedPeriod),
                    monthflag: entryFlag,
                    monthflag1: attendanceType,
                    att_entry_type: attendanceType,
                    asasB_Id: Number(selectedBatch) || 0
                },
                {
                    onSuccess: handleStudentResponse
                }
            );
            return;
        }

        // Default Search for Daily/Monthly
        getStudentData.mutate(
            {
                asmaY_Id: Number(selectedYear),
                asmcL_Id: Number(selectedClass),
                asmS_Id: Number(selectedSection),
                asa_FromDate: doe,
                monthflag: entryFlag,
                monthflag1: attendanceType,
                classsecflag: '0',
                checksubject: '1',
                monthid: Number(selectedMonth) || 0,
                ismS_Id: 0,
                ttmP_Id: 0
            },
            {
                onSuccess: handleStudentResponse
            }
        );
    };

    const handleStudentResponse = (res: any) => {
        if (res?.data?.studentList?.length > 0) {
            let processedStudents = res.data.studentList;

            // Format data based on response
            const type = attendanceType?.toLowerCase() || '';
            if (type === 'dailytwice') {
                processedStudents = processedStudents.map((s: any) => {
                    let first = false,
                        second = false;
                    if (s.pdays === 0.5) {
                        first = s.asA_Dailytwice_Flag === 'firsthalf';
                        second = s.asA_Dailytwice_Flag === 'Secondhalf';
                    } else if (s.pdays === 1) {
                        first = true;
                        second = true;
                    }
                    if (res.data.attendanceentryflag === 'A') {
                        // Absent mapping
                        if (s.pdays === 0) {
                            first = true;
                            second = true;
                        } else if (s.pdays === 0.5) {
                            if (s.asA_Dailytwice_Flag === 'firsthalf') {
                                first = false;
                                second = true;
                            } else {
                                first = true;
                                second = false;
                            }
                        } else {
                            first = false;
                            second = false;
                        }
                    }
                    return { ...s, firstHalfflag: first, secondHalfflag: second };
                });
            } else if (type === 'dailyonce' || type === 'period') {
                processedStudents = processedStudents.map((s: any) => ({
                    ...s,
                    selected: res.data.attendanceentryflag === 'A' ? s.pdays === 0 : s.pdays > 0
                }));
            }

            setStudents(processedStudents);
            setFilteredStudents(processedStudents);
            setSearched(true);

            const flagMsg = res.data.attendanceentryflag === 'A' ? 'Attendance Entry Type Is Absent' : 'Attendance Entry Type Is Present';
            setAttendanceEntryMsg(flagMsg);
            setNoDataMessage('');
        } else {
            toast.error('No Records Found');
            setStudents([]);
            setFilteredStudents([]);
            setSearched(false);
        }
    };

    const handleMonthChange = (monthId: string) => {
        setSelectedMonth(monthId);
        if (!selectedYear || !selectedClass || !selectedSection || !monthId) return;

        getMonthClassHeld.mutate(
            {
                asmay_Id: Number(selectedYear),
                asmcl_Id: Number(selectedClass),
                asmS_Id: Number(selectedSection),
                monthid: Number(monthId),
                monthflag: 'M',
                monthflag1: 'monthly',
                asamdM_Entry_DateTime: doe
            },
            {
                onSuccess: (res) => {
                    if (res?.data) {
                        setTotalClassHeld(res.data.countclass || 0);
                        if (res.data.startdate) setFromDate(res.data.startdate.split('T')[0]);
                        if (res.data.enddate) setToDate(res.data.enddate.split('T')[0]);

                        if (res.data.studentList?.length > 0) {
                            setStudents(res.data.studentList);
                            setFilteredStudents(res.data.studentList);
                            setSearched(true);
                        } else {
                            toast.error('No Students Found for this month');
                            setSearched(false);
                        }
                    } else {
                        toast.error('Please Enter Number Of Class Held In Class Held Master For This Class.');
                        setSearched(false);
                    }
                }
            }
        );
    };

    const handleSubjectChange = (subjectId: string) => {
        setSelectedSubject(subjectId);
        setSelectedBatch('');
        if (!selectedYear || !selectedClass || !selectedSection || !subjectId) return;

        getBatchListApi.mutate(
            {
                ASMAY_Id: Number(selectedYear),
                ASMCL_Id: Number(selectedClass),
                ASMS_Id: Number(selectedSection),
                ismS_Id: Number(subjectId)
            },
            {
                onSuccess: (res) => {
                    setBatchList(res?.data?.batchList || []);
                }
            }
        );

        getStdListPeriod.mutate(
            {
                asmaY_Id: Number(selectedYear),
                asmcL_Id: Number(selectedClass),
                asmS_Id: Number(selectedSection),
                asa_FromDate: doe,
                ismS_Id: Number(subjectId)
            },
            {
                onSuccess: (res) => {
                    setPeriodList(res?.data?.periodlist || res?.data?.periodList || []);
                }
            }
        );
    };

    const handleTextSearch = (query: string) => {
        if (!query) {
            setFilteredStudents(students);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = students.filter(
            (student) =>
                student.studentname.toLowerCase().includes(lowerQuery) ||
                student.amsT_AdmNo.toLowerCase().includes(lowerQuery) ||
                student.amaY_RollNo?.toString().includes(lowerQuery)
        );
        setFilteredStudents(filtered);
    };

    const updateStudentState = (amsT_Id: number, field: string, value: any) => {
        setStudents((prev) => {
            const newStudents = prev.map((s) => (s.amsT_Id === amsT_Id ? { ...s, [field]: value } : s));
            // Sync with filtered list if search is active
            setFilteredStudents(newStudents);
            return newStudents;
        });
    };

    // Prepare custom columns
    const columns = getStudentAttendanceColumns(attendanceType, updateStudentState);

    const handleViewPeriodWise = () => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            toast.error('Please select Year, Class, and Section');
            return;
        }

        setViewModalOpen(true);
        viewMutation.mutate(
            {
                ASMAY_Id: Number(selectedYear),
                ASMCL_Id: Number(selectedClass),
                ASMS_Id: Number(selectedSection),
                att_entry_type: attendanceType
            },
            {
                onSuccess: (res) => {
                    setViewData(res?.data?.viewStudentPeriodWiseAttDetails || []);
                    if (!res?.data?.viewStudentPeriodWiseAttDetails?.length) {
                        toast.info('No attendance records found');
                    }
                }
            }
        );
    };

    const handleDeleteRecord = (id: number) => {
        deleteMutation.mutate(
            { ASA_Id: id },
            {
                onSuccess: (res) => {
                    if (res?.data?.returnval) {
                        toast.success('Record deleted successfully');
                        setViewData((prev) => prev.filter((item) => item.asA_Id !== id));
                        handleSearch(); // Refresh list
                    } else {
                        toast.error('Failed to delete record');
                    }
                }
            }
        );
    };

    const handleSave = () => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            toast.error('Please ensure all required fields are selected.');
            return;
        }

        let asA_ClassHeld = 1;
        let asasB_Id = 0;
        let fDate = new Date(doe).toDateString();
        let tDate = new Date(doe).toDateString();

        if (attendanceType === 'monthly') {
            asA_ClassHeld = totalClassHeld;
            fDate = new Date(fromDate).toDateString();
            tDate = new Date(toDate).toDateString();

            // Validate pdays against class held
            for (const s of students) {
                if (s.pdays !== null && s.pdays !== undefined && s.pdays > totalClassHeld) {
                    toast.error(`Present Days for ${s.studentname} is more than Class Held`);
                    return;
                }
            }
        } else if (attendanceType === 'period') {
            asasB_Id = Number(selectedBatch) || 0;
        }

        const payload = {
            username: '',
            ASMAY_Id: Number(selectedYear),
            ASMCL_Id: Number(selectedClass),
            ASMS_Id: Number(selectedSection),
            ASA_Att_Type: attendanceType,
            ASA_Entry_DateTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
            ASA_FromDate: fDate,
            ASA_ToDate: tDate,
            ASA_ClassHeld: asA_ClassHeld,
            ASA_Regular_Extra: regularExtra,
            TTMP_Id: Number(selectedPeriod) || 0,
            ismS_Id: Number(selectedSubject) || 0,
            asasB_Id: asasB_Id,
            ASA_Id: students[0]?.asA_Id || 0,
            stdList: students
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res?.data?.returnval) {
                    toast.success('Record Saved Successfully!');
                    handleSearch();
                } else {
                    toast.error(res?.data?.message || 'Failed to save attendance');
                }
            }
        });
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection title='ATTENDANCE ENTRY' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='grid grid-cols-1 gap-6 p-4'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                {/* Academic Year */}
                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                    <Label className='text-left font-medium text-sm md:text-right'>
                                        Academic Year: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        value={selectedYear}
                                        onValueChange={(val) => {
                                            setSelectedYear(val);
                                            setSelectedClass('');
                                            setSelectedSection('');
                                            setDynamicSectionList([]);
                                            setSearched(false);
                                            setStudents([]);
                                        }}>
                                        <SelectTrigger className='border-blue-400'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {initialData?.academicYearList?.map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Class */}
                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                    <Label className='text-left font-medium text-sm md:text-right'>
                                        Class: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger className='border-purple-600'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classList.map((cls: any) => {
                                                const id = cls.asmcL_Id ?? cls.ASMCL_Id;
                                                const name = cls.asmcL_ClassName ?? cls.ASMCL_ClassName;
                                                if (id == null) return null;
                                                return (
                                                    <SelectItem key={String(id)} value={String(id)}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Phase 2: Show only if Class is selected */}
                            {!!selectedClass && (
                                <div className='rounded-md border border-gray-200 bg-white p-4 shadow-sm'>
                                    <div className='mb-4 flex items-center justify-between border-b pb-2'>
                                        <h3 className='font-bold text-blue-900 text-lg uppercase'>
                                            {attendanceType
                                                .replace('once', ' Once')
                                                .replace('twice', ' Twice')
                                                .replace('period', 'Period Wise')}
                                        </h3>
                                        <Button size='sm' onClick={handleViewPeriodWise}>
                                            <Eye className='mr-2 h-4 w-4' /> View Attendance Details
                                        </Button>
                                    </div>

                                    {/* Attendance Type Radios (Disabled, controlled by API) */}
                                    <div className='flex justify-center pb-6'>
                                        <RadioGroup
                                            value={attendanceType}
                                            onValueChange={(value) => {
                                                setAttendanceType(value);
                                                setSearched(false);
                                            }}
                                            className='flex gap-6'
                                            disabled>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Dailyonce' id='r1' />
                                                <Label htmlFor='r1'>Daily Once</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Dailytwice' id='r2' />
                                                <Label htmlFor='r2'>Daily Twice</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='monthly' id='r3' />
                                                <Label htmlFor='r3'>Monthly</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='period' id='r4' />
                                                <Label htmlFor='r4'>Period Wise</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                        {/* Section */}
                                        <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                            <Label className='text-left font-medium text-sm md:text-right'>
                                                Section: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={selectedSection}
                                                onValueChange={(v) => {
                                                    setSelectedSection(v);
                                                    setSearched(false);
                                                }}>
                                                <SelectTrigger className='border-blue-400'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectionList.map((sec: any) => {
                                                        const id = sec.asmS_Id ?? sec.ASMS_Id;
                                                        const name = sec.asmC_SectionName ?? sec.ASMC_SectionName;
                                                        if (id == null) return null;
                                                        return (
                                                            <SelectItem key={String(id)} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Specific Fields per Mode */}
                                        {attendanceType === 'monthly' && (
                                            <>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>
                                                        Month: <span className='text-red-500'>*</span>
                                                    </Label>
                                                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Month' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {monthList.map((m: any) => (
                                                                <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>
                                                                    {m.ivrM_Month_Name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>Attendance Date:</Label>
                                                    <Input type='date' value={fromDate} disabled />
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>Total Class Held:</Label>
                                                    <div className='font-bold'>{totalClassHeld}</div>
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>To Date:</Label>
                                                    <Input type='date' value={toDate} disabled />
                                                </div>
                                            </>
                                        )}

                                        {attendanceType === 'period' && (
                                            <>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>
                                                        DOE: <span className='text-red-500'>*</span>
                                                    </Label>
                                                    <Input type='date' value={doe} onChange={(e) => setDoe(e.target.value)} />
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>
                                                        Subject: <span className='text-red-500'>*</span>
                                                    </Label>
                                                    <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Subject' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {initialData?.subjectList?.map((sbj: any) => (
                                                                <SelectItem key={sbj.ismS_Id} value={sbj.ismS_Id.toString()}>
                                                                    {sbj.ismS_SubjectName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>Batch:</Label>
                                                    <Select
                                                        value={selectedBatch}
                                                        onValueChange={setSelectedBatch}
                                                        disabled={batchList.length === 0}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Batch' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {batchList.map((b: any) => (
                                                                <SelectItem key={b.asasB_Id} value={b.asasB_Id.toString()}>
                                                                    {b.asasB_BatchName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'>
                                                        Period: <span className='text-red-500'>*</span>
                                                    </Label>
                                                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Period' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(periodList.length > 0
                                                                ? periodList
                                                                : Array.from({ length: 8 }, (_, i) => ({
                                                                      ttmP_Id: i + 1,
                                                                      ttmP_PeriodName: (i + 1).toString()
                                                                  }))
                                                            ).map((p: any) => (
                                                                <SelectItem key={p.ttmP_Id} value={p.ttmP_Id.toString()}>
                                                                    {p.ttmP_PeriodName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                    <Label className='text-left font-medium text-sm md:text-right'></Label>
                                                    <RadioGroup value={regularExtra} onValueChange={setRegularExtra} className='flex gap-4'>
                                                        <div className='flex items-center space-x-2'>
                                                            <RadioGroupItem value='Regular' id='reg' />
                                                            <Label htmlFor='reg'>Regular</Label>
                                                        </div>
                                                        <div className='flex items-center space-x-2'>
                                                            <RadioGroupItem value='Extra Period' id='ext' />
                                                            <Label htmlFor='ext'>Extra Period</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </>
                                        )}

                                        {/* Date of Entry (Always visible except disabled partly in Monthly, and handled uniquely in period) */}
                                        {attendanceType !== 'period' && (
                                            <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[150px_1fr] md:gap-4'>
                                                <Label className='text-left font-medium text-sm md:text-right'>
                                                    DOE: <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    type='date'
                                                    value={doe}
                                                    onChange={(e) => setDoe(e.target.value)}
                                                    disabled={attendanceType === 'monthly'}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex justify-end pt-4'>
                                        <Button onClick={handleSearch} className='bg-orange-600 text-white hover:bg-orange-700'>
                                            <Search className='mr-2 h-4 w-4' /> Search
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Phase 3: Student List */}
                {searched && (
                    <CollapsibleSection title='STUDENT DETAILS' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                        <div className='mb-4 flex flex-col gap-4 p-4 md:flex-row md:justify-between'>
                            <h3 className='font-bold text-blue-600 text-lg'>{attendanceEntryMsg || 'Attendance Entry'}</h3>
                            {students.length > 0 && (
                                <div className='w-full md:w-1/3'>
                                    <div className='relative'>
                                        <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                                        <Input
                                            placeholder='Search Student Name, Adm No, Roll No...'
                                            onChange={(e) => handleTextSearch(e.target.value)}
                                            className='pl-8'
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {students.length > 0 ? (
                            <>
                                <GenericDataTable<StudentAttendanceStudent>
                                    data={filteredStudents}
                                    totalItems={filteredStudents.length}
                                    columns={columns}
                                    isLoading={false}
                                    showViewOptions={false}
                                    onRowSelectionChange={(rows) => {
                                        if (attendanceType === 'Dailyonce' || attendanceType === 'period') {
                                            // Handle GenericDataTable selection
                                            const selectedIds = new Set(rows.map((r) => r.amsT_Id));
                                            setStudents((prev) =>
                                                prev.map((s) => ({
                                                    ...s,
                                                    selected: selectedIds.has(s.amsT_Id)
                                                }))
                                            );
                                        }
                                    }}
                                />
                                <div className='flex justify-end gap-4 p-4'>
                                    <Button
                                        className='bg-blue-800 text-white hover:bg-blue-900'
                                        onClick={handleSave}
                                        disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button variant='destructive' onClick={() => setSearched(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className='p-8 text-center text-muted-foreground'>{noDataMessage || 'No Data Available'}</div>
                        )}
                    </CollapsibleSection>
                )}

                <AttendanceDetailsModal
                    isOpen={viewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                    data={viewData}
                    isLoading={viewMutation.isPending}
                    onDelete={handleDeleteRecord}
                    isDeleting={deleteMutation.isPending}
                />
            </div>
        </div>
    );
}
