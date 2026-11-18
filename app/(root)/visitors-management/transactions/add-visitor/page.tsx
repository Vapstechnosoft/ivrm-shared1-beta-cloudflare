'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useAddVisitor } from '@/hooks/visitors-management/transactions/useAddVisitor';
import type { VisitorTransactionData } from '@/types/visitors-management/transactions';
import { Plus, X } from 'lucide-react';
import { visitorColumns } from './_components/columns';
import VisitorForm from './_components/visitor-form';

// Type for the list data

export default function AddVisitorPage() {
    const { data, isLoading, error, refetch } = useAddVisitor();
    const listData = data?.gridoptions || [];

    return (
        <FormProvider<VisitorTransactionData>>
            <AddVisitorPageContent listData={listData} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function AddVisitorPageContent({
    listData,
    isLoading,
    error,
    refetch
}: {
    listData: VisitorTransactionData[];
    isLoading: boolean;
    error: any;
    refetch: any;
}) {
    const { openAddForm, isAddFormOpen, closeAddForm, addFormRef } = useFormContext<VisitorTransactionData>();
    const tableProps = useDataTableProps(listData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header Actions */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add New Visitor
                    </Button>
                </div>

                {/* Grid Section */}
                <CollapsibleSection
                    title='VISITORS RECORD'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<VisitorTransactionData>
                        {...tableProps}
                        columns={visitorColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Visitors...'
                        noDataTitle='No Visitors Found'
                        noDataDescription='Get started by adding a new visitor'
                        errorTitle='Error Loading Visitors'
                    />
                </CollapsibleSection>

                {/* Form Section */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Add New Visitor'
                            description='Fill in the details below to add a new visitor'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeAddForm}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <VisitorForm
                                    onSuccess={() => {
                                        closeAddForm();
                                        refetch();
                                    }}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
