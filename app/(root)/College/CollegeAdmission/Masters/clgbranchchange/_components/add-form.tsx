'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useBranchChange,
    useGetBranchChangeBranches,
    useGetBranchChangeCourses,
    useGetBranchChangeSemesters,
    useGetBranchChangeStudents,
    useSaveBranchChange
} from '@/hooks/college/useCollegeMasters';
import { branchChangeSchema } from '@/schemas/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof branchChangeSchema.add>;

interface AddBranchChangeFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddBranchChangeForm({ onSuccess, className = '' }: AddBranchChangeFormProps) {
    const { data: response, refetchAll } = useBranchChange();
    const saveMutation = useSaveBranchChange();
    const getCoursesMutation = useGetBranchChangeCourses();
    const getBranchesMutation = useGetBranchChangeBranches();
    const getSemestersMutation = useGetBranchChangeSemesters();
    const getStudentsMutation = useGetBranchChangeStudents();

    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);

    const yearList = response?.yearlist || response?.data?.yearlist || [];
    const sectionList = response?.sectionslist || response?.data?.sectionslist || [];

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(branchChangeSchema.add),
        defaultValues: {
            asmaY_Id1: '',
            amcO_Id: '',
            amB_Id: '',
            acscoB_AMB_Id: '',
            amsE_Id1: '',
            amsE_Id: '',
            acmS_Id: '',
            acmS_Id_COB: '',
            amcsT_Id: '',
            acscoB_OldRegNo: '',
            acscoB_NewRegNo: '',
            acscoB_COBDate: new Date(),
            acscoB_COBFees: '',
            acscoB_Remarks: ''
        },
        mode: 'onChange'
    });

    const selectedYearId = watch('asmaY_Id1');
    const selectedCourseId = watch('amcO_Id');
    const selectedBranchId = watch('amB_Id');
    const selectedSemId = watch('amsE_Id1');
    const selectedOldRegNo = watch('acscoB_OldRegNo');

    // Handle Year Change -> fetch Courses
    const handleYearChange = async (val: string) => {
        setValue('asmaY_Id1', val, { shouldValidate: true });
        // Reset dependent fields
        setValue('amcO_Id', '');
        setValue('amB_Id', '');
        setValue('acscoB_AMB_Id', '');
        setValue('amsE_Id1', '');
        setValue('amsE_Id', '');
        setValue('acmS_Id', '');
        setValue('acmS_Id_COB', '');
        setValue('amcsT_Id', '');
        setValue('acscoB_OldRegNo', '');
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);

        if (val) {
            try {
                const res = await getCoursesMutation.mutateAsync({ ASMAY_Id: Number(val) });
                const list = res?.courselist || res?.data?.courselist || [];
                setCourseList(list);
            } catch (err: any) {
                toast.error(err.message || 'Failed to fetch courses');
            }
        }
    };

    // Handle Course Change -> fetch Branches
    const handleCourseChange = async (val: string) => {
        setValue('amcO_Id', val, { shouldValidate: true });
        // Reset dependent fields
        setValue('amB_Id', '');
        setValue('acscoB_AMB_Id', '');
        setValue('amsE_Id1', '');
        setValue('amsE_Id', '');
        setValue('acmS_Id', '');
        setValue('acmS_Id_COB', '');
        setValue('amcsT_Id', '');
        setValue('acscoB_OldRegNo', '');
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);

        if (val && selectedYearId) {
            try {
                const res = await getBranchesMutation.mutateAsync({
                    ASMAY_Id: Number(selectedYearId),
                    AMCO_Id: Number(val)
                });
                const list = res?.branchlist || res?.data?.branchlist || [];
                setBranchList(list);
            } catch (err: any) {
                toast.error(err.message || 'Failed to fetch branches');
            }
        }
    };

    // Handle Branch Change -> fetch Semesters
    const handleBranchChange = async (val: string) => {
        setValue('amB_Id', val, { shouldValidate: true });
        // Reset dependent fields
        setValue('amsE_Id1', '');
        setValue('amsE_Id', '');
        setValue('acmS_Id', '');
        setValue('acmS_Id_COB', '');
        setValue('amcsT_Id', '');
        setValue('acscoB_OldRegNo', '');
        setSemesterList([]);
        setStudentList([]);

        if (val && selectedYearId && selectedCourseId) {
            try {
                const res = await getSemestersMutation.mutateAsync({
                    ASMAY_Id: Number(selectedYearId),
                    AMCO_Id: Number(selectedCourseId),
                    AMB_Id: Number(val)
                });
                const list = res?.semisterlist || res?.data?.semisterlist || [];
                setSemesterList(list);
            } catch (err: any) {
                toast.error(err.message || 'Failed to fetch semesters');
            }
        }
    };

    // Handle Semester Change
    const handleSemChange = (val: string) => {
        setValue('amsE_Id1', val, { shouldValidate: true });
        setValue('acmS_Id', '');
        setValue('acmS_Id_COB', '');
        setValue('amcsT_Id', '');
        setValue('acscoB_OldRegNo', '');
        setStudentList([]);
    };

    // Handle Section Change -> fetch Students
    const handleSectionChange = async (val: string) => {
        setValue('acmS_Id', val, { shouldValidate: true });
        setValue('amcsT_Id', '');
        setValue('acscoB_OldRegNo', '');
        setStudentList([]);

        if (val && selectedYearId && selectedCourseId && selectedBranchId && selectedSemId) {
            try {
                const res = await getStudentsMutation.mutateAsync({
                    ASMAY_Id: Number(selectedYearId),
                    AMCO_Id: Number(selectedCourseId),
                    AMB_Id: Number(selectedBranchId),
                    AMSE_Id: Number(selectedSemId),
                    ACMS_Id_Old: Number(val)
                });
                const list = res?.studlist || res?.data?.studlist || [];
                setStudentList(list);
            } catch (err: any) {
                toast.error(err.message || 'Failed to fetch students');
            }
        }
    };

    // Handle Student Change -> set Old Registration No
    const handleStudentChange = (val: string) => {
        setValue('amcsT_Id', val, { shouldValidate: true });
        const student = studentList.find((s: any) => String(s.amcsT_Id || s.AMCST_Id) === String(val));
        const regNo = student ? student.amcsT_RegistrationNo || student.AMCST_RegistrationNo || '' : '';
        setValue('acscoB_OldRegNo', regNo);
    };

    const handleFormReset = () => {
        reset();
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                ACSCOB_Id: 0,
                AMCST_Id: Number(data.amcsT_Id),
                ASMAY_Id: Number(data.asmaY_Id1),
                AMCO_Id: Number(data.amcO_Id),
                AMB_Id: Number(data.amB_Id),
                ACSCOB_AMB_Id: Number(data.acscoB_AMB_Id),
                AMSE_Id_Old: Number(data.amsE_Id1),
                AMSE_Id_New: Number(data.amsE_Id),
                ACMS_Id_Old: Number(data.acmS_Id),
                ACMS_Id_New: Number(data.acmS_Id_COB),
                ACSCOB_OldRegNo: data.acscoB_OldRegNo || '',
                ACSCOB_NewRegNo: data.acscoB_NewRegNo || '',
                ACSCOB_Remarks: data.acscoB_Remarks,
                ACSCOB_COBFees: data.acscoB_COBFees,
                ACSCOB_COBDate: data.acscoB_COBDate ? new Date(data.acscoB_COBDate).toDateString() : new Date().toDateString()
            };

            const res = await saveMutation.mutateAsync(payload);

            if (res?.returnval === true || res?.success === true) {
                toast.success('Data record Inserted Successfully!');
                handleFormReset();
                refetchAll();
                onSuccess?.();
            } else if (res?.returnduplicatestatus === 'Duplicate' || res?.returnduplicatestatus === 1) {
                toast.error('Record Already Exist!');
            } else if (res?.returnval === false || res?.success === false) {
                toast.error(res?.message || 'Insertion Failed!');
            } else {
                toast.success('Data record Inserted Successfully!');
                handleFormReset();
                refetchAll();
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while saving.');
        }
    };

    // Find label helpers for disabled mirror dropdowns
    const selectedYearObj = yearList.find((y: any) => String(y.asmaY_Id || y.ASMAY_Id) === String(selectedYearId));
    const selectedCourseObj = courseList.find((c: any) => String(c.amcO_Id || c.AMCO_Id) === String(selectedCourseId));

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Row 1: Academic Year From & To */}
                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Academic Year</Label>
                        <Controller
                            name='asmaY_Id1'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select value={field.value} onValueChange={handleYearChange}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearList.map((y: any) => {
                                                const id = String(y.asmaY_Id || y.ASMAY_Id);
                                                const yearName = y.asmaY_Year || y.ASMAY_Year;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {yearName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Academic Year (To)</Label>
                        <Select value={selectedYearId || ''} disabled>
                            <SelectTrigger className='cursor-not-allowed bg-muted/50'>
                                <SelectValue placeholder='Select Academic Year'>
                                    {selectedYearObj ? selectedYearObj.asmaY_Year || selectedYearObj.ASMAY_Year : 'Select Academic Year'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {selectedYearId && (
                                    <SelectItem value={selectedYearId}>
                                        {selectedYearObj ? selectedYearObj.asmaY_Year || selectedYearObj.ASMAY_Year : ''}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Row 2: Course From & To */}
                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Course</Label>
                        <Controller
                            name='amcO_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        value={field.value}
                                        onValueChange={handleCourseChange}
                                        disabled={!selectedYearId || getCoursesMutation.isPending}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue
                                                placeholder={getCoursesMutation.isPending ? 'Loading courses...' : 'Select Course'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courseList.map((c: any) => {
                                                const id = String(c.amcO_Id || c.AMCO_Id);
                                                const name = c.amcO_CourseName || c.AMCO_CourseName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Course (To)</Label>
                        <Select value={selectedCourseId || ''} disabled>
                            <SelectTrigger className='cursor-not-allowed bg-muted/50'>
                                <SelectValue placeholder='Select Course'>
                                    {selectedCourseObj
                                        ? selectedCourseObj.amcO_CourseName || selectedCourseObj.AMCO_CourseName
                                        : 'Select Course'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {selectedCourseId && (
                                    <SelectItem value={selectedCourseId}>
                                        {selectedCourseObj ? selectedCourseObj.amcO_CourseName || selectedCourseObj.AMCO_CourseName : ''}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Row 3: Branch From & To Branch */}
                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Branch</Label>
                        <Controller
                            name='amB_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        value={field.value}
                                        onValueChange={handleBranchChange}
                                        disabled={!selectedCourseId || getBranchesMutation.isPending}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue
                                                placeholder={getBranchesMutation.isPending ? 'Loading branches...' : 'Select Branch'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branchList.map((b: any) => {
                                                const id = String(b.amB_Id || b.AMB_Id);
                                                const name = b.amB_BranchName || b.AMB_BranchName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>To Branch</Label>
                        <Controller
                            name='acscoB_AMB_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        value={field.value}
                                        onValueChange={(val) => {
                                            if (val === selectedBranchId) {
                                                toast.warning('Select Different Branch In To Branch');
                                            }
                                            field.onChange(val);
                                        }}
                                        disabled={branchList.length === 0}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue placeholder='Select Branch' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branchList.map((b: any) => {
                                                const id = String(b.amB_Id || b.AMB_Id);
                                                const name = b.amB_BranchName || b.AMB_BranchName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Row 4: Semester From & To Semester */}
                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Semester</Label>
                        <Controller
                            name='amsE_Id1'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        value={field.value}
                                        onValueChange={handleSemChange}
                                        disabled={!selectedBranchId || getSemestersMutation.isPending}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue
                                                placeholder={getSemestersMutation.isPending ? 'Loading semesters...' : 'Select Semester'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesterList.map((s: any) => {
                                                const id = String(s.amsE_Id || s.AMSE_Id);
                                                const name = s.amsE_SEMName || s.AMSE_SEMName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>To Semester</Label>
                        <Controller
                            name='amsE_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={semesterList.length === 0}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue placeholder='Select Semester' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesterList.map((s: any) => {
                                                const id = String(s.amsE_Id || s.AMSE_Id);
                                                const name = s.amsE_SEMName || s.AMSE_SEMName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Row 5: Section From & To Section */}
                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Section</Label>
                        <Controller
                            name='acmS_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select value={field.value} onValueChange={handleSectionChange} disabled={!selectedSemId}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sectionList.map((sec: any) => {
                                                const id = String(sec.acmS_Id || sec.ACMS_Id);
                                                const name = sec.acmS_SectionName || sec.ACMS_SectionName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>To Section</Label>
                        <Controller
                            name='acmS_Id_COB'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sectionList.map((sec: any) => {
                                                const id = String(sec.acmS_Id || sec.ACMS_Id);
                                                const name = sec.acmS_SectionName || sec.ACMS_SectionName;
                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Row 6 Left: Student, Reg No, Date */}
                    <div className='space-y-4'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>Student Name</Label>
                            <Controller
                                name='amcsT_Id'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select
                                            value={field.value}
                                            onValueChange={handleStudentChange}
                                            disabled={studentList.length === 0 || getStudentsMutation.isPending}>
                                            <SelectTrigger
                                                className={
                                                    fieldState.error
                                                        ? 'border-destructive focus:ring-destructive/20'
                                                        : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                                }>
                                                <SelectValue
                                                    placeholder={getStudentsMutation.isPending ? 'Loading students...' : 'Select Student'}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studentList.map((stu: any) => {
                                                    const id = String(stu.amcsT_Id || stu.AMCST_Id);
                                                    const name = stu.amcsT_Name || stu.AMCST_Name;
                                                    return (
                                                        <SelectItem key={id} value={id}>
                                                            {name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label>Registration No</Label>
                            <InputText
                                id='acscoB_OldRegNo'
                                value={selectedOldRegNo || ''}
                                disabled
                                placeholder='Registration No'
                                className='cursor-not-allowed bg-muted/50'
                            />
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>Date</Label>
                            <Controller
                                name='acscoB_COBDate'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <DatePicker
                                            date={field.value}
                                            setDate={(d) => field.onChange(d || new Date())}
                                            placeholder='Select Date'
                                            disabled={(date) => date > new Date()}
                                            className={
                                                fieldState.error
                                                    ? 'border-destructive focus:ring-destructive/20'
                                                    : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                            }
                                        />
                                        {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>
                    </div>

                    {/* Row 6 Right: New Reg No, COB Fees, Reason */}
                    <div className='space-y-4'>
                        <InputText
                            label='New Registration No'
                            id='acscoB_NewRegNo'
                            placeholder='Enter New Registration No'
                            maxLength={100}
                            {...register('acscoB_NewRegNo')}
                            error={errors.acscoB_NewRegNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='COB Fees (mandatory)'
                            required
                            id='acscoB_COBFees'
                            placeholder='Enter COB Fees'
                            maxLength={100}
                            {...register('acscoB_COBFees')}
                            error={errors.acscoB_COBFees?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Reason'
                            required
                            id='acscoB_Remarks'
                            placeholder='Enter Reason'
                            maxLength={100}
                            {...register('acscoB_Remarks')}
                            error={errors.acscoB_Remarks?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                {/* Form Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleFormReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Cancel
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
            </form>
        </div>
    );
}
