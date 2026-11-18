'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useStudyCertificateAcademicYearChange,
    useStudyCertificateLoadData,
    useStudyCertificateSearchFilterMutation,
    useStudyCertificateStudentList
} from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const filterSchema = z
    .object({
        allorindid: z.enum(['A', 'I']),
        studentStatus: z.enum(['S', 'L', 'D']),
        certificateType: z.enum(['0', '1']),
        addressType: z.enum(['address_per', 'address_con']),
        parentType: z.enum(['0', '1', '2']),
        asmaY_Id: z.coerce.number().min(1, 'Academic year is required'),
        asmcL_Id: z.coerce.number().optional(),
        asmS_Id: z.coerce.number().optional(),
        amst_Id: z.coerce.number().optional(),
        selectedDate: z.date({ required_error: 'Date is required' })
    })
    .refine(
        (data) => {
            // Student is required in both Individual and All modes
            if (!data.amst_Id || data.amst_Id === 0) {
                return false;
            }
            return true;
        },
        {
            message: 'Please select a student',
            path: ['amst_Id']
        }
    )
    .refine(
        (data) => {
            // If Individual mode is selected, class must be selected
            if (data.allorindid === 'I' && (!data.asmcL_Id || data.asmcL_Id === 0)) {
                return false;
            }
            return true;
        },
        {
            message: 'Class is required in Individual mode',
            path: ['asmcL_Id']
        }
    )
    .refine(
        (data) => {
            // If Individual mode is selected, section must be selected
            if (data.allorindid === 'I' && (!data.asmS_Id || data.asmS_Id === 0)) {
                return false;
            }
            return true;
        },
        {
            message: 'Section is required in Individual mode',
            path: ['asmS_Id']
        }
    );

type FilterValues = z.infer<typeof filterSchema>;

interface FilterFormProps {
    onSubmit: (data: FilterValues) => void;
    onReset: () => void;
    isMIId6?: boolean;
}

