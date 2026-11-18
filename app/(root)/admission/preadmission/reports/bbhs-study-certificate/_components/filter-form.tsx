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
    useBbhsStudyCertAcademicYearChange,
    useBbhsStudyCertSearchFilter
} from '@/hooks/admission/preadmission/reports/useBbhsStudyCertificate';
import { useDebounce } from '@/hooks/utils/use-debounce';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Loader2, RefreshCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    allorindii: z.enum(['A', 'I']),
    optradio: z.enum(['S', 'L', 'D']),
    character: z.enum(['0', '1']),
    asmaY_Id: z.string().min(1, 'Academic Year is required'),
    asmcL_Id: z.string().optional(),
    asmS_Id: z.string().optional(),
    paretsnamefather: z.enum(['0', '1', '2']),
    amsT_Id: z.string().min(1, 'Student is required'),
    date: z.date({
        required_error: 'Date is required'
    })
});

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
    const [classList, setClassList] = useState<any[]>(initialData?.allclasslist || []);
    const [sectionList, setSectionList] = useState<any[]>(initialData?.allsectionlist || []);

    const searchMutation = useBbhsStudyCertSearchFilter();
    const yearChangeMutation = useBbhsStudyCertAcademicYearChange();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            allorindii: 'A',
            optradio: 'S',
            character: '0',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: '',
            paretsnamefather: '0',
            amsT_Id: '',
            date: new Date()
        }
    });

    const {
        watch,
        setValue,
        reset,
        formState: { errors }
    } = form;
    const watchAllOrIndi = watch('allorindii');
    const watchYear = watch('asmaY_Id');
    const watchClass = watch('asmcL_Id');
    const watchSection = watch('asmS_Id');
    const watchOptRadio = watch('optradio');

    // Fetch students when debounced search or filters change
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear || !watchOptRadio) return;

            if (debouncedSearch.length < 2) {
                if (watchAllOrIndi === 'I') {
                    // Initial load for individual mode if needed,
                    // though legacy seems to rely on search mostly.
                }
                return;
            }

            try {
                const payload = {
                    searchfilter: debouncedSearch,
                    ASMAY_Id: Number.parseInt(watchYear),
                    AMST_SOL: watchOptRadio,
                    ASMCL_Id: watchAllOrIndi === 'A' ? 0 : Number.parseInt(watchClass || '0'),
                    ASMC_Id: watchAllOrIndi === 'A' ? 0 : Number.parseInt(watchSection || '0'),
                    allorindid: watchAllOrIndi
                };

                const response = await searchMutation.mutateAsync(payload);
                const data = response.data || response;

                if (data && data.fillstudlist) {
                    setStudentList(data.fillstudlist);
                } else {
                    setStudentList([]);
                }
            } catch (error) {
                console.error('Fetch students error:', error);
            }
        };

        fetchStudents();
    }, [debouncedSearch, watchYear, watchOptRadio, watchAllOrIndi, watchClass, watchSection]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        setSearchTerm('');
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Selection Type */}
                    <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                        <FormField
                            control={form.control}
                            name='allorindii'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <Label className='font-semibold text-slate-600 text-sm uppercase tracking-wider'>Report For</Label>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-4'>
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
                    <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                        <FormField
                            control={form.control}
                            name='optradio'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <Label className='font-semibold text-slate-600 text-sm uppercase tracking-wider'>Student Status</Label>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='S' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>Studying</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='L' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>Left</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='D' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>Deactive</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Certificate Type */}
                    <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                        <FormField
                            control={form.control}
                            name='character'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <Label className='font-semibold text-slate-600 text-sm uppercase tracking-wider'>
                                        Certificate Type
                                    </Label>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='0' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>Study Certificate</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='1' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-normal'>Character Certificate</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    {errors.character && <FormError>{errors.character.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='bg-white'>
                                                <SelectValue placeholder='Select Academic Year' />
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
                                    <Label className='font-semibold'>Class</Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={watchAllOrIndi === 'A'}>
                                        <FormControl>
                                            <SelectTrigger className='bg-white'>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classList.map((cls: any) => (
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
                                    <Label className='font-semibold'>Section</Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={watchAllOrIndi === 'A'}>
                                        <FormControl>
                                            <SelectTrigger className='bg-white'>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sectionList.map((sec: any) => (
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
                        <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                            <FormField
                                control={form.control}
                                name='paretsnamefather'
                                render={({ field }) => (
                                    <FormItem className='space-y-3'>
                                        <Label className='font-semibold text-slate-600 text-sm uppercase tracking-wider'>
                                            Parent Name On Certificate
                                        </Label>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className='flex flex-wrap gap-4'>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='0' />
                                                    </FormControl>
                                                    <Label className='cursor-pointer font-normal'>Father Name</Label>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='1' />
                                                    </FormControl>
                                                    <Label className='cursor-pointer font-normal'>Mother Name</Label>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='2' />
                                                    </FormControl>
                                                    <Label className='cursor-pointer font-normal'>Both</Label>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
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
                                                            'h-8 w-full justify-between border-slate-300 bg-white px-3 font-normal shadow-sm',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <span className='truncate pr-2'>
                                                            {searchMutation.isPending
                                                                ? 'Searching...'
                                                                : field.value &&
                                                                    studentList.find((s) => s.amsT_Id.toString() === field.value)
                                                                  ? studentList.find((s) => s.amsT_Id.toString() === field.value)
                                                                        .studentname ||
                                                                    studentList.find((s) => s.amsT_Id.toString() === field.value)
                                                                        .amsT_FirstName
                                                                  : 'Search Student...'}
                                                        </span>
                                                        <div className='flex shrink-0 items-center'>
                                                            {searchMutation.isPending ? (
                                                                <Loader2 className='h-3 w-3 animate-spin opacity-50' />
                                                            ) : (
                                                                <>
                                                                    {field.value && (
                                                                        <X
                                                                            className='mr-1 h-3 w-3 opacity-50 transition-opacity hover:opacity-100'
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                field.onChange('');
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
                                                        placeholder='Type name to search student (min 2 chars)...'
                                                        className='h-9'
                                                        onValueChange={setSearchTerm}
                                                        value={searchTerm}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {searchMutation.isPending ? (
                                                                <Loader2 className='mx-auto h-4 w-4 animate-spin text-primary' />
                                                            ) : (
                                                                'No student found.'
                                                            )}
                                                        </CommandEmpty>
                                                        <CommandGroup className='max-h-64 w-full overflow-y-auto'>
                                                            {studentList.map((s: any) => (
                                                                <CommandItem
                                                                    key={s.amsT_Id}
                                                                    value={s.amsT_Id.toString()}
                                                                    className='aria-selected:bg-slate-100'
                                                                    onSelect={() => {
                                                                        field.onChange(s.amsT_Id.toString());
                                                                        setStudentOpen(false);
                                                                        setSearchTerm('');
                                                                    }}>
                                                                    <div className='flex flex-col py-1'>
                                                                        <span className='font-semibold text-slate-900 group-aria-selected:text-black'>
                                                                            {s.studentname || s.amsT_FirstName}
                                                                        </span>
                                                                        <span className='text-[10px] text-muted-foreground/60 uppercase'>
                                                                            {s.class && s.section
                                                                                ? `${s.class} - ${s.section}`
                                                                                : s.asmcL_ClassName
                                                                                  ? `${s.asmcL_ClassName} - ${s.asmC_SectionName}`
                                                                                  : 'Details Not Available'}
                                                                        </span>
                                                                    </div>
                                                                    {field.value === s.amsT_Id.toString() && (
                                                                        <Check className='ml-auto h-4 w-4 shrink-0 text-primary' />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.amsT_Id && <FormError>{errors.amsT_Id.message}</FormError>}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='date'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <Label className='mb-1 font-semibold'>
                                        Issue Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    {errors.date && <FormError>{errors.date.message}</FormError>}
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-6'>
                    <Button type='submit' size='lg' className='min-w-[140px] shadow-md transition-all hover:shadow-lg active:scale-95'>
                        <FileText className='mr-2 h-4 w-4' /> Generate Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        size='lg'
                        onClick={handleReset}
                        className='min-w-[140px] transition-all hover:bg-slate-50 active:scale-95'>
                        <RefreshCcw className='mr-2 h-4 w-4' /> Reset Form
                    </Button>
                    {/* <Button 
                        type="button" 
                        variant="ghost" 
                        size="lg" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleReset}
                    >
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button> */}
                </div>
            </form>
        </Form>
    );
}
