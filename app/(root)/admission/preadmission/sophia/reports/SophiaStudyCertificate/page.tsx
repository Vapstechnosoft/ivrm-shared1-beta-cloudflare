'use client';

import { format } from 'date-fns';
import { CalendarIcon, Check, FileCheck, GraduationCap, Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import {
    useSophiaStudyCertDetails,
    useSophiaStudyCertLoadData,
    useSophiaStudyCertSearchFilter
} from '@/hooks/admission/preadmission/useSophiaStudyCertificate';
import { toast } from 'sonner';

/* -------------------- Types -------------------- */
interface AcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

interface ClassItem {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

interface SectionItem {
    asmS_Id: number;
    asmC_SectionName: string;
}

interface LoadData {
    allAcademicYear: AcademicYear[];
    allclasslist: ClassItem[];
    allsectionlist: SectionItem[];
}

export default function SophiaStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadDataResponse, isLoading: isLoadDataLoading } = useSophiaStudyCertLoadData();

    const loadData = useMemo(() => {
        const data = loadDataResponse?.data || (loadDataResponse as any);
        return {
            allAcademicYear: Array.isArray(data?.allAcademicYear) ? data.allAcademicYear : [],
            allclasslist: Array.isArray(data?.allclasslist) ? data.allclasslist : [],
            allsectionlist: Array.isArray(data?.allsectionlist) ? data.allsectionlist : []
        } as LoadData;
    }, [loadDataResponse]);

    /* -------------------- UI State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L' | 'D'>('S');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dateOpen, setDateOpen] = useState(false);
    const [certificateType, setCertificateType] = useState<string>('0');
    const [visaFromDate, setVisaFromDate] = useState<Date | null>(new Date());
    const [visaToDate, setVisaToDate] = useState<Date | null>(new Date());
    const [vacationReason, setVacationReason] = useState('');
    const [showCertificate, setShowCertificate] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const searchMutation = useSophiaStudyCertSearchFilter();
    const detailsMutation = useSophiaStudyCertDetails();

    /* -------------------- Search Logic -------------------- */
    // Triggered when user types in the search field
    useEffect(() => {
        // Requirement: ASMAY_Id is mandatory, and at least 3 chars for searching
        if (!academicYearId || searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            // Using the API as specified for global search: /StudyCertificate/searchfilter
            // Search always uses ASMCL_Id: 0, ASMC_Id: 0 and allorindid: 'A' to find students across the whole year
            searchMutation.mutate(
                {
                    ASMAY_Id: academicYearId,
                    AMST_SOL: studentStatus,
                    ASMCL_Id: 0,
                    ASMC_Id: 0,
                    searchfilter: searchQuery,
                    allorindid: 'A'
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        // Backend returns list in 'fillstudlist' or 'studentList'
                        const list = data?.fillstudlist || data?.studentList || [];
                        setStudentListFromSearch(
                            Array.isArray(list)
                                ? list.map((s: any) => ({
                                      ...s,
                                      amst_id: s.amsT_Id || s.AMST_Id,
                                      studentname: s.amsT_FirstName || s.AMST_FirstName || s.studentname || s.studentName,
                                      amst_admno: s.amsT_AdmNo || s.AMST_AdmNo || s.admNo,
                                      asmcl_classname: s.asmcL_ClassName || s.ASMCL_ClassName || s.class || s.className
                                  }))
                                : []
                        );
                    },
                    onError: () => {
                        toast.error('Error searching students');
                    }
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus]);

    /* -------------------- Actions -------------------- */
    const safeDateFormat = (dateStr: any, formatStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return format(date, formatStr);
        } catch (e) {
            return dateStr;
        }
    };

    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (studentScope === 'I') {
            if (!classId) {
                toast.error('Select Class');
                return;
            }
            if (!sectionId) {
                toast.error('Select Section');
                return;
            }
            if (!studentId) {
                toast.error('Select Student');
                return;
            }
        }
        if (certificateType === '2' && (!visaFromDate || !visaToDate)) {
            toast.error('Select From and To dates');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId || 0,
            ASMC_Id: sectionId || 0,
            AMST_Id: studentId || 0,
            allorindid: studentScope
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            const data = res?.data || res;
            const studentListData = data?.studentlist || data?.studentList || [];

            if (Array.isArray(studentListData) && studentListData.length > 0) {
                const normalizedList = studentListData.map((s: any) => {
                    const isFemale = (s.AMST_Sex || '').toLowerCase() === 'female';
                    return {
                        ...s,
                        studentname: s.studentnam || s.studentname || s.studentName || '',
                        fathername: s.fatherName || s.fathername || '',
                        mothername: s.mothername || '',
                        classstudying: s.class || s.classname || '',
                        admNo: s.admNo || s.admno || '',
                        acadamicyear: s.acadamicyear || '',
                        admyear: s.AMST_Date || s.admyear || '',
                        dob12: s.dob || '',
                        AMST_PerStreet: (s.AMST_PerStreet || '').toUpperCase(),
                        AMST_PerArea: (s.AMST_PerArea || '').toUpperCase(),
                        AMST_PerCity: (s.AMST_PerCity || '').toUpperCase(),
                        ivrmms_name: (s.ivrmms_name || '').toUpperCase(),
                        AMST_PerPincode: s.AMST_PerPincode || '',
                        religion: s.religion || '',
                        caste_name: s.caste_name || '',
                        stuMT: s.stuMT || '',
                        joinedClass: s.JoinedClass || s.joinedClass || '',
                        joinedyear: s.JoinedYear || s.joinedyear || '',
                        PresentClass: s.PresentClass || '',
                        presentYear: s.PresentYear || '',
                        gender1: isFemale ? 'She' : 'He',
                        gender2: isFemale ? 'Her' : 'His',
                        gender3: isFemale ? 'daughter' : 'son',
                        gender4: isFemale ? 'She' : 'He',
                        gender8: isFemale ? 'her' : 'his',
                        Holiday: vacationReason,
                        Summerfrom: visaFromDate,
                        Summerto: visaToDate
                    };
                });
                setReportData({ ...data, studentList: normalizedList });
                setShowCertificate(true);
                toast.success('Report data fetched');
            } else {
                toast.error('No records found for the selected criteria');
                setShowCertificate(false);
            }
        } catch (error) {
            toast.error('Failed to fetch report details');
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchQuery('');
        setStudentScope('A');
        setStudentStatus('S');
        setSelectedDate(new Date());
        setCertificateType('0');
        setVisaFromDate(new Date());
        setVisaToDate(new Date());
        setVacationReason('');
        setShowCertificate(false);
        setReportData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Sophia_Study_Certificate'
    });

    if (isLoadDataLoading) {
        return (
            <div className='flex h-screen items-center justify-center bg-gray-50'>
                <div className='flex flex-col items-center gap-2'>
                    <Loader2 className='h-10 w-10 animate-spin text-[#3f51b5]' />
                    <span className='font-medium text-gray-500 text-sm'>Initializing...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen space-y-6 bg-[#f1f5f9] p-4'>
            {/* Blue Header Bar */}
            <div className='flex items-center justify-between rounded-t-lg bg-[#3f51b5] p-4 text-white shadow-md'>
                <div className='flex items-center gap-3'>
                    <GraduationCap className='h-6 w-6' />
                    <h1 className='font-bold text-xl uppercase tracking-tight'>STUDYCERTIFICATE CERTIFICATE REPORT</h1>
                </div>
                <div className='font-medium text-[10px] opacity-70'>ADMISSION &gt; REPORTS &gt; SOPHIA STUDY CERTIFICATE</div>
            </div>

            <Card className='overflow-hidden rounded-none rounded-b-lg border-none bg-white shadow-lg'>
                <CardContent className='space-y-8 p-8'>
                    {/* Filter Section Row */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        <div className='flex flex-col gap-2'>
                            <Label className='px-1 font-bold text-gray-500 text-xs uppercase'>Scope</Label>
                            <div className='group flex items-center justify-center rounded-xl border-2 border-gray-200 border-dashed bg-gray-50/50 p-3 transition-colors duration-200 hover:bg-white'>
                                <RadioGroup
                                    value={studentScope}
                                    onValueChange={(v) => {
                                        setStudentScope(v as any);
                                        if (v === 'A') {
                                            setStudentId(null);
                                            setSearchQuery('');
                                        }
                                    }}
                                    className='flex gap-10'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='A' id='scope-all' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='scope-all' className='cursor-pointer font-semibold text-gray-700 text-sm'>
                                            All
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='I' id='scope-ind' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='scope-ind' className='cursor-pointer font-semibold text-gray-700 text-sm'>
                                            Individual
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label className='px-1 font-bold text-gray-500 text-xs uppercase'>Status</Label>
                            <div className='flex items-center justify-center rounded-xl border-2 border-gray-200 border-dashed bg-gray-50/50 p-3 transition-colors duration-200 hover:bg-white'>
                                <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className='flex gap-10'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='S' id='status-studying' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='status-studying' className='cursor-pointer font-semibold text-gray-700 text-sm'>
                                            Studying
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='L' id='status-left' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='status-left' className='cursor-pointer font-semibold text-gray-700 text-sm'>
                                            Left
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label className='px-1 font-bold text-gray-500 text-xs uppercase'>Certificate Type</Label>
                            <div className='flex min-h-[50px] flex-wrap items-center justify-center rounded-xl border-2 border-gray-200 border-dashed bg-gray-50/50 p-3 transition-colors duration-200 hover:bg-white'>
                                <RadioGroup
                                    value={certificateType}
                                    onValueChange={(v) => setCertificateType(v)}
                                    className='flex flex-wrap justify-center gap-x-6 gap-y-2'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id='type-0' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='type-0' className='cursor-pointer font-bold text-[11px] text-gray-600'>
                                            Study Certificate
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='type-1' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='type-1' className='cursor-pointer font-bold text-[11px] text-gray-600'>
                                            Study Certificate CET
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='2' id='type-2' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='type-2' className='cursor-pointer font-bold text-[11px] text-gray-600'>
                                            Study Certificate Visa
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='3' id='type-3' className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor='type-3' className='cursor-pointer font-bold text-[11px] text-gray-600'>
                                            Conduct Certificate
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    <Separator className='bg-gray-100' />

                    {/* Form Controls Area */}
                    <div className='grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-6'>
                            <div className='flex flex-col gap-1.5'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={academicYearId?.toString()}
                                    onValueChange={(v) => {
                                        setAcademicYearId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 bg-white shadow-sm transition-all hover:border-[#3f51b5]'>
                                        <SelectValue placeholder='--Select Academic Year--' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-lg'>
                                        {loadData.allAcademicYear?.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Class <span className={cn(studentScope === 'I' ? 'text-red-500' : 'hidden')}>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => {
                                        setClassId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 bg-white shadow-sm transition-all hover:border-[#3f51b5]'>
                                        <SelectValue placeholder='--Select Class--' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-lg'>
                                        {loadData.allclasslist?.map((item) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Section <span className={cn(studentScope === 'I' ? 'text-red-500' : 'hidden')}>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A' || !classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => {
                                        setSectionId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 bg-white shadow-sm transition-all hover:border-[#3f51b5]'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-lg'>
                                        {loadData.allsectionlist?.map((item) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-6'>
                            <div className='flex flex-col gap-1.5'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Certificate Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className='h-11 w-full justify-between border-gray-200 bg-white text-left font-normal shadow-sm transition-all hover:border-[#3f51b5]'>
                                            {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Pick a date'}
                                            <CalendarIcon className='h-4 w-4 text-[#3f51b5]' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='rounded-xl border-none p-0 shadow-2xl'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate || undefined}
                                            onDayClick={(date) => {
                                                setSelectedDate(date);
                                                setDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Search Student <span className={cn(studentScope === 'I' ? 'text-red-500' : 'hidden')}>*</span>
                                </Label>
                                <div className='group relative w-full'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='relative'>
                                                <div className='absolute top-3.5 left-3'>
                                                    <Search
                                                        className={cn(
                                                            'h-4 w-4 transition-colors',
                                                            searchQuery.length >= 3 ? 'text-[#3f51b5]' : 'text-gray-400'
                                                        )}
                                                    />
                                                </div>
                                                <input
                                                    disabled={!academicYearId}
                                                    value={
                                                        studentId
                                                            ? studentListFromSearch.find((s: any) => s.amst_id === studentId)
                                                                  ?.studentname || searchQuery
                                                            : searchQuery
                                                    }
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setStudentId(null);
                                                        setStudentOpen(true);
                                                    }}
                                                    onFocus={() => setStudentOpen(true)}
                                                    className='flex h-11 w-full rounded-lg border border-gray-200 bg-white py-2 pr-10 pl-10 text-sm shadow-sm transition-all focus:border-[#3f51b5] focus:outline-none focus:ring-1 focus:ring-[#3f51b5] disabled:bg-gray-50'
                                                    placeholder='Type at least 3 characters to search...'
                                                />
                                                {searchMutation.isPending && (
                                                    <div className='absolute top-3.5 right-3'>
                                                        <Loader2 className='h-4 w-4 animate-spin text-[#3f51b5]' />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className='w-[450px] rounded-xl border-none p-0 shadow-2xl'
                                            align='start'
                                            onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='rounded-xl'>
                                                <CommandList>
                                                    {searchMutation.isPending && (
                                                        <div className='flex flex-col items-center gap-2 p-10 text-center'>
                                                            <Loader2 className='h-8 w-8 animate-spin text-[#3f51b5]' />
                                                            <p className='font-bold text-gray-400 text-xs uppercase tracking-widest'>
                                                                Searching Database
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!searchMutation.isPending && searchQuery.length < 3 && (
                                                        <div className='p-8 text-center text-gray-400 text-sm italic'>
                                                            Please type 3 or more characters
                                                        </div>
                                                    )}
                                                    <CommandEmpty>No matching student found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {studentListFromSearch.map((s: any) => (
                                                            <CommandItem
                                                                key={s.amst_id}
                                                                value={s.studentname}
                                                                onSelect={() => {
                                                                    setStudentId(s.amst_id);
                                                                    setSearchQuery(s.studentname);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className='cursor-pointer p-3 transition-colors hover:bg-blue-50/50'>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-3 h-4 w-4 text-green-500',
                                                                        studentId === s.amst_id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div className='flex flex-col gap-0.5'>
                                                                    <span className='font-bold text-gray-800'>{s.studentname}</span>
                                                                    <div className='flex items-center gap-2'>
                                                                        <span className='font-black text-[10px] text-gray-400 uppercase tracking-tighter'>
                                                                            Adm No: {s.amst_admno}
                                                                        </span>
                                                                        <Separator orientation='vertical' className='h-2 bg-gray-200' />
                                                                        <span className='font-black text-[#3f51b5] text-[10px] uppercase'>
                                                                            {s.asmcl_classname}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Visa Certificate Specific Fields */}
                            {certificateType === '2' && (
                                <div className='slide-in-from-top-2 grid animate-in grid-cols-1 gap-4 rounded-xl border-2 border-blue-100 border-dashed bg-blue-50/30 p-4 duration-300 md:grid-cols-2'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label className='font-bold text-gray-600 text-xs'>
                                            From Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className='h-10 w-full justify-between border-gray-200 bg-white text-left font-normal shadow-sm'>
                                                    {visaFromDate ? format(visaFromDate, 'dd-MM-yyyy') : 'From Date'}
                                                    <CalendarIcon className='h-4 w-4 text-blue-400' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='start' className='rounded-xl p-0 shadow-2xl'>
                                                <DatePickerWithYear
                                                    mode='single'
                                                    selected={visaFromDate || undefined}
                                                    onDayClick={(date) => setVisaFromDate(date)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label className='font-bold text-gray-600 text-xs'>
                                            To Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className='h-10 w-full justify-between border-gray-200 bg-white text-left font-normal shadow-sm'>
                                                    {visaToDate ? format(visaToDate, 'dd-MM-yyyy') : 'To Date'}
                                                    <CalendarIcon className='h-4 w-4 text-blue-400' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='start' className='rounded-xl p-0 shadow-2xl'>
                                                <DatePickerWithYear
                                                    mode='single'
                                                    selected={visaToDate || undefined}
                                                    onDayClick={(date) => setVisaToDate(date)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                                        <Label className='font-bold text-gray-600 text-xs'>Vacation reason:</Label>
                                        <input
                                            value={vacationReason}
                                            onChange={(e) => setVacationReason(e.target.value)}
                                            className='flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none'
                                            placeholder='Enter reason for travel...'
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons: Aligned to Right under Student Search like Legacy */}
                            <div className='flex items-center justify-end gap-4 pt-4'>
                                <Button
                                    size='lg'
                                    onClick={handleReport}
                                    disabled={detailsMutation.isPending}
                                    className='h-11 rounded-lg bg-[#3f51b5] px-8 font-black text-white text-xs uppercase tracking-widest shadow-blue-100 shadow-lg transition-all hover:bg-[#303f9f] active:scale-95'>
                                    {detailsMutation.isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <FileCheck className='mr-2 h-4 w-4' />
                                    )}
                                    REPORT
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='h-11 rounded-lg border-2 border-[#ff5722] px-8 font-black text-[#ff5722] text-xs uppercase tracking-widest shadow-lg shadow-orange-50 transition-all hover:bg-[#ff5722] hover:text-white active:scale-95'>
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    CANCEL
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={handlePrint}
                                    disabled={!showCertificate}
                                    className='h-11 rounded-lg bg-gray-200 px-8 font-black text-gray-600 text-xs uppercase tracking-widest shadow-gray-100 shadow-lg transition-all hover:bg-gray-300 active:scale-95 disabled:opacity-50 disabled:shadow-none'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    PRINT
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Certificate Preview with B5 Formatting */}
            {showCertificate && reportData && (
                <div className='fade-in slide-in-from-bottom-10 mt-12 flex animate-in flex-col items-center gap-6 duration-700'>
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                        @media print {
                            @page {
                                size: B5 portrait;
                                margin: 0;
                            }
                            .printable-content {
                                width: 176mm !important;
                                height: 250mm !important;
                                margin: 0 !important;
                                padding: 12mm !important;
                                box-shadow: none !important;
                                ring: none !important;
                            }
                        }
                    `
                        }}
                    />

                    <div className='flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 font-bold text-green-700 text-xs uppercase tracking-widest'>
                        <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
                        Report Ready (B5 Format)
                    </div>

                    <div className='flex w-full justify-center overflow-auto rounded-[2rem] bg-gray-300 p-6 shadow-inner md:p-12'>
                        <div
                            ref={printRef}
                            className='printable-content min-h-[250mm] w-full max-w-[176mm] overflow-hidden rounded-sm bg-white p-10 text-black shadow-2xl ring-1 ring-gray-100'>
                            {reportData.studentList?.map((student: any, index: number) => (
                                <div key={index} className='page-break-after-always'>
                                    {/* Type 0: Study Certificate (B5 Optimized) */}
                                    {String(certificateType) === '0' && (
                                        <div
                                            className='certificate-container'
                                            style={{
                                                marginTop: '100px',
                                                lineHeight: '2.0',
                                                fontSize: '19px',
                                                marginLeft: '4%',
                                                paddingRight: '4%',
                                                fontFamily: "'Times New Roman', Times, serif",
                                                color: '#000'
                                            }}>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '17px', marginBottom: '30px' }}>
                                                Date: {safeDateFormat(selectedDate || new Date(), 'dd/MMM/yyyy')}
                                            </div>

                                            <h3
                                                className='text-center'
                                                style={{ fontSize: '28px', margin: '40px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                STUDY CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'justify' }}>
                                                <p style={{ marginBottom: '25px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> {student.gender3} of Mr.{' '}
                                                    <strong>{student.fathername}</strong> & Mrs. <strong>{student.mothername}</strong> is a
                                                    student of this school studying in Std. <strong>{student.classstudying}</strong> With
                                                    admission number <strong>{student.admNo}</strong> during the academic year{' '}
                                                    {student.acadamicyear}.
                                                </p>

                                                <p style={{ marginBottom: '25px' }}>
                                                    {student.gender1} is a student in this school since{' '}
                                                    <strong>{safeDateFormat(student.admyear, 'yyyy')}</strong> and {student.gender2} date of
                                                    birth as per our records is{' '}
                                                    <strong>{safeDateFormat(student.dob12, 'dd-MMM-yyyy')}</strong>.
                                                </p>

                                                <div style={{ marginBottom: '60px' }}>
                                                    <p style={{ marginBottom: '10px' }}>{student.gender2} local address :</p>
                                                    <div style={{ fontWeight: 'bold', lineHeight: '1.5' }}>
                                                        {student.AMST_PerStreet || student.amsT_PerStreet || student.address1 || ''}
                                                        <br />
                                                        {student.AMST_PerArea || student.amsT_PerArea || student.address2 || ''}
                                                        <br />
                                                        {student.AMST_PerCity || student.amsT_PerCity || student.city || ''}
                                                        <br />
                                                        {student.ivrmms_name || student.state || ''} -{' '}
                                                        {student.AMST_PerPincode || student.amsT_PerPincode || student.pincode || ''}
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '60px' }}>
                                                    <p style={{ marginBottom: '40px' }}>Yours sincerely,</p>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '20px' }}>
                                                            Sr. M. Alpana, S.N.D.
                                                        </p>
                                                        <p style={{ margin: '0', fontSize: '18px' }}>(Principal)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type 1: Study Certificate CET (B5 Optimized) */}
                                    {String(certificateType) === '1' && (
                                        <div
                                            className='certificate-container'
                                            style={{
                                                marginTop: '100px',
                                                lineHeight: '2.0',
                                                fontSize: '19px',
                                                marginLeft: '4%',
                                                paddingRight: '4%',
                                                fontFamily: "'Times New Roman', Times, serif",
                                                color: '#000'
                                            }}>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '17px', marginBottom: '30px' }}>
                                                Date: {safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}
                                            </div>

                                            <h3
                                                className='text-center'
                                                style={{ fontSize: '28px', margin: '40px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                STUDY CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'justify' }}>
                                                <p style={{ marginBottom: '35px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> {student.gender3} of Mr.{' '}
                                                    <strong>{student.fathername}</strong> & Mrs. <strong>{student.mothername}</strong> has
                                                    studied{' '}
                                                    <strong>
                                                        std.{student.joinedClass} to {student.PresentClass}
                                                    </strong>{' '}
                                                    standard in our institution from{' '}
                                                    <strong>
                                                        {student.joinedyear} to {student.presentYear}
                                                    </strong>{' '}
                                                    academic years.
                                                </p>

                                                <p style={{ marginBottom: '35px' }}>
                                                    {student.gender1} belongs to{' '}
                                                    <strong>
                                                        {student.religion}({student.caste_name})
                                                    </strong>{' '}
                                                    religion & the mother tongue of the above student is <strong>{student.stuMT}</strong> as
                                                    per the admission register maintained in the institution.
                                                </p>

                                                <p style={{ marginBottom: '60px' }}>
                                                    The above details are true and correct to the best of my knowledge.
                                                </p>

                                                <div style={{ marginTop: '80px' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '20px' }}>
                                                            Sr. M. Alpana, S.N.D.
                                                        </p>
                                                        <p style={{ margin: '0', fontSize: '18px' }}>(Principal)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type 2: Study Certificate Visa (B5 Optimized) */}
                                    {String(certificateType) === '2' && (
                                        <div
                                            className='certificate-container'
                                            style={{
                                                marginTop: '100px',
                                                lineHeight: '2.0',
                                                fontSize: '19px',
                                                marginLeft: '4%',
                                                paddingRight: '4%',
                                                fontFamily: "'Times New Roman', Times, serif",
                                                color: '#000'
                                            }}>
                                            <div style={{ textAlign: 'right', fontSize: '17px', marginBottom: '40px' }}>
                                                Date: {safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}
                                            </div>

                                            <h3 className='text-center' style={{ fontSize: '28px', margin: '40px 0', fontWeight: 'bold' }}>
                                                STUDY CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'justify' }}>
                                                <p style={{ marginBottom: '20px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> {student.gender3} of Mr.{' '}
                                                    <strong>{student.fathername}</strong> & Mrs. <strong>{student.mothername}</strong> is a
                                                    student of this school studying in Std. <strong>{student.classstudying}</strong> with
                                                    admission number <strong>{student.admNo}</strong> during the academic year{' '}
                                                    {student.acadamicyear}.
                                                </p>

                                                <p style={{ marginBottom: '20px' }}>
                                                    {student.gender4} is a student in this school since{' '}
                                                    <strong>{safeDateFormat(student.admyear, 'yyyy')}</strong> and {student.gender8} date of
                                                    birth as per our records is{' '}
                                                    <strong>{safeDateFormat(student.dob12, 'dd-MMM-yyyy')}</strong>.
                                                </p>

                                                <p style={{ marginBottom: '20px' }}>
                                                    {vacationReason} from{' '}
                                                    <strong>
                                                        {' '}
                                                        {safeDateFormat(visaFromDate, 'dd-MM-yyyy')} to{' '}
                                                        {safeDateFormat(visaToDate, 'dd-MM-yyyy')} .
                                                    </strong>
                                                </p>

                                                <p style={{ marginBottom: '40px' }}>
                                                    {student.gender4} is permitted to travel abroad during this period{' '}
                                                    <strong>{safeDateFormat(visaFromDate, 'dd-MM-yyyy')}</strong> and{' '}
                                                    <strong>{safeDateFormat(visaToDate, 'dd-MM-yyyy')}</strong> will return to school after{' '}
                                                    {student.gender8} visit.
                                                </p>

                                                <div style={{ marginTop: '40px' }}>
                                                    <p style={{ marginBottom: '30px' }}>Yours sincerely,</p>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '20px' }}>
                                                            Sr. M. Alpana, S.N.D.
                                                        </p>
                                                        <p style={{ margin: '0', fontSize: '18px' }}>(Principal)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type 3: Conduct Certificate (B5 Optimized) */}
                                    {String(certificateType) === '3' && (
                                        <div
                                            className='certificate-container'
                                            style={{
                                                marginTop: '120px',
                                                lineHeight: '2.5',
                                                fontSize: '22px',
                                                marginLeft: '2%',
                                                paddingRight: '2%',
                                                fontFamily: "'Times New Roman', Times, serif",
                                                color: '#000'
                                            }}>
                                            <h3
                                                className='text-center'
                                                style={{
                                                    fontSize: '30px',
                                                    margin: '60px 0',
                                                    fontWeight: 'bold',
                                                    color: '#3f51b5',
                                                    textDecoration: 'underline'
                                                }}>
                                                CONDUCT CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '40px' }}>
                                                <p style={{ marginBottom: '10px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> of
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    Standard <strong>{student.classstudying}</strong> was a student of
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>SOPHIA HIGH SCHOOL, Bangalore</strong> and was
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    of <strong>Good</strong> Character.
                                                </p>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: '180px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-end',
                                                    padding: '0 20px'
                                                }}>
                                                <div style={{ textAlign: 'left', fontSize: '18px' }}>
                                                    Date: {safeDateFormat(selectedDate || new Date(), 'dd-MMM-yyyy')}
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '20px', fontWeight: 'bold' }}>PRINCIPAL</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Placeholder for other types */}
                                    {['0', '1', '2', '3'].indexOf(String(certificateType)) === -1 && (
                                        <div className='flex h-[500px] items-center justify-center rounded-[2rem] border-4 border-gray-100 border-dashed p-10 font-bold text-gray-200 italic'>
                                            Preview for Type {certificateType} is ready for generation.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
