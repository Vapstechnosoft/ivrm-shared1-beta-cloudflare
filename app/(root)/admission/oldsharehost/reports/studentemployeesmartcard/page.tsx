'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useStudentEmployeeSmartCardInitialDetails,
    useStudentEmployeeSmartCardReport
} from '@/hooks/admission/oldsharehost/reports/useStudentEmployeeSmartCard';

// Add validation schema
const formSchema = z
    .object({
        flag1: z.enum(['Std', 'Emp']),
        asmaY_Id: z.string().optional(),
        asmcL_Id: z.string().optional(),
        asmC_Id: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.flag1 === 'Std') {
            if (!data.asmaY_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Academic Year is required',
                    path: ['asmaY_Id']
                });
            }
            if (!data.asmcL_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Class is required',
                    path: ['asmcL_Id']
                });
            }
            if (!data.asmC_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Section is required',
                    path: ['asmC_Id']
                });
            }
        }
    });

type FormValues = z.infer<typeof formSchema>;

export default function StudentEmployeeSmartCardPage() {
    const { data: initialData, isLoading: isInitialLoading } = useStudentEmployeeSmartCardInitialDetails();
    const reportMutation = useStudentEmployeeSmartCardReport();

    const [items, setItems] = useState<any[]>([]);
    const [schooldetails, setSchoolDetails] = useState<any[]>([]);
    const [classteachername, setClassTeacherName] = useState('');
    const [classname, setClassname] = useState('');
    const [sectionname, setSectionname] = useState('');
    const [accyear, setAccyear] = useState('');
    const [totalstength, setTotalStrength] = useState(0);

    const [isGenerating, setIsGenerating] = useState(false);

    // For print layout
    const [std, setStd] = useState(false);
    const [emp, setEmp] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            flag1: 'Std',
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: ''
        }
    });

    const watchFlag = form.watch('flag1');

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);
            const payload = {
                asmaY_Id: data.asmaY_Id ? Number(data.asmaY_Id) : 0,
                asmcL_Id: data.asmcL_Id ? Number(data.asmcL_Id) : 0,
                asmC_Id: data.asmC_Id ? Number(data.asmC_Id) : 0,
                amsT_Id: 0,
                flag: data.flag1
            };

            const res = await reportMutation.mutateAsync(payload);
            const resultData = res?.data;

            if (!resultData?.result || resultData.result.length === 0) {
                toast.info('No Records Found!');
                setItems([]);
                setStd(false);
                setEmp(false);
                return;
            }

            setItems(resultData.result);
            setTotalStrength(resultData.result.length);
            setSchoolDetails(resultData.schooldetails || []);

            if (data.flag1 === 'Std') {
                setStd(true);
                setEmp(false);
                if (resultData.classteacher && resultData.classteacher.length > 0) {
                    setClassTeacherName(resultData.classteacher[0].empname);
                } else {
                    setClassTeacherName('');
                }

                // Get labels
                const years = initialData?.data?.accyear || [];
                const classes = initialData?.data?.classlist || [];
                const sections = initialData?.data?.sectionlist || [];

                const y = years.find((item: any) => item.asmaY_Id === payload.asmaY_Id);
                const c = classes.find((item: any) => item.asmcL_Id === payload.asmcL_Id);
                const s = sections.find((item: any) => item.asmS_Id === payload.asmC_Id);

                setAccyear(y ? y.asmaY_Year : '');
                setClassname(c ? c.asmcL_ClassName : '');
                setSectionname(s ? s.asmC_SectionName : '');
            } else {
                setStd(false);
                setEmp(true);
            }
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
                        <title>Student/Employee Smart Card</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: auto; margin: 10mm; }
                                body { padding: 0; margin: 0; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; }
                                .print\\:shadow-none { box-shadow: none !important; }
                                .print\\:p-0 { padding: 0 !important; }
                                .print\\:border-indigo-400 { border-color: #818cf8 !important; }
                                .print\\:border-green-400 { border-color: #4ade80 !important; }
                                .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
                                .print\\:gap-4 { gap: 1rem !important; }
                            }
                        </style>
                    </head>
                    <body onload="setTimeout(function() { window.print(); window.close(); }, 1000);">
                        ${printContent}
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

        let ws: XLSX.WorkSheet;
        if (std) {
            const dataToExport = items.map((item) => ({
                Name: item.name || item.AMST_FirstName,
                'Father Name': item.fathername || item.AMST_FatherName,
                'Adm No': item.admno || item.AMST_AdmNo,
                DOB: item.dob
                    ? format(new Date(item.dob), 'dd/MM/yyyy')
                    : item.AMST_DOB
                      ? format(new Date(item.AMST_DOB), 'dd/MM/yyyy')
                      : '',
                Address: item.address,
                'Phone No': item.mobileno || item.AMST_MobileNo,
                'Mobile No': item.mobileno || item.AMST_MobileNo,
                'Email ID': item.email || item.AMST_emailId,
                'Blood Group': item.bloodgroup || item.AMST_BloodGroup
            }));
            ws = XLSX.utils.json_to_sheet(dataToExport);
        } else {
            const dataToExport = items.map((item) => ({
                Name: item.name || item.hrme_employeefirstname,
                'Emp Code': item.employeecode || item.ecode,
                'Joining Date': item.doj
                    ? format(new Date(item.doj), 'dd-MM-yyyy')
                    : item.HRME_DOJ
                      ? format(new Date(item.HRME_DOJ), 'dd-MM-yyyy')
                      : '',
                DOB: item.dob
                    ? format(new Date(item.dob), 'dd-MM-yyyy')
                    : item.hrme_DOB
                      ? format(new Date(item.hrme_DOB), 'dd-MM-yyyy')
                      : '',
                Address: item.address,
                'Blood Group': item.bloodgroup || item.HRME_BloodGroup
            }));
            ws = XLSX.utils.json_to_sheet(dataToExport);
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Smart_Card');
        XLSX.writeFile(wb, 'Student_Employee_Smart_Card.xlsx');
    };

    const logoUrl = schooldetails?.[0]?.asC_Logo_Path || '';

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4 print:bg-white print:p-0'>
            <div className='print:hidden'>
                <CollapsibleSection title='Student Employee Smart Card Details' defaultOpen={true} variant='outline' className='shadow-md'>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg bg-white p-6'>
                        <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
                            <div className='space-y-4'>
                                <Controller
                                    name='flag1'
                                    control={form.control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                if (val === 'Emp') {
                                                    form.setValue('asmaY_Id', '');
                                                    form.setValue('asmcL_Id', '');
                                                    form.setValue('asmC_Id', '');
                                                    form.clearErrors(['asmaY_Id', 'asmcL_Id', 'asmC_Id']);
                                                }
                                            }}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className='flex flex-row justify-center space-x-4 rounded-md bg-gray-100 p-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Std' id='r-std' />
                                                <Label htmlFor='r-std'>Student</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Emp' id='r-emp' />
                                                <Label htmlFor='r-emp'>Employee</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                                {form.formState.errors.flag1 && (
                                    <span className='text-red-500 text-sm'>{form.formState.errors.flag1.message}</span>
                                )}

                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Academic Year:{watchFlag === 'Std' && <span className='text-red-500'>*</span>}
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading || watchFlag === 'Emp'}>
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
                            </div>

                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label className='font-bold text-sm'>
                                        Class:{watchFlag === 'Std' && <span className='text-red-500'>*</span>}
                                    </Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading || watchFlag === 'Emp'}>
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
                                        Section:{watchFlag === 'Std' && <span className='text-red-500'>*</span>}
                                    </Label>
                                    <Controller
                                        name='asmC_Id'
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isInitialLoading || watchFlag === 'Emp'}>
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
                <div ref={printRef} className='rounded-lg bg-white p-6 shadow-md print:p-0 print:shadow-none'>
                    <div className='mb-6 text-center'>
                        {logoUrl && <img src={logoUrl} alt='School Logo' className='mx-auto h-24 object-contain' />}
                    </div>

                    {std && (
                        <div>
                            <div className='mb-6 space-y-2 text-center'>
                                <h2 className='font-bold text-xl'>Student Details Smart Card - {accyear}</h2>
                                <p className='font-semibold'>
                                    Class: {classname}-{sectionname}
                                </p>
                                <p className='font-semibold'>
                                    Class Teacher: {classteachername} | Class Strength: {totalstength}
                                </p>
                            </div>

                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-4'>
                                {items.map((user, idx) => (
                                    <div
                                        key={idx}
                                        className='break-inside-avoid rounded-lg border-2 border-indigo-200 bg-indigo-50/30 p-4 shadow-sm print:border-indigo-400 print:shadow-none'>
                                        <table className='w-full text-sm'>
                                            <tbody>
                                                <tr>
                                                    <td className='w-1/3 py-1 font-bold'>NAME</td>
                                                    <td>: {user.name || user.AMST_FirstName}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>FATHER NAME</td>
                                                    <td>: {user.fathername || user.AMST_FatherName}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>ADM.NO</td>
                                                    <td>: {user.admno || user.AMST_AdmNo}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>DOB</td>
                                                    <td>
                                                        :{' '}
                                                        {user.dob
                                                            ? format(new Date(user.dob), 'dd/MM/yyyy')
                                                            : user.AMST_DOB
                                                              ? format(new Date(user.AMST_DOB), 'dd/MM/yyyy')
                                                              : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 align-top font-bold'>ADDRESS</td>
                                                    <td>: {user.address}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>PHONE NO.</td>
                                                    <td>: {user.mobileno || user.AMST_MobileNo}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>MOBILE NO.</td>
                                                    <td>: {user.mobileno || user.AMST_MobileNo}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>EMAIL ID</td>
                                                    <td className='break-all'>: {user.email || user.AMST_emailId}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>BLOOD GROUP</td>
                                                    <td>: {user.bloodgroup || user.AMST_BloodGroup}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {emp && (
                        <div>
                            <div className='mb-6 space-y-2 text-center'>
                                <h2 className='font-bold text-xl'>Employee Details Smart Card</h2>
                            </div>

                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-4'>
                                {items.map((user, idx) => (
                                    <div
                                        key={idx}
                                        className='break-inside-avoid rounded-lg border-2 border-green-200 bg-green-50/30 p-4 shadow-sm print:border-green-400 print:shadow-none'>
                                        <table className='w-full text-sm'>
                                            <tbody>
                                                <tr>
                                                    <td className='w-1/3 py-1 font-bold'>NAME</td>
                                                    <td>: {user.name || user.hrme_employeefirstname}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>EMP CODE</td>
                                                    <td>: {user.employeecode || user.ecode}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>JOINING DATE</td>
                                                    <td>
                                                        :{' '}
                                                        {user.doj
                                                            ? format(new Date(user.doj), 'dd-MM-yyyy')
                                                            : user.HRME_DOJ
                                                              ? format(new Date(user.HRME_DOJ), 'dd-MM-yyyy')
                                                              : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>DOB</td>
                                                    <td>
                                                        :{' '}
                                                        {user.dob
                                                            ? format(new Date(user.dob), 'dd-MM-yyyy')
                                                            : user.hrme_DOB
                                                              ? format(new Date(user.hrme_DOB), 'dd-MM-yyyy')
                                                              : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 align-top font-bold'>ADDRESS</td>
                                                    <td>: {user.address}</td>
                                                </tr>
                                                <tr>
                                                    <td className='py-1 font-bold'>BLOOD GROUP</td>
                                                    <td>: {user.bloodgroup || user.HRME_BloodGroup}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
