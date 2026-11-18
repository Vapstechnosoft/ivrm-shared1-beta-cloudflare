'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEventsSponsor } from '@/hooks/sports/useEventsSponsor';
import type { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddEventSponsorMappingForm from './_components/add-form';
import { eventSponsorColumns } from './_components/columns';
import UpdateEventSponsorMappingForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EventsSponsorMappingPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll } = useEventsSponsor(searchParams);

    return (
        <FormProvider<IEventSponsorMapping>>
            <EventsSponsorMappingPageContent
                response={loadData.data}
                isLoading={loadData.isPending || loadData.isFetching}
                error={loadData.error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function EventsSponsorMappingPageContent({
    response,
    isLoading,
    error,
    refetchAll
}: { response: any; isLoading: boolean; error: any; refetchAll: () => void }) {
    const { openAddForm, isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IEventSponsorMapping>();

    const gridData = response?.data?.sponsormappingList || [];
    const tableProps = useDataTableProps({ ...response, data: gridData });

    return (
        <div className='container mx-auto space-y-6 p-4'>
            {/* Action Header */}
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-2xl tracking-tight'>Events Sponsor Mapping</h1>
                <Button
                    type='button'
                    onClick={openAddForm}
                    disabled={isAddFormOpen}
                    className='shadow-md transition-all duration-200 hover:scale-105 active:scale-95'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add New Mapping
                </Button>
            </div>

            {/* Add Form Section */}
            {isAddFormOpen && (
                <div ref={addFormRef} className='fade-in slide-in-from-top-4 animate-in duration-300'>
                    <Card className='border-primary/20 shadow-lg'>
                        <CardHeader className='flex flex-row items-center justify-between bg-primary/5 pb-2'>
                            <CardTitle className='font-semibold text-lg'>Add Events Sponsor Mapping</CardTitle>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' />
                            </Button>
                        </CardHeader>
                        <CardContent className='pt-6'>
                            <AddEventSponsorMappingForm
                                onSuccess={() => {
                                    refetchAll();
                                    closeAddForm();
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Form Section */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef} className='fade-in slide-in-from-top-4 animate-in duration-300'>
                    <Card className='border-primary/20 shadow-lg'>
                        <CardHeader className='flex flex-row items-center justify-between bg-primary/5 pb-2'>
                            <CardTitle className='font-semibold text-lg'>Edit Events Sponsor Mapping</CardTitle>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' />
                            </Button>
                        </CardHeader>
                        <CardContent className='pt-6'>
                            <UpdateEventSponsorMappingForm
                                selectedRow={selectedRow as IEventSponsorMapping}
                                onSuccess={() => {
                                    refetchAll();
                                    closeEditForm();
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Data Table Section */}
            <Card className='shadow-md'>
                <CardHeader className='border-b bg-muted/30 pb-3'>
                    <CardTitle className='font-medium text-lg'>Mapping Records</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    <GenericDataTable<IEventSponsorMapping>
                        {...tableProps}
                        columns={eventSponsorColumns}
                        isLoading={isLoading}
                        error={error}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Fetching mapping details...'
                        noDataTitle='No Mapping records'
                        noDataDescription='No sponsor mappings found for the events.'
                        errorTitle='Error loading mappings'
                    />
                </CardContent>
            </Card>
        </div>
    );
}
