'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import AddStudentAdmissionForm from './_components/add-form';
import { collegeStudentColumns } from './_components/columns';
import { ColumnDef } from '@tanstack/react-table';

import { useCollegeAdmissionFormInitialData } from '@/hooks/college/useCollegeTransactions';

export default function CollegeAdmissionFormPage() {
    return (
        <FormProvider>
            <CollegeAdmissionPageContent />
        </FormProvider>
    );
}

function CollegeAdmissionPageContent() {
    const { openAddForm } = useFormContext();
    const { data: response, isLoading, refetchAll } = useCollegeAdmissionFormInitialData();

    const initialData = response?.data || {};
    const studentList = response?.data?.studentList || [];

    const tableProps = useDataTableProps({ data: studentList, total: studentList.length });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-1'>
                        <h1 className="text-2xl font-bold tracking-tight">College Student Admission Form</h1>
                        <p className="text-sm text-muted-foreground">Manage and enroll new students.</p>
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add College Admission Form
                    </Button>
                </div>

                {/* Forms */}
                <FormSections initialData={initialData} refetch={refetchAll} />

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='[&_table_tbody_tr:nth-child(even)]:!bg-primary/5 [&_table_tbody_tr[data-state=selected]]:!bg-purple-100 [&_table_tbody_tr:hover]:!bg-purple-200 [&_table_tbody_tr:hover_td]:!bg-purple-200 [&_table_tbody_tr]:cursor-pointer [&_table_tbody_tr]:transition-colors'>
                        <GenericDataTable<any>
                            {...tableProps}
                            columns={collegeStudentColumns as ColumnDef<any>[]}
                            isLoading={isLoading}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading applications...'
                            noDataTitle='No Applications Found'
                            noDataDescription='Get started by creating your first application'
                            errorTitle='Error Loading Applications'
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}

function FormSections({ initialData, refetch }: { initialData: any, refetch: () => void }) {
    const { isAddFormOpen, closeAddForm, addFormRef, isEditFormOpen, closeEditForm, editFormRef, selectedRow } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Admission Application'
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
                                <X className='h-4 w-4 text-destructive mr-1' /> Close
                            </Button>
                            <AddStudentAdmissionForm
                                initialData={initialData}
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
                                }}
                                onClose={closeAddForm}
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
                                <X className='h-4 w-4 text-destructive mr-1' /> Close
                            </Button>
                            {/* Placeholder for Update Form, reusing Add for now */}
                            <AddStudentAdmissionForm
                                initialData={{ ...initialData, ...selectedRow }}
                                onSuccess={() => {
                                    closeEditForm();
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
