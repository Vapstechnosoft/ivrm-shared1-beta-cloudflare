'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as UISelect } from '@/components/ui/select';
import {
    useAcademicYearDropdown,
    useMasterClassDropdown,
    useMasterSectionDropdown,
    useMasterStudentList
} from '@/hooks/admission/preadmission/useMasters';
import { masterActiveDeactiveStudentSchema } from '@/schemas/admission/preadmission/masters';
import { ActiveDeactive } from '@/server/admission/preadmission/masters/active_deactive_student';
import type { ApiSearchparams } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import type { z } from 'zod';
import { getActiveDeactiveColumns } from './_components/columns';

type FormFields = z.infer<typeof masterActiveDeactiveStudentSchema>;

interface Student {
    amst_sol: string;
    amsT_SOL: number;
    student_id: number;
    student_name: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_AdmNo: string;
    amaY_RollNo: number;
    registration_no: string;
    admission_no: string;
}

interface StudentData {
    student_id: number;
    reason: string;
    remark: string;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterActiveDeactiveStudentPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const tableRef = useRef<any>(null);

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [amst_sol, setAmst_sol] = useState<string>('S');
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number>(0);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [studentData, setStudentData] = useState<Map<number, StudentData>>(new Map());
    const studentDataRef = useRef<Map<number, StudentData>>(new Map());
    const [isSaving, setIsSaving] = useState(false);

    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();
    const { data: masterClass, isLoading: preadmissionClassLoading, isError: preadmissionClassError } = useMasterClassDropdown();
    const { data: SectionData, isLoading: SectionLoading, isError: SectionError } = useMasterSectionDropdown();

