'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type DayPeriodSchema, dayPeriodSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import {
    getFixingClassDropdown,
    getSectionDropdownByClassCategory,
    getStaffByFixing,
    getSubjectByFixing
} from '@/server/timetable/constraints/fixing';
import { getSubjectRestrictionDayPeriodDetails, saveDayPeriodDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from '../../../fixing/_components/dayperiod/utils';

interface DayPeriodUpdateProps {
    academicList: any[];
    categoryList: any[];
    dayList: any[];
    periodList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DayPeriodUpdate({
    academicList,
    categoryList,
    dayList,
    periodList,
    selectedRow,
    onSuccess,
    onCancel
}: DayPeriodUpdateProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const form = useForm<DayPeriodSchema>({
        resolver: zodResolver(dayPeriodSchema),
        mode: 'onTouched',
        defaultValues: {
            ttrdP_Id: undefined,
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
        formState: { errors, isSubmitting },
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

    useEffect(() => {
        const loadEditData = async () => {
            try {
                let d = selectedRow;
                const id =
                    d?.ttrdP_Id || d?.TTRDP_Id || d?.ttfdP_Id || d?.ttfdsU_Id || d?.ttfpS_Id || d?.ttfpH_Id || d?.ttfD_Id || d?.TTFDP_Id;
                if (id) {
                    const res = await getSubjectRestrictionDayPeriodDetails(id);
                    const editData =
                        res?.data?.restrict_day_period_edit ||
                        res?.restrict_day_period_edit ||
                        res?.data?.fix_day_period_edit ||
                        res?.fix_day_period_edit ||
                        (Array.isArray(res?.data) ? res.data : undefined) ||
                        res?.data?.data ||
                        res?.data;

                    if (editData && Array.isArray(editData) && editData.length > 0) {
                        d = editData[0];
                    } else if (editData && !Array.isArray(editData)) {
                        d = editData;
                    }
                }

                if (d) {
                    // Normalize keys (handle PascalCase from API)
                    const normalizedData = {
                        ttrdP_Id: d.ttrdP_Id ?? d.TTRDP_Id ?? d.ttfdP_Id ?? d.TTFDP_Id ?? d.ttfD_Id ?? 0,
                        asmaY_Id: d.asmaY_Id ?? d.ASMAY_Id,
                        ttmC_Id: d.ttmC_Id ?? d.TTMC_Id,
                        asmcL_Id: d.asmcL_Id ?? d.ASMCL_Id,
                        asmS_Id: d.asmS_Id ?? d.ASMS_Id ?? d.asmC_Id ?? d.ASMC_Id,
                        hrmE_Id: d.hrmE_Id ?? d.HRME_Id,
                        ismS_Id: d.ismS_Id ?? d.ISMS_Id,
                        ttmD_Id: d.ttmD_Id ?? d.TTMD_Id,
                        ttmP_Id: d.ttmP_Id ?? d.TTMP_Id
                    };

                    if (normalizedData.asmaY_Id && normalizedData.ttmC_Id) {
                        await fetchClasses(normalizedData.asmaY_Id, normalizedData.ttmC_Id);
                        if (normalizedData.asmcL_Id) {
                            const secRes = await getSectionDropdownByClassCategory(
                                normalizedData.asmaY_Id,
                                normalizedData.asmcL_Id,
                                normalizedData.ttmC_Id
                            );
                            const sections = extractList(secRes, 'get_period_section1');
                            setSectionList(sections || []);
                            if (normalizedData.asmS_Id) {
                                await fetchStaff(
                                    normalizedData.asmaY_Id,
                                    normalizedData.ttmC_Id,
                                    normalizedData.asmcL_Id,
                                    normalizedData.asmS_Id
                                );
                                if (normalizedData.hrmE_Id) {
                                    await fetchSubjects(
                                        normalizedData.asmaY_Id,
                                        normalizedData.ttmC_Id,
                                        normalizedData.asmcL_Id,
                                        normalizedData.asmS_Id,
                                        normalizedData.hrmE_Id
                                    );
                                }
                            }
                        }
                    }

                    reset({
                        ttrdP_Id: normalizedData.ttrdP_Id,
                        asmaY_Id: normalizedData.asmaY_Id,
                        ttmC_Id: normalizedData.ttmC_Id,
                        asmcL_Id: normalizedData.asmcL_Id,
                        asmS_Id: normalizedData.asmS_Id,
                        hrmE_Id: normalizedData.hrmE_Id,
                        ismS_Id: normalizedData.ismS_Id,
                        ttmD_Id: normalizedData.ttmD_Id,
                        ttmP_Id: normalizedData.ttmP_Id
                    });
                }
            } catch (error) {
                console.error('Error loading edit details:', error);
                toast.error('Failed to load edit details');
            }
        };

        if (selectedRow) loadEditData();
    }, [selectedRow, reset]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId, { shouldValidate: true });
        setValue('ttmC_Id', undefined as any);
        setValue('asmcL_Id', undefined as any);
        setValue('asmS_Id', undefined as any);
        setValue('hrmE_Id', undefined as any);
        setValue('ismS_Id', undefined as any);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('ttmC_Id', categoryId, { shouldValidate: true });
        setValue('asmcL_Id', undefined as any);
        setValue('asmS_Id', undefined as any);
        setValue('hrmE_Id', undefined as any);
        setValue('ismS_Id', undefined as any);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && categoryId) {
            await fetchClasses(watchedYear, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setValue('asmcL_Id', classId, { shouldValidate: true });
        setValue('asmS_Id', undefined as any);
        setValue('hrmE_Id', undefined as any);
        setValue('ismS_Id', undefined as any);
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
        setValue('asmS_Id', sectionId, { shouldValidate: true });
        setValue('hrmE_Id', undefined as any);
        setValue('ismS_Id', undefined as any);
        setStaffList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && sectionId) {
            await fetchStaff(watchedYear, watchedCategory, watchedClass, sectionId);
        }
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('hrmE_Id', staffId, { shouldValidate: true });
        setValue('ismS_Id', undefined as any);
        setSubjectList([]);
        if (watchedYear && watchedCategory && watchedClass && watchedSection && staffId) {
            await fetchSubjects(watchedYear, watchedCategory, watchedClass, watchedSection, staffId);
        }
    };

    const onSubmit = async (data: DayPeriodSchema) => {
        try {
            const res = await saveDayPeriodDetail(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res.message);
                reset();
                onSuccess();
            } else if (res.returnfixstatus) {
                toast.warning(res.message);
            } else if (res.returnduplicatestatus) {
                toast.warning(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-4 shadow-sm'>
                <FormField
                    control={form.control}
                    name='ttrdP_Id'
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
                                {errors.asmaY_Id && <FormError className='ml-2'>{errors.asmaY_Id.message}</FormError>}
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
                                {errors.ttmC_Id && <FormError className='ml-2'>{errors.ttmC_Id.message}</FormError>}
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
                                {errors.asmcL_Id && <FormError className='ml-2'>{errors.asmcL_Id.message}</FormError>}
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
                                {errors.asmS_Id && <FormError className='ml-2'>{errors.asmS_Id.message}</FormError>}
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
                                {errors.hrmE_Id && <FormError className='ml-2'>{errors.hrmE_Id.message}</FormError>}
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
                                {errors.ismS_Id && <FormError className='ml-2'>{errors.ismS_Id.message}</FormError>}
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
                                {errors.ttmD_Id && <FormError className='ml-2'>{errors.ttmD_Id.message}</FormError>}
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
                                {errors.ttmP_Id && <FormError className='ml-2'>{errors.ttmP_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Update
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
