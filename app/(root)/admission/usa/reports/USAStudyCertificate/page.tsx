'use client';

import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2, Printer, QrCode, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
    useStudyCertificateConductDetails,
    useStudyCertificateDetails,
    useStudyCertificateLoadData,
    useStudyCertificateQRMutation as useStudyCertificateQR,
    useStudyCertificateStudentList
} from '@/hooks/admission/preadmission/useReports';
import { useStudentSearchFilter } from '@/hooks/admission/preadmission/useStudentTc';
import { CertificatePrint } from './_components/certificate-print';

export default function USAStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData } = useStudyCertificateLoadData();

    /* -------------------- UI State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'indid'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L' | 'D'>('S');
    const [certificateType, setCertificateType] = useState<'0' | '1'>('0'); // 0: Study, 1: Bonafide

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [qrCodeScanner, setQrCodeScanner] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [showCertificate, setShowCertificate] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [_generatedQrCode, setGeneratedQrCode] = useState('');
    const [dateOpen, setDateOpen] = useState(false);

    const searchMutation = useStudentSearchFilter();

    /* -------------------- Master Lists Extraction -------------------- */
    const rawData = (loadData as any)?.data || (loadData as any) || {};
    const yearList: any[] = rawData?.allAcademicYear || rawData?.getyear || rawData?.academicList1 || [];

    // Supports both class list and course list so it never fails to populate
    const classList: any[] = (rawData?.allclasslist || rawData?.getcourse || rawData?.courselist || []).map((item: any) => ({
        id: item.asmcL_Id ?? item.amcO_Id ?? item.AMCO_Id ?? item.ASMCL_Id,
        name: item.asmcL_ClassName ?? item.amcO_CourseName ?? item.AMCO_CourseName ?? item.coursename ?? item.courseName
    }));

    const sectionList: any[] = (rawData?.allsectionlist || rawData?.getsection || rawData?.sectionlist || []).map((item: any) => ({
        id: item.asmS_Id ?? item.acmS_Id ?? item.ACMS_Id ?? item.ASMS_Id,
        name: item.asmC_SectionName ?? item.acmS_SectionName ?? item.ACMS_SectionName ?? item.sectionname
    }));

    /* -------------------- Student List Hook -------------------- */
    const { data: studentList } = useStudyCertificateStudentList(
        {
            ASMAY_Id: academicYearId ?? 0,
            ASMCL_Id: classId ?? 0,
            ASMC_Id: sectionId ?? 0,
            AMST_Id: 0,
            AMST_SOL: studentStatus
        },
        !!academicYearId
    );

    /* -------------------- Debounced Search Effect -------------------- */
    useEffect(() => {
        if (!academicYearId || searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            searchMutation.mutate(
                {
                    asmayId: Number(academicYearId),
                    amstSol: studentStatus,
                    searchfilter: searchQuery,
                    flag: 'N'
                },
                {
                    onSuccess: (response: any) => {
                        const list =
                            response?.data?.fillstudlist ||
                            response?.data?.studentList ||
                            response?.fillstudlist ||
                            response?.studentList ||
                            response?.data ||
                            response ||
                            [];
                        setStudentListFromSearch(Array.isArray(list) ? list : []);
                    }
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus]);

    const admissionStudents = searchQuery.length >= 3 ? studentListFromSearch : studentList;
    const rawStudents =
        (admissionStudents as any)?.data?.studentList ||
        (admissionStudents as any)?.data?.fillstudlist ||
        (Array.isArray(admissionStudents) ? admissionStudents : []);

    const students = rawStudents
        .map((s: any) => ({
            ...s,
            amsT_Id: s.amsT_Id || s.AMST_Id || s.amcsT_Id || s.AMCST_Id,
            studentName:
                s.studentName ||
                s.studentnam ||
                s.studentname ||
                s.amsT_FirstName ||
                `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
        }))
        .filter((s: any) => !searchQuery || (s.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()));

    /* -------------------- Report Params & Queries -------------------- */
    const reportParams = {
        ASMAY_Id: academicYearId,
        ASMCL_Id: studentScope === 'A' ? 0 : (classId ?? 0),
        ASMC_Id: studentScope === 'A' ? 0 : (sectionId ?? 0),
        AMST_Id: studentId ?? 0,
        AllOrInd: studentScope === 'indid' ? 'I' : 'A',
        AMST_SOL: studentStatus,
        ASCISS_CertificateFlg: certificateType === '0' ? 'SC' : 'CC'
    };

    const studyReport = useStudyCertificateDetails(reportParams, false);
    const characterReport = useStudyCertificateConductDetails(reportParams, false);
    const qrcodeGen = useStudyCertificateQR();

    const generateQRCodePayload = (student: any) => {
        const certType = certificateType === '0' ? 'Study' : 'Bonafide';
        const certCode = certificateType === '0' ? 'SC' : 'BC';
        const sName = student.studentnam?.replace(/\s+/g, '_') || 'Student';

        return {
            ...reportParams,
            ASMAY_Id: reportParams.ASMAY_Id?.toString(),
            AMST_Id: student.AMST_Id || student.amsT_Id,
            ASCISS_CertificateNo: `${certCode}${reportParams.ASMAY_Id}${student.AMST_Id || student.amsT_Id}`,
            ASCISS_HtmlTemplate: `<html><body><h1>${certType} Certificate</h1><p>This is to certify that ${student.studentnam || student.studentName} is a student...</p></body></html>`,
            ASCISS_PDFFileName: `${certType}_Certificate_${sName}_${student.AMST_Id || student.amsT_Id}.pdf`
        };
    };

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || (studentScope === 'indid' && (!classId || !sectionId || !studentId)) || !selectedDate) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            setIsLoading(true);
            setShowCertificate(false);
            setStudentData(null);

            const res = certificateType === '0' ? await studyReport.refetch() : await characterReport.refetch();

            const studentListResult = (res.data as any)?.data?.studentList ?? [];

            if (studentListResult.length > 0) {
                const reportResult = (res.data as any).data;
                setStudentData(reportResult);

                // Auto-generate QR Code if student exists
                if (academicYearId && studentId && selectedDate) {
                    try {
                        const firstStudent = studentListResult[0];
                        const qrRes = await qrcodeGen.mutateAsync(generateQRCodePayload(firstStudent));
                        const qrCode = (qrRes as any)?.ascisS_QRCode || (qrRes as any)?.data?.ascisS_QRCode;
                        if (qrCode) {
                            setGeneratedQrCode(qrCode);
                        } else {
                            setGeneratedQrCode('');
                        }
                    } catch (qrError) {
                        console.error('QR Gen Error:', qrError);
                        setGeneratedQrCode('');
                    }
                }

                setShowCertificate(true);
                toast.success('Certificate generated successfully!');
            } else {
                toast.error('No records found for the selected criteria');
            }
        } catch (error) {
            toast.error(`Report error: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateQRCode = async () => {
        if (!academicYearId || !studentId || !selectedDate) {
            toast.error('Please select Academic Year, Student and Date');
            return;
        }

        try {
            const currentStudent =
                studentData?.studentList?.find((s: any) => (s.AMST_Id || s.amsT_Id) === studentId) || studentData?.studentList?.[0];

            if (!currentStudent) {
                toast.error('Student data not found for QR generation');
                return;
            }

            const res = await qrcodeGen.mutateAsync(generateQRCodePayload(currentStudent));
            const qrCode = (res as any)?.ascisS_QRCode || (res as any)?.data?.ascisS_QRCode;

            if (qrCode) {
                setGeneratedQrCode(qrCode);
                toast.success('QR Code generated successfully');
            } else {
                toast.error('No QR Code found in response');
            }
        } catch (_error) {
            toast.error('Failed to generate QR Code');
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
        setQrCodeScanner('');
        setSelectedDate(new Date());
        setShowCertificate(false);
        setStudentData(null);
        setGeneratedQrCode('');
        toast.info('Form reset successfully');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Universal_School_of_Administration_${certificateType === '0' ? 'Study' : 'Bonafide'}_Certificate`
    });

    const reportStudentsList = studentData?.studentList || [];

    return (
        <div className='min-h-screen space-y-6 p-4 font-sans text-slate-800'>
            {/* Collapsible Form Section matching study-certificate-report exactly */}
            <CollapsibleSection
                title='Study Certificate Report'
                description='Generate study or bonafide certificates for students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters Row (3 Rounded Pill Containers) */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* 1. Student Scope */}
                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
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
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='scope-all' />
                                    <Label htmlFor='scope-all' className='cursor-pointer font-medium text-sm'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='indid' id='scope-ind' />
                                    <Label htmlFor='scope-ind' className='cursor-pointer font-medium text-sm'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* 2. Student Status */}
                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='status-studying' />
                                    <Label htmlFor='status-studying' className='cursor-pointer font-medium text-sm'>
                                        Studying
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='L' id='status-left' />
                                    <Label htmlFor='status-left' className='cursor-pointer font-medium text-sm'>
                                        Left
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='D' id='status-deactive' />
                                    <Label htmlFor='status-deactive' className='cursor-pointer font-medium text-sm'>
                                        Deactive
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* 3. Certificate Type */}
                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup
                                value={certificateType}
                                onValueChange={(v) => setCertificateType(v as any)}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='type-study' />
                                    <Label htmlFor='type-study' className='cursor-pointer font-medium text-sm'>
                                        Study Certificate
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='type-bonafide' />
                                    <Label htmlFor='type-bonafide' className='cursor-pointer font-medium text-sm'>
                                        Bonafide Certificate
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Filter Fields (2-Column Layout) */}
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
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
                                    }}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Year--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearList.map((item: any) => {
                                            const id = item.asmaY_Id ?? item.ASMAY_Id;
                                            const name = item.asmaY_Year ?? item.ASMAY_Year;
                                            return (
                                                <SelectItem key={id} value={id.toString()}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Class / Course */}
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Course / Class:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => {
                                        setClassId(Number(v));
                                        setSectionId(null);
                                        setStudentId(null);
                                    }}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Class / Course--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Section */}
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A' || !classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => {
                                        setSectionId(Number(v));
                                        setStudentId(null);
                                    }}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* QR Code Scanner */}
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>QR Code Scanner :</Label>
                                <input
                                    value={qrCodeScanner}
                                    onChange={(e) => setQrCodeScanner(e.target.value)}
                                    className='flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                    placeholder='QR Code Scanner'
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            {/* Date */}
                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Date:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-8 w-full justify-start text-left font-normal'>
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

                            {/* Student Search with interactive dropdown matching study-certificate-report */}
                            <div className='relative grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Student:</Label>
                                <div className='space-y-1'>
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
                                                    className='flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                                    placeholder='Search Student... (min 3 chars)'
                                                />
                                                {studentId && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='absolute top-0 right-0 h-8 w-8 p-0'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStudentId(null);
                                                            setSearchQuery('');
                                                        }}>
                                                        <RotateCcw className='h-3 w-3' />
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
                                            className='w-[400px] p-0 shadow-xl'
                                            align='start'
                                            onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='w-full'>
                                                <CommandList>
                                                    {searchMutation.isPending && (
                                                        <div className='p-4 text-center text-muted-foreground text-sm'>
                                                            Searching students...
                                                        </div>
                                                    )}
                                                    {!searchMutation.isPending && searchQuery.length > 0 && searchQuery.length < 3 && (
                                                        <div className='p-4 text-center text-muted-foreground text-sm'>
                                                            Enter at least 3 characters
                                                        </div>
                                                    )}
                                                    <CommandEmpty>
                                                        {!searchMutation.isPending && searchQuery.length >= 3 ? 'No students found.' : ''}
                                                    </CommandEmpty>
                                                    <CommandGroup className='max-h-60 overflow-y-auto'>
                                                        {students.map((s: any, idx: number) => (
                                                            <CommandItem
                                                                key={`${s.amsT_Id || 's'}-${idx}`}
                                                                value={s.studentName}
                                                                onSelect={() => {
                                                                    setStudentId(s.amsT_Id);
                                                                    setSearchQuery(s.studentName);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className='flex cursor-pointer items-center justify-between p-2'>
                                                                <div className='flex items-center'>
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4 text-indigo-600',
                                                                            studentId === s.amsT_Id ? 'opacity-100' : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    <div className='flex flex-col'>
                                                                        <span className='font-medium text-slate-900'>{s.studentName}</span>
                                                                        <span className='text-[10px] text-muted-foreground'>
                                                                            Adm: {s.amsT_AdmNo || s.admno || 'N/A'} |{' '}
                                                                            {s.asmcL_ClassName || s.coursename || 'N/A'}-
                                                                            {s.asmC_SectionName || s.sectionname || 'N/A'}
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
                        </div>
                    </div>

                    {/* Action Buttons matching study-certificate-report exactly */}
                    <div className='flex flex-wrap justify-center gap-4 pt-6'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={isLoading}
                            className='min-w-[100px] bg-[#3f51b5] text-white shadow-md hover:bg-[#303f9f]'>
                            {isLoading ? <RotateCcw className='mr-1 h-3 w-3 animate-spin' /> : <Printer className='mr-1 h-3 w-3' />}
                            REPORT
                        </Button>
                        <Button
                            size='sm'
                            onClick={handleGenerateQRCode}
                            className='min-w-[100px] bg-[#3f51b5] text-white shadow-md hover:bg-[#303f9f]'>
                            <QrCode className='mr-1 h-3 w-3' />
                            QRCODE
                        </Button>
                        <Button
                            size='sm'
                            onClick={handleReset}
                            className='min-w-[100px] bg-[#ff5722] text-white uppercase shadow-md hover:bg-[#f4511e]'>
                            <RotateCcw className='mr-1 h-3 w-3' />
                            CANCEL
                        </Button>
                        <Button
                            size='sm'
                            onClick={handlePrint}
                            disabled={!showCertificate || reportStudentsList.length === 0}
                            className='min-w-[100px] bg-[#1e293b] text-white uppercase shadow-md hover:bg-[#0f172a] disabled:bg-gray-200 disabled:text-gray-400'>
                            <Printer className='mr-1 h-3 w-3' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Generated Certificate Display (Preview Only) matching Universal School of Administration branding */}
            {showCertificate && studentData && reportStudentsList.length > 0 && (
                <div className='mt-8 flex flex-col items-center justify-center overflow-x-auto rounded-xl border-2 border-gray-300 border-dashed bg-gray-100 p-6'>
                    <div className='mb-4 flex w-full max-w-[850px] items-center justify-between'>
                        <span className='font-semibold text-slate-700 text-sm'>
                            Previewing {reportStudentsList.length} {reportStudentsList.length === 1 ? 'Certificate' : 'Certificates'}
                        </span>
                        <Button size='sm' onClick={handlePrint} className='bg-[#1e293b] text-white hover:bg-[#0f172a]'>
                            <Printer className='mr-1.5 h-3.5 w-3.5' />
                            Print Certificate
                        </Button>
                    </div>

                    <div className='w-full max-w-[850px] bg-white shadow-2xl'>
                        <CertificatePrint
                            ref={printRef}
                            students={reportStudentsList}
                            certificateType={certificateType === '0' ? 'STUDY' : 'BONAFIED'}
                            reportDate={selectedDate || new Date()}
                            logoUrl={(loadData as any)?.data?.logo || ''}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
