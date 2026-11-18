'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useStthomasTcClassChange,
    useStthomasTcLoadData,
    useStthomasTcSectionChange,
    useStthomasTcYearChange
} from '@/hooks/admission/preadmission/useStthomasTcCustomReport';
import { cn } from '@/lib/utils';
import {
    type StthomasTcCustomReportFields,
    StthomasTcCustomReportSchema
} from '@/schemas/admission/preadmission/reports/stthomas-tc-custom-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FilterFormProps {
    onSubmit: (data: StthomasTcCustomReportFields) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: initialData, isLoading: isLoadDataLoading } = useStthomasTcLoadData();
    const yearChangeMutation = useStthomasTcYearChange();
    const classChangeMutation = useStthomasTcClassChange();
    const sectionChangeMutation = useStthomasTcSectionChange();

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const form = useForm<StthomasTcCustomReportFields>({
        resolver: zodResolver(StthomasTcCustomReportSchema),
        defaultValues: {
            reporttype: 'All',
            temporper: 'Per',
            ASMAY_Id: 0,
            AMST_Id: undefined,
            ASMCL_Id: 0,
            ASMS_Id: 0
        }
    });

    const { watch, setValue, reset } = form;
    const reportType = watch('reporttype');
    const temporper = watch('temporper');
    const selectedYear = watch('ASMAY_Id');
    const selectedClass = watch('ASMCL_Id');
    const selectedSection = watch('ASMS_Id');
    const selectedAmstId = watch('AMST_Id');

    // Handle initial load data population
    useEffect(() => {
        if (initialData?.data) {
            const data = initialData.data;
            setClassList(data.accclass || []);
            setSectionList(data.accsection || []);
            if (reportType === 'All') {
                setStudentList(data.studentlist || []);
            }
        }
    }, [initialData, reportType]);

    // Handle Year Change
    useEffect(() => {
        if (selectedYear && selectedYear > 0) {
            // Reset dependent fields
            setValue('ASMCL_Id', 0);
            setValue('ASMS_Id', 0);
            setValue('AMST_Id', undefined);
            setSectionList([]);
            setStudentList([]);

            yearChangeMutation.mutate(
                {
                    ASMAY_Id: selectedYear,
                    tctemporper: temporper,
                    report_type: reportType
                },
                {
                    onSuccess: (response: any) => {
                        const data = response.data;
                        setClassList(data?.accclass || []);
                        if (reportType === 'All') {
                            setStudentList(data?.studentlist || []);
                        }
                    }
                }
            );
        }
    }, [selectedYear, reportType, temporper]);

    // Handle Class Change
    useEffect(() => {
        if (selectedClass && selectedClass > 0 && selectedYear && selectedYear > 0) {
            // Reset dependent fields
            setValue('ASMS_Id', 0);
            setValue('AMST_Id', undefined);
            setSectionList([]);
            setStudentList([]);

            classChangeMutation.mutate(
                {
                    ASMAY_Id: selectedYear,
                    tctemporper: temporper,
                    report_type: reportType,
                    ASMCL_Id: selectedClass
                },
                {
                    onSuccess: (response: any) => {
                        setSectionList(response.data?.accsection || []);
                    }
                }
            );
        }
    }, [selectedClass]);

    // Handle Section Change
    useEffect(() => {
        if (selectedSection && selectedSection > 0 && selectedClass && selectedClass > 0 && selectedYear && selectedYear > 0) {
            // Reset student selection
            setValue('AMST_Id', undefined);
            setStudentList([]);

            sectionChangeMutation.mutate(
                {
                    ASMAY_Id: selectedYear,
                    tctemporper: temporper,
                    report_type: reportType,
                    ASMCL_Id: selectedClass,
                    ASMS_Id: selectedSection
                },
                {
                    onSuccess: (response: any) => {
                        setStudentList(response.data?.studentlist || []);
                    }
                }
            );
        }
    }, [selectedSection]);

    const handleReset = () => {
        reset();
        setClassList([]);
        setSectionList([]);
        setStudentList([]);
        onReset();
    };

    const selectedStudent = studentList.find((s) => s.amsT_Id === selectedAmstId);

    const onFormError = (errors: any) => {
        Object.values(errors).forEach((error: any) => {
            if (error.message) {
                toast.error(error.message.toString().toLowerCase(), {
                    id: error.message.toString()
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Report Type */}
                    <FormField
                        control={form.control}
                        name='reporttype'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                                <Label className='font-bold'>Report Type</Label>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-6'>
                                        <div className='flex items-center space-x-3'>
                                            <FormControl>
                                                <RadioGroupItem value='All' id='all' />
                                            </FormControl>
                                            <Label htmlFor='all' className='cursor-pointer font-normal'>
                                                All Students
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-3'>
                                            <FormControl>
                                                <RadioGroupItem value='indi' id='indi' />
                                            </FormControl>
                                            <Label htmlFor='indi' className='cursor-pointer font-normal'>
                                                Individual
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* TC Type */}
                    <FormField
                        control={form.control}
                        name='temporper'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                                <Label className='font-bold'>TC Duration</Label>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-6'>
                                        <div className='flex items-center space-x-3'>
                                            <FormControl>
                                                <RadioGroupItem value='Temp' id='temp' />
                                            </FormControl>
                                            <Label htmlFor='temp' className='cursor-pointer font-normal'>
                                                Temporary TC
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-3'>
                                            <FormControl>
                                                <RadioGroupItem value='Per' id='per' />
                                            </FormControl>
                                            <Label htmlFor='per' className='cursor-pointer font-normal'>
                                                Permanent TC
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='ASMAY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='whitespace-nowrap font-bold'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(initialData as any)?.data?.accyear?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ASMAY_Id && <FormError>{form.formState.errors.ASMAY_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Class */}
                    <FormField
                        control={form.control}
                        name='ASMCL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label
                                    className={cn(
                                        'font-bold',
                                        reportType === 'indi' && 'after:ml-0.5 after:text-red-500 after:content-[' * ']'
                                    )}>
                                    Class
                                </Label>
                                <Select
                                    disabled={reportType !== 'indi'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classList.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ASMCL_Id && <FormError>{form.formState.errors.ASMCL_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name='ASMS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label
                                    className={cn(
                                        'font-bold',
                                        reportType === 'indi' && 'after:ml-0.5 after:text-red-500 after:content-[' * ']'
                                    )}>
                                    Section
                                </Label>
                                <Select
                                    disabled={reportType !== 'indi'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sectionList.map((s: any) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ASMS_Id && <FormError>{form.formState.errors.ASMS_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Student Selection (Searchable) */}
                    <div className='lg:col-span-2'>
                        <FormField
                            control={form.control}
                            name='AMST_Id'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <Label className='font-bold'>
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className={cn(
                                                        'h-10 w-full justify-between bg-white font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    {field.value && selectedStudent ? selectedStudent.studentname : 'Select Student'}
                                                    <div className='flex items-center gap-2'>
                                                        {field.value ? (
                                                            <X
                                                                className='h-4 w-4 opacity-50 hover:opacity-100'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange(undefined);
                                                                }}
                                                            />
                                                        ) : null}
                                                        <Search className='h-4 w-4 shrink-0 opacity-50' />
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[450px] p-0' align='start'>
                                            <Command>
                                                <CommandInput placeholder='Search student name...' className='h-9' />
                                                <CommandList className='max-h-[300px]'>
                                                    <CommandEmpty>No students found for this selection.</CommandEmpty>
                                                    <CommandGroup>
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                value={s.studentname}
                                                                key={s.amsT_Id}
                                                                onSelect={() => {
                                                                    field.onChange(s.amsT_Id);
                                                                    setStudentOpen(false);
                                                                }}>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        field.value === s.amsT_Id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                {s.studentname}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {form.formState.errors.AMST_Id && <FormError>{form.formState.errors.AMST_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button
                        type='submit'
                        size='lg'
                        className='h-11 min-w-[160px] bg-indigo-600 hover:bg-indigo-700'
                        disabled={yearChangeMutation.isPending}>
                        {yearChangeMutation.isPending ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <FileText className='mr-2 h-4 w-4' />
                        )}
                        Generate Report
                    </Button>
                    <Button type='button' variant='outline' size='lg' onClick={handleReset} className='h-11 min-w-[160px]'>
                        <RefreshCw className='mr-2 h-4 w-4' /> Reset Form
                    </Button>
                </div>
            </form>
        </Form>
    );
}
