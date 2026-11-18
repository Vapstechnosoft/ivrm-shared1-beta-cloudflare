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
import { deleteMasterBoard, getMasterBoardData } from '@/server/admission/oldsharedhost/masters/master-board';
import type { IMasterBoard } from '@/types/admission/oldsharedhost/masters/master-board';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddMasterBoardForm from './_components/add-form';
import { columns } from './_components/columns';
import UpdateMasterBoardForm from './_components/update-form';

export default function MasterBoardPage() {
    return (
        <FormProvider<IMasterBoard>>
            <MasterBoardPageContent />
        </FormProvider>
    );
}

function MasterBoardPageContent() {
    const {
        openAddForm,
        isAddFormOpen,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        selectedRow,
        closeAddForm,
        isDeleteFormOpen,
        closeDeleteForm,
        addFormRef
    } = useFormContext<IMasterBoard>();
    const [data, setData] = useState<IMasterBoard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const filteredData = data.filter((item) => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        const nameMatch = item.ivrmmB_Name?.toLowerCase().includes(lowerQuery) || false;
        const descMatch = item.ivrmmB_Description?.toLowerCase().includes(lowerQuery) || false;
        return nameMatch || descMatch;
    });

    const fetchData = () => {
        setIsLoading(true);
        getMasterBoardData().then((res) => {
            if (res.success) {
                if (res.data && Array.isArray(res.data.boardList)) {
                    setData(res.data.boardList);
                } else if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    setData([]);
                }
            } else {
                setData([]);
            }
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    const handleSuccess = () => {
        closeAddForm();
        refreshData();
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        setIsDeleting(true);
        try {
            const res = await deleteMasterBoard(selectedRow.ivrmmB_Id);
            if (res.success || res.returnval === true || res.returnval === 'true') {
                toast.success(res.message || 'Record deleted successfully');
                closeDeleteForm();
                refreshData();
            } else if (res.returnval === 'mapped') {
                toast.error(res.message || 'Sorry.....You can not delete this record. Because it is mapped to student');
                closeDeleteForm();
            } else {
                toast.error(res.message || 'Failed to delete record');
                closeDeleteForm();
            }
        } catch (error) {
            toast.error('An error occurred while deleting.');
            closeDeleteForm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className='container space-y-4 p-1'>
            {/* Header with Add Button - Only show if form is NOT open */}
            {!isAddFormOpen && (
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Master Board
                    </Button>
                </div>
            )}

            {/* Add Form Section Above Table */}
            {isAddFormOpen && !selectedRow && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title={<span className='font-bold'>Add Master Board</span>}
                        defaultOpen={true}
                        variant='outline'
                        size='lg'
                        className='slide-in-from-top-2 animate-in shadow-lg'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='outline'
                                size='sm'
                                className='-top-[3.6rem] absolute right-12 w-fit rounded-full border-red-500 px-4 text-red-500 hover:bg-red-50'>
                                <X className='mr-1 h-4 w-4 text-red-500' /> Close
                            </Button>
                            <AddMasterBoardForm onSuccess={handleSuccess} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <CollapsibleSection
                title={<span className='-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 font-bold'>Master Board List</span>}
                headerClassName='relative'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg'>
                <div className='p-4'>
                    <GenericDataTable data={filteredData} columns={columns} isLoading={isLoading} totalItems={filteredData.length} />
                </div>
            </CollapsibleSection>

            {/* Edit Form Section Below Table */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title={<span className='font-bold'>Edit Master Board</span>}
                        defaultOpen={true}
                        variant='outline'
                        size='lg'
                        className='slide-in-from-bottom-2 mt-4 animate-in shadow-lg'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='outline'
                                size='sm'
                                className='-top-[3.6rem] absolute right-12 w-fit rounded-full border-red-500 px-4 text-red-500 hover:bg-red-50'>
                                <X className='mr-1 h-4 w-4 text-red-500' /> Close
                            </Button>
                            <UpdateMasterBoardForm
                                onSuccess={() => {
                                    closeEditForm();
                                    refreshData();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <AlertDialog open={isDeleteFormOpen} onOpenChange={closeDeleteForm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>Do you want to delete record?</AlertDialogDescription>
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
                            Yes, delete it!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
