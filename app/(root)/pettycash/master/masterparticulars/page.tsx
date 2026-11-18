'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterParticulars } from '@/hooks/pettycash/master/useMasters';
import type { IMasterParticulars } from '@/types/pettycash/master/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddMasterParticularsForm from './_components/add-form';
import { masterParticularsColumns } from './_components/columns';
import ToggleMasterParticularsForm from './_components/toggle-form';
import UpdateMasterParticularsForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterParticularsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetch } = useMasterParticulars(searchParams);

    return (
        <FormProvider<IMasterParticulars>>
            <MasterParticularsPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function MasterParticularsPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterParticulars>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'></div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Particular
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterParticulars>
                        {...tableProps}
                        columns={masterParticularsColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master particulars...'
                        noDataTitle='No Particulars Found'
                        noDataDescription='Start by adding a new particular.'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterParticulars>();

    // Success handler that refetches data
    const handleSuccess = () => {
        refetch();
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Particular'
                        description='Fill in the details below to create a new particular'
                        defaultOpen
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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddMasterParticularsForm
                                onSuccess={() => {
                                    handleSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterParticularsForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        handleSuccess();
                        closeToggleForm();
                    }}
                />
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Particular'
                        description='Update the details of the selected particular'
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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateMasterParticularsForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    handleSuccess();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
