'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useCollegeAcademicYears,
    useCollegeBranches,
    useCollegeCourses,
    useCollegeFeeOpeningBalanceList,
    useCollegeOpeningBalanceGroups,
    useCollegeOpeningBalanceHeads,
    useCollegeOpeningBalanceInstallments,
    useCollegeSemesters
} from '@/hooks/fees/college/useCollegeFeeOpeningBalance';
import { clgFeeOpeningBalanceSchema } from '@/schemas/fees/college/transactions/clgfeeopeningbalance';
import { getCollegeOpeningBalanceStudents, saveCollegeFeeOpeningBalance } from '@/server/fees/college/transaction/clgfeeopeningbalance';
import type {
    ICollegeFeeOpeningBalanceGroup,
    ICollegeFeeOpeningBalanceHead,
    ICollegeFeeOpeningBalanceInstallment,
    ICollegeFeeOpeningBalanceSavePayload,
    ICollegeFeeOpeningBalanceStudent
} from '@/types/fees/college/transaction/clgfeeopeningbalance';
import type { ICollegeBranch, ICollegeCourse, ICollegeSemester } from '@/types/fees/college/transaction/clgfeewaivedoff';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddCollegeFeeOpeningBalanceFormProps {
    onSuccess?: () => void;
    pageData?: any;
    className?: string;
}

type FormFields = z.infer<typeof clgFeeOpeningBalanceSchema.searchStudents>;

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

