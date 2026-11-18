'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useGetGeneralConfiguration } from '@/hooks/preconfiguration/useGeneralConfig';
import type { IGeneralConfiguration, IPageList, IUsernameArray } from '@/types/preconfiguration/general-config';
import { X } from 'lucide-react';
import GenConfigAddForm from './_components/add-form';
import { columns } from './_components/columns';
import { useConfigStore } from './_components/genconfig-store';

export default function GeneralConfigurationPage() {
    const { data: response, isLoading, error, refetch } = useGetGeneralConfiguration();

    return (
        <FormProvider<IGeneralConfiguration>>
            <GeneralConfigurationPageContent response={response} isLoading={isLoading} error={error} onRefresh={refetch} />
        </FormProvider>
    );
}

function GeneralConfigurationPageContent({
    response,
    isLoading,
    error,
    onRefresh
}: {
    response: any;
    isLoading: boolean;
    error: any;
    onRefresh: () => void;
}) {
    const { openAddForm } = useFormContext<IGeneralConfiguration>();
    const { setEditId } = useConfigStore();

    const tableProps = useDataTableProps({
        ...response,
        data: response?.mstConfigList || []
    });

    const handleAddClick = () => {
        setEditId(null);
        openAddForm();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex-1 space-y-2 pt-6 pb-2'>
                    <h2 className='font-bold text-3xl tracking-tight'>General Configuration</h2>
                    <p className='text-muted-foreground'>Manage general settings for the institution.</p>
                </div>

                {/* <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add General Configuration
                    </Button>
                </div> */}

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IGeneralConfiguration>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading general configuration...'
                        noDataTitle='No General Configuration Found'
                        noDataDescription='Get started by creating your first general configuration'
                        errorTitle='Error Loading General Configuration'
                    />
                </CollapsibleSection>

                <FormSections response={response} onRefresh={onRefresh} />
            </div>
        </div>
    );
}

function FormSections({ response, onRefresh }: { response: any; onRefresh: () => void }) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IGeneralConfiguration>();
    const { setEditId } = useConfigStore();

    const handleCloseAdd = () => {
        setEditId(null);
        closeAddForm();
    };

    const handleCloseEdit = () => {
        setEditId(null);
        closeEditForm();
    };

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add General Configuration'
                        description='Fill in the details below to create new settings'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 relative animate-in shadow-lg duration-300'>
                        <Button
                            type='button'
                            onClick={handleCloseAdd}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='mr-1 h-4 w-4 text-destructive' /> Close
                        </Button>
                        <GenConfigAddForm
                            pagelist={(response?.pagelist || []) as IPageList[]}
                            usernamearray={(response?.usernamearray || []) as IUsernameArray[]}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit General Configuration'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 relative animate-in border-primary/20 shadow-lg duration-300'>
                        <Button
                            type='button'
                            onClick={handleCloseEdit}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='mr-1 h-4 w-4 text-destructive' /> Close
                        </Button>
                        <GenConfigAddForm
                            pagelist={(response?.pagelist || []) as IPageList[]}
                            usernamearray={(response?.usernamearray || []) as IUsernameArray[]}
                        />
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
