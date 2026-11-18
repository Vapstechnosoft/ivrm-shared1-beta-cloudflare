'use client';

import { useDebounce } from '@/hooks/utils/use-debounce';
import { format } from 'date-fns';
import { CalendarIcon, Check, FileText, Loader2, Printer, RotateCcw, X } from 'lucide-react';
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
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useGDARSStudyCertDetails,
    useGDARSStudyCertLoadData,
    useGDARSStudyCertSearchFilter
} from '@/hooks/admission/preadmission/reports/useGnanadeepaStudyCertificate';

export default function GDARSStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Data Hooks -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useGDARSStudyCertLoadData();
    const searchMutation = useGDARSStudyCertSearchFilter();
    const detailsMutation = useGDARSStudyCertDetails();

    /* -------------------- Form State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L'>('S');
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    /* -------------------- UI State -------------------- */
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    /* -------------------- Masters Data -------------------- */
    const yearList = loadData?.data?.allAcademicYear || loadData?.allAcademicYear || [];
    const classList = loadData?.data?.allclasslist || loadData?.allclasslist || [];
    const sectionList = loadData?.data?.allsectionlist || loadData?.allsectionlist || [];

    /* -------------------- Search Logic -------------------- */
    useEffect(() => {
        const fetchStudents = async () => {
            if (!academicYearId || debouncedSearch.length < 2) {
                setStudentListFromSearch([]);
                return;
            }

            try {
                const res = await searchMutation.mutateAsync({
                    ASMAY_Id: academicYearId,
                    AMST_SOL: studentStatus,
                    ASMCL_Id: studentScope === 'A' ? 0 : classId || 0,
                    ASMC_Id: studentScope === 'A' ? 0 : sectionId || 0,
                    searchfilter: debouncedSearch,
                    allorindid: studentScope,
                    filterinitialdata: studentStatus
                });

                const list = res?.data?.fillstudlist || res?.fillstudlist || res?.data?.studentlist || res?.studentlist || [];
                setStudentListFromSearch(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error('Search error:', error);
                setStudentListFromSearch([]);
            }
        };

        fetchStudents();
    }, [debouncedSearch, academicYearId, studentStatus, classId, sectionId, studentScope]);

    /* -------------------- Report Handlers -------------------- */
    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Please select Academic Year');
            return;
        }
        if (studentScope === 'I' && !studentId) {
            toast.error('Please select a student');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: studentScope === 'A' ? 0 : classId || 0,
            ASMC_Id: studentScope === 'A' ? 0 : sectionId || 0,
            AMST_Id: studentId || 0
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            console.log('Report Response:', res);
            const reportResult = res?.data || res;
            const dataList = reportResult?.studentlist || reportResult?.studenttcdetails || reportResult?.fillstudlist || [];
            if (reportResult && Array.isArray(dataList) && dataList.length > 0) {
                // Ensure studentlist is present for the mapping in JSX
                if (!reportResult.studentlist) reportResult.studentlist = dataList;
                setReportData(reportResult);
                setShowReport(true);
            } else {
                toast.error('No records found');
                setShowReport(false);
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
        setSelectedDate(null);
        setSelectedStudentName('');
        setShowReport(false);
        setReportData(null);
        window.location.reload();
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'GDARS_Study_Certificate'
    });

    return (
        <div className='min-h-screen space-y-6 bg-slate-50/30 p-4'>
            <CollapsibleSection
                title='Study Certificate Report'
                description='Generate study cum conduct certificates for Gnana Deepa Academy students'
                defaultOpen={true}
                variant='outline'
                className='border-indigo-100 shadow-md'>
                <div className='space-y-8 rounded-b-xl bg-white p-6'>
                    {/* Top Selectors Row */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        <SelectionBox label='Selection Scope'>
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
                                <RadioItem id='scope-all' value='A' label='All' />
                                <RadioItem id='scope-ind' value='I' label='Individual' />
                            </RadioGroup>
                        </SelectionBox>

                        <SelectionBox label='Student Status'>
                            <RadioGroup
                                value={studentStatus}
                                onValueChange={(v) => {
                                    setStudentStatus(v as any);
                                    setStudentId(null);
                                    setSearchQuery('');
                                }}
                                className='flex space-x-6'>
                                <RadioItem id='status-studying' value='S' label='Studying' />
                                <RadioItem id='status-left' value='L' label='Left' />
                            </RadioGroup>
                        </SelectionBox>

                        <SelectionBox label='Certificate Type'>
                            <RadioGroup value='0' className='flex space-x-6'>
                                <RadioItem id='cert0' value='0' label='Study Certificate' />
                            </RadioGroup>
                        </SelectionBox>
                    </div>

                    {/* Filters Grid */}
                    <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-5'>
                            <div className='flex flex-col space-y-2'>
                                <Label className='font-semibold text-slate-700 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={academicYearId?.toString()}
                                    onValueChange={(v) => {
                                        setAcademicYearId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='border-slate-200 bg-white'>
                                        <SelectValue placeholder='--Select Year--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(yearList) &&
                                            yearList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col space-y-2'>
                                <Label className={cn('font-semibold text-sm', studentScope === 'A' ? 'text-slate-400' : 'text-slate-700')}>
                                    Class
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => {
                                        setClassId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='border-slate-200 bg-white'>
                                        <SelectValue placeholder='--Select Class--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(classList) &&
                                            classList.map((item: any) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col space-y-2'>
                                <Label className={cn('font-semibold text-sm', studentScope === 'A' ? 'text-slate-400' : 'text-slate-700')}>
                                    Section
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => {
                                        setSectionId(Number(v));
                                        setStudentId(null);
                                        setSearchQuery('');
                                    }}>
                                    <SelectTrigger className='border-slate-200 bg-white'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(sectionList) &&
                                            sectionList.map((item: any) => (
                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-5'>
                            <div className='flex flex-col space-y-2'>
                                <Label className='font-semibold text-slate-700 text-sm'>
                                    Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className='w-full justify-start border-slate-200 bg-white text-left font-normal transition-colors hover:bg-slate-50'>
                                            <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate || undefined}
                                            onDayClick={(date) => {
                                                if (date) setSelectedDate(date);
                                                setDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='relative flex flex-col space-y-2'>
                                <Label className={cn('font-semibold text-sm', studentScope === 'A' ? 'text-slate-400' : 'text-slate-700')}>
                                    Student {studentScope === 'I' && <span className='text-red-500'>*</span>}
                                </Label>
                                <div className='relative'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='group relative'>
                                                <input
                                                    disabled={!academicYearId || studentScope === 'A'}
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
                                                    className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400'
                                                    placeholder={
                                                        studentScope === 'A'
                                                            ? "Disabled for 'All' scope"
                                                            : 'Search Student... (min 2 chars)'
                                                    }
                                                />
                                                {studentId && (
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setStudentId(null);
                                                            setSelectedStudentName('');
                                                            setSearchQuery('');
                                                        }}
                                                        className='-translate-y-1/2 absolute top-1/2 right-3 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'>
                                                        <X className='h-4 w-4' />
                                                    </button>
                                                )}
                                                {searchMutation.isPending && (
                                                    <div className='-translate-y-1/2 absolute top-1/2 right-10'>
                                                        <Loader2 className='h-4 w-4 animate-spin text-indigo-500' />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className='w-[450px] rounded-lg border-indigo-50 p-0 shadow-2xl'
                                            align='start'
                                            onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='w-full'>
                                                <CommandList>
                                                    {searchMutation.isPending && (
                                                        <div className='flex items-center justify-center space-x-3 p-6 text-center text-slate-500 text-sm'>
                                                            <Loader2 className='h-5 w-5 animate-spin text-indigo-600' />
                                                            <span>Searching student database...</span>
                                                        </div>
                                                    )}
                                                    {!searchMutation.isPending && searchQuery.length > 0 && searchQuery.length < 2 && (
                                                        <div className='bg-amber-50/50 p-4 text-center text-amber-600 text-sm'>
                                                            Please enter at least 2 characters
                                                        </div>
                                                    )}
                                                    <CommandEmpty className='p-6 text-center text-slate-400 italic'>
                                                        No matching students found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {studentListFromSearch.map((s: any, idx: number) => {
                                                            const sId = s.amsT_Id || s.amst_Id;
                                                            const sName = s.studentname || s.amsT_FirstName || s.studentnam || '';
                                                            return (
                                                                <CommandItem
                                                                    key={`${sId}-${idx}`}
                                                                    value={sId.toString()}
                                                                    onSelect={() => {
                                                                        setSelectedStudentName(sName);
                                                                        setStudentId(sId);
                                                                        setSearchQuery(sName);
                                                                        setStudentOpen(false);
                                                                    }}
                                                                    className='cursor-pointer px-4 py-3 transition-colors hover:bg-indigo-50/50 aria-selected:bg-indigo-50'>
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-3 h-4 w-4 text-indigo-600',
                                                                            studentId === sId ? 'opacity-100' : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    <div className='flex flex-col'>
                                                                        <span className='font-semibold text-slate-700 uppercase tracking-tight'>
                                                                            {sName}
                                                                        </span>
                                                                        <div className='mt-0.5 flex items-center space-x-2 text-[10px] text-slate-400'>
                                                                            <span className='rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-600 uppercase'>
                                                                                {s.asmcL_ClassName || s.ASMCL_ClassName}
                                                                            </span>
                                                                        </div>
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
                    <div className='flex flex-wrap justify-center gap-6 border-slate-100 border-t pt-10'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={detailsMutation.isPending}
                            className='h-12 min-w-[160px] rounded-xl bg-indigo-600 font-bold text-white tracking-tight shadow-indigo-200 shadow-lg transition-all hover:scale-[1.02] hover:bg-indigo-700 active:scale-95'>
                            {detailsMutation.isPending ? (
                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                            ) : (
                                <FileText className='mr-2 h-5 w-5' />
                            )}
                            GENERATE REPORT
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={handleReset}
                            className='h-12 min-w-[160px] rounded-xl border-2 border-slate-100 font-bold text-slate-500 shadow-sm transition-all hover:border-slate-200 hover:bg-slate-50'>
                            <RotateCcw className='mr-2 h-5 w-5' />
                            RESET
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='h-12 min-w-[160px] rounded-xl bg-slate-800 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-slate-900 active:scale-95'>
                            <Printer className='mr-2 h-5 w-5' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showReport && reportData && (
                <div className='mt-8 flex flex-col items-center overflow-auto rounded-3xl border border-slate-200 bg-slate-100/50 p-6 shadow-inner md:p-12'>
                    <div ref={printRef} className='printable-content w-full max-w-[210mm] bg-white shadow-2xl'>
                        {reportData.studentlist?.map((student: any, index: number) => (
                            <div
                                key={index}
                                className='certificate-page relative flex flex-col items-center bg-white p-0'
                                style={{ width: '210mm', minHeight: '297mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                {/* Main Layout Container */}
                                <div className='w-full p-12'>
                                    {/* Header Section */}
                                    <div className='mb-2 flex items-start justify-between'>
                                        <div className='flex-1 pr-6'>
                                            <h1
                                                className='mb-2 font-extrabold text-3xl text-[#1e293b] uppercase leading-tight'
                                                style={{ fontSize: '27px' }}>
                                                Gnana Deepa Academy Residential School
                                            </h1>
                                            <p className='max-w-md font-medium text-slate-500 text-sm italic' style={{ fontSize: '15px' }}>
                                                Maligenahalli, Bidaluru(P), Devanahalli(Tq), Bengaluru rural-562110
                                            </p>
                                        </div>
                                        {student.photopath && (
                                            <div className='flex-shrink-0'>
                                                <div className='h-[170px] w-[150px] border border-slate-200 p-1 shadow-sm'>
                                                    <img
                                                        src={student.photopath}
                                                        alt='Student Photo'
                                                        className='h-full w-full object-cover'
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider and Subtitle */}
                                    <div className='my-6 h-0.5 w-full bg-slate-300'></div>
                                    <div className='mb-10 text-center'>
                                        <h2 className='font-black text-2xl text-slate-800 uppercase tracking-widest underline decoration-2 underline-offset-8'>
                                            STUDY CUM CONDUCT CERTIFICATE
                                        </h2>
                                    </div>

                                    {/* Data Table */}
                                    <div className='w-full border-2 border-slate-800'>
                                        <table className='w-full border-collapse'>
                                            <tbody>
                                                <ReportRow
                                                    no='01'
                                                    label='Admission Number and Date'
                                                    value={`${student.admNo || ''} and ${selectedDate ? format(selectedDate, 'dd-MM-yyyy') : ''}`}
                                                />
                                                <ReportRow no='02' label='SATS ID' value={student.AMST_RegistrationNo || ''} />
                                                <ReportRow
                                                    no='03'
                                                    label='STUDENT NAME'
                                                    value={student.studentnam || student.studentname || ''}
                                                    bold
                                                />
                                                <ReportRow
                                                    no='04'
                                                    label='FATHER NAME'
                                                    value={student.fatherName || student.fathername || ''}
                                                />
                                                <ReportRow no='05' label='MOTHER NAME' value={student.mothername || ''} />
                                                <ReportRow
                                                    no='06'
                                                    label='Class'
                                                    value={`${student.PresentClass || ''} (${student.acadamicyear || ''})`}
                                                />
                                                <ReportRow
                                                    no='07'
                                                    label='Date of Birth in Numbers and Words'
                                                    value={`${student.dob ? format(new Date(student.dob), 'dd-MM-yyyy') : ''} (${student.dobwords || ''})`}
                                                />
                                                <ReportRow
                                                    no='08'
                                                    label='Caste'
                                                    value={`${student.IVRMMC_Nationality || ''}, ${student.religion || ''}, ${student.caste_name || ''}, (${student.IMCC_CategoryName || ''})`}
                                                />
                                                <ReportRow
                                                    no='09'
                                                    label='Address'
                                                    value={`${student.street || ''}, ${student.city || ''}`}
                                                />
                                                <ReportRow no='10' label='Conduct and Character' value='SATISFACTORY' />
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Signatures */}
                                    <div className='mt-40 flex items-end justify-between px-4'>
                                        <div className='text-center'>
                                            <p className='mb-1 inline-block border-white border-b font-extrabold text-slate-800 transition-colors hover:border-slate-800'>
                                                Entered by
                                            </p>
                                        </div>
                                        <div className='text-center'>
                                            <div className='mb-4'>{/* Space for Seal */}</div>
                                            <p className='font-black text-lg text-slate-800 uppercase tracking-wider'>Principal</p>
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
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .printable-content {
                        box-shadow: none !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .certificate-page {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
}

/* -------------------- Sub-Components -------------------- */

function SelectionBox({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className='flex flex-col space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm'>
            <Label className='font-bold text-[11px] text-slate-400 uppercase tracking-widest'>{label}</Label>
            <div className='flex h-full items-center'>{children}</div>
        </div>
    );
}

function RadioItem({ id, value, label }: { id: string; value: string; label: string }) {
    return (
        <div className='flex items-center space-x-2.5'>
            <RadioGroupItem value={value} id={id} className='border-slate-300 text-indigo-600 focus:ring-indigo-50' />
            <Label htmlFor={id} className='cursor-pointer font-semibold text-slate-600 text-sm'>
                {label}
            </Label>
        </div>
    );
}

function ReportRow({ no, label, value, bold = false }: { no: string; label: string; value: string; bold?: boolean }) {
    return (
        <tr className='border-slate-800 border-b transition-colors last:border-0 hover:bg-slate-50'>
            <td className='w-12 border-slate-800 border-r py-4 text-center font-bold text-slate-700'>{no}</td>
            <td className='w-1/3 border-slate-800 border-r px-6 py-4 font-semibold text-[13px] text-slate-600 uppercase'>{label}</td>
            <td className={cn('px-6 py-4 text-[14px] text-slate-800', bold ? 'font-black' : 'font-medium')}>{value}</td>
        </tr>
    );
}
