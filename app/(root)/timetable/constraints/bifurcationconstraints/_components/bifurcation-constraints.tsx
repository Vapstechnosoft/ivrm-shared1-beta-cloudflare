'use client';

import { Button } from '@/components/ui/button';
import { useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationGrid } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { Plus, X } from 'lucide-react';
import type { IBifurcationConstraintList } from './columns';
import BifurcationViewModal from './view-modal';

interface BifurcationConstraintsProps {
    initialData: any; // Result from getBifurcationConstraintsDetails
}

export default function BifurcationConstraints({ initialData }: BifurcationConstraintsProps) {
    return (
        <FormProvider>
            <BifurcationConstraintsContent initialData={initialData} />
        </FormProvider>
    );
}

function BifurcationConstraintsContent({ initialData }: BifurcationConstraintsProps) {
    const { isAddFormOpen, isEditFormOpen, selectedRow, openAddForm, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IBifurcationConstraintList>();

    // Fetch grid data using the hook
    const { data: gridData, isLoading, refetchAll } = usebifurcationGrid();

    // Use fetched data if available, fallback to initialData
    const data = gridData || initialData;

    // tableProps handles pagination object if provided by API, else defaults.
    const tableProps = useDataTableProps(data);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    {!isAddFormOpen && !isEditFormOpen && (
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add Bifurcation Constraints
                        </Button>
                    )}
                </div>

                {/* <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IBifurcationConstraintList>
                        isLoading={isLoading}
                        {...tableProps}
                        //data={dataList}
                        // columns={columns}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading constraints...'
                        noDataTitle='No Bifurcation Constraints Found'
                        noDataDescription='Add a new constraint to get started'
                    />
                </CollapsibleSection> */}

                <FormSections initialData={initialData} refetchAll={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ initialData, refetchAll }: { initialData: any; refetchAll: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDetailsViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDetailsView,
        addFormRef,
        editFormRef
    } = useFormContext<IBifurcationConstraintList>();

    const handleSuccess = () => {
        closeAddForm();
        closeEditForm();
        // Trigger refetch using the hook
        refetchAll();
    };

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Bifurcation Constraints'
                        description='Fill in the details below'
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
                            {/* <BifurcationConstraintsForm initialData={initialData} onSuccess={handleSuccess} onCancel={closeAddForm} /> */}
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Bifurcation Constraints'
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
                            {/* <BifurcationConstraintsForm
                                initialData={initialData}
                                editData={selectedRow}
                                onSuccess={handleSuccess}
                                onCancel={closeEditForm}
                            /> */}
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form (Alert Dialog) */}
            {/* {isToggleFormOpen && selectedRow && (
                <ToggleBifurcationConstraints rowData={selectedRow} onClose={closeToggleForm} onSuccess={handleSuccess} />
            )} */}

            {/* View Details Modal */}
            {isDetailsViewOpen && selectedRow && <BifurcationViewModal rowData={selectedRow} onClose={closeDetailsView} />}
        </>
    );
}
