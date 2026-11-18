'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useInvMasterCustomer } from '@/hooks/inventory/masters/use-inv-master-customer';
import type { IInvMasterCustomer } from '@/types/inventory/masters/inv-master-customer';
import { Pencil, Plus, PlusCircle, Users, X } from 'lucide-react';
import { use } from 'react';
import AddCustomerForm from './_components/add-form';
import { invMasterCustomerColumns } from './_components/columns';
import { ToggleCustomerModal } from './_components/toggle-form';
import UpdateCustomerForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvMasterCustomerPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useInvMasterCustomer(searchParams);

    return (
        <FormProvider<IInvMasterCustomer>>
            <InvMasterCustomerPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function InvMasterCustomerPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm, selectedRow, isToggleFormOpen, closeToggleForm } = useFormContext<IInvMasterCustomer>();

    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Heading title='Customer Master' description='Manage Customer Details' />
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Customer
                    </Button>
                </div>

                <CollapsibleSection
                    title='Customer List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'
                    icon={<Users className='h-5 w-5' />}>
                    <GenericDataTable<IInvMasterCustomer>
                        {...tableProps}
                        data={response?.data || []}
                        columns={invMasterCustomerColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Customer records...'
                        noDataTitle='No Customers Found'
                        noDataDescription='Create a new Customer to start'
                        errorTitle='Error Loading Customer Data'
                    />
                </CollapsibleSection>

                <FormSections />

                {isToggleFormOpen && selectedRow && <ToggleCustomerModal rowData={selectedRow} onClose={closeToggleForm} />}
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IInvMasterCustomer>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Create New Customer'
                        description='Enter the customer details'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 mb-6 animate-in shadow-md duration-300'
                        icon={<PlusCircle className='h-5 w-5' />}
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='mr-1 h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <AddCustomerForm onSuccess={closeAddForm} onCancel={closeAddForm} />
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={`Edit Customer: ${selectedRow.invmC_CustomerName || ''}`}
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 mb-6 animate-in border-primary/20 shadow-md duration-300'
                        icon={<Pencil className='h-5 w-5' />}
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='mr-1 h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <UpdateCustomerForm selectedRow={selectedRow} onSuccess={closeEditForm} onCancel={closeEditForm} />
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
