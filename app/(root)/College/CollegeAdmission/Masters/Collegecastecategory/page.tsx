'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useCollegeCasteCategory } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { ICollegeCasteCategory } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import AddCollegeCasteCategoryForm from './_components/add-form';
import { collegeCasteCategoryColumns } from './_components/columns';
import DeleteCollegeCasteCategoryForm from './_components/delete-form';
import UpdateCollegeCasteCategoryForm from './_components/update-form';
import ViewDetailsDialog from './_components/view-details-dialog';

export default function CollegeCasteCategoryPage() {
    const { data: response, isLoading, error } = useCollegeCasteCategory();

    return (
        <FormProvider<ICollegeCasteCategory>>
            <CollegeCasteCategoryPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeCasteCategoryPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeCasteCategory>();
    
    // Pagination & Search State
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    
    // API returns data inside castecategoryname
    const dataList = response?.data?.castecategoryname || response?.data?.list || [];
    
    // Client-side filtering
    const filteredData = dataList.filter((item: ICollegeCasteCategory) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            item.imcC_CategoryName?.toLowerCase().includes(searchLower) ||
            item.imcC_CategoryDesc?.toLowerCase().includes(searchLower)
        );
    });

    // Client-side pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const tableProps = useDataTableProps({
        ...response,
        data: paginatedData,
        total: filteredData.length
    });

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
                        Add Caste Category
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='flex justify-end gap-2 mb-2'>
                        <ViewDetailsDialog />
                    </div>
                    <GenericDataTable<ICollegeCasteCategory>
                        {...tableProps}
                        columns={collegeCasteCategoryColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading caste categories...'
                        noDataTitle='No Caste Categories Found'
                        noDataDescription='Get started by creating your first caste category'
                        errorTitle='Error Loading Caste Categories'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
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
    } = useFormContext<ICollegeCasteCategory>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Caste Category'
                        description='Fill in the details below to create a new caste category'
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
                            <AddCollegeCasteCategoryForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Caste Category'
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
                            <UpdateCollegeCasteCategoryForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && (
                <DeleteCollegeCasteCategoryForm rowData={selectedRow} onClose={closeDeleteForm} />
            )}
        </>
    );
}
