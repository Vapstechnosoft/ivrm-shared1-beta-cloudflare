'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterBranch } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgMasterBranch } from '@/types/college/masters';
import { Plus, X, ArrowDownUp } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import AddClgMasterBranchForm from './_components/add-form';
import { clgMasterBranchColumns } from './_components/columns';
import ToggleClgMasterBranchForm from './_components/toggle-form';
import UpdateClgMasterBranchForm from './_components/update-form';
import OrderClgMasterBranchForm from './_components/order-form';

export default function ClgMasterBranchPage() {
    const { data: response, isLoading, error } = useClgMasterBranch();

    return (
        <FormProvider<IClgMasterBranch>>
            <ClgMasterBranchPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ClgMasterBranchPageContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IClgMasterBranch>();
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

    const dataList = Array.isArray(response?.data) ? response.data : (response?.data?.getdetails || response?.data?.list || []);

    const filteredData = useMemo(() => {
        const sortedData = [...dataList].sort((a, b) => {
            const orderA = Number(a.amB_Order) || 0;
            const orderB = Number(b.amB_Order) || 0;
            return orderA - orderB;
        });

        if (!searchQuery) return sortedData;

        const query = searchQuery.toLowerCase();
        return sortedData.filter((item: IClgMasterBranch) =>
            item.amB_BranchName?.toLowerCase().includes(query) ||
            item.amB_BranchCode?.toLowerCase().includes(query) ||
            item.amB_BranchInfo?.toLowerCase().includes(query) ||
            item.amB_BranchType?.toLowerCase().includes(query) ||
            item.amB_AidedUnAided?.toLowerCase().includes(query) ||
            String(item.amB_StudentCapacity ?? '').toLowerCase().includes(query) ||
            String(item.amB_Order ?? '').toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const tableProps = useDataTableProps({ 
        ...response, 
        data: paginatedData,
        total: filteredData.length 
    });

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <div className='flex justify-end gap-2'>
                    <Button type='button' onClick={() => setIsOrderFormOpen(true)} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg' variant='outline'>
                        <ArrowDownUp className='h-4 w-4 mr-2' /> Set Order
                    </Button>
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' /> Add Branch
                    </Button>
                </div>

                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClgMasterBranch>
                        {...tableProps}
                        columns={clgMasterBranchColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading branches...'
                        noDataTitle='No Branches Found'
                        noDataDescription='Get started by creating your first branch'
                        errorTitle='Error Loading Branches'
                    />
                </CollapsibleSection>

                <FormSections />
                
                {isOrderFormOpen && (
                    <OrderClgMasterBranchForm data={dataList} onClose={() => setIsOrderFormOpen(false)} />
                )}
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgMasterBranch>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Branch' description='Fill in the details below' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddClgMasterBranchForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Branch' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateClgMasterBranchForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleClgMasterBranchForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
