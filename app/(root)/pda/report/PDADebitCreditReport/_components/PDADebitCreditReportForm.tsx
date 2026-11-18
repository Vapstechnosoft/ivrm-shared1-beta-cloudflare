'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Printer, RotateCcw, Search } from 'lucide-react';

import { usePDAAcademicYear, usePDAClass, usePDASection, usePDAStudent } from '@/hooks/pda/usePDACommon';
import { usePDADebitCreditReportMutation } from '@/hooks/pettycash/report/usePDADebitCreditReport';
import type { IPDADebitCreditReportRow, IPDADebitCreditStudentDetail } from '@/types/pettycash/report/PDADebitCreditReport';

// ---------- Zod Schema ----------
const formSchema = z.object({
    asmaY_Id: z.string().min(1, 'Please Select Academic Year'),
    asmcL_Id: z.string().min(1, 'Please Select Class'),
    asmC_Id: z.string().min(1, 'Please Select Section'),
    AMST_Id: z.string().min(1, 'Please Select Student'),
    From_Date: z.date({ required_error: 'Please Select From Date' }),
    To_Date: z.date({ required_error: 'Please Select To Date' })
});

export type PDADebitCreditFormValues = z.infer<typeof formSchema>;

// ---------- Props ----------
interface PDADebitCreditReportFormProps {
    onReportGenerated: (rows: IPDADebitCreditReportRow[], student: IPDADebitCreditStudentDetail[], fromDate: Date, toDate: Date) => void;
    onCancel: () => void;
    onPrint: () => void;
    onExport: () => void;
    showReportButtons: boolean;
}

