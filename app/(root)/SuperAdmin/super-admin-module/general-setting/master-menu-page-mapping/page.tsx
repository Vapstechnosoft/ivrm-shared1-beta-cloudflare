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
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Spinner } from '@/components/ui/spinner';
import { tableSearchVariables } from '@/lib/data-table.config';
import {
    deleteMasterMenuPageMapping,
    getModuleDropdown,
    getOnLoadData
} from '@/server/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import type { IMasterMenuPageMappingDTO } from '@/types/super-admin/super-admin-module/general-setting/master-menu-page-mapping';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddMasterMenuPageMappingForm from './_components/add-form';
import { columns } from './_components/columns';

export default function MasterMenuPageMappingPage() {
    return (
        <FormProvider<IMasterMenuPageMappingDTO>>
            <MasterMenuPageMappingPageContent />
        </FormProvider>
    );
}

function MasterMenuPageMappingPageContent() {
    const { openAddForm } = useFormContext<IMasterMenuPageMappingDTO>();
    const [data, setData] = useState<IMasterMenuPageMappingDTO[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    // NUQS Hooks for URL State Management
    const [page, setPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false, history: 'push' }).withDefault(10)
    );
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortDirection] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    // Fetch modules once on mount
    useEffect(() => {
        getModuleDropdown()
            .then((moduleRes) => {
                if (moduleRes.success) {
                    setModules(moduleRes.data || []);
                }
            })
            .catch((err) => {
                console.error('Error fetching modules:', err);
            });
    }, []);

    const fetchData = useCallback(() => {
        setIsLoading(true);
        getOnLoadData({
            page,
            page_size: pageSize,
            sort_column: sortBy,
            sort_direction: sortDirection,
            search_query: searchQuery
        })
            .then((gridRes: any) => {
                if (gridRes.success) {
                    const listData = Array.isArray(gridRes.data)
                        ? gridRes.data
                        : gridRes.data?.GridDetails || gridRes.data?.records || [];
                    setData(listData);
                    setPages(gridRes.pages || gridRes.data?.pages || []);
                    setTotalItems(gridRes.total || listData.length);
                } else {
                    toast.error(gridRes.message || 'Failed to load data');
                }
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                toast.error('An error occurred while loading data');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [page, pageSize, sortBy, sortDirection, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshData = () => {
        fetchData();
    };

    const refreshAfterDelete = async () => {
        const lastPageAfterDelete = Math.max(1, Math.ceil((totalItems - 1) / pageSize));
        if (page > lastPageAfterDelete) {
            await setPage(lastPageAfterDelete);
            return;
        }
        fetchData();
    };

    return (
        <div className='container space-y-4 p-1'>
            {/* Header with Add Button */}
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Master Menu Page Mapping
                </Button>
            </div>

            <CollapsibleSection title='Master Menu Page Mapping List' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <div className='p-4'>
                    <GenericDataTable data={data} columns={columns} isLoading={isLoading} totalItems={totalItems} />
                </div>
            </CollapsibleSection>

            <FormSections onRefresh={refreshData} onDeleteSuccess={refreshAfterDelete} modules={modules} allPages={pages} />
        </div>
    );
}

function FormSections({
    onRefresh,
    onDeleteSuccess,
    modules,
    allPages
}: {
    onRefresh: () => void;
    onDeleteSuccess: () => Promise<void>;
    modules: any[];
    allPages: any[];
}) {
    const { isAddFormOpen, isDeleteFormOpen, selectedRow, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<IMasterMenuPageMappingDTO>();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleSuccess = () => {
        closeAddForm();
        onRefresh();
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        setIsDeleting(true);
        try {
            const res = await deleteMasterMenuPageMapping(selectedRow.ivrmmmpM_Id);
            if (res.success) {
                toast.success(res.message || 'Record deleted successfully');
                closeDeleteForm();
                await onDeleteSuccess();
            } else {
                toast.error(res.message || 'Failed to delete record');
            }
        } catch (error) {
            console.error('Failed to delete master menu page mapping:', error);
            toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the record.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Master Menu Page Mapping'
                        defaultOpen={true}
                        variant='outline'
                        size='lg'
                        className='slide-in-from-top-2 animate-in shadow-lg'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddMasterMenuPageMappingForm onSuccess={handleSuccess} modules={modules} allPages={allPages} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <AlertDialog open={isDeleteFormOpen} onOpenChange={closeDeleteForm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the record.
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
                            className='bg-destructive hover:bg-destructive/90'>
                            {isDeleting ? <Spinner className='mr-2 h-4 w-4' /> : <X className='mr-2 h-4 w-4' />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
