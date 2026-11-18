'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IadmissionStudentApplicationList } from '@/types/admission/admission';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useQueryState } from 'nuqs';
import React, { useEffect, useState } from 'react';
import AddStudentAdmissionForm from './_components/add-form';
import { studentApplicationColumns } from './_components/columns';
import ApplicationFormSuccessDialog from './_components/success-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentApplicationPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    // const { data: activePreadmission } = useGetAllAdmissionLists();
    const { data: academicYearData, isLoading: loadingYears } = useFeeDefaulterReport();
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const { data: response, isLoading, error, refetch } = useGetAllAdmissionLists(Number(selectedAsmayId),searchParams);
    const { data: masterConfig } = useAcademicYearMasterConfiguration(0);
    useEffect(() => {
        if (!loadingYears && academicYearData?.data && academicYearData.data.length > 0) {
            const firstId = academicYearData.data[0].asmaY_Id;
            if (selectedAsmayId && academicYearData?.data) {
                const selectedItem = academicYearData.data.find((item) => item.asmaY_Id === selectedAsmayId);
                if (selectedItem) {
                    setSelectedAcademicYear(selectedItem.asmaY_Year);
                }
            }
            setSelectedAsmayId((prev) => prev ?? firstId);
        }
    }, [loadingYears, academicYearData]);
    return (
        <FormProvider<IadmissionStudentApplicationList>>
            <StudentApplicationPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
                masterConfig={masterConfig}
                selectedAsmayId={selectedAsmayId}
                setSelectedAsmayId={setSelectedAsmayId}
                setSelectedAcademicYear={setSelectedAcademicYear}
                academicYearData={academicYearData}
                loadingYears={loadingYears}
                selectedasmayYear={selectedAcademicYear}
            />
        </FormProvider>
    );
}

function StudentApplicationPageContent({
    response,
    isLoading,
    error,
    refetch,
    selectedAsmayId,
    selectedasmayYear,
    setSelectedAsmayId,
    setSelectedAcademicYear,
    loadingYears,
    academicYearData
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    masterConfig: any;
        selectedasmayYear: string;
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    setSelectedAcademicYear: (year: string) => void;
    loadingYears: boolean;
    academicYearData: any;
}) {
    const { openAddForm } = useFormContext();
    const tableProps = useDataTableProps(
        response?.data && response.data.studentList ? { ...response, data: response.data.studentList } : response
    );
    const [isSuccessOpen, setSuccessOpen] = useState(false);
    const [successType, setSuccessType] = useState<'create' | 'update'>('create');
    const session = useSession();

    useEffect(() => { }, [session?.data?.role]);

    useEffect(() => {
        const handler = () => refetch();
        window.addEventListener('admission:changed', handler as EventListener);
        return () => window.removeEventListener('admission:changed', handler as EventListener);
    }, [refetch]);

    const onCloseSuccessDialog = () => {
        setSuccessOpen(false);
        refetch();
    };
    const [selectedYear, setSelectedYear] = useQueryState('asmay_id', { defaultValue: '' });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-6 rounded-lg border bg-white px-5 py-4 shadow-sm'>
                        <Label className='whitespace-nowrap text-right'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            value={selectedAsmayId?.toString() || ''}
                            onValueChange={(v) => {
                                setSelectedAsmayId(Number(v));
                                const selectedItem = academicYearData?.data?.find(
                                    (item: IFeeAcademicYearDropdownList) => item.asmaY_Id === Number(v)
                                );
                                setSelectedAcademicYear(selectedItem.asmaY_Year);
                            }}
                            disabled={loadingYears}>
                            <SelectTrigger className='w-64'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>

                            <SelectContent>
                                {academicYearData?.data?.map((item: any) => (
                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                        {item.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add New Admission Form
                    </Button>
                </div>
                {isSuccessOpen && (
                    <ApplicationFormSuccessDialog
                        isOpen={isSuccessOpen}
                        title={successType === 'update' ? 'Application Updated Successfully' : 'Application Submitted Successfully'}
                        message={successType === 'update' ? 'Application updated successfully' : 'Successfully submitted application form'}
                        onClose={() => {
                            onCloseSuccessDialog();
                            refetch();
                        }}
                    />
                )}
                {/* Forms */}
                <FormSections
                    setSuccess={(type: 'create' | 'update') => {
                        setSuccessType(type);
                        setSuccessOpen(true);
                    }}
                    refetch={refetch}
                />
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='[&_table_tbody_tr:nth-child(even)]:!bg-primary/5 [&_table_tbody_tr[data-state=selected]]:!bg-purple-100 [&_table_tbody_tr:hover]:!bg-purple-200 [&_table_tbody_tr:hover_td]:!bg-purple-200 [&_table_tbody_tr]:cursor-pointer [&_table_tbody_tr]:transition-colors'>
                        <GenericDataTable<IadmissionStudentApplicationList>
                            {...tableProps}
                            columns={studentApplicationColumns as ColumnDef<IadmissionStudentApplicationList>[]}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading applications...'
                            noDataTitle='No Applications Found'
                            noDataDescription='Get started by creating your first applications'
                            errorTitle='Error Loading Applications'
                            manualFiltering={false}
                            manualPagination={true}
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}

import { useGetAllAdmissionLists } from '@/hooks/admission/admissionForm';
import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
import UpdateStudentAdmissionForm from './_components/update-form';
import { useFeeDefaulterReport } from '@/hooks/fees/useReports';
import { Label } from '@/components/ui/label';
import { IFeeAcademicYearDropdownList } from '@/types/fees/reports/reports';

function FormSections({
    setSuccess,
    refetch
}: {
    setSuccess: (type: 'create' | 'update') => void;
    refetch: () => void;
}) {
    const { isAddFormOpen, closeAddForm, addFormRef, isEditFormOpen, closeEditForm, editFormRef, selectedRow } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Admission Form'
                        description='Fill in the details below to create a new admission application'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddStudentAdmissionForm
                                onSuccess={() => {
                                    closeAddForm();
                                    setSuccess('create');
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Admission Application'
                        description='Update the details below to edit the Admission application'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateStudentAdmissionForm
                                rowData={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    setSuccess('update');
                                    refetch();
                                }}
                                onClose={closeEditForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