export function FilterForm({ onSubmit, onReset, isMIId6 = false }: FilterFormProps) {
    const { data: loadData, isLoading: isLoadLoading } = useStudyCertificateLoadData();
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateOpen, setDateOpen] = useState(false);

    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            allorindid: 'A',
            studentStatus: 'S',
            certificateType: '0',
            addressType: 'address_per',
            parentType: '0',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            amst_Id: 0,
            selectedDate: new Date()
        }
    });
    const {
        formState: { errors }
    } = form;
    const { watch, setValue, reset } = form;
    const allorindid = watch('allorindid');
    const asmayId = watch('asmaY_Id');
    const asmclId = watch('asmcL_Id') || 0;
    const asmsId = watch('asmS_Id') || 0;
    const studentStatus = watch('studentStatus');
    const amstId = watch('amst_Id');

    const searchMutation = useStudyCertificateSearchFilterMutation();

    // Fetch student list when filters change
    const { data: studentListData, isLoading: isStudentLoading } = useStudyCertificateStudentList(
        {
            ASMAY_Id: asmayId,
            ASMCL_Id: allorindid === 'A' ? 0 : asmclId,
            ASMC_Id: allorindid === 'A' ? 0 : asmsId,
            AMST_Id: 0,
            AMST_SOL: studentStatus
        },
        !!asmayId
    );

    // Fetch all students of year when "All" is selected
    const { data: academicYearChangeData } = useStudyCertificateAcademicYearChange(
        {
            ASMAY_Id: asmayId,
            AMST_SOL: studentStatus
        },
        !!asmayId && allorindid === 'A'
    );

    const rawStudents =
        (studentListData as any)?.data?.studentList ||
        (studentListData as any)?.data?.fillstudlist ||
        (academicYearChangeData as any)?.data?.fillstudlist ||
        (Array.isArray(studentListData) ? studentListData : []);

    const students = (() => {
        const studentSource = searchQuery.length >= 3 ? studentListFromSearch : rawStudents;
        const seen = new Set();
        return studentSource
            .map((s: any) => ({
                ...s,
                studentName:
                    s.studentName ||
                    s.amsT_FirstName ||
                    `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
            }))
            .filter((s: any) => {
                const id = s.amsT_Id || s.AMST_Id;
                if (id && !seen.has(id)) {
                    seen.add(id);
                    return true;
                }
                return false;
            });
    })();

    // Debounced Search Effect
    useEffect(() => {
        if (!asmayId || searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            searchMutation.mutate(
                {
                    ASMAY_Id: Number(asmayId),
                    AMST_SOL: studentStatus,
                    ASMCL_Id: allorindid === 'A' ? 0 : asmclId,
                    ASMC_Id: allorindid === 'A' ? 0 : asmsId,
                    searchfilter: searchQuery,
                    allorindid: allorindid
                },
                {
                    onSuccess: (response: any) => {
                        const list = response?.data?.fillstudlist || response?.data || response?.studentList || response || [];
                        setStudentListFromSearch(Array.isArray(list) ? list : []);
                    }
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, asmayId, studentStatus]);

    // Handle validation and submission
    const onFormSubmit = (data: FilterValues) => {
        onSubmit(data);
    };

    const onFormError = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message as string);
        }
    };

    const handleReset = () => {
        reset();
        setSearchQuery('');
        setStudentListFromSearch([]);
        onReset();
    };

    const selectedStudent = students.find((s: any) => s.amsT_Id === amstId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit, onFormError)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Selection Mode */}
                    <FormField
                        control={form.control}
                        name='allorindid'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-3'>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='A' id='scope-all' />
                                            <Label htmlFor='scope-all' className='cursor-pointer font-medium text-sm'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='I' id='scope-ind' />
                                            <Label htmlFor='scope-ind' className='cursor-pointer font-medium text-sm'>
                                                Individual
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Student Status */}
                    <FormField
                        control={form.control}
                        name='studentStatus'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-3'>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='S' id='status-studying' />
                                            <Label htmlFor='status-studying' className='cursor-pointer font-medium text-sm'>
                                                Studying
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='L' id='status-left' />
                                            <Label htmlFor='status-left' className='cursor-pointer font-medium text-sm'>
                                                Left
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='D' id='status-deactive' />
                                            <Label htmlFor='status-deactive' className='cursor-pointer font-medium text-sm'>
                                                Deactive
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Certificate Type */}
                    <FormField
                        control={form.control}
                        name='certificateType'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-3'>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='type-character' />
                                            <Label htmlFor='type-character' className='cursor-pointer font-medium text-sm'>
                                                Character Certificate
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='type-study' />
                                            <Label htmlFor='type-study' className='cursor-pointer font-medium text-sm'>
                                                Study Certificate
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        setValue('amst_Id', 0);
                                    }}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(() => {
                                            const seen = new Set();
                                            return (loadData as any)?.data?.allAcademicYear
                                                ?.filter((y: any) => {
                                                    if (y.asmaY_Id && !seen.has(y.asmaY_Id)) {
                                                        seen.add(y.asmaY_Id);
                                                        return true;
                                                    }
                                                    return false;
                                                })
                                                .map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ));
                                        })()}
                                    </SelectContent>
                                </Select>
                                {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message as string}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Class */}
                    <FormField
                        control={form.control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold'>Class {allorindid === 'I' && <span className='text-red-500'>*</span>}</Label>
                                <Select
                                    disabled={allorindid === 'A'}
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        setValue('amst_Id', 0);
                                    }}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(() => {
                                            const seen = new Set();
                                            return (loadData as any)?.data?.allclasslist
                                                ?.filter((c: any) => {
                                                    if (c.asmcL_Id && !seen.has(c.asmcL_Id)) {
                                                        seen.add(c.asmcL_Id);
                                                        return true;
                                                    }
                                                    return false;
                                                })
                                                .map((c: any) => (
                                                    <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ));
                                        })()}
                                    </SelectContent>
                                </Select>
                                {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message as string}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold'>Section {allorindid === 'I' && <span className='text-red-500'>*</span>}</Label>
                                <Select
                                    disabled={allorindid === 'A'}
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        setValue('amst_Id', 0);
                                    }}
                                    value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(() => {
                                            const seen = new Set();
                                            return (loadData as any)?.data?.allsectionlist
                                                ?.filter((s: any) => {
                                                    if (s.asmS_Id && !seen.has(s.asmS_Id)) {
                                                        seen.add(s.asmS_Id);
                                                        return true;
                                                    }
                                                    return false;
                                                })
                                                .map((s: any) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ));
                                        })()}
                                    </SelectContent>
                                </Select>
                                {errors.asmS_Id && <FormError>{errors.asmS_Id.message as string}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Date */}
                    <FormField
                        control={form.control}
                        name='selectedDate'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <Label className='font-bold'>
                                    Date <span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                {field.value ? format(field.value, 'PP') : <span>Pick a date</span>}
                                                <div className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setDateOpen(false);
                                            }}
                                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.selectedDate && <FormError>{errors.selectedDate.message as string}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Student Select */}
                    <FormField
                        control={form.control}
                        name='amst_Id'
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
                                                    ? selectedStudent.studentName || selectedStudent.studentname
                                                    : 'Select Student'}
                                                <div className='flex items-center gap-2'>
                                                    {field.value ? (
                                                        <X
                                                            className='h-4 w-4 opacity-50 hover:opacity-100'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                field.onChange(0);
                                                                setSearchQuery('');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Search className='h-4 w-4 shrink-0 opacity-50' />
                                                </div>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[400px] p-0' align='start'>
                                        <Command shouldFilter={false}>
                                            <CommandInput placeholder='Search student (min 3 chars)...' onValueChange={setSearchQuery} />
                                            <CommandList>
                                                {searchMutation.isPending && (
                                                    <div className='flex items-center justify-center gap-2 p-4 text-center text-muted-foreground text-sm'>
                                                        <Loader2 className='h-4 w-4 animate-spin' /> Searching...
                                                    </div>
                                                )}
                                                {!searchMutation.isPending && students.length === 0 && (
                                                    <CommandEmpty>No student found.</CommandEmpty>
                                                )}
                                                <CommandGroup>
                                                    {students.map((s: any) => (
                                                        <CommandItem
                                                            key={s.amsT_Id}
                                                            onSelect={() => {
                                                                field.onChange(s.amsT_Id);
                                                                setStudentOpen(false);
                                                            }}>
                                                            <div className='flex flex-col'>
                                                                <span>{s.studentName || s.studentname}</span>
                                                                <span className='text-[10px] text-muted-foreground'>
                                                                    Adm: {s.admno || s.amsT_AdmNo} | {s.class || s.amsT_FirstName}-
                                                                    {s.section || s.amsT_MiddleName}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.amst_Id && <FormError>{errors.amst_Id.message as string}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Address Type */}
                    <FormField
                        control={form.control}
                        name='addressType'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-slate-50/50 p-3'>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-col space-y-2'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='address_per' id='addr-per' />
                                            <Label htmlFor='addr-per' className='cursor-pointer font-medium text-sm'>
                                                Permanent Address
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='address_con' id='addr-con' />
                                            <Label htmlFor='addr-con' className='cursor-pointer font-medium text-sm'>
                                                Communication Address
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Parent Name (MI_Id 6) */}
                {isMIId6 && (
                    <FormField
                        control={form.control}
                        name='parentType'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-lg border bg-white p-4 shadow-sm'>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className='flex justify-center space-x-8'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='parent-father' />
                                            <Label htmlFor='parent-father' className='cursor-pointer font-medium text-sm'>
                                                Father Name
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='parent-mother' />
                                            <Label htmlFor='parent-mother' className='cursor-pointer font-medium text-sm'>
                                                Mother Name
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='2' id='parent-both' />
                                            <Label htmlFor='parent-both' className='cursor-pointer font-medium text-sm'>
                                                Both
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                <div className='flex flex-wrap items-center justify-center gap-4 pt-6'>
                    <Button type='submit' className='min-w-[120px] bg-[#3f51b5] text-white uppercase shadow-md hover:bg-[#303f9f]'>
                        Report
                    </Button>
                    <Button
                        type='button'
                        onClick={handleReset}
                        className='min-w-[120px] bg-[#ff5722] text-white uppercase shadow-md hover:bg-[#f4511e]'>
                        <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
