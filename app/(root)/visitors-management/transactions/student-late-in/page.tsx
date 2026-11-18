'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentLateIn } from '@/hooks/visitors-management/transactions/useStudentLateIn';
import type { StudentLateInData } from '@/types/visitors-management/transactions';
import { Plus, X } from 'lucide-react';
import { studentLateInColumns } from './_components/columns';
import StudentLateInForm from './_components/student-late-in-form';

export default function StudentLateInPage() {
    const { data, isLoading, error, refetch } = useStudentLateIn();
    const listData = data?.getstudentlist || [];
    const academicYears = data?.academicYear || [];

    return (
        <FormProvider<StudentLateInData>>
            <StudentLateInPageContent
                listData={listData}
                academicYears={academicYears}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
            />
        </FormProvider>
    );
}

function StudentLateInPageContent({
    listData,
    academicYears,
    isLoading,
    error,
    refetch
}: {
    listData: StudentLateInData[];
    academicYears: any[];
    isLoading: boolean;
    error: any;
    refetch: any;
}) {
    const { openAddForm, isAddFormOpen, closeAddForm, addFormRef } = useFormContext<StudentLateInData>();
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
                        Add Late In Entry
                    </Button>
                </div>

                {/* Grid Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    title='Student Late In Details'>
                    <GenericDataTable<StudentLateInData>
                        {...tableProps}
                        columns={studentLateInColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Late In Records...'
                        noDataTitle='No Records Found'
                        noDataDescription='Get started by adding a new late entry'
                        errorTitle='Error Loading Records'
                    />
                </CollapsibleSection>

                {/* Form Section */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Student Late In Form'
                            description='Fill in the details below to add a new late in record'
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
                                <StudentLateInForm
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
