'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterBatch } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgMasterBatch } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddClgMasterBatchForm from './_components/add-form';
import { clgMasterBatchColumns } from './_components/columns';
import ToggleClgMasterBatchForm from './_components/toggle-form';
import UpdateClgMasterBatchForm from './_components/update-form';

export default function ClgMasterBatchPage() {
    const { data: response, isLoading, error } = useClgMasterBatch();

    return (
        <FormProvider<IClgMasterBatch>>
            <ClgMasterBatchPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ClgMasterBatchPageContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IClgMasterBatch>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data) ? response.data : (response?.data?.batchlist || response?.data?.list || []);

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IClgMasterBatch) =>
            item.acmsN_SessionName?.toLowerCase().includes(query) ||
            String(item.acmnS_Order ?? '').toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' /> Add Batch
                    </Button>
                </div>

                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClgMasterBatch>
                        {...tableProps}
                        columns={clgMasterBatchColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading batches...'
                        noDataTitle='No Batches Found'
                        noDataDescription='Get started by creating your first batch'
                        errorTitle='Error Loading Batches'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgMasterBatch>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Batch' description='Fill in the details below' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddClgMasterBatchForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Batch' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateClgMasterBatchForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleClgMasterBatchForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
