'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterSection } from '@/hooks/admission/preadmission/useMasters';
import type { IMasterSectionList } from '@/types/admission/preadmission/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddMasterSectionForm from './_components/add-form';
import { masterSectionColumns } from './_components/columns';
import ReorderSectionForm from './_components/reorder-form';
import ToggleMasterSectionForm from './_components/toggle-form';
import UpdateMasterSectionForm from './_components/update-form';
import ViewDetailsDialog from './_components/view-details-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterSectionPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);

    const backendParams: any = { ...searchParams, page_size: 10000, page: 1 };
    delete backendParams.search_query;

    const { data: response, isLoading, error } = useMasterSection(backendParams);

    return (
        <FormProvider<IMasterSectionList>>
            <MasterSectionPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />
        </FormProvider>
    );
}

function MasterSectionPageContent({
    response,
    isLoading,
    error,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams: any;
}) {
    const { openAddForm } = useFormContext<IMasterSectionList>();

    // Client-side filtering and pagination state
    const searchQuery = searchParams?.search_query?.toString().toLowerCase() || '';
    const currentPage = Number.parseInt(searchParams?.page?.toString() || '1', 10);
    const pageSize = Number.parseInt(searchParams?.page_size?.toString() || '10', 10);

    // Normalize response so that data is always an array
    let normalizedResponse = response;
    if (response && response.data && !Array.isArray(response.data)) {
        normalizedResponse = {
            ...response,
            data: response.data.list || response.data.$values || []
        };
    }

    let filteredResponse = normalizedResponse;
    if (normalizedResponse && normalizedResponse.data) {
        const dataArray = Array.isArray(normalizedResponse.data) ? normalizedResponse.data : [];

 let filteredData = [...dataArray].sort(
    (a: any, b: any) => Number(a.asmC_Order) - Number(b.asmC_Order)
);
        if (searchQuery) {
            filteredData = dataArray.filter((item: any) => {
                return (
                    String(item.asmC_SectionCode || '')
                        .toLowerCase()
                        .includes(searchQuery) ||
                    String(item.asmC_SectionName || '')
                        .toLowerCase()
                        .includes(searchQuery) ||
                    String(item.asmC_Order || '')
                        .toLowerCase()
                        .includes(searchQuery) ||
                    String(item.asmC_MaxCapacity || '')
                        .toLowerCase()
                        .includes(searchQuery)
                );
            });
        }

        const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        filteredResponse = {
            ...normalizedResponse,
            data: paginatedData,
            total: filteredData.length
        };
    } else if (Array.isArray(normalizedResponse)) {
        let filteredData = [...normalizedResponse].sort(
    (a: any, b: any) => Number(a.asmC_Order) - Number(b.asmC_Order)
);
        if (searchQuery) {
            filteredData = normalizedResponse.filter((item: any) => {
                return (
                    String(item.asmC_SectionCode || '')
                        .toLowerCase()
                        .includes(searchQuery) ||
                    String(item.asmC_SectionName || '')
                        .toLowerCase()
                        .includes(searchQuery) ||
                    String(item.asmC_Order || '')
                        .toLowerCase()
                        .includes(searchQuery) ||
                    String(item.asmC_MaxCapacity || '')
                        .toLowerCase()
                        .includes(searchQuery)
                );
            });
        }

        const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        filteredResponse = {
            data: paginatedData,
            total: filteredData.length
        };
    }

    const tableProps = useDataTableProps(filteredResponse);

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
                        Add Master Section
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-2 flex justify-end gap-2'>
                        <ViewDetailsDialog />
                        <ReorderSectionForm />
                    </div>
                    <GenericDataTable<IMasterSectionList>
                        {...tableProps}
                        columns={masterSectionColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master Sectiones...'
                        noDataTitle='No Master Sections Found'
                        noDataDescription='Get started by creating your first master section'
                        errorTitle='Error Loading Master Sections'
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
    } = useFormContext<IMasterSectionList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Section'
                        description='Fill in the details below to create a new master section'
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
                            <AddMasterSectionForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Update Master Section'
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
                            <UpdateMasterSectionForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterSectionForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
