'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { consecutiveConstraintsSchema } from '@/schemas/timetable/constraints/consecutive';
import { saveConsecutiveConstraintsDetail } from '@/server/timetable/constraints/consecutive';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof consecutiveConstraintsSchema.save>;
const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    // Identify the actual data object (handle ApiResponse wrapper)
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];

    // If a preferred key is provided, try that first
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];

    // Try known backend list keys
    const keys = [
        'academiclist',
        'catelist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory',
        'categorylist'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }

    return [];
};

interface ConsecutiveConstraintsFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ConsecutiveConstraintsFormnew({ onSuccess, onCancel }: ConsecutiveConstraintsFormProps) {
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    // For max value of period validation (optional, from generic API result)?
    // The legacy code referenced `maxvalue`. If it's not in initialData, we might assume a default or fetch it.
    // Assuming standard period count max around 10-15 if not provided.

    const form = useForm<FormFields>({
        resolver: zodResolver(consecutiveConstraintsSchema.save),
        mode: 'onChange',
        defaultValues: {
            TTC_Id: 0,
            ASMAY_Id: undefined,
            TTMC_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            HRME_Id: undefined,
            ISMS_Id: undefined,
            TTC_NoOfConDays: 1,
            TTC_NoOfConPeriods: 1,
            TTC_NoOfPeriods: 1,
            TTC_BefAftApplFlag: false,
            TTC_BefAftFalg: '',
            TTC_BefAftPeriod: 0
        }
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const watchedConDays = watch('TTC_NoOfConDays');
    const watchedConPeriods = watch('TTC_NoOfConPeriods');
    const watchedBefAftFlag = watch('TTC_BefAftApplFlag');

    // Hooks for cascading data
    const { data: academicData, isLoading: academicLoading } = usebifurcationAcademicYear();
    const academicList = extractList(academicData, 'academiclist');

    // useEffect(() => {
    //     const loadInitialLists = async () => {
    //         try {
    //             if (categoryList.length === 0) {
    //                 const res = await getCategoryDropDownMasterDayClasswise();
    //                 setCategoryList(extractList(res, 'catelist'));
    //             }
    //             // Pre-load others if needed or for fallback
    //             if (classList.length === 0) {
    //                 const res = await getTransactionClassDropdown();
    //                 if (res) setClassList(extractList(res, 'classlist'));
    //             }
    //             if (sectionList.length === 0) {
    //                 const res = await getSectionDetails();
    //                 if (res) setSectionList(extractList(res, 'sectionlist'));
    //             }
    //             if (staffList.length === 0) {
    //                 const res = await getStaffDropDownMasterDayClasswise();
    //                 if (res) setStaffList(extractList(res, 'stafflist'));
    //             }
    //             if (subjectList.length === 0) {
    //                 const res = await getSubjectDropDownMasterDayClasswise();
    //                 if (res) setSubjectList(extractList(res, 'subjectlist'));
    //             }
    //         } catch (error) {
    //             console.error('Failed to load initial dropdowns:', error);
    //         }
    //     };
    //     loadInitialLists();
    // }, [initialData]);

    const handleReset = () => {
        reset({
            TTC_Id: 0,
            ASMAY_Id: undefined,
            TTMC_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            HRME_Id: undefined,
            ISMS_Id: undefined,
            TTC_NoOfConDays: 1,
            TTC_NoOfConPeriods: 1,
            TTC_NoOfPeriods: 1,
            TTC_BefAftApplFlag: false,
            TTC_BefAftFalg: '',
            TTC_BefAftPeriod: 0
        });

        setCategoryList([]);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCancel = () => {
        handleReset();
        onCancel?.();
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('ASMAY_Id', yearId);
        setValue('TTMC_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
        setClassList([]);
        setSectionList([]);
        setStaffList([]);
        setSubjectList([]);
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('TTMC_Id', categoryId);
        setValue('ASMCL_Id', 0);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleClassChange = async (classId: number) => {
        setValue('ASMCL_Id', classId);
        setValue('ASMS_Id', 0);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleSectionChange = async (sectionId: number) => {
        setValue('ASMS_Id', sectionId);
        setValue('HRME_Id', 0);
        setValue('ISMS_Id', 0);
    };

    const handleStaffChange = async (staffId: number) => {
        setValue('HRME_Id', staffId);
        setValue('ISMS_Id', 0);
    };

    // Calculate Total Periods
    useEffect(() => {
        const days = Number(watchedConDays) || 0;
        const periods = Number(watchedConPeriods) || 0;
        setValue('TTC_NoOfPeriods', days * periods);
    }, [watchedConDays, watchedConPeriods, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                TTC_BefAftApplFlag: data.TTC_BefAftApplFlag ? 1 : 0,
                TTC_AllotPeriods: data.TTC_NoOfPeriods, // Legacy backend compatibility
                TTC_RemPeriods: data.TTC_NoOfPeriods,
                TTC_AllotedFlag: 'N'
            };
            const response = await saveConsecutiveConstraintsDetail(payload);
            console.log('response', response);

            if (response.success) {
                toast.success(response.message);
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured');
            // } catch (error) {
            //     console.error(error);
            //     toast.error('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-md border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleAcademicYearChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            academicList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleClassChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMCL_Id && <FormError>{errors.ASMCL_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Staff <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='HRME_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleStaffChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                {item.staffName || item.hrmE_EmployeeFirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRME_Id && <FormError>{errors.HRME_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Days <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConDays')} error={errors.TTC_NoOfConDays?.message} />
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Category <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='TTMC_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleCategoryChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryList.map((item: any) => (
                                            <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                {item.ttmC_CategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.TTMC_Id && <FormError>{errors.TTMC_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMS_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => handleSectionChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmS_SectionName || item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMS_Id && <FormError>{errors.ASMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Subject <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ISMS_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectList.map((item: any) => (
                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                {item.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ISMS_Id && <FormError>{errors.ISMS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Total No of Consecutive Periods <span className='text-red-500'>*</span>
                        </Label>
                        <InputText type='number' {...register('TTC_NoOfConPeriods')} error={errors.TTC_NoOfConPeriods?.message} />
                    </div>
                </div>
            </div>

            {/* Calculation Row */}
            <div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>Calculated Total Periods</Label>
                    <InputText {...register('TTC_NoOfPeriods')} disabled className='bg-gray-100' />
                </div>
            </div>

            {/* Before After Section */}
            <div className='mt-4 space-y-4 rounded-md border bg-gray-50 p-4'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        control={control}
                        name='TTC_BefAftApplFlag'
                        render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='ba_flag' />}
                    />
                    <Label htmlFor='ba_flag' className='font-semibold'>
                        Before After Consecutive
                    </Label>
                </div>

                {watchedBefAftFlag && (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Condition <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='TTC_BefAftFalg'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Before</SelectItem>
                                            <SelectItem value='2'>After</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.TTC_BefAftFalg && <FormError>{errors.TTC_BefAftFalg.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Period <span className='text-red-500'>*</span>
                            </Label>
                            {/* Assuming standard manual input or dropdown. Legacy had input type number with maxvalue */}
                            <InputText type='number' {...register('TTC_BefAftPeriod')} error={errors.TTC_BefAftPeriod?.message} />
                        </div>
                    </div>
                )}
            </div>

            {/* <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' /> {editData ? 'Update' : 'Save'}
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    Cancel
                </Button>
            </div> */}

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Reset
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className='order-3 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                    Cancel
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-3'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </div>
                </Button>
            </div>
        </form>
    );
}
