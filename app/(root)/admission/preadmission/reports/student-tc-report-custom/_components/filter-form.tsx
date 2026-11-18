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
import { useStudentTcACS, useStudentTcStudentList } from '@/hooks/admission/preadmission/reports/useStudentTcReportCustom';
import { cn } from '@/lib/utils';
import {
    type StudentTcReportCustomFields,
    studentTcReportCustomSchema
} from '@/schemas/admission/preadmission/reports/student-tc-report-custom.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Loader2, RefreshCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    initialData: any;
    onSubmit: (data: StudentTcReportCustomFields) => void;
    onReset: () => void;
}

export function FilterForm({ initialData, onSubmit, onReset }: FilterFormProps) {
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);

    const searchMutation = useStudentTcStudentList();
    const acsMutation = useStudentTcACS();

    const miid = initialData?.masterCompany?.[0]?.miid || initialData?.masterCompany?.[0]?.mI_Id || 0;
    const isGirls = Number.parseInt(miid) === 4;
    const isBoys = Number.parseInt(miid) === 6;

    const form = useForm<StudentTcReportCustomFields>({
        resolver: zodResolver(studentTcReportCustomSchema),
        defaultValues: {
            asmaY_Id: '',
            admname: 'regno',
            asmcL_Id: '',
            ASMC_Id: '',
            AMST_Id: null,
            prom: '',
            pervious: '',
            ASMCL_Id1: ''
        }
    });
    const {
        formState: { errors }
    } = form;
    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('ASMC_Id');

    // Triggered when basic filters change to fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            if (!watchYear) return;

            try {
                const payload = {
                    ASMAY_Id: Number.parseInt(watchYear),
                    ASMCL_Id: watchClass ? Number.parseInt(watchClass) : undefined,
                    ASMC_Id: watchSection ? Number.parseInt(watchSection) : undefined
                };

                const response = await searchMutation.mutateAsync(payload);
                const data = (response?.data || response) as any;

                const studentData = data.studentlist || data.studentList || [];
                setStudentList(Array.isArray(studentData) ? studentData : []);
            } catch (error) {
                console.error('Fetch students error:', error);
            }
        };

        fetchStudents();
    }, [watchYear, watchClass, watchSection]);

    // Handle initial year change student load (getACS)
    useEffect(() => {
        if (watchYear) {
            const fetchAcsStudents = async () => {
                try {
                    const response = await acsMutation.mutateAsync(Number.parseInt(watchYear));
                    const data = (response?.data || response) as any;
                    const studentData = data.studentlist || data.studentList || [];
                    setStudentList(Array.isArray(studentData) ? studentData : []);
                } catch (error) {
                    console.error('getACS failed:', error);
                }
            };
            fetchAcsStudents();
        }
    }, [watchYear]);

    const handleReset = () => {
        form.reset();
        setStudentList([]);
        onReset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Manually trigger validation for all fields to show error messages
        form.trigger().then((isValid) => {
            if (isValid) {
                const formData = form.getValues();
                onSubmit(formData);
            } else {
                // Force re-render to show validation messages
                const errorMessages = {
                    asmaY_Id: (form.formState.errors.asmaY_Id?.message as string) || '',
                    asmcL_Id: (form.formState.errors.asmcL_Id?.message as string) || '',
                    ASMC_Id: (form.formState.errors.ASMC_Id?.message as string) || '',
                    AMST_Id: (form.formState.errors.AMST_Id?.message as string) || '',
                    admname: (form.formState.errors.admname?.message as string) || ''
                };

                Object.entries(errorMessages).forEach(([field, message]) => {
                    if (message) {
                        form.setError(field as any, { message });
                    }
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Column 1 */}
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold text-slate-700'>
                                        Left Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null);
                                        }}
                                        value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-10 border-slate-200 bg-white'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.academicList?.map((yr: any, index: number) => (
                                                <SelectItem key={`${yr.asmaY_Id}-${index}`} value={yr.asmaY_Id.toString()}>
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
                            name='admname'
                            render={({ field }) => (
                                <FormItem className='space-y-3'>
                                    <Label className='font-semibold text-slate-700'>
                                        Select Radio Button <span className='text-red-500'>*</span>
                                    </Label>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex gap-6 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all hover:bg-slate-100'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='regno' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-medium text-slate-600'>Adm.No.</Label>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='stdname' />
                                                </FormControl>
                                                <Label className='cursor-pointer font-medium text-slate-600'>Name</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    {errors.admname && <FormError>{errors.admname.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='asmcL_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold text-slate-700'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null);
                                        }}
                                        value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-10 border-slate-200 bg-white'>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.fillclass?.map((cls: any, index: number) => (
                                                <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        {/* {isGirls && (
                            <FormField
                                control={form.control}
                                name="ASMCL_Id1"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className="font-semibold text-slate-700">Admitted Class <span className="text-red-500">*</span></Label>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white h-10 border-slate-200">
                                                    <SelectValue placeholder="Select Admitted Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData?.fillclass?.map((cls: any, index: number) => (
                                                    <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                    </FormItem>
                                )}
                            />
                        )} */}
                    </div>

                    {/* Column 2 */}
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='ASMC_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold text-slate-700'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('AMST_Id', null);
                                        }}
                                        value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-10 border-slate-200 bg-white'>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData?.fillsec?.map((sec: any, index: number) => (
                                                <SelectItem key={`${sec.asmS_Id}-${index}`} value={sec.asmS_Id.toString()}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ASMC_Id && <FormError>{errors.ASMC_Id.message}</FormError>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='AMST_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <Label className='font-semibold text-slate-700'>
                                        Student Name <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='relative'>
                                        <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant='outline'
                                                        role='combobox'
                                                        className={cn(
                                                            'h-10 w-full justify-between border-slate-200 bg-white font-normal shadow-sm transition-colors hover:bg-slate-50',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <span className='truncate pr-2 font-medium'>
                                                            {field.value
                                                                ? field.value.amsT_FirstName
                                                                    ? `${field.value.amsT_FirstName} ${field.value.amsT_MiddleName || ''} ${field.value.amsT_LastName || ''}`
                                                                    : field.value.studentname
                                                                : 'Select Or Search Student'}
                                                        </span>
                                                        <Search className='h-4 w-4 shrink-0 opacity-50' />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-[450px] border-slate-200 p-0 shadow-xl' align='start'>
                                                <Command className='rounded-lg'>
                                                    <CommandInput placeholder='Search student...' className='h-10' />
                                                    <CommandList>
                                                        <CommandEmpty className='p-4 text-center text-slate-500 text-sm'>
                                                            No student found.
                                                        </CommandEmpty>
                                                        <CommandGroup className='max-h-72 overflow-y-auto'>
                                                            {studentList.map((s: any, index: number) => (
                                                                <CommandItem
                                                                    key={`${s.amsT_Id || s.amst_id}-${index}`}
                                                                    value={`${s.amsT_FirstName || s.studentname} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''} ${s.amsT_AdmNo || s.amst_admno || ''}`}
                                                                    onSelect={() => {
                                                                        field.onChange(s);
                                                                        setStudentOpen(false);
                                                                    }}
                                                                    className='cursor-pointer px-4 py-2 transition-colors hover:bg-slate-100'>
                                                                    <div className='flex flex-col gap-0.5'>
                                                                        <span className='font-semibold text-slate-800'>
                                                                            {s.amsT_FirstName || s.studentname}
                                                                            {s.amsT_MiddleName ? ` ${s.amsT_MiddleName}` : ''}
                                                                            {s.amsT_LastName ? ` ${s.amsT_LastName}` : ''}
                                                                        </span>
                                                                        {(s.amsT_AdmNo || s.amst_admno) && (
                                                                            <span className='font-medium text-indigo-500 text-xs'>
                                                                                Admission No: {s.amsT_AdmNo || s.amst_admno}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {(field.value?.amsT_Id === s.amsT_Id ||
                                                                        field.value?.amst_id === s.amst_id) && (
                                                                        <Check className='ml-auto h-4 w-4 text-indigo-600' />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {searchMutation.isPending && (
                                            <div className='absolute top-2.5 right-12'>
                                                <Loader2 className='h-5 w-5 animate-spin text-indigo-400' />
                                            </div>
                                        )}
                                    </div>
                                </FormItem>
                            )}
                        />

                        {isGirls && (
                            <FormField
                                control={form.control}
                                name='prom'
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className='font-semibold text-slate-700'>Promotion Type</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='h-10 border-slate-200 bg-white'>
                                                    <SelectValue placeholder='Select Promotion Type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='Granted'>Granted</SelectItem>
                                                <SelectItem value='Refused'>Refused</SelectItem>
                                                <SelectItem value='Not Applicable'>Not Applicable</SelectItem>
                                                <SelectItem value='Passed ICSE'>Passed ICSE</SelectItem>
                                                <SelectItem value='ISC'>ISC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.prom && <FormError>{errors.prom.message}</FormError>}
                                    </FormItem>
                                )}
                            />
                        )}

                        {(isGirls || isBoys) && (
                            <FormField
                                control={form.control}
                                name='pervious'
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className='font-semibold text-slate-700'>Previous School</Label>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='Enter previous school name'
                                                className='h-10 border-slate-200 bg-white shadow-sm focus:border-indigo-400'
                                                maxLength={50}
                                            />
                                        </FormControl>
                                        {errors.pervious && <FormError>{errors.pervious.message}</FormError>}
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 border-slate-100 border-t pt-8'>
                    <Button
                        type='submit'
                        size='lg'
                        className='min-w-[140px] bg-indigo-600 font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95'
                        disabled={searchMutation.isPending}>
                        <FileText className='mr-2 h-5 w-5' /> Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        size='lg'
                        onClick={handleReset}
                        className='min-w-[140px] border-slate-200 font-semibold text-slate-600 shadow-sm transition-all active:scale-95'>
                        <RefreshCcw className='mr-2 h-5 w-5' /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
