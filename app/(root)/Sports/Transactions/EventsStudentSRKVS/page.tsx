'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';
import type { IEventsStudentSRKVSData } from '@/types/sports/events-student-srkvs';
import { Plus, X } from 'lucide-react';
import { use, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { eventsStudentSRKVSColumns } from './_components/columns';
import EventsStudentSRKVSForm from './_components/srkvs-form';

export default function EventsStudentSRKVSPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll } = useEventsStudentSRKVS(searchParams);

    return (
        <FormProvider {...useForm()}>
            <EventsStudentSRKVSPageContent
                response={loadData.data}
                isLoading={loadData.isPending || loadData.isFetching}
                error={loadData.error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function EventsStudentSRKVSPageContent({ response, isLoading, error, refetchAll }: any) {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    // Normalize: response.data is ApiResponse<IEventsStudentSRKVSData[]>
    const dataList = response?.data || (Array.isArray(response) ? response : []) || [];

    const tableProps = {
        data: dataList,
        totalItems: dataList.length,
        success: response?.success ?? true,
        errorMessage: response?.message
    };

    const handleCloseForm = () => {
        setIsAddFormOpen(false);
        refetchAll();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header Action */}
                <div className='flex justify-end'>
                    {!isAddFormOpen && (
                        <Button
                            type='button'
                            onClick={() => setIsAddFormOpen(true)}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Add SRKVS Mapping
                        </Button>
                    )}
                </div>

                {/* Add Form Section */}
                {isAddFormOpen && (
                    <div className='relative mb-8'>
                        <CollapsibleSection
                            title='Events Student SRKVS'
                            defaultOpen={true}
                            variant='default'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={handleCloseForm}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <EventsStudentSRKVSForm onSuccess={handleCloseForm} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Events Student SRKVS List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IEventsStudentSRKVSData>
                        {...tableProps}
                        columns={eventsStudentSRKVSColumns}
                        isLoading={isLoading}
                        error={error}
                        showSearchColumns={true}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading records...'
                        noDataTitle='No Records Found'
                        noDataDescription='Start by adding a new SRKVS mapping'
                        errorTitle='Error Loading Records'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
