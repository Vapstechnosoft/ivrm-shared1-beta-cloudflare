'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useBonafiedAcademicYearChange,
    useBonafiedLoadData,
    useBonafiedSearchFilter,
    useBonafiedStudentStatusChange
} from '@/hooks/admission/preadmission/useAlexanderBonafiedReport';
import { cn } from '@/lib/utils';
import {
    type AlexanderBonafiedReportFields,
    AlexanderBonafiedReportSchema
} from '@/schemas/admission/preadmission/reports/alexander-bonafied-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FilterFormProps {
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: loadData, isLoading: isLoadLoading } = useBonafiedLoadData();
    const studentStatusChange = useBonafiedStudentStatusChange();
    const academicYearChange = useBonafiedAcademicYearChange();
    const searchFilterMutation = useBonafiedSearchFilter();

    const [yearList, setYearList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm<AlexanderBonafiedReportFields>({
        resolver: zodResolver(AlexanderBonafiedReportSchema),
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            ASMAY_Id: 0,
            AMST_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            ASA_FromDate: new Date()
        }
    });

    const {
        watch,
        setValue,
        reset,
        formState: { errors }
    } = form;
    const allorindi = watch('allorindi');
    const optradio = watch('optradio');
    const asmayId = watch('ASMAY_Id');
    const asmclId = watch('ASMCL_Id');
    const asmsId = watch('ASMS_Id');
    const amstId = watch('AMST_Id');

    // Load initial data
    useEffect(() => {
        if (loadData) {
            const data = (loadData as any)?.data;
            if (data) {
                setYearList(data.allAcademicYear || []);
                setClassList(data.allclasslist || []);
                setSectionList(data.allsectionlist || []);
            }
        }
    }, [loadData]);

    // Handle student status (Studying/Left/Deactive/12th) change
    useEffect(() => {
        if (optradio) {
            setStudentList([]);
            setValue('AMST_Id', 0);

            studentStatusChange.mutate(
                { AMST_SOL: optradio },
                {
                    onSuccess: (response: any) => {
                        const data = response.data?.data || response.data;
                        if (data) {
                            // Some APIs return year list, others return student list
                            if (data.allAcademicYear) {
                                setYearList(data.allAcademicYear || []);
                            }
                            if (data.fillstudlist) {
                                setStudentList(data.fillstudlist || []);
                            }
                            setValue('ASA_FromDate', new Date());
                        }
                    }
                }
            );
        }
    }, [optradio]);

    // Handle academic year change
    useEffect(() => {
        if (asmayId && asmayId > 0 && optradio) {
            academicYearChange.mutate(
                {
                    ASMAY_Id: asmayId,
                    AMST_SOL: optradio
                },
                {
                    onSuccess: (response: any) => {
                        const data = response.data?.data || response.data;
                        if (data) {
                            // If data is an array, it's likely the student list
                            if (Array.isArray(data)) {
                                setStudentList(data);
                            } else if (data.fillstudlist) {
                                setStudentList(data.fillstudlist);
                            }
                        }
                    }
                }
            );
        }
    }, [asmayId, optradio]);

    // Handle All/Individual change
    useEffect(() => {
        if (allorindi === 'A') {
            setValue('ASMCL_Id', 0);
            setValue('ASMS_Id', 0);
        }
    }, [allorindi]);

    const handleReset = () => {
        reset();
        setClassList([]);
        setSectionList([]);
        setStudentList([]);
        setSearchQuery('');
        onReset();
    };

    const handleFormSubmit = (data: AlexanderBonafiedReportFields) => {
        onSubmit({
            ...data,
            yearList
        });
    };

    const handleStudentSearch = (value: string) => {
        searchFilterMutation.mutate(
            {
                searchfilter: value,
                ASMAY_Id: asmayId,
                AMST_SOL: optradio === '12' ? 'L' : optradio,
                ASMCL_Id: Number(allorindi === 'A' ? 0 : asmclId || 0),
                ASMC_Id: Number(allorindi === 'A' ? 0 : asmsId || 0),
                allorindid: allorindi
            },
            {
                onSuccess: (response: any) => {
                    const data = response.data?.data || response.data;
                    if (Array.isArray(data) && data.length > 0) {
                        setStudentList(data);
                    } else if (data && data.fillstudlist && data.fillstudlist.length > 0) {
                        setStudentList(data.fillstudlist);
                    } else {
                        setStudentList([]);
                        toast.info('No students found for your search');
                    }
                }
            }
        );
    };

    // Debounce student search
    useEffect(() => {
        if (searchQuery.length < 3) return;
        const timer = setTimeout(() => {
            handleStudentSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const selectedStudent = studentList.find((s) => s.amsT_Id === amstId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* All / Individual */}
                    <FormField
                        control={form.control}
                        name='allorindi'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                                <Label className='font-bold'>Report Type</Label>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='A' id='all' />
                                            <Label htmlFor='all' className='cursor-pointer'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='I' id='individual' />
                                            <Label htmlFor='individual' className='cursor-pointer'>
                                                Individual
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                {errors.allorindi && <FormError>{errors.allorindi.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Studying / Left / Deactive / 12th Class Format */}
                    <FormField
                        control={form.control}
                        name='optradio'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                                <Label className='font-bold'>Student Status</Label>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-wrap gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='S' id='studying' />
                                            <Label htmlFor='studying' className='cursor-pointer'>
                                                Studying
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='L' id='left' />
                                            <Label htmlFor='left' className='cursor-pointer'>
                                                Left
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='D' id='deactive' />
                                            <Label htmlFor='deactive' className='cursor-pointer'>
                                                Deactive
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='12' id='twelfth' />
                                            <Label htmlFor='twelfth' className='cursor-pointer'>
                                                12th Class Format
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                {errors.optradio && <FormError>{errors.optradio.message}</FormError>}
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
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {yearList.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
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
                                        allorindi === 'I' && 'after:ml-0.5 after:text-red-500 after:content-[' * ']'
                                    )}>
                                    Class
                                </Label>
                                <Select
                                    disabled={allorindi === 'A'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
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
                                {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
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
                                        allorindi === 'I' && 'after:ml-0.5 after:text-red-500 after:content-[' * ']'
                                    )}>
                                    Section
                                </Label>
                                <Select
                                    disabled={allorindi === 'A'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
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
                                {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Date */}
                    <FormField
                        control={form.control}
                        name='ASA_FromDate'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold'>
                                    Date <span className='text-red-500'>*</span>
                                </Label>
                                <FormControl>
                                    <DatePicker date={field.value} setDate={(date) => field.onChange(date)} />
                                </FormControl>
                                {errors.ASA_FromDate && <FormError>{errors.ASA_FromDate.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Student */}
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
                                                    'w-full justify-between font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                {field.value && selectedStudent
                                                    ? selectedStudent.amsT_FirstName
                                                    : 'Select or search Student...'}
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
                                        <Command shouldFilter={true}>
                                            <CommandInput
                                                placeholder='Type student name (min 3 chars)...'
                                                className='h-9'
                                                onValueChange={(v) => setSearchQuery(v)}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {searchFilterMutation.isPending
                                                        ? 'Searching...'
                                                        : 'No student found. Type 3+ characters to search.'}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {studentList.map((s: any, index: number) => (
                                                        <CommandItem
                                                            value={`${s.amsT_FirstName}-${s.amsT_Id}-${index}`}
                                                            key={`${s.amsT_Id}-${index}`}
                                                            onSelect={() => {
                                                                field.onChange(s.amsT_Id);
                                                                setStudentOpen(false);
                                                            }}>
                                                            {s.amsT_FirstName}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.AMST_Id && <FormError>{errors.AMST_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Purpose */}
                    <FormField
                        control={form.control}
                        name='purpose'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <Label className='font-bold'>Purpose</Label>
                                <FormControl>
                                    <Input placeholder='Enter purpose (e.g. Cricket)' {...field} />
                                </FormControl>
                                {errors.purpose && <FormError>{errors.purpose.message}</FormError>}
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                    <Button type='submit' className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
