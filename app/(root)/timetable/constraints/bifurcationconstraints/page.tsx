'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { use } from 'react';

import { useBifurcationConstraints } from '@/hooks/timetable/useMasters';
import BifurcationConstraintsForm from './_components/bifurcation-constraints-form-add';
import { type IBifurcationConstraintList, masterBifurcationConstraintsColumns } from './_components/columns';
import ToggleBifurcationConstraints from './_components/toggle-form';
import BifurcationViewModal from './_components/view-modal';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterBifurcationConstraintsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useBifurcationConstraints(searchParams);

    console.log('response', response);

    return (
        <FormProvider<IBifurcationConstraintList>>
            <MasterBifurcationConstraintsPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function MasterBifurcationConstraintsPageContent({
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
    const { openAddForm } = useFormContext<IBifurcationConstraintList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <div className='space-y-1'>{/* <Heading title='Mode Of Payment' description='' /> */}</div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Bifurcation Constraint
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IBifurcationConstraintList>
                        {...tableProps}
                        columns={masterBifurcationConstraintsColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master bifurcation constraints data...'
                        noDataTitle='No Master Bifurcation Constraints Found'
                        noDataDescription='Add a new master bifurcation constraint to get started'
                        errorTitle='Error Loading Master Bifurcation Constraints Data'
                    />
                </CollapsibleSection>

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
        isDetailsViewOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef,
        closeDetailsView
    } = useFormContext<IBifurcationConstraintList>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Bifurcation Constraint'
                        description='Fill in the details below to create a new Bifurcation Constraint'
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
                            <BifurcationConstraintsForm onSuccess={closeAddForm} onCancel={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Bifurcation Constraint'
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
                            <BifurcationConstraintsForm selectedRow={selectedRow} onSuccess={closeEditForm} onCancel={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && <ToggleBifurcationConstraints rowData={selectedRow} onClose={closeToggleForm} />}

            {isDetailsViewOpen && selectedRow && <BifurcationViewModal rowData={selectedRow} onClose={closeDetailsView} />}

            {/* View Details Modal */}
            {/* {isDetailsViewOpen && selectedRow && <BifurcationViewModal rowData={selectedRow} onClose={closeDetailsView} />} */}
        </>
    );
}
