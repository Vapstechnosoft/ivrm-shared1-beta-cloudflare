'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useCollegeMasterCaste } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { ICollegeMasterCaste } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddCollegeMasterCasteForm from './_components/add-form';
import { collegeMasterCasteColumns } from './_components/columns';
import DeleteCollegeMasterCasteForm from './_components/delete-form';
import UpdateCollegeMasterCasteForm from './_components/update-form';

export default function CollegeMasterCastePage() {
    const { data: response, isLoading, error } = useCollegeMasterCaste();

    return (
        <FormProvider<ICollegeMasterCaste>>
            <CollegeMasterCastePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeMasterCastePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeMasterCaste>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = useMemo(() => {
        return response?.data?.gridviewDetails || response?.gridviewDetails || (Array.isArray(response?.data) ? response.data : []);
    }, [response]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter(
            (item: ICollegeMasterCaste) =>
                (item.iC_CasteName || item.imC_CasteName)?.toLowerCase().includes(query) ||
                (item.iC_CasteDesc || item.imC_CasteDesc)?.toLowerCase().includes(query) ||
                (item.categoryName || item.imcC_CategoryName)?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({
        ...response,
        data: filteredData,
        total: filteredData.length
    });

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <div className='flex justify-end gap-2'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' /> Add Master Caste
                    </Button>
                </div>

                <CollapsibleSection
                    title='Created Caste List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ICollegeMasterCaste>
                        {...tableProps}
                        columns={collegeMasterCasteColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading castes...'
                        noDataTitle='No Castes Found'
                        noDataDescription='Get started by creating your first caste'
                        errorTitle='Error Loading Castes'
                    />
                </CollapsibleSection>

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
    } = useFormContext<ICollegeMasterCaste>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Master Caste'
                        description='Fill in the details below'
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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddCollegeMasterCasteForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateCollegeMasterCasteForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDeleteFormOpen && selectedRow && <DeleteCollegeMasterCasteForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
