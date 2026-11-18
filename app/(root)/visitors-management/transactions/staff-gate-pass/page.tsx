'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStaffGatePass } from '@/hooks/visitors-management/transactions/useStaffGatePass';
import type { StaffGatePassData } from '@/types/visitors-management/transactions';
import { Plus, X } from 'lucide-react';
import { staffGatePassColumns } from './_components/columns';
import StaffGatePassForm from './_components/staff-gate-pass-form';

export default function StaffGatePassPage() {
    const { data, isLoading, error, refetch } = useStaffGatePass();
    const listData = data?.alldata || [];
    const empList = data?.emplist || [];
    const departments = data?.filldepartment || [];
    const designations = data?.filldesignation || [];

    return (
        <FormProvider<StaffGatePassData>>
            <StaffGatePassPageContent
                listData={listData}
                empList={empList}
                departments={departments}
                designations={designations}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
            />
        </FormProvider>
    );
}

function StaffGatePassPageContent({
    listData,
    empList,
    departments,
    designations,
    isLoading,
    error,
    refetch
}: {
    listData: StaffGatePassData[];
    empList: any[];
    departments: any[];
    designations: any[];
    isLoading: boolean;
    error: any;
    refetch: any;
}) {
    const { openAddForm, isAddFormOpen, closeAddForm, addFormRef } = useFormContext<StaffGatePassData>();
    const tableProps = useDataTableProps(listData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header Actions */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Generate Gate Pass
                    </Button>
                </div>

                {/* Grid Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    title='Staff Gate Pass List'>
                    <GenericDataTable<StaffGatePassData>
                        {...tableProps}
                        columns={staffGatePassColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Gate Passes...'
                        noDataTitle='No Gate Passes Found'
                        noDataDescription='Get started by generating a new gate pass'
                        errorTitle='Error Loading Records'
                    />
                </CollapsibleSection>

                {/* Form Section */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Staff Gate Pass Form'
                            description='Generate an out pass for staff members'
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
                                <StaffGatePassForm
                                    empList={empList}
                                    departments={departments}
                                    designations={designations}
                                    onSuccess={() => {
                                        closeAddForm();
                                        refetch();
                                    }}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
