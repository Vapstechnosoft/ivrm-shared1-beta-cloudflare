'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { usePcRequisition } from '@/hooks/pettycash/transaction/pcREQUISITION';
import type { ApiSearchparams } from '@/types';
import type { IPcRequisition } from '@/types/pettycash/transaction/pcREQUISITION';
import { Plus, X } from 'lucide-react';
import { use, useState } from 'react';
import AddPcRequisitionForm from './components/add-form';

import { pcRequisitionColumns } from './components/column';
import TogglePcRequisitionForm from './components/toggle';
import PcRequisitionViewModal from './components/view-modal';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function PcRequisitionPage(props: { searchParams: SearchParams }) {
    const initialSearchParams = use(props.searchParams);

    return (
        <FormProvider<IPcRequisition>>
            <PcRequisitionPageContent initialSearchParams={initialSearchParams as ApiSearchparams} />
        </FormProvider>
    );
}

function PcRequisitionPageContent({
    initialSearchParams
}: {
    initialSearchParams: ApiSearchparams;
}) {
    // Normalize values coming from Next `searchParams` (often strings) so pagination/search init is stable.
    const [apiParams, setApiParams] = useState<ApiSearchparams>(() => {
        const p: any = initialSearchParams ?? {};
        return {
            ...p,
            page: p.page !== undefined ? Number(p.page) : undefined,
            page_size: p.page_size !== undefined ? Number(p.page_size) : undefined,
            search_query: typeof p.search_query === 'string' ? p.search_query : undefined,
            sort_column: typeof p.sort_column === 'string' ? p.sort_column : undefined,
            sort_direction: typeof p.sort_direction === 'string' ? p.sort_direction : undefined,
            search_columns: typeof p.search_columns === 'string' ? p.search_columns : undefined
        };
    });

    const { data: response, isLoading, error, refetch } = usePcRequisition(apiParams);

    const { openAddForm } = useFormContext<IPcRequisition>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'></div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Requisition
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IPcRequisition>
                        {...tableProps}
                        columns={pcRequisitionColumns}
                        isLoading={isLoading}
                        error={error}
                        showSearch={true}
                        showPagination={true}
                        showSorting={true}
                        currentApiParams={apiParams}
                        onSearchQueryChange={(value) => setApiParams(value)}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading requisitions...'
                        noDataTitle='No Requisitions Found'
                        noDataDescription='Start by adding a new requisition.'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections refetch={refetch} />
            </div>
        </div>
    );
}

function FormSections({ refetch }: { refetch: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        isDetailsViewOpen,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext<IPcRequisition>();

    // Success handler that refetches data
    const handleSuccess = () => {
        refetch();
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Requisition'
                        description='Fill in the details below to create a new requisition'
                        defaultOpen
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
                            <AddPcRequisitionForm
                                onSuccess={() => {
                                    handleSuccess();
                                    closeAddForm();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Requisition'
                        description='Update the details of the selected requisition'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='outline'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <div className='rounded-md border p-4 text-center text-muted-foreground italic'>
                                Edit logic will be implemented here. For now, please use Add.
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <TogglePcRequisitionForm rowData={selectedRow} onClose={closeToggleForm} onSuccess={handleSuccess} />
            )}

            {/* View Modal */}
            {isDetailsViewOpen && selectedRow && <PcRequisitionViewModal rowData={selectedRow} onClose={closeDetailsView} />}
        </>
    );
}
