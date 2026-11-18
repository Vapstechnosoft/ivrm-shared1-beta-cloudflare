'use client';

import { format } from 'date-fns';
import { Check, FileText, Loader2, Printer, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useChangeClassSamarthaTC,
    useChangeSectionSamarthaTC,
    useChangeYearSamarthaTC,
    useSamarthaTCDetails,
    useSamarthaTCLoadData
} from '@/hooks/admission/preadmission/reports/useSamarthaTC';

export default function SamarthaTCPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSamarthaTCLoadData();
    console.log('loadData', loadData);
    /* -------------------- UI State -------------------- */
    const [reportType, setReportType] = useState<'All' | 'indi'>('All');
    const [temporper, setTemporper] = useState<'Temp' | 'Per'>('Per');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);

    const [identificationMarks, setIdentificationMarks] = useState('');

    const [studentList, setStudentList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showCertificate, setShowCertificate] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const yearMutation = useChangeYearSamarthaTC();
    const classMutation = useChangeClassSamarthaTC();
    const sectionMutation = useChangeSectionSamarthaTC();
    const detailsMutation = useSamarthaTCDetails();

    /* -------------------- Data Initialization -------------------- */
    useEffect(() => {
        if (loadData?.data) {
            setClassList(loadData.data.accclass || []);
            setSectionList(loadData.data.accsection || []);
        }
    }, [loadData]);

    /* -------------------- Dependency Logic -------------------- */
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        setStudentId(null);
        setSearchTerm('');

        try {
            const res = await yearMutation.mutateAsync({
                ASMAY_Id: yearId,
                tctemporper: temporper,
                report_type: reportType
            });
            const data = res?.data || res;
            if (reportType === 'All') {
                setStudentList(data?.studentlist || []);
            }
            setClassList(data?.accclass || []);
        } catch (error) {
            toast.error('Failed to update classes');
        }
    };

    const handleClassChange = async (cId: number) => {
        setClassId(cId);
        setSectionId(null);
        setStudentId(null);
        setSearchTerm('');

        try {
            const res = await classMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: cId
            });
            const data = res?.data || res;
            setSectionList(data?.accsection || []);
        } catch (error) {
            toast.error('Failed to update sections');
        }
    };

    const handleSectionChange = async (sId: number) => {
        setSectionId(sId);
        setStudentId(null);
        setSearchTerm('');

        try {
            const res = await sectionMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: classId!,
                ASMS_Id: sId
            });
            const data = res?.data || res;
            setStudentList(data?.studentlist || []);
        } catch (error) {
            toast.error('Failed to update students');
        }
    };

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || !studentId) {
            toast.error('Please select all required fields');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            AMST_Id: studentId,
            ASMCL_Id: classId || 0,
            ASMS_Id: sectionId || 0,
            tctemporper: temporper,
            report_type: reportType
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            const data = res?.data || res;

            if (data?.result?.length > 0) {
                setReportData(data);
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
        setSearchTerm('');
        setReportType('All');
        setTemporper('Per');
        setIdentificationMarks('');
        setShowCertificate(false);
        setReportData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Samartha_TC_Report'
    });

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Student TC Custom Report'
                description='Generate transfer certificates for Samartha students'
                defaultOpen={true}
                variant='outline'
                className='rounded-2xl border-none bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl'>
                <div className='space-y-6 p-6'>
                    {/* Top Filters */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='flex flex-col space-y-2 rounded-xl border bg-gray-50/50 p-4 shadow-sm'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Report Type</Label>
                            <RadioGroup
                                value={reportType}
                                onValueChange={(v) => {
                                    setReportType(v as any);
                                    setAcademicYearId(null);
                                    setClassId(null);
                                    setSectionId(null);
                                    setStudentId(null);
                                }}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='All' id='type-all' />
                                    <Label htmlFor='type-all' className='cursor-pointer font-medium text-sm'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='indi' id='type-indi' />
                                    <Label htmlFor='type-indi' className='cursor-pointer font-medium text-sm'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex flex-col space-y-2 rounded-xl border bg-gray-50/50 p-4 shadow-sm'>
                            <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>TC Type</Label>
                            <RadioGroup value={temporper} onValueChange={(v) => setTemporper(v as any)} className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Temp' id='tc-temp' />
                                    <Label htmlFor='tc-temp' className='cursor-pointer font-medium text-sm'>
                                        Temporary TC
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Per' id='tc-per' />
                                    <Label htmlFor='tc-per' className='cursor-pointer font-medium text-sm'>
                                        Permanent TC
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger className='h-10'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData?.data?.accyear || []).map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Class:</Label>
                                <Select
                                    disabled={reportType === 'All' && !academicYearId}
                                    value={classId?.toString()}
                                    onValueChange={(v) => handleClassChange(Number(v))}>
                                    <SelectTrigger className='h-10'>
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

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Section:</Label>
                                <Select
                                    disabled={reportType === 'All' && !academicYearId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => handleSectionChange(Number(v))}>
                                    <SelectTrigger className='h-10'>
                                        <SelectValue placeholder='Select Section' />
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

                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            role='combobox'
                                            disabled={!academicYearId}
                                            className={cn(
                                                'h-10 w-full justify-between border-input bg-white font-normal',
                                                !studentId && 'text-muted-foreground'
                                            )}>
                                            <span className='truncate'>
                                                {studentId
                                                    ? studentList.find((s: any) => (s.amsT_Id || s.amst_Id) === studentId)?.studentname ||
                                                      'Selected Student'
                                                    : 'Select Or Search Student'}
                                            </span>
                                            <div className='flex shrink-0 items-center'>
                                                {yearMutation.isPending || sectionMutation.isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin opacity-50' />
                                                ) : (
                                                    <>
                                                        {studentId && (
                                                            <X
                                                                className='mr-2 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100'
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
                                    <PopoverContent className='w-[400px] p-0 shadow-2xl' align='start'>
                                        <Command shouldFilter={false} className='w-full'>
                                            <div className='flex items-center border-b px-3'>
                                                <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                                                <input
                                                    placeholder='Type to search...'
                                                    className='flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground'
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <CommandList>
                                                <CommandEmpty>No student found.</CommandEmpty>
                                                <CommandGroup className='max-h-64 overflow-y-auto'>
                                                    {studentList
                                                        .filter((s: any) =>
                                                            (s.studentname || '').toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map((s: any) => {
                                                            const sId = s.amsT_Id || s.amst_Id;
                                                            return (
                                                                <CommandItem
                                                                    key={sId}
                                                                    value={sId.toString()}
                                                                    onSelect={() => {
                                                                        setStudentId(sId);
                                                                        setStudentOpen(false);
                                                                        setSearchTerm('');
                                                                    }}>
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4 text-primary',
                                                                            studentId === sId ? 'opacity-100' : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    {s.studentname}
                                                                </CommandItem>
                                                            );
                                                        })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
                                <Label className='pt-2 font-bold text-sm'>Identification Marks:</Label>
                                <Textarea
                                    value={identificationMarks}
                                    onChange={(e) => setIdentificationMarks(e.target.value)}
                                    placeholder='Enter the Identification'
                                    className='min-h-[100px] rounded-xl'
                                    maxLength={200}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-6 border-t pt-8'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={detailsMutation.isPending}
                            className='w-40 rounded-xl bg-blue-600 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 active:scale-95'>
                            {detailsMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <FileText className='mr-2 h-4 w-4' />
                            )}
                            REPORT
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={handleReset}
                            className='w-40 rounded-xl border-2 border-orange-200 font-bold text-orange-600 shadow-md transition-all hover:scale-105 hover:bg-orange-50 active:scale-95'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            className='w-40 rounded-xl bg-zinc-800 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-zinc-900 active:scale-95 disabled:opacity-50'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showCertificate &&
                reportData &&
                reportData.result?.slice(0, 1).map((student: any, index: number) => (
                    <div key={index} className='mt-8 mb-20 flex w-full flex-col items-center'>
                        <div
                            id='SVPITI'
                            ref={printRef}
                            className='w-[210mm] rounded-sm border border-zinc-300 bg-white p-[8mm] shadow-[0_20px_50px_rgba(0,0,0,0.1)] print:m-0 print:border-none print:p-0 print:shadow-none'>
                            <div className='certificate-inner'>
                                {/* Header Section */}
                                <div className='mb-0 flex flex-col items-center border-zinc-300 border-b-4 border-double px-4 pt-1 pb-1'>
                                    <div className='mb-1 w-[350px] shrink-0'>
                                        <img
                                            src={reportData.masterCompany?.[0]?.logo || student.logo}
                                            alt='Institution Logo'
                                            className='h-auto w-full scale-110 object-contain'
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className='my-2 text-center'>
                                    <h2 className='font-bold text-[#1a365d] text-xl tracking-widest underline decoration-2 underline-offset-4'>
                                        TRANSFER CERTIFICATE
                                    </h2>
                                </div>

                                {/* Top Info Grid */}
                                <div className='mb-2 grid grid-cols-[1.2fr_1fr] gap-x-8 px-8 text-[16px]'>
                                    <div className='relative space-y-0'>
                                        <div className='flex'>
                                            <span className='w-[180px] font-bold'>CBSE Affiliation No.</span>
                                            <span>: {student.govtno || '130445'}</span>
                                        </div>
                                        <div className='flex'>
                                            <span className='w-[180px] font-bold'>School Code</span>
                                            <span>: 57709</span>
                                        </div>
                                        <div className='flex text-zinc-900'>
                                            <span className='w-[180px] font-bold'>Tc No</span>
                                            <span className='font-bold'>: {student.astc_tcno}</span>
                                        </div>
                                        <div className='flex'>
                                            <span className='w-[180px] font-bold uppercase'>APAAR No:</span>
                                            <span>: </span>
                                        </div>
                                    </div>
                                    <div className='relative space-y-0'>
                                        <div className='flex'>
                                            <span className='w-[100px] font-bold'>ADM NO.</span>
                                            <span className='font-bold'>: {student.amst_admno}</span>
                                        </div>
                                        <div className='flex'>
                                            <span className='w-[100px] font-bold'>PEN No.</span>
                                            <span>: {student.amst_penno || '-'}</span>
                                        </div>
                                        {/* Aadhaar No display */}
                                        <div className='mt-0 flex'>
                                            <span className='w-[100px] font-bold'>Aadhaar No:</span>
                                            <span className='font-bold text-base'>{student.amst_aadharno}</span>
                                        </div>

                                        {/* Small QR Code if needed */}
                                        <div className='-top-4 -right-2 absolute'>
                                            {reportData.ascisS_QRCode && (
                                                <img src={reportData.ascisS_QRCode} alt='QR' className='h-[60px] w-[60px] opacity-90' />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Data Section */}
                                <div className='space-y-0 px-8 py-1 text-[16px]'>
                                    {[
                                        { label: '1.Name of the pupil', value: student.studentname },
                                        { label: "2.Father's/Guardian's Name", value: student.amst_fathername },
                                        { label: "3.Mother's Name", value: student.amst_mothername },
                                        { label: '4.Nationality', value: student.nationality },
                                        { label: '5.Identification Mark', value: identificationMarks || 'NIL' },
                                        {
                                            label: '6.Whether the candidate belongs to Schedule',
                                            sub: 'Caste/Schedule Tribe/OBC/GEN',
                                            value: student.caste || 'OC'
                                        },
                                        {
                                            label: '7.Date of the First admission in the school with',
                                            sub: 'Class',
                                            value:
                                                `${student.amst_date ? format(new Date(student.amst_date), 'dd/MM/yyyy') : ''}` +
                                                (student.last_class_studied ? `, ${student.last_class_studied}` : '')
                                        },
                                        {
                                            label: '8.Date of birth(In Christian Era)',
                                            sub: 'according to Admission Register',
                                            value: student.amst_dob ? format(new Date(student.amst_dob), 'dd/MM/yyyy') : ''
                                        },
                                        { label: 'in words(in figures)', value: (student.amst_dob_words ?? '').replace(/\s+/g, '-') },
                                        { label: '9.Class in which the pupil last studied', value: student.classname },
                                        {
                                            label: '10.School/Board Annual Examination last',
                                            sub: 'taken with result',
                                            value: student.details || student.astc_conduct || 'PASSED'
                                        },
                                        { label: '11.Whether failed,if so once/twice in the', sub: 'same class', value: 'NA' },
                                        { label: '12.Subjects Studied', value: student.subjectstudied },
                                        {
                                            label: '13.Whether qualified for promotion to the',
                                            sub: 'higher class(in figures)if so, to the which class(in figures)',
                                            value: student.qualificlass || 'YES'
                                        },

                                        {
                                            label: '14.Month upto to which the(pupil has paid)',
                                            sub: 'school dues paid',
                                            value: student.astc_feepaid === 'Yes' ? 'MARCH 2026' : 'DUE'
                                        },
                                        { label: '15.Total no. of working days', value: student.noof_schooldays, editable: true },
                                        { label: '16.Total no. of working days present', value: student.noof_daysattended, editable: true },
                                        {
                                            label: '17.Extra Curricular activities in which the pupil',
                                            sub: 'took part(Mention achievement level therein)',
                                            value: student.astc_scholarship || 'NIL',
                                            editable: true
                                        },
                                        { label: '18.General Conduct', value: student.astc_conduct || 'GOOD' },
                                        {
                                            label: '19.Date of application for the certificate',
                                            value: student.astc_tcapplicationdate
                                                ? format(new Date(student.astc_tcapplicationdate), 'dd/MM/yyyy')
                                                : ''
                                        },
                                        {
                                            label: '20.Date of issue of the certificate',
                                            value: student.astc_tcissuedate ? format(new Date(student.astc_tcissuedate), 'dd/MM/yyyy') : ''
                                        },
                                        { label: '21.Reasons for leaving the school', value: student.astc_leavingreason || 'PERSONAL' },
                                        { label: '22.Any other remarks', value: student.astc_remarks || 'NIL' }
                                    ].map((row, i) => (
                                        <div key={i} className={`flex min-h-[26px] items-end ${i >= 5 ? 'mt-1' : ''}`}>
                                            <div className='w-[50%] shrink-0'>
                                                <p className='font-bold text-[13px] text-zinc-900 uppercase leading-tight'>{row.label}</p>
                                                {row.sub && (
                                                    <p className='text-wrap font-bold text-[13px] text-zinc-900 uppercase leading-tight'>
                                                        {row.sub}
                                                    </p>
                                                )}
                                            </div>
                                            <div className='px-1 font-bold'>:</div>
                                            <div className='flex-1 border-black border-b-[2px] border-dotted px-4 pb-0 text-center'>
                                                <span
                                                    className='font-bold font-serif text-[15px] text-zinc-950 uppercase'
                                                    contentEditable={row.editable}
                                                    suppressContentEditableWarning={true}>
                                                    {row.value || ''}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer / Signatures */}
                                <div className='mt-20 flex items-end justify-between px-12 pb-2'>
                                    <div className='w-[180px] text-center'>
                                        <p className='border-zinc-500 border-t-[2px] pt-1 font-bold text-xs text-zinc-950'>
                                            Signature of Class Teacher
                                        </p>
                                    </div>
                                    <div className='w-[180px] text-center'>
                                        <p className='border-zinc-500 border-t-[2px] pt-1 font-bold text-xs text-zinc-950'>Checked By</p>
                                    </div>
                                    <div className='w-[200px] text-center'>
                                        <div className='border-zinc-500 border-t-[2px] pt-1 font-bold text-xs text-zinc-950'>Principal</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <style jsx global>{`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #SVPITI, #SVPITI * {
                                visibility: visible;
                            }
                            #SVPITI {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 210mm;
                                height: 297mm;
                                margin: 0;
                                padding: 8mm;
                                border: none !important;
                                box-shadow: none !important;
                                overflow: hidden;
                                page-break-after: avoid;
                                page-break-before: avoid;
                            }
                            @page {
                                size: A4;
                                margin: 0;
                            }
                        }
                    `}</style>
                    </div>
                ))}
        </div>
    );
}
