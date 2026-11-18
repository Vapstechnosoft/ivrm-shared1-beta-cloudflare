'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { type IVerifyClassWorkSearch, verifyClassWorkSearchSchema } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import {
    SubjectsDropDownByAcademicYearandClassandSection,
    fetchClasses,
    fetchInitialData,
    fetchSections,
    getClassWorkList
} from '@/server/upload/transactions/ivrm-classwork/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface SearchFormProps {
    onSearchResults: (results: any[], topics: any[]) => void;
    onVerifiedList: (list: any[]) => void;
    onTopicsLoaded: (topics: any[]) => void;
    onSearchTrigger?: () => void;
    onResetTrigger?: () => void;
}

export default function SearchForm({ onSearchResults, onVerifiedList, onTopicsLoaded, onSearchTrigger, onResetTrigger }: SearchFormProps) {
    const defaultValues: Partial<IVerifyClassWorkSearch> = {
        asmaY_Id: undefined,
        asmcL_Id: undefined,
        asmS_Id: undefined,
        ismS_Id: 0,
        from_date: undefined,
        to_date: undefined
    };

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<IVerifyClassWorkSearch>({
        resolver: zodResolver(verifyClassWorkSearchSchema),
        defaultValues
    });

    const selectedacademicYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClassId = useWatch({ control, name: 'asmcL_Id' });
    const selectedSectionid = useWatch({ control, name: 'asmS_Id' });

    const [yearList, setYearList] = useState<any[]>([]);
    const [classelist, setClasses] = useState<any[]>([]);
    const [sectionslist, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [hrme_Id, setHrmeId] = useState<number>(0);
    const [isSearching, setIsSearching] = useState(false);

    // Load initial data (Bottom Grid & Dropdowns)
    useEffect(() => {
        (async () => {
            try {
                const response = await fetchInitialData();
                if (response?.success) {
                    // Populate Year List
                    if (response.data?.yearlist) {
                        setYearList(response.data.yearlist);
                    }

                    // Set Default Year if available
                    if (response.data?.academicyear?.[0]?.asmaY_Id) {
                        setValue('asmaY_Id', response.data.academicyear[0].asmaY_Id);
                    }

                    // Set HRME_Id
                    if (response.data?.hrmE_Id) {
                        setHrmeId(response.data.hrmE_Id);
                    } else if (response.data?.hrme_Id) {
                        setHrmeId(response.data.hrme_Id);
                    }

                    // Try to parse the stringified JSON list if it exists (Bottom Grid)
                    const gridStr = response.data?.homeworkgridlist?.[0]?.IVRM_ClassHomeworkGrid_List;
                    if (gridStr) {
                        try {
                            const parsedList = JSON.parse(gridStr);
                            onVerifiedList(parsedList || []);
                        } catch (e) {
                            console.error('Error parsing homeworkgridlist:', e);
                        }
                    } else if (response.data?.marksupdate_list) {
                        onVerifiedList(response.data.marksupdate_list);
                    }
                }
            } catch (error) {
                console.error('Error loading initial details:', error);
            }
        })();
    }, [onVerifiedList, setValue]);

    // Cascade: Year -> Class
    useEffect(() => {
        if (!selectedacademicYear) {
            setClasses([]);
            setSections([]);
            return;
        }
        (async () => {
            try {
                const response = await fetchClasses(selectedacademicYear, hrme_Id);
                if (response.success && Array.isArray(response.data?.classlist)) {
                    setClasses(response.data.classlist);
                } else if (response.success && Array.isArray(response.data)) {
                    setClasses(response.data);
                } else {
                    setClasses([]);
                }
            } catch {
                toast.error('Failed to load classes');
            }
        })();
    }, [selectedacademicYear]);

    // Cascade: Class -> Section
    useEffect(() => {
        if (!selectedacademicYear || !selectedClassId) {
            setSections([]);
            return;
        }
        (async () => {
            try {
                const response = await fetchSections(selectedClassId, selectedacademicYear);
                if (response.success && Array.isArray(response.data?.sectionlist)) {
                    setSections(response.data.sectionlist);
                } else if (response.success && Array.isArray(response.data)) {
                    setSections(response.data);
                } else {
                    setSections([]);
                }
            } catch {
                toast.error('Failed to load sections');
            }
        })();
    }, [selectedacademicYear, selectedClassId]);

    // Cascade: Section -> Subject
    useEffect(() => {
        if (!selectedacademicYear || !selectedClassId || !selectedSectionid) {
            setSubjects([]);
            return;
        }
        (async () => {
            try {
                const payload = {
                    asmaY_Id: selectedacademicYear,
                    asmcL_Id: selectedClassId,
                    asmS_Id: selectedSectionid
                };
                const { data } = await SubjectsDropDownByAcademicYearandClassandSection(payload);
                setSubjects(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error('Failed to load subjects');
            }
        })();
    }, [selectedacademicYear, selectedClassId, selectedSectionid]);

    const onSubmit = async (data: IVerifyClassWorkSearch) => {
        try {
            setIsSearching(true);
            const payload = {
                ASMAY_Id: data.asmaY_Id,
                ASMCL_Id: data.asmcL_Id,
                ASMS_Id: data.asmS_Id,
                ISMS_Id: data.ismS_Id || 0,
                fromdate: data.from_date ? format(data.from_date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                todate: data.to_date ? format(data.to_date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
            };

            const response = await getClassWorkList(payload);

            if (response.success && response.data) {
                const list = response.data.classworklst || [];
                const topics = response.data.topicList || [];

                if (list.length === 0) {
                    toast.info('No records found for the selected criteria');
                }

                onSearchResults(list, topics);
                onTopicsLoaded(topics);
                onSearchTrigger?.();
            } else {
                toast.error(response.message || 'Failed to fetch classwork list');
            }
        } catch (error) {
            toast.error('An error occurred while searching');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCancel = () => {
        setValue('asmaY_Id', undefined as any);
        setValue('asmcL_Id', undefined as any);
        setValue('asmS_Id', undefined as any);
        setValue('ismS_Id', 0);
        setValue('from_date', undefined as any);
        setValue('to_date', undefined as any);
        onSearchResults([], []);
        onResetTrigger?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {/* Academic Year */}
                <div className='group flex flex-col gap-1'>
                    <Label className='font-black text-slate-600 text-xs uppercase'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                <SelectTrigger className='h-10 border-slate-200 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                    <SelectValue placeholder='--SELECT YEAR--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearList?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className='font-bold text-xs'>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                </div>

                {/* Class */}
                <div className='group flex flex-col gap-1'>
                    <Label className='font-black text-slate-600 text-xs uppercase'>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                <SelectTrigger className='h-10 border-slate-200 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                    <SelectValue placeholder='--SELECT CLASS--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classelist?.map((cls: any) => (
                                        <SelectItem
                                            key={cls.asmcL_Id}
                                            value={cls.asmcL_Id.toString()}
                                            className='font-bold font-medium text-xs'>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                </div>

                {/* Section */}
                <div className='group flex flex-col gap-1'>
                    <Label className='font-black text-slate-600 text-xs uppercase'>
                        Section <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                <SelectTrigger className='h-10 border-slate-200 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                    <SelectValue placeholder='--SELECT SECTION--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionslist?.map((cls: any) => (
                                        <SelectItem
                                            key={cls.asmS_Id}
                                            value={cls.asmS_Id.toString()}
                                            className='font-bold font-medium text-blue-600 text-xs'>
                                            {cls.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                </div>

                {/* Subject */}
                <div className='group flex flex-col gap-1'>
                    <Label className='font-black text-slate-600 text-xs uppercase'>Subject</Label>
                    <Controller
                        control={control}
                        name='ismS_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || '0'}>
                                <SelectTrigger className='h-10 border-slate-200 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                                    <SelectValue placeholder='--SELECT SUBJECT--' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0' className='font-bold text-slate-400 text-xs'>
                                        ALL SUBJECTS
                                    </SelectItem>
                                    {subjects.map((sub: any) => (
                                        <SelectItem
                                            key={sub.ismS_Id}
                                            value={sub.ismS_Id.toString()}
                                            className='font-bold font-medium text-emerald-600 text-xs'>
                                            {sub.ismS_SubjectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Date Ranges */}
                <div className='flex flex-col gap-1'>
                    <Label className='font-black font-bold text-slate-600 text-xs uppercase'>From Date</Label>
                    <Controller
                        control={control}
                        name='from_date'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'h-10 justify-start border-slate-200 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4 text-blue-500' />
                                        {field.value ? format(field.value, 'dd-MM-yyyy') : <span>PICK A DATE</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1'>
                    <Label className='font-black font-bold font-medium text-slate-600 text-xs uppercase'>To Date</Label>
                    <Controller
                        control={control}
                        name='to_date'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'h-10 justify-start border-slate-200 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4 text-blue-500' />
                                        {field.value ? format(field.value, 'dd-MM-yyyy') : <span>PICK A DATE</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>
            </div>

            <div className='flex items-center justify-center gap-4 border-t pt-4'>
                <Button
                    type='submit'
                    disabled={isSearching}
                    className='min-w-[120px] bg-blue-600 font-bold text-white uppercase shadow-md transition-all duration-200 hover:bg-blue-700 active:scale-95'>
                    {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                    GET LIST
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancel}
                    className='min-w-[120px] border-red-200 font-bold text-red-600 uppercase transition-all duration-200 hover:bg-red-50 active:scale-95'>
                    <X className='mr-2 h-4 w-4 text-red-500' /> CANCEL
                </Button>
            </div>
        </form>
    );
}
