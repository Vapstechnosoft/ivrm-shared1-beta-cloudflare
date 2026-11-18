'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeeOpeningBalanceList, useFeeOpeningPDAList, useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import AddFeeOpeningBalanceForm from './_components/add-form';
import DeleteOpeningBalanceForm from './_components/delete-form';

import type { OpeningBalanceRow } from '@/types/fees/transactions/transactions';
import { openingBalanceColumns } from './_components/columns';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    total?: number;
}

export default function FeeOpeningBalancePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'Fee' | 'PDA'>('Fee');

    const { data: academicYearData, isLoading: loadingYears } = useopeningacademicyerdropdowndatafee();

    // Memoize searchParams to prevent infinite loop
    const searchParamsString = useMemo(() => searchParams?.toString() || '', [searchParams]);
    const memoizedSearchParams = useMemo(() => searchParams, [searchParamsString]);

    // Prepare API params
    const apiSearchParams = useMemo(() => {
        return searchParams ? Object.fromEntries(searchParams.entries()) : {};
    }, [searchParamsString]);

    const {
        data: feeResponse,
        isLoading: feeLoading,
        refetch: refetchFee,
        isFetching: isFeeFetching
    } = useFeeOpeningBalanceList(selectedAsmayId || 0, apiSearchParams as any);

    const {
        data: pdaResponse,
        isLoading: pdaLoading,
        refetch: refetchPDA,
        isFetching: isPdaFetching
    } = useFeeOpeningPDAList(selectedAsmayId || 0, apiSearchParams as any);

    const feeData: OpeningBalanceRow[] = (feeResponse as ApiResponse<OpeningBalanceRow[]>)?.data ?? [];
    const pdaData: OpeningBalanceRow[] = (pdaResponse as ApiResponse<OpeningBalanceRow[]>)?.data ?? [];

    const totalFeeRecords = (feeResponse as ApiResponse<OpeningBalanceRow[]>)?.total ?? 0;
    const totalPdaRecords = (pdaResponse as ApiResponse<OpeningBalanceRow[]>)?.total ?? 0;
    const totalRecords = activeTab === 'Fee' ? totalFeeRecords : totalPdaRecords;

    const isLoading = activeTab === 'Fee' ? feeLoading || isFeeFetching : pdaLoading || isPdaFetching;
    const tableData: OpeningBalanceRow[] = activeTab === 'Fee' ? feeData : pdaData;

    const refetchAll = useCallback(() => {
        if (activeTab === 'Fee') {
            refetchFee();
        } else {
            refetchPDA();
        }
    }, [activeTab, refetchFee, refetchPDA]);

    // Handle page change from the table
    const handlePageChange = useCallback(
        (newPage: number) => {
            const params = new URLSearchParams(searchParams?.toString());
            params.set('page', newPage.toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, router, pathname]
    );

    // Handle page size change
    const handlePageSizeChange = useCallback(
        (newPageSize: number) => {
            const params = new URLSearchParams(searchParams?.toString());
            params.set('pageSize', newPageSize.toString());
            params.set('page', '1'); // Reset to first page
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, router, pathname]
    );

    return (
        <FormProvider<OpeningBalanceRow>>
            <PageContent
                selectedAsmayId={selectedAsmayId}
                setSelectedAsmayId={setSelectedAsmayId}
                academicYearData={academicYearData}
                loadingYears={loadingYears}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tableData={tableData}
                totalRecords={totalRecords}
                isLoading={isLoading}
                refetchAll={refetchAll}
                searchParams={memoizedSearchParams}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </FormProvider>
    );
}

