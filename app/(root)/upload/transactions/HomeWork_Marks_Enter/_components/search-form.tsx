'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type IHomeWorkMarksSearch, homeWorkMarksSearchSchema } from '@/schemas/upload/transactions/ivrm-homework.schema';
import {
    fetchClasses,
    fetchHomeWorkMarksList,
    fetchHomeworkSubjectList,
    fetchInitialData,
    fetchSections
} from '@/server/upload/transactions/ivrm-homework/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SearchFormProps {
    onSearchResults: (results: any[], topics: any[]) => void;
    onVerifiedList: (list: any[]) => void;
    onTopicsLoaded: (topics: any[]) => void;
}

export default function SearchForm({ onSearchResults, onVerifiedList, onTopicsLoaded }: SearchFormProps) {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [hrme_Id, setHrmeId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<IHomeWorkMarksSearch>({
        resolver: zodResolver(homeWorkMarksSearchSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            ismS_Id: 0
        }
    });

    const asmaY_Id = form.watch('asmaY_Id');
    const asmcL_Id = form.watch('asmcL_Id');
    const asmS_Id = form.watch('asmS_Id');

    // Initial Load
    useEffect(() => {
        async function loadInitial() {
            try {
                const res = await fetchInitialData();
                if (res.success && res.data) {
                    setYears(res.data.yearlist || []);
                    if (res.data.marksupdate_list) {
                        onVerifiedList(res.data.marksupdate_list);
                    }
                    if (res.data.academicyear?.[0]?.asmaY_Id) {
                        form.setValue('asmaY_Id', res.data.academicyear[0].asmaY_Id);
                    }
                    if (res.data.hrmE_Id) {
                        setHrmeId(res.data.hrmE_Id);
                    } else if (res.data.hrme_Id) {
                        setHrmeId(res.data.hrme_Id);
                    }
                }
            } catch (error) {
                console.error('Initial Data Load Error:', error);
            }
        }
        loadInitial();
    }, [form, onVerifiedList]);

    // Load Classes when Year changes
    useEffect(() => {
        if (asmaY_Id > 0) {
            fetchClasses(asmaY_Id, hrme_Id).then((res) => {
                if (res.success) setClasses(res.data.classlist || []);
            });
            form.setValue('asmcL_Id', 0);
            form.setValue('asmS_Id', 0);
            form.setValue('ismS_Id', 0);
        } else {
            setClasses([]);
        }
    }, [asmaY_Id, form]);

    // Load Sections when Class changes
    useEffect(() => {
        if (asmaY_Id > 0 && asmcL_Id > 0) {
            fetchSections(asmcL_Id, asmaY_Id).then((res) => {
                if (res.success) setSections(res.data.sectionlist || []);
            });
            form.setValue('asmS_Id', 0);
            form.setValue('ismS_Id', 0);
        } else {
            setSections([]);
        }
    }, [asmcL_Id, asmaY_Id, form]);

    // Load Subjects when Section changes
    useEffect(() => {
        if (asmaY_Id > 0 && asmcL_Id > 0 && asmS_Id > 0) {
            fetchHomeworkSubjectList(asmaY_Id, asmcL_Id, asmS_Id).then((res) => {
                if (res.success) setSubjects(res.data.getsubject_list || []);
            });
        } else {
            setSubjects([]);
        }
    }, [asmS_Id, asmaY_Id, asmcL_Id, form]);

    const onSubmit = async (values: IHomeWorkMarksSearch) => {
        setIsLoading(true);
        try {
            const res = await fetchHomeWorkMarksList(values);
            if (res.success && res.data) {
                onSearchResults(res.data.gethomework_list || [], res.data.topicList || []);
                onTopicsLoaded(res.data.topicList || []);
                if (res.data.gethomework_list?.length === 0) {
                    toast.info('No records found for the selected criteria');
                }
            } else {
                toast.error(res.message || 'Failed to fetch homework list');
            }
        } catch (error) {
            toast.error('An error occurred during search');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-black text-slate-700 text-xs uppercase'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-9 bg-white font-bold'>
                                            <SelectValue placeholder='--Select Year--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()} className='font-bold'>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className='font-bold text-[10px] uppercase' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-black text-slate-700 text-xs uppercase'>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-9 bg-white font-bold'>
                                            <SelectValue placeholder='--Select Class--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()} className='font-bold'>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className='font-bold text-[10px] uppercase' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-black text-slate-700 text-xs uppercase'>
                                    Section <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-9 bg-white font-bold'>
                                            <SelectValue placeholder='--Select Section--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sections.map((s) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()} className='font-bold'>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className='font-bold text-[10px] uppercase' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ismS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-black text-slate-700 text-xs uppercase'>Subject</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-9 bg-white font-bold'>
                                            <SelectValue placeholder='--Select Subject--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='0' className='font-bold italic'>
                                            All Subjects
                                        </SelectItem>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()} className='font-bold'>
                                                {s.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className='font-bold text-[10px] uppercase' />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <FormField
                        control={form.control}
                        name='from_date'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel className='font-black text-slate-700 text-xs uppercase'>From Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant='outline'
                                                className={cn('h-9 pl-3 text-left font-bold', !field.value && 'text-muted-foreground')}>
                                                {field.value ? format(field.value, 'dd-MM-yyyy') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className='font-bold text-[10px] uppercase' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='to_date'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel className='font-black text-slate-700 text-xs uppercase'>To Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant='outline'
                                                className={cn('h-9 pl-3 text-left font-bold', !field.value && 'text-muted-foreground')}>
                                                {field.value ? format(field.value, 'dd-MM-yyyy') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < (form.getValues('from_date') || new Date('1900-01-01'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage className='font-bold text-[10px] uppercase' />
                            </FormItem>
                        )}
                    />

                    <div className='flex gap-2 lg:col-span-2'>
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='h-9 flex-1 bg-blue-600 font-black text-xs uppercase shadow-md transition-all hover:bg-blue-700 hover:shadow-lg'>
                            {isLoading ? <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Get List
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                form.reset();
                                onSearchResults([], []);
                            }}
                            className='h-9 flex-1 border-blue-200 font-black text-blue-600 text-xs uppercase hover:bg-blue-50'>
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
