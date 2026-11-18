'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCBSNoObjectionAcademicYearChange,
    useCBSNoObjectionSearchFilter,
    useCBSNoObjectionStudentStatusChange
} from '@/hooks/admission/preadmission/reports/useCBSNoObjectionCert';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { cn } from '@/lib/utils';
import {
    type TCbsNoObjectionCertSchema,
    cbsNoObjectionCertSchema
} from '@/schemas/admission/preadmission/reports/cbs-no-objection-cert.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    initialData: {
        allAcademicYear: any[];
        allclasslist: any[];
        allsectionlist: any[];
        masterCompany: any[];
    } | null;
    onSubmit: (data: any) => void;
    onReset: () => void;
}

const uniqueBy = <T,>(arr: T[], key: keyof T): T[] => {
    const seen = new Set();
    return arr.filter((item) => {
        const val = item[key];
        if (val === undefined || val === null) return true;
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    });
};

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const searchMutation = useCBSNoObjectionSearchFilter();
    const academicYearMutation = useCBSNoObjectionAcademicYearChange();
    const studentStatusMutation = useCBSNoObjectionStudentStatusChange();

    const form = useForm<TCbsNoObjectionCertSchema>({
        resolver: zodResolver(cbsNoObjectionCertSchema),
        mode: 'all',
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            date: new Date(),
            amsT_Id: 0
        }
    });

    const {
        formState: { errors }
    } = form;

    const watchAllOrIndi = form.watch('allorindi');
    const watchAcademicYear = form.watch('asmaY_Id');
    const watchStatus = form.watch('optradio');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');

    // Handle student search
    useEffect(() => {
        const fetchStudents = async () => {
            if (debouncedSearch.length >= 3 && watchAcademicYear) {
                const payload = {
                    filterinitialdata: watchStatus,
                    searchfilter: debouncedSearch,
                    ASMAY_Id: watchAcademicYear,
                    AMST_SOL: watchStatus,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : watchClass || 0,
                    ASMS_Id: watchAllOrIndi === 'A' ? 0 : watchSection || 0,
                    allorindid: watchAllOrIndi === 'A' ? 'all' : 'indi'
                };

                try {
                    const response = await searchMutation.mutateAsync(payload);
                    if (response.data && response.data.fillstudlist) {
                        setStudentList(response.data.fillstudlist);
                    } else if (response.data && Array.isArray(response.data)) {
                        setStudentList(response.data);
                    } else if (response.data && response.data.count === 0) {
                        setStudentList([]);
                    }
                } catch (error) {
                    console.error('Student search error:', error);
                }
            }
        };

        fetchStudents();
    }, [debouncedSearch, watchAcademicYear, watchStatus, watchAllOrIndi, watchClass, watchSection]);

    // Handle status change
    const onStatusChange = async (val: string) => {
        form.setValue('optradio', val, { shouldValidate: true });
        form.setValue('amsT_Id', undefined as any, { shouldValidate: true });
        setStudentList([]);
        try {
            const response = await studentStatusMutation.mutateAsync({ AMST_SOL: val });
            if (response?.data?.fillstudlist) {
                setStudentList(response.data.fillstudlist);
            }
        } catch (error) {
            console.error('Status change error:', error);
        }
    };

    // Handle academic year change
    const onAcademicYearChange = async (val: number) => {
        form.setValue('asmaY_Id', val, { shouldValidate: true });
        form.setValue('amsT_Id', undefined as any, { shouldValidate: true });
        setStudentList([]);
        try {
            const payload = {
                ASMAY_Id: val,
                AMST_SOL: watchStatus
            };
            const response = await academicYearMutation.mutateAsync(payload);
            // Based on user provided JSON, data is a direct array if successful
            if (response?.data && Array.isArray(response.data)) {
                setStudentList(response.data);
            } else if (response?.data?.fillstudlist) {
                setStudentList(response.data.fillstudlist);
            }
        } catch (error) {
            console.error('Academic year change error:', error);
        }
    };

    const handleFormReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Filter Type */}
                    <div className='space-y-4 rounded-lg border bg-slate-50 p-4'>
                        <FormField
                            control={form.control}
                            name='allorindi'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <Label>Filter View</Label>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='A' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>All</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='I' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>Individual</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Student Status */}
                    <div className='space-y-4 rounded-lg border bg-slate-50 p-4'>
                        <FormField
                            control={form.control}
                            name='optradio'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <Label>Student Status</Label>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={onStatusChange}
                                            defaultValue={field.value}
                                            className='flex flex-wrap gap-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='S' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal font-semibold text-green-700'>Studying</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='L' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal font-semibold text-red-700'>Left</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='D' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal font-semibold text-slate-700'>Deactive</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        {/* Academic Year */}
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(val) => onAcademicYearChange(Number(val))}
                                        value={field.value?.toString() || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {uniqueBy(initialData?.allAcademicYear || [], 'asmaY_Id').map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        {/* Class */}
                        <FormField
                            control={form.control}
                            name='asmcL_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Class {watchAllOrIndi === 'I' && <span className='text-destructive'>*</span>}</Label>
                                    <Select
                                        disabled={watchAllOrIndi === 'A'}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString() || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {uniqueBy(initialData?.allclasslist || [], 'asmcL_Id').map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        {/* Section */}
                        <FormField
                            control={form.control}
                            name='asmS_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Section {watchAllOrIndi === 'I' && <span className='text-destructive'>*</span>}</Label>
                                    <Select
                                        disabled={watchAllOrIndi === 'A'}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString() || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {uniqueBy(initialData?.allsectionlist || [], 'asmS_Id').map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        {/* Date */}
                        <FormField
                            control={form.control}
                            name='date'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <Label>
                                        Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    {errors.date && <FormError>{errors.date.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        {/* Student Selection with Search (GMVPS Style Combobox) */}
                        <FormField
                            control={form.control}
                            name='amsT_Id'
                            render={({ field }) => {
                                const selectedStudent = studentList.find((s: any) => s.amsT_Id === field.value);
                                return (
                                    <FormItem className='flex flex-col'>
                                        <Label>
                                            Student <span className='text-destructive'>*</span>
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
                                                            ? selectedStudent.amsT_FirstName || selectedStudent.studentname
                                                            : 'Select Student'}
                                                        <div className='flex items-center gap-2'>
                                                            {field.value ? (
                                                                <X
                                                                    className='h-4 w-4 opacity-50 hover:opacity-100'
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        field.onChange(undefined);
                                                                        setSearchTerm('');
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
                                                    <CommandInput
                                                        placeholder='Search student (min 3 chars)...'
                                                        onValueChange={setSearchTerm}
                                                        value={searchTerm}
                                                    />
                                                    <CommandList>
                                                        {searchMutation.isPending && (
                                                            <div className='flex items-center justify-center gap-2 p-4 text-center text-muted-foreground text-sm'>
                                                                <Loader2 className='h-4 w-4 animate-spin' /> Searching...
                                                            </div>
                                                        )}
                                                        {!searchMutation.isPending && studentList.length === 0 && (
                                                            <CommandEmpty>No student found.</CommandEmpty>
                                                        )}
                                                        <CommandGroup>
                                                            {uniqueBy(studentList, 'amsT_Id').map((stud: any) => (
                                                                <CommandItem
                                                                    key={stud.amsT_Id}
                                                                    onSelect={() => {
                                                                        field.onChange(stud.amsT_Id);
                                                                        setStudentOpen(false);
                                                                    }}>
                                                                    <div className='flex flex-col'>
                                                                        <span className='flex items-center gap-2'>
                                                                            {stud.amsT_FirstName || stud.studentname}
                                                                            {field.value === stud.amsT_Id && (
                                                                                <Check className='h-3 w-3 text-primary' />
                                                                            )}
                                                                        </span>
                                                                        <span className='text-[10px] text-muted-foreground'>
                                                                            Adm: {stud.amsT_AdmNo || stud.admno} | {stud.asmaY_Year || ''}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.amsT_Id && <FormError>{errors.amsT_Id.message}</FormError>}
                                    </FormItem>
                                );
                            }}
                        />
                    </div>
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-6'>
                    <Button type='submit' className='min-w-32 bg-primary hover:bg-primary/90'>
                        <FileText className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleFormReset}
                        className='min-w-32 border-warn text-warn hover:bg-warn/10'>
                        <X className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
