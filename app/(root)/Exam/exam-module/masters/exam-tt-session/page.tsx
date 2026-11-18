'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useExamTTSession } from '@/hooks/exam/exammodule/exam-mapping';
import type { IExamTTSession } from '@/types/exam/exam-module/exam-mapping';
import { Plus, X } from 'lucide-react';
import { use, useEffect } from 'react';
import AddExamTTSessionForm from './_components/add-form';
import { ExamTTSessionColumns } from './_components/columns';
import ToggleExamTTSessionForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ExamTTSessionPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useExamTTSession(searchParams);

    return (
        <FormProvider<IExamTTSession>>
            <ExamTTSessionPageContent data={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ExamTTSessionPageContent({
    data,
    isLoading,
    error
}: {
    data: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IExamTTSession>();
    const tableProps = useDataTableProps(data);
    useEffect(() => {
        console.log('data', data);
    }, [data]);
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Exam TT Session
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IExamTTSession>
                        {...tableProps}
                        columns={ExamTTSessionColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Exam TT Sessions...'
                        noDataTitle='No Exam TT Sessions Found'
                        noDataDescription='Get started by creating your first session'
                        errorTitle='Error Loading Exam TT Sessions'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef,
        selectedRow
    } = useFormContext<IExamTTSession>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Exam TT Session'
                        description='Fill in the details below to create a new session'
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
                            <AddExamTTSessionForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Exam TT Session'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddExamTTSessionForm rowData={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleExamTTSessionForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