    const {
        control,
        setValue,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(masterActiveDeactiveStudentSchema),
        defaultValues: {
            amsT_SOL: 'S' as any,
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            students: []
        },
        mode: 'onChange'
    });

    const apiSearchParams: ApiSearchparams | undefined = searchParams
        ? {
            page: Number(searchParams.page) || 1,
            page_size: Number(searchParams.page_size) || 10,
            sort_column: String(searchParams.sort_column || ''),
            sort_direction: String(searchParams.sort_direction || 'asc'),
            search_query: String(searchParams.search_query || ''),
            search_columns: String(searchParams.search_columns || '')
        }
        : undefined;

    const {
        data: StudentListData,
        isLoading: StudentListLoading,
        isError: StudentListError
    } = useMasterStudentList(amst_sol, academicYearId, classId, sectionId, apiSearchParams);

    const students = StudentListData?.data || [];

    const handleAcademicYearChange = (value: string) => {
        const numValue = Number(value);
        setAcademicYearId(numValue);
        setValue('asmaY_Id', numValue);
        setClassId(0);
        setSectionId(0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setSelectedStudents(new Set());
        setStudentData(new Map());
        studentDataRef.current = new Map();
    };

    const handleClassChange = (value: string) => {
        const numValue = Number(value);
        setClassId(numValue);
        setValue('asmcL_Id', numValue);
        setSectionId(0);
        setValue('asmS_Id', 0);
        setSelectedStudents(new Set());
        setStudentData(new Map());
        studentDataRef.current = new Map();
    };

    const handleSectionChange = (value: string) => {
        const numValue = Number(value);
        setSectionId(numValue);
        setValue('asmS_Id', numValue);
        setSelectedStudents(new Set());
        setStudentData(new Map());
        studentDataRef.current = new Map();
    };

    const handleStatus = (value: string) => {
        setAmst_sol(value);
        setValue('amsT_SOL', value as any);
        setSelectedStudents(new Set());
        setStudentData(new Map());
        studentDataRef.current = new Map();
    };

    const handleSelectStudent = (selectedRows: Student[]) => {
        const selectedIds = new Set(selectedRows.map((student) => Number(student.student_id)));
        setSelectedStudents(selectedIds);
    };

    const updateStudentData = useCallback((studentId: number | string, field: 'reason' | 'remark', value: string) => {
        const numId = Number(studentId);
        studentDataRef.current.set(numId, {
            ...(studentDataRef.current.get(numId) || { student_id: numId, reason: '', remark: '' }),
            [field]: value
        });
        setStudentData(new Map(studentDataRef.current));
    }, []);

    const handleClear = () => {
        window.location.reload();
    };

    const handleSave = async () => {
        if (academicYearId === 0 || classId === 0 || sectionId === 0) {
            toast.error('Please select Academic Year, Class, and Section');
            return;
        }

        if (selectedStudents.size === 0) {
            toast.error('Please select at least one student');
            return;
        }

        let hasError = false;

        const studentsArray = Array.from(selectedStudents).map((id) => {
            const numId = Number(id);
            const sd = studentDataRef.current.get(numId);
            if (!sd?.reason || !sd?.remark) {
                hasError = true;
            }
            return {
                amsT_Id: numId,
                reason: sd?.reason || '',
                remarks: sd?.remark || ''
            };
        });
        console.log('studentsArray', studentsArray);

        if (hasError) {
            toast.error('Please fill Reason and Remarks for all selected students');
            return;
        }

        const amsT_SOL_activate = amst_sol === 'S' ? 'D' : 'S';

        const payload = {
            asmaY_Id: academicYearId,
            asmcL_Id: classId,
            asmS_Id: sectionId,
            amsT_SOL: amsT_SOL_activate as any,
            students: studentsArray
        };

        setIsSaving(true);
        try {
            const response = await ActiveDeactive(payload);
            if (response.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Saved successfully',
                    icon: 'success'
                }).then(() => {
                    handleClear();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Not saved successfully',
                    icon: 'error'
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update students');
        } finally {
            setIsSaving(false);
        }
    };

    const tableProps = {
        data: students,
        totalItems: (StudentListData as any)?.total || 0,
        success: StudentListData?.success ?? true,
        errorMessage: StudentListData?.message,
        enableRowSelection: true,
        getRowId: (row: Student) => row.student_id.toString()
    };

    const columns = useMemo(() => getActiveDeactiveColumns(studentDataRef, updateStudentData), [updateStudentData]);

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-4 p-4'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        title='Active Deactive Students'
                        description='Select academic year, class, and section students'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                <div className='group flex flex-col gap-1.5'>
                                    <Label>
                                        Student Status <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <RadioGroup onValueChange={handleStatus} value={amst_sol} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='S' id='active_students' />
                                            <Label htmlFor='active_students' className='cursor-pointer font-normal'>
                                                Active Students
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='D' id='deactive_students' />
                                            <Label htmlFor='deactive_students' className='cursor-pointer font-normal'>
                                                Deactive Students
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmaY_Id'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <UISelect
                                                onValueChange={handleAcademicYearChange}
                                                value={field.value > 0 ? field.value.toString() : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ayLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        academicYear?.data?.map((item) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </UISelect>
                                        )}
                                    />
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </div>

                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmcL_Id'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <UISelect
                                                key={`class-${academicYearId}`}
                                                onValueChange={handleClassChange}
                                                value={field.value > 0 ? field.value.toString() : ''}
                                                disabled={academicYearId === 0}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {preadmissionClassLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : preadmissionClassError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        masterClass?.data?.map((item) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </UISelect>
                                        )}
                                    />
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </div>

                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmS_Id'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmS_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <UISelect
                                                key={`section-${classId}`}
                                                onValueChange={handleSectionChange}
                                                value={field.value > 0 ? field.value.toString() : ''}
                                                disabled={classId === 0}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SectionLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : SectionError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        SectionData?.data?.map((opt: any) => (
                                                            <SelectItem key={opt.asmS_Id} value={opt.asmS_Id.toString()}>
                                                                {opt.asmC_SectionName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </UISelect>
                                        )}
                                    />
                                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {academicYearId > 0 && classId > 0 && sectionId > 0 && (
                        <CollapsibleSection
                            title='Student List'
                            description='Select students to activate/deactivate'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-4'>
                                <GenericDataTable<Student>
                                    {...tableProps}
                                    ref={tableRef}
                                    columns={columns}
                                    isLoading={StudentListLoading}
                                    error={StudentListError ? new Error('Failed to load students') : null}
                                    showViewOptions={false}
                                    loadingMessage='Loading students...'
                                    noDataTitle='No Students Found'
                                    noDataDescription='Try adjusting your filters.'
                                    onRowSelectionChange={handleSelectStudent}
                                />

                                <div className='mt-4 flex flex-col items-center gap-6 border-t py-4'>
                                    <div className='flex items-center gap-8 rounded-lg bg-muted/30 p-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox checked={amst_sol === 'D'} disabled />
                                            <Label className='font-medium text-sm leading-none'>Activate the Students</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox checked={amst_sol === 'S'} disabled />
                                            <Label className='font-medium text-sm leading-none'>Deactivate the Students</Label>
                                        </div>
                                    </div>

                                    <div className='flex gap-4'>
                                        <Button
                                            className='min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90'
                                            onClick={handleSave}
                                            isLoading={isSaving}
                                            loadingText='Saving...'
                                            disabled={isSaving}>
                                            <Save className='mr-2 h-4 w-4' />
                                            Save
                                        </Button>
                                        <Button variant='destructive' className='min-w-[120px]' onClick={handleClear}>
                                            <X className='mr-2 h-4 w-4' />
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </div>
    );
}
