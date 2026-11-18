'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { use } from 'react';

import { useConsecutive } from '@/hooks/timetable/constraints/consecutive';
import type { IConsecutiveConstraintDetails } from '@/types/timetable/constraints/bifurcationconstraints';
import { columns as Consecutivecolumns } from './_components/columns';
import ConsecutiveConstraintsForm from './_components/consecutive-constraints-form';
import ToggleConsecutiveConstraintsForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterConsecutiveConstraintsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useConsecutive(searchParams);

    return (
        <FormProvider<IConsecutiveConstraintDetails>>
            <MasterConsecutiveConstraintsPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function MasterConsecutiveConstraintsPageContent({
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
    const { openAddForm } = useFormContext<IConsecutiveConstraintDetails>();
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
                        Add Consecutive Constraint
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IConsecutiveConstraintDetails>
                        {...tableProps}
                        columns={Consecutivecolumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading consecutive constraints data...'
                        noDataTitle='No Consecutive Constraints Found'
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
    } = useFormContext<IConsecutiveConstraintDetails>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Consecutive Constraint'
                        description='Fill in the details below to create a new Consecutive Constraint'
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
                            <ConsecutiveConstraintsForm onSuccess={closeAddForm} onCancel={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Consecutive Constraint'
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
                            <ConsecutiveConstraintsForm editData={selectedRow} onSuccess={closeEditForm} onCancel={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && <ToggleConsecutiveConstraintsForm rowData={selectedRow} onClose={closeToggleForm} />}

            {/* {isDetailsViewOpen && selectedRow && <BifurcationViewModal rowData={selectedRow} onClose={closeDetailsView} />} */}
        </>
    );
}

// import { getConsecutiveConstraintsDetails } from '@/server/timetable/constraints/consecutive';
// import ConsecutiveConstraints from './_components/consecutive-constraints';

// export default async function ConsecutiveConstraintsPage() {
//     let initialData = null;
//     try {
//         initialData = await getConsecutiveConstraintsDetails();
//     } catch (error: any) {
//         console.error('Failed to load consecutive constraints:', error);
//         initialData = {
//             success: false,
//             message: error?.message || 'Failed to load consecutive constraints',
//             consecutivelst: []
//         };
//     }

//     return <ConsecutiveConstraints initialData={initialData} />;
// }
