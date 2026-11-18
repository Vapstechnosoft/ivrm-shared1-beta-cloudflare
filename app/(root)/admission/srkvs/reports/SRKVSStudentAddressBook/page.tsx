'use client';

import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useChangeClassSrkvsAddressBook,
    useChangeSectionSrkvsAddressBook,
    useChangeYearSrkvsAddressBook,
    useSrkvsAddressBookLoadData,
    useSrkvsAddressBookReport
} from '@/hooks/admission/preadmission/reports/useSrkvsStudentAddressBook';

export default function SRKVSStudentAddressBookPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSrkvsAddressBookLoadData();

    /* -------------------- UI State -------------------- */
    const [reportDisplayType, setReportDisplayType] = useState<'address' | 'addressprint'>('address');
    const [activeStatus, setActiveStatus] = useState<'S' | 'L'>('S'); // S: Active, L: Left
    const [addressType, setAddressType] = useState<'1' | '2'>('1'); // 1: Permanent, 2: Temporary

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);

    // Display checkboxes
    const [showEmail, setShowEmail] = useState(false);
    const [showDOB, setShowDOB] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [showTC, setShowTC] = useState(false);

    // Dynamic Lists
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    // Report State
    const [showReport, setShowReport] = useState(false);
    const [reportItems, setReportItems] = useState<any[]>([]);

    const yearMutation = useChangeYearSrkvsAddressBook();
    const classMutation = useChangeClassSrkvsAddressBook();
    const sectionMutation = useChangeSectionSrkvsAddressBook();
    const reportMutation = useSrkvsAddressBookReport();

    const academicYearList = (loadData as any)?.accyear || [];

    useMemo(() => {
        if (loadData) {
            const data = loadData as any;
            if (Array.isArray(data.classlist)) setClassList(data.classlist);
            if (Array.isArray(data.sectionlist)) setSectionList(data.sectionlist);
        }
    }, [loadData]);

    /* -------------------- Filtering Logic -------------------- */
    const filteredStudents = useMemo(() => {
        return studentList.filter((s) => s.amsT_FirstName?.toLowerCase().includes(studentSearch.toLowerCase()));
    }, [studentList, studentSearch]);

    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        setClassId(null);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        try {
            const res = await yearMutation.mutateAsync({ ASMAY_Id: yearId, flag: activeStatus });
            setClassList(Array.isArray(res?.classlist) ? res?.classlist : []);
        } catch (error) {
            toast.error('Failed to load classes');
        }
    };

    const handleClassChange = async (cId: number) => {
        setClassId(cId);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        try {
            const res = await classMutation.mutateAsync({ ASMAY_Id: academicYearId!, flag: activeStatus, ASMCL_Id: cId });
            setSectionList(Array.isArray(res?.sectionlist) ? res?.sectionlist : []);
        } catch (error) {
            toast.error('Failed to load sections');
        }
    };

    const handleSectionChange = async (sId: number) => {
        setSectionId(sId);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        try {
            const res = await sectionMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                flag: activeStatus,
                ASMCL_Id: classId!,
                ASMS_Id: sId
            });
            const students = Array.isArray(res) ? res : Array.isArray((res as any)?.studentlist) ? (res as any)?.studentlist : [];
            setStudentList(students);
            // Default to select all
            setSelectedStudentIds(students.map((s: any) => s.amsT_Id));
        } catch (error) {
            toast.error('Failed to load students');
        }
    };

    const toggleStudent = (id: number) => {
        setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const toggleAllStudents = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(studentList.map((s) => s.amsT_Id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleReport = async () => {
        if (!academicYearId || !classId || sectionId === null || selectedStudentIds.length === 0) {
            toast.error('Please select all required fields and at least one student');
            return;
        }

        const selectedList = studentList
            .filter((s) => selectedStudentIds.includes(s.amsT_Id))
            .map((s) => ({ amsT_Id: s.amsT_Id, studentname: s.amsT_FirstName }));

        try {
            const res = await reportMutation.mutateAsync({
                asmaY_Id: academicYearId,
                asmcL_Id: classId,
                asmS_Id: sectionId,
                flag: activeStatus,
                sall: '1',
                studentlisttemp: selectedList
            });

            const reportData = Array.isArray(res) ? res : Array.isArray((res as any)?.getdetails) ? (res as any)?.getdetails : [];

            if (reportData.length > 0) {
                setReportItems(reportData);
                setShowReport(true);
                toast.success(`Generated address book for ${reportData.length} students`);
            } else {
                toast.error('No records found for the selected students');
                setShowReport(false);
            }
        } catch (error) {
            toast.error('Failed to generate report');
        }
    };

    const handleExcel = () => {
        if (reportItems.length === 0) return;

        const excelData = reportItems.map((item) => ({
            'Student Name': item.studentname,
            'Admission No': item.AMST_AdmNo,
            Class: item.ASMCL_ClassName,
            Section: item.ASMC_SectionName,
            'Father Name': item.AMST_FatherName,
            Address:
                addressType === '1'
                    ? `${item.AMST_PerStreet}, ${item.AMST_PerArea}, ${item.AMST_PerCity} - ${item.AMST_PerPincode}`
                    : `${item.AMST_ConStreet}, ${item.AMST_ConArea}, ${item.AMST_ConCity} - ${item.AMST_ConPincode}`,
            Email: item.AMST_emailId,
            Phone: item.AMST_MobileNo,
            DOB: item.AMST_DOB ? format(new Date(item.AMST_DOB), 'dd/MM/yyyy') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Address Book');
        XLSX.writeFile(wb, `SRKVS_AddressBook_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `SRKVS_Address_Book_${reportDisplayType}`
    });

    const handleClear = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        setReportDisplayType('address');
        setActiveStatus('S');
        setAddressType('1');
        setShowEmail(false);
        setShowDOB(false);
        setShowPhone(false);
        setShowTC(false);
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='SRKVS Student Address Book'
                description='Generate printable address labels and directories for students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-8 bg-white p-6'>
                    {/* Top Control Bar */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Display Format */}
                        <div className='flex flex-col space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4'>
                            <Label className='font-black text-slate-400 text-xs uppercase tracking-widest'>Display Format</Label>
                            <RadioGroup
                                value={reportDisplayType}
                                onValueChange={(v) => setReportDisplayType(v as any)}
                                className='flex space-x-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='address' id='dt-pdf' />
                                    <Label htmlFor='dt-pdf' className='cursor-pointer font-bold'>
                                        Address_Pdf
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='addressprint' id='dt-print' />
                                    <Label htmlFor='dt-print' className='cursor-pointer font-bold'>
                                        Address_Print
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Student Status & Address Type */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4'>
                                <Label className='font-black text-indigo-400 text-xs uppercase tracking-widest'>Status</Label>
                                <RadioGroup
                                    value={activeStatus}
                                    onValueChange={(v) => {
                                        setActiveStatus(v as any);
                                        setAcademicYearId(null);
                                        setStudentList([]);
                                    }}
                                    className='flex space-x-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='S' id='as-active' />
                                        <Label htmlFor='as-active' className='cursor-pointer font-bold'>
                                            Active
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='L' id='as-left' />
                                        <Label htmlFor='as-left' className='cursor-pointer font-bold'>
                                            Left
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className='flex flex-col space-y-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-4'>
                                <Label className='font-black text-orange-400 text-xs uppercase tracking-widest'>Address Type</Label>
                                <RadioGroup value={addressType} onValueChange={(v) => setAddressType(v as any)} className='flex space-x-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='at-per' />
                                        <Label htmlFor='at-per' className='cursor-pointer font-bold'>
                                            Permanent
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='2' id='at-temp' />
                                        <Label htmlFor='at-temp' className='cursor-pointer font-bold'>
                                            Temporary
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Cascading Filters */}
                        <div className='space-y-5'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearList.map((item: any) => (
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
                                    disabled={!academicYearId}
                                    value={classId?.toString()}
                                    onValueChange={(v) => handleClassChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Class' />
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
                                <Label className='font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={!classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => handleSectionChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>All Sections</SelectItem>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Options Checkboxes */}
                            <div className='space-y-4 rounded-2xl border bg-slate-50/50 p-4'>
                                <Label className='mb-1 block font-black text-slate-400 text-xs uppercase tracking-widest'>
                                    Include in Address
                                </Label>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='opt-email' checked={showEmail} onCheckedChange={(v) => setShowEmail(!!v)} />
                                        <Label htmlFor='opt-email' className='font-medium text-sm'>
                                            Email Address
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='opt-dob' checked={showDOB} onCheckedChange={(v) => setShowDOB(!!v)} />
                                        <Label htmlFor='opt-dob' className='font-medium text-sm'>
                                            Date of Birth
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='opt-phone' checked={showPhone} onCheckedChange={(v) => setShowPhone(!!v)} />
                                        <Label htmlFor='opt-phone' className='font-medium text-sm'>
                                            Phone Number
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='opt-tc' checked={showTC} onCheckedChange={(v) => setShowTC(!!v)} />
                                        <Label htmlFor='opt-tc' className='font-medium text-sm'>
                                            Previous School TC
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Selection Section */}
                        <div className='flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm'>
                            <div className='flex items-center justify-between border-b bg-slate-50 p-3'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='toggle-all'
                                        checked={selectedStudentIds.length === studentList.length && studentList.length > 0}
                                        onCheckedChange={toggleAllStudents}
                                    />
                                    <Label htmlFor='toggle-all' className='font-bold text-slate-700 text-sm'>
                                        Select All Students
                                    </Label>
                                </div>
                                <span className='rounded-full bg-indigo-100 px-2 py-0.5 font-bold text-[10px] text-indigo-700 uppercase'>
                                    {selectedStudentIds.length} / {studentList.length} Selected
                                </span>
                            </div>
                            <div className='border-b p-2'>
                                <div className='relative'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search by name...'
                                        className='h-9 rounded-lg border-slate-200 pl-9'
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                    />
                                    {studentSearch && (
                                        <X
                                            className='-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-600'
                                            onClick={() => setStudentSearch('')}
                                        />
                                    )}
                                </div>
                            </div>
                            <ScrollArea className='h-[260px] flex-grow p-2'>
                                {filteredStudents.length > 0 ? (
                                    <div className='grid grid-cols-1 gap-1'>
                                        {filteredStudents.map((s: any) => (
                                            <div
                                                key={s.amsT_Id}
                                                onClick={() => toggleStudent(s.amsT_Id)}
                                                className={cn(
                                                    'flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors',
                                                    selectedStudentIds.includes(s.amsT_Id)
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'hover:bg-slate-50'
                                                )}>
                                                <Checkbox checked={selectedStudentIds.includes(s.amsT_Id)} />
                                                <div className='flex flex-col'>
                                                    <span className='font-semibold text-sm'>
                                                        {s.amsT_FirstName} {s.amsT_MiddleName || ''} {s.amsT_LastName || ''}
                                                    </span>
                                                    <span className='text-[10px] uppercase tracking-tighter opacity-60'>
                                                        Reg: {s.amsT_RegistrationNo || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='flex h-full flex-col items-center justify-center py-10 text-slate-400'>
                                        <Search className='mb-2 h-8 w-8 opacity-20' />
                                        <p className='font-medium text-xs italic'>No students found</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-6 border-slate-100 border-t pt-8'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={reportMutation.isPending}
                            className='h-12 min-w-[160px] rounded-xl bg-indigo-600 font-bold text-white shadow-md hover:bg-indigo-700'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'SUBMIT'}
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={handleClear}
                            className='h-12 min-w-[160px] rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50'>
                            CLEAR
                        </Button>
                        <Button
                            size='lg'
                            disabled={reportItems.length === 0}
                            onClick={handleExcel}
                            className='h-12 min-w-[160px] rounded-xl bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            EXCEL
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='h-12 min-w-[160px] rounded-xl bg-slate-800 font-bold text-white shadow-md hover:bg-slate-900'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Print Preview Area */}
            {showReport && reportItems.length > 0 && (
                <div className='mt-8 flex flex-col items-center overflow-auto rounded-3xl border-2 border-slate-300 border-dashed bg-slate-100 p-8'>
                    <div ref={printRef} className='printable-content min-h-[297mm] w-[210mm] bg-white p-[10mm] font-serif shadow-2xl'>
                        <div className='grid grid-cols-2 gap-[10mm]'>
                            {reportItems.map((user: any, idx: number) => (
                                <section key={idx} className='label-item'>
                                    {reportDisplayType === 'address' ? (
                                        <div className='flex min-h-[50mm] flex-col justify-center space-y-1 border border-slate-200 p-4'>
                                            <div className='font-bold text-[16px] uppercase underline'>
                                                {user.studentname} ({user.ASMCL_ClassName} {user.ASMC_SectionName})
                                            </div>
                                            <div className='flex gap-2 text-[14px]'>
                                                <span>S/O.</span>
                                                <span className='font-bold'>{user.AMST_FatherName}</span>
                                            </div>
                                            <div className='flex flex-col text-[14px] leading-tight'>
                                                {addressType === '1' ? (
                                                    <>
                                                        <span>{user.AMST_PerStreet}</span>
                                                        <span>{user.AMST_PerArea}</span>
                                                        <span className='font-bold'>
                                                            {user.AMST_PerCity} - {user.AMST_PerPincode}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>{user.AMST_ConStreet}</span>
                                                        <span>{user.AMST_ConArea}</span>
                                                        <span className='font-bold'>
                                                            {user.AMST_ConCity} - {user.AMST_ConPincode}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {showEmail && (
                                                <div className='text-[12px] text-slate-500 italic'>Email: {user.AMST_emailId}</div>
                                            )}
                                            {showDOB && (
                                                <div className='text-[12px] text-slate-500 italic'>
                                                    DOB: {user.AMST_DOB ? format(new Date(user.AMST_DOB), 'dd/MM/yyyy') : ''}
                                                </div>
                                            )}
                                            {showPhone && <div className='font-bold text-[13px]'>Ph: {user.AMST_MobileNo}</div>}
                                        </div>
                                    ) : (
                                        <div className='flex min-h-[60mm] flex-col space-y-1.5 whitespace-pre-wrap bg-slate-50 p-6 font-mono text-[15px] tracking-tight'>
                                            <span className='font-black uppercase'>
                                                {user.studentname} ({user.ASMCL_ClassName} {user.ASMC_SectionName})
                                            </span>
                                            <span>ADM: {user.AMST_AdmNo}</span>
                                            <span className='font-bold'>{user.AMST_FatherName}</span>
                                            <span>
                                                {addressType === '1'
                                                    ? `${user.AMST_PerStreet}, ${user.AMST_PerArea}, ${user.AMST_PerCity} - ${user.AMST_PerPincode}`
                                                    : `${user.AMST_ConStreet}, ${user.AMST_ConArea}, ${user.AMST_ConCity} - ${user.AMST_ConPincode}`}
                                            </span>
                                            <span className='font-bold'>Mob: {user.AMST_MobileNo}</span>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .printable-content {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .label-item {
                        page-break-inside: avoid;
                    }
                    @page {
                        size: A4;
                        margin-top: 30mm;
                        margin-bottom: 10mm;
                        margin-left: 0;
                        margin-right: 0;
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
