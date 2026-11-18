'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Check, FileText, Printer, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
    useCasteBirthCertificateInitialData,
    useCasteBirthStudentReportMutation,
    useGenerateCasteBirthQRCodeMutation,
    useSearchCasteBirthStudentMutation
} from '@/hooks/admission/preadmission/newsharedhost/reports/useCasteBirthCertificate';

const formSchema = z
    .object({
        allOrIndi: z.enum(['A', 'I']),
        studentStatus: z.enum(['S', 'L', 'D']),
        certificateType: z.string().min(1, 'Please select certificate type'),
        academicYear: z.string().min(1, 'Please select Academic Year'),
        classId: z.string().optional(),
        sectionId: z.string().optional(),
        issueDate: z.date({ required_error: 'Date is required' }),
        studentId: z.string().min(1, 'Please select Student'),
        addressType: z.enum(['address_per', 'address_con']),
        parentNameType: z.enum(['0', '1', '2'])
    })
    .superRefine((data, ctx) => {
        if (data.allOrIndi === 'I') {
            if (!data.classId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Class',
                    path: ['classId']
                });
            }
            if (!data.sectionId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select Section',
                    path: ['sectionId']
                });
            }
        }
    });

type FormValues = z.infer<typeof formSchema>;

export default function CasteBirthCertificate() {
    const printRef = useRef<HTMLDivElement>(null);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [certificateData, setCertificateData] = useState<any>(null);
    const [showCertificate, setShowCertificate] = useState(false);

    // Default config values
    const [isBoysSchool, setIsBoysSchool] = useState(false);
    const [isGirlsSchool, setIsGirlsSchool] = useState(false);
    const [isCoEdSchool, setIsCoEdSchool] = useState(false);
    const [isCommon, setIsCommon] = useState(true);
    const [showFatherMotherRadio, setShowFatherMotherRadio] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [studentOpen, setStudentOpen] = useState(false);
    const [selectedStudentData, setSelectedStudentData] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: initialData, isLoading: isInitialLoading } = useCasteBirthCertificateInitialData();
    const searchStudentMutation = useSearchCasteBirthStudentMutation();
    const reportMutation = useCasteBirthStudentReportMutation();
    const qrCodeMutation = useGenerateCasteBirthQRCodeMutation();

    const academicYears: any[] = Array.isArray(initialData?.data?.allAcademicYear) ? initialData.data.allAcademicYear : [];
    const classes: any[] = Array.isArray(initialData?.data?.allclasslist) ? initialData.data.allclasslist : [];
    const sections: any[] = Array.isArray(initialData?.data?.allsectionlist) ? initialData.data.allsectionlist : [];

    useEffect(() => {
        const masterCompany: any = initialData?.data?.masterCompany;
        if (masterCompany && masterCompany.length > 0 && masterCompany[0]?.mI_Id === 6) {
            setShowFatherMotherRadio(true);
        } else {
            setShowFatherMotherRadio(false);
        }
    }, [initialData]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            allOrIndi: 'A',
            studentStatus: 'S',
            certificateType: '0', // 0 = Caste/Birth Certificate
            academicYear: '',
            classId: '',
            sectionId: '',
            issueDate: new Date(),
            studentId: '',
            addressType: 'address_per',
            parentNameType: '0'
        }
    });

    const allOrIndi = form.watch('allOrIndi');
    const studentStatus = form.watch('studentStatus');
    const academicYear = form.watch('academicYear');
    const classId = form.watch('classId');
    const sectionId = form.watch('sectionId');
    const addressType = form.watch('addressType');
    const parentNameType = form.watch('parentNameType');

    // Disable class/section validation if 'A' is selected
    useEffect(() => {
        if (allOrIndi === 'A') {
            form.setValue('classId', '');
            form.setValue('sectionId', '');
        }
    }, [allOrIndi, form]);

    const handleSearchStudent = (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setStudentList([]);
            return;
        }

        let searchClassId = 0;
        let searchSectionId = 0;

        if (allOrIndi === 'I') {
            searchClassId = Number(classId) || 0;
            searchSectionId = Number(sectionId) || 0;
        }

        const data = {
            filterinitialdata: studentStatus,
            searchfilter: searchQuery,
            ASMAY_Id: Number(academicYear),
            AMST_SOL: studentStatus,
            ASMCL_Id: searchClassId,
            ASMC_Id: searchSectionId,
            allorindid: allOrIndi
        };

        searchStudentMutation.mutate(data, {
            onSuccess: (res: any) => {
                if (res?.data?.count > 0) {
                    setStudentList(res.data.fillstudlist);
                } else {
                    setStudentList([]);
                }
            }
        });
    };

    useEffect(() => {
        handleSearchStudent(debouncedSearch);
    }, [debouncedSearch, allOrIndi, studentStatus, academicYear, classId, sectionId]);

    const onSubmit = (values: FormValues) => {
        const reqData = {
            ASMAY_Id: Number(values.academicYear) || 0,
            ASMCL_Id: Number(values.classId) || 0,
            ASMC_Id: Number(values.sectionId) || 0,
            AMST_Id: Number(values.studentId),
            save_flag: true
        };

        reportMutation.mutate(reqData, {
            onSuccess: (res: any) => {
                const responseData = res?.data;
                if (responseData?.studentlist && responseData.studentlist.length > 0) {
                    const student = responseData.studentlist[0];
                    const miId = Number.parseInt(responseData.masterCompany?.[0]?.mI_Id || '0');

                    setIsCoEdSchool(miId === 5);
                    setIsGirlsSchool(miId === 4);
                    setIsBoysSchool(miId === 6);
                    setIsCommon(miId !== 4 && miId !== 5 && miId !== 6);

                    let fatherNameStr = student.fathername || student.fatherName || '';
                    const motherNameStr = student.mothername || student.motherName || '';

                    if (miId === 6) {
                        if (values.parentNameType === '0') fatherNameStr = `Mr. ${fatherNameStr}`;
                        else if (values.parentNameType === '1') fatherNameStr = `Mrs. ${motherNameStr}`;
                        else if (values.parentNameType === '2') fatherNameStr = `Mr. ${fatherNameStr} And Mrs. ${motherNameStr}`;
                    }

                    const selectedYearName =
                        academicYears.find((yr: any) => yr.asmaY_Id.toString() === values.academicYear)?.asmaY_Year || '';
                    const sex = (student.AMST_Sex || student.amsT_Sex || '').toLowerCase();

                    setCertificateData({
                        ...student,
                        studentnam: student.amsT_FirstName || student.studentnam,
                        admno: student.amsT_AdmNo || student.admno,
                        class: student.joinedclass || student.class,
                        acadamicyear: selectedYearName,
                        issueDate: values.issueDate,
                        fatherNameFormatted: fatherNameStr,
                        genderTitle: sex === 'male' ? 'Kumar' : 'Kumari',
                        relationTitle: sex === 'male' ? 'S/O' : 'D/O',
                        genderPronoun: sex === 'male' ? 'He' : 'She',
                        principalSign: responseData.principalsign?.[0]?.ivrmgC_PrincipalSign || '',
                        principalName:
                            responseData.principalsign?.[0]?.emp_Name || responseData.principalsign?.[0]?.ivrmgC_PrincipalName || '',
                        MI_Logo: responseData.logo?.[0]?.logo || student.MI_Logo || '',
                        masterCompany: responseData.masterCompany?.[0] || {}
                    });

                    setShowCertificate(true);

                    // Generate QR Code as well
                    const qrData = {
                        ASMAY_Id: reqData.ASMAY_Id,
                        ASMCL_Id: reqData.ASMCL_Id,
                        ASMC_Id: reqData.ASMC_Id,
                        AMST_Id: reqData.AMST_Id,
                        CertificateDate: values.issueDate,
                        ASCISS_HtmlTemplate: 'Template Data', // simplified
                        ASCISS_CertificateFlg: 'SC'
                    };
                    qrCodeMutation.mutate(qrData);
                } else {
                    toast.error('Record not found');
                    setShowCertificate(false);
                }
            },
            onError: () => {
                toast.error('Failed to generate report');
            }
        });
    };

    const handleClear = () => {
        window.location.reload();
    };

    const handlePrint = () => {
        const innerContents = printRef.current?.innerHTML;
        if (!innerContents) return;

        const popupWindow = window.open('', '_blank');
        if (popupWindow) {
            popupWindow.document.open();
            popupWindow.document.write(`
                <html>
                    <head>
                        <title>Caste/Birth Certificate</title>
                        <style>
                            @page { size: A4; margin: 0; }
                            html, body { background: #fff; margin: 0; padding: 0; font-family: 'Times New Roman', serif; }
                            .print-container {
                                width: 210mm;
                                height: 297mm;
                                padding: 24mm 20mm 25mm 20mm;
                                margin: auto;
                                border: 8px double #000;
                                box-sizing: border-box;
                                position: relative;
                            }
                            .u-long, .u-mid {
                                display: inline-block;
                                border-bottom: 1px dotted #000;
                                text-align: center;
                                padding: 0 4px;
                            }
                            .u-long { min-width: 300px; }
                            .u-mid { min-width: 150px; }
                            .certificate-title {
                                font-size: 26px; font-weight: bold; text-decoration: underline; text-align: center; margin-top: 15px;
                            }
                            .header-container { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 1rem; }
                            .header-logo { height: auto; width: 100%; max-width: 600px; max-height: 150px; object-fit: contain; margin-bottom: 0.5rem; }
                            .header-text-container { text-align: center; }
                            .header-school-name { color: #2563eb; font-weight: bold; font-size: 1.5rem; margin-bottom: 0.25rem; }
                            .header-address { font-size: 0.875rem; margin: 0; }
                            .certificate-header img { width: 100%; max-width: 520px; }
                            hr { border: 1px solid #000; width: 100%; margin: 10px 0; }
                            .certificate-body { font-size: 20px; line-height: 34px; margin-top: 10px; }
                            .certificate-footer { display: flex; justify-content: space-between; font-size: 18px; margin-top: 50px; }
                            .principal-sign { text-align: center; font-weight: bold; }
                            .principal-sign div { border-top: 1px solid #000; padding-top: 5px; width: 220px; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .text-right { text-align: right; }
                            .font-bold { font-weight: bold; }
                            .text-2xl { font-size: 1.5rem; }
                            .text-lg { font-size: 1.125rem; }
                            .underline { text-decoration: underline; }
                            .inline-block { display: inline-block; }
                            .border-b { border-bottom: 2px solid #000; }
                            .border-dotted { border-bottom-style: dotted; border-top: none; border-left: none; border-right: none; }
                            .border-black { border-bottom-color: #000; }
                            .min-w-\\[80px\\] { min-width: 80px; }
                            .min-w-\\[100px\\] { min-width: 100px; }
                            .min-w-\\[120px\\] { min-width: 120px; }
                            .min-w-\\[150px\\] { min-width: 150px; }
                            .min-w-\\[200px\\] { min-width: 200px; }
                            .min-w-\\[250px\\] { min-width: 250px; }
                            .min-w-\\[300px\\] { min-width: 300px; }
                            .min-w-\\[350px\\] { min-width: 350px; }
                            .min-w-\\[400px\\] { min-width: 400px; }
                            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                            .px-4 { padding-left: 1rem; padding-right: 1rem; }
                            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
                            .mt-8 { margin-top: 2rem; }
                            .mt-10 { margin-top: 2.5rem; }
                            .mt-12 { margin-top: 3rem; }
                            .mt-16 { margin-top: 4rem; }
                            .mb-2 { margin-bottom: 0.5rem; }
                            .mb-4 { margin-bottom: 1rem; }
                            .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
                            .flex { display: flex; }
                            .flex-col { flex-direction: column; }
                            .items-center { align-items: center; }
                            .items-start { align-items: flex-start; }
                            .items-end { align-items: flex-end; }
                            .justify-center { justify-content: center; }
                            .justify-between { justify-content: space-between; }
                            .space-y-4 > * + * { margin-top: 1rem; }
                            .w-full { width: 100%; }
                            .max-w-lg { max-width: 32rem; }
                            .max-w-2xl { max-width: 42rem; }
                            .max-h-36 { max-height: 9rem; }
                            .object-contain { object-fit: contain; }
                            .uppercase { text-transform: uppercase; }
                            .text-sm { font-size: 0.875rem; }
                            .max-w-lg { max-width: 32rem; }
                            .mx-auto { margin-left: auto; margin-right: auto; }
                            .leading-loose { line-height: 2; }
                            .text-justify { text-align: justify; }
                            .border-t-2 { border-top-width: 2px; }
                            .border-8 { border-width: 8px; }
                            .border-double { border-style: double; }
                            .p-8 { padding: 2rem; }
                        </style>
                    </head>
                    <body onload="window.print()" onfocus="window.setTimeout(function() { window.close(); }, 100);">
                        ${innerContents}
                    </body>
                </html>
            `);
            popupWindow.document.close();
        }
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <CollapsibleSection title='Caste/Birth Certificate Report' defaultOpen={true} className='shadow-lg'>
                        <div className='grid grid-cols-1 gap-4 bg-white p-6 md:grid-cols-3'>
                            {/* Radio Groups */}
                            <FormField
                                control={form.control}
                                name='allOrIndi'
                                render={({ field }) => (
                                    <FormItem className='flex items-center justify-center rounded-md border p-2'>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className='flex flex-row space-x-6'>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='A' />
                                                    </FormControl>
                                                    <FormLabel className='cursor-pointer font-normal text-sm'>All</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='I' />
                                                    </FormControl>
                                                    <FormLabel className='cursor-pointer font-normal text-sm'>Individual</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='studentStatus'
                                render={({ field }) => (
                                    <FormItem className='flex items-center justify-center rounded-md border p-2'>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className='flex flex-row space-x-4'>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='S' />
                                                    </FormControl>
                                                    <FormLabel className='cursor-pointer font-normal text-sm'>Studying</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='L' />
                                                    </FormControl>
                                                    <FormLabel className='cursor-pointer font-normal text-sm'>Left</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='D' />
                                                    </FormControl>
                                                    <FormLabel className='cursor-pointer font-normal text-sm'>Deactive</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='certificateType'
                                render={({ field }) => (
                                    <FormItem className='flex items-center justify-center rounded-md border p-2'>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='0' />
                                                    </FormControl>
                                                    <FormLabel className='cursor-pointer font-normal text-sm'>
                                                        Caste/Birth Certificate
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-6 border-t bg-gray-50 p-6 md:grid-cols-2'>
                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='academicYear'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Academic Year:<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {academicYears.map((yr: any) => (
                                                        <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                                            {yr.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='classId'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Class:{allOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={allOrIndi === 'A'}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classes.map((cls: any) => (
                                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='sectionId'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Section:{allOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={allOrIndi === 'A'}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sections.map((sec: any) => (
                                                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='issueDate'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Date:<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker date={field.value} setDate={field.onChange} />
                                            </FormControl>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='studentId'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Student:<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <div className='w-full'>
                                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            role='combobox'
                                                            className={cn(
                                                                'h-auto w-full justify-between rounded-md border bg-white p-2 font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}>
                                                            <span className='truncate pr-2'>
                                                                {field.value && selectedStudentData
                                                                    ? `${selectedStudentData.amsT_FirstName} ${selectedStudentData.amsT_MiddleName || ''} ${selectedStudentData.amsT_LastName || ''}`
                                                                    : '--Select Student--'}
                                                            </span>
                                                            <div className='flex shrink-0 items-center'>
                                                                {field.value && (
                                                                    <X
                                                                        className='mr-1 h-4 w-4 cursor-pointer opacity-50 hover:opacity-100'
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            field.onChange('');
                                                                            setSelectedStudentData(null);
                                                                        }}
                                                                    />
                                                                )}
                                                                <Search className='h-4 w-4 opacity-50' />
                                                            </div>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-[400px] p-0' align='start'>
                                                        <Command shouldFilter={false}>
                                                            <CommandInput
                                                                placeholder='Type to search (min 2 chars)...'
                                                                className='h-9'
                                                                onValueChange={setSearchTerm}
                                                                value={searchTerm}
                                                            />
                                                            <CommandList>
                                                                <CommandEmpty>No student found.</CommandEmpty>
                                                                <CommandGroup className='max-h-64 overflow-y-auto'>
                                                                    {studentList.map((s: any) => (
                                                                        <CommandItem
                                                                            key={s.amsT_Id}
                                                                            value={s.amsT_Id.toString()}
                                                                            onSelect={() => {
                                                                                field.onChange(s.amsT_Id.toString());
                                                                                setSelectedStudentData(s);
                                                                                setStudentOpen(false);
                                                                                setSearchTerm('');
                                                                            }}>
                                                                            <div className='flex flex-col py-1'>
                                                                                <span className='font-semibold text-indigo-900'>
                                                                                    {s.amsT_FirstName} {s.amsT_MiddleName || ''}{' '}
                                                                                    {s.amsT_LastName || ''}
                                                                                </span>
                                                                            </div>
                                                                            {field.value === s.amsT_Id.toString() && (
                                                                                <Check className='ml-auto h-4 w-4 text-indigo-600' />
                                                                            )}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='addressType'
                                    render={({ field }) => (
                                        <FormItem className='mt-4'>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className='flex justify-center space-x-4'>
                                                    <FormItem className='flex items-center space-x-2'>
                                                        <FormControl>
                                                            <RadioGroupItem value='address_per' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>Permanent Address</FormLabel>
                                                    </FormItem>
                                                    <FormItem className='flex items-center space-x-2'>
                                                        <FormControl>
                                                            <RadioGroupItem value='address_con' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>Communication Address</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {showFatherMotherRadio && (
                                    <FormField
                                        control={form.control}
                                        name='parentNameType'
                                        render={({ field }) => (
                                            <FormItem className='mt-4'>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className='flex justify-center space-x-4'>
                                                        <FormItem className='flex items-center space-x-2'>
                                                            <FormControl>
                                                                <RadioGroupItem value='0' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Father Name</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2'>
                                                            <FormControl>
                                                                <RadioGroupItem value='1' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Mother Name</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2'>
                                                            <FormControl>
                                                                <RadioGroupItem value='2' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Both</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                        <div className='flex items-center justify-center space-x-3 border-t bg-white p-4'>
                            <Button
                                type='submit'
                                disabled={reportMutation.isPending}
                                className='w-auto bg-[#3f51b5] px-6 text-white hover:bg-[#303f9f]'>
                                <FileText className='mr-2 h-4 w-4' /> REPORT
                            </Button>
                            <Button
                                type='button'
                                onClick={handleClear}
                                variant='destructive'
                                className='w-auto bg-[#ff5722] px-6 text-white hover:bg-[#e64a19]'>
                                <X className='mr-2 h-4 w-4' /> CANCEL
                            </Button>
                            <Button
                                type='button'
                                onClick={handlePrint}
                                disabled={!showCertificate}
                                className='w-auto bg-[#e0e0e0] px-6 text-gray-700 hover:bg-[#d5d5d5]'>
                                <Printer className='mr-2 h-4 w-4 text-gray-600' /> PRINT
                            </Button>
                        </div>
                    </CollapsibleSection>
                </form>
            </Form>

            {/* Print Section */}
            {showCertificate && certificateData && (
                <div className='overflow-x-auto bg-white p-8 shadow-lg'>
                    <div ref={printRef} className='print-section' style={{ padding: '20px' }}>
                        <style type='text/css' media='print'>
                            {`
                                @page { size: A4; margin: 0; }
                                html, body { background: #fff; margin: 0; padding: 0; }
                                .print-container {
                                    width: 210mm;
                                    height: 297mm;
                                    padding: 24mm 20mm 25mm 20mm;
                                    margin: auto;
                                    border: 8px double #000;
                                    box-sizing: border-box;
                                    font-family: 'Times New Roman', serif;
                                    position: relative;
                                }
                                .u-long, .u-mid {
                                    display: inline-block;
                                    border-bottom: 1px dotted #000;
                                    text-align: center;
                                    padding: 0 4px;
                                }
                                .u-long { min-width: 300px; }
                                .u-mid { min-width: 150px; }
                                .header-container { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 1rem; }
                                .header-logo { height: auto; width: 100%; max-width: 600px; max-height: 150px; object-fit: contain; margin-bottom: 0.5rem; }
                                .header-text-container { text-align: center; }
                                .header-school-name { color: #2563eb; font-weight: bold; font-size: 1.5rem; margin-bottom: 0.25rem; }
                                .header-address { font-size: 0.875rem; margin: 0; }
                                .certificate-title {
                                    font-size: 26px; font-weight: bold; text-decoration: underline; text-align: center; margin-top: 15px;
                                }
                                .certificate-header img { width: 100%; max-width: 520px; }
                                hr { border: 1px solid #000; width: 100%; margin: 10px 0; }
                                .certificate-body { font-size: 20px; line-height: 34px; text-align: justify; margin-top: 10px; }
                                .certificate-footer { display: flex; justify-content: space-between; font-size: 18px; margin-top: 50px; }
                                .principal-sign { text-align: center; font-weight: bold; }
                                .principal-sign div { border-top: 1px solid #000; padding-top: 5px; width: 220px; }
                            `}
                        </style>
                        <div
                            className='print-container border-8 border-black border-double p-8 font-serif'
                            style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div className='header-container mb-4 flex flex-col items-center justify-center'>
                                {certificateData.MI_Logo && (
                                    <img
                                        src={certificateData.MI_Logo}
                                        alt='Institution Logo'
                                        className='header-logo mb-2 max-h-36 w-full max-w-2xl object-contain'
                                    />
                                )}
                                {certificateData.masterCompany && (
                                    <div className='header-text-container text-center'>
                                        <p className='header-address text-sm'>
                                            {certificateData.masterCompany.mI_Address1
                                                ? `${certificateData.masterCompany.mI_Address1}, `
                                                : ''}
                                            {certificateData.masterCompany.mI_Address2
                                                ? `${certificateData.masterCompany.mI_Address2}, `
                                                : ''}
                                            {certificateData.masterCompany.mI_Address3
                                                ? `${certificateData.masterCompany.mI_Address3}`
                                                : ''}
                                            {certificateData.masterCompany.mI_Pincode ? `-${certificateData.masterCompany.mI_Pincode}` : ''}
                                        </p>
                                        {certificateData.masterCompany.mI_Email && (
                                            <p className='header-address text-sm'>Email: {certificateData.masterCompany.mI_Email}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <hr className='my-4 border-black border-t-2' />
                            <div className='text-center'>
                                <div className='my-4 font-bold text-2xl underline'>CASTE / BIRTH CERTIFICATE</div>
                            </div>

                            <div className='mt-8 px-4 text-lg leading-loose'>
                                <div className='mt-4'>
                                    I, do hereby certify that{' '}
                                    <span className='inline-block min-w-[300px] border-black border-b border-dotted px-2 text-center font-bold uppercase'>
                                        {certificateData.studentnam}
                                    </span>
                                    {certificateData.relationTitle}{' '}
                                    <span className='inline-block min-w-[250px] border-black border-b border-dotted px-2 text-center uppercase'>
                                        {certificateData.fatherNameFormatted}
                                    </span>
                                    is a student of our institute. {certificateData.genderPronoun} is studying in class{' '}
                                    <span className='inline-block min-w-[80px] border-black border-b border-dotted px-2 text-center font-bold'>
                                        {certificateData.class}
                                    </span>
                                    in{' '}
                                    <span className='inline-block min-w-[120px] border-black border-b border-dotted px-2 text-center'>
                                        {certificateData.acadamicyear}
                                    </span>{' '}
                                    the academic year with Admission Number{' '}
                                    <span className='inline-block min-w-[120px] border-black border-b border-dotted px-2 text-center'>
                                        {certificateData.admno}
                                    </span>
                                    & Enrollment Number{' '}
                                    <span className='inline-block min-w-[150px] border-black border-b border-dotted px-2 text-center'>
                                        {certificateData.RegistrationNo}
                                    </span>
                                    .
                                </div>
                                <div className='mt-8'>
                                    I declare that {certificateData.genderPronoun} belongs that
                                    <span className='inline-block min-w-[200px] border-black border-b border-dotted px-2 text-center font-bold'>
                                        {certificateData.caste_name}
                                    </span>{' '}
                                    caste belonging to
                                    <span className='inline-block min-w-[200px] border-black border-b border-dotted px-2 text-center font-bold'>
                                        {certificateData.CategoryName}
                                    </span>{' '}
                                    category as per school register.
                                    {certificateData.genderPronoun === 'He' ? 'His' : 'Her'} date of birth is
                                    <span className='inline-block min-w-[120px] border-black border-b border-dotted px-2 text-center'>
                                        {certificateData.dob ? format(new Date(certificateData.dob), 'dd-MM-yyyy') : ''}
                                    </span>
                                    (In words)
                                    <span className='inline-block min-w-[300px] border-black border-b border-dotted px-2 text-center uppercase'>
                                        {certificateData.dobwords}
                                    </span>
                                    .
                                </div>
                            </div>

                            <div className='mt-16 flex items-start justify-between px-4 text-lg'>
                                <div className='space-y-4'>
                                    <div>
                                        <strong>Date:</strong>{' '}
                                        <span className='inline-block min-w-[150px] border-black border-b border-dotted px-2 text-center'>
                                            {certificateData.issueDate
                                                ? format(certificateData.issueDate, 'dd-MM-yyyy')
                                                : format(new Date(), 'dd-MM-yyyy')}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Place:</strong>{' '}
                                        <span className='inline-block min-w-[150px] border-black border-b border-dotted px-2 text-center'>
                                            {certificateData.area}
                                        </span>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    <div style={{ borderBottom: '2px solid black', width: '250px', marginBottom: '4px' }}></div>
                                    <div style={{ width: '250px', textAlign: 'center', fontWeight: 'bold' }}>Principal Signature</div>

                                    <div className='mt-12'>
                                        <strong>Full Name:</strong>{' '}
                                        <span className='inline-block min-w-[200px] border-black border-b border-dotted px-2 text-center uppercase'>
                                            {certificateData.principalName || ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-10 mb-4 text-center text-lg'>
                                <span className='inline-block min-w-[200px] border-black border-b border-dotted'></span> Thanking you{' '}
                                <span className='inline-block min-w-[200px] border-black border-b border-dotted'></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
