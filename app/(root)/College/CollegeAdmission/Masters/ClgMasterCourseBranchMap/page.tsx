'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useClgMasterCourseBranchMap } from '@/hooks/college/useCollegeMasters';
import type { IClgMasterCourseBranchMap } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import AddCourseBranchMapForm from './_components/add-form';
import { courseBranchMapColumns } from './_components/columns';
import ToggleCourseBranchMapForm from './_components/toggle-form';
import { useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import UpdateCourseBranchMapForm from './_components/update-form';

export default function ClgMasterCourseBranchMapPage() {
    const { data: response, isLoading, error } = useClgMasterCourseBranchMap();

    return (
        <FormProvider<IClgMasterCourseBranchMap>>
            <ClgMasterCourseBranchMapPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ClgMasterCourseBranchMapPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IClgMasterCourseBranchMap>();

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
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add New Map
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClgMasterCourseBranchMap>
                        {...tableProps}
                        columns={courseBranchMapColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading course branch maps...'
                        noDataTitle='No Course Branch Maps Found'
                        noDataDescription='Get started by mapping a course to a branch'
                        errorTitle='Error Loading Records'
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
    } = useFormContext<IClgMasterCourseBranchMap>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Course Branch Map'
                        description='Fill in the details to map a course to a branch and assign semesters'
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
                            <AddCourseBranchMapForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Course Branch Map'
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
                            <UpdateCourseBranchMapForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleCourseBranchMapForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
