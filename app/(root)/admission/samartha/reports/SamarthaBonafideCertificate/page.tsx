'use client';

import { useDebounce } from '@/hooks/utils/use-debounce';
import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useSamarthaBonafideCertLoadData,
    useSamarthaBonafideCertSearchFilter,
    useSamarthaBonafideCertStudDetails
} from '@/hooks/admission/preadmission/reports/useSamarthaBonafideCertificate';
import { toast } from 'sonner';

export default function SamarthaBonafideCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSamarthaBonafideCertLoadData();

    /* -------------------- UI State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L'>('S');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateOpen, setDateOpen] = useState(false);

    const [showCertificate, setShowCertificate] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const searchMutation = useSamarthaBonafideCertSearchFilter();
    const detailsMutation = useSamarthaBonafideCertStudDetails();

    /* -------------------- Search Logic -------------------- */
    useEffect(() => {
        const fetchStudents = async () => {
            if (!academicYearId || debouncedSearch.length < 2) {
                setStudentListFromSearch([]);
                return;
            }

            try {
                const res: any = await searchMutation.mutateAsync({
                    ASMAY_Id: academicYearId,
                    AMST_SOL: studentStatus,
                    ASMCL_Id: studentScope === 'A' ? 0 : classId || 0,
                    ASMC_Id: studentScope === 'A' ? 0 : sectionId || 0,
                    searchfilter: debouncedSearch,
                    allorindid: studentScope
                });

                const data = res?.data || res;
                const list = data?.fillstudlist || data?.studentlist || [];
                setStudentListFromSearch(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error('Search error:', error);
                setStudentListFromSearch([]);
            }
        };

        fetchStudents();
    }, [debouncedSearch, academicYearId, studentStatus, classId, sectionId, studentScope]);

    const searchIsLoading = searchMutation.isPending;

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || (studentScope === 'I' && !studentId)) {
            toast.error('Please select all required fields');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: studentScope === 'A' ? 0 : classId || 0,
            ASMC_Id: studentScope === 'A' ? 0 : sectionId || 0,
            AMST_Id: studentId || 0,
            AMST_SOL: studentStatus,
            allorindid: studentScope
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            const data = res?.data || res;

            const studentListData = data?.studentlist || data?.studentList || [];

            if (Array.isArray(studentListData) && studentListData.length > 0) {
                const normalizedList = studentListData.map((s: any) => {
                    const gender = s.AMST_Sex || s.amsT_Sex || '';
                    const isFemale = gender.toLowerCase() === 'female';

                    const sName =
                        s.studentname ||
                        s.studentName ||
                        s.studentnam ||
                        [
                            s.amsT_FirstName || s.AMST_FirstName || '',
                            s.amsT_MiddleName || s.AMST_MiddleName || '',
                            s.amsT_LastName || s.AMST_LastName || ''
                        ]
                            .filter(Boolean)
                            .join(' ');

                    return {
                        ...s,
                        studentname: sName,
                        fathername: s.fatherName || s.fathername || s.amsT_FatherName || '',
                        admno: s.admno || s.admNo || s.amsT_AdmNo || '',
                        penno: s.AMST_PENNo || s.penno || '',
                        joinedyear: s.JoinedYear || s.joinedyear || '',
                        presentYear: s.PresentYear || s.presentYear || '',
                        joinedClass: s.JoinedClass || s.joinedClass || '',
                        presentClass: s.PresentClass || s.presentClass || '',
                        lbldob: s.dob || s.amsT_DateOfBirth || '',
                        lbldobwords: s.dobwords || s.dobWords || '',

                        gen: isFemale ? 'Kumari' : 'Master',
                        gender1: isFemale ? 'She' : 'He',
                        gender2: isFemale ? 'Her' : 'His',
                        gender3: isFemale ? 'Daughter' : 'Son'
                    };
                });
                setReportData({ ...data, studentList: normalizedList });
                setShowCertificate(true);
            } else {
                toast.error('No records found');
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
        setSelectedStudentName('');
        setShowCertificate(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Samartha_Bonafide_Certificate'
    });

    /* -------------------- UI Helpers -------------------- */
    const yearList = (loadData as any)?.data?.allAcademicYear || (loadData as any)?.allAcademicYear || [];
    const classList = (loadData as any)?.data?.allclasslist || (loadData as any)?.allclasslist || [];
    const sectionList = (loadData as any)?.data?.allsectionlist || (loadData as any)?.allsectionlist || [];

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Bonafide Certificate Report'
                description='Generate bonafide certificates for Samartha students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='flex flex-col space-y-2 rounded-lg border bg-gray-50/50 p-4'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Selection Scope</Label>
                            <RadioGroup
                                value={studentScope}
                                onValueChange={(v) => {
                                    setStudentScope(v as any);
                                    if (v === 'A') {
                                        setClassId(null);
                                        setSectionId(null);
                                        setStudentId(null);
                                    }
                                }}
                                className='flex space-x-6'>
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

                        <div className='flex flex-col space-y-2 rounded-lg border bg-gray-50/50 p-4'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Student Status</Label>
                            <RadioGroup
                                value={studentStatus}
                                onValueChange={(v) => {
                                    setStudentStatus(v as any);
                                    setStudentId(null);
                                    setSearchQuery('');
                                }}
                                className='flex space-x-6'>
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

                        <div className='flex flex-col space-y-2 rounded-lg border bg-gray-50/50 p-4'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Certificate Type</Label>
                            <div className='flex h-full items-center space-x-2'>
                                <RadioGroup value='0' className='flex items-center'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id='cert0' checked={true} />
                                        <Label htmlFor='cert0' className='font-medium text-sm'>
                                            Bonafide Certificate
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={academicYearId?.toString()}
                                    onValueChange={(v) => {
                                        setAcademicYearId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-9 transition-all hover:border-indigo-400 focus:ring-2 focus:ring-indigo-200'>
                                        <SelectValue placeholder='--Select Year--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className={cn('font-bold text-sm', studentScope === 'A' && 'opacity-50')}>Class:</Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => {
                                        setClassId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-9 transition-all hover:border-indigo-400 focus:ring-2 focus:ring-indigo-200'>
                                        <SelectValue placeholder='--Select Class--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className={cn('font-bold text-sm', studentScope === 'A' && 'opacity-50')}>Section:</Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => {
                                        setSectionId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='h-9 transition-all hover:border-indigo-400 focus:ring-2 focus:ring-indigo-200'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Date:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className='h-9 w-full justify-start border-gray-300 text-left font-normal hover:border-indigo-400'>
                                            <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate}
                                            onDayClick={(date) => {
                                                if (date) setSelectedDate(date);
                                                setDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='relative grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Student:{studentScope === 'I' && <span className='text-red-500'>*</span>}
                                </Label>
                                <div className='relative'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='group relative'>
                                                <input
                                                    disabled={!academicYearId}
                                                    value={studentId !== null ? selectedStudentName || searchQuery : searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        if (studentId) {
                                                            setStudentId(null);
                                                            setSelectedStudentName('');
                                                        }
                                                        setStudentOpen(true);
                                                    }}
                                                    onFocus={() => setStudentOpen(true)}
                                                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-all hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50'
                                                    placeholder='Search Student... (min 2 chars)'
                                                />
                                                {studentId && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='-translate-y-1/2 absolute top-1/2 right-2 h-6 w-6 p-0 hover:bg-gray-100'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStudentId(null);
                                                            setSelectedStudentName('');
                                                            setSearchQuery('');
                                                        }}>
                                                        <RotateCcw className='h-3 w-3 text-gray-400' />
                                                    </Button>
                                                )}
                                                {searchIsLoading && (
                                                    <div className='-translate-y-1/2 absolute top-1/2 right-8'>
                                                        <Loader2 className='h-4 w-4 animate-spin text-indigo-500' />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className='w-[400px] border-indigo-100 p-0 shadow-2xl'
                                            align='start'
                                            onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='w-full'>
                                                <CommandList>
                                                    {searchIsLoading && (
                                                        <div className='flex items-center justify-center space-x-2 p-4 text-center text-muted-foreground text-sm'>
                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                            <span>Searching students...</span>
                                                        </div>
                                                    )}
                                                    {!searchIsLoading && searchQuery.length > 0 && searchQuery.length < 2 && (
                                                        <div className='bg-amber-50 p-4 text-center text-amber-600 text-sm'>
                                                            Enter at least 2 characters
                                                        </div>
                                                    )}
                                                    <CommandEmpty>
                                                        {!searchIsLoading && searchQuery.length >= 2 ? 'No students found.' : ''}
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {studentListFromSearch.map((s: any, idx: number) => {
                                                            const sId = s.amsT_Id || s.amst_Id;
                                                            return (
                                                                <CommandItem
                                                                    key={`${sId}-${idx}`}
                                                                    value={sId.toString()}
                                                                    onSelect={() => {
                                                                        const sName =
                                                                            s.studentname ||
                                                                            s.studentName ||
                                                                            [
                                                                                s.amsT_FirstName || s.AMST_FirstName || '',
                                                                                s.amsT_MiddleName || s.AMST_MiddleName || '',
                                                                                s.amsT_LastName || s.AMST_LastName || ''
                                                                            ]
                                                                                .filter(Boolean)
                                                                                .join(' ');
                                                                        const fullName = sName.replace(/\s+/g, ' ').trim();
                                                                        setStudentId(sId);
                                                                        setSelectedStudentName(fullName);
                                                                        setSearchQuery(fullName);
                                                                        setStudentOpen(false);
                                                                    }}
                                                                    className='aria-selected:bg-indigo-50'>
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4 text-indigo-600',
                                                                            studentId === sId ? 'opacity-100' : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    <div className='flex flex-col'>
                                                                        <span className='font-medium'>
                                                                            {s.studentname ||
                                                                                s.studentName ||
                                                                                [
                                                                                    s.amsT_FirstName || s.AMST_FirstName || '',
                                                                                    s.amsT_MiddleName || s.AMST_MiddleName || '',
                                                                                    s.amsT_LastName || s.AMST_LastName || ''
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(' ')}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-6 border-t pt-8'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={detailsMutation.isPending}
                            className='w-40 rounded-xl bg-indigo-600 font-bold text-white tracking-wide shadow-lg transition-all hover:scale-105 hover:bg-indigo-700'>
                            {detailsMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Printer className='mr-2 h-4 w-4' />
                            )}
                            REPORT
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={handleReset}
                            className='w-40 rounded-xl border-2 border-orange-200 font-bold text-orange-600 tracking-wide shadow-md transition-all hover:scale-105 hover:border-orange-300 hover:bg-orange-50'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            className='w-40 rounded-xl bg-zinc-800 font-bold text-white tracking-wide shadow-lg transition-all hover:scale-105 hover:bg-zinc-900 disabled:scale-100 disabled:opacity-50'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showCertificate && reportData && (
                <div className='mt-8 flex flex-col items-center overflow-auto rounded-2xl border-2 bg-gray-50 p-4 md:p-8'>
                    <div ref={printRef} className='printable-content min-h-[297mm] w-full max-w-[210mm] bg-white p-0 shadow-2xl'>
                        {reportData.studentList?.map((student: any, index: number) => (
                            <div
                                key={index}
                                className='certificate-page relative flex flex-col p-0'
                                style={{ width: '210mm', height: '297mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                {/* Border Container */}
                                <div className='absolute inset-[10mm] flex flex-col border-[2px] border-black p-[5mm]'>
                                    {/* Header Image */}
                                    <div className='mb-6 w-full'>
                                        <img
                                            src='https://vapsclg.blob.core.windows.net/files/3/InstitutionLogo/14d7d69c-901d-4b63-b102-7e3ee5ab79f6.jpg'
                                            alt='Institution Logo'
                                            className='h-auto w-full object-contain'
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className='mb-10 text-center'>
                                        <h1 className='font-black text-3xl underline decoration-2 underline-offset-8'>
                                            BONAFIDE CERTIFICATE
                                        </h1>
                                    </div>

                                    {/* Student Info Row 1 
                                    <div className="flex justify-between items-start text-lg font-bold mb-8 px-4">
                                        <div className="flex flex-col space-y-1">
                                            <span>Sr. NO: ________________</span>
                                        </div>
                                    </div>*/}

                                    {/* Student Info Row 2 */}
                                    <div className='mb-12 grid grid-cols-2 gap-x-12 gap-y-6 px-4 font-bold text-base'>
                                        <div className='flex items-end'>
                                            Admn. No.:{' '}
                                            <span className='ml-2 flex-1 border-black border-b border-dotted px-2'>{student.admno}</span>
                                        </div>
                                        <div className='flex items-end justify-end'>
                                            Date:{' '}
                                            <span className='ml-2 border-black border-b border-dotted px-2'>
                                                {format(selectedDate, 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                        <div className='flex items-end'>
                                            PEN. NO.:{' '}
                                            <span className='ml-2 flex-1 border-black border-b border-dotted px-2'>{student.penno}</span>
                                        </div>
                                        <div />
                                        <div className='flex items-end'>
                                            APAAR No:{' '}
                                            <span
                                                className='ml-2 min-w-[120px] flex-1 border-black border-b border-dotted px-2'
                                                contentEditable></span>
                                        </div>
                                        <div />
                                    </div>

                                    {/* Main Body */}
                                    <div className='mt-8 flex-1 px-8 text-justify text-lg leading-loose'>
                                        <p className='indent-20'>
                                            Certified that {student.gen}{' '}
                                            <span className='px-1 font-black text-xl uppercase'>{student.studentname}</span>{' '}
                                            {student.gender3} of Sri
                                            <span className='px-1 font-black uppercase'> {student.fathername} </span>was / has been a
                                            bonafide student of this institution from / since
                                            <span className='px-1 font-bold'>{student.joinedyear}</span> to{' '}
                                            <span className='px-1 font-bold'>{student.presentyear}</span> and in classes from
                                            <span className='px-1 font-bold'>{student.joinedclass}</span> to{' '}
                                            <span className='px-1 font-bold'>{student.presentclass}</span>.
                                            <span className='ml-1 px-1 font-bold'>{student.gender1}</span> possessed / possesses{' '}
                                            <span className='px-1 font-black'>Good</span> conduct during
                                            <span className='px-1 font-bold'> {student.gender2} </span> stay in the institution.
                                        </p>
                                        <p className='mt-12'>
                                            <span className='font-bold'>{student.gender2}</span> date of birth as per school records is
                                            <span className='px-2 font-black underline decoration-dotted underline-offset-4'>
                                                {student.lbldob ? format(new Date(student.lbldob), 'dd/MM/yyyy') : '        '}
                                            </span>
                                            in words <span className='px-2 font-black font-serif italic'>"{student.lbldobwords}"</span>
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className='mt-auto pr-12 pb-16 text-right'>
                                        <div className='mr-8 inline-block text-center'>
                                            <p className='mb-1 font-black text-xl'>PRINCIPAL</p>
                                            <p className='border-black border-t px-8 pt-1 text-sm'>Signature & School Seal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .printable-content {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .certificate-page {
                        border: none !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        overflow: hidden !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
