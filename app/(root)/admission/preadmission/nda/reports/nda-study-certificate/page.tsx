'use client';

import { format } from 'date-fns';
import { CalendarIcon, Check, FileSpreadsheet, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
    useNdaStudyCertDetails,
    useNdaStudyCertLoadData,
    useNdaStudyCertSearchFilter
} from '@/hooks/admission/preadmission/reports/useNdaStudyCertificate';

/* ========================================================================= */
/* Helpers for formatting */
/* ========================================================================= */
function getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

const CertificateTemplate = ({ data, selectedDate }: { data: any; selectedDate: Date | null }) => {
    if (!data || !(data.studentList || data.studentlist) || (data.studentList || data.studentlist).length === 0) return null;

    const student = (data.studentList || data.studentlist)[0];

    // Student Info
    const studentName = student.studentnam || student.studentName || '';
    const fatherName = student.fathername || student.fatherName || '';
    const motherName = student.mothername || student.motherName || '';
    const joinedClass = student.joinedclass || student.JoinedClass || student.class || '';
    const presentClass = student.presentclass || student.PresentClass || student.class || '';
    const joinedYear = student.joinedyear || student.JoinedYear || student.acadamicyear || '';
    const presentYear = student.presentyear || student.PresentYear || student.acadamicyear || '';

    // Gender mapping
    const isFemale = student.AMST_Sex?.toLowerCase() === 'female';
    const sonOf = isFemale ? 'D/o' : 'S/o';
    const gender2 = isFemale ? 'Her' : 'His';

    // DOB Parsing
    const dobDate = new Date(student.dob);
    const dobDay = dobDate.getDate();
    const dobMonth = format(dobDate, 'MMMM').toUpperCase();
    const dobYear = dobDate.getFullYear();
    const dobSuffix = getOrdinalSuffix(dobDay);

    // Selected Date Parsing
    const currDate = selectedDate || new Date();
    const currDay = currDate.getDate();
    const currMonth = format(currDate, 'MMMM').toUpperCase();
    const currYear = currDate.getFullYear();
    const currSuffix = getOrdinalSuffix(currDay);

    return (
        <div
            className='certificate-print mx-auto w-full max-w-[800px] bg-white p-12 text-black'
            style={{ fontFamily: 'Times New Roman, serif' }}>
            <div style={{ marginTop: '50px' }}>
                <div className='date' style={{ textAlign: 'right', fontSize: '18px' }}>
                    <strong>
                        {currDay}&nbsp;<sup>{currSuffix}</sup>&nbsp;{currMonth}&nbsp;{currYear}
                    </strong>
                    .
                </div>

                <h3 className='mt-8 mb-8 text-center font-bold text-2xl underline underline-offset-4'>STUDY CERTIFICATE</h3>

                <div className='row'>
                    <div className='box-body'>
                        <div className='certificate' style={{ fontSize: '20px', lineHeight: '2' }}>
                            <p className='mb-6 text-justify'>
                                This is to certify that <strong>{studentName}</strong>, {sonOf} Mr. <strong>{fatherName}</strong> & Mrs.{' '}
                                <strong>{motherName}</strong> was a bonafide from Class <b>{joinedClass}</b> to Class <b>{presentClass}</b>{' '}
                                in our Institution from <b>{joinedYear}</b> to <b>{presentYear}</b> academic years.
                            </p>

                            <p className='text-justify'>
                                As per our school record {gender2.toLowerCase()} date of birth is{' '}
                                <strong>
                                    {dobDay}&nbsp;<sup>{dobSuffix}</sup>&nbsp;{dobMonth}&nbsp;{dobYear}
                                </strong>
                                .
                            </p>
                            <br />

                            <div className='signature mt-16'>
                                <p style={{ textAlign: 'right' }}>Yours sincerely,</p>
                                <br />
                                <br />
                                <p className='principal' style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    Sr. Sandhya, S.N.D
                                </p>
                                <p style={{ textAlign: 'right', marginRight: '24px' }}>Principal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Print styles */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0 !important; /* Removes default browser header/footer URLs */
                        }
                        body {
                            visibility: hidden !important;
                            background: white !important;
                        }
                        .certificate-print, .certificate-print * {
                            visibility: visible !important;
                            color: black !important;
                        }
                        .certificate-print {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            box-shadow: none !important;
                            padding: 20mm !important; /* Replaces the lost page margin */
                            margin: 0 !important;
                        }
                    }
                `
                }}
            />
        </div>
    );
};
CertificateTemplate.displayName = 'CertificateTemplate';

/* ========================================================================= */
/* Main Page Component */
/* ========================================================================= */
export default function NdaStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    const { data: loadData } = useNdaStudyCertLoadData();

    // Form State
    const [studentScope, setStudentScope] = useState<'A' | 'indid'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L'>('S');
    const [certificateType, setCertificateType] = useState<'0'>('0'); // Bonafide Certificate

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);

    // Date State
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dateOpen, setDateOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    // Output State
    const [showCertificate, setShowCertificate] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);

    const searchMutation = useNdaStudyCertSearchFilter();
    const studyReportMutation = useNdaStudyCertDetails();

    // Default selection for Academic Year based on loaded data
    useEffect(() => {
        if (loadData?.data?.allAcademicYear && !academicYearId) {
            // Find the current academic year, e.g., the one with NewAdmissionFlg true, or the latest order, or fallback to first
            const currentYear =
                loadData.data.allAcademicYear.find((y: any) => y.asmaY_NewAdmissionFlg === true) || loadData.data.allAcademicYear[0];
            if (currentYear) {
                setAcademicYearId(currentYear.asmaY_Id);
            }
        }
    }, [loadData, academicYearId]);

    // Debounced Search Effect
    useEffect(() => {
        if (!academicYearId) {
            setStudentListFromSearch([]);
            return;
        }

        const needsSearchQuery = studentScope === 'A';
        const hasClassSection = studentScope === 'indid' && classId && sectionId;

        if (needsSearchQuery && searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        if (studentScope === 'indid' && !hasClassSection && searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            searchMutation.mutate(
                {
                    ASMAY_Id: Number(academicYearId),
                    AMST_SOL: studentStatus,
                    ASMCL_Id: classId ?? 0,
                    ASMC_Id: sectionId ?? 0,
                    searchfilter: searchQuery,
                    allorindid: studentScope === 'A' ? 'A' : 'I'
                },
                {
                    onSuccess: (response: any) => {
                        const list =
                            response?.data?.fillstudlist ||
                            response?.data?.studentlist ||
                            response?.data ||
                            response?.studentList ||
                            response ||
                            [];
                        setStudentListFromSearch(Array.isArray(list) ? list : []);
                    }
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus, classId, sectionId, studentScope]);

    const students = studentListFromSearch.map((s: any) => ({
        ...s,
        studentName:
            s.studentName || s.amsT_FirstName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
    }));

    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (studentScope === 'indid' && !classId) {
            toast.error('Select Class');
            return;
        }
        if (studentScope === 'indid' && !sectionId) {
            toast.error('Select Section');
            return;
        }
        if (!selectedDate) {
            toast.error('Select Date');
            return;
        }
        if (!studentId) {
            toast.error('Select Student');
            return;
        }

        try {
            setShowCertificate(false);
            setStudentData(null);

            const res = await studyReportMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                ASMCL_Id: classId ?? 0,
                ASMC_Id: sectionId ?? 0,
                AMST_Id: studentId
            });

            const studentListResult = res?.data?.studentList ?? res?.data?.studentlist ?? [];

            if (studentListResult.length > 0) {
                setStudentData(res.data);
                setShowCertificate(true);
            } else {
                toast.error('Record not found');
            }
        } catch (error) {
            toast.error('Failed to load report data');
        }
    };

    const handleReset = () => {
        setStudentScope('A');
        setStudentStatus('S');
        setCertificateType('0');
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchQuery('');
        setStudentListFromSearch([]);
        setSelectedDate(new Date());
        setShowCertificate(false);
        setStudentData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'NDA_Study_Certificate'
    });

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Bonafide Certificate Report'
                description='Generate Bonafide/Study Certificate'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='flex items-center justify-center space-x-4 rounded-lg border bg-gray-50/50 p-4'>
                            <RadioGroup
                                value={studentScope}
                                onValueChange={(v) => {
                                    setStudentScope(v as any);
                                    if (v === 'A') {
                                        setClassId(null);
                                        setSectionId(null);
                                    }
                                }}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='scope-all' />
                                    <Label htmlFor='scope-all' className='cursor-pointer font-medium'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='indid' id='scope-ind' />
                                    <Label htmlFor='scope-ind' className='cursor-pointer font-medium'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center justify-center space-x-4 rounded-lg border bg-gray-50/50 p-4'>
                            <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='status-studying' />
                                    <Label htmlFor='status-studying' className='cursor-pointer font-medium'>
                                        Studying
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='L' id='status-left' />
                                    <Label htmlFor='status-left' className='cursor-pointer font-medium'>
                                        Left
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center justify-center space-x-4 rounded-lg border bg-gray-50/50 p-4'>
                            <RadioGroup
                                value={certificateType}
                                onValueChange={(v) => setCertificateType(v as any)}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='type-bonafide' />
                                    <Label htmlFor='type-bonafide' className='cursor-pointer font-medium'>
                                        Bonafide Certificate
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Inputs Row */}
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString() || ''} onValueChange={(v) => setAcademicYearId(Number(v))}>
                                    <SelectTrigger className='h-9 bg-white'>
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

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    Class:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString() || ''}
                                    onValueChange={(v) => setClassId(Number(v))}>
                                    <SelectTrigger className='h-9 bg-white'>
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

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={sectionId?.toString() || ''}
                                    onValueChange={(v) => setSectionId(Number(v))}>
                                    <SelectTrigger className='h-9 bg-white'>
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

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    Date:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-9 w-full justify-start bg-white text-left font-normal'>
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

                            <div className='relative grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    Student:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='w-full space-y-1'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='relative w-full'>
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
                                                    className='flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                                    placeholder='Select or search Student...'
                                                />
                                                {studentId && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='absolute top-0 right-0 h-9 w-9 p-0'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStudentId(null);
                                                            setSearchQuery('');
                                                        }}>
                                                        <RotateCcw className='h-4 w-4 text-gray-500' />
                                                    </Button>
                                                )}
                                                {searchMutation.isPending && (
                                                    <div className='absolute top-2 right-8'>
                                                        <Loader2 className='h-4 w-4 animate-spin text-indigo-500' />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className='w-[400px] border border-gray-200 p-0 shadow-lg'
                                            align='start'
                                            onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='w-full'>
                                                <CommandList className='max-h-60'>
                                                    {searchMutation.isPending && (
                                                        <div className='p-4 text-center text-muted-foreground text-sm'>
                                                            Searching students...
                                                        </div>
                                                    )}
                                                    {!searchMutation.isPending &&
                                                        studentScope === 'A' &&
                                                        searchQuery.length > 0 &&
                                                        searchQuery.length < 3 && (
                                                            <div className='p-4 text-center text-muted-foreground text-sm'>
                                                                Enter at least 3 characters
                                                            </div>
                                                        )}
                                                    {!searchMutation.isPending &&
                                                        studentScope === 'indid' &&
                                                        (!classId || !sectionId) &&
                                                        searchQuery.length > 0 &&
                                                        searchQuery.length < 3 && (
                                                            <div className='p-4 text-center text-muted-foreground text-sm'>
                                                                Select Class & Section or enter 3 characters
                                                            </div>
                                                        )}
                                                    <CommandEmpty>
                                                        {!searchMutation.isPending &&
                                                        ((studentScope === 'A' && searchQuery.length >= 3) ||
                                                            (studentScope === 'indid' && classId && sectionId))
                                                            ? 'No students found.'
                                                            : ''}
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {students.map((s: any, idx: number) => (
                                                            <CommandItem
                                                                key={`${s.amsT_Id || 's'}-${idx}`}
                                                                value={s.studentName}
                                                                onSelect={() => {
                                                                    setStudentId(s.amsT_Id);
                                                                    setSearchQuery(s.studentName);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className='cursor-pointer'>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        studentId === s.amsT_Id
                                                                            ? 'text-indigo-600 opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div className='flex flex-col'>
                                                                    <span className='font-medium'>{s.studentName}</span>
                                                                    <span className='text-[11px] text-muted-foreground'>
                                                                        Adm No: {s.amsT_AdmNo} | Class: {s.asmcL_ClassName || 'N/A'} -{' '}
                                                                        {s.asmC_SectionName || 'N/A'}
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
                    </div>

                    <hr className='my-6' />

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-4'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={studyReportMutation.isPending}
                            className='min-w-[120px] bg-indigo-600 text-white shadow-md hover:bg-indigo-700'>
                            {studyReportMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <FileSpreadsheet className='mr-2 h-4 w-4' />
                            )}
                            Report
                        </Button>
                        <Button size='sm' variant='destructive' onClick={handleReset} className='min-w-[120px] shadow-md'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button
                            size='sm'
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            className='min-w-[120px] bg-indigo-600 text-white shadow-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Display */}
            {showCertificate && studentData && (
                <div className='mt-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm'>
                    <div className='mx-auto max-w-4xl overflow-x-auto bg-white shadow-md'>
                        <div ref={printRef}>
                            <CertificateTemplate data={studentData} selectedDate={selectedDate} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
