'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { usePcIndent } from '@/hooks/pettycash/transaction/pcIndent';
import type { IIndentFilters, IPcIndent } from '@/types/pettycash/transaction/pcIndent';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import AddPcIndentForm from './components/add-form';
// import FilterForm from './components/filter-form';
import { pcIndentColumns } from './components/column';
import TogglePcIndentForm from './components/toggle';

export default function PcIndentPage() {
    const [filters, setFilters] = useState<IIndentFilters | null>(null);
    const { data: response, isLoading, error, refetch } = usePcIndent(filters!, !!filters);

    return (
        <FormProvider<IPcIndent>>
            <PcIndentPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} onSearch={setFilters} />
        </FormProvider>
    );
}

function PcIndentPageContent({
    response,
    isLoading,
    error,
    refetch,
    onSearch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    onSearch: (filters: IIndentFilters) => void;
}) {
    const { openAddForm } = useFormContext<IPcIndent>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen pb-10'>
            <div className='container space-y-6 pt-4'>
                {/* Page Title & Add Button */}
                <div className='flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <h1 className='font-bold text-3xl text-primary tracking-tight'>Indent</h1>
                        <p className='text-muted-foreground'>Manage and track petty cash indents</p>
                    </div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit px-6 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-5 w-5' />
                        Add Indent
                    </Button>
                </div>

                {/* Data Table Section */}
                <div className='space-y-2'>
                    <CollapsibleSection
                        defaultOpen
                        variant='default'
                        size='lg'
                        className='border-none p-0 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<IPcIndent>
                            {...tableProps}
                            columns={pcIndentColumns}
                            isLoading={isLoading}
                            error={error}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading indents...'
                            noDataTitle='No Indents Found'
                            noDataDescription='Try adjusting your filters or add a new indent.'
                            errorTitle='Error Loading Data'
                        />
                    </CollapsibleSection>
                </div>

                {/* Forms Section (Add/Edit/Toggle) */}
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
    } = useFormContext<IPcIndent>();

    const handleSuccess = () => {
        refetch();
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef} className='fade-in slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title='Add New Indent'
                        description='Fill in the details below to create a new petty cash indent'
                        defaultOpen
                        variant='outline'
                        size='md'
                        className='border-primary/20 shadow-xl'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-12 absolute right-0 flex items-center text-destructive hover:bg-destructive/10'></Button>

                            <AddPcIndentForm
                                onSuccess={() => {
                                    handleSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef} className='fade-in slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title='Edit Indent'
                        description='Update the details for the selected indent'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='border-primary/20 shadow-xl'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-12 absolute right-0 flex items-center text-destructive hover:bg-destructive/10'>
                                <X className='mr-1 h-4 w-4' />
                            </Button>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Status Dialog */}
            {isToggleFormOpen && selectedRow && (
                <TogglePcIndentForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        handleSuccess();
                        closeToggleForm();
                    }}
                />
            )}
        </>
    );
}
