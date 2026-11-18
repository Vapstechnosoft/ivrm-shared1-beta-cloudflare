'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useExamTTTransSettings } from '@/hooks/exam/exammodule/exam-mapping';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddExamTTTransSettingsForm from './_components/add-form';
import { ExamTTTransSettingsColumns } from './_components/columns';
import ExamTTTransSettingsViewDetails from './_components/view-details';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ExamTTTransSettingsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useExamTTTransSettings(searchParams);

    return (
        <FormProvider<IExamTTTransSettings>>
            <ExamTTTransSettingsPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ExamTTTransSettingsPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IExamTTTransSettings>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Exam TT Settings
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IExamTTTransSettings>
                        {...tableProps}
                        columns={ExamTTTransSettingsColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading exam TT settings...'
                        noDataTitle='No Exam TT Settings Found'
                        noDataDescription='Get started by creating your first exam time table setting'
                        errorTitle='Error Loading Exam TT Settings'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDetailsViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext<IExamTTTransSettings>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Exam Time Table Setting'
                        description='Fill in the details to create a new exam time table setting'
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
                            <AddExamTTTransSettingsForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Exam Time Table Setting'
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
                            <AddExamTTTransSettingsForm editData={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* View Details */}
            {isDetailsViewOpen && selectedRow && <ExamTTTransSettingsViewDetails rowData={selectedRow} onClose={closeDetailsView} />}
        </>
    );
}
