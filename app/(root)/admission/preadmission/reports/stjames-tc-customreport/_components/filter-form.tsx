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
    useStjamesTcClassChange,
    useStjamesTcLoadData,
    useStjamesTcSectionChange,
    useStjamesTcYearChange
} from '@/hooks/admission/preadmission/useStjamesTcCustomReport';
import { cn } from '@/lib/utils';
import {
    type StjamesTcCustomReportFields,
    StjamesTcCustomReportSchema
} from '@/schemas/admission/preadmission/reports/stjames-tc-custom-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    onSubmit: (data: StjamesTcCustomReportFields) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: loadData, isLoading: isLoadLoading } = useStjamesTcLoadData();
    const yearChange = useStjamesTcYearChange();
    const classChange = useStjamesTcClassChange();
    const sectionChange = useStjamesTcSectionChange();

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const form = useForm<StjamesTcCustomReportFields>({
        resolver: zodResolver(StjamesTcCustomReportSchema),
        defaultValues: {
            reporttype: 'All',
            temporper: 'Per',
            ASMAY_Id: 0,
            AMST_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0
        }
    });

    const { watch, setValue, reset } = form;
    const reporttype = watch('reporttype');
    const temporper = watch('temporper');
    const asmayId = watch('ASMAY_Id');
    const asmclId = watch('ASMCL_Id');
    const asmsId = watch('ASMS_Id');
    const amstId = watch('AMST_Id');

    // Handle Year Change
    useEffect(() => {
        if (asmayId > 0) {
            yearChange.mutate(
                {
                    ASMAY_Id: asmayId,
                    tctemporper: temporper,
                    report_type: reporttype
                },
                {
                    onSuccess: (response: any) => {
                        const data = response.data;
                        setClassList(data?.accclass || []);
                        if (reporttype === 'All') {
                            setStudentList(data?.studentlist || []);
                        }
                    }
                }
            );
        }
    }, [asmayId, reporttype, temporper]);

    // Handle Class Change
    useEffect(() => {
        if (asmclId && asmclId > 0 && asmayId > 0) {
            classChange.mutate(
                {
                    ASMAY_Id: asmayId,
                    ASMCL_Id: asmclId
                },
                {
                    onSuccess: (response: any) => {
                        setSectionList(response.data?.accsection || []);
                    }
                }
            );
        }
    }, [asmclId]);

    // Handle Section Change
    useEffect(() => {
        if (asmsId && asmsId > 0 && asmclId && asmclId > 0 && asmayId > 0) {
            sectionChange.mutate(
                {
                    ASMAY_Id: asmayId,
                    ASMCL_Id: asmclId,
                    ASMS_Id: asmsId,
                    tctemporper: temporper
                },
                {
                    onSuccess: (response: any) => {
                        setStudentList(response.data?.studentlist || []);
                    }
                }
            );
        }
    }, [asmsId]);

    const handleReset = () => {
        reset();
        setClassList([]);
        setSectionList([]);
        setStudentList([]);
        onReset();
    };

    const selectedStudent = studentList.find((s) => s.amsT_Id === amstId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Report Type */}
                    <FormField
                        control={form.control}
                        name='reporttype'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                                <Label className='font-bold'>Report Type</Label>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='All' id='all' />
                                            <Label htmlFor='all' className='cursor-pointer'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='indi' id='individual' />
                                            <Label htmlFor='individual' className='cursor-pointer'>
                                                Individual
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                {form.formState.errors.reporttype && <FormError>{form.formState.errors.reporttype.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* TC Type */}
                    <FormField
                        control={form.control}
                        name='temporper'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                                <Label className='font-bold'>TC Type</Label>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Temp' id='temp' />
                                            <Label htmlFor='temp' className='cursor-pointer'>
                                                Temporary TC
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Per' id='per' />
                                            <Label htmlFor='per' className='cursor-pointer'>
                                                Permanent TC
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                {form.formState.errors.temporper && <FormError>{form.formState.errors.temporper.message}</FormError>}
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='ASMAY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(loadData as any)?.data?.accyear?.map((y: any) => (
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

                    {/* Class - Only for Individual */}
                    <FormField
                        control={form.control}
                        name='ASMCL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label
                                    className={cn(
                                        'font-bold',
                                        reporttype === 'indi' && 'after:ml-0.5 after:text-red-500 after:content-[' * ']'
                                    )}>
                                    Class
                                </Label>
                                <Select
                                    disabled={reporttype !== 'indi'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
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

                    {/* Section - Only for Individual */}
                    <FormField
                        control={form.control}
                        name='ASMS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label
                                    className={cn(
                                        'font-bold',
                                        reporttype === 'indi' && 'after:ml-0.5 after:text-red-500 after:content-[' * ']'
                                    )}>
                                    Section
                                </Label>
                                <Select
                                    disabled={reporttype !== 'indi'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
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

                    {/* Student Name */}
                    <FormField
                        control={form.control}
                        name='AMST_Id'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <Label className='font-bold'>Student Name</Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant='outline'
                                                role='combobox'
                                                className={cn(
                                                    'w-full justify-between font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                {field.value && selectedStudent ? selectedStudent.studentname : 'Select Student'}
                                                <div className='flex items-center gap-2'>
                                                    {field.value ? (
                                                        <X
                                                            className='h-4 w-4 opacity-50 hover:opacity-100'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                field.onChange(0);
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Search className='h-4 w-4 shrink-0 opacity-50' />
                                                </div>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[400px] p-0' align='start'>
                                        <Command>
                                            <CommandInput placeholder='Search student...' className='h-9' />
                                            <CommandList>
                                                <CommandEmpty>No student found.</CommandEmpty>
                                                <CommandGroup>
                                                    {studentList.map((s: any) => (
                                                        <CommandItem
                                                            value={s.studentname}
                                                            key={s.amsT_Id}
                                                            onSelect={() => {
                                                                field.onChange(s.amsT_Id);
                                                                setStudentOpen(false);
                                                            }}>
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

                <div className='flex flex-wrap items-center justify-center gap-4 pt-4'>
                    <Button type='submit' className='min-w-[120px] bg-primary text-white hover:bg-primary/90'>
                        Report
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleReset} className='min-w-[120px]'>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
