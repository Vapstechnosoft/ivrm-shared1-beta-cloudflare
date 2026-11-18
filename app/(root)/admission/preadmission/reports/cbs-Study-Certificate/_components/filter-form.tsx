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
    useCbsStudyCertAcademicYearChange,
    useCbsStudyCertSearchFilter
} from '@/hooks/admission/preadmission/reports/useCbsStudyCertificate';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { cn } from '@/lib/utils';
import {
    type TCbsStudyCertificateSchema,
    cbsStudyCertificateSchema
} from '@/schemas/admission/preadmission/reports/cbs-study-certificate.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FilterFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentData, setSelectedStudentData] = useState<any>(null); // Caching selected student
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const searchMutation = useCbsStudyCertSearchFilter();
    const yearChangeMutation = useCbsStudyCertAcademicYearChange();

    const form = useForm<TCbsStudyCertificateSchema>({
        resolver: zodResolver(cbsStudyCertificateSchema),
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            character: '0',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            boardType: 'ICSE',
            charType: 'satisfactory',
            date: new Date(),
            amsT_Id: 0,
            address_opt: 'address_per',
            paretsnamefather: '0'
        }
    });

    const { watch, setValue, reset, control, handleSubmit } = form;

    const watchAllOrIndi = watch('allorindi');
    const watchAcademicYear = watch('asmaY_Id');
    const watchStatus = watch('optradio');
    const watchClass = watch('asmcL_Id');
    const watchSection = watch('asmS_Id');
    const watchStudent = watch('amsT_Id');

    useEffect(() => {
        if (initialData?.allAcademicYear?.length > 0 && !watchAcademicYear) {
            const activeYear = initialData.allAcademicYear.find((y: any) => y.asmaY_ActiveFlag === 1) || initialData.allAcademicYear[0];
            if (activeYear) {
                setValue('asmaY_Id', activeYear.asmaY_Id);
            }
        }
    }, [initialData, watchAcademicYear, setValue]);

    // Combined Student Fetching Logic
    useEffect(() => {
        const fetchData = async () => {
            if (!watchAcademicYear || !watchStatus) return;

            try {
                if (debouncedSearch.length >= 2) {
                    // Search mode
                    const payload = {
                        searchfilter: debouncedSearch,
                        ASMAY_Id: watchAcademicYear,
                        AMST_SOL: watchStatus,
                        ASMCL_Id: watchAllOrIndi === 'A' ? 0 : watchClass || 0,
                        ASMC_Id: watchAllOrIndi === 'A' ? 0 : watchSection || 0,
                        allorindid: watchAllOrIndi // Pass 'A' or 'I' directly
                    };
                    const res: any = await searchMutation.mutateAsync(payload);
                    const data = res?.data || res;
                    const students = data?.fillstudlist || [];
                    setStudentList(students);
                } else if (watchAllOrIndi === 'I') {
                    // Initial individual load mode
                    const response = await yearChangeMutation.mutateAsync({
                        AMST_SOL: watchStatus,
                        ASMAY_Id: watchAcademicYear
                    });
                    const data = response?.data || response;
                    const students = data?.fillstudlist || [];
                    setStudentList(students);
                } else {
                    // Clear list for "All" mode if not searching
                    setStudentList([]);
                }
            } catch (error) {
                console.error('Fetch students error:', error);
            }
        };

        fetchData();
    }, [
        debouncedSearch,
        watchAcademicYear,
        watchStatus,
        watchAllOrIndi,
        watchClass,
        watchSection
        // searchMutation and yearChangeMutation are stable from useMutation
    ]);

    const handleFormError = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    const handleFormReset = () => {
        reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    const selectedStudent = studentList.find((s: any) => s.amsT_Id === watchStudent);

    const isPending = yearChangeMutation.isPending || searchMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit, handleFormError)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                    {/* LEFT COLUMN */}
                    <div className='space-y-4'>
                        <FormField
                            control={control}
                            name='allorindi'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-center space-y-0 rounded-md border border-slate-200 bg-slate-50/30 p-2'>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-10'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='A' id='v-all' />
                                                <Label htmlFor='v-all' className='cursor-pointer font-bold text-slate-700 text-sm'>
                                                    All
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='I' id='v-ind' />
                                                <Label htmlFor='v-ind' className='cursor-pointer font-bold text-slate-700 text-sm'>
                                                    Individual
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name='character'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-center space-y-0 rounded-md border border-slate-200 bg-slate-50/30 p-2'>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='0' id='c-study' />
                                                <Label
                                                    htmlFor='c-study'
                                                    className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase'>
                                                    Study Cert
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id='c-char' />
                                                <Label
                                                    htmlFor='c-char'
                                                    className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase'>
                                                    Character Cert
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='2' id='c-noc' />
                                                <Label
                                                    htmlFor='c-noc'
                                                    className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase'>
                                                    No Objection Cert
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>
                                        Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='col-span-2'>
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData?.allAcademicYear?.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.asmaY_Id && <FormError>{form.formState.errors.asmaY_Id.message}</FormError>}
                                    </div>
                                </FormItem>
                            )}
                        />

                        {watchAllOrIndi === 'I' && (
                            <>
                                <FormField
                                    control={control}
                                    name='asmcL_Id'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                            <Label className='col-span-1 font-bold text-slate-700 text-sm'>Class:</Label>
                                            <div className='col-span-2'>
                                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                            <SelectValue placeholder='Select Class' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value='0'>-- All Classes --</SelectItem>
                                                        {initialData?.allclasslist?.map((c: any) => (
                                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                                {c.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {form.formState.errors.asmcL_Id && (
                                                    <FormError>{form.formState.errors.asmcL_Id.message}</FormError>
                                                )}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name='asmS_Id'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-3 items-center space-y-0'>
                                            <Label className='col-span-1 font-bold text-slate-700 text-sm'>Section:</Label>
                                            <div className='col-span-2'>
                                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                            <SelectValue placeholder='Select Section' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value='0'>-- All Sections --</SelectItem>
                                                        {initialData?.allsectionlist?.map((s: any) => (
                                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                                {s.asmC_SectionName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {form.formState.errors.asmS_Id && (
                                                    <FormError>{form.formState.errors.asmS_Id.message}</FormError>
                                                )}
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <FormField
                            control={control}
                            name='address_opt'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-center space-y-0 rounded-md border border-slate-200 bg-slate-50/30 p-2'>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='address_per' id='m-per' />
                                                <Label
                                                    htmlFor='m-per'
                                                    className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase'>
                                                    Permanent Address
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='address_con' id='m-con' />
                                                <Label
                                                    htmlFor='m-con'
                                                    className='cursor-pointer font-bold text-[10px] text-slate-700 uppercase'>
                                                    Communication Address
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Father/Mother/Both Name Logic - Visible if mI_Id is 6 */}
                        {initialData?.masterCompany?.[0]?.mI_Id === 6 && (
                            <FormField
                                control={control}
                                name='paretsnamefather'
                                render={({ field }) => (
                                    <FormItem className='fade-in slide-in-from-top-2 flex animate-in items-center justify-center space-y-0 rounded-md border border-slate-200 border-yellow-100 bg-yellow-50/30 p-3 duration-500'>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className='flex items-center gap-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='0' id='pn-f' className='text-[#5c6bc0]' />
                                                    <Label
                                                        htmlFor='pn-f'
                                                        className='cursor-pointer font-semibold text-[11px] text-slate-600 uppercase tracking-tighter'>
                                                        Father Name
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='1' id='pn-m' className='text-[#5c6bc0]' />
                                                    <Label
                                                        htmlFor='pn-m'
                                                        className='cursor-pointer font-semibold text-[11px] text-slate-600 uppercase tracking-tighter'>
                                                        Mother Name
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='2' id='pn-b' className='text-[#5c6bc0]' />
                                                    <Label
                                                        htmlFor='pn-b'
                                                        className='cursor-pointer font-semibold text-[11px] text-slate-600 uppercase tracking-tighter'>
                                                        Both
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className='space-y-4'>
                        <FormField
                            control={control}
                            name='optradio'
                            render={({ field }) => (
                                <FormItem className='flex items-center justify-center space-y-0 rounded-md border border-slate-200 bg-slate-50/30 p-2'>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='S' id='s-s' />
                                                <Label htmlFor='s-s' className='cursor-pointer font-bold text-green-700 text-sm'>
                                                    Studying
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='L' id='s-l' />
                                                <Label htmlFor='s-l' className='cursor-pointer font-bold text-red-700 text-sm'>
                                                    Left
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='D' id='s-d' />
                                                <Label htmlFor='s-d' className='cursor-pointer font-bold text-slate-600 text-sm'>
                                                    Deactive
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name='amsT_Id'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 pr-2 font-bold text-slate-700 text-sm'>
                                        Student:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='col-span-3'>
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant='outline'
                                                        role='combobox'
                                                        className={cn(
                                                            'h-8 w-full justify-between border-slate-300 bg-white font-normal shadow-sm',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <span className='truncate pr-2'>
                                                            {isPending
                                                                ? 'Searching...'
                                                                : field.value && (selectedStudentData || selectedStudent)
                                                                  ? (selectedStudentData || selectedStudent).studentname ||
                                                                    (selectedStudentData || selectedStudent).amsT_FirstName
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
                                                        placeholder='Type to search (min 2 chars)...'
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
                                                            {studentList.map((s: any) => (
                                                                <CommandItem
                                                                    key={s.amsT_Id}
                                                                    value={s.amsT_Id.toString()} // Required for reliable selection
                                                                    className='aria-selected:bg-indigo-50'
                                                                    onSelect={() => {
                                                                        field.onChange(s.amsT_Id);
                                                                        setSelectedStudentData(s);
                                                                        setStudentOpen(false);
                                                                        setSearchTerm('');
                                                                    }}>
                                                                    <div className='flex flex-col py-1'>
                                                                        <span className='font-semibold text-indigo-900 group-aria-selected:text-indigo-950'>
                                                                            {s.studentname || s.amsT_FirstName || s.amsT_FirstName}
                                                                        </span>
                                                                        <span className='text-[10px] text-muted-foreground/60 uppercase'>
                                                                            {s.class && s.section
                                                                                ? `${s.class} - ${s.section}`
                                                                                : s.asmcL_ClassName
                                                                                  ? `${s.asmcL_ClassName} - ${s.asmC_SectionName}`
                                                                                  : 'Details Not Available'}
                                                                        </span>
                                                                    </div>

                                                                    {field.value === s.amsT_Id && (
                                                                        <Check className='ml-auto h-4 w-4 shrink-0 text-indigo-600' />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {form.formState.errors.amsT_Id && <FormError>{form.formState.errors.amsT_Id.message}</FormError>}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name='boardType'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>Board:</Label>
                                    <div className='col-span-3'>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                    <SelectValue placeholder='Select Board' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='ISC'>ISC</SelectItem>
                                                <SelectItem value='ICSE'>ICSE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name='charType'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>Character:</Label>
                                    <div className='col-span-3'>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='h-8 border-slate-300 bg-white'>
                                                    <SelectValue placeholder='Select Type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='good'>Good</SelectItem>
                                                <SelectItem value='satisfactory'>Satisfactory</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name='date'
                            render={({ field }) => (
                                <FormItem className='grid grid-cols-4 items-center space-y-0'>
                                    <Label className='col-span-1 font-bold text-slate-700 text-sm'>
                                        Date:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='col-span-3'>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                        {form.formState.errors.date && <FormError>{form.formState.errors.date.message}</FormError>}
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className='mt-6 flex items-center justify-end gap-3 border-slate-100 border-t pt-6'>
                    <Button
                        type='submit'
                        disabled={isPending}
                        className='flex h-9 items-center gap-2 bg-[#5c6bc0] px-8 font-bold text-white uppercase tracking-wider shadow-sm transition-all hover:bg-[#3f51b5] active:scale-95'>
                        {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <FileText className='h-4 w-4' />}
                        REPORT
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleFormReset}
                        className='h-9 border-none bg-[#ff5722] px-8 font-bold text-white uppercase tracking-wider shadow-sm transition-all hover:bg-[#e64a19] active:scale-95'>
                        CANCEL
                    </Button>
                </div>
            </form>
        </Form>
    );
}
