'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingDayPeriodSchema, fixingDayPeriodSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassDropdown,
    getSectionDropdownByClassCategory,
    getStaffByFixing,
    getSubjectByFixing,
    saveFixingDayPeriod
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from './utils';

interface DayPeriodAddFormProps {
    academicList: any[];
    categoryList: any[];
    dayList: any[];
    periodList: any[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DayPeriodAddForm({ academicList, categoryList, dayList, periodList, onSuccess, onCancel }: DayPeriodAddFormProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const form = useForm<FixingDayPeriodSchema>({
        resolver: zodResolver(fixingDayPeriodSchema),
        defaultValues: {
            ttfdP_Id: 0,
            asmaY_Id: undefined,
            ttmC_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            hrmE_Id: undefined,
            ismS_Id: undefined,
            ttmD_Id: undefined,
            ttmP_Id: undefined
        }
    });

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { isSubmitting },
        reset
    } = form;
    const watchedYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedSection = watch('asmS_Id');

    const fetchClasses = async (yearId: number, categoryId: number) => {
        if (!yearId || !categoryId) {
            setClassList([]);
            return;
        }
        setIsClassLoading(true);
        try {
            const data = await getFixingClassDropdown(yearId, categoryId);
            const list = extractList(data, 'classbycategory');
            setClassList(filterData(list || [], 'asmcL_ClassName'));
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setIsClassLoading(false);
        }
    };

    const fetchStaff = async (yearId: number, categoryId: number, classId: number, sectionId: number) => {
        try {
            const res = await getStaffByFixing({ ASMAY_Id: yearId, TTMC_Id: categoryId, ASMCL_Id: classId, ASMS_Id: sectionId });
            const list = extractList(res, 'stafflist');
            setStaffList(filterData(list || [], 'staffName'));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubjects = async (yearId: number, categoryId: number, classId: number, sectionId: number, staffId: number) => {
        try {
            const res = await getSubjectByFixing({
                ASMAY_Id: yearId,
                TTMC_Id: categoryId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId,
                HRME_Id: staffId
            });
            const list = extractList(res, 'subjectlist');
            setSubjectList(filterData(list || [], 'ismS_SubjectName'));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setValue('ttmC_Id', 0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('ttmC_Id', categoryId);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && categoryId) {
            await fetchClasses(watchedYear, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setValue('asmcL_Id', classId);
        setValue('asmS_Id', 0);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && classId) {
            try {
                const response = await getSectionDropdownByClassCategory(watchedYear, classId, watchedCategory);
                const sections = extractList(response, 'get_period_section1');
                setSectionList(sections || []);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('asmS_Id', sectionId);
        setValue('hrmE_Id', 0);
        setValue('ismS_Id', 0);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && sectionId) {
            await fetchStaff(watchedYear, watchedCategory, watchedClass, sectionId);
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('hrmE_Id', staffId);
        setValue('ismS_Id', 0);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && watchedSection && staffId) {
            await fetchSubjects(watchedYear, watchedCategory, watchedClass, watchedSection, staffId);
        }
    };

    //   const response = await addOrUpdateMasterDay(payload);
    //             if (response.success) {
    //                 toast.success(response.message);
    //                 reset();
    //                 refetchAll();
    //                 onSuccess?.();
    //             } else {
    //                 toast.error(response.message);
    //             }
    //         } catch (error: any) {
    //             toast.error(error.message);

    const onSubmit: SubmitHandler<FixingDayPeriodSchema> = async (data) => {
        try {
            const res = await saveFixingDayPeriod(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res.message);
                reset();
                onSuccess();
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-4 shadow-sm'>
                <FormField
                    control={form.control}
                    name='ttfdP_Id'
                    render={({ field }) => <Input type='hidden' {...field} value={field.value || 0} />}
                />
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleAcademicYearChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicList?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id?.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ttmC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Category <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleCategoryChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categoryList?.map((item: any) => (
                                            <SelectItem key={item.ttmC_Id} value={item.ttmC_Id?.toString()}>
                                                {item.ttmC_CategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleClassChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isClassLoading ? 'Loading...' : 'Select'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classList?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id?.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Section <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sectionList?.map((item: any) => (
                                            <SelectItem
                                                key={item.asmS_Id || item.asmC_Id}
                                                value={(item.asmS_Id || item.asmC_Id)?.toString()}>
                                                {item.asmS_SectionName || item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Staff <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleStaffChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {staffList?.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id?.toString()}>
                                                {item.staffName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ismS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Subject <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjectList?.map((item: any) => (
                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id?.toString()}>
                                                {item.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ttmD_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Day <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dayList?.map((item: any) => (
                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id?.toString()}>
                                                {item.ttmD_DayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ttmP_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Period <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {periodList?.map((item: any) => (
                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id?.toString()}>
                                                {item.ttmP_PeriodName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Save
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
