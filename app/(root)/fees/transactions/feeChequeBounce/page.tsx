'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeeChequeBounceAcademicYear, useFeeChequeBounceInitialData } from '@/hooks/fees/useTrasactions';
import type { IFeeAcademicYearDropdownList } from '@/types/fees/reports/reports';
import type { IFeeChequeBounceGrid } from '@/types/fees/transactions/feeChequeBounce';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import AddFeeChequeBounceForm from './components/add-form';
import { feeChequeBounceColumns } from './components/columns';
import DeleteFeeChequeBounceForm from './components/delete-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function FeeChequeBouncePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);

    const { data: academicYearResponse, isLoading: loadingYears } = useFeeChequeBounceAcademicYear();

    const academicYears = useMemo<IFeeAcademicYearDropdownList[]>(() => {
        const list = academicYearResponse?.data || [];
        return Array.isArray(list) ? list : [];
    }, [academicYearResponse]);

    useEffect(() => {
        if (!loadingYears && academicYears.length > 0 && selectedAsmayId === null) {
            setSelectedAsmayId(Number(academicYears[academicYears.length - 1].asmaY_Id));
        }
    }, [academicYears, loadingYears, selectedAsmayId]);

    const { data: response, isLoading, error } = useFeeChequeBounceInitialData(searchParams, Number(selectedAsmayId) ?? 0);
    return (
        <FormProvider<IFeeChequeBounceGrid>>
            <FeeChequeBouncePageContent
                response={response}
                isLoading={isLoading}
                error={error}
                academicYears={academicYears}
                loadingYears={loadingYears}
                selectedAsmayId={selectedAsmayId}
                setSelectedAsmayId={setSelectedAsmayId}
            />
        </FormProvider>
    );
}

function FeeChequeBouncePageContent({
    response,
    isLoading,
    error,
    academicYears,
    loadingYears,
    selectedAsmayId,
    setSelectedAsmayId
}: {
    response: any;
    isLoading: boolean;
    error: any;
    academicYears: any[];
    loadingYears: boolean;
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
}) {
    const { openAddForm } = useFormContext<IFeeChequeBounceGrid>();
    const [tableData, setTableData] = useState<any[]>([]);

    useEffect(() => {
        // Feed alldata or year array from API response to the grid
        const alldata = response?.data || response?.alldata || response?.data?.year || response?.year || [];
        if (Array.isArray(alldata)) {
            setTableData(alldata);
        }
    }, [response]);

    const tableProps = useDataTableProps(response);
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-4 rounded-lg border bg-white px-4 py-3 shadow-sm'>
                        <Label className='whitespace-nowrap font-medium text-sm'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            value={selectedAsmayId ? String(selectedAsmayId) : ''}
                            onValueChange={(v) => setSelectedAsmayId(Number(v))}
                            disabled={loadingYears}>
                            <SelectTrigger className='w-64'>
                                <SelectValue placeholder={loadingYears ? 'Loading...' : 'Select Academic Year'} />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears?.map((yr: any) => (
                                    <SelectItem key={yr.asmaY_Id} value={String(yr.asmaY_Id)}>
                                        {yr.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Cheque Bounce
                    </Button>
                </div>

                {/* <CollapsibleSection title='Search Records' defaultOpen={false}>
                    <SearchFeeChequeBounceForm asmayId={asmayId} onSearchResults={handleSearchResults} />
                </CollapsibleSection> */}

                <CollapsibleSection
                    title='Cheque Bounce List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<any>
                        {...tableProps}
                        columns={feeChequeBounceColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Cheque Bounce Records...'
                        noDataTitle='No Records Found'
                        noDataDescription='Get started by adding a new record.'
                        errorTitle='Error Loading Records'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, selectedRow, isDeleteFormOpen, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<IFeeChequeBounceGrid>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Cheque Bounce'
                        description='Fill in the details below to record a cheque bounce.'
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
                            <AddFeeChequeBounceForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDeleteFormOpen && selectedRow && <DeleteFeeChequeBounceForm rowData={selectedRow} onClose={closeDeleteForm} />}
        </>
    );
}
