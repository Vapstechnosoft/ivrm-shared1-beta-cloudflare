'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useInvVendorPayment } from '@/hooks/inventory/transactions/use-inv-vendor-payment';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { InvVendorPayment } from '@/types/inventory/transactions/inv-vendor-payment';
import { CreditCard, Pencil, Plus, PlusCircle, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { use } from 'react';
import AddVendorPaymentForm from './_components/add-form';
import { invVendorPaymentColumns } from './_components/columns';
import { ToggleVendorPaymentModal } from './_components/toggle-modal';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvVendorPaymentPage(props: { searchParams: SearchParams }) {
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

    const { data: response, isLoading, error, vendorPayments, isVendorPaymentsLoading } = useInvVendorPayment(queryParams);

    return (
        <FormProvider<InvVendorPayment>>
            <InvVendorPaymentContent
                response={response}
                vendorPayments={vendorPayments}
                isLoading={isLoading}
                isVendorPaymentsLoading={isVendorPaymentsLoading}
                error={error}
            />
        </FormProvider>
    );
}

function InvVendorPaymentContent({
    response,
    vendorPayments,
    isLoading,
    isVendorPaymentsLoading,
    error
}: {
    response: any;
    vendorPayments: any;
    isLoading: boolean;
    isVendorPaymentsLoading: boolean;
    error: any;
}) {
    const {
        openAddForm,
        openEditForm,
        selectedRow,
        isAddFormOpen,
        isEditFormOpen,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef,
        isToggleFormOpen,
        closeToggleForm
    } = useFormContext<InvVendorPayment>();

    const tableProps = useDataTableProps(vendorPayments, {
        dataKey: 'data',
        totalKey: 'total'
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading title='Vendor Payment' description='Manage vendor payments and track history' />
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Payment
                    </Button>
                </div>

                <CollapsibleSection
                    title='Payment History'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'
                    icon={<CreditCard className='h-5 w-5' />}>
                    <GenericDataTable<InvVendorPayment>
                        {...tableProps}
                        columns={invVendorPaymentColumns}
                        isLoading={isVendorPaymentsLoading}
                        error={error}
                        isSearchRequired={true}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading payment records...'
                        noDataTitle='No Payments Found'
                        noDataDescription='Create a new vendor payment to start'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {isToggleFormOpen && selectedRow && <ToggleVendorPaymentModal rowData={selectedRow} onClose={closeToggleForm} />}

                {isAddFormOpen && (
                    <div ref={addFormRef} className='mt-6'>
                        <CollapsibleSection
                            title='New Vendor Payment'
                            description='Enter payment details'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in border-primary/20 shadow-md duration-300'
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
                                <AddVendorPaymentForm onSuccess={closeAddForm} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef} className='mt-6'>
                        <CollapsibleSection
                            title={`Edit Payment: ${selectedRow.invmS_SupplierName} - ${selectedRow.invspT_Id}`}
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in border-primary/20 shadow-md duration-300'
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
                                <AddVendorPaymentForm onSuccess={closeEditForm} initialData={selectedRow} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
