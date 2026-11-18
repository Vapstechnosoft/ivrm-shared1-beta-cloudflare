'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearPeriodDistrubution,
    useCategtoryPeriodDistrubution,
    useClassPeriodDistrubution,
    useEditPeriodDistribution,
    usePeriodDistributionDetails,
    useSectionPeriodDistrubution,
    useStaffPeriodDistrubution,
    useSubjectPeriodDistrubution
} from '@/hooks/timetable/useMasters';
import { periodDistributionSchema } from '@/schemas/timetable/masters';
import { getClassDropDownMasterDayClasswiseOnchnageofCatandyr } from '@/server/timetable/masters/masterdayclasswise';
import { saveperioddistribution } from '@/server/timetable/masters/perioddistribution';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, Save, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof periodDistributionSchema.save>;

interface PeriodDistributionFormProps {
    onSuccess?: () => void;
    initialData?: any;
}

export default function PeriodDistributionForm({ onSuccess, initialData }: PeriodDistributionFormProps) {
    const { data: response, refetchAll } = usePeriodDistributionDetails();
    const { data: academicData } = useAcademicYearPeriodDistrubution();
    const { data: categoryData } = useCategtoryPeriodDistrubution();
    const { data: staffData } = useStaffPeriodDistrubution();
    const { data: sectionData } = useSectionPeriodDistrubution();
    const { data: subjectData } = useSubjectPeriodDistrubution();
    const { data: classData } = useClassPeriodDistrubution();

    const [tempList, setTempList] = useState<any[]>([]);
    const [availablePeriods, setAvailablePeriods] = useState<number>(1);
    const [classList, setClassList] = useState<any[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);

    const academicList = (academicData as any) || [];
    const staffList = (staffData as any) || [];
    const sectionList = (sectionData as any) || [];
    const subjectList = (subjectData as any) || [];

    const categoryList = useMemo(() => {
        const raw = initialData?.cateoglst || initialData?.catelist || initialData?.categorylist || (categoryData as any);
        return Array.isArray(raw) ? raw : [];
    }, [initialData, categoryData]);

    const allClassList = useMemo(() => {
        const raw = initialData?.classlists || initialData?.classlist || (classData as any);
        return Array.isArray(raw) ? raw : [];
    }, [initialData, classData]);

    const { data: session } = useSession();
    const mi_id = (session as any)?.mi_id || (session as any)?.mi_Id || (session as any)?.user?.mi_Id || (session as any)?.user?.mi_id || 0;
    // if (status === "loading") return null;
    const [editLoaded, setEditLoaded] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(periodDistributionSchema.save),
        defaultValues: {
            nop1: 1,
            ttfpD_StaffConsecutive: 1,
            nop2: 0
        }
    });

    const watchedAcademicYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');
    const watchedTotalWeeklyPeriods = watch('nop1');
    const watchedStaff = watch('hrmE_Id');

    // Fetch full details if editing — using new GET facade endpoint
    const { data: editData, isLoading: isLoadingEdit } = useEditPeriodDistribution({
        id: initialData?.ttfpD_Id,
        enabled: !!initialData?.ttfpD_Id
    });

    // Populate form for editing
    useEffect(() => {
        if (initialData && !isLoadingEdit && !editLoaded) {
            // API returns: { success, message, data: [...] }
            const rows: any[] = (editData as any)?.data || [];

            if (rows.length === 0) {
                setEditLoaded(true);
                return;
            }

            // Top-level fields come from the first record
            const firstRow = rows[0];

            // Resolve asmaY_Id from academic list by year string
            const asmaY_Id =
                initialData.asmaY_Id ||
                academicList.find((a: any) => a.asmaY_Year?.trim().toLowerCase() === firstRow.asmaY_Year?.trim().toLowerCase())?.asmaY_Id;

            // Resolve hrmE_Id from staff list by name
            const hrmE_Id =
                initialData.hrmE_Id ||
                staffList.find((s: any) => s.staffName?.trim().toLowerCase() === firstRow.staffName?.trim().toLowerCase())?.hrmE_Id;

            const nop1 = initialData.ttfpD_TotWeekPeriods || 1;
            const ttfpD_StaffConsecutive = initialData.ttfpD_StaffConsecutive || 1;

            if (asmaY_Id) setValue('asmaY_Id', Number(asmaY_Id));
            if (hrmE_Id) setValue('hrmE_Id', Number(hrmE_Id));
            if (nop1) setValue('nop1', Number(nop1));
            setValue('ttfpD_StaffConsecutive', Number(ttfpD_StaffConsecutive));

            // Map each row: resolve IDs from dropdown lists by matching display names
            const mappedDetails = rows.map((row: any) => {
                const ttmC_Id =
                    categoryList.find((c: any) => c.ttmC_CategoryName?.trim().toLowerCase() === row.ttmC_CategoryName?.trim().toLowerCase())
                        ?.ttmC_Id || undefined;

                const asmcL_Id =
                    classList.find((c: any) => c.asmcL_ClassName?.trim().toLowerCase() === row.asmcL_ClassName?.trim().toLowerCase())
                        ?.asmcL_Id || undefined;

                const asmS_Id =
                    sectionList.find((s: any) => s.asmC_SectionName?.trim().toLowerCase() === row.asmC_SectionName?.trim().toLowerCase())
                        ?.asmS_Id || undefined;

                const ismS_Id =
                    subjectList.find((s: any) => s.ismS_SubjectName?.trim().toLowerCase() === row.ismS_SubjectName?.trim().toLowerCase())
                        ?.ismS_Id || undefined;

                return {
                    id: row.ttfpdD_Id || Date.now() + Math.random(),
                    ttfpdD_Id: row.ttfpdD_Id,
                    catDisplay: row.ttmC_CategoryName,
                    clsDisplay: row.asmcL_ClassName,
                    sectDisplay: row.asmC_SectionName,
                    subDisplay: row.ismS_SubjectName,
                    pedDisplay: row.ttfpD_TotalPeriods,
                    ttmC_Id,
                    asmcL_Id,
                    asmS_Id,
                    ismS_Id
                };
            });

            setTempList(mappedDetails);
            setEditLoaded(true);
        }
    }, [initialData, editData, isLoadingEdit, academicList, staffList, categoryList, classList, sectionList, subjectList]);

    // Calculate Available Periods
    useEffect(() => {
        const total = Number(watchedTotalWeeklyPeriods || 0);
        const used = tempList.reduce((acc, curr) => acc + Number(curr.pedDisplay), 0);
        let avail = total - used;
        if (avail < 0) avail = 0;
        setAvailablePeriods(avail);
    }, [watchedTotalWeeklyPeriods, tempList]);

    // Update classList when category or academic year changes
    useEffect(() => {
        if (watchedAcademicYear && watchedCategory) {
            const fetchClasses = async () => {
                setIsLoadingClasses(true);
                try {
                    const res = await getClassDropDownMasterDayClasswiseOnchnageofCatandyr(
                        Number(watchedAcademicYear),
                        Number(watchedCategory)
                    );
                    
                    const classes = (res?.data as any)?.classbycategory || res?.classbycategory || res?.data || [];
                    setClassList(Array.isArray(classes) ? classes : []);
                } catch (error) {
                    console.error('Error fetching classes:', error);
                    setClassList([]);
                } finally {
                    setIsLoadingClasses(false);
                }
            };
            fetchClasses();
        } else {
            setClassList([]);
        }

        // Only clear dependent fields if we have a change (prevents initial load loops)
        if (watchedCategory || watchedAcademicYear) {
            setValue('asmcL_Id', undefined as any);
            setValue('asmS_Id', undefined as any);
            setValue('ismS_Id', undefined as any);
            setValue('nop2', 0);
        }
    }, [watchedAcademicYear, watchedCategory, setValue]);

    const addToTempList = () => {
        const data = watch();
        // Validation for sub-distribution fields
        if (!data.ttmC_Id || !data.asmcL_Id || !data.asmS_Id || !data.ismS_Id || !data.nop2) {
            toast.error('Please Select Fields Class, Section, Subject And Enter Period (Not Zero)!');
            return;
        }
        const nop2Val = Number(data.nop2);
        if (nop2Val === 0) {
            toast.error('Period cannot be zero!');
            return;
        }

        const totalPeriods = Number(data.nop1);
        if (totalPeriods < nop2Val) {
            toast.error("Period Distribution Can't exceed the Total for only single class !!!");
            return;
        }

        // Check if addition exceeds total
        const used = tempList.reduce((acc, curr) => acc + Number(curr.pedDisplay), 0);
        if (used + nop2Val > totalPeriods) {
            toast.error('Total distributed periods cannot exceed Total Weekly Periods!');
            return;
        }

        // Find labels
        const catName = categoryList.find((c: any) => c.ttmC_Id === data.ttmC_Id)?.ttmC_CategoryName;
        const className = allClassList.find((c: any) => c.asmcL_Id === data.asmcL_Id)?.asmcL_ClassName;
        const sectionName = sectionList.find((s: any) => s.asmS_Id === data.asmS_Id)?.asmC_SectionName;
        const subjectName = subjectList.find((s: any) => s.ismS_Id === data.ismS_Id)?.ismS_SubjectName;

        // Check duplicate
        const isDuplicate = tempList.some(
            (item) =>
                item.ttmC_Id === data.ttmC_Id &&
                item.asmcL_Id === data.asmcL_Id &&
                item.asmS_Id === data.asmS_Id &&
                item.ismS_Id === data.ismS_Id
        );

        if (isDuplicate) {
            toast.error('Record Already Selected!');
            return;
        }

        const newItem = {
            id: Date.now(), // temp id
            catDisplay: catName,
            clsDisplay: className,
            sectDisplay: sectionName,
            subDisplay: subjectName,
            pedDisplay: nop2Val,
            // Original IDs for saving
            asmcL_Id: data.asmcL_Id,
            asmS_Id: data.asmS_Id,
            ismS_Id: data.ismS_Id,
            ttmC_Id: data.ttmC_Id
        };

        setTempList([...tempList, newItem]);

        // Reset lower fields
        setValue('nop2', 0);
        setValue('ttmC_Id', undefined as any);
        setValue('asmcL_Id', undefined as any);
        setValue('asmS_Id', undefined as any);
        setValue('ismS_Id', undefined as any);
    };

    const removeTempItem = (id: number) => {
        setTempList(tempList.filter((item) => item.id !== id));
    };

    const handleClear = () => {
        setTempList([]);
        reset({
            nop1: 1,
            ttfpD_StaffConsecutive: 1,
            nop2: 0,
            asmaY_Id: undefined,
            hrmE_Id: undefined,
            ttmC_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            ismS_Id: undefined
        });
        setAvailablePeriods(1);
    };

    const onSubmit = async (data: FormFields) => {
        if (!data.hrmE_Id) {
            toast.error('Select Staff');
            return;
        }

        if (tempList.length === 0) {
            toast.error('Need To Distribute Atleast One Period');
            return;
        }

        const payload = {
            ttfpD_Id: initialData?.ttfpD_Id || 0,
            mI_Id: mi_id || initialData?.mI_Id || 0,
            asmaY_Id: data.asmaY_Id,
            hrmE_Id: data.hrmE_Id,
            ttfpD_TotWeekPeriods: data.nop1,
            ttfpD_ActiveFlag: true,
            ttfpD_StaffConsecutive: data.ttfpD_StaffConsecutive,
            createdDate: initialData?.createdDate || new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            periodDistributionDetails: tempList.map((item) => ({
                ttfpdD_Id: item.ttfpdD_Id || 0,
                ttfpD_Id: initialData?.ttfpD_Id || 0,
                ttmC_Id: item.ttmC_Id,
                asmcL_Id: item.asmcL_Id,
                asmS_Id: item.asmS_Id,
                ismS_Id: item.ismS_Id,
                ttfpD_TotalPeriods: item.pedDisplay,
                ttfpD_AllotedPeriods: 0,
                ttfpD_AvailablePeriods: 0,
                ttfpdD_ActiveFlag: true,
                nop: item.pedDisplay
            }))
        };

        console.log('payload', JSON.stringify(payload));

        const response = await saveperioddistribution(payload);
        console.log('response', response);
        if (response.success) {
            toast.success(response.message);
            reset();
            refetchAll();
            onSuccess?.();
        } else {
            toast.error(response.message);
        }
    };

    if (initialData && isLoadingEdit) {
        return (
            <div className='flex h-40 items-center justify-center rounded-md border bg-white shadow-sm'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='ml-2 text-muted-foreground'>Loading details...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4 rounded-md border bg-white p-4 shadow-sm'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <Select
                                        key={field.value?.toString() || 'empty'}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <InputText
                                    label='Total Weekly Period'
                                    type='number'
                                    required
                                    min={1}
                                    {...register('nop1')}
                                    error={errors.nop1?.message}
                                />
                            </div>
                            <div className='space-y-2'>
                                <InputText
                                    label='Staff Consecutive'
                                    type='number'
                                    required
                                    min={1}
                                    {...register('ttfpD_StaffConsecutive')}
                                    error={errors.ttfpD_StaffConsecutive?.message}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>
                                Staff Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='hrmE_Id'
                                render={({ field }) => (
                                    <Select
                                        key={field.value?.toString() || 'empty'}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Staff--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staffList.map((item: any) => (
                                                <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                    {item.staffName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmE_Id && <span className='text-red-500 text-sm'>{errors.hrmE_Id.message}</span>}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>Available Period</Label>
                                <div className='flex h-10 items-center rounded-md border bg-muted/50 px-3 py-2 font-medium text-sm'>
                                    {availablePeriods}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr />

            {/* Distribution Section */}
            <div className='space-y-6 rounded-md border bg-muted/10 p-4'>
                <div className='grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Category Name</Label>
                        <Controller
                            control={control}
                            name='ttmC_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}>
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
                    </div>

                    <div className='space-y-2'>
                        <Label>Class</Label>
                        <Controller
                            control={control}
                            name='asmcL_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.length > 0 ? (
                                            classList.map((item: any) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>No Classes Available</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>Section</Label>
                        <Controller
                            control={control}
                            name='asmS_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>Subject</Label>
                        <Controller
                            control={control}
                            name='ismS_Id'
                            render={({ field }) => (
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}>
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
                    </div>

                    <div className='space-y-2'>
                        <InputText label='No of Period' type='number' min={0} {...register('nop2')} />
                    </div>
                </div>

                <div className='flex justify-center pt-2'>
                    <Button
                        type='button'
                        size='icon'
                        className='h-12 w-12 rounded-full transition-transform hover:scale-110'
                        onClick={addToTempList}
                        title='Add to Grid'>
                        <ArrowRight className='h-6 w-6' />
                    </Button>
                </div>

                {/* Temp Grid */}
                <div className='overflow-hidden rounded-md border bg-background'>
                    <table className='w-full text-left text-sm'>
                        <thead className='border-b bg-muted'>
                            <tr>
                                <th className='p-3 font-medium'>Category</th>
                                <th className='p-3 font-medium'>Class</th>
                                <th className='p-3 font-medium'>Section</th>
                                <th className='p-3 font-medium'>Subject</th>
                                <th className='p-3 text-center font-medium'>Periods</th>
                                <th className='p-3 text-right font-medium'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y'>
                            {tempList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='p-8 text-center text-muted-foreground'>
                                        No distributions added yet. Add items above.
                                    </td>
                                </tr>
                            ) : (
                                tempList.map((item) => (
                                    <tr key={item.id} className='transition-colors hover:bg-muted/50'>
                                        <td className='p-3'>{item.catDisplay}</td>
                                        <td className='p-3'>{item.clsDisplay}</td>
                                        <td className='p-3'>{item.sectDisplay}</td>
                                        <td className='p-3'>{item.subDisplay}</td>
                                        <td className='p-3 text-center'>{item.pedDisplay}</td>
                                        <td className='p-3 text-right'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                className='h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                                                onClick={() => removeTempItem(item.id)}>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleClear}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </div>
                </Button>
            </div>

            {/* <div className='flex justify-center gap-3'>
                <Button type='submit' disabled={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                </Button>
                <Button type='button' onClick={handleClear}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
               
            </div> */}
        </form>
    );
}
