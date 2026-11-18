'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useCollegeFeeOpeningBalanceList } from '@/hooks/fees/college/useCollegeFeeOpeningBalance';
import type { ICollegeFeeOpeningBalanceGrid } from '@/types/fees/college/transaction/clgfeeopeningbalance';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import AddCollegeFeeOpeningBalanceForm from './_components/add-form';
import { clgFeeOpeningBalanceColumns } from './_components/columns';
import DeleteCollegeFeeOpeningBalanceForm from './_components/delete-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeFeeOpeningBalancePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useCollegeFeeOpeningBalanceList(searchParams);

    return (
        <FormProvider<ICollegeFeeOpeningBalanceGrid>>
            <CollegeFeeOpeningBalancePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeFeeOpeningBalancePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeFeeOpeningBalanceGrid>();

    const gridData = useMemo(() => {
        if (!response) return [];
        return (
            (response?.data as any)?.alldata ||
            (response?.data as any)?.saveddata ||
            response?.alldata ||
            response?.saveddata ||
            (Array.isArray(response?.data) ? response.data : null) ||
            (Array.isArray(response) ? response : [])
        );
    }, [response]);

    const tableProps = useDataTableProps(gridData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Fee Opening Balance
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ICollegeFeeOpeningBalanceGrid>
                        {...tableProps}
                        columns={clgFeeOpeningBalanceColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading fee opening balance data...'
                        noDataTitle='No Fee Opening Balance Record Found'
                        noDataDescription='Add a new fee opening balance record to get started'
                        errorTitle='Error Loading Fee Opening Balance Data'
                    />
                </CollapsibleSection>

                <FormSections pageData={response} />
            </div>
        </div>
    );
}

function FormSections({ pageData }: { pageData?: any }) {
    const { isAddFormOpen, selectedRow, isDeleteFormOpen, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<ICollegeFeeOpeningBalanceGrid>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='FEE OPENING BALANCE'
                        description='Select options and fetch students to record opening balances'
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
                            <AddCollegeFeeOpeningBalanceForm pageData={pageData} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Dialog */}
            {isDeleteFormOpen && selectedRow && (
                <DeleteCollegeFeeOpeningBalanceForm rowData={selectedRow} onClose={closeDeleteForm} onSuccess={closeDeleteForm} />
            )}
        </>
    );
}
