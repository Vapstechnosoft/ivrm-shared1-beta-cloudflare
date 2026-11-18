'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Popover as PopoverRoot } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useChangeBranchDanvantariBonafide,
    useChangeCourseDanvantariBonafide,
    useChangeSemesterDanvantariBonafide,
    useChangeYearDanvantariBonafide,
    useDanvantariBonafideLoadData,
    useDanvantariBonafideReport,
    useDanvantariBonafideSearchFilter
} from '@/hooks/admission/preadmission/reports/useDanvantariBonafideCertificate';

export default function DanvantariBonafideCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useDanvantariBonafideLoadData();

    /* -------------------- UI State -------------------- */
    const [reportType, setReportType] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'D'>('S');
    const [certificateType, setCertificateType] = useState<'1' | '0'>('1'); // 1: Bonafide, 0: Conduct

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [reportDate, setReportDate] = useState<Date>(new Date());
    const [conductText, setConductText] = useState('');
    const [hallTicketNo, setHallTicketNo] = useState('');

    const [studentList, setStudentList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const yearMutation = useChangeYearDanvantariBonafide();
    const courseMutation = useChangeCourseDanvantariBonafide();
    const branchMutation = useChangeBranchDanvantariBonafide();
    const semesterMutation = useChangeSemesterDanvantariBonafide();
    const searchFilterMutation = useDanvantariBonafideSearchFilter();
    const reportMutation = useDanvantariBonafideReport();

    /* -------------------- Data Initialization -------------------- */
    const initialYearList = (loadData as any)?.data?.getyear || (loadData as any)?.data?.academicList1 || [];

    /* -------------------- Dependency Logic -------------------- */
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        setCourseId(null);
        setBranchId(null);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchTerm('');

        try {
            const res = (await yearMutation.mutateAsync({ ASMAY_Id: yearId })) as any;
            setCourseList(Array.isArray(res?.data?.getcourse) ? res?.data?.getcourse : []);
        } catch (error) {
            toast.error('Failed to update courses');
        }
    };

    const handleCourseChange = async (cId: number) => {
        setCourseId(cId);
        setBranchId(null);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);

        try {
            const res = (await courseMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: cId
            })) as any;
            setBranchList(Array.isArray(res?.data?.getbranch) ? res?.data?.getbranch : []);
        } catch (error) {
            toast.error('Failed to update branches');
        }
    };

    const handleBranchChange = async (bId: number) => {
        setBranchId(bId);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);

        try {
            const res = (await branchMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: courseId!,
                AMB_Id: bId
            })) as any;
            setSemesterList(Array.isArray(res?.data?.getsemester) ? res?.data?.getsemester : []);
        } catch (error) {
            toast.error('Failed to update semesters');
        }
    };

    const handleSemesterChange = async (sId: number) => {
        setSemesterId(sId);
        setSectionId(null);
        setStudentId(null);

        try {
            const res = (await semesterMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: courseId!,
                AMB_Id: branchId!,
                AMSE_Id: sId
            })) as any;
            setSectionList(Array.isArray(res?.data?.getsection) ? res?.data?.getsection : []);
        } catch (error) {
            toast.error('Failed to update sections');
        }
    };

    useEffect(() => {
        const fetchStudents = async () => {
            if (searchTerm.length > 2 && academicYearId !== null) {
                try {
                    const res = (await searchFilterMutation.mutateAsync({
                        searchfilter: searchTerm,
                        ASMAY_Id: academicYearId,
                        AMCST_SOL: studentStatus,
                        AMCO_Id: reportType === 'A' ? 0 : courseId || 0,
                        AMB_Id: reportType === 'A' ? 0 : branchId || 0,
                        AMSE_Id: reportType === 'A' ? 0 : semesterId || 0,
                        ACMS_Id: reportType === 'A' ? 0 : sectionId || 0,
                        allorindid: reportType,
                        filterinitialdata: studentStatus
                    })) as any;
                    setStudentList(Array.isArray(res?.data?.getstudentlist) ? res?.data?.getstudentlist : []);
                } catch (error) {
                    console.error('Search failed', error);
                }
            }
        };

        const timeoutId = setTimeout(fetchStudents, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, academicYearId, studentStatus, reportType]);

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        const validationErrors: string[] = [];

        if (!academicYearId) validationErrors.push('Please select Academic Year');
        if (reportType === 'I') {
            if (!courseId) validationErrors.push('Please select Course');
            if (!branchId) validationErrors.push('Please select Branch');
            if (!semesterId) validationErrors.push('Please select Semester');
            if (!sectionId) validationErrors.push('Please select Section');
        }
        if (!reportDate) validationErrors.push('Please select Date');
        if (!studentId) validationErrors.push('Please select Student Name');

        if (validationErrors.length > 0) {
            validationErrors.forEach((msg) => {
                toast.error(msg.toLowerCase(), {
                    id: msg
                });
            });
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            AMCST_SOL: studentStatus,
            AMCO_Id: reportType === 'A' ? 0 : courseId || 0,
            AMB_Id: reportType === 'A' ? 0 : branchId || 0,
            AMSE_Id: reportType === 'A' ? 0 : semesterId || 0,
            ACMS_Id: reportType === 'A' ? 0 : sectionId || 0,
            AMCST_Id: studentId,
            allorindid: reportType
        };

        try {
            const res = (await reportMutation.mutateAsync(payload)) as any;
            const data = res?.data;
            console.log('errrwrwrw', data);
            if (data?.getstudentlist?.length > 0) {
                setReportData(data);
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
        setCourseId(null);
        setBranchId(null);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchTerm('');
        setReportType('A');
        setStudentStatus('S');
        setCertificateType('1');
        setShowReport(false);
        setConductText('');
        setHallTicketNo('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Danvantari_${certificateType === '1' ? 'Bonafide' : 'Conduct'}_Certificate`
    });

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Bonafide Certificate Report'
                description='Generate study and conduct certificates for Danvantari students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Selection Type */}
                        <div className='flex flex-col space-y-2 rounded-lg border bg-gray-50/50 p-4'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Selection Type</Label>
                            <RadioGroup
                                value={reportType}
                                onValueChange={(v) => {
                                    setReportType(v as any);
                                    setCourseId(null);
                                    setBranchId(null);
                                    setSemesterId(null);
                                    setSectionId(null);
                                    setStudentId(null);
                                }}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='sel-all' />
                                    <Label htmlFor='sel-all' className='font-medium text-sm'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='I' id='sel-ind' />
                                    <Label htmlFor='sel-ind' className='font-medium text-sm'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Student Status */}
                        <div className='flex flex-col space-y-2 rounded-lg border bg-gray-50/50 p-4'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Student Status</Label>
                            <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='st-studying' />
                                    <Label htmlFor='st-studying' className='font-medium text-sm'>
                                        Studying
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='D' id='st-deactive' />
                                    <Label htmlFor='st-deactive' className='font-medium text-sm'>
                                        Deactive
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Certificate Type */}
                        <div className='flex flex-col space-y-2 rounded-lg border bg-gray-50/50 p-4'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Certificate For</Label>
                            <RadioGroup
                                value={certificateType}
                                onValueChange={(v) => setCertificateType(v as any)}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='cert-bonafide' />
                                    <Label htmlFor='cert-bonafide' className='font-medium text-sm'>
                                        Bonafide
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='cert-conduct' />
                                    <Label htmlFor='cert-conduct' className='font-medium text-sm'>
                                        Conduct
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column: Cascading Selects */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialYearList.map((item: any) => (
                                            <SelectItem
                                                key={item.asmaY_Id || item.ASMAY_Id}
                                                value={String(item.asmaY_Id ?? item.ASMAY_Id ?? '')}>
                                                {item.asmaY_Year || item.ASMAY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Course:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span>
                                </Label>
                                <Select
                                    disabled={reportType === 'A'}
                                    value={courseId?.toString()}
                                    onValueChange={(v) => handleCourseChange(Number(v))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Course' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseList.map((item: any) => (
                                            <SelectItem
                                                key={item.amcO_Id || item.AMCO_Id}
                                                value={String(item.amcO_Id ?? item.AMCO_Id ?? '')}>
                                                {item.amcO_CourseName || item.AMCO_CourseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Branch:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span>
                                </Label>
                                <Select
                                    disabled={reportType === 'A'}
                                    value={branchId?.toString()}
                                    onValueChange={(v) => handleBranchChange(Number(v))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Branch' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branchList.map((item: any) => (
                                            <SelectItem key={item.amB_Id || item.AMB_Id} value={String(item.amB_Id ?? item.AMB_Id ?? '')}>
                                                {item.amB_BranchName || item.AMB_BranchName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Semester:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span>
                                </Label>
                                <Select
                                    disabled={reportType === 'A'}
                                    value={semesterId?.toString()}
                                    onValueChange={(v) => handleSemesterChange(Number(v))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Semester' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map((item: any) => (
                                            <SelectItem
                                                key={item.amsE_Id || item.AMSE_Id}
                                                value={String(item.amsE_Id ?? item.AMSE_Id ?? '')}>
                                                {item.amsE_SEMName || item.AMSE_SEMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Section:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span>
                                </Label>
                                <Select
                                    disabled={reportType === 'A'}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => setSectionId(Number(v))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem
                                                key={item.acmS_Id || item.ACMS_Id}
                                                value={String(item.acmS_Id ?? item.ACMS_Id ?? '')}>
                                                {item.acmS_SectionName || item.ACMS_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column: Other inputs */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Date:<span className='text-red-500'>*</span>
                                </Label>
                                <PopoverRoot>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'h-9 w-full justify-start text-left font-normal',
                                                !reportDate && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {reportDate ? format(reportDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={reportDate}
                                            onSelect={(date) => date && setReportDate(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </PopoverRoot>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            role='combobox'
                                            className={cn(
                                                'h-9 w-full justify-between border-input bg-white font-normal',
                                                studentId === null && 'text-muted-foreground'
                                            )}>
                                            <span className='truncate pr-2'>
                                                {studentId !== null
                                                    ? studentList.find((s: any) => (s.amcsT_Id ?? s.AMCST_Id) === studentId)?.studentname ||
                                                      studentList.find((s: any) => (s.amcsT_Id ?? s.AMCST_Id) === studentId)?.studentName ||
                                                      'Selected Student'
                                                    : 'Search Student (min 3 chars)'}
                                            </span>
                                            <div className='flex shrink-0 items-center'>
                                                {searchFilterMutation.isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin opacity-50' />
                                                ) : (
                                                    <>
                                                        {studentId && (
                                                            <X
                                                                className='mr-2 h-4 w-4 cursor-pointer opacity-50 transition-opacity hover:opacity-100'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setStudentId(null);
                                                                    setSearchTerm('');
                                                                }}
                                                            />
                                                        )}
                                                        <Search className='h-4 w-4 opacity-50' />
                                                    </>
                                                )}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[450px] p-0 shadow-2xl' align='start'>
                                        <Command shouldFilter={false} className='w-full'>
                                            <CommandInput
                                                placeholder='Type to search (min 3 chars)...'
                                                value={searchTerm}
                                                onValueChange={setSearchTerm}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {searchFilterMutation.isPending ? (
                                                        <div className='flex items-center justify-center p-4'>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            <span>Loading...</span>
                                                        </div>
                                                    ) : (
                                                        'No student found.'
                                                    )}
                                                </CommandEmpty>
                                                <CommandGroup className='max-h-64 overflow-y-auto'>
                                                    {studentList.map((s: any, index: number) => (
                                                        <CommandItem
                                                            key={s.amcsT_Id ?? s.AMCST_Id ?? index}
                                                            value={`${s.studentname || s.studentName} ${s.admno || s.amsT_AdmNo} ${s.amcsT_Id ?? s.AMCST_Id}`}
                                                            onSelect={() => {
                                                                setStudentId(s.amcsT_Id ?? s.AMCST_Id);
                                                                setStudentOpen(false);
                                                                setSearchTerm('');
                                                            }}
                                                            className='flex items-center justify-between'>
                                                            <div className='flex items-center'>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4 text-indigo-600',
                                                                        studentId === (s.amcsT_Id ?? s.AMCST_Id)
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div className='flex flex-col'>
                                                                    <span className='font-medium'>{s.studentname || s.studentName}</span>
                                                                    {/* <span className="text-[10px] text-muted-foreground">Adm: {s.admno || s.amsT_AdmNo}</span> */}
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

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Hall Ticket No:</Label>
                                <input
                                    type='text'
                                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-200'
                                    placeholder='Enter Hall Ticket No'
                                    value={hallTicketNo}
                                    onChange={(e) => setHallTicketNo(e.target.value)}
                                />
                            </div>

                            {/* <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Purpose/Conduct:</Label>
                                <input
                                    type="text"
                                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-200'
                                    placeholder='Enter the purpose of the certificate'
                                    value={conductText}
                                    onChange={(e) => setConductText(e.target.value)}
                                />
                            </div> */}
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-6 border-t pt-8'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={reportMutation.isPending}
                            className='w-40 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'REPORT'}
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={handleReset}
                            className='w-40 rounded-xl border-2 border-orange-200 font-bold text-orange-600'>
                            CANCEL
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='w-40 rounded-xl bg-zinc-800 font-bold text-white hover:bg-zinc-900'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showReport &&
                reportData &&
                reportData.getstudentlist?.map((student: any, index: number) => (
                    <div
                        key={index}
                        className='mt-8 flex flex-col items-center overflow-auto rounded-2xl border-2 border-indigo-200 border-dashed bg-gray-50 p-4 md:p-8'>
                        <div ref={printRef} className='printable-content min-h-[210mm] w-[297mm] bg-white p-0 shadow-2xl'>
                            {/* 1. BONAFIDE (STUDY) CERTIFICATE */}
                            {certificateType === '1' && (
                                <div
                                    className='certificate-page relative flex flex-col p-[10mm]'
                                    style={{ width: '297mm', height: '210mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                    <div className='flex h-full flex-col rounded-[15px] border-2 border-black p-[8mm]'>
                                        {/* Header */}
                                        <div className='mb-8 border-black border-b-2 pb-6'>
                                            <div className='w-full'>
                                                <img
                                                    src={
                                                        reportData.logo ||
                                                        'https://dcampusstrg.blob.core.windows.net/files/19/ISM_Attachments/2460aa04-2aee-4131-a407-25d84394aeb1.jpg'
                                                    }
                                                    alt='Institution Logo'
                                                    className='h-auto w-full object-contain'
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className='mb-6 text-center'>
                                            <h2 className='font-black text-3xl text-[#4f81bd] uppercase tracking-tight'>
                                                BONAFIDE CERTIFICATE
                                            </h2>
                                        </div>

                                        {/* Stats Row */}
                                        <div className='mb-10 flex items-center justify-between px-4 font-serif text-[22px]'>
                                            <div>
                                                <b>Admission NO.:</b>{' '}
                                                <b className='px-2' contentEditable suppressContentEditableWarning>
                                                    {student.admno}
                                                </b>
                                            </div>
                                            <div>
                                                <b>Date:</b> <b className='px-2'>{format(reportDate, 'dd/MM/yyyy')}</b>
                                            </div>
                                        </div>

                                        {/* Body Text */}
                                        <div
                                            className='px-[7px] text-justify font-serif text-[18px] leading-[3]'
                                            style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                                            <p>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is to certify that Master/Kumari{' '}
                                                <strong
                                                    className='inline-block translate-y-1 border-black border-b-2 px-1 uppercase'
                                                    suppressContentEditableWarning>
                                                    {student.studentname || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                S/o.D/o.{' '}
                                                <strong
                                                    className='inline-block translate-y-1 border-black border-b-2 px-1'
                                                    suppressContentEditableWarning>
                                                    {student.fathername || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                bearing H.T. No.{' '}
                                                <strong
                                                    className='inline-block min-w-[200px] translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {hallTicketNo || student.registrationno || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                is a bonafide student of this institution, is studying in{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.coursename || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                year{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.semestername || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                semester of IV year B.Pharmacy degree course for the Academic Year{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.acadamicyear || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                During the study period his/her character was found good. His/Her date of birth as per our
                                                record is{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.dob ? (
                                                        format(new Date(student.dob), 'dd/MM/yyyy')
                                                    ) : (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                . This certificate is issued on the request of the candidate to obtain the{' '}
                                                <strong
                                                    className='inline-block min-w-[250px] translate-y-1 border-black border-b-2 px-1 uppercase'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {conductText}
                                                </strong>{' '}
                                                .
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className='mt-auto flex items-end justify-between px-12 pb-16 font-serif text-[22px]'>
                                            <div className='text-center'>
                                                <b className='block'>Clerak</b>
                                            </div>
                                            <div className='text-center'>
                                                <b className='block text-[28px] uppercase'>PRINCIPAL</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. CONDUCT CERTIFICATE */}
                            {certificateType === '0' && (
                                <div
                                    className='certificate-page relative flex flex-col p-[10mm]'
                                    style={{ width: '297mm', height: '210mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                    <div className='flex h-full flex-col rounded-[15px] border-2 border-black p-[8mm]'>
                                        {/* Header */}
                                        <div className='mb-8 border-black border-b-2 pb-6'>
                                            <div className='w-full'>
                                                <img
                                                    src={
                                                        reportData.logo ||
                                                        'https://dcampusstrg.blob.core.windows.net/files/19/ISM_Attachments/2460aa04-2aee-4131-a407-25d84394aeb1.jpg'
                                                    }
                                                    alt='Institution Logo'
                                                    className='h-auto w-full object-contain'
                                                />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className='mb-6 text-center'>
                                            <h2 className='font-black text-3xl text-[#4f81bd] uppercase tracking-tight'>
                                                BONAFIDE CERTIFICATE
                                            </h2>
                                        </div>

                                        {/* Stats Row */}
                                        <div className='mb-10 flex items-center justify-between px-4 font-serif text-[22px]'>
                                            <div>
                                                <b>Admission NO.:</b>{' '}
                                                <b className='px-2' contentEditable suppressContentEditableWarning>
                                                    {student.admno}
                                                </b>
                                            </div>
                                            <div>
                                                <b>Date:</b> <b className='px-2'>{format(reportDate, 'dd/MM/yyyy')}</b>
                                            </div>
                                        </div>

                                        {/* Body Text */}
                                        <div
                                            className='px-[7px] text-justify font-serif text-[18px] leading-[3]'
                                            style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                                            <p>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is to certify that Master/Kumari{' '}
                                                <strong
                                                    className='inline-block translate-y-1 border-black border-b-2 px-1 uppercase'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.studentname || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                S/o.D/o.{' '}
                                                <strong
                                                    className='inline-block translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.fathername || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                bearing H.T. No.{' '}
                                                <strong
                                                    className='inline-block min-w-[200px] translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {hallTicketNo || student.registrationno || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                is a bonafide student of this institution, is studying in{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.coursename || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                year{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.semestername || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                semester of IV year B.Pharmacy degree course for the Academic Year{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.acadamicyear || (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                During the study period his/her character was found good. His/Her date of birth as per our
                                                record is{' '}
                                                <strong
                                                    className='translate-y-1 border-black border-b-2 px-1'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {student.dob ? (
                                                        format(new Date(student.dob), 'dd/MM/yyyy')
                                                    ) : (
                                                        <span className='opacity-0'>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                    )}
                                                </strong>{' '}
                                                . This certificate is issued on the request of the candidate to obtain the{' '}
                                                <strong
                                                    className='inline-block min-w-[250px] translate-y-1 border-black border-b-2 px-1 uppercase'
                                                    contentEditable
                                                    suppressContentEditableWarning>
                                                    {conductText}
                                                </strong>{' '}
                                                .
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className='mt-auto flex items-end justify-between px-12 pb-16 font-serif text-[22px]'>
                                            <div className='text-center'>
                                                <b className='block'>Clerak</b>
                                            </div>
                                            <div className='text-center'>
                                                <b className='block text-[28px] uppercase'>PRINCIPAL</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

            <style jsx global>{`
                @media print {
                    .printable-content {
                        width: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .certificate-page {
                        border: none !important;
                        width: 297mm !important;
                        height: 210mm !important;
                        overflow: hidden !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                
                [contenteditable="true"]:focus {
                    outline: 2px solid #6366f1;
                    background-color: #f5f3ff;
                }
            `}</style>
        </div>
    );
}
