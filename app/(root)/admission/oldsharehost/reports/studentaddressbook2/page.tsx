'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useStudentAddressBook2InitialData,
    useStudentAddressBook2Report,
    useStudentAddressBook2SectionChange,
    useStudentAddressBook2YearChange
} from '@/hooks/admission/oldsharehost/reports/useStudentAddressBook2';

const formSchema = z
    .object({
        sall: z.string(), // "1" = All, "0" = Individual
        flag: z.string(), // "S" = Studying, "L" = Left
        asmaY_Id: z.string().min(1, 'Select Academic Year'),
        asmcL_Id: z.string().min(1, 'Select Class'),
        asmC_Id: z.string().min(1, 'Select Section'),
        amsT_Id: z.string().optional(),

        email: z.boolean().default(false),
        dob: z.boolean().default(false),
        ph: z.boolean().default(false),
        tc: z.boolean().default(false),
        per: z.string().default('1')
    })
    .superRefine((data, ctx) => {
        if (data.sall === '0' && (!data.amsT_Id || data.amsT_Id === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Student',
                path: ['amsT_Id']
            });
        }
    });

type FormValues = z.infer<typeof formSchema>;

export default function StudentAddressBook2Page() {
    const { data: initialData, isLoading: isInitialLoading } = useStudentAddressBook2InitialData();
    const sectionChangeMutation = useStudentAddressBook2SectionChange();
    const yearChangeMutation = useStudentAddressBook2YearChange();
    const reportMutation = useStudentAddressBook2Report();

    const [items, setItems] = useState<any[]>([]);
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);
    const [logoPath, setLogoPath] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const [viewOptions, setViewOptions] = useState({
        email: false,
        dob: false,
        ph: false,
        tc: false,
        per: '1'
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sall: '1',
            flag: 'S',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: '',
            amsT_Id: '',
            email: false,
            dob: false,
            ph: false,
            tc: false,
            per: '1'
        }
    });

    const watchSall = form.watch('sall');
    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmC_Id');
    const watchFlag = form.watch('flag');

    useEffect(() => {
        if (watchSall === '0') {
            if (watchYear && watchClass && watchSection) {
                sectionChangeMutation
                    .mutateAsync({
                        ASMAY_Id: Number(watchYear),
                        ASMCL_Id: Number(watchClass),
                        ASMS_Id: Number(watchSection), // Passes as ASMS_Id
                        flag: watchFlag
                    })
                    .then((res) => {
                        if (res?.data?.studentlist) {
                            setStudentDropdown(res.data.studentlist);
                        }
                    })
                    .catch(() => {
                        toast.error('Failed to fetch students');
                    });
            } else if (watchYear && watchFlag) {
                yearChangeMutation
                    .mutateAsync({
                        ASMAY_Id: Number(watchYear),
                        flag: watchFlag
                    })
                    .then((res) => {
                        if (res?.data?.studentlist) {
                            setStudentDropdown(res.data.studentlist);
                        }
                    })
                    .catch(() => {
                        toast.error('Failed to fetch students');
                    });
            }
        }
    }, [watchYear, watchClass, watchSection, watchFlag, watchSall]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);
            const payload = {
                ASMAY_Id: Number(data.asmaY_Id),
                ASMCL_Id: Number(data.asmcL_Id),
                ASMS_Id: Number(data.asmC_Id),
                AMST_Id: data.sall === '0' ? Number(data.amsT_Id) : 0,
                flag: data.flag,
                sall: data.sall
            };

            const res = await reportMutation.mutateAsync(payload);
            const resultData = res?.data;

            if (!resultData?.result || resultData.result.length === 0) {
                toast.info('No Records Found!');
                setItems([]);
                return;
            }

            setItems(resultData.result);
            if (resultData.masterCompany && resultData.masterCompany.length > 0) {
                setLogoPath(resultData.masterCompany[0].logo);
            }

            setViewOptions({
                email: data.email,
                dob: data.dob,
                ph: data.ph,
                tc: data.tc,
                per: data.per
            });
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        window.location.reload();
    };

    const handlePrint = () => {
        if (!printRef.current) {
            toast.error('Nothing to print');
            return;
        }

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Student Address Book</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: auto; margin: 10mm; }
                                body { padding: 0; margin: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body onload="setTimeout(function() { window.print(); window.close(); }, 1000);">
                        ${logoPath ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${logoPath}" alt="School Logo" style="max-height: 100px; margin: 0 auto;" /></div>` : ''}
                        <div class="grid grid-cols-2 gap-4 text-xs">
                            ${printContent}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            toast.error('Please allow popups to print');
        }
    };

    const handleExportExcel = () => {
        if (items.length === 0) return;

        const dataToExport = items.map((item) => ({
            'Student Name': item.AMST_FirstName,
            'Admission No': item.AMST_AdmNo,
            'Reg No': item.AMST_RegistrationNo,
            DOA: item.AMST_Date ? format(new Date(item.AMST_Date), 'dd-MM-yyyy') : '',
            'Class Name': `${item.ASMCL_ClassName} - ${item.ASMC_SectionName}`,
            Gender: item.AMST_Sex,
            'Blood Group': item.AMST_BloodGroup,
            'Father Name': item.AMST_FatherName,
            'Mother Name': item.AMST_MotherName,
            ...(viewOptions.dob ? { DOB: item.AMST_DOB ? format(new Date(item.AMST_DOB), 'dd-MM-yyyy') : '' } : {}),
            ...(viewOptions.email ? { Email: item.AMST_emailId } : {}),
            ...(viewOptions.ph ? { 'Phone No': item.AMST_MobileNo } : {}),
            ...(viewOptions.tc ? { 'School TC Submited': item.AMST_SOL === 'L' ? 'Yes' : 'No' } : {}),
            Address:
                viewOptions.per === '1'
                    ? `${item.AMST_PerStreet || ''}, ${item.AMST_PerArea || ''}, ${item.AMST_PerCity || ''}`
                    : `${item.AMST_ConStreet || ''}, ${item.AMST_ConArea || ''}, ${item.AMST_ConCity || ''}`
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Address_Book');
        XLSX.writeFile(wb, 'Student_Address_Book.xlsx');
    };

    const ddate = new Date();
    const usrname = typeof window !== 'undefined' ? localStorage.getItem('username') || 'User' : 'User';

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4 print:bg-white print:p-0'>
            <div className='print:hidden'>
                <CollapsibleSection title='Student Address Book 2' defaultOpen={true} variant='outline' className='shadow-md'>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg bg-white p-6'>
                        <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
                            <div className='space-y-4'>
                                <div className='rounded-md border bg-gray-50 p-4'>
                                    <Controller
                                        name='sall'
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val === '1') {
                                                        form.setValue('amsT_Id', '');
                                                    }
                                                }}
                                                value={field.value}
                                                className='flex flex-row justify-center space-x-4'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='1' id='sal-1' />
                                                    <Label htmlFor='sal-1'>All</Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='0' id='sal-0' />
                                                    <Label htmlFor='sal-0'>Individual</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>

                                <div className='rounded-md border bg-gray-50 p-4'>
                                    <Controller
                                        name='flag'
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className='flex flex-row justify-center space-x-4'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='S' id='flag-s' />
                                                    <Label htmlFor='flag-s'>Studying</Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='L' id='flag-l' />
                                                    <Label htmlFor='flag-l'>Left</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Academic Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.accyear?.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmaY_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.asmaY_Id.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Class:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.classlist?.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmcL_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.asmcL_Id.message}</span>
                                    )}
                                </div>

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Section:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmC_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData?.data?.sectionlist?.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.asmC_Id && (
                                        <span className='text-red-500 text-sm'>{form.formState.errors.asmC_Id.message}</span>
                                    )}
                                </div>

                                {watchSall === '0' && (
                                    <div className='space-y-2'>
                                        <Label className='font-bold text-sm'>
                                            Student:<span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='amsT_Id'
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={studentDropdown.length === 0}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Student' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {studentDropdown.map((item: any) => (
                                                            <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                                {item.amsT_FirstName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {form.formState.errors.amsT_Id && (
                                            <span className='text-red-500 text-sm'>{form.formState.errors.amsT_Id.message}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className='space-y-4'>
                                <div className='flex flex-wrap justify-center gap-4 rounded-md border bg-gray-50 p-4'>
                                    <Controller
                                        name='email'
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox id='email' checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor='email'>Email</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name='dob'
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox id='dob' checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor='dob'>Date Of Birth</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name='ph'
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox id='ph' checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor='ph'>Phone No.</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name='tc'
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox id='tc' checked={field.value} onCheckedChange={field.onChange} />
                                                <Label htmlFor='tc'>Previous School TC Submited</Label>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className='flex flex-col space-y-4 rounded-md border bg-gray-50 p-4'>
                                    <Label className='font-semibold'>Address:</Label>
                                    <Controller
                                        name='per'
                                        control={form.control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className='flex flex-row justify-center space-x-4'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='1' id='per-1' />
                                                    <Label htmlFor='per-1'>Permanent</Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='2' id='per-2' />
                                                    <Label htmlFor='per-2'>Temporary</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-center gap-4 border-t pt-4'>
                            <Button
                                type='submit'
                                disabled={isGenerating}
                                className='min-w-[120px] bg-indigo-600 font-bold text-white hover:bg-indigo-700'>
                                {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                                Submit
                            </Button>

                            <Button type='button' onClick={handleClear} variant='destructive' className='min-w-[120px] font-bold'>
                                <X className='mr-2 h-4 w-4' />
                                Clear
                            </Button>

                            {items.length > 0 && (
                                <>
                                    <Button
                                        type='button'
                                        onClick={handleExportExcel}
                                        className='min-w-[120px] bg-green-600 font-bold text-white hover:bg-green-700'>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                                        Excel
                                    </Button>

                                    <Button
                                        type='button'
                                        onClick={handlePrint}
                                        className='min-w-[120px] bg-gray-600 font-bold text-white hover:bg-gray-700'>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </CollapsibleSection>
            </div>

            {/* Print Section */}
            {items.length > 0 && (
                <div ref={printRef} className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 print:grid-cols-2 print:gap-4 print:text-xs'>
                    {items.map((user, idx) => (
                        <div
                            key={idx}
                            className='flex min-h-[300px] break-inside-avoid flex-col border-blue-800 border-t-2 border-b-2 bg-white p-4'>
                            <h3 className='mb-3 border-yellow-500 border-b pb-2 font-bold text-blue-800 text-sm uppercase'>
                                {user.AMST_FirstName} ADDRESS BOOK
                            </h3>
                            <div className='flex gap-4'>
                                <div className='flex-1 space-y-1.5 text-sm print:text-xs'>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Student Name</span>
                                        <span>: {user.AMST_FirstName}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Admission No</span>
                                        <span>: {user.AMST_AdmNo}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Reg No</span>
                                        <span>: {user.AMST_RegistrationNo}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>DOA</span>
                                        <span>: {user.AMST_Date ? format(new Date(user.AMST_Date), 'dd-MM-yyyy') : ''}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Class Name</span>
                                        <span>
                                            : {user.ASMCL_ClassName} - {user.ASMC_SectionName}
                                        </span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Gender</span>
                                        <span>: {user.AMST_Sex}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Blood Group</span>
                                        <span>: {user.AMST_BloodGroup || 'Not Available'}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Father Name</span>
                                        <span>: {user.AMST_FatherName}</span>
                                    </div>
                                    <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>Mother Name</span>
                                        <span>: {user.AMST_MotherName}</span>
                                    </div>

                                    {viewOptions.dob && (
                                        <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                            <span className='font-semibold text-gray-700'>DOB</span>
                                            <span>: {user.AMST_DOB ? format(new Date(user.AMST_DOB), 'dd-MM-yyyy') : ''}</span>
                                        </div>
                                    )}
                                    {viewOptions.email && (
                                        <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                            <span className='font-semibold text-gray-700'>Email</span>
                                            <span className='break-all'>: {user.AMST_emailId}</span>
                                        </div>
                                    )}
                                    {viewOptions.ph && (
                                        <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                            <span className='font-semibold text-gray-700'>Phone No.</span>
                                            <span>: {user.AMST_MobileNo}</span>
                                        </div>
                                    )}
                                    {viewOptions.tc && (
                                        <div className='grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                            <span className='font-semibold text-gray-700'>School TC Submited</span>
                                            <span className='font-bold'>: {user.AMST_SOL === 'L' ? 'Yes' : 'No'}</span>
                                        </div>
                                    )}

                                    <div className='mt-2 grid grid-cols-[140px_auto] print:grid-cols-[120px_auto]'>
                                        <span className='font-semibold text-gray-700'>
                                            {viewOptions.per === '1' ? 'Permanent Address' : 'Temporary Address'}
                                        </span>
                                        <span className='break-words'>
                                            :{' '}
                                            {viewOptions.per === '1'
                                                ? [user.AMST_PerStreet, user.AMST_PerArea, user.AMST_PerCity].filter(Boolean).join(', ')
                                                : [user.AMST_ConStreet, user.AMST_ConArea, user.AMST_ConCity].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                </div>
                                <div className='mt-1 h-28 w-24 flex-shrink-0 border border-blue-200 p-0.5 print:h-24 print:w-20'>
                                    {user.AMST_Photoname ? (
                                        <img src={user.AMST_Photoname} alt='Student' className='h-full w-full object-cover' />
                                    ) : (
                                        <div className='flex h-full w-full flex-col items-center justify-center bg-gray-50 p-1 text-center text-[10px] text-gray-500'>
                                            <span>{user.AMST_FirstName}</span>
                                            <span className='mt-1'>Image not available</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='mt-auto flex justify-between px-2 pt-8 text-sm print:text-xs'>
                                <span className='border-black border-t pt-1 font-semibold'>Class Teacher's Sign</span>
                                <span className='border-black border-t pt-1 font-semibold'>Parent's Sign</span>
                            </div>
                        </div>
                    ))}
                    <div className='mt-8 border-t pt-4 text-center font-semibold text-sm print:mt-auto'>
                        Date: {format(ddate, 'dd/MM/yyyy')} | UserName: {usrname}
                    </div>
                </div>
            )}
        </div>
    );
}
