'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useAppointmentStatus } from '@/hooks/visitors-management/transactions/useAppointmentStatus';
import type { AppointmentStatusVisitorData } from '@/types/visitors-management/transactions';
import AppointmentStatusForm from './_components/appointment-status-form';
import { visitorColumns } from './_components/columns';

export default function AppointmentStatusPage() {
    const { data, isLoading, error, refetch } = useAppointmentStatus();
    const listData = data?.visitorlist || [];

    return (
        <FormProvider<AppointmentStatusVisitorData>>
            <AppointmentStatusPageContent listData={listData} isLoading={isLoading} error={error} refetch={refetch} />
        </FormProvider>
    );
}

function AppointmentStatusPageContent({
    listData,
    isLoading,
    error,
    refetch
}: {
    listData: AppointmentStatusVisitorData[];
    isLoading: boolean;
    error: any;
    refetch: any;
}) {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext<AppointmentStatusVisitorData>();
    const tableProps = useDataTableProps(listData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Grid Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    title='Appointment Status List'>
                    <GenericDataTable<AppointmentStatusVisitorData>
                        {...tableProps}
                        columns={visitorColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Appointments...'
                        noDataTitle='No Appointments Found'
                        noDataDescription='No pending appointments available'
                        errorTitle='Error Loading Appointments'
                    />
                </CollapsibleSection>

                {/* Form Section */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Update Appointment Status'
                            description='Update checkout details and remarks'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <AppointmentStatusForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
                                }}
                            />
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
