'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useTimeTableGenerationGridData } from '@/hooks/timetable/useTransactions';
import type { TTGenerationGridData } from '@/types/timetable/Transaction/timetablegeneration';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import Forms from './_components/Forms';
import { columns } from './_components/columns';
import ToggleTTGeneration from './_components/toggle';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function TimeTableGenerationPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useTimeTableGenerationGridData(searchParams);

    return (
        <FormProvider<TTGenerationGridData>>
            <TimeTableGenerationPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function TimeTableGenerationPageContent({
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
    const { openAddForm } = useFormContext<TTGenerationGridData>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Generation
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<TTGenerationGridData>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading data...'
                        noDataTitle='No Data Found'
                        noDataDescription='Add a new entry to get started'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                <FormSections refetchAll={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ refetchAll }: { refetchAll: () => void }) {
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
    } = useFormContext<TTGenerationGridData>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    {/* <CollapsibleSection
                        title='Add New Master Day'
                        description='Fill in the details below to create a new Master Day'
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
                            <AddMasterDayForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection> */}

                    <CollapsibleSection
                        title='Add New Generation'
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
                            <Forms onFetch={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Generation'
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
                            <Forms onFetch={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && <ToggleTTGeneration rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
