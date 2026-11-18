'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentFeeEnablePartialPayment } from '@/hooks/fees/useTrasactions';
import type { IStudentFeeEnablePartialPaymentList } from '@/types/fees/transactions/transactions';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddStudentFeeEnablePartialPaymentForm from './_components/add-form';
import { studentFeeEnablePartialPaymentColumns } from './_components/columns';
import ToggleStudentFeeEnablePartialPaymentForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentFeeEnablePartialPaymentPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useStudentFeeEnablePartialPayment(searchParams);

    return (
        <FormProvider<IStudentFeeEnablePartialPaymentList>>

            <StudentFeeEnablePartialPaymentContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetchAll={refetchAll}
                searchParams={searchParams}
            />

        </FormProvider>
    );
}

function StudentFeeEnablePartialPaymentContent({
    response,
    isLoading,
    error,
    refetchAll,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
    searchParams?: any;
}) {
    const { openAddForm } = useFormContext<IStudentFeeEnablePartialPaymentList>();

    // Extract table grid data from response
    // Response can be { data: { alldata: [...] } } or { alldata: [...] } or direct array
    const rawData = response?.data ?? response;
    const tableData: IStudentFeeEnablePartialPaymentList[] =
        (Array.isArray(rawData?.alldata) ? rawData.alldata : null) ??
        (Array.isArray((response as any)?.alldata) ? (response as any).alldata : null) ??
        (Array.isArray(rawData) ? rawData : []);

    const totalCount = response?.total ?? rawData?.total ?? response?.data?.total ?? (Array.isArray(tableData) ? tableData.length : 0);

    const currentPage = Number(searchParams?.page ?? 1) || 1;
    const pageSize = Number(searchParams?.page_size ?? 10) || 10;

    // When backend returns all records in alldata at once, slice for current page
    const displayData = tableData.length > pageSize ? tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : tableData;

    const tableProps = useDataTableProps({
        ...response,
        ...(rawData && typeof rawData === 'object' ? rawData : {}),
        data: displayData,
        total: totalCount
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header Action */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Student Fee Enable Partial Payment
                    </Button>
                </div>

                {/* Table Section */}
                <CollapsibleSection
                    title='Student Enable Partial Payment Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IStudentFeeEnablePartialPaymentList>
                        {...tableProps}
                        columns={studentFeeEnablePartialPaymentColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading partial payment details...'
                        noDataTitle='No Partial Payment Records Found'
                        noDataDescription='Add a new student partial payment record to get started'
                        errorTitle='Error Loading Partial Payment Data'
                    />
                </CollapsibleSection>

                {/* Dynamic Form Sections (Add & Toggle) */}
                <FormSections initialData={rawData} />
            </div>
        </div>
    );
}

function FormSections({ initialData }: { initialData?: any }) {
    const { isAddFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeToggleForm, addFormRef } =
        useFormContext<IStudentFeeEnablePartialPaymentList>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Student Enable Partial Payment'
                        description='Fill in the details below to enable partial fee payment for a student'
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
                            <AddStudentFeeEnablePartialPaymentForm initialData={initialData} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && (
                <ToggleStudentFeeEnablePartialPaymentForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
