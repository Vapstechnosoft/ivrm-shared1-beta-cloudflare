'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useInvStock } from '@/hooks/inventory/transactions/use-inv-stock';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { InvStock } from '@/types/inventory/transactions/inv-stock';
import { Layers, Pencil, Plus, PlusCircle, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { use } from 'react';
import AddStockForm from './_components/add-form';
import { invStockColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvStockPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    // Pagination & Search State synced with URL
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortColumn] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortDirection] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsString.withOptions({ shallow: false }).withDefault('asc')
    );
    const [searchColumns] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const queryParams = {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery,
        search_columns: searchColumns,
        sort_column: sortColumn,
        sort_direction: sortDirection
    };

    const { data: response, isLoading, error } = useInvStock(queryParams);

    return (
        <FormProvider<InvStock>>
            <InvStockPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function InvStockPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm, selectedRow, isAddFormOpen, isEditFormOpen, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<InvStock>();

    const tableProps = useDataTableProps(response, {
        dataKey: 'data',
        totalKey: 'total'
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading title='Stock Updation' description='Manage and update inventory stock levels across stores' />
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Stock Entry
                    </Button>
                </div>

                <CollapsibleSection
                    title='Stock Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'
                    icon={<Layers className='h-5 w-5' />}>
                    <GenericDataTable<InvStock>
                        {...tableProps}
                        data={response?.data || []}
                        columns={invStockColumns}
                        isLoading={isLoading}
                        error={error}
                        isSearchRequired={true}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Retrieving stock records...'
                        noDataTitle='No Stock Records'
                        noDataDescription='Try adjusting your filters or create a new stock entry.'
                    />
                </CollapsibleSection>

                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='New Stock Updation'
                            description='Enter the stock details'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 mb-6 animate-in shadow-md duration-300'
                            icon={<PlusCircle className='h-5 w-5' />}>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeAddForm}
                                    variant='ghost'
                                    size='sm'
                                    className='absolute top-[-3.5rem] right-12 w-fit border p-2 text-destructive shadow-md hover:bg-destructive/10'>
                                    <X className='mr-1 h-4 w-4' /> Close
                                </Button>
                                <AddStockForm onSuccess={closeAddForm} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef}>
                        <CollapsibleSection
                            title={`Edit Stock Entry: ${selectedRow.invstO_BatchNo}`}
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 mb-6 animate-in border-primary/20 shadow-md duration-300'
                            icon={<Pencil className='h-5 w-5' />}>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeEditForm}
                                    variant='ghost'
                                    size='sm'
                                    className='absolute top-[-3.5rem] right-12 w-fit border p-2 text-destructive shadow-md hover:bg-destructive/10'>
                                    <X className='mr-1 h-4 w-4' /> Close
                                </Button>
                                <AddStockForm onSuccess={closeEditForm} initialData={selectedRow} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
