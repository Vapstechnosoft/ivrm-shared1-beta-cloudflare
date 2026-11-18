'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterSectionHeld } from '@/hooks/admission/preadmission/useMasters';
import { useMasterChangeSectionTable, useMasterUpdateStudentRoles } from '@/hooks/admission/preadmission/useSection';
import { useAdmissionClassDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { masterUpdateRollNumberSchema } from '@/schemas/admission/preadmission/section';
import { updateRollNumbers } from '@/server/admission/preadmission/section/sections';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import type { z } from 'zod';
import { masterUpdateRollNumberColumns } from './_components/columns';

type FormFields = z.infer<typeof masterUpdateRollNumberSchema>;

interface Student {
    asysT_Id: number;
    student_id: number;
    student_name: string;
    asmcL_Id: number;
    asmcL_ClassName: string;
    class_name?: string;
    asmS_Id: number;
    asmC_SectionName: string;
    section_name?: string;
    amaY_RollNo: number;
    roll_no?: number;
    amsT_AdmNo: string;
    admission_no?: string;
    new_roll_no?: number;
    display_roll_no?: number;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterUpdateRollNumberPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number>(0);
    const [showTable, setShowTable] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();

    const { data: masterClass, isLoading: preadmissionClassLoading, isError: preadmissionClassError } = useAdmissionClassDropdown();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterUpdateRollNumberSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            students: []
        },
        mode: 'onChange'
    });

    const { data: SectionData, isLoading: SectionLoading, isError: SectionError } = useMasterSectionHeld(classId);

    const {
        data: UpdateStudentRolesData,
        isLoading: UpdateStudentRolesLoading,
        isError: UpdateStudentRolesError,
        refetch: refetchStudents
    } = useMasterUpdateStudentRoles(academicYearId, classId, sectionId);

    const {
        data: StudentsData,
        isLoading: StudentsLoading,
        isError: StudentsError
    } = useMasterChangeSectionTable(searchParams, academicYearId, classId, sectionId);

    const modifiedStudentsData = React.useMemo(() => {
        if (!StudentsData?.data || !Array.isArray(StudentsData.data)) return StudentsData;

        return {
            ...StudentsData,
            data: StudentsData.data.map((item: any) => {
                const foundStudent = students.find((s) => s.student_id === item.student_id);
                if (foundStudent) {
                    return {
                        ...item,
                        // Override with the original roll numbers from the full list to prevent search from resetting it to row index
                        amaY_RollNo: foundStudent.amaY_RollNo ?? foundStudent.roll_no,
                        roll_no: foundStudent.roll_no ?? foundStudent.amaY_RollNo
                    };
                }
                return item;
            })
        };
    }, [StudentsData, students]);

    const tableProps = useDataTableProps(modifiedStudentsData);

    useEffect(() => {
        if (UpdateStudentRolesData?.data && Array.isArray(UpdateStudentRolesData.data)) {
            const studentsWithNewRollNo = UpdateStudentRolesData.data
                .map((student: Student) => ({
                    ...student,
                    new_roll_no: student.roll_no || student.amaY_RollNo
                }))
                .sort((a: Student, b: Student) => (a.roll_no || a.amaY_RollNo) - (b.roll_no || b.amaY_RollNo));
            setStudents(studentsWithNewRollNo);
            setShowTable(true);
        }
    }, [UpdateStudentRolesData]);

    useEffect(() => {
        if (students.length > 0) {
            const studentData = students
                .filter((student) => selectedStudents.has(student.asysT_Id))
                .map((student) => ({
                    asysT_Id: student.asysT_Id,
                    amsT_Id: student.student_id,
                    student_name: student.student_name,
                    new_roll_no: student.new_roll_no || student.roll_no || student.amaY_RollNo
                }));
            setValue('students', studentData, { shouldValidate: true });
        }
    }, [students, selectedStudents, setValue]);

    const handleAcademicYearChange = (value: string) => {
        const numValue = Number(value);
        setAcademicYearId(numValue);
        setValue('asmaY_Id', numValue);

        setShowTable(false);
        setClassId(0);
        setSectionId(0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setStudents([]);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            const allIds = new Set(students.map((s: Student) => s.asysT_Id));
            setSelectedStudents(allIds);
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleSelectStudent = (asysT_Id: number, checked: boolean) => {
        const newSelected = new Set(selectedStudents);
        if (checked) {
            newSelected.add(asysT_Id);
        } else {
            newSelected.delete(asysT_Id);
        }
        setSelectedStudents(newSelected);
        setSelectAll(newSelected.size === students.length);
    };

    const handleClassChange = (value: string) => {
        const numValue = Number(value);
        setClassId(numValue);
        setValue('asmcL_Id', numValue);

        setSectionId(0);
        setShowTable(false);
        setValue('asmS_Id', 0);
        setStudents([]);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    const handleSectionChange = (value: string) => {
        const numValue = Number(value);
        setSectionId(numValue);
        setValue('asmS_Id', numValue);

        // Refetch students data
        if (academicYearId && classId && numValue) {
            refetchStudents();
        }
    };

    const handleRollNumberChange = (index: number, value: string) => {
        const numValue = Number.parseInt(value) || 0;
        setStudents((prev) => {
            const newData = [...prev];
            newData[index] = { ...newData[index], new_roll_no: numValue };
            return newData;
        });
    };

    const onSubmit = async (data: FormFields) => {
        if (selectedStudents.size === 0) {
            toast.error('Please select at least one student');
            return;
        }

        try {
            const studentsRollUpdate = Array.from(selectedStudents).map((asysT_Id) => {
                const student = students.find((s: any) => s.asysT_Id === asysT_Id);
                return {
                    asysT_Id: asysT_Id,
                    amsT_Id: student?.student_id || 0,
                    student_name: student?.student_name || '',
                    new_roll_no: student?.new_roll_no || 0
                };
            });

            const payload = {
                asmaY_Id: data.asmaY_Id,
                asmcL_Id: data.asmcL_Id,
                asmS_Id: data.asmS_Id,
                students: studentsRollUpdate
            };

            const response = await updateRollNumbers(payload);
            if (response.success) {
                Swal.fire({
                    title: 'Success!',
                    text: response.message || 'Record Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    handleReset();
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.message || 'Not Saved',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (_error: any) {
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred while updating roll numbers',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleReset = () => {
        reset({
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            students: []
        });
        setAcademicYearId(0);
        setClassId(0);
        setSectionId(0);
        setShowTable(false);
        setStudents([]);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-4 p-4'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        title='Update Roll Number'
                        description='Select academic year, class, and section to update roll numbers'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmaY_Id'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
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
                                            </Select>
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
                                            <Select
                                                onValueChange={handleClassChange}
                                                value={field.value > 0 ? field.value.toString() : ''}
                                                disabled={!academicYearId}>
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
                                            </Select>
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
                                            <Select
                                                onValueChange={handleSectionChange}
                                                value={field.value > 0 ? field.value.toString() : ''}
                                                disabled={!classId}>
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
                                            </Select>
                                        )}
                                    />
                                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showTable && students.length === 0 && !UpdateStudentRolesLoading && !UpdateStudentRolesError && (
                        <div className='mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm'>
                            <p className='font-medium text-gray-500 text-lg'>No records found</p>
                            <p className='mt-1 text-gray-400 text-sm'>No students found for the selected criteria.</p>
                        </div>
                    )}

                    {showTable && students.length > 0 && (
                        <>
                            <CollapsibleSection
                                title='Student List'
                                description='Update roll numbers for selected students'
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <div className='space-y-4'>
                                    {UpdateStudentRolesLoading ? (
                                        <div className='flex items-center justify-center p-8'>
                                            <p className='text-gray-500'>Loading students...</p>
                                        </div>
                                    ) : UpdateStudentRolesError ? (
                                        <div className='flex items-center justify-center p-8'>
                                            <p className='text-red-500'>Error loading students</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className='overflow-x-auto rounded-lg border'>
                                                <table className='w-full'>
                                                    <thead className='border-b bg-gray-50'>
                                                        <tr>
                                                            <th className='p-3 text-left font-semibold text-sm'>SI. No</th>
                                                            <th className='w-12 p-3 text-left font-semibold'>
                                                                <Checkbox
                                                                    checked={selectAll}
                                                                    onCheckedChange={handleSelectAll}
                                                                    className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                                />
                                                            </th>
                                                            <th className='p-3 text-left font-semibold text-sm'>Student Name</th>
                                                            <th className='p-3 text-left font-semibold text-sm'>Class</th>
                                                            <th className='p-3 text-left font-semibold text-sm'>Section</th>
                                                            <th className='p-3 text-left font-semibold text-sm'>Adm. No</th>
                                                            <th className='p-3 text-left font-semibold text-sm'>Present Roll No</th>
                                                            <th className='p-3 text-left font-semibold text-sm'>
                                                                Roll No <span className='text-red-500'>*</span>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='divide-y'>
                                                        {students.map((student, index) => {
                                                            const isSelected = selectedStudents.has(student.asysT_Id);
                                                            return (
                                                                <tr
                                                                    key={student.asysT_Id}
                                                                    className={`transition-colors ${
                                                                        isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                                                                    }`}>
                                                                    <td className='p-3 text-sm'>{index + 1}</td>
                                                                    <td className='p-3'>
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={(checked) =>
                                                                                handleSelectStudent(student.asysT_Id, checked as boolean)
                                                                            }
                                                                            className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                                        />
                                                                    </td>
                                                                    <td className='p-3 font-medium text-sm'>{student.student_name}</td>
                                                                    <td className='p-3 text-sm'>
                                                                        {student.class_name || student.asmcL_ClassName}
                                                                    </td>
                                                                    <td className='p-3 text-sm'>
                                                                        {student.section_name || student.asmC_SectionName}
                                                                    </td>
                                                                    <td className='p-3 text-sm'>
                                                                        {student.admission_no || student.amsT_AdmNo}
                                                                    </td>
                                                                    <td className='p-3 text-sm'>
                                                                        {student.roll_no || student.amaY_RollNo}
                                                                    </td>
                                                                    <td className='p-3'>
                                                                        <Input
                                                                            type='number'
                                                                            value={student.new_roll_no || ''}
                                                                            onChange={(e) => handleRollNumberChange(index, e.target.value)}
                                                                            disabled={!isSelected}
                                                                            className='w-24'
                                                                            placeholder='Roll No'
                                                                            min='1'
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {errors.students && <FormError>{errors.students.message}</FormError>}

                                            {/* Action Buttons */}
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
                                                    onClick={handleFormSubmit}
                                                    disabled={isSubmitting || selectedStudents.size === 0}
                                                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                                    <div className='flex items-center'>
                                                        <Save className='mr-2 h-4 w-4' />
                                                        {isSubmitting ? 'Saving...' : 'Save'}
                                                    </div>
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection
                                title='Student Data Table'
                                description='View and manage student data'
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <div className='space-y-4'>
                                    <GenericDataTable<any>
                                        {...tableProps}
                                        columns={masterUpdateRollNumberColumns as any}
                                        isLoading={StudentsLoading}
                                        error={StudentsError as any}
                                        showViewOptions={false}
                                        loadingMessage='Loading Students...'
                                        noDataTitle='No Students Found'
                                        noDataDescription='Select a section to view students'
                                        errorTitle='Error Loading Students'
                                    />
                                </div>
                            </CollapsibleSection>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
