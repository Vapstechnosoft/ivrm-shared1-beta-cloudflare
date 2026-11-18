'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IClgSubjectSchemeName } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddSchemeNameForm from './SchemeName/add-form';
import { schemeNameColumns } from './SchemeName/columns';
import ToggleSchemeNameForm from './SchemeName/toggle-form';

interface SchemeNameTabProps {
    data: any;
    isLoading: boolean;
    error: any;
}

export default function SchemeNameTab({ data, isLoading, error }: SchemeNameTabProps) {
    return (
        <FormProvider<IClgSubjectSchemeName>>
            <SchemeNameTabContent response={data} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function SchemeNameTabContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IClgSubjectSchemeName>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = Array.isArray(response?.data?.sublist) ? response.data.sublist : [];

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IClgSubjectSchemeName) =>
            item.acsS_SchmeName?.toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' /> Add Scheme Name
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IClgSubjectSchemeName>
                    {...tableProps}
                    columns={schemeNameColumns}
                    isLoading={isLoading}
                    error={error}
                    showViewOptions={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading scheme names...'
                    noDataTitle='No Scheme Names Found'
                    noDataDescription='Get started by creating your first scheme name'
                    errorTitle='Error Loading Scheme Names'
                />
            </CollapsibleSection>

            <FormSections />
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IClgSubjectSchemeName>();

    return (
        <>
            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isEditFormOpen ? editFormRef : addFormRef}>
                    <CollapsibleSection title={isEditFormOpen ? 'Edit Scheme Name' : 'Add New Scheme Name'} defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={isEditFormOpen ? closeEditForm : closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddSchemeNameForm selectedRow={isEditFormOpen ? selectedRow! : undefined} onSuccess={isEditFormOpen ? closeEditForm : closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleSchemeNameForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
