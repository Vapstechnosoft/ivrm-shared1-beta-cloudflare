'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useCollegeFeePrevilegeList } from '@/hooks/fees/college/useMasters';
import type { ICollegeFeePrivilegeList } from '@/types/fees/college/masters/masterclgfeeprevilege';
import { Plus, X } from 'lucide-react';
import { use, useMemo } from 'react';
import AddCollegeFeePrivilegeForm from './_components/add-form';
import { collegeFeePrivilegeColumns } from './_components/columns';
import ToggleCollegeFeePrivilegeForm from './_components/toggle-form';
import UpdateCollegeFeePrivilegeForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeFeePrivilegePage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useCollegeFeePrevilegeList(searchParams);

    return (
        <FormProvider<ICollegeFeePrivilegeList>>
            <CollegeFeePrivilegePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeFeePrivilegePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeFeePrivilegeList>();

    const normalizedResponse = useMemo(() => {
        if (!response) return response;

        const prelist =
            (response?.data as any)?.prelist ||
            (Array.isArray(response?.data) ? response.data : null) ||
            response?.prelist ||
            (Array.isArray(response) ? response : []);

        return {
            ...response,
            data: prelist,
            total: response?.total ?? (Array.isArray(prelist) ? prelist.length : 0),
            success: response?.success ?? true,
            message: response?.message
        };
    }, [response]);

    const tableProps = useDataTableProps(normalizedResponse);

    // Extract total records count from server total or fallback to data length
    const totalRecords = response?.total ?? tableProps.totalItems ?? 0;

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header Actions */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-3'>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>Fee Privilege</h1>
                        {totalRecords > 0 && (
                            <Badge variant='secondary' className='font-semibold text-xs'>
                                Total Records: {totalRecords}
                            </Badge>
                        )}
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-1.5 h-4 w-4' />
                        Add Fee Privilege
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Master Privilege List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ICollegeFeePrivilegeList>
                        {...tableProps}
                        columns={collegeFeePrivilegeColumns}
                        isLoading={isLoading}
                        error={error}
                        isSearchRequired={true}
                        isPaginationRequired={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading college fee privileges...'
                        noDataTitle='No Fee Privileges Found'
                        noDataDescription='Get started by creating your first fee privilege for college'
                        errorTitle='Error Loading Fee Privileges'
                    />
                </CollapsibleSection>

                {/* Forms Section */}
                <FormSections pageData={response} />
            </div>
        </div>
    );
}

function FormSections({ pageData }: { pageData?: any }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        selectedRow,
        isDeleteFormOpen,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<ICollegeFeePrivilegeList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Fee Privilege'
                        description='Select academic year, group, heads, roles and users to grant fee privileges'
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
                            <AddCollegeFeePrivilegeForm pageData={pageData} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Fee Privilege'
                        description='Update the fee privilege details for this user'
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
                            <UpdateCollegeFeePrivilegeForm pageData={pageData} selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Dialog */}
            {isDeleteFormOpen && selectedRow && <ToggleCollegeFeePrivilegeForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
