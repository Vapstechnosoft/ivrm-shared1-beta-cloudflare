'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useNdaTcInitialData,
    useNdaTcStudentList,
    useNdaTcStudentNameChange
} from '@/hooks/admission/preadmission/useNdaTransferCertificate';
import { cn } from '@/lib/utils';
import { type NdaTcFields, ndaTcSchema } from '@/schemas/admission/preadmission/reports/nda-transfer-certificate';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    onSubmit: (data: NdaTcFields) => void;
    onReset: () => void;
}

export function FilterForm({ onSubmit, onReset }: FilterFormProps) {
    const { data: initialData } = useNdaTcInitialData();
    const studentListMutation = useNdaTcStudentList();
    const studentNameChangeMutation = useNdaTcStudentNameChange();

    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [studentDetails, setStudentDetails] = useState<any>(null);

    const form = useForm<NdaTcFields>({
        resolver: zodResolver(ndaTcSchema),
        defaultValues: {
            asmaY_Id: '',
            Date11: new Date(),
            admnoorname: 'stdname',
            tctemporper: 'per',
            amsT_Id: undefined as any
        }
    });

    const { watch, setValue, reset, control, handleSubmit } = form;
    const asmayId = watch('asmaY_Id');
    const admnoorname = watch('admnoorname');
    const tctemporper = watch('tctemporper');
    const selectedStudent = watch('amsT_Id');

    // Reset dependant fields if parent changes
    useEffect(() => {
        setValue('amsT_Id', undefined as any);
    }, [asmayId, setValue]);

    useEffect(() => {
        if (asmayId) {
            studentListMutation.mutate(
                {
                    ASMAY_Id: Number(asmayId),
                    admnoorname: admnoorname,
                    tctemporper: tctemporper
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        const list = data?.studentlist || (Array.isArray(data) ? data : []);
                        setStudentList(list);
                    }
                }
            );
        }
    }, [asmayId, admnoorname, tctemporper]);

    // Handle Student Selection Change (mimicking stdnamechange)
    useEffect(() => {
        if (selectedStudent?.amsT_Id && asmayId) {
            studentNameChangeMutation.mutate(
                {
                    AMST_Id: selectedStudent.amsT_Id,
                    ASMAY_Id: Number(asmayId)
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        const details = data?.classsecregno || (Array.isArray(data) ? data : []);
                        if (details && details.length > 0) {
                            setStudentDetails(details[0]);
                        }
                    }
                }
            );
        } else {
            setStudentDetails(null);
        }
    }, [selectedStudent, asmayId]);

    const handleReset = () => {
        reset();
        setStudentList([]);
        setStudentDetails(null);
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-inner'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-bold text-slate-600 text-sm uppercase tracking-wider'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-11 rounded-xl border-slate-200 bg-white focus:ring-primary/20'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='max-h-64'>
                                            {(() => {
                                                const years = initialData?.data?.accyear || initialData?.accyear || [];
                                                return (
                                                    Array.isArray(years) &&
                                                    years.map((y: any, index: number) => {
                                                        if (!y?.asmaY_Id) return null;
                                                        return (
                                                            <SelectItem key={`${y.asmaY_Id}-${index}`} value={y.asmaY_Id?.toString()}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        );
                                                    })
                                                );
                                            })()}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='Date11'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel className='font-bold text-slate-600 text-sm uppercase tracking-wider'>
                                        Issued Date <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'h-11 w-full rounded-xl border-slate-200 bg-white pl-3 text-left font-normal hover:bg-slate-50',
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
                                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='pt-2'>
                            <FormField
                                control={form.control}
                                name='admnoorname'
                                render={({ field }) => (
                                    <FormItem className='space-y-2'>
                                        <FormLabel className='font-black text-indigo-900/40 text-xs uppercase tracking-widest'>
                                            Search By
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value as string}
                                                className='flex items-center gap-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem
                                                        value='stdname'
                                                        id='stdname_nda'
                                                        className='border-slate-300 text-indigo-600'
                                                    />
                                                    <Label htmlFor='stdname_nda' className='cursor-pointer font-semibold text-slate-700'>
                                                        Name
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-inner'>
                        <FormField
                            control={form.control}
                            name='tctemporper'
                            render={({ field }) => (
                                <FormItem className='space-y-4'>
                                    <FormLabel className='font-bold text-slate-600 text-sm uppercase tracking-wider'>
                                        Student Type
                                    </FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value as string}
                                            className='flex items-center gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='per' id='per_nda' className='border-slate-300 text-indigo-600' />
                                                <Label htmlFor='per_nda' className='cursor-pointer font-semibold text-slate-700'>
                                                    Permanent Student
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
                                <FormItem className='flex flex-col'>
                                    <FormLabel className='font-bold text-slate-600 text-sm uppercase tracking-wider'>
                                        Student <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className={cn(
                                                        'h-11 w-full justify-between rounded-xl border-slate-200 bg-white font-normal shadow-sm hover:bg-slate-50',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    {field.value ? field.value.studentname : 'Select or Search Student'}
                                                    <div className='flex items-center gap-2'>
                                                        {field.value && (
                                                            <X
                                                                className='h-4 w-4 opacity-50 transition-opacity hover:opacity-100'
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.onChange(undefined);
                                                                }}
                                                            />
                                                        )}
                                                        <Search className='h-4 w-4 shrink-0 opacity-50' />
                                                    </div>
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                                            <Command>
                                                <CommandInput placeholder='Type to search...' className='h-10' />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        {studentListMutation.isPending ? (
                                                            <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                                                        ) : (
                                                            'No student found.'
                                                        )}
                                                    </CommandEmpty>
                                                    <CommandGroup className='max-h-64 overflow-y-auto'>
                                                        {studentList &&
                                                            Array.isArray(studentList) &&
                                                            studentList.map((s: any, index: number) => {
                                                                if (!s) return null;
                                                                return (
                                                                    <CommandItem
                                                                        value={s.studentname || ''}
                                                                        key={`${s.amsT_Id || 'std'}-${index}`}
                                                                        onSelect={() => {
                                                                            field.onChange(s);
                                                                            setStudentOpen(false);
                                                                        }}
                                                                        className='flex items-center justify-between py-3'>
                                                                        <span className='font-medium'>{s.studentname}</span>
                                                                        {field.value?.amsT_Id === s.amsT_Id && (
                                                                            <Check className='h-4 w-4 text-indigo-600' />
                                                                        )}
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {studentDetails && (
                            <div className='zoom-in-95 grid animate-in grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm duration-300 sm:grid-cols-3'>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[9px] text-slate-400 uppercase tracking-tighter'>Class</span>
                                    <span className='font-bold text-slate-800 leading-tight'>{studentDetails.asmcL_ClassName}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[9px] text-slate-400 uppercase tracking-tighter'>Section</span>
                                    <span className='font-bold text-slate-800 leading-tight'>{studentDetails.asmC_SectionName}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-[9px] text-slate-400 uppercase tracking-tighter'>Registration</span>
                                    <span className='font-bold text-indigo-600 leading-tight'>{studentDetails.amsT_RegistrationNo}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex items-center justify-center gap-4 border-slate-100 border-t pt-4'>
                    <Button
                        type='submit'
                        disabled={studentListMutation.isPending}
                        className='h-12 min-w-[160px] rounded-full bg-indigo-600 font-bold text-white shadow-indigo-100 shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-200'>
                        {studentListMutation.isPending ? <Loader2 className='h-5 w-5 animate-spin' /> : 'GENERATE REPORT'}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='h-12 min-w-[160px] rounded-full border-slate-200 font-bold text-slate-600 hover:bg-slate-50'>
                        CANCEL
                    </Button>
                </div>
            </form>
        </Form>
    );
}