export default function PDADebitCreditReportForm({
    onReportGenerated,
    onCancel,
    onPrint,
    onExport,
    showReportButtons
}: PDADebitCreditReportFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<PDADebitCreditFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asmaY_Id: '',
            asmcL_Id: '',
            asmC_Id: '',
            AMST_Id: ''
        }
    });

    const watchedYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedSection = watch('asmC_Id');

    const { data: yearsRes } = usePDAAcademicYear();
    console.log('academic year', yearsRes?.data);
    const { data: classesRes } = usePDAClass(Number(watchedYear));
    console.log('class', classesRes?.data);
    const { data: sectionsRes } = usePDASection(Number(watchedYear), Number(watchedClass));
    console.log('section', sectionsRes?.data);
    const { data: studentsRes } = usePDAStudent(Number(watchedYear), Number(watchedClass), Number(watchedSection));
    console.log('student', studentsRes?.data);

    const reportMutation = usePDADebitCreditReportMutation();

    const years = (Array.isArray(yearsRes?.data) ? yearsRes?.data : yearsRes?.data?.data) || yearsRes?.data?.fillyear?.$values || [];
    const classes =
        (Array.isArray(classesRes?.data) ? classesRes?.data : classesRes?.data?.data) || classesRes?.data?.classlist?.$values || [];
    const sections =
        (Array.isArray(sectionsRes?.data) ? sectionsRes?.data : sectionsRes?.data?.data) || sectionsRes?.data?.fillsection?.$values || [];
    const students =
        (Array.isArray(studentsRes?.data) ? studentsRes?.data : studentsRes?.data?.data) || studentsRes?.data?.fillstudent?.$values || [];

    const onSubmit = (values: PDADebitCreditFormValues) => {
        const payload = {
            ASMAY_Id: Number(values.asmaY_Id),
            ASMCL_Id: Number(values.asmcL_Id),
            AMSC_Id: Number(values.asmC_Id),
            Amst_Id: Number(values.AMST_Id),
            From_Date: format(values.From_Date, 'yyyy-MM-dd'),
            To_Date: format(values.To_Date, 'yyyy-MM-dd'),
            type: 'Ind'
        };

        reportMutation.mutate(payload, {
            onSuccess: (res: any) => {
                const rows = res?.data?.transnumconfig;
                if (rows && rows.length > 0) {
                    const student = res?.data?.fillstudent || [];
                    onReportGenerated(rows, student, values.From_Date, values.To_Date);
                    toast.success('Report generated successfully');
                } else {
                    toast.error('No Record Found');
                    onCancel();
                }
            },
            onError: () => {
                toast.error('Failed to generate report');
            }
        });
    };

    const handleReset = () => {
        reset();
        onCancel();
    };

    return (
        <CollapsibleSection defaultOpen title='PDA Debit Credit Report'>
            <div className='fade-in mx-auto w-full animate-in space-y-8 rounded-xl border border-purple-100 bg-white p-8 shadow-sm duration-500'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Academic Year */}
                    <div className='space-y-2'>
                        <Label className='font-semibold text-purple-900'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='--Select Year--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <span className='font-medium text-red-500 text-xs'>{errors.asmaY_Id.message}</span>}
                    </div>

                    {/* Class */}
                    <div className='space-y-2'>
                        <Label className='font-semibold text-purple-900'>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmcL_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='--Select Class--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmcL_Id && <span className='font-medium text-red-500 text-xs'>{errors.asmcL_Id.message}</span>}
                    </div>

                    {/* Section */}
                    <div className='space-y-2'>
                        <Label className='font-semibold text-purple-900'>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmC_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((s: any) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmC_Id && <span className='font-medium text-red-500 text-xs'>{errors.asmC_Id.message}</span>}
                    </div>

                    {/* Student */}
                    <div className='space-y-2'>
                        <Label className='font-semibold text-purple-900'>
                            Student Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='AMST_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='--Select Student--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((st: any) => (
                                            <SelectItem key={st.amsT_Id} value={st.amsT_Id.toString()}>
                                                {st.amsT_FirstName} {st.amsT_MiddleName || ''} {st.amsT_LastName || ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.AMST_Id && <span className='font-medium text-red-500 text-xs'>{errors.AMST_Id.message}</span>}
                    </div>

                    {/* From Date */}
                    <div className='space-y-2'>
                        <Label className='font-semibold text-purple-900'>
                            From Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='From_Date'
                            control={control}
                            render={({ field }) => (
                                <DatePicker date={field.value} setDate={field.onChange} placeholder='Select From Date' />
                            )}
                        />
                        {errors.From_Date && <span className='font-medium text-red-500 text-xs'>{errors.From_Date.message}</span>}
                    </div>

                    {/* To Date */}
                    <div className='space-y-2'>
                        <Label className='font-semibold text-purple-900'>
                            To Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='To_Date'
                            control={control}
                            render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} placeholder='Select To Date' />}
                        />
                        {errors.To_Date && <span className='font-medium text-red-500 text-xs'>{errors.To_Date.message}</span>}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col items-center justify-between gap-6 border-purple-50 border-t pt-4 md:flex-row'>
                    <div className='flex items-center gap-4'>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={reportMutation.isPending}
                            className='h-10 rounded-md bg-gradient-to-r from-orange-600 to-orange-700 px-6 font-bold text-white shadow-md transition-all hover:from-orange-700 hover:to-orange-800 active:scale-95'>
                            <Search className='mr-2 h-4 w-4' />
                            {reportMutation.isPending ? 'Loading...' : 'Report'}
                        </Button>
                        <Button
                            variant='outline'
                            onClick={handleReset}
                            className='h-10 rounded-md border-orange-200 px-6 font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>

                    {showReportButtons && (
                        <div className='flex flex-wrap items-center gap-3'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onExport}
                                className='h-10 rounded-md border-green-200 bg-white px-6 font-bold text-green-700 text-xs shadow-sm hover:bg-green-50'>
                                <FileDown className='mr-1.5 h-4 w-4' />
                                Export Excel
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onPrint}
                                className='h-10 rounded-md border-blue-200 bg-white px-6 font-bold text-blue-700 text-xs shadow-sm hover:bg-blue-50'>
                                <Printer className='mr-1.5 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </CollapsibleSection>
    );
}
