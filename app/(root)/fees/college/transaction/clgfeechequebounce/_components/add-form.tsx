'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCollegeAcademicYears,
    useCollegeBranches,
    useCollegeCourses,
    useCollegeFeeChequeBounceList,
    useCollegeFeeChequeBounceReceipts,
    useCollegeSemesters,
    useCollegeStudents
} from '@/hooks/fees/college/useCollegeFeeChequeBounce';
import { clgFeeChequeBounceSchema } from '@/schemas/fees/college/transactions/clgfeechequebounce';
import { saveCollegeFeeChequeBounce } from '@/server/fees/college/transaction/clgfeechequebounce';
import type {
    ICollegeFeeChequeBounceAcademicYear,
    ICollegeFeeChequeBounceReceipt,
    ICollegeFeeChequeBounceSavePayload
} from '@/types/fees/college/transaction/clgfeechequebounce';
import type { ICollegeBranch, ICollegeCourse, ICollegeSemester, ICollegeStudent } from '@/types/fees/college/transaction/clgfeewaivedoff';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddCollegeFeeChequeBounceFormProps {
    onSuccess?: () => void;
    pageData?: any;
    className?: string;
}

type FormFields = z.infer<typeof clgFeeChequeBounceSchema.save>;

function extractArrayData<T = any>(data: any, preferredKeys: string[] = []): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.$values)) return data.data.$values;

    const source = data.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

    for (const key of preferredKeys) {
        if (Array.isArray(source[key])) return source[key];
        if (Array.isArray(source[key]?.$values)) return source[key].$values;
    }

    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key]) && source[key].length > 0) return source[key];
    }

    return [];
}

