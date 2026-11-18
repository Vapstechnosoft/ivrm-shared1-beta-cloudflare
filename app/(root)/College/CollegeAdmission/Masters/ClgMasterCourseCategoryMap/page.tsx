'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterCourseCategoryMap } from '@/hooks/college/useCollegeMasters';
import type { IClgMasterCourseCategoryMap } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import AddCourseCategoryMapForm from './_components/add-form';
import { courseCategoryMapColumns } from './_components/columns';
import ToggleCourseCategoryMapForm from './_components/toggle-form';
import UpdateCourseCategoryMapForm from './_components/update-form';

export default function ClgMasterCourseCategoryMapPage() {
    const { data: response, isLoading, error } = useClgMasterCourseCategoryMap();

    return (
        <FormProvider<IClgMasterCourseCategoryMap>>
            <ClgMasterCourseCategoryMapPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ClgMasterCourseCategoryMapPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IClgMasterCourseCategoryMap>();
    
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [searchColumnsQuery] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const rawDataList = response?.data?.grid || response?.data?.alldata || response?.data?.list || [];
    
    const dataList = useMemo(() => {
        if (!searchQuery) return rawDataList;
        
        const searchCols = searchColumnsQuery ? searchColumnsQuery.split(',') : [];
        const lowerQuery = searchQuery.toLowerCase();

        return rawDataList.filter((row: any) => {
            if (searchCols.length > 0) {
                return searchCols.some((col) => {
                    const value = row[col];
                    return value != null && String(value).toLowerCase().includes(lowerQuery);
                });
            }
            
            return Object.values(row).some(
                (value) => value != null && String(value).toLowerCase().includes(lowerQuery)
            );
        });
    }, [rawDataList, searchQuery, searchColumnsQuery]);
    
    const tableProps = useDataTableProps({
        ...response,
        data: dataList
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex items-center justify-end'>
                    <Button
                        onClick={openAddForm}
                        size='sm'
                        variant='default'
                        className='group w-fit transition-all duration-300 hover:scale-105'>
                        <Plus className='mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90' />
                        Add New Map
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClgMasterCourseCategoryMap>
                        {...tableProps}
                        columns={courseCategoryMapColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading mapping records...'
                        noDataTitle='No Mapping Records Found'
                        noDataDescription='Get started by mapping a course to a category'
                        errorTitle='Error Loading Mapping Records'
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
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IClgMasterCourseCategoryMap>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Course Category Map'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddCourseCategoryMapForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Course Category Map'
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
                            <UpdateCourseCategoryMapForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleCourseCategoryMapForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
