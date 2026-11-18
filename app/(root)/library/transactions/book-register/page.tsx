'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useBookRegister } from '@/hooks/library/useBookRegister'; // You'll need to create this hook
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { Plus, X } from 'lucide-react';
import { use, useEffect } from 'react';
import { toast } from 'sonner';
import AddBookCopyForm from './_components/AddBookCopyForm';
import BookRegisterForm from './_components/BookRegisterForm';
import { BookRegisterColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function BookRegisterPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetch } = useBookRegister(searchParams);

    return (
        <FormProvider<BookRegisterPayload>>
            <BookRegisterPageContent response={response} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function BookRegisterPageContent({
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
    const { openAddForm } = useFormContext<BookRegisterPayload>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <h1 className='font-bold text-3xl tracking-tight'>Book Register</h1>
                        <p className='text-muted-foreground'>
                            Manage all books in the library system including accession numbers and availability
                        </p>
                    </div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add New Book
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<BookRegisterPayload>
                        {...tableProps}
                        columns={BookRegisterColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Book Register...'
                        noDataTitle='No Books Found'
                        noDataDescription='Start by adding new books to the library'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isCopyFormOpen,
        selectedRow,
        closeAddForm,
        closeToggleForm,
        closeEditForm,
        closeCopyForm,
        addFormRef,
        editFormRef
    } = useFormContext<BookRegisterPayload>();

    const { deactivateMutation } = useBookRegister();

    useEffect(() => {
        if (isEditFormOpen && !selectedRow) {
            console.error('FormSections: Edit form open but selectedRow is undefined');
        }
    }, [isEditFormOpen, selectedRow]);

    // Success handler that refetches data
    const handleSuccess = () => {
        refetch();
    };

    const isCurrentRowActive = selectedRow
        ? (() => {
              const accFlag =
                  selectedRow.lmbanO_ActiveFlag ??
                  (selectedRow as any).LMBANO_ActiveFlag ??
                  (selectedRow as any).lmbanO_activeFlag ??
                  (selectedRow as any).LMBANO_activeFlag;

              if (accFlag !== undefined && accFlag !== null) {
                  return accFlag === true || accFlag === 1 || accFlag === 'true' || accFlag === '1';
              }

              const bookFlag =
                  selectedRow.mB_ActiveFlag ??
                  (selectedRow as any).MB_ActiveFlag ??
                  (selectedRow as any).lmB_ActiveFlag ??
                  (selectedRow as any).LMB_ActiveFlag;

              if (bookFlag !== undefined && bookFlag !== null) {
                  return bookFlag === true || bookFlag === 1 || bookFlag === 'true' || bookFlag === '1';
              }

              return false;
          })()
        : false;

    const handleToggleConfirm = async () => {
        if (!selectedRow) return;

        const accessionId =
            selectedRow.lmbanO_Id ||
            (selectedRow as any).LMBANO_Id ||
            (selectedRow as any).lmbanO_ID ||
            (selectedRow as any).lmbanO_id ||
            (selectedRow as any).lmbano_Id ||
            0;

        const bookId =
            selectedRow.lmB_Id ||
            (selectedRow as any).LMB_Id ||
            (selectedRow as any).lmb_Id ||
            0;

        const targetId = accessionId || bookId;

        if (!targetId) {
            toast.error('Book or Accession ID is missing');
            return;
        }

        // When row is currently ACTIVE (true), we want to DEACTIVATE -> returnval = true
        // When row is currently INACTIVE (false), we want to ACTIVATE -> returnval = false
        const returnval = isCurrentRowActive;

        try {
            const payload = {
                ...selectedRow,
                LMBANO_Id: Number(targetId),
                lmbanO_Id: Number(targetId),
                LMB_Id: Number(bookId || targetId),
                lmB_Id: Number(bookId || targetId),
                LMB_BookTitle: selectedRow.lmB_BookTitle || (selectedRow as any).LMB_BookTitle || '',
                returnval: returnval
            };

            const response: any = await deactivateMutation.mutateAsync(payload);

            if (response?.success || response?.message?.toLowerCase().includes('success')) {
                toast.success(response.message || (returnval ? 'Record deactivated successfully' : 'Record activated successfully'));
                handleSuccess();
                closeToggleForm();
            } else {
                toast.error(response?.message || 'Failed to update status');
            }
        } catch (error: any) {
            console.error('Error during toggle update:', error);
            toast.error(error?.message || 'An error occurred during update');
        }
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Book'
                        description='Fill in the details below to add a new book to the library'
                        defaultOpen
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
                            <BookRegisterForm
                                onSuccess={() => {
                                    handleSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <AdaptiveDialog isOpen={isToggleFormOpen} onClose={closeToggleForm} title='Toggle Book Status'>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <p className='text-slate-600 text-sm'>
                            Are you sure you want to {isCurrentRowActive ? 'deactivate' : 'activate'} book:{' '}
                            <strong>{selectedRow.lmB_BookTitle || (selectedRow as any).LMB_BookTitle}</strong> (Accession No:{' '}
                            <strong>{selectedRow.lmbanO_AccessionNo || (selectedRow as any).LMBANO_AccessionNo || '-'}</strong>)?
                        </p>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button
                            variant='secondary'
                            onClick={closeToggleForm}
                            disabled={deactivateMutation.isPending}
                            className='h-9 px-6 text-xs'>
                            CANCEL
                        </Button>
                        <Button
                            variant={isCurrentRowActive ? 'destructive' : 'default'}
                            onClick={handleToggleConfirm}
                            isLoading={deactivateMutation.isPending}
                            disabled={deactivateMutation.isPending}
                            className='h-9 px-6 text-xs'>
                            {isCurrentRowActive ? 'DEACTIVATE' : 'ACTIVATE'}
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Book Details'
                        description='Update the book information below'
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
                            <BookRegisterForm
                                initialData={selectedRow}
                                onSuccess={() => {
                                    handleSuccess();
                                    closeEditForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Copy/Add Copies Form (Popup) */}
            <AddBookCopyForm isOpen={isCopyFormOpen} onClose={closeCopyForm} bookData={selectedRow} onSuccess={handleSuccess} />
        </>
    );
}