export default function AddCollegeFeeChequeBounceForm({ onSuccess, pageData, className }: AddCollegeFeeChequeBounceFormProps) {
    const { refetchAll } = useCollegeFeeChequeBounceList();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(clgFeeChequeBounceSchema.save),
        defaultValues: {
            fccB_Id: 0,
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            amcsT_Id: '',
            fyP_Id: '',
            fccB_Date: new Date(),
            fccB_Remarks: ''
        },
        mode: 'onChange'
    });

    const watchedYearId = watch('asmaY_Id');
    const watchedCourseId = watch('amcO_Id');
    const watchedBranchId = watch('amB_Id');
    const watchedSemId = watch('amsE_Id');
    const watchedStudentId = watch('amcsT_Id');

    // 1. Academic Years
    const { data: sharedAcademicYearsData } = useCollegeAcademicYears();

    const yearList = useMemo<ICollegeFeeChequeBounceAcademicYear[]>(() => {
        const fromPageData = extractArrayData<ICollegeFeeChequeBounceAcademicYear>(pageData, ['yearlist', 'year_list']);
        if (fromPageData.length > 0) return fromPageData;
        return extractArrayData<ICollegeFeeChequeBounceAcademicYear>(sharedAcademicYearsData, ['yearlist', 'academicyearlist']);
    }, [pageData, sharedAcademicYearsData]);
    // 2. Courses Hook (from clgfeewaivedoff API)
    const { data: coursesData, isLoading: isLoadingCourses } = useCollegeCourses(watchedYearId ? Number(watchedYearId) : undefined);
    const courseList = useMemo<ICollegeCourse[]>(() => {
        return extractArrayData<ICollegeCourse>(coursesData, ['courselist', 'courses']);
    }, [coursesData]);

    // Reset downstream fields when Academic Year changes
    useEffect(() => {
        setValue('amcO_Id', '');
        setValue('amB_Id', '');
        setValue('amsE_Id', '');
        setValue('amcsT_Id', '');
        setValue('fyP_Id', '');
    }, [watchedYearId, setValue]);

    // 3. Branches Hook (from clgfeewaivedoff API)
    const { data: branchesData, isLoading: isLoadingBranches } = useCollegeBranches(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined
    );
    const branchList = useMemo<ICollegeBranch[]>(() => {
        return extractArrayData<ICollegeBranch>(branchesData, ['branchlist', 'branches']);
    }, [branchesData]);

    // Reset downstream fields when Course changes
    useEffect(() => {
        setValue('amB_Id', '');
        setValue('amsE_Id', '');
        setValue('amcsT_Id', '');
        setValue('fyP_Id', '');
    }, [watchedCourseId, setValue]);

    // 4. Semesters Hook (from clgfeewaivedoff API)
    const { data: semestersData, isLoading: isLoadingSemesters } = useCollegeSemesters(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined,
        watchedBranchId ? Number(watchedBranchId) : undefined
    );
    const semesterList = useMemo<ICollegeSemester[]>(() => {
        return extractArrayData<ICollegeSemester>(semestersData, ['semisterlist', 'semesters']);
    }, [semestersData]);

    // Reset downstream fields when Branch changes
    useEffect(() => {
        setValue('amsE_Id', '');
        setValue('amcsT_Id', '');
        setValue('fyP_Id', '');
    }, [watchedBranchId, setValue]);

    // 5. Students Hook (from clgfeewaivedoff API)
    const { data: studentsData, isLoading: isLoadingStudents } = useCollegeStudents(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined,
        watchedBranchId ? Number(watchedBranchId) : undefined,
        watchedSemId ? Number(watchedSemId) : undefined
    );
    const studentList = useMemo<ICollegeStudent[]>(() => {
        return extractArrayData<ICollegeStudent>(studentsData, ['studentlist', 'students']);
    }, [studentsData]);

    // Reset downstream fields when Semester changes
    useEffect(() => {
        setValue('amcsT_Id', '');
        setValue('fyP_Id', '');
    }, [watchedSemId, setValue]);

    // 6. Receipts Hook (Cheque Bounce specific)
    const { data: receiptsData, isLoading: isLoadingReceipts } = useCollegeFeeChequeBounceReceipts(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedStudentId ? Number(watchedStudentId) : undefined
    );
    const receiptList = useMemo<ICollegeFeeChequeBounceReceipt[]>(() => {
        return extractArrayData<ICollegeFeeChequeBounceReceipt>(receiptsData, ['receiptlist', 'receipt_list']);
    }, [receiptsData]);

    // Reset Receipt when Student changes
    useEffect(() => {
        setValue('fyP_Id', '');
    }, [watchedStudentId, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload: ICollegeFeeChequeBounceSavePayload = {
                fccB_Id: data.fccB_Id || 0,
                asmaY_Id: Number(data.asmaY_Id),
                amcsT_Id: Number(data.amcsT_Id),
                fyP_Id: Number(data.fyP_Id),
                fccB_Date: data.fccB_Date ? new Date(data.fccB_Date).toISOString() : new Date().toISOString(),
                fccB_Remarks: data.fccB_Remarks
            };

            const response = await saveCollegeFeeChequeBounce(payload);
            const status = response?.returnval || response?.success;

            if (status === true || response?.returnval === true || response?.success) {
                toast.success(data.fccB_Id ? 'Record Updated Successfully' : 'Record Saved Successfully');
                handleClear();
                refetchAll();
                onSuccess?.();
            } else if (response?.returnval === false) {
                toast.error(data.fccB_Id ? 'Failed To Update Record' : 'Failed To Save Record');
            } else {
                toast.error(response?.message || 'Something Went Wrong Please Contact Administrator');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'An error occurred while saving.');
        }
    };

    const handleClear = () => {
        reset({
            fccB_Id: 0,
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            amcsT_Id: '',
            fyP_Id: '',
            fccB_Date: new Date(),
            fccB_Remarks: ''
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={className}>
            <div className='grid grid-cols-1 gap-6 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    {/* Academic Year */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Academic Year <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearList.map((yr) => (
                                            <SelectItem key={yr.asmaY_Id} value={String(yr.asmaY_Id)}>
                                                {yr.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                    </div>

                    {/* Branch */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Branch <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='amB_Id'
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={!watchedCourseId || isLoadingBranches}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingBranches
                                                    ? 'Loading Branches...'
                                                    : !watchedCourseId
                                                      ? 'Select Course First'
                                                      : 'Select Branch'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branchList.map((br) => (
                                            <SelectItem key={br.amB_Id} value={String(br.amB_Id)}>
                                                {br.amB_BranchName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amB_Id && <FormError>{errors.amB_Id.message}</FormError>}
                    </div>

                    {/* Student Name */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Student Name <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='amcsT_Id'
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={!watchedSemId || isLoadingStudents}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingStudents
                                                    ? 'Loading Students...'
                                                    : !watchedSemId
                                                      ? 'Select Semester First'
                                                      : 'Select Student'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {studentList.map((stu) => {
                                            const stuId = stu.amcsT_Id || stu.AMCST_Id || stu.amst_Id;
                                            const firstName = stu.amcsT_FirstName || stu.AMCST_FirstName || '';
                                            const middleName = stu.amcsT_MiddleName || '';
                                            const lastName = stu.amcsT_LastName || '';
                                            const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
                                            return (
                                                <SelectItem key={stuId} value={String(stuId)}>
                                                    {fullName || firstName || 'N.A'}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amcsT_Id && <FormError>{errors.amcsT_Id.message}</FormError>}
                    </div>

                    {/* Date */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Date <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='fccB_Date'
                            render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} placeholder='Enter date' />}
                        />
                        {errors.fccB_Date && <FormError>{errors.fccB_Date.message}</FormError>}
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    {/* Course */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Course <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='amcO_Id'
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={!watchedYearId || isLoadingCourses}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingCourses
                                                    ? 'Loading Courses...'
                                                    : !watchedYearId
                                                      ? 'Select Academic Year First'
                                                      : 'Select Course'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseList.map((co) => (
                                            <SelectItem key={co.amcO_Id} value={String(co.amcO_Id)}>
                                                {co.amcO_CourseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amcO_Id && <FormError>{errors.amcO_Id.message}</FormError>}
                    </div>

                    {/* Semester */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Semester <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='amsE_Id'
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={!watchedBranchId || isLoadingSemesters}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingSemesters
                                                    ? 'Loading Semesters...'
                                                    : !watchedBranchId
                                                      ? 'Select Branch First'
                                                      : 'Select Semester'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map((sem) => (
                                            <SelectItem key={sem.amsE_Id} value={String(sem.amsE_Id)}>
                                                {sem.amsE_SEMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amsE_Id && <FormError>{errors.amsE_Id.message}</FormError>}
                    </div>

                    {/* Receipt No */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Receipt No <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='fyP_Id'
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={!watchedStudentId || isLoadingReceipts}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingReceipts
                                                    ? 'Loading Receipts...'
                                                    : !watchedStudentId
                                                      ? 'Select Student First'
                                                      : 'Select Receipt No'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {receiptList.map((rec) => (
                                            <SelectItem key={rec.fyP_Id} value={String(rec.fyP_Id)}>
                                                {rec.fyP_ReceiptNo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fyP_Id && <FormError>{errors.fyP_Id.message}</FormError>}
                    </div>

                    {/* Remarks */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Remarks <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='fccB_Remarks'
                            render={({ field }) => (
                                <InputText
                                    {...field}
                                    placeholder='Enter remarks...'
                                    className='h-9 text-xs'
                                    error={errors.fccB_Remarks?.message}
                                />
                            )}
                        />
                        {errors.fccB_Remarks && <FormError>{errors.fccB_Remarks.message}</FormError>}
                    </div>
                </div>
            </div>

            {/* Form Action Buttons */}
            <div className='flex items-center justify-center gap-3 pt-6'>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText='Saving...'
                    className='min-w-28 shadow-sm'>
                    <Save className='mr-1.5 h-4 w-4' />
                    Save
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleClear}
                    disabled={isSubmitting}
                    className='min-w-28 hover:bg-destructive/10 hover:text-destructive'>
                    <RotateCcw className='mr-1.5 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
