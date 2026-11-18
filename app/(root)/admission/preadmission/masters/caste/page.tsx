'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Spinner } from '@/components/ui/spinner';
import { useMasterCaste } from '@/hooks/admission/preadmission/useMasters';
import { deleteMasterCaste } from '@/server/admission/preadmission/masters/caste';
import type { IMasterCasteList } from '@/types/admission/preadmission/masters';
import { Plus, Trash2, X } from 'lucide-react';
import { use, useState } from 'react';
import { toast } from 'sonner';
import AddMasterCasteForm from './_components/add-form';
import { masterCasteColumns } from './_components/columns';
import UpdateMasterCasteForm from './_components/update-form';
import ViewDetailsDialog from './_components/view-details-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterCastePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: response, isLoading, error, refetchAll } = useMasterCaste(searchParams);

    return (
        <FormProvider<IMasterCasteList>>
            <MasterCastePageContent response={response} isLoading={isLoading} error={error} onRefresh={refetchAll} />
        </FormProvider>
    );
}

function MasterCastePageContent({
    response,
    isLoading,
    error,
    onRefresh
}: {
    response: any;
    isLoading: boolean;
    error: any;
    onRefresh: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterCasteList>();
    const transformedResponse = response
        ? {
              ...response,
              data: response.data?.casteList || response.data || []
          }
        : response;
    const tableProps = useDataTableProps(transformedResponse);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Caste
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-2 flex justify-end'>
                        <ViewDetailsDialog />
                    </div>
                    <GenericDataTable<IMasterCasteList>
                        {...tableProps}
                        columns={masterCasteColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master caste...'
                        noDataTitle='No Master Caste Found'
                        noDataDescription='Get started by creating your first master caste'
                        errorTitle='Error Loading Master Caste'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections onRefresh={onRefresh} />
            </div>
        </div>
    );
}

function FormSections({ onRefresh }: { onRefresh: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterCasteList>();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedRow) return;
        setIsDeleting(true);
        try {
            const res = await deleteMasterCaste(selectedRow.imC_Id, selectedRow.imcC_Id);
            if (res.success) {
                toast.success(res.message || 'Master Caste deleted successfully');
                closeDeleteForm();
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to delete Master Caste');
            }
        } catch (error) {
            toast.error('An error occurred while deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Caste'
                        description='Fill in the details below to create a new master caste'
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
                            <AddMasterCasteForm
                                onSuccess={() => {
                                    closeAddForm();
                                    onRefresh();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Caste'
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
                            <UpdateMasterCasteForm
                                selectedRow={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    onRefresh();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteFormOpen} onOpenChange={closeDeleteForm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the caste{' '}
                            <span className='font-bold text-foreground'>"{selectedRow?.imC_CasteName}"</span> and remove it from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                            {isDeleting ? (
                                <>
                                    <Spinner className='mr-2 h-4 w-4' /> Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className='mr-2 h-4 w-4' /> Delete
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