export default function AddCollegeFeeOpeningBalanceForm({ onSuccess, pageData, className }: AddCollegeFeeOpeningBalanceFormProps) {
    const { refetchAll } = useCollegeFeeOpeningBalanceList();

    const [studentList, setStudentList] = useState<ICollegeFeeOpeningBalanceStudent[]>([]);
    const [savedDataList, setSavedDataList] = useState<any[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(clgFeeOpeningBalanceSchema.searchStudents),
        defaultValues: {
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            fmG_Id: '',
            fmH_Id: '',
            ftI_Id: ''
        },
        mode: 'onChange'
    });

    const watchedYearId = watch('asmaY_Id');
    const watchedCourseId = watch('amcO_Id');
    const watchedBranchId = watch('amB_Id');
    const watchedSemId = watch('amsE_Id');
    const watchedGroupId = watch('fmG_Id');
    const watchedHeadId = watch('fmH_Id');
    const watchedInstId = watch('ftI_Id');

    // 1. Academic Years
    const { data: sharedAcademicYearsData } = useCollegeAcademicYears();
    const yearList = useMemo(() => {
        const fromPageData = extractArrayData(pageData, ['yearlist', 'year_list']);
        if (fromPageData.length > 0) return fromPageData;
        return extractArrayData(sharedAcademicYearsData, ['yearlist', 'academicyearlist']);
    }, [pageData, sharedAcademicYearsData]);

    // 2. Courses Hook
    const { data: coursesData, isLoading: isLoadingCourses } = useCollegeCourses(watchedYearId ? Number(watchedYearId) : undefined);
    const courseList = useMemo<ICollegeCourse[]>(() => {
        return extractArrayData<ICollegeCourse>(coursesData, ['courselist', 'courses']);
    }, [coursesData]);

    useEffect(() => {
        setValue('amcO_Id', '');
        setValue('amB_Id', '');
        setValue('amsE_Id', '');
        setValue('fmG_Id', '');
        setValue('fmH_Id', '');
        setValue('ftI_Id', '');
        setStudentList([]);
    }, [watchedYearId, setValue]);

    // 3. Branches Hook
    const { data: branchesData, isLoading: isLoadingBranches } = useCollegeBranches(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined
    );
    const branchList = useMemo<ICollegeBranch[]>(() => {
        return extractArrayData<ICollegeBranch>(branchesData, ['branchlist', 'branches']);
    }, [branchesData]);

    useEffect(() => {
        setValue('amB_Id', '');
        setValue('amsE_Id', '');
        setValue('fmG_Id', '');
        setValue('fmH_Id', '');
        setValue('ftI_Id', '');
        setStudentList([]);
    }, [watchedCourseId, setValue]);

    // 4. Semesters Hook
    const { data: semestersData, isLoading: isLoadingSemesters } = useCollegeSemesters(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined,
        watchedBranchId ? Number(watchedBranchId) : undefined
    );
    const semesterList = useMemo<ICollegeSemester[]>(() => {
        return extractArrayData<ICollegeSemester>(semestersData, ['semisterlist', 'semesters']);
    }, [semestersData]);

    useEffect(() => {
        setValue('amsE_Id', '');
        setValue('fmG_Id', '');
        setValue('fmH_Id', '');
        setValue('ftI_Id', '');
        setStudentList([]);
    }, [watchedBranchId, setValue]);

    // 5. Fee Groups Hook
    const { data: groupsData, isLoading: isLoadingGroups } = useCollegeOpeningBalanceGroups(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined,
        watchedBranchId ? Number(watchedBranchId) : undefined,
        watchedSemId ? Number(watchedSemId) : undefined
    );
    const groupList = useMemo<ICollegeFeeOpeningBalanceGroup[]>(() => {
        return extractArrayData<ICollegeFeeOpeningBalanceGroup>(groupsData, ['group', 'grouplist', 'group_list']);
    }, [groupsData]);

    useEffect(() => {
        setValue('fmG_Id', '');
        setValue('fmH_Id', '');
        setValue('ftI_Id', '');
        setStudentList([]);
    }, [watchedSemId, setValue]);

    // 6. Fee Heads Hook
    const { data: headsData, isLoading: isLoadingHeads } = useCollegeOpeningBalanceHeads(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined,
        watchedBranchId ? Number(watchedBranchId) : undefined,
        watchedSemId ? Number(watchedSemId) : undefined,
        watchedGroupId ? Number(watchedGroupId) : undefined
    );
    const headList = useMemo<ICollegeFeeOpeningBalanceHead[]>(() => {
        return extractArrayData<ICollegeFeeOpeningBalanceHead>(headsData, ['headlist', 'head_list']);
    }, [headsData]);

    useEffect(() => {
        setValue('fmH_Id', '');
        setValue('ftI_Id', '');
        setStudentList([]);
    }, [watchedGroupId, setValue]);

    // 7. Fee Installments Hook
    const { data: installmentsData, isLoading: isLoadingInstallments } = useCollegeOpeningBalanceInstallments(
        watchedYearId ? Number(watchedYearId) : undefined,
        watchedCourseId ? Number(watchedCourseId) : undefined,
        watchedBranchId ? Number(watchedBranchId) : undefined,
        watchedSemId ? Number(watchedSemId) : undefined,
        watchedGroupId ? Number(watchedGroupId) : undefined,
        watchedHeadId ? Number(watchedHeadId) : undefined
    );
    const installmentList = useMemo<ICollegeFeeOpeningBalanceInstallment[]>(() => {
        return extractArrayData<ICollegeFeeOpeningBalanceInstallment>(installmentsData, ['installmentlist', 'installment_list']);
    }, [installmentsData]);

    useEffect(() => {
        setValue('ftI_Id', '');
        setStudentList([]);
    }, [watchedHeadId, setValue]);

    // Fetch Students on Form Submission (Get Students button)
    const handleGetStudents: SubmitHandler<FormFields> = async (data) => {
        try {
            setIsLoadingStudents(true);
            const response = await getCollegeOpeningBalanceStudents({
                asmaY_Id: Number(data.asmaY_Id),
                amcO_Id: Number(data.amcO_Id),
                amB_Id: Number(data.amB_Id),
                amsE_Id: Number(data.amsE_Id),
                fmG_Id: Number(data.fmG_Id),
                fmH_Id: Number(data.fmH_Id),
                ftI_Id: Number(data.ftI_Id)
            });

            const fetchedStudents = extractArrayData<ICollegeFeeOpeningBalanceStudent>(response, ['studentlist', 'student_list']);
            const savedData = extractArrayData(response, ['saveddata', 'alldata']);

            setSavedDataList(savedData);

            if (fetchedStudents.length === 0) {
                toast.warning('For Selected Details Students Are Not Mapped!');
                setStudentList([]);
                return;
            }

            // Map saved data onto fetched students
            const mappedStudents = fetchedStudents.map((stu) => {
                const savedMatch = savedData.find((s: any) => String(s.amcsT_Id) === String(stu.amcsT_Id));
                return {
                    ...stu,
                    xyz: !!savedMatch,
                    FCMOB_Student_Due: savedMatch ? Number(savedMatch.fcmoB_Student_Due || 0) : 0,
                    FCMOB_Institution_Due: savedMatch ? Number(savedMatch.fcmoB_Institution_Due || 0) : 0
                };
            });

            setStudentList(mappedStudents);
            toast.info(`Found ${mappedStudents.length} student(s) for opening balance processing.`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch students.');
        } finally {
            setIsLoadingStudents(false);
        }
    };

    // Filtered student list for local table search
    const filteredStudentList = useMemo(() => {
        if (!studentSearchQuery.trim()) return studentList;
        const q = studentSearchQuery.toLowerCase().trim();
        return studentList.filter((stu) => {
            const name = [stu.amcsT_FirstName, stu.amcsT_MiddleName, stu.amcsT_LastName].filter(Boolean).join(' ').toLowerCase();
            const admNo = String(stu.amcsT_AdmNo || '').toLowerCase();
            const rollNo = String(stu.acysT_RollNo || '').toLowerCase();
            return name.includes(q) || admNo.includes(q) || rollNo.includes(q);
        });
    }, [studentList, studentSearchQuery]);

    // Checkbox state helpers
    const isAllSelected = useMemo(() => {
        if (studentList.length === 0) return false;
        return studentList.every((stu) => stu.xyz);
    }, [studentList]);

    const handleToggleAll = (checked: boolean) => {
        setStudentList((prev) =>
            prev.map((stu) => ({
                ...stu,
                xyz: checked
            }))
        );
    };

    const handleToggleStudent = (amcsT_Id: number, checked: boolean) => {
        setStudentList((prev) => prev.map((stu) => (stu.amcsT_Id === amcsT_Id ? { ...stu, xyz: checked } : stu)));
    };

    const handleStudentDueChange = (amcsT_Id: number, val: string) => {
        const amount = Number(val) || 0;
        setStudentList((prev) =>
            prev.map((stu) =>
                stu.amcsT_Id === amcsT_Id
                    ? {
                          ...stu,
                          FCMOB_Student_Due: amount,
                          FCMOB_Institution_Due: 0
                      }
                    : stu
            )
        );
    };

    const handleInstDueChange = (amcsT_Id: number, val: string) => {
        const amount = Number(val) || 0;
        setStudentList((prev) =>
            prev.map((stu) =>
                stu.amcsT_Id === amcsT_Id
                    ? {
                          ...stu,
                          FCMOB_Institution_Due: amount,
                          FCMOB_Student_Due: 0
                      }
                    : stu
            )
        );
    };

    // Save Opening Balance
    const handleSaveOpeningBalance = async () => {
        const selectedStudents = studentList.filter((stu) => stu.xyz);

        if (selectedStudents.length === 0) {
            toast.error('Select At least One Student To Save Data!');
            return;
        }

        const hasInvalidAmount = selectedStudents.some(
            (stu) => (Number(stu.FCMOB_Student_Due) || 0) <= 0 && (Number(stu.FCMOB_Institution_Due) || 0) <= 0
        );

        if (hasInvalidAmount) {
            toast.error('Please enter Student Due or Institution Due amount for all selected students!');
            return;
        }

        try {
            setIsSaving(true);
            const payload: ICollegeFeeOpeningBalanceSavePayload = {
                asmaY_Id: Number(watchedYearId),
                ASMAY_Id: Number(watchedYearId),
                fmG_Id: Number(watchedGroupId),
                FMG_Id: Number(watchedGroupId),
                fmH_Id: Number(watchedHeadId),
                FMH_Id: Number(watchedHeadId),
                ftI_Id: Number(watchedInstId),
                FTI_Id: Number(watchedInstId),
                sub_data: selectedStudents.map((stu) => ({
                    amcsT_Id: stu.amcsT_Id,
                    AMCST_Id: stu.amcsT_Id,
                    fcmoB_Student_Due: Number(stu.FCMOB_Student_Due || 0),
                    FCMOB_Student_Due: Number(stu.FCMOB_Student_Due || 0),
                    fcmoB_Institution_Due: Number(stu.FCMOB_Institution_Due || 0),
                    FCMOB_Institution_Due: Number(stu.FCMOB_Institution_Due || 0)
                }))
            };

            const response = await saveCollegeFeeOpeningBalance(payload);
            const status = response?.returnval || response?.success;

            if (status === true || response?.returnval === true || response?.success) {
                toast.success(savedDataList.length > 0 ? 'Record Updated Successfully' : 'Record Saved Successfully');
                handleClear();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed To Save Record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        reset({
            asmaY_Id: '',
            amcO_Id: '',
            amB_Id: '',
            amsE_Id: '',
            fmG_Id: '',
            fmH_Id: '',
            ftI_Id: ''
        });
        setStudentList([]);
        setSavedDataList([]);
        setStudentSearchQuery('');
    };

    return (
        <form onSubmit={handleSubmit(handleGetStudents)} className={className}>
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
                                        {yearList.map((yr: any) => (
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

                    {/* Fee Group */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Fee Group <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='fmG_Id'
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={!watchedSemId || isLoadingGroups}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingGroups
                                                    ? 'Loading Groups...'
                                                    : !watchedSemId
                                                      ? 'Select Semester First'
                                                      : 'Select Fee Group'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groupList.map((grp) => (
                                            <SelectItem key={grp.fmG_Id} value={String(grp.fmG_Id)}>
                                                {grp.fmG_GroupName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmG_Id && <FormError>{errors.fmG_Id.message}</FormError>}
                    </div>

                    {/* Fee Installment */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Fee Installment <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ftI_Id'
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={!watchedHeadId || isLoadingInstallments}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingInstallments
                                                    ? 'Loading Installments...'
                                                    : !watchedHeadId
                                                      ? 'Select Fee Head First'
                                                      : 'Select Installment'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {installmentList.map((inst) => (
                                            <SelectItem key={inst.ftI_Id} value={String(inst.ftI_Id)}>
                                                {inst.ftI_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ftI_Id && <FormError>{errors.ftI_Id.message}</FormError>}
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

                    {/* Fee Head */}
                    <div className='space-y-1.5'>
                        <Label className='font-semibold text-xs'>
                            Fee Head <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='fmH_Id'
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={!watchedGroupId || isLoadingHeads}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue
                                            placeholder={
                                                isLoadingHeads
                                                    ? 'Loading Fee Heads...'
                                                    : !watchedGroupId
                                                      ? 'Select Fee Group First'
                                                      : 'Select Fee Head'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headList.map((hd) => (
                                            <SelectItem key={hd.fmH_Id} value={String(hd.fmH_Id)}>
                                                {hd.fmH_FeeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmH_Id && <FormError>{errors.fmH_Id.message}</FormError>}
                    </div>
                </div>
            </div>

            {/* Fetch Students Button */}
            <div className='flex items-center justify-center gap-3 pt-4'>
                <Button
                    type='submit'
                    disabled={isLoadingStudents}
                    isLoading={isLoadingStudents}
                    loadingText='Fetching Students...'
                    className='min-w-32 shadow-sm'>
                    <Users className='mr-1.5 h-4 w-4' />
                    Get Students
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleClear}
                    disabled={isLoadingStudents || isSaving}
                    className='min-w-28 hover:bg-destructive/10 hover:text-destructive'>
                    <RotateCcw className='mr-1.5 h-4 w-4' />
                    Cancel
                </Button>
            </div>

            {/* Student List Section */}
            {studentList.length > 0 && (
                <Card className='mt-6 border-primary/20 shadow-md'>
                    <CardContent className='space-y-4 p-4'>
                        <div className='flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex items-center gap-2'>
                                <Users className='h-4 w-4 text-primary' />
                                <h3 className='font-bold text-foreground text-sm'>Student List ({studentList.length} Students)</h3>
                            </div>
                            <div className='relative w-full sm:w-64'>
                                <InputText
                                    value={studentSearchQuery}
                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                    placeholder='Search student name, adm no...'
                                    className='h-8 pl-8 text-xs'
                                />
                                <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                            </div>
                        </div>

                        <div className='max-h-96 overflow-x-auto rounded-md border'>
                            <Table>
                                <TableHeader className='sticky top-0 z-10 bg-muted/50'>
                                    <TableRow className='hover:bg-transparent'>
                                        <TableHead className='w-12 text-center font-bold text-xs'>SL NO</TableHead>
                                        <TableHead className='w-12 text-center'>
                                            <Checkbox
                                                checked={isAllSelected}
                                                onCheckedChange={(checked) => handleToggleAll(!!checked)}
                                                aria-label='Select all students'
                                            />
                                        </TableHead>
                                        <TableHead className='font-bold text-xs'>Student Name</TableHead>
                                        <TableHead className='font-bold text-xs'>ADM. No</TableHead>
                                        <TableHead className='font-bold text-xs'>Roll No.</TableHead>
                                        <TableHead className='min-w-36 font-bold text-xs'>Student Due (&#8377;)</TableHead>
                                        <TableHead className='min-w-36 font-bold text-xs'>Institution Due (&#8377;)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudentList.map((stu, index) => {
                                        const fullName = [stu.amcsT_FirstName, stu.amcsT_MiddleName, stu.amcsT_LastName]
                                            .filter(Boolean)
                                            .join(' ');

                                        return (
                                            <TableRow key={stu.amcsT_Id} className={stu.xyz ? 'bg-primary/5' : undefined}>
                                                <TableCell className='text-center font-medium text-muted-foreground text-xs'>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <Checkbox
                                                        checked={!!stu.xyz}
                                                        onCheckedChange={(checked) => handleToggleStudent(stu.amcsT_Id, !!checked)}
                                                    />
                                                </TableCell>
                                                <TableCell className='font-medium text-foreground text-xs'>
                                                    {fullName || stu.amcsT_FirstName || 'N.A'}
                                                </TableCell>
                                                <TableCell className='text-muted-foreground text-xs'>{stu.amcsT_AdmNo || 'N.A'}</TableCell>
                                                <TableCell className='text-muted-foreground text-xs'>{stu.acysT_RollNo || 'N.A'}</TableCell>
                                                <TableCell>
                                                    <InputText
                                                        type='number'
                                                        disabled={!stu.xyz}
                                                        value={stu.FCMOB_Student_Due || ''}
                                                        onChange={(e) => handleStudentDueChange(stu.amcsT_Id, e.target.value)}
                                                        placeholder='0.00'
                                                        className='h-8 font-semibold text-emerald-600 text-xs dark:text-emerald-400'
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InputText
                                                        type='number'
                                                        disabled={!stu.xyz}
                                                        value={stu.FCMOB_Institution_Due || ''}
                                                        onChange={(e) => handleInstDueChange(stu.amcsT_Id, e.target.value)}
                                                        placeholder='0.00'
                                                        className='h-8 font-semibold text-amber-600 text-xs dark:text-amber-400'
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Save Actions */}
                        <div className='flex items-center justify-end gap-3 border-t pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleClear}
                                disabled={isSaving}
                                className='min-w-28 hover:bg-destructive/10 hover:text-destructive'>
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                onClick={handleSaveOpeningBalance}
                                disabled={isSaving}
                                isLoading={isSaving}
                                loadingText='Saving...'
                                className='min-w-32 shadow-sm'>
                                <Save className='mr-1.5 h-4 w-4' />
                                Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </form>
    );
}
