'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useCollegeFeeWaivedOffList } from '@/hooks/fees/college/useTransactions';
import type { ICollegeFeeWaivedOffGrid } from '@/types/fees/college/transaction/clgfeewaivedoff';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import AddCollegeFeeWaivedOffForm from './_components/add-form';
import { collegeFeeWaivedOffColumns } from './_components/columns';
import DeleteCollegeFeeWaivedOffForm from './_components/delete-form';
import UpdateCollegeFeeWaivedOffForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeFeeWaivedOffPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useCollegeFeeWaivedOffList(searchParams);

    return (
        <FormProvider<ICollegeFeeWaivedOffGrid>>
            <CollegeFeeWaivedOffPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeFeeWaivedOffPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeFeeWaivedOffGrid>();

    const normalizedResponse = useMemo(() => {
        if (!response) return response;

        const gridData =
            (response?.data as any)?.alldata ||
            (response?.data as any)?.saveddata ||
            response?.alldata ||
            response?.saveddata ||
            (Array.isArray(response?.data) ? response.data : null) ||
            (Array.isArray(response) ? response : []);

        return {
            ...response,
            data: gridData,
            total: response?.total ?? (Array.isArray(gridData) ? gridData.length : 0),
            success: response?.success ?? true,
            message: response?.message
        };
    }, [response]);

    const tableProps = useDataTableProps(normalizedResponse);
    const totalRecords = response?.total ?? tableProps.totalItems ?? 0;

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header Actions */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-3'>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'></h1>
                        {totalRecords > 0 && (
                            <Badge variant='secondary' className='font-semibold text-xs'>
                                Total Records: {totalRecords}
                            </Badge>
                        )}
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-1.5 h-4 w-4' />
                        Add Waived Off
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='WAIVED OFF GRID VIEW'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ICollegeFeeWaivedOffGrid>
                        {...tableProps}
                        columns={collegeFeeWaivedOffColumns}
                        isLoading={isLoading}
                        error={error}
                        isSearchRequired={true}
                        isPaginationRequired={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading college fee waived off records...'
                        noDataTitle='No Waived Off Records Found'
                        noDataDescription='Get started by creating your first fee waived off entry'
                        errorTitle='Error Loading Fee Waived Off Records'
                    />
                </CollapsibleSection>

                {/* Forms Section */}
                <FormSections pageData={response} />
            </div>
        </div>
    );
}

function FormSections({ pageData }: { pageData?: any }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        selectedRow,
        isDeleteFormOpen,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<ICollegeFeeWaivedOffGrid>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Waived Off'
                        description='Select academic year, course, branch, semester, student and fee heads to waive off fee amounts'
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
                            <AddCollegeFeeWaivedOffForm pageData={pageData} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Fee Waived Off'
                        description='Update the fee waived off record'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateCollegeFeeWaivedOffForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Dialog */}
            {isDeleteFormOpen && selectedRow && (
                <DeleteCollegeFeeWaivedOffForm rowData={selectedRow} onClose={closeDeleteForm} onSuccess={closeDeleteForm} />
            )}
        </>
    );
}
