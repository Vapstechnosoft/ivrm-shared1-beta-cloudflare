'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgMasterCombination } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddCombinationForm from './Combination/add-form';
import { combinationColumns } from './Combination/columns';
import ToggleCombinationForm from './Combination/toggle-form';

interface CombinationTabProps {
    data: any;
    isLoading: boolean;
    error: any;
}

export default function CombinationTab({ data, isLoading, error }: CombinationTabProps) {
    return (
        <FormProvider<IClgMasterCombination>>
            <CombinationTabContent response={data} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CombinationTabContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IClgMasterCombination>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data?.getdetails) ? response.data.getdetails : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IClgMasterCombination) =>
            item.admcB_NAME?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' /> Add Combination
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IClgMasterCombination>
                    {...tableProps}
                    columns={combinationColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading combinations...'
                    noDataTitle='No Combinations Found'
                    noDataDescription='Get started by creating your first combination'
                    errorTitle='Error Loading Combinations'
                />
            </CollapsibleSection>

            <FormSections />
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgMasterCombination>();

    return (
        <>
            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isEditFormOpen ? editFormRef : addFormRef}>
                    <CollapsibleSection title={isEditFormOpen ? 'Edit Combination' : 'Add New Combination'} defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={isEditFormOpen ? closeEditForm : closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddCombinationForm selectedRow={isEditFormOpen ? selectedRow! : undefined} onSuccess={isEditFormOpen ? closeEditForm : closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleCombinationForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
