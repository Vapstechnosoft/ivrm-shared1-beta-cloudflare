'use client';

import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
    useStudyCertificateDetails,
    useStudyCertificateLoadData,
    useStudyCertificateStudentList
} from '@/hooks/admission/preadmission/useReports';
import { useStudentSearchFilter } from '@/hooks/admission/preadmission/useStudentTc';

import TunBridgeStudyCertificatePrint from './_components/tun-bridge-study-certificate';

export default function TunBridgeStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    const { data: loadData } = useStudyCertificateLoadData(true);

    const [studentScope, setStudentScope] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L'>('S');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const [dateOpen, setDateOpen] = useState(false);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);

    const [showCertificate, setShowCertificate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const searchMutation = useStudentSearchFilter();

    const { data: studentList } = useStudyCertificateStudentList(
        {
            ASMAY_Id: academicYearId ?? 0,
            ASMCL_Id: studentScope === 'A' ? 0 : (classId ?? 0),
            ASMC_Id: studentScope === 'A' ? 0 : (sectionId ?? 0),
            AMST_Id: 0,
            AMST_SOL: studentStatus
        },
        !!academicYearId
    );

    useEffect(() => {
        if (!academicYearId || searchQuery.trim().length < 3) {
            setStudentListFromSearch([]);
            return;
        }
        const timer = setTimeout(() => {
            searchMutation.mutate(
                {
                    asmayId: Number(academicYearId),
                    amstSol: studentStatus,
                    searchfilter: searchQuery.trim(),
                    flag: 'N'
                },
                {
                    onSuccess: (response: any) => {
                        const list = response?.data || response?.studentList || response || [];
                        setStudentListFromSearch(Array.isArray(list) ? list : []);
                    }
                }
            );
        }, 450);

        return () => clearTimeout(timer);
    }, [academicYearId, searchQuery, studentStatus]);

    const admissionStudents = searchQuery.trim().length >= 3 ? studentListFromSearch : studentList;
    const rawStudents =
        (admissionStudents as any)?.data?.studentList ||
        (admissionStudents as any)?.data?.fillstudlist ||
        (Array.isArray(admissionStudents) ? admissionStudents : []);

    const students = useMemo(() => {
        return rawStudents.map((s: any) => ({
            ...s,
            studentName:
                s.studentName ||
                s.amsT_FirstName ||
                s.stuname ||
                s.studentnam ||
                `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
        }));
    }, [rawStudents]);

    const reportParams = useMemo(() => {
        return {
            ASMAY_Id: academicYearId,
            ASMCL_Id: studentScope === 'A' ? 0 : (classId ?? 0),
            ASMC_Id: studentScope === 'A' ? 0 : (sectionId ?? 0),
            AMST_Id: studentId ?? 0,
            AllOrInd: studentScope,
            AMST_SOL: studentStatus,
            ASCISS_CertificateFlg: 'SC'
        };
    }, [academicYearId, classId, sectionId, studentId, studentScope, studentStatus]);

    const studyReport = useStudyCertificateDetails(reportParams, false);

    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (!selectedDate) {
            toast.error('Select Date');
            return;
        }
        if (studentScope === 'I' && (!classId || !sectionId || !studentId)) {
            toast.error('Select Class, Section and Student');
            return;
        }
        if (!studentId) {
            toast.error('Select Student');
            return;
        }

        try {
            setIsLoading(true);
            setShowCertificate(false);
            setReportData(null);

            const res = await studyReport.refetch();
            const data = (res.data as any)?.data ?? res.data;
            const list = data?.studentList ?? [];
            if (Array.isArray(list) && list.length > 0) {
                setReportData(data);
                setShowCertificate(true);
            } else {
                toast.error('Record not found');
            }
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setStudentScope('A');
        setStudentStatus('S');
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentId(null);
        setSelectedDate(new Date());
        setSearchQuery('');
        setStudentListFromSearch([]);
        setShowCertificate(false);
        setReportData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'TunBridge_Study_Certificate'
    });

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Study Certificate Report'
                description='Tunbridge High School - Study Certificate'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup
                                value={studentScope}
                                onValueChange={(v) => {
                                    const val = v as 'A' | 'I';
                                    setStudentScope(val);
                                    setClassId(null);
                                    setSectionId(null);
                                    setStudentId(null);
                                    setSearchQuery('');
                                }}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='scope-all' />
                                    <Label htmlFor='scope-all' className='font-medium text-sm'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='I' id='scope-ind' />
                                    <Label htmlFor='scope-ind' className='font-medium text-sm'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup
                                value={studentStatus}
                                onValueChange={(v) => {
                                    setStudentStatus(v as any);
                                    setStudentId(null);
                                    setSearchQuery('');
                                }}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='status-studying' />
                                    <Label htmlFor='status-studying' className='font-medium text-sm'>
                                        Studying
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='L' id='status-left' />
                                    <Label htmlFor='status-left' className='font-medium text-sm'>
                                        Left
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup value='0' className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='type-study' />
                                    <Label htmlFor='type-study' className='font-medium text-sm'>
                                        Study Certificate
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={academicYearId?.toString()}
                                    onValueChange={(v) => {
                                        setAcademicYearId(Number(v));
                                        setClassId(null);
                                        setSectionId(null);
                                        setStudentId(null);
                                        setSearchQuery('');
                                        setStudentListFromSearch([]);
                                    }}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allAcademicYear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Class:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => {
                                        setClassId(Number(v));
                                        setSectionId(null);
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allclasslist?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A' || !classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => {
                                        setSectionId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allsectionlist?.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Date:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-9 w-full justify-start text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
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

                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Student:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <div className='relative'>
                                            <input
                                                value={
                                                    studentId
                                                        ? students.find((s: any) => s.amsT_Id === studentId)?.studentName || searchQuery
                                                        : searchQuery
                                                }
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setStudentId(null);
                                                    setStudentOpen(true);
                                                }}
                                                onFocus={() => setStudentOpen(true)}
                                                className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                                placeholder='Select or search Student (min 3 chars)'
                                            />
                                            {searchMutation.isPending && (
                                                <div className='absolute top-2.5 right-2'>
                                                    <Loader2 className='h-4 w-4 animate-spin text-indigo-500' />
                                                </div>
                                            )}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[420px] p-0' align='start' onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <Command shouldFilter={false} className='w-full'>
                                            <CommandList>
                                                {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                                                    <div className='p-4 text-center text-muted-foreground text-sm'>
                                                        Enter at least 3 characters
                                                    </div>
                                                )}
                                                <CommandEmpty>{searchQuery.trim().length >= 3 ? 'No students found.' : ''}</CommandEmpty>
                                                <CommandGroup>
                                                    {students.map((s: any, idx: number) => (
                                                        <CommandItem
                                                            key={`${s.amsT_Id || 's'}-${idx}`}
                                                            value={s.studentName}
                                                            onSelect={() => {
                                                                setStudentId(Number(s.amsT_Id));
                                                                setSearchQuery(s.studentName);
                                                                setStudentOpen(false);
                                                            }}>
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    studentId === Number(s.amsT_Id) ? 'opacity-100' : 'opacity-0'
                                                                )}
                                                            />
                                                            <div className='flex flex-col'>
                                                                <span>{s.studentName}</span>
                                                                <span className='text-[10px] text-muted-foreground'>
                                                                    Adm: {s.amsT_AdmNo || s.admno || '-'} |{' '}
                                                                    {s.asmcL_ClassName || s.class || 'N/A'}-
                                                                    {s.asmC_SectionName || s.section || 'N/A'}
                                                                </span>
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
                    </div>

                    <div className='flex flex-wrap justify-center gap-4 border-t pt-6'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={isLoading}
                            className='min-w-[120px] bg-[#3f51b5] text-white uppercase shadow-md hover:bg-[#303f9f]'>
                            {isLoading ? <RotateCcw className='mr-2 h-4 w-4 animate-spin' /> : <Printer className='mr-2 h-4 w-4' />}
                            Report
                        </Button>
                        <Button
                            size='sm'
                            onClick={handleReset}
                            className='min-w-[120px] bg-[#ff5722] text-white uppercase shadow-md hover:bg-[#f4511e]'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button
                            size='sm'
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            className='min-w-[120px] bg-[#e0e0e0] text-gray-700 uppercase shadow-md hover:bg-[#d5d5d5] disabled:bg-gray-100'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {showCertificate && reportData && (
                <div className='mt-8 flex justify-center overflow-x-auto rounded-xl border-2 border-gray-300 border-dashed bg-gray-100 p-4'>
                    <div className='origin-top bg-white shadow-2xl'>
                        <TunBridgeStudyCertificatePrint ref={printRef} data={reportData} selectedDate={selectedDate} />
                    </div>
                </div>
            )}
        </div>
    );
}
