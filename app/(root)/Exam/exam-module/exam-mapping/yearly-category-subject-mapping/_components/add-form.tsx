'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYearlyCategorySubjectMapping } from '@/hooks/exam/exammodule/exam-mapping';
import { useMasterSubjectGroupDropdownList } from '@/hooks/exam/exammodule/usemasters';
import { categorySubjectMappingSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getCategoryDropDowByExamYearCategoryList } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { addOrUpdateYearlyCategorySubjectMapping } from '@/server/exam/exam-module/exam-mapping/yearly-category-subject-mapping';
import { getExamAcademicYearDropdown } from '@/server/exam/exam-module/masters/exam';
import { getMasterSubjectGroupDetails } from '@/server/exam/exam-module/masters/subject-group';
import type { IYearlyCategorySubjectMapping } from '@/types/exam/exam-module/exam-mapping';
import type { ICategory } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof categorySubjectMappingSchema.addOrUpdate>;

interface AddCategorySubjectMappingFormProps {
    onSuccess?: () => void;
    rowData?: IYearlyCategorySubjectMapping;
}

export default function AddCategorySubjectMappingForm({ onSuccess, rowData }: AddCategorySubjectMappingFormProps) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(categorySubjectMappingSchema.addOrUpdate),
        mode: 'onSubmit',
        defaultValues: {
            userId: 1,
            eycG_Id: 0,
            eyC_Id: 0,
            // mI_Id: 30,
            asmaY_Id: undefined,
            emcA_Id: undefined,
            emG_Id: undefined,
            subjects_list: [],
            eyC_BasedOnPaperTypeFlg: false
        }
    });
    const { refetchAll } = useYearlyCategorySubjectMapping();
    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { errors, isSubmitting } = formState;
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<{ emG_Id: number; emG_GroupName: string }[]>([]);
    const [subjects, setSubjects] = useState<{ ismS_Id: number; ismS_SubjectName: string }[]>([]);
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [academicYearLoading, setAcademicYearLoading] = useState(false);
    const { data: subjectGroupList, error: subjectGroupError } = useMasterSubjectGroupDropdownList();
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                setAcademicYearLoading(true);
                const res = await getExamAcademicYearDropdown();
                const yearData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                const formatted = yearData
                    .map((item: any) => ({
                        asmaY_Id: item.asmaY_Id ?? item.ASMAY_Id ?? 0,
                        asmaY_Year: item.asmaY_Year ?? item.ASMAY_Year ?? ''
                    }))
                    .filter((item: any) => item.asmaY_Id > 0);
                setAcademicYears(formatted);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load academic years');
            } finally {
                setAcademicYearLoading(false);
            }
        };
        fetchAcademicYears();
    }, []);
    useEffect(() => {
        reset({
            userId: 1,
            eycG_Id: rowData?.eycG_Id ?? 0,
            eyC_Id: rowData?.eyC_Id ?? 0,
            // mI_Id: 30,
            asmaY_Id: rowData?.asmaY_Id ?? undefined,
            emcA_Id: undefined,
            emG_Id: rowData?.emG_Id ?? undefined,
            subjects_list: [],
            eyC_BasedOnPaperTypeFlg: rowData?.eyC_BasedOnPaperTypeFlg ?? false
        });
    }, [reset, rowData]);

    useEffect(() => {
        if (subjectGroupError) {
            toast.error(subjectGroupError.message || 'Error fetching subject groups');
            setSubjectGroups([]);
        } else if (subjectGroupList?.data && Array.isArray(subjectGroupList.data)) {
            setSubjectGroups(subjectGroupList.data);
        } else {
            setSubjectGroups([]);
        }
    }, [subjectGroupList, subjectGroupError]);

    // Watch selected Academic Year
    const selectedYearId = useWatch({
        control,
        name: 'asmaY_Id'
    });

    // Fetch categories whenever Academic Year changes
    useEffect(() => {
        if (!selectedYearId) return;
        async function fetchCategories() {
            try {
                const { data: cats } = await getCategoryDropDowByExamYearCategoryList(selectedYearId);
                const safeCats = Array.isArray(cats) ? (cats as ICategory[]) : [];
                setCategories(safeCats);
                setValue('emcA_Id', 0);
                setValue('eyC_Id', 0);
                if (safeCats.length === 0) {
                    toast.info('No mapped categories found for this academic year. Please configure Category Dates first.');
                }
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
            }
        }
        fetchCategories();
    }, [selectedYearId, setValue]);

    const selectedGroupSubjectId = useWatch({
        control,
        name: 'emG_Id'
    });

    useEffect(() => {
        if (!selectedGroupSubjectId) return;
        async function fetchSubjects() {
            try {
                const { data: subj } = await getMasterSubjectGroupDetails(selectedGroupSubjectId);

                setSubjects(Array.isArray(subj) ? subj : []);
                setValue('subjects_list', Array.isArray(subj) ? subj : []); // reset selected category whenever year changes
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load subjects');
            }
        }
        fetchSubjects();
    }, [selectedGroupSubjectId, setValue]);

    const onSubmit = async (data: FormFields) => {
        try {
            const selectedCat = categories.find((c) => c.emcA_Id === data.emcA_Id);
            const payload = {
                ...data,
                eyC_Id: data.eyC_Id || selectedCat?.eyC_Id || 0,
                eycG_Id: data.eycG_Id || 0
            };
            const res: any = await addOrUpdateYearlyCategorySubjectMapping(payload);
            const isSuccess =
                res?.success === true ||
                res?.returnval === true ||
                res?.returnval === 'true' ||
                res?.returnval === 'saved' ||
                res?.returnVal === true ||
                res?.returnVal === 'true' ||
                res?.returnVal === 'saved' ||
                res?.returnVal === 'updated' ||
                res?.returnval === 'updated' ||
                res?.returnval === 'Record Saved Successfully' ||
                res?.returnVal === 'Record Saved Successfully' ||
                (res &&
                    typeof res === 'object' &&
                    res?.success !== false &&
                    res?.returnval !== false &&
                    res?.returnVal !== false &&
                    res?.returnval !== 'failed' &&
                    res?.returnVal !== 'failed' &&
                    res?.returnval !== 'duplicate' &&
                    res?.returnVal !== 'duplicate' &&
                    res?.returnval !== 'Duplicate' &&
                    res?.returnVal !== 'Duplicate' &&
                    !res?.error);

            if (isSuccess) {
                toast.success(res?.message || 'Data saved successfully');
                reset();
                setResetKey((prev) => prev + 1);
                refetchAll();
                onSuccess?.();
            } else if (
                res?.returnval === 'duplicate' ||
                res?.returnVal === 'duplicate' ||
                res?.returnval === 'Duplicate' ||
                res?.returnVal === 'Duplicate'
            ) {
                toast.error(res?.message || 'Record already exists');
            } else {
                toast.error(res?.message || 'Failed to save the data');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save the data');
        }
    };
    const handleReset = () => {
        reset({
            userId: 1,
            eycG_Id: 0,
            asmaY_Id: undefined,
            emcA_Id: undefined,
            emG_Id: undefined,
            subjects_list: [],
            eyC_BasedOnPaperTypeFlg: false
        });
        setCategories([]);
        setSubjects([]);
        setResetKey((prev) => prev + 1);
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Left Column */}
                        <div className='grid grid-rows-2 gap-3'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            key={field.value} // <— forces remount when value changes
                                            value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading Academic Year...
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((item) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='emcA_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Category <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            key={field.value} // <— forces remount when value changes
                                            value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                            onValueChange={(val) => {
                                                const catId = Number(val);
                                                const selected = categories.find((c) => c.emcA_Id === catId);
                                                if (selected?.eyC_Id) {
                                                    setValue('eyC_Id', selected.eyC_Id);
                                                }
                                                field.onChange(catId);
                                            }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cats) => (
                                                    <SelectItem key={cats.emcA_Id} value={String(cats.emcA_Id)}>
                                                        {cats.emcA_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='emG_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Subject Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            key={field.value} // <— forces remount when value changes
                                            value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Subject Group' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjectGroups.map((grop) => (
                                                    <SelectItem key={grop.emG_Id} value={String(grop.emG_Id)}>
                                                        {grop.emG_GroupName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='eyC_BasedOnPaperTypeFlg'
                                render={({ field }) => {
                                    const checkboxId = 'eyc_based_on_paper_type_flag';

                                    return (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={checkboxId}
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(!!checked)}
                                            />

                                            <label htmlFor={checkboxId} className='cursor-pointer font-medium text-sm leading-none'>
                                                Based on Paper Type
                                            </label>
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        <div>
                            <Controller
                                control={control}
                                name='subjects_list'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        options={subjects.map((subj) => ({
                                            label: subj.ismS_SubjectName,
                                            value: subj.ismS_Id.toString()
                                        }))}
                                        onChange={(selectedValues) => {
                                            const selected = subjects.filter((subj) => selectedValues.includes(subj.ismS_Id.toString()));
                                            field.onChange(selected);
                                        }}
                                        value={field.value.map((subj: { ismS_Id: { toString: () => any } }) => subj.ismS_Id.toString())}
                                        label='Subjects'
                                        height='200px'
                                        isSearchRequired={true}
                                        error={errors.subjects_list?.message}
                                        isRequired={true}
                                        resetKey={resetKey}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='mt-4 flex justify-start gap-4'>
                        <Button type='submit' className='w-fit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type='button' variant='outline' className='w-fit' onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
