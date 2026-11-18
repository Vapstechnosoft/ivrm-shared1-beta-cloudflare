'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterHouses } from '@/hooks/sports/useMasterHouses';
import type { IMasterHouse } from '@/types/sports/masters/house';
import { Plus, X } from 'lucide-react';
import AddMasterHouseForm from './_components/add-form';
import { MasterHouseColumns } from './_components/columns';
import ToggleMasterHouseForm from './_components/toggle-form';
import UpdateMasterHouseForm from './_components/update-form';

import { use } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterHousePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll } = useMasterHouses(searchParams);

    return (
        <FormProvider<IMasterHouse>>
            <MasterHousePageContent
                response={loadData.data}
                isLoading={loadData.isPending || loadData.isFetching}
                error={loadData.error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function MasterHousePageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterHouse>();

    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add House
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterHouse>
                        {...tableProps}
                        columns={MasterHouseColumns}
                        isLoading={isLoading}
                        error={error}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Houses...'
                        noDataTitle='No Houses Found'
                        noDataDescription='Get started by creating your first House'
                        errorTitle='Error Loading Houses'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <>
                    {/* Add Form */}
                    {isAddFormOpen && (
                        <div ref={addFormRef}>
                            <CollapsibleSection
                                title='Add New House'
                                description='Fill in the details below to create a new House'
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
                                    <AddMasterHouseForm
                                        onSuccess={() => {
                                            refetchAll();
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
                                title='Edit House'
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
                                    <UpdateMasterHouseForm
                                        key={selectedRow.spccmH_Id}
                                        selectedRow={selectedRow}
                                        onSuccess={() => {
                                            refetchAll();
                                            closeEditForm();
                                        }}
                                    />
                                </div>
                            </CollapsibleSection>
                        </div>
                    )}
                </>

                {/* Toggle Form */}
                {isToggleFormOpen && selectedRow && (
                    <ToggleMasterHouseForm rowData={selectedRow} onClose={closeToggleForm} onSuccess={refetchAll} />
                )}
            </div>
        </div>
    );
}
