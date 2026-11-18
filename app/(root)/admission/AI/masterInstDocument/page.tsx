'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterInstDocument } from '@/hooks/admission/AI/useMasterInstDocument';
import type { IMasterInstDocumentList } from '@/types/admission/AI/masterInstDocument';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddDocumentForm from './_components/add-form';
import { masterInstDocumentColumns } from './_components/columns';
import DeleteMasterInstDocumentForm from './_components/delete-form';
import ToggleMasterInstDocumentForm from './_components/toggle-form';
import UpdateMasterInstDocumentForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterInstDocumentPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterInstDocument(searchParams);

    return (
        <FormProvider<IMasterInstDocumentList>>
            <MasterInstDocumentPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterInstDocumentPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterInstDocumentList>();
    const tableProps = useDataTableProps(response);

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
                        Add AI Document
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterInstDocumentList>
                        {...tableProps}
                        columns={masterInstDocumentColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading AI documents...'
                        noDataTitle='No AI Document Found'
                        noDataDescription='Get started by uploading your first AI document'
                        errorTitle='Error Loading AI Documents'
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
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDeleteForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterInstDocumentList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Upload New AI Document'
                        description='Select a file and fill in the details below to upload a new document'
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
                            <AddDocumentForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit AI Document'
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
                            <UpdateMasterInstDocumentForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterInstDocumentForm rowData={selectedRow} onClose={closeToggleForm} />}

            {/* Delete Form */}
            {isDeleteFormOpen && selectedRow && <DeleteMasterInstDocumentForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
