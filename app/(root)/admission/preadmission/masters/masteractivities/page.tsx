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
import { useMasterActivity } from '@/hooks/admission/preadmission/useMasters';
import type { IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';
import { deleteMasterActivityData } from '@/server/admission/preadmission/masters/master_activity';
import { Plus, Trash2, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { use, useMemo, useState } from 'react';
import { tableSearchVariables } from '@/lib/data-table.config';
import { toast } from 'sonner';
import AddMasterActivityForm from './_components/add-form';
import { masterActivityColumns } from './_components/columns';
import UpdateMasterActivityForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterActivityPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: response, isLoading, error, refetchAll } = useMasterActivity(searchParams);

    return (
        <FormProvider<IMasterActivityList>>
            <MasterActivityPageContent response={response} isLoading={isLoading} error={error} onRefresh={refetchAll} />
        </FormProvider>
    );
}

function MasterActivityPageContent({
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
    const { openAddForm } = useFormContext<IMasterActivityList>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));

    const filteredData = useMemo(() => {
        let result = response?.data || [];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((row: any) =>
                Object.values(row).some(
                    (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
                )
            );
        }
        return result;
    }, [response, searchQuery]);

    const paginatedData = useMemo(() => {
        const page = currentPage || 1;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage, pageSize]);

    const tableProps = useDataTableProps(
        response?.data 
            ? { ...response, data: paginatedData, total: filteredData.length }
            : response
    );

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
                        Add Master Activity
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterActivityList>
                        {...tableProps}
                        columns={masterActivityColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master activities...'
                        noDataTitle='No Master Activities Found'
                        noDataDescription='Get started by creating your first master activity'
                        errorTitle='Error Loading Master Activities'
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
    } = useFormContext<IMasterActivityList>();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!selectedRow) return;
        setIsDeleting(true);
        try {
            const res = await deleteMasterActivityData(selectedRow.amA_Id);
            if (res.success) {
                toast.success(res.message || 'Master Activity deleted successfully');
                closeDeleteForm();
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to delete Master Activity');
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
                        title='Add New Master Activity'
                        description='Fill in the details below to create a new master activity'
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
                            <AddMasterActivityForm
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
                        title='Edit Master Activity'
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
                            <UpdateMasterActivityForm
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
                            This action cannot be undone. This will permanently delete the activity{' '}
                            <span className='font-bold text-foreground'>"{selectedRow?.amA_Activity}"</span> and remove it from our servers.
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
