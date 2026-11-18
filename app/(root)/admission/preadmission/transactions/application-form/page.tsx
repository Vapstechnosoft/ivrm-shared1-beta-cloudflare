'use client';

import { Button } from '@/components/ui/button';
import ParentsDashboard from '@/components/ui/dashboard/parents-dashboard';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { ROLES } from '@/constants';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
import { useActivePreadmissionDetails, useStudentApplicationList } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AddStudentApplicationForm from './_components/add-form';
import { studentApplicationColumns } from './_components/columns';
import PreadmissionStatusCountReport from './_components/preadmission-status-count-report';
import ApplicationFormSuccessDialog from './_components/success-dialog';
import UpdateStudentApplicationForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentApplicationPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
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
                initialTrack={searchParams?.track === 'true'}
            />
        </FormProvider>
    );
}

function StudentApplicationPageContent({
    response,
    isLoading,
    error,
    refetch,
    masterConfig,
    initialTrack = false
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    masterConfig: any;
    initialTrack?: boolean;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { openAddForm } = useFormContext();
    const tableProps = useDataTableProps(response);
    const [isSuccessOpen, setSuccessOpen] = useState(false);
    const [successType, setSuccessType] = useState<'create' | 'update'>('create');
    const [showDashboard, setShowDashboard] = useState(initialTrack);
    const session = useSession();

    useEffect(() => {
        if (session?.status === 'authenticated' && session?.data?.role === undefined) {
            window.location.reload();
        }
    }, [session?.data?.role, session?.status]);

    const onCloseSuccessDialog = () => {
        setSuccessOpen(false);
        refetch();
    };

    const handleTrackApplication = () => {
        setSuccessOpen(false);
        setShowDashboard(true);
        refetch();
        queryClient.invalidateQueries({
            queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD]
        });
        router.replace('/admission/preadmission/transactions/application-form?track=true');
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {session?.data?.role?.toUpperCase() === ROLES.ADMIN && <PreadmissionStatusCountReport />}

                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        {showDashboard && (
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    setShowDashboard(false);
                                    router.replace('/admission/preadmission/transactions/application-form');
                                }}
                                className='flex w-fit items-center gap-2'>
                                <ArrowLeft className='h-4 w-4' />
                                Back to Application List
                            </Button>
                        )}
                    </div>
                    <div className='flex items-center gap-3'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                const next = !showDashboard;
                                setShowDashboard(next);
                                router.replace(`/admission/preadmission/transactions/application-form${next ? '?track=true' : ''}`);
                            }}
                            className='w-fit shadow-sm'>
                            {showDashboard ? 'View Application Table' : 'Track Your Application'}
                        </Button>
                        <Button
                            type='button'
                            onClick={() => {
                                setShowDashboard(false);
                                openAddForm();
                            }}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4' />
                            Preadmission Application
                        </Button>
                    </div>
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
                        onTrack={handleTrackApplication}
                        fee_required={masterConfig?.data?.ispaC_ApplFeeFlag}
                    />
                )}

                {/* Forms */}
                <FormSections
                    setSuccess={(type: 'create' | 'update') => {
                        setSuccessType(type);
                        setSuccessOpen(true);
                    }}
                    refetch={refetch}
                />

                {/* Main Content: Dashboard View or Data Table Section */}
                {showDashboard ? (
                    <div className='mt-2'>
                        <ParentsDashboard className='w-full' />
                    </div>
                ) : (
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
                )}
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
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
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
                                    queryClient.invalidateQueries({
                                        queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD]
                                    });
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && (
                <div ref={editFormRef}>
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
                                    queryClient.invalidateQueries({
                                        queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD]
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
