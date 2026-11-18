'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBcehStudyCertSearchStudent } from '@/hooks/admission/preadmission/reports/useBcehStudyCertificate';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { cn } from '@/lib/utils';
import {
    type BcehStudyCertificateSchema,
    bcehStudyCertificateSchema
} from '@/schemas/admission/preadmission/reports/bceh-study-certificate.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, FileText, Loader2, RefreshCcw, Search } from 'lucide-react';
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
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const studentSearchMutation = useBcehStudyCertSearchStudent();

    const form = useForm<BcehStudyCertificateSchema>({
        resolver: zodResolver(bcehStudyCertificateSchema),
        defaultValues: {
            allorindii: 'A',
            optradio: 'S',
            Character: '0',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: '',
            amsT_Id: '',
            ASA_FromDate: new Date()
        }
    });

    const {
        watch,
        formState: { errors }
    } = form;
    const watchAllOrIndi = watch('allorindii');
    const watchStudyingLeft = watch('optradio');
    const watchYear = watch('asmaY_Id');
    const watchClass = watch('asmcL_Id');
    const watchSection = watch('asmS_Id');

    // Cascading resets
    useEffect(() => {
        if (watchAllOrIndi === 'A') {
            form.setValue('asmcL_Id', '');
            form.setValue('asmS_Id', '');
            form.setValue('amsT_Id', '');
            setStudentList([]);
        }
    }, [watchAllOrIndi, form]);

    useEffect(() => {
        form.setValue('amsT_Id', '');
        setStudentList([]);
        setSearchTerm('');
    }, [watchYear, watchClass, watchSection, watchStudyingLeft]);

    // Student Search Logic
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear) return;
            if (debouncedSearch.length < 2) return;

            try {
                const payload = {
                    searchfilter: debouncedSearch,
                    ASMAY_Id: Number.parseInt(watchYear),
                    AMST_SOL: watchStudyingLeft,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : watchClass ? Number.parseInt(watchClass) : 0,
                    ASMC_Id: watchAllOrIndi === 'A' ? 0 : watchSection ? Number.parseInt(watchSection) : 0,
                    allorindid: watchAllOrIndi
                };

                const response = await studentSearchMutation.mutateAsync(payload);
                const data = response.data || response;

                if (data && data.fillstudlist) {
                    setStudentList(data.fillstudlist);
                } else if (data && data.count === 0) {
                    setStudentList([]);
                    toast.info('No students found for this search criteria');
                }
            } catch (error) {
                console.error('Student search error:', error);
            }
        };

        fetchStudents();
    }, [debouncedSearch, watchYear, watchClass, watchSection, watchStudyingLeft, watchAllOrIndi]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* Mode Selectors */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='allorindii'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <Label className='font-semibold text-slate-700'>Scope:</Label>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className='flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='A' id='scope-all' />
                                            <label htmlFor='scope-all' className='cursor-pointer text-sm'>
                                                All
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='I' id='scope-ind' />
                                            <label htmlFor='scope-ind' className='cursor-pointer text-sm'>
                                                Individual
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='optradio'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <Label className='font-semibold text-slate-700'>Status:</Label>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className='flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='S' id='status-studying' />
                                            <label htmlFor='status-studying' className='cursor-pointer text-sm'>
                                                Studying
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='L' id='status-left' />
                                            <label htmlFor='status-left' className='cursor-pointer text-sm'>
                                                Left
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='Character'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <Label className='font-semibold text-slate-700'>Certificate Type:</Label>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className='flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='type-study' />
                                            <label htmlFor='type-study' className='cursor-pointer font-medium text-primary text-sm'>
                                                Study Certificate
                                            </label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='2' id='type-noc' />
                                            <label htmlFor='type-noc' className='cursor-pointer font-medium text-primary text-sm'>
                                                No Objection Cert
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-8 pt-4 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold text-slate-700'>
                                        Academic Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='border-slate-300 bg-white'>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allAcademicYear?.map((yr: any) => (
                                                <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                                    {yr.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='asmcL_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className={cn('font-semibold text-slate-700', watchAllOrIndi === 'A' && 'opacity-50')}>
                                        Class:{watchAllOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                    </Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={watchAllOrIndi === 'A'}>
                                        <FormControl>
                                            <SelectTrigger className='border-slate-300 bg-white disabled:bg-slate-100'>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allclasslist?.map((cls: any) => (
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

                        <FormField
                            control={form.control}
                            name='asmS_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className={cn('font-semibold text-slate-700', watchAllOrIndi === 'A' && 'opacity-50')}>
                                        Section:{watchAllOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                    </Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={watchAllOrIndi === 'A'}>
                                        <FormControl>
                                            <SelectTrigger className='border-slate-300 bg-white disabled:bg-slate-100'>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.allsectionlist?.map((sec: any) => (
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
                    <div className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='ASA_FromDate'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <Label className='mb-1 font-semibold text-slate-700'>
                                        Certificate Date:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full border-slate-300 bg-white pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.ASA_FromDate && <FormError>{errors.ASA_FromDate.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='amsT_Id'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <Label className='mb-1 font-semibold text-slate-700'>
                                        Student:<span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className={cn(
                                                        'h-10 w-full justify-between border-slate-300 bg-white px-3 text-left font-normal shadow-sm',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <span className='truncate pr-2'>
                                                        {studentSearchMutation.isPending
                                                            ? 'Searching...'
                                                            : field.value && studentList.find((s) => s.amsT_Id.toString() === field.value)
                                                              ? studentList.find((s) => s.amsT_Id.toString() === field.value).amsT_FirstName
                                                              : 'Select or search Student'}
                                                    </span>
                                                    <div className='flex shrink-0 items-center'>
                                                        {studentSearchMutation.isPending ? (
                                                            <Loader2 className='h-4 w-4 animate-spin opacity-50' />
                                                        ) : (
                                                            <Search className='h-4 w-4 opacity-50' />
                                                        )}
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-full p-0 sm:w-[400px]' align='start'>
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder='Type at least 2 characters to search...'
                                                    className='h-9'
                                                    onValueChange={setSearchTerm}
                                                    value={searchTerm}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        {searchTerm.length < 2
                                                            ? 'Please type at least 2 characters'
                                                            : studentSearchMutation.isPending
                                                              ? 'Searching...'
                                                              : 'No student found.'}
                                                    </CommandEmpty>
                                                    <CommandGroup className='max-h-64 overflow-y-auto'>
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                key={s.amsT_Id}
                                                                value={s.amsT_Id.toString()}
                                                                onSelect={() => {
                                                                    field.onChange(s.amsT_Id.toString());
                                                                    setStudentOpen(false);
                                                                }}>
                                                                <div className='flex items-center gap-2 py-1'>
                                                                    <Check
                                                                        className={cn(
                                                                            'h-4 w-4 shrink-0 text-primary',
                                                                            field.value === s.amsT_Id.toString()
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    <div className='flex flex-col'>
                                                                        <span className='font-semibold text-slate-900 leading-tight'>
                                                                            {s.amsT_FirstName}
                                                                        </span>
                                                                        <span className='mt-0.5 text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                                            Adm No: {s.amsT_AdmNo}
                                                                        </span>
                                                                    </div>
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
                            )}
                        />
                    </div>
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 border-slate-100 border-t pt-8'>
                    <Button
                        type='submit'
                        size='lg'
                        className='min-w-[160px] bg-primary shadow-md transition-all hover:shadow-lg active:scale-95'>
                        <FileText className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        size='lg'
                        onClick={handleReset}
                        className='min-w-[160px] border-slate-300 transition-all hover:bg-slate-50'>
                        <RefreshCcw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                    {/* <Button 
                        type="button" 
                        variant="ghost" 
                        size="lg" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 min-w-[160px]"
                        onClick={handleReset}
                    >
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button> */}
                </div>
            </form>
        </Form>
    );
}
