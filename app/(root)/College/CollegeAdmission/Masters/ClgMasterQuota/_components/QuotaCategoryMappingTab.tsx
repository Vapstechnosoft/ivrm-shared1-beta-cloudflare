'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IMasterQuota, IMasterQuotaCategory, IMasterQuotaCategoryMapping } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddQuotaCategoryMappingForm from './QuotaCategoryMapping/add-form';
import { quotaCategoryMappingColumns } from './QuotaCategoryMapping/columns';
import ToggleQuotaCategoryMappingForm from './QuotaCategoryMapping/toggle-form';

interface QuotaCategoryMappingTabProps {
    data: any;
    isLoading: boolean;
    error: any;
}

export default function QuotaCategoryMappingTab({ data, isLoading, error }: QuotaCategoryMappingTabProps) {
    return (
        <FormProvider<IMasterQuotaCategoryMapping>>
            <QuotaCategoryMappingTabContent response={data} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function QuotaCategoryMappingTabContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IMasterQuotaCategoryMapping>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data?.getdetails2) ? response.data.getdetails2 : [];
    const quotas: IMasterQuota[] = Array.isArray(response?.data?.getdetails) ? response.data.getdetails.filter((q: IMasterQuota) => q.acQ_ActiveFlg) : [];
    const categories: IMasterQuotaCategory[] = Array.isArray(response?.data?.getdetails1) ? response.data.getdetails1.filter((c: IMasterQuotaCategory) => c.acqC_ActiveFlg) : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IMasterQuotaCategoryMapping) =>
            item.acQ_QuotaName?.toLowerCase().includes(query) ||
            item.acqC_CategoryName?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' /> Add Mapping
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IMasterQuotaCategoryMapping>
                    {...tableProps}
                    columns={quotaCategoryMappingColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading mappings...'
                    noDataTitle='No Quota Category Mappings Found'
                    noDataDescription='Get started by creating your first mapping'
                    errorTitle='Error Loading Mappings'
                />
            </CollapsibleSection>

            <FormSections quotas={quotas} categories={categories} />
        </div>
    );
}

function FormSections({ quotas, categories }: { quotas: IMasterQuota[], categories: IMasterQuotaCategory[] }) {
    const { isAddFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeToggleForm, addFormRef } = useFormContext<IMasterQuotaCategoryMapping>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Mapping' description='Map categories to a quota' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddQuotaCategoryMappingForm quotas={quotas} categories={categories} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleQuotaCategoryMappingForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
