'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterTimeSetting } from '@/hooks/hrms/attendance-management/useMasters';
import type { IMasterTimeSetting } from '@/types/hrms/attendance-management/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { HRMSCollapsibleSection } from '../_components/hrms-collapsible-section';
import AddMasterTimeSettingForm from './_components/add-form';
import { masterTimeSettingColumns } from './_components/columns';
import DeleteMasterTimeSettingForm from './_components/delete-form';
import UpdateMasterTimeSettingForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterTimeSettingPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterTimeSetting();

    return (
        <FormProvider<IMasterTimeSetting>>
            <MasterTimeSettingPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterTimeSettingPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterTimeSetting>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header for Add button */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Time Setting
                    </Button>
                </div>

                {/* Data Table Section */}
                <HRMSCollapsibleSection
                    title='Master Time Setting Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable<IMasterTimeSetting>
                        {...tableProps}
                        columns={masterTimeSettingColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master time settings...'
                        noDataTitle='No Master Time Settings Found'
                        noDataDescription='Get started by creating your first master time setting'
                        errorTitle='Error Loading Time Settings'
                    />
                </HRMSCollapsibleSection>

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
    } = useFormContext<IMasterTimeSetting>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <HRMSCollapsibleSection
                        title='Add Master Time Setting'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        closeButton={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <AddMasterTimeSettingForm onSuccess={closeAddForm} />
                    </HRMSCollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <HRMSCollapsibleSection
                        title='Update Master Time Setting'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'
                        closeButton={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                        }>
                        <UpdateMasterTimeSettingForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                    </HRMSCollapsibleSection>
                </div>
            )}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && <DeleteMasterTimeSettingForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
