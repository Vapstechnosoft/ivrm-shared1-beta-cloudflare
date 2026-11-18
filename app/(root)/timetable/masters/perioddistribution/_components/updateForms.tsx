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

interface UpdatePeriodDistributionFormProps {
    onSuccess?: () => void;
    selectedRow: any; // row from the data table (PeriodDistributionColumn)
    initialData?: any;
}

export default function UpdatePeriodDistributionForm({ onSuccess, selectedRow, initialData }: UpdatePeriodDistributionFormProps) {
    const { refetchAll } = usePeriodDistributionDetails();
    const { data: academicData } = useAcademicYearPeriodDistrubution();
    const { data: categoryData } = useCategtoryPeriodDistrubution();
    const { data: staffData } = useStaffPeriodDistrubution();
    const { data: sectionData } = useSectionPeriodDistrubution();
    const { data: subjectData } = useSubjectPeriodDistrubution();
    const { data: classData, isLoading: isLoadingClassData } = useClassPeriodDistrubution();

    const academicList = (academicData as any) || [];
    const staffList = (staffData as any) || [];
    // Handle nested classarray if present
    const classDataAny = classData as any;

    const categoryList = useMemo(() => {
        const raw = initialData?.cateoglst || initialData?.catelist || initialData?.categorylist || (categoryData as any);
        return Array.isArray(raw) ? raw : [];
    }, [initialData, categoryData]);

    const allClassList = useMemo(() => {
        const raw = initialData?.classlists || initialData?.classlist || (classData as any);
        const list = Array.isArray(raw) ? raw : [];
        // Support nested classarray from hook if needed
        return list.length > 0 ? list : classDataAny?.classarray || [];
    }, [initialData, classData, classDataAny]);
    // Handle nested sectionarray if present
    const sectionDataAny = sectionData as any;
    const sectionList = Array.isArray(sectionDataAny) ? sectionDataAny : sectionDataAny?.sectionarray || [];

    const subjectList = (subjectData as any) || [];

    const { data: session } = useSession();
    const mi_id = (session as any)?.mi_id || (session as any)?.mi_Id || (session as any)?.user?.mi_Id || (session as any)?.user?.mi_id || 0;

    const [tempList, setTempList] = useState<any[]>([]);
    const [availablePeriods, setAvailablePeriods] = useState<number>(0);
    const [editLoaded, setEditLoaded] = useState(false);
    const [classList, setClassList] = useState<any[]>([]);
    const classOptions = useMemo(() => [...classList, ...allClassList], [classList, allClassList]);

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

    const watchedTotalWeeklyPeriods = watch('nop1');
    const watchedAcademicYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');

    // Fetch edit data via new GET facade endpoint
    const { data: editData, isLoading: isLoadingEdit } = useEditPeriodDistribution({
        id: selectedRow?.ttfpD_Id,
        enabled: !!selectedRow?.ttfpD_Id
    });
    console.log('Edit data fetched from server', editData);

    // Populate form when edit data + dropdowns are ready
    useEffect(() => {
        if (!selectedRow || isLoadingEdit || editLoaded) return;

        // Dropdown lists must be loaded before we can resolve IDs
        if (
            academicList.length === 0 ||
            staffList.length === 0 ||
            categoryList.length === 0 ||
            (allClassList.length === 0 && isLoadingClassData)
            // Note: classList and sectionList might depend on category selection in some forms,
            // but for initial edit mapping, we need the underlying records to show up.
        )
            return;

        const rows: any[] = (editData as any)?.data || [];

        if (rows.length === 0) {
            setEditLoaded(true);
            return;
        }

        const firstRow = rows[0];

        // ── Robust ID Resolution ──
        // Academic Year
        const asmaY_Id =
            selectedRow.asmaY_Id ||
            selectedRow.ASMAY_Id ||
            academicList.find((a: any) => (a.asmaY_Year || '').trim().toLowerCase() === (firstRow.asmaY_Year || '').trim().toLowerCase())
                ?.asmaY_Id;

        // Staff ID
        // Note: firstRow.staffName comes from getalldetailsviewrecords JSON
        const hrmE_Id =
            selectedRow.hrmE_Id ||
            selectedRow.HRME_Id ||
            staffList.find((s: any) => (s.staffName || '').trim().toLowerCase() === (firstRow.staffName || '').trim().toLowerCase())
                ?.hrmE_Id ||
            staffList.find((s: any) => (s.staffName || '').trim().toLowerCase() === (selectedRow.staffName || '').trim().toLowerCase())
                ?.hrmE_Id;

        const nop1 = selectedRow.ttfpD_TotWeekPeriods || firstRow.ttfpD_TotalPeriods || 1;
        const ttfpD_StaffConsecutive = selectedRow.ttfpD_StaffConsecutive || 1;

        if (asmaY_Id) setValue('asmaY_Id', Number(asmaY_Id));
        if (hrmE_Id) setValue('hrmE_Id', Number(hrmE_Id));
        setValue('nop1', Number(nop1));
        setValue('ttfpD_StaffConsecutive', Number(ttfpD_StaffConsecutive));

        // Map detail rows — resolve IDs by matching display names against dropdowns
        const mappedDetails = rows.map((row: any) => {
            const ttmC_Id =
                categoryList.find((c: any) => c.ttmC_CategoryName?.trim().toLowerCase() === row.ttmC_CategoryName?.trim().toLowerCase())
                    ?.ttmC_Id || undefined;

            const className = row.asmcL_ClassName?.trim().toLowerCase();
            const asmcL_Id =
                row.asmcL_Id ??
                row.ASMCL_Id ??
                (className
                    ? classOptions.find((c: any) => c.asmcL_ClassName?.trim().toLowerCase() === className)?.asmcL_Id
                    : undefined);

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
    }, [
        editData,
        isLoadingEdit,
        selectedRow,
        editLoaded,
        academicList,
        staffList,
        categoryList,
        classOptions,
        allClassList.length,
        isLoadingClassData,
        sectionList,
        subjectList
    ]);

    // Recalculate available periods whenever total or grid changes
    useEffect(() => {
        const total = Number(watchedTotalWeeklyPeriods || 0);
        const used = tempList.reduce((acc, curr) => acc + Number(curr.pedDisplay), 0);
        setAvailablePeriods(Math.max(0, total - used));
    }, [watchedTotalWeeklyPeriods, tempList]);

    // Fetch classes when category or academic year changes
    useEffect(() => {
        if (allClassList.length > 0 && watchedCategory) {
            // Filter classes in frontend like the report page does
            const filtered = allClassList.filter((c: any) => !c.ttmC_Id || c.ttmC_Id === watchedCategory);
            setClassList(filtered);
        } else if (watchedAcademicYear && watchedCategory) {
            const fetchClasses = async () => {
                try {
                    const res = await getClassDropDownMasterDayClasswiseOnchnageofCatandyr(
                        Number(watchedAcademicYear),
                        Number(watchedCategory)
                    );
                    if (res?.success) {
                        setClassList(res.data || []);
                    } else {
                        setClassList([]);
                    }
                } catch (error) {
                    console.error('Error fetching classes:', error);
                    setClassList([]);
                }
            };
            fetchClasses();
        } else {
            if (editLoaded) {
                setClassList([]);
            }
        }

        // Only reset selections if both are changed by user after initial load
        if (editLoaded && (watchedCategory || watchedAcademicYear)) {
            setValue('asmcL_Id', undefined as any);
            setValue('asmS_Id', undefined as any);
            setValue('ismS_Id', undefined as any);
            setValue('nop2', 0);
        }
    }, [watchedAcademicYear, watchedCategory, setValue, allClassList, editLoaded]);

    const addToTempList = () => {
        const data = watch();
        if (!data.ttmC_Id || !data.asmcL_Id || !data.asmS_Id || !data.ismS_Id || !data.nop2) {
            toast.error('Please select Category, Class, Section, Subject and enter Period (not zero)!');
            return;
        }
        const nop2Val = Number(data.nop2);
        if (nop2Val === 0) {
            toast.error('Period cannot be zero!');
            return;
        }
        if (Number(data.nop1) < nop2Val) {
            toast.error("Period distribution can't exceed Total Weekly Periods for a single class!");
            return;
        }
        const used = tempList.reduce((acc, curr) => acc + Number(curr.pedDisplay), 0);
        if (used + nop2Val > Number(data.nop1)) {
            toast.error('Total distributed periods cannot exceed Total Weekly Periods!');
            return;
        }

        const catName = categoryList.find((c: any) => c.ttmC_Id === data.ttmC_Id)?.ttmC_CategoryName;
        const className = classList.find((c: any) => c.asmcL_Id === data.asmcL_Id)?.asmcL_ClassName;
        const sectionName = sectionList.find((s: any) => s.asmS_Id === data.asmS_Id)?.asmC_SectionName;
        const subjectName = subjectList.find((s: any) => s.ismS_Id === data.ismS_Id)?.ismS_SubjectName;

        const isDuplicate = tempList.some(
            (item) =>
                item.ttmC_Id === data.ttmC_Id &&
                item.asmcL_Id === data.asmcL_Id &&
                item.asmS_Id === data.asmS_Id &&
                item.ismS_Id === data.ismS_Id
        );
        if (isDuplicate) {
            toast.error('Record already selected!');
            return;
        }

        setTempList([
            ...tempList,
            {
                id: Date.now(),
                catDisplay: catName,
                clsDisplay: className,
                sectDisplay: sectionName,
                subDisplay: subjectName,
                pedDisplay: nop2Val,
                asmcL_Id: data.asmcL_Id,
                asmS_Id: data.asmS_Id,
                ismS_Id: data.ismS_Id,
                ttmC_Id: data.ttmC_Id
            }
        ]);

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

    const onSubmit = async (data: FormFields) => {
        if (!data.hrmE_Id) {
            toast.error('Select Staff');
            return;
        }
        if (tempList.length === 0) {
            toast.error('Need to distribute at least one period');
            return;
        }
        if (tempList.some((item) => !Number(item.asmcL_Id))) {
            toast.error('A class could not be resolved for one or more period details. Remove and re-add the affected detail, then try again.');
            return;
        }

        const payload = {
            ttfpD_Id: selectedRow?.ttfpD_Id || 0,
            mI_Id: mi_id || selectedRow?.mI_Id || 0,
            asmaY_Id: data.asmaY_Id,
            hrmE_Id: data.hrmE_Id,
            ttfpD_TotWeekPeriods: data.nop1,
            ttfpD_ActiveFlag: true,
            ttfpD_StaffConsecutive: data.ttfpD_StaffConsecutive,
            createdDate: selectedRow?.createdDate || new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            periodDistributionDetails: tempList.map((item) => ({
                ttfpdD_Id: item.ttfpdD_Id || 0,
                ttfpD_Id: selectedRow?.ttfpD_Id || 0,
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

        console.log('UpdatePeriodDistribution payload', JSON.stringify(payload));
        const response = await saveperioddistribution(payload);
        if (response.success) {
            toast.success(response.message);
            reset();
            refetchAll();
            onSuccess?.();
        } else {
            toast.error(response.message);
        }
    };

    // Show loader while fetching
    if (isLoadingEdit) {
        return (
            <div className='flex h-40 items-center justify-center rounded-md border bg-white shadow-sm'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='ml-2 text-muted-foreground'>Loading details...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* ── Top Section ── */}
            <div className='space-y-4 rounded-md border bg-white p-4 shadow-sm'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left */}
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

                    {/* Right */}
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
                                        // Force a re-render when the value changes to ensure the UI updates
                                        key={field.value ? field.value.toString() : 'staff-empty'}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        // Ensure the value passed to Select is a string or empty string
                                        value={field.value?.toString() || ''}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Staff--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staffList.map((item: any) => {
                                                // Check all possible ID naming conventions from your backend
                                                const id = item.hrmE_Id || item.HRME_Id || item.hrmE_ID;
                                                const name = item.staffName || item.hrmE_EmployeeFirstName || 'Unknown';
                                                return (
                                                    <SelectItem key={id} value={id?.toString()}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmE_Id && <span className='text-red-500 text-sm'>{errors.hrmE_Id.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label>Available Period</Label>
                            <div className='flex h-10 items-center rounded-md border bg-muted/50 px-3 py-2 font-medium text-sm'>
                                {availablePeriods}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr />

            {/* ── Distribution Section ── */}
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

                {/* ── Grid ── */}
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

            {/* ── Actions ── */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onSuccess}
                    disabled={isSubmitting}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Cancel
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                    isLoading={isSubmitting}
                    loadingText='Updating...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Update
                    </div>
                </Button>
            </div>
        </form>
    );
}
