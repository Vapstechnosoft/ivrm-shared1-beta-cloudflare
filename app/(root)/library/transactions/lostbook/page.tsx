// app/dashboard/transaction/lostbook/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useLostBookList } from '@/hooks/library/useTransactions';
import type { ILostBookList } from '@/types/library/transactions/transactions';
import { X } from 'lucide-react';
import { use, useEffect } from 'react';
import AddLostBookForm from './_components/add-form';
import { lostBookColumns } from './_components/columns';
import UpdateLostBookForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function LostBookPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetch } = useLostBookList(searchParams);

    return (
        <FormProvider<ILostBookList>>
            <LostBookPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function LostBookPageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-8 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <h1 className='font-bold text-2xl tracking-tight'>Lost Book Management</h1>
                        <p className='text-muted-foreground'>Manage lost/damaged books and fines collection</p>
                    </div>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ILostBookList>
                        {...tableProps}
                        columns={lostBookColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Lost Books...'
                        noDataTitle='No Records Found'
                        noDataDescription='No lost book records found in the system'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* Add New Lost Book Form (Always Visible) */}
                <div className='mt-8'>
                    <CollapsibleSection
                        title='Add New Lost Book'
                        description='Mark book as lost/damaged and collect fine'
                        defaultOpen
                        variant='outline'
                        size='md'
                        className='bg-card shadow-lg duration-300'>
                        <AddLostBookForm
                            onSuccess={() => {
                                refetch();
                            }}
                        />
                    </CollapsibleSection>
                </div>

                {/* Forms (Edit/Toggle/Delete) */}
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

import DeleteLostBookForm from './_components/delete-form';
import ToggleLostBookForm from './_components/toggle-form';

function FormSections({ refetch }: { refetch: () => void }) {
    const {
        isEditFormOpen,
        isToggleFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeEditForm,
        closeToggleForm,
        closeDeleteForm,
        editFormRef
    } = useFormContext<ILostBookList>();

    useEffect(() => {
        if ((isEditFormOpen || isToggleFormOpen || isDeleteFormOpen) && !selectedRow) {
            console.error('FormSections: Form open but selectedRow is undefined');
        }
    }, [isEditFormOpen, isToggleFormOpen, isDeleteFormOpen, selectedRow]);

    return (
        <>
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Lost Book'
                        description='Update lost book details'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 fixed inset-x-4 top-20 z-50 mx-auto max-w-4xl animate-in border-primary/20 bg-background shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateLostBookForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    refetch();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                    <div className='fixed inset-0 z-40 bg-black/20' onClick={closeEditForm} />
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleLostBookForm
                    configId={selectedRow.lmbanO_Id}
                    isActive={selectedRow.lmB_ActiveFlag ?? true}
                    configName={selectedRow.lmB_BookTitle}
                    onClose={closeToggleForm}
                    onSuccess={() => {
                        refetch();
                        closeToggleForm();
                    }}
                />
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && (
                <DeleteLostBookForm
                    rowData={selectedRow}
                    onClose={closeDeleteForm}
                    onSuccess={() => {
                        refetch();
                        closeDeleteForm();
                    }}
                />
            )}
        </>
    );
}
