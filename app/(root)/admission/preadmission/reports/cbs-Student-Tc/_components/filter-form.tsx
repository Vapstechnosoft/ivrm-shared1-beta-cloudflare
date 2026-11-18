'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCbsTcClassChange,
    useCbsTcInitialData,
    useCbsTcSectionChange,
    useCbsTcStudentDetails,
    useCbsTcYearChange
} from '@/hooks/admission/preadmission/useCbsStudentTc';
import { cn } from '@/lib/utils';
import { type CbsStudentTcFields, CbsStudentTcSchema } from '@/schemas/admission/preadmission/reports/cbs-student-tc.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const RESULT_TYPES = [
    'He appeared for and passed the ISC Examiniaton (Year XII) in March ',
    'He appeared for and passed the ICSE Examiniaton (Year X) in March',
    'Promotion has been granted',
    'He is presently studying in Class'
];

interface FilterFormProps {
    onSubmit: (data: CbsStudentTcFields) => void;
    onReset: () => void;
    onPrint?: () => void;
}

export function FilterForm({ onSubmit, onReset, onPrint }: FilterFormProps) {
    const { data: initialData, isLoading: isInitialLoading } = useCbsTcInitialData();
    const yearChangeMutation = useCbsTcYearChange();
    const classChangeMutation = useCbsTcClassChange();
    const sectionChangeMutation = useCbsTcSectionChange();

    const [studentList, setStudentList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const studentNameChangeMutation = useCbsTcStudentDetails();

    const form = useForm<CbsStudentTcFields>({
        resolver: zodResolver(CbsStudentTcSchema),
        defaultValues: {
            reporttype: 'All',
            temporper: 'Per',
            asmaY_Id: 0,
            amsT_Id: undefined,
            asmcL_Id: 0,
            asmS_Id: 0,
            BSPID: '',
            Boardtype: 'ICSE',
            resulttype: '',
            Previous_School_Name: ''
        }
    });

    const { watch, setValue, reset } = form;
    const reportType = watch('reporttype');
    const asmayId = watch('asmaY_Id');
    const asmcLId = watch('asmcL_Id');
    const asmsId = watch('asmS_Id');
    const temporper = watch('temporper');

    // Debounced Student Search
    useEffect(() => {
        if (reportType === 'indi' && asmayId > 0 && searchTerm.length >= 3) {
            const timeoutId = setTimeout(() => {
                yearChangeMutation.mutate(
                    {
                        ASMAY_Id: asmayId,
                        tctemporper: temporper,
                        report_type: reportType,
                        search: searchTerm
                    },
                    {
                        onSuccess: (response: any) => {
                            const data = response?.data || response;
                            const students = data?.studentlist?.$values || data?.studentlist || [];
                            if (Array.isArray(students)) setStudentList(students);
                        }
                    }
                );
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm, asmayId, reportType, temporper]);

    // Load initial data
    useEffect(() => {
        if (initialData) {
            const data = initialData?.data || initialData;
            // Explicitly map from the provided JSON structure
            if (data?.accclass) {
                const classes = data.accclass?.$values || (Array.isArray(data.accclass) ? data.accclass : []);
                setClassList(classes);
            }
            if (data?.accsection) {
                const sections = data.accsection?.$values || (Array.isArray(data.accsection) ? data.accsection : []);
                setSectionList(sections);
            }
        }
    }, [initialData]);

    // Handle Year Change
    useEffect(() => {
        if (asmayId > 0) {
            yearChangeMutation.mutate(
                {
                    ASMAY_Id: asmayId,
                    tctemporper: temporper,
                    report_type: reportType
                },
                {
                    onSuccess: (response: any) => {
                        // Extract data based on the provided backend structure
                        const data = response?.data || response;

                        // Update student list
                        const students = data?.studentlist?.$values || data?.studentlist || [];
                        setStudentList(Array.isArray(students) ? students : []);

                        // Update class list
                        const classes = data?.accclass?.$values || data?.accclass || [];
                        if (Array.isArray(classes)) {
                            setClassList(classes);
                        }

                        // Update section list
                        const sections = data?.accsection?.$values || data?.accsection || [];
                        if (Array.isArray(sections)) {
                            setSectionList(sections);
                        }
                    }
                }
            );
        }
    }, [asmayId, reportType, temporper]);

    // Handle Class Change
    useEffect(() => {
        if (asmcLId && asmcLId > 0) {
            classChangeMutation.mutate(
                {
                    ASMAY_Id: asmayId,
                    tctemporper: temporper,
                    report_type: reportType,
                    ASMCL_Id: Number(asmcLId)
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        const sections = data?.accsection?.$values || data?.accsection || [];
                        if (Array.isArray(sections)) setSectionList(sections);
                    }
                }
            );
        }
    }, [asmcLId]);

    // Handle Section Change
    useEffect(() => {
        if (asmsId && asmsId > 0) {
            sectionChangeMutation.mutate(
                {
                    ASMAY_Id: asmayId,
                    tctemporper: temporper,
                    report_type: reportType,
                    ASMCL_Id: Number(asmcLId),
                    ASMS_Id: Number(asmsId)
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        const students = data?.studentlist?.$values || data?.studentlist || [];
                        if (Array.isArray(students)) setStudentList(students);
                    }
                }
            );
        }
    }, [asmsId]);

    // Reset fields when report type changes
    useEffect(() => {
        setValue('amsT_Id', 0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setStudentList([]);
        setStudentDetails(null);
    }, [reportType, setValue]);

    // Handle Student Selection Change
    const selectedStudentId = form.watch('amsT_Id')?.amsT_Id;
    useEffect(() => {
        if (selectedStudentId && asmayId > 0) {
            studentNameChangeMutation.mutate(
                {
                    AMST_Id: selectedStudentId,
                    ASMAY_Id: asmayId
                },
                {
                    onSuccess: (response: any) => {
                        const details = response.classsecregno || (Array.isArray(response.data) ? response.data : []);
                        if (details.length > 0) {
                            setStudentDetails(details[0]);
                        }
                    }
                }
            );
        } else {
            setStudentDetails(null);
        }
    }, [selectedStudentId, asmayId]);

    const handleFormError = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    const handleFormSubmit = (data: CbsStudentTcFields) => {
        onSubmit(data);
    };

    const handleReset = () => {
        reset();
        setStudentList([]);
        setStudentDetails(null);
        onReset();
    };

    const isPending = yearChangeMutation.isPending || classChangeMutation.isPending || sectionChangeMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2'>
                    {/* LEFT COLUMN */}
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='reporttype'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-center space-y-0 rounded-md border border-slate-200 p-2'>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-10'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='All' id='all' />
                                                <Label htmlFor='all' className='cursor-pointer font-bold text-slate-700 text-sm'>
                                                    All
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='indi' id='indi' />
                                                <Label htmlFor='indi' className='cursor-pointer font-bold text-slate-700 text-sm'>
                                                    Individual
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>
                                        Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                        <FormControl className='col-span-2'>
                                            <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(() => {
                                                const yearsData = initialData?.data?.accyear || initialData?.accyear;
                                                const years = yearsData?.$values || (Array.isArray(yearsData) ? yearsData : []);
                                                return years.map((y: any) => (
                                                    <SelectItem key={y?.asmaY_Id} value={y?.asmaY_Id?.toString() || ''}>
                                                        {y?.asmaY_Year}
                                                    </SelectItem>
                                                ));
                                            })()}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.asmaY_Id && (
                                        <FormError className='col-span-2 col-start-2'>
                                            {form.formState.errors.asmaY_Id.message as string}
                                        </FormError>
                                    )}
                                </FormItem>
                            )}
                        />

                        {reportType === 'indi' && (
                            <>
                                <FormField
                                    control={form.control}
                                    name='asmcL_Id'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                            <Label className='col-span-1 font-bold text-slate-700 text-sm'>Class:</Label>
                                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                                <FormControl className='col-span-2'>
                                                    <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='0'>-- All Classes --</SelectItem>
                                                    {classList.map((c: any) => (
                                                        <SelectItem key={c?.asmcL_Id} value={c?.asmcL_Id?.toString() || ''}>
                                                            {c?.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.formState.errors.asmcL_Id && (
                                                <FormError className='col-span-2 col-start-2'>
                                                    {form.formState.errors.asmcL_Id.message as string}
                                                </FormError>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='asmS_Id'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                            <Label className='col-span-1 font-bold text-slate-700 text-sm'>Section:</Label>
                                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                                <FormControl className='col-span-2'>
                                                    <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='0'>-- All Sections --</SelectItem>
                                                    {sectionList.map((s: any) => (
                                                        <SelectItem key={s?.asmS_Id} value={s?.asmS_Id?.toString() || ''}>
                                                            {s?.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.formState.errors.asmS_Id && (
                                                <FormError className='col-span-2 col-start-2'>
                                                    {form.formState.errors.asmS_Id.message as string}
                                                </FormError>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name='BSPID'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>BSP ID:</Label>
                                    <FormControl className='col-span-2'>
                                        <Input {...field} className='h-8 border-slate-300 bg-white' />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='Previous_School_Name'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>Previous School Name:</Label>
                                    <FormControl className='col-span-2'>
                                        <Input {...field} className='h-8 border-slate-300 bg-white' />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='temporper'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-center space-y-0 rounded-md border border-slate-200 p-2'>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-10'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Temp' id='temp' />
                                                <Label htmlFor='temp' className='cursor-pointer font-bold text-slate-700 text-sm'>
                                                    Temporary TC
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Per' id='per' />
                                                <Label htmlFor='per' className='cursor-pointer font-bold text-slate-700 text-sm'>
                                                    Permanent TC
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='amsT_Id'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 pr-2 font-bold text-slate-700 text-sm'>
                                        Student Name:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='col-span-3'>
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant='outline'
                                                        role='combobox'
                                                        className={cn(
                                                            'h-8 w-full justify-between border-slate-300 bg-white font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <span className='truncate pr-2'>
                                                            {isPending
                                                                ? 'Searching...'
                                                                : field.value?.studentname
                                                                  ? field.value.studentname
                                                                  : 'All Students (Summary List)'}
                                                        </span>
                                                        <div className='flex shrink-0 items-center'>
                                                            {isPending ? (
                                                                <Loader2 className='h-3 w-3 animate-spin opacity-50' />
                                                            ) : (
                                                                <>
                                                                    {field.value && (
                                                                        <X
                                                                            className='mr-1 h-3 w-3 opacity-50 transition-opacity hover:opacity-100'
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                field.onChange(undefined);
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <Search className='h-3 w-3 opacity-50' />
                                                                </>
                                                            )}
                                                        </div>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-full p-0 sm:w-[450px]' align='start'>
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder='Type to search (min 3 chars)...'
                                                        className='h-9'
                                                        onValueChange={setSearchTerm}
                                                        value={searchTerm}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {isPending ? (
                                                                <Loader2 className='mx-auto h-4 w-4 animate-spin text-indigo-600' />
                                                            ) : (
                                                                'No student found.'
                                                            )}
                                                        </CommandEmpty>
                                                        <CommandGroup className='max-h-64 w-full overflow-y-auto'>
                                                            {studentList
                                                                .filter((s) => s && s.amsT_Id)
                                                                .map((s: any) => (
                                                                    <CommandItem
                                                                        value={s.studentname || ''}
                                                                        key={s.amsT_Id}
                                                                        onSelect={() => {
                                                                            field.onChange(s);
                                                                            setStudentOpen(false);
                                                                            setSearchTerm('');
                                                                        }}
                                                                        className='flex items-center justify-between'>
                                                                        <span className='truncate font-medium'>{s.studentname}</span>
                                                                        {field.value?.amsT_Id === s.amsT_Id && (
                                                                            <Check className='h-4 w-4 shrink-0 text-indigo-600' />
                                                                        )}
                                                                    </CommandItem>
                                                                ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {form.formState.errors.amsT_Id && (
                                            <FormError className='mt-1'>{form.formState.errors.amsT_Id.message as string}</FormError>
                                        )}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='Boardtype'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 pr-2 font-bold text-slate-700 text-sm'>Board Type:</Label>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl className='col-span-3'>
                                            <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                <SelectValue placeholder='Select Board' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='ISC'>ISC</SelectItem>
                                            <SelectItem value='ICSE'>ICSE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='resulttype'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 pr-2 font-bold text-slate-700 text-sm'>Result Type:</Label>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl className='col-span-3'>
                                            <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                <SelectValue placeholder='Select Type' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {RESULT_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type.length > 50 ? type.substring(0, 50) + '...' : type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.resulttype && (
                                        <FormError className='col-span-3 col-start-2'>
                                            {form.formState.errors.resulttype.message as string}
                                        </FormError>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* Student Info Labels (mimicking legacy) */}
                        {studentDetails && (
                            <div className='fade-in slide-in-from-top-2 mt-6 grid animate-in grid-cols-1 gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 duration-300 sm:grid-cols-3'>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[10px] text-slate-500 uppercase tracking-wider'>Class</span>
                                    <span className='font-semibold text-slate-900'>{studentDetails.asmcL_ClassName}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[10px] text-slate-500 uppercase tracking-wider'>Section</span>
                                    <span className='font-semibold text-slate-900'>{studentDetails.asmC_SectionName}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[10px] text-slate-500 uppercase tracking-wider'>Reg. No</span>
                                    <span className='font-semibold text-slate-900'>{studentDetails.amsT_RegistrationNo}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons Right Aligned */}
                        <div className='flex items-center justify-end gap-3 pt-6'>
                            <Button
                                type='submit'
                                disabled={isPending || isInitialLoading}
                                className='flex h-8 items-center justify-center gap-2 bg-[#5c6bc0] px-6 text-sm text-white hover:bg-[#3f51b5]'>
                                {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <i className='fa fa-file-text-o' />}
                                REPORT
                            </Button>
                            <Button
                                type='button'
                                variant='destructive'
                                onClick={handleReset}
                                className='flex h-8 items-center justify-center gap-2 bg-[#ff5722] px-6 text-sm text-white hover:bg-[#e64a19]'>
                                <i className='fa fa-times' />
                                CANCEL
                            </Button>
                            {/* {onPrint && (
                                <Button 
                                    type="button" 
                                    onClick={onPrint} 
                                    className="bg-[#5c6bc0] hover:bg-[#3f51b5] text-white h-8 px-6 text-sm flex items-center justify-center gap-2"
                                >
                                    <i className="fa fa-print" />
                                    PRINT
                                </Button>
                            )} */}
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
