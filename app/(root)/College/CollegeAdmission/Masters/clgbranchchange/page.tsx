'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useBranchChange } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IBranchChange } from '@/types/college/masters';
import { Plus, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import AddBranchChangeForm from './_components/add-form';
import { branchChangeColumns } from './_components/columns';
import ToggleBranchChangeForm from './_components/toggle-form';

export default function CollegeBranchChangePage() {
    const { data: response, isLoading, error } = useBranchChange();

    return (
        <FormProvider<IBranchChange>>
            <CollegeBranchChangePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeBranchChangePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IBranchChange>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const dataList = useMemo(() => {
        return response?.datalist || response?.data?.datalist || (Array.isArray(response?.data) ? response.data : []);
    }, [response]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter(
            (item: IBranchChange) =>
                (item.sName || (item as any).amcsT_Name || (item as any).AMCST_Name)?.toLowerCase().includes(query) ||
                (item.amcO_CourseName || (item as any).AMCO_CourseName)?.toLowerCase().includes(query) ||
                (item.amB_BranchName || (item as any).AMB_BranchName)?.toLowerCase().includes(query) ||
                (item.newBranch || (item as any).NewBranch)?.toLowerCase().includes(query) ||
                (item.acscoB_Remarks || (item as any).ACSCOB_Remarks)?.toLowerCase().includes(query) ||
                (item.acscoB_OldRegNo || (item as any).ACSCOB_OldRegNo)?.toLowerCase().includes(query) ||
                (item.acscoB_NewRegNo || (item as any).ACSCOB_NewRegNo)?.toLowerCase().includes(query)
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
                        <Plus className='mr-2 h-4 w-4' /> Add Branch Change
                    </Button>
                </div>

                <CollapsibleSection
                    title='Course Branch Changes Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IBranchChange>
                        {...tableProps}
                        columns={branchChangeColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading branch change details...'
                        noDataTitle='No Branch Change Records Found'
                        noDataDescription='Get started by recording your first branch change'
                        errorTitle='Error Loading Branch Change Records'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeToggleForm, addFormRef } = useFormContext<IBranchChange>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Branch Change'
                        description='Fill in the branch change details below'
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
                            <AddBranchChangeForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && <ToggleBranchChangeForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
