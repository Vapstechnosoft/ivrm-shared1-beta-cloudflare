'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterHead, usePDADropdownData } from '@/hooks/pda/master/useMasterHead';
import type { IPDAMasterHead } from '@/types/pda/master/master-head';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddPDAMasterHeadForm from './_components/add-form';
import { pdaMasterHeadColumns } from './_components/columns';
import TogglePDAMasterHeadForm from './_components/toggle-form';
import UpdatePDAMasterHeadForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function PDAMasterHeadPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useMasterHead(searchParams);
    const { refetchAll: refetchDropdowns } = usePDADropdownData();

    return (
        <FormProvider<IPDAMasterHead>>
            <PDAMasterHeadPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetch={() => {
                    refetchAll();
                    refetchDropdowns();
                }}
            />
        </FormProvider>
    );
}

function PDAMasterHeadPageContent({
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
    const { openAddForm } = useFormContext<IPDAMasterHead>();
    const { data: feeHeadsResponse } = usePDADropdownData();
    const feeHeads = feeHeadsResponse?.data?.headdata || [];
    const tableProps = useDataTableProps({
        ...response,
        data: response?.data?.pdadata || []
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        {/* <h2 className='text-2xl font-bold tracking-tight'>PDA Master Head</h2>
                        <p className='text-muted-foreground'>Manage expenditure heads and their mappings.</p> */}
                    </div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Master Head
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='PDA Master Head GridView'
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IPDAMasterHead>
                        {...tableProps}
                        columns={pdaMasterHeadColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master heads...'
                        noDataTitle='No Master Heads Found'
                        noDataDescription='Start by adding a new expenditure head.'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetch={refetch} feeHeads={feeHeads} />
            </div>
        </div>
    );
}

function FormSections({ refetch, feeHeads }: { refetch: () => void; feeHeads: any[] }) {
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
    } = useFormContext<IPDAMasterHead>();

    const handleSuccess = () => {
        refetch();
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add PDA Master Head'
                        description='Fill in the details below to create a new expenditure head'
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
                            <AddPDAMasterHeadForm
                                feeHeads={feeHeads}
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
                <TogglePDAMasterHeadForm
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
                        title='Edit PDA Master Head'
                        description='Update the details of the selected expenditure head'
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
                            <UpdatePDAMasterHeadForm
                                selectedRow={selectedRow}
                                feeHeads={feeHeads}
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
