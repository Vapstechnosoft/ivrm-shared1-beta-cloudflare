'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgSubjectSchemeType } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddSchemeTypeForm from './SchemeType/add-form';
import { schemeTypeColumns } from './SchemeType/columns';
import ToggleSchemeTypeForm from './SchemeType/toggle-form';

interface SchemeTypeTabProps {
    data: any;
    isLoading: boolean;
    error: any;
}

export default function SchemeTypeTab({ data, isLoading, error }: SchemeTypeTabProps) {
    return (
        <FormProvider<IClgSubjectSchemeType>>
            <SchemeTypeTabContent response={data} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function SchemeTypeTabContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IClgSubjectSchemeType>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data?.schelist) ? response.data.schelist : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IClgSubjectSchemeType) =>
            item.acsT_SchmeType?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' /> Add Scheme Type
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IClgSubjectSchemeType>
                    {...tableProps}
                    columns={schemeTypeColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading scheme types...'
                    noDataTitle='No Scheme Types Found'
                    noDataDescription='Get started by creating your first scheme type'
                    errorTitle='Error Loading Scheme Types'
                />
            </CollapsibleSection>

            <FormSections />
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgSubjectSchemeType>();

    return (
        <>
            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isEditFormOpen ? editFormRef : addFormRef}>
                    <CollapsibleSection title={isEditFormOpen ? 'Edit Scheme Type' : 'Add New Scheme Type'} defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={isEditFormOpen ? closeEditForm : closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddSchemeTypeForm selectedRow={isEditFormOpen ? selectedRow! : undefined} onSuccess={isEditFormOpen ? closeEditForm : closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleSchemeTypeForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
