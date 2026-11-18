'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROLES } from '@/constants';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { useActivePreadmissionDetails, useStudentApplicationList } from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import AddStudentApplicationForm from './_components/add-form';
import { studentApplicationColumns } from './_components/columns';
import HealthForm from './_components/health-form';
import PreadmissionStatusCountReport from './_components/preadmission-status-count-report';
import ApplicationFormSuccessDialog from './_components/success-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentApplicationPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const { data: activePreadmission } = useActivePreadmissionDetails();
    
    const asmayId = Array.isArray(activePreadmission?.data) 
        ? activePreadmission?.data[0]?.asmaY_Id 
        : (activePreadmission?.data as any)?.asmaY_Id ?? 0;

    const { data: response, isLoading, error, refetch } = useStudentApplicationList(asmayId, searchParams);
    const { data: masterConfig } = useAcademicYearMasterConfiguration(asmayId);

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

    useEffect(() => {
        if (session?.status === 'authenticated' && session?.data?.role === undefined) {
            window.location.reload();
        }
    }, [session?.data?.role, session?.status]);

    const onCloseSuccessDialog = () => {
        setSuccessOpen(false);
        window.location.reload();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {session?.data?.role.toUpperCase() === ROLES.ADMIN && <PreadmissionStatusCountReport />}

                <Tabs defaultValue='application' className='w-full space-y-6'>
                    <div className='flex flex-col space-y-4 border-slate-100 border-b pb-4'>
                        <TabsList className='grid h-12 w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-sm'>
                            <TabsTrigger
                                value='application'
                                className='h-10 cursor-pointer rounded-lg bg-sky-50/50 font-bold text-blue-600 text-sm tracking-wide transition-all duration-300 hover:bg-sky-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'>
                                1: Application Form
                            </TabsTrigger>
                            <TabsTrigger
                                value='health'
                                className='h-10 cursor-pointer rounded-lg bg-sky-50/50 font-bold text-blue-600 text-sm tracking-wide transition-all duration-300 hover:bg-sky-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md'>
                                2: Health Form
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {isSuccessOpen && (
                        <ApplicationFormSuccessDialog
                            isOpen={isSuccessOpen}
                            title={successType === 'update' ? 'Application Updated Successfully' : 'Application Submitted Successfully'}
                            message={
                                successType === 'update' ? 'Application updated successfully' : 'Successfully submitted application form'
                            }
                            onClose={() => {
                                onCloseSuccessDialog();
                                refetch();
                            }}
                            fee_required={masterConfig?.data?.ispaC_ApplFeeFlag}
                        />
                    )}

                    <TabsContent value='application' className='fade-in mt-4 animate-in space-y-6 duration-300'>
                        <div className='flex justify-end'>
                            <Button
                                type='button'
                                onClick={openAddForm}
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Plus className='h-4 w-4' />
                                Preadmission Application
                            </Button>
                        </div>
                        {/* Forms */}
                        <FormSections
                            setSuccess={(type: 'create' | 'update') => {
                                setSuccessType(type);
                                setSuccessOpen(true);
                            }}
                            refetch={refetch}
                        />
                        {/* Data Table Section */}
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
                    </TabsContent>

                    <TabsContent value='health' className='fade-in mt-4 animate-in duration-300'>
                        <HealthForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
import UpdateStudentApplicationForm from './_components/update-form';

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
