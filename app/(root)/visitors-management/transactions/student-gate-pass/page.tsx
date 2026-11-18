'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentGatePass } from '@/hooks/visitors-management/transactions/useStudentGatePass';
import type { StudentGatePassData } from '@/types/visitors-management/transactions';
import { Plus, X } from 'lucide-react';
import { studentGatePassColumns } from './_components/columns';
import StudentGatePassForm from './_components/student-gate-pass-form';

export default function StudentGatePassPage() {
    const { data, isLoading, error, refetch } = useStudentGatePass();
    const listData = data?.alldata || [];
    const academicYears = data?.yearlist || [];

    return (
        <FormProvider<StudentGatePassData>>
            <StudentGatePassPageContent
                listData={listData}
                academicYears={academicYears}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
            />
        </FormProvider>
    );
}

function StudentGatePassPageContent({
    listData,
    academicYears,
    isLoading,
    error,
    refetch
}: {
    listData: StudentGatePassData[];
    academicYears: any[];
    isLoading: boolean;
    error: any;
    refetch: any;
}) {
    const { openAddForm, isAddFormOpen, closeAddForm, addFormRef } = useFormContext<StudentGatePassData>();
    const tableProps = useDataTableProps(listData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header Actions */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Generate Gate Pass
                    </Button>
                </div>

                {/* Grid Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    title='Student Gate Pass List'>
                    <GenericDataTable<StudentGatePassData>
                        {...tableProps}
                        columns={studentGatePassColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Gate Passes...'
                        noDataTitle='No Gate Passes Found'
                        noDataDescription='Get started by generating a new gate pass'
                        errorTitle='Error Loading Records'
                    />
                </CollapsibleSection>

                {/* Form Section */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Student Gate Pass Form'
                            description='Generate an out pass for students'
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
                                <StudentGatePassForm
                                    academicYears={academicYears}
                                    onSuccess={() => {
                                        closeAddForm();
                                        refetch();
                                    }}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
