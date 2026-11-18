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
    useCustomTcInitialData,
    useCustomTcStudentList,
    useCustomTcStudentNameChange,
    useCustomTcTempPerChange
} from '@/hooks/admission/preadmission/useCustomTcReport';
import { cn } from '@/lib/utils';
import { type CustomTcFields, CustomTcSchema } from '@/schemas/admission/preadmission/reports/custom-tc';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    onSubmit: (data: CustomTcFields) => void;
    onReset: () => void;
    onStudentListUpdate: (list: any[]) => void;
}

export function FilterForm({ onSubmit, onReset, onStudentListUpdate }: FilterFormProps) {
    const { data: initialData } = useCustomTcInitialData();
    const studentListMutation = useCustomTcStudentList();
    const studentNameChangeMutation = useCustomTcStudentNameChange();
    const tempPerChangeMutation = useCustomTcTempPerChange();

    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [studentDetails, setStudentDetails] = useState<any>(null);

    const form = useForm<CustomTcFields>({
        resolver: zodResolver(CustomTcSchema),
        defaultValues: {
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            admnoorname: 'regno',
            tctemporper: 'per',
            AMST_Id: 0
        }
    });

    const { watch, setValue, reset, control } = form;
    const asmayId = watch('ASMAY_Id');
    const admnoorname = watch('admnoorname');
    const tctemporper = watch('tctemporper');
    const amstId = watch('AMST_Id');

    const accyear = (initialData as any)?.data?.accyear || [];

    // Trigger student list fetch when dependent fields change
    useEffect(() => {
        if (asmayId > 0) {
            const onSuccessCallback = (response: any) => {
                const responseData = response.data || {};
                const list = response.studentlist || responseData.studentlist || (Array.isArray(response.data) ? response.data : []);
                setStudentList(list);
                onStudentListUpdate(list);

                // Reset student selection if it's no longer in the list
                if (amstId > 0 && !list.some((s: any) => s.amsT_Id === amstId)) {
                    setValue('AMST_Id', 0);
                    setStudentDetails(null);
                }
            };

            const payload = {
                ASMAY_Id: asmayId,
                ASMCL_Id: 0,
                ASMS_Id: 0,
                admnoorname: admnoorname,
                tctemporper: tctemporper
            };

            studentListMutation.mutate(payload, { onSuccess: onSuccessCallback });
        }
    }, [asmayId, admnoorname, tctemporper]);

    // Handle Student Selection Change (mimicking stdnamechange)
    useEffect(() => {
        if (amstId > 0 && asmayId > 0) {
            studentNameChangeMutation.mutate(
                {
                    AMST_Id: amstId,
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
    }, [amstId, asmayId]);

    const handleReset = () => {
        reset();
        setStudentList([]);
        setStudentDetails(null);
        onReset();
    };

    const selectedStudent = studentList.find((s) => s.amsT_Id === amstId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                    {/* Left Column: Academic Year and Admno/Name */}
                    <div className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold text-slate-700'>
                                        Left Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value > 0 ? field.value.toString() : ''}>
                                        <FormControl>
                                            <SelectTrigger className='border-slate-200 bg-white focus:ring-primary/20'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accyear.map((y: any) => (
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

                        <FormField
                            control={form.control}
                            name='admnoorname'
                            render={({ field }) => (
                                <FormItem className='space-y-3 rounded-xl border bg-slate-50/50 p-4'>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex items-center gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='regno' id='regno' />
                                                <Label htmlFor='regno' className='cursor-pointer font-medium'>
                                                    Admno
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='stdname' id='stdname' />
                                                <Label htmlFor='stdname' className='cursor-pointer font-medium'>
                                                    Name
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    {form.formState.errors.admnoorname && (
                                        <FormError>{form.formState.errors.admnoorname.message}</FormError>
                                    )}
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column: Temp/Per and Student Dropdown */}
                    <div className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='tctemporper'
                            render={({ field }) => (
                                <FormItem className='space-y-3 rounded-xl border bg-slate-50/50 p-4'>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='temp' id='temp' />
                                                <Label htmlFor='temp' className='cursor-pointer font-medium'>
                                                    Temp Student
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='per' id='per' />
                                                <Label htmlFor='per' className='cursor-pointer font-medium'>
                                                    Permanent Student
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    {form.formState.errors.tctemporper && (
                                        <FormError>{form.formState.errors.tctemporper.message}</FormError>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='AMST_Id'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <Label className='font-semibold text-slate-700'>
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    className={cn(
                                                        'h-10 w-full justify-between border-slate-200 bg-white font-normal hover:bg-slate-50',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    {field.value && selectedStudent
                                                        ? selectedStudent.studentname
                                                        : 'Select Or Search Student'}
                                                    <div className='flex items-center gap-2'>
                                                        {field.value ? (
                                                            <X
                                                                className='h-4 w-4 opacity-50 transition-opacity hover:opacity-100'
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
                                                    <CommandGroup className='max-h-64 overflow-y-auto'>
                                                        {studentList.map((s: any) => (
                                                            <CommandItem
                                                                value={s.studentname}
                                                                key={s.amsT_Id}
                                                                onSelect={() => {
                                                                    field.onChange(s.amsT_Id);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className='flex items-center justify-between'>
                                                                <span>{s.studentname}</span>
                                                                {field.value === s.amsT_Id && <Check className='h-4 w-4 text-primary' />}
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

                {/* Student Info Labels (mimicking legacy) */}
                {studentDetails && (
                    <div className='fade-in slide-in-from-top-2 grid animate-in grid-cols-1 gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4 duration-300 sm:grid-cols-3'>
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

                <div className='flex flex-wrap items-center justify-center gap-4 pt-6'>
                    <Button
                        type='submit'
                        disabled={studentListMutation.isPending}
                        className='min-w-[140px] bg-indigo-600 text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg'>
                        {studentListMutation.isPending ? 'Loading...' : 'Report'}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='min-w-[140px] border-slate-300 text-slate-600 shadow-sm hover:bg-slate-50'>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