function PageContent({
    selectedAsmayId,
    setSelectedAsmayId,
    academicYearData,
    loadingYears,
    activeTab,
    setActiveTab,
    tableData,
    totalRecords,
    isLoading,
    refetchAll,
    searchParams,
    onPageChange,
    onPageSizeChange
}: {
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    academicYearData: any;
    loadingYears: boolean;
    activeTab: 'Fee' | 'PDA';
    setActiveTab: (tab: 'Fee' | 'PDA') => void;
    tableData: OpeningBalanceRow[];
    totalRecords: number;
    isLoading: boolean;
    refetchAll: () => void;
    searchParams: ReturnType<typeof useSearchParams>;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}) {
    const { openAddForm } = useFormContext<OpeningBalanceRow>();

    // Get current page and pageSize from URL
    const currentPage = Number(searchParams?.get('page')) || 1;
    const currentPageSize = Number(searchParams?.get('pageSize')) || 10;

    // Use data table props
    const tableProps = useDataTableProps({
        data: tableData,
        totalItems: totalRecords,
        searchParams,
        onPageChange,
        onPageSizeChange
    });

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container mx-auto space-y-6 p-6'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                    <div className='flex items-center gap-6 rounded-lg border bg-white px-5 py-4 shadow-sm'>
                        <Label className='whitespace-nowrap text-right'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            value={selectedAsmayId?.toString() || ''}
                            onValueChange={(v) => setSelectedAsmayId(v ? Number(v) : null)}
                            disabled={loadingYears}>
                            <SelectTrigger className='w-64'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYearData?.data?.map((item: any) => (
                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                        {item.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='mr-auto flex gap-12 rounded-lg border bg-white px-7 py-4 shadow-sm'>
                        {(['Fee', 'PDA'] as const).map((val) => (
                            <label key={val} className='flex cursor-pointer gap-3'>
                                <input
                                    type='radio'
                                    name='openingType'
                                    value={val}
                                    checked={activeTab === val}
                                    onChange={() => setActiveTab(val)}
                                    className='h-6 w-6 text-blue-600 accent-blue-600'
                                />
                                <span className='font-semibold text-lg'>{val}</span>
                            </label>
                        ))}
                    </div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        // disabled={!selectedAsmayId}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                    >
                        <Plus className='h-4 w-4' />
                        Add Fee Opening Balance
                    </Button>
                </div>

                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='rounded-xl border bg-white shadow-xl'>
                    {!selectedAsmayId ? (
                        <div className='py-24 text-center'>
                            <p className='font-semibold text-2xl text-muted-foreground'>Please select an Academic Year</p>
                            <p className='mt-3 text-lg text-muted-foreground'>
                                to view {activeTab === 'Fee' ? 'Fee' : 'PDA'} opening balance records
                            </p>
                        </div>
                    ) : (
                        <GenericDataTable<OpeningBalanceRow>
                            {...tableProps}
                            columns={openingBalanceColumns}
                            isLoading={isLoading}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage={`Loading ${activeTab} Opening Balances...`}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    )}
                </CollapsibleSection>

                <FormSections refetch={refetchAll} activeTab={activeTab} selectedAsmayId={selectedAsmayId} />
            </div>
        </div>
    );
}

function FormSections({
    refetch,
    activeTab,
    selectedAsmayId
}: { refetch: () => void; activeTab: 'Fee' | 'PDA'; selectedAsmayId: number | null }) {
    const { isAddFormOpen, isDeleteFormOpen, selectedRow, closeAddForm, closeDeleteForm, addFormRef } = useFormContext<OpeningBalanceRow>();

    const handleAddSuccess = useCallback(() => {
        closeAddForm();
        refetch();
    }, [closeAddForm, refetch]);

    const handleDeleteSuccess = useCallback(() => {
        closeDeleteForm();
        refetch();
    }, [closeDeleteForm, refetch]);

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Opening Balance'
                        description='Enter opening balance for students'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-2xl'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>

                            <AddFeeOpeningBalanceForm academicYear={selectedAsmayId} onSuccess={handleAddSuccess} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDeleteFormOpen && selectedRow && (
                <DeleteOpeningBalanceForm
                    rowData={selectedRow}
                    activeTab={activeTab}
                    onClose={closeDeleteForm}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}
