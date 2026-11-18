'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { ROLES } from '@/constants';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
import { useActivePreadmissionDetails, useStudentApplicationList } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AddStudentApplicationForm from './add-form';
import { studentApplicationColumns } from './columns';
import PreadmissionStatusCountReport from './preadmission-status-count-report';
import ApplicationFormSuccessDialog from './success-dialog';
import UpdateStudentApplicationForm from './update-form';

type SearchParams = { [key: string]: string | string[] | undefined };

type BBHSApplicationFormPageClientProps = {
    searchParams: SearchParams;
};

export default function BBHSApplicationFormPageClient({ searchParams }: BBHSApplicationFormPageClientProps) {
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: response, isLoading, error, refetch } = useStudentApplicationList(activePreadmission?.data?.asmaY_Id ?? 0, searchParams);
    const { data: masterConfig } = useAcademicYearMasterConfiguration(activePreadmission?.data?.asmaY_Id ?? 0);

    return (
        <FormProvider<IPreadmissionStudentApplicationList>>
            <StudentApplicationPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
                masterConfig={masterConfig}
            />
        </FormProvider>
    );
}

function StudentApplicationPageContent({
    response,
    isLoading,
    error,
    refetch,
    masterConfig
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    masterConfig: any;
}) {
    const { openAddForm } = useFormContext();
    const tableProps = useDataTableProps(response);
    const [isSuccessOpen, setSuccessOpen] = useState(false);
    const [successType, setSuccessType] = useState<'create' | 'update'>('create');
    const session = useSession();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handler = () => refetch();
        window.addEventListener('admission:changed', handler as EventListener);
        return () => window.removeEventListener('admission:changed', handler as EventListener);
    }, [refetch]);

    const onCloseSuccessDialog = () => {
        setSuccessOpen(false);
        refetch();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {session?.data?.role?.toUpperCase() === ROLES.ADMIN && <PreadmissionStatusCountReport />}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Preadmission Application
                    </Button>
                </div>
                {isSuccessOpen && (
                    <ApplicationFormSuccessDialog
                        isOpen={isSuccessOpen}
                        title={successType === 'update' ? 'Application Updated Successfully' : 'Application Submitted Successfully'}
                        message={successType === 'update' ? 'Application updated successfully' : 'Successfully submitted application form'}
                        onClose={() => {
                            onCloseSuccessDialog();
                            refetch();
                        }}
                        fee_required={masterConfig?.data?.ispaC_ApplFeeFlag}
                    />
                )}
                <FormSections
                    setSuccess={(type: 'create' | 'update') => {
                        setSuccessType(type);
                        setSuccessOpen(true);
                    }}
                    refetch={refetch}
                />
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='[&_table_tbody_tr:nth-child(even)]:!bg-primary/5 [&_table_tbody_tr[data-state=selected]]:!bg-purple-100 [&_table_tbody_tr:hover]:!bg-purple-200 [&_table_tbody_tr:hover_td]:!bg-purple-200 [&_table_tbody_tr]:cursor-pointer [&_table_tbody_tr]:transition-colors'>
                        <GenericDataTable<IPreadmissionStudentApplicationList>
                            {...tableProps}
                            columns={studentApplicationColumns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading applications...'
                            noDataTitle='No Applications Found'
                            noDataDescription='Get started by creating your first applications'
                            errorTitle='Error Loading Applications'
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}

function FormSections({
    setSuccess,
    refetch
}: {
    setSuccess: (type: 'create' | 'update') => void;
    refetch: () => void;
}) {
    const { isAddFormOpen, closeAddForm, addFormRef, isEditFormOpen, closeEditForm, editFormRef, selectedRow } = useFormContext();
    const queryClient = useQueryClient();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef as React.RefObject<HTMLDivElement> | null}>
                    <CollapsibleSection
                        title='Preadmission Application'
                        description='Fill in the details below to create a new preadmission application'
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
                            <AddStudentApplicationForm
                                onSuccess={() => {
                                    closeAddForm();
                                    setSuccess('create');
                                    refetch();
                                    queryClient.invalidateQueries({
                                        queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_STATUS_COUNT_REPORT]
                                    });
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && (
                <div ref={editFormRef as React.RefObject<HTMLDivElement> | null}>
                    <CollapsibleSection
                        title='Edit Preadmission Application'
                        description='Update the details below to edit the preadmission application'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateStudentApplicationForm
                                rowData={selectedRow}
                                onSuccess={() => {
                                    closeEditForm();
                                    setSuccess('update');
                                    refetch();
                                    queryClient.invalidateQueries({
                                        queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_STATUS_COUNT_REPORT]
                                    });
                                }}
                                onClose={closeEditForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
