'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterConfiguration } from '@/hooks/preconfiguration/useMasterConfiguration';
import type { IMasterConfiguration } from '@/types/preconfiguration/master-configuration';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddMasterConfigurationForm from './_components/add-form';
import { masterConfigurationColumns } from './_components/columns';
import UpdateMasterConfigurationForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterConfigurationPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useMasterConfiguration();

    return (
        <FormProvider<IMasterConfiguration>>
            <MasterConfigurationPageContent response={response} isLoading={isLoading} error={error} onRefresh={refetchAll} />
        </FormProvider>
    );
}

function MasterConfigurationPageContent({
    response,
    isLoading,
    error,
    onRefresh
}: {
    response: any;
    isLoading: boolean;
    error: any;
    onRefresh: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterConfiguration>();

    // Default the data to the grid list from the response
    const tableProps = useDataTableProps({
        ...response,
        data: response?.masterConfigList || []
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Master Configuration
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterConfiguration>
                        {...tableProps}
                        columns={masterConfigurationColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master configuration...'
                        noDataTitle='No Master Configuration Found'
                        noDataDescription='Get started by creating your first master configuration'
                        errorTitle='Error Loading Master Configuration'
                        manualPagination={false}
                        manualSorting={false}
                        manualFiltering={false}
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections response={response} onRefresh={onRefresh} />
            </div>
        </div>
    );
}

function FormSections({ response, onRefresh }: { response: any; onRefresh: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IMasterConfiguration>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add General Settings'
                        description='Fill in the details below to create new settings'
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
                                <X className='mr-1 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddMasterConfigurationForm
                                response={response}
                                onSuccess={() => {
                                    closeAddForm();
                                    onRefresh();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit General Settings'
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
                                <X className='mr-1 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateMasterConfigurationForm
                                selectedRow={selectedRow}
                                response={response}
                                onSuccess={() => {
                                    closeEditForm();
                                    onRefresh();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
