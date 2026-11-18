'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterCategory } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgMasterCategory } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddClgMasterCategoryForm from './_components/add-form';
import { getColumns } from './_components/columns';
import ToggleClgMasterCategoryForm from './_components/toggle-form';
import UpdateClgMasterCategoryForm from './_components/update-form';

export default function ClgMasterCategoryPage() {
    const { data: response, isLoading, error } = useClgMasterCategory();

    return (
        <FormProvider<IClgMasterCategory>>
            <ClgMasterCategoryPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ClgMasterCategoryPageContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IClgMasterCategory>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data) ? response.data : (response?.masterCategoryList || []);

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IClgMasterCategory) =>
            item.amcoC_Name?.toLowerCase().includes(query) ||
            item.amcoC_Address?.toLowerCase().includes(query) ||
            item.amcoC_Details?.toLowerCase().includes(query) ||
            item.amcoC_Type?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <div className='flex justify-end gap-2'>
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' /> Add Category
                    </Button>
                </div>

                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClgMasterCategory>
                        {...tableProps}
                        columns={getColumns()}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading categories...'
                        noDataTitle='No Categories Found'
                        noDataDescription='Get started by creating your first category'
                        errorTitle='Error Loading Categories'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgMasterCategory>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Category' description='Fill in the details below' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddClgMasterCategoryForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Category' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateClgMasterCategoryForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleClgMasterCategoryForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
