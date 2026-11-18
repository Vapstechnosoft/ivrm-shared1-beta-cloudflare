'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useCollegeFeeChequeBounceList } from '@/hooks/fees/college/useCollegeFeeChequeBounce';
import type { ICollegeFeeChequeBounceGrid } from '@/types/fees/college/transaction/clgfeechequebounce';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import AddCollegeFeeChequeBounceForm from './_components/add-form';
import { clgFeeChequeBounceColumns } from './_components/columns';
import DeleteCollegeFeeChequeBounceForm from './_components/delete-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeFeeChequeBouncePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useCollegeFeeChequeBounceList(searchParams);

    return (
        <FormProvider<ICollegeFeeChequeBounceGrid>>
            <CollegeFeeChequeBouncePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeFeeChequeBouncePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeFeeChequeBounceGrid>();

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
                        Add Fee Cheque Bounce
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ICollegeFeeChequeBounceGrid>
                        {...tableProps}
                        columns={clgFeeChequeBounceColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading fee cheque bounce data...'
                        noDataTitle='No Fee Cheque Bounce Record Found'
                        noDataDescription='Add a new fee cheque bounce record to get started'
                        errorTitle='Error Loading Fee Cheque Bounce Data'
                    />
                </CollapsibleSection>

                <FormSections pageData={response} />
            </div>
        </div>
    );
}

function FormSections({ pageData }: { pageData?: any }) {
    const { isAddFormOpen, selectedRow, isDeleteFormOpen, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<ICollegeFeeChequeBounceGrid>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='FEE CHEQUE BOUNCE'
                        description='Fill in the details below to record a cheque bounce'
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
                            <AddCollegeFeeChequeBounceForm pageData={pageData} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Dialog */}
            {isDeleteFormOpen && selectedRow && (
                <DeleteCollegeFeeChequeBounceForm rowData={selectedRow} onClose={closeDeleteForm} onSuccess={closeDeleteForm} />
            )}
        </>
    );
}
