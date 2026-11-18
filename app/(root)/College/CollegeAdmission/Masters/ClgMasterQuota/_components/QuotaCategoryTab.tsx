'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IMasterQuotaCategory } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddQuotaCategoryForm from './QuotaCategory/add-form';
import { quotaCategoryColumns } from './QuotaCategory/columns';
import ToggleQuotaCategoryForm from './QuotaCategory/toggle-form';
import UpdateQuotaCategoryForm from './QuotaCategory/update-form';

interface QuotaCategoryTabProps {
    data: any;
    isLoading: boolean;
    error: any;
}

export default function QuotaCategoryTab({ data, isLoading, error }: QuotaCategoryTabProps) {
    return (
        <FormProvider<IMasterQuotaCategory>>
            <QuotaCategoryTabContent response={data} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function QuotaCategoryTabContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IMasterQuotaCategory>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data?.getdetails1) ? response.data.getdetails1 : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IMasterQuotaCategory) =>
            item.acqC_CategoryName?.toLowerCase().includes(query) ||
            item.acqC_CategoryCode?.toLowerCase().includes(query) ||
            item.acqC_CategoryInfo?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' /> Add Quota Category
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IMasterQuotaCategory>
                    {...tableProps}
                    columns={quotaCategoryColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading categories...'
                    noDataTitle='No Quota Categories Found'
                    noDataDescription='Get started by creating your first category'
                    errorTitle='Error Loading Categories'
                />
            </CollapsibleSection>

            <FormSections />
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IMasterQuotaCategory>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Quota Category' description='Fill in the details below' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddQuotaCategoryForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Quota Category' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateQuotaCategoryForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleQuotaCategoryForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
