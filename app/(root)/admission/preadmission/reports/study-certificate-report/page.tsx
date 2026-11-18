'use client';

import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2, Printer, QrCode, RotateCcw } from 'lucide-react';
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
    useStudyCertificateConductDetails,
    useStudyCertificateDetails,
    useStudyCertificateLoadData,
    // useStudyCertificateSearchFilter,
    useStudyCertificateQRMutation as useStudyCertificateQR,
    useStudyCertificateStudentList,
    useadmissionStudentsDropdown
} from '@/hooks/admission/preadmission/useReports';
import { useStudentSearchFilter } from '@/hooks/admission/preadmission/useStudentTc';
import { getExcelStudyCertificateReport } from '@/server/admission/preadmission/reports/month_end_report';
import { toast } from 'sonner';
import CharacterCertificate from './_components/character-certificate';
import StudyCertificate from './_components/study-certificate';

export default function CertificateReportPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData } = useStudyCertificateLoadData();

    /* -------------------- UI State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'indid'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L' | 'D'>('S');
    const [certificateType, setCertificateType] = useState<'0' | '1'>('0');
    const [addressType, setAddressType] = useState<'address_per' | 'address_con'>('address_per');
    const [parentType, setParentType] = useState<'0' | '1' | '2'>('0');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const searchMutation = useStudentSearchFilter();

    // const { data: searchResults } = useStudyCertificateSearchFilter({
    //     ASMAY_Id: academicYearId,
    //     AMST_SOL: studentStatus,
    //     ASMCL_Id: classId,
    //     ASMC_Id: sectionId,
    //     searchfilter: searchQuery,
    //     allorindid: studentScope
    // }, !!academicYearId && searchQuery.length > 2);

    const {
        data: studentList,
        isLoading: admissionStudentsLoading,
        isError: admissionStudentsError
    } = useStudyCertificateStudentList(
        {
            ASMAY_Id: academicYearId ?? 0,
            ASMCL_Id: classId ?? 0,
            ASMC_Id: sectionId ?? 0,
            AMST_Id: 0,
            AMST_SOL: studentStatus
        },
        !!academicYearId
    );

    // Debounced Search Effect
    useEffect(() => {
        if (!academicYearId || searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            const statusMap: Record<string, string> = {
                studying: 'S',
                left: 'L',
                deactive: 'D'
            };

            searchMutation.mutate(
                {
                    asmayId: Number(academicYearId),
                    amstSol: studentStatus,
                    searchfilter: searchQuery,
                    flag: 'N'
                },
                {
                    onSuccess: (response: any) => {
                        const list = response?.data?.fillstudlist || response?.data?.studentList || response?.fillstudlist || response?.studentList || response?.data || response || [];
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
            amsT_Id: s.amsT_Id || s.AMST_Id,
            studentName:
                s.studentName || s.studentnam || s.amsT_FirstName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
        }))
        .filter((s: any) => !searchQuery || (s.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const [isLoading, setIsLoading] = useState(false);
    const [qrCodeScanner, setQrCodeScanner] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [showCertificate, setShowCertificate] = useState(false);
    const [studentData, setStudentData] = useState<any>(null);
    const [generatedQrCode, setGeneratedQrCode] = useState('');
    const [dateOpen, setDateOpen] = useState(false);

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
        const certType = certificateType === '0' ? 'Study' : 'Character';
        const certCode = certificateType === '0' ? 'SC' : 'CC';
        const studentName = student.studentnam?.replace(/\s+/g, '_') || 'Student';

        return {
            ...reportParams,
            ASMAY_Id: reportParams.ASMAY_Id?.toString(),
            AMST_Id: student.AMST_Id,
            ASCISS_CertificateNo: `${certCode}${reportParams.ASMAY_Id}${student.AMST_Id}`,
            ASCISS_HtmlTemplate: `<html><body><h1>${certType} Certificate</h1><p>This is to certify that ${student.studentnam} is a bonafide student...</p></body></html>`,
            ASCISS_PDFFileName: `${certType}_Certificate_${studentName}_${student.AMST_Id}.pdf`
        };
    };

    const { data: qrcodeload } = useadmissionStudentsDropdown();

    const selectedAcademicYearData = (loadData as any)?.data?.allAcademicYear?.find((y: any) => y.asmaY_Id === academicYearId);

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
                const reportData = (res.data as any).data;
                setStudentData(reportData);

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
            } else {
                toast.error('No records found');
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
            const currentStudent = studentData?.studentList?.find((s: any) => s.AMST_Id === studentId) || studentData?.studentList?.[0];

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
        } catch (error) {
            toast.error('Failed to generate QR Code');
        }
    };

    const handleReset = () => {
        setStudentScope('A');
        setStudentStatus('S');
        setCertificateType('0');
        setAddressType('address_per');
        setParentType('0');
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
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: certificateType === '0' ? 'Study_Certificate' : 'Character_Certificate'
    });

    const downloadExcel = async () => {
        try {
            if (!academicYearId) {
                toast.error('Please select Academic Year');
                return;
            }

            const response = await getExcelStudyCertificateReport({
                ...reportParams,
                AllOrInd: studentScope
            });

            const blob = new Blob([new Uint8Array(response)], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'StudyCertificateReport.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Excel downloaded successfully');
        } catch (error) {
            toast.error('Failed to download Excel');
        }
    };

    const isMIId6 = (loadData as any)?.data?.masterCompany?.[0]?.mI_Id === 6;

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Study Certificate Report'
                description='Generate study or character certificates for students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup
                                value={studentScope}
                                onValueChange={(v) => {
                                    setStudentScope(v as any);
                                    if (v === 'A') {
                                        setClassId(null);
                                        setSectionId(null);
                                    }
                                }}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='scope-all' />
                                    <Label htmlFor='scope-all' className='font-medium text-sm'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='indid' id='scope-ind' />
                                    <Label htmlFor='scope-ind' className='font-medium text-sm'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className='flex space-x-4'>
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
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='D' id='status-deactive' />
                                    <Label htmlFor='status-deactive' className='font-medium text-sm'>
                                        Deactive
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center space-x-4 rounded-lg border bg-gray-50/50 p-2'>
                            <RadioGroup
                                value={certificateType}
                                onValueChange={(v) => setCertificateType(v as any)}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='type-character' />
                                    <Label htmlFor='type-character' className='font-medium text-sm'>
                                        Character Certificate
                                    </Label>
                                </div>
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
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => setAcademicYearId(Number(v))}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Year--' />
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
                                <Label className='font-bold text-sm'>
                                    Class:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => setClassId(Number(v))}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Class--' />
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
                                <Label className='font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={studentScope === 'A' || !classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => setSectionId(Number(v))}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Section--' />
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
                                        <PopoverContent className='w-[400px] p-0' align='start' onOpenAutoFocus={(e) => e.preventDefault()}>
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
                                                    <CommandGroup>
                                                        {students.map((s: any, idx: number) => (
                                                            <CommandItem
                                                                key={`${s.amsT_Id || 's'}-${idx}`}
                                                                value={s.studentName}
                                                                onSelect={() => {
                                                                    setStudentId(s.amsT_Id);
                                                                    setSearchQuery(s.studentName);
                                                                    setStudentOpen(false);
                                                                }}>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        studentId === s.amsT_Id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div className='flex flex-col'>
                                                                    <span>{s.studentName}</span>
                                                                    <span className='text-[10px] text-muted-foreground'>
                                                                        Adm: {s.amsT_AdmNo} | {s.asmcL_ClassName || 'N/A'}-
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

                            <div className='flex justify-center pt-2'>
                                <RadioGroup value={addressType} onValueChange={(v) => setAddressType(v as any)} className='flex space-x-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='address_per' id='addr-per' />
                                        <Label htmlFor='addr-per' className='text-sm'>
                                            Permanent Address
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='address_con' id='addr-con' />
                                        <Label htmlFor='addr-con' className='text-sm'>
                                            Communication Address
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Parent Name Selection for Baldwin Boys (MI_Id = 6) */}
                            {isMIId6 && (
                                <div className='flex justify-center border-t pt-4'>
                                    <RadioGroup
                                        value={parentType}
                                        onValueChange={(v) => setParentType(v as any)}
                                        className='flex space-x-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='parent-father' />
                                            <Label htmlFor='parent-father' className='text-sm'>
                                                Father Name
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='parent-mother' />
                                            <Label htmlFor='parent-mother' className='text-sm'>
                                                Mother Name
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='2' id='parent-both' />
                                            <Label htmlFor='parent-both' className='text-sm'>
                                                Both
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
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
                            disabled={!showCertificate}
                            className='min-w-[100px] bg-[#e0e0e0] text-gray-700 uppercase shadow-md hover:bg-[#d5d5d5] disabled:bg-gray-100'>
                            <Printer className='mr-1 h-3 w-3' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* UI Certificate Display (Preview Only) */}
            {showCertificate && studentData && (
                <div className='mt-8 flex justify-center overflow-x-auto rounded-xl border-2 border-gray-300 border-dashed bg-gray-100 p-4'>
                    <div className='origin-top bg-white shadow-2xl transition-none'>
                        {certificateType === '0' ? (
                            <StudyCertificate
                                ref={printRef}
                                data={studentData}
                                selectedDate={selectedDate}
                                addressType={addressType}
                                parentType={parentType}
                                qrCode={generatedQrCode}
                                academicYearData={selectedAcademicYearData}
                            />
                        ) : (
                            <CharacterCertificate ref={printRef} data={studentData} selectedDate={selectedDate} qrCode={generatedQrCode} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
