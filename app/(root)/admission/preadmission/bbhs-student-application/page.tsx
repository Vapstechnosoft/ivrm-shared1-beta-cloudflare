'use client';

import BBHSAddStudentApplicationForm from '@/app/(root)/admission/preadmission/bbhs-student-application/_components/add-form';
import { bbhsStudentApplicationColumns } from '@/app/(root)/admission/preadmission/bbhs-student-application/_components/columns';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { ROLES } from '@/constants';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
import {
    getActivePreadmissionDetails,
    getStudentApplicationList
} from '@/server/admission/preadmission/transactions/bbhs_student_application';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import PreadmissionStatusCountReport from '../transactions/application-form/_components/preadmission-status-count-report';
import ApplicationFormSuccessDialog from '../transactions/application-form/_components/success-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function BBHSStudentApplicationPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);

    const { data: activePreadmission } = useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ACTIVE_PREADMISSION_DETAILS, 'bbhs'],
        queryFn: () => getActivePreadmissionDetails()
    });

    const asmay_id = activePreadmission?.data?.asmaY_Id ?? 0;

    const {
        data: response,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_APPLICATION_LIST, asmay_id, searchParams],
        queryFn: () => getStudentApplicationList(asmay_id, searchParams),
        enabled: !!asmay_id
    });

    const { data: masterConfig } = useAcademicYearMasterConfiguration(asmay_id);

    return (
        <FormProvider<IPreadmissionStudentApplicationList>>
            <BBHSStudentApplicationContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
                masterConfig={masterConfig}
            />
        </FormProvider>
    );
}

function BBHSStudentApplicationContent({
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

    useEffect(() => {
        if (session?.data?.role === undefined && session?.status === 'authenticated') {
            window.location.reload();
        }
    }, [session?.data?.role, session?.status]);

    const onCloseSuccessDialog = () => {
        setSuccessOpen(false);
        refetch();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                        <h1 className='font-bold text-2xl text-primary'>Baldwin Boys&apos; High School - Student Application</h1>
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='mr-2 h-4 w-4' />
                            New Application
                        </Button>
                    </div>

                    {session?.data?.role.toUpperCase() === ROLES.ADMIN && <PreadmissionStatusCountReport />}
                </div>

                {isSuccessOpen && (
                    <ApplicationFormSuccessDialog
                        isOpen={isSuccessOpen}
                        title={successType === 'update' ? 'Application Updated Successfully' : 'Application Submitted Successfully'}
                        message={successType === 'update' ? 'Application updated successfully' : 'Successfully submitted application form'}
                        onClose={onCloseSuccessDialog}
                        fee_required={masterConfig?.data?.ispaC_ApplFeeFlag}
                    />
                )}

                {/* Forms Section */}
                <FormSections
                    setSuccess={(type: 'create' | 'update') => {
                        setSuccessType(type);
                        setSuccessOpen(true);
                    }}
                    refetch={refetch}
                />

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Student Applications'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='[&_table_tbody_tr:nth-child(even)]:!bg-primary/5 [&_table_tbody_tr[data-state=selected]]:!bg-purple-100 [&_table_tbody_tr:hover]:!bg-purple-200 [&_table_tbody_tr:hover_td]:!bg-purple-200 [&_table_tbody_tr]:cursor-pointer [&_table_tbody_tr]:transition-colors'>
                        <GenericDataTable<IPreadmissionStudentApplicationList>
                            {...tableProps}
                            columns={bbhsStudentApplicationColumns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading applications...'
                            noDataTitle='No Applications Found'
                            noDataDescription='Get started by creating your first application'
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
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Student Application Form'
                        description='Fill in the details below to create a new application for Baldwin Boys&apos; High School'
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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <BBHSAddStudentApplicationForm
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

            {/* Edit Form - Shared or Specialized as needed. For now, using same as Add for simplicity in migration */}
            {isEditFormOpen && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Student Application'
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
                                <X className='mr-2 h-4 w-4 text-destructive' /> Close
                            </Button>
                            <p className='p-4 text-muted-foreground italic'>
                                Edit functionality will be implemented following the Add form completion.
                            </p>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
