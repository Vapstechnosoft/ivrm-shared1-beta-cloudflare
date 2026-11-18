'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IMasterQuota } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddMasterQuotaForm from './MasterQuota/add-form';
import { masterQuotaColumns } from './MasterQuota/columns';
import ToggleMasterQuotaForm from './MasterQuota/toggle-form';
import UpdateMasterQuotaForm from './MasterQuota/update-form';

interface MasterQuotaTabProps {
    data: any;
    isLoading: boolean;
    error: any;
}

export default function MasterQuotaTab({ data, isLoading, error }: MasterQuotaTabProps) {
    return (
        <FormProvider<IMasterQuota>>
            <MasterQuotaTabContent response={data} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterQuotaTabContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IMasterQuota>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data?.getdetails) ? response.data.getdetails : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IMasterQuota) =>
            item.acQ_QuotaName?.toLowerCase().includes(query) ||
            item.acQ_QuotaCode?.toLowerCase().includes(query) ||
            item.acQ_QuotaInfo?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' /> Add Quota
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IMasterQuota>
                    {...tableProps}
                    columns={masterQuotaColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading quotas...'
                    noDataTitle='No Quotas Found'
                    noDataDescription='Get started by creating your first quota'
                    errorTitle='Error Loading Quotas'
                />
            </CollapsibleSection>

            <FormSections />
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IMasterQuota>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Quota' description='Fill in the details below' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddMasterQuotaForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Quota' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateMasterQuotaForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterQuotaForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
