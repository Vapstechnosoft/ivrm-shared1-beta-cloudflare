'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useInvTSales } from '@/hooks/inventory/transactions/use-inv-t-sales';
import type { IInvTSales } from '@/types/inventory/transactions/inv-t-sales';
import { Pencil, Plus, PlusCircle, ShoppingCart, X } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import AddSalesForm from './_components/add-form';
import { getInvTSalesColumns } from './_components/columns';
// import ViewSalesDetailsModal from './_components/view-details-modal';
import { ToggleSalesModal } from './_components/toggle-modal';
import UpdateSalesForm from './_components/update-form';
import { ViewReceiptItemModal } from './_components/view-receipt-item-modal';
import { ViewReceiptModal } from './_components/view-receipt-modal';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

export default function InvTSalesPage(props: { searchParams: SearchParams }) {
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

    const queryParams = {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery,
        sort_column: sortColumn,
        sort_direction: sortDirection
    };

    const { data: response, isLoading, error } = useInvTSales(queryParams);

    return (
        <FormProvider<IInvTSales>>
            <InvTSalesPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function InvTSalesPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const {
        openAddForm,
        openEditForm,
        openToggleForm,
        openDetailsView,
        selectedRow,
        isDetailsViewOpen,
        closeDetailsView,
        isToggleFormOpen,
        closeToggleForm
    } = useFormContext<IInvTSales>();

    const [isItemViewOpen, setIsItemViewOpen] = useState(false);
    const [itemRowData, setItemRowData] = useState<IInvTSales | null>(null);

    const handleViewItem = (row: IInvTSales) => {
        setItemRowData(row);
        setIsItemViewOpen(true);
    };

    const closeViewItem = () => {
        setIsItemViewOpen(false);
        setItemRowData(null);
    };

    // const { deleteMutation, toggleActiveMutation } = useInvTSales(); // Moved to columns component

    const tableProps = useDataTableProps(response, {
        dataKey: 'data',
        totalKey: 'total'
    });

    const columns = useMemo(() => getInvTSalesColumns(handleViewItem), []);

    const processedData = useMemo(() => {
        return (response?.data || []).map((row: any, index: number) => ({
            ...row,
            _uniqueRowId: row.invmsL_Id ? `sale-${row.invmsL_Id}-${index}` : `sale-idx-${index}`
        }));
    }, [response?.data]);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading title='Sales Transaction' description='Manage sales transactions' />
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Sale
                    </Button>
                </div>

                <CollapsibleSection
                    title='Sales List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'
                    icon={<ShoppingCart className='h-5 w-5' />}>
                    <GenericDataTable<IInvTSales>
                        {...tableProps}
                        data={processedData}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        isSearchRequired={true}
                        columnPinning={{ right: ['actions'] }}
                        getRowId={(row: any) => row._uniqueRowId}
                        loadingMessage='Loading Sales records...'
                        noDataTitle='No Sales Found'
                        noDataDescription='Create a new Sales record to start'
                        errorTitle='Error Loading Sales Data'
                    />
                </CollapsibleSection>

                <FormSections />

                {isToggleFormOpen && selectedRow && <ToggleSalesModal rowData={selectedRow} onClose={closeToggleForm} />}

                {isDetailsViewOpen && selectedRow && <ViewReceiptModal rowData={selectedRow} onClose={closeDetailsView} />}

                {isItemViewOpen && itemRowData && <ViewReceiptItemModal rowData={itemRowData} onClose={closeViewItem} />}
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IInvTSales>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Create New Sale'
                        description='Enter the sales details'
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
                            <AddSalesForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={`Edit Sale: ${selectedRow.invmsL_SalesNo}`}
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
                            <UpdateSalesForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                            {/* <div>Update Form Placeholder</div> */}
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
