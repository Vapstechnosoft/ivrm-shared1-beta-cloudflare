'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollegeFeeRefundableList } from '@/hooks/fees/college/useCollegeFeeRefundable';
import type { ICollegeFeeRefundableGrid } from '@/types/fees/college/transaction/clgfeerefundable';
import { Plus, Search, X } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import AddCollegeFeeRefundableForm from './_components/add-form';
import { collegeFeeRefundableColumns } from './_components/columns';
import DeleteCollegeFeeRefundableForm from './_components/delete-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeFeeRefundablePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useCollegeFeeRefundableList(searchParams);

    return (
        <FormProvider<ICollegeFeeRefundableGrid>>
            <CollegeFeeRefundablePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function CollegeFeeRefundablePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<ICollegeFeeRefundableGrid>();

    const [searchField, setSearchField] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');
    const [searchAmount, setSearchAmount] = useState<string>('');
    const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
    const [appliedFilter, setAppliedFilter] = useState<{
        field: string;
        text: string;
        amount: string;
        date?: Date;
    } | null>(null);

    const rawGridData = useMemo(() => {
        if (!response) return [];
        return (
            (response?.data as any)?.thirdgrid ||
            (response?.data as any)?.alldata ||
            (response?.data as any)?.saveddata ||
            response?.thirdgrid ||
            response?.alldata ||
            response?.saveddata ||
            (Array.isArray(response?.data) ? response.data : null) ||
            (Array.isArray(response) ? response : [])
        );
    }, [response]);

    const filteredGridData = useMemo(() => {
        if (!rawGridData || !Array.isArray(rawGridData)) return [];
        if (!appliedFilter || !appliedFilter.field) return rawGridData;

        const { field, text, amount, date } = appliedFilter;

        return rawGridData.filter((item: any) => {
            if (field === '0') {
                if (!text.trim()) return true;
                const fullName = [
                    item.amcsT_FirstName || item.AMCST_FirstName || '',
                    item.amcsT_MiddleName || '',
                    item.amcsT_LastName || ''
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return fullName.includes(text.toLowerCase().trim());
            } else if (field === '1') {
                if (!text.trim()) return true;
                const headName = String(item.fmH_FeeName || '').toLowerCase();
                return headName.includes(text.toLowerCase().trim());
            } else if (field === '2') {
                if (!amount.trim()) return true;
                const itemAmount = String(item.fcR_RefundAmount ?? item.fR_RefundAmount ?? '');
                return itemAmount.includes(amount.trim());
            } else if (field === '3') {
                if (!date) return true;
                const itemDate = item.fcR_Date || item.fR_Date;
                if (!itemDate) return false;
                const d1 = new Date(itemDate).toDateString();
                const d2 = new Date(date).toDateString();
                return d1 === d2;
            }
            return true;
        });
    }, [rawGridData, appliedFilter]);

    const normalizedResponse = useMemo(() => {
        if (!response) return response;
        return {
            ...response,
            data: filteredGridData,
            total: filteredGridData.length,
            success: response?.success ?? true,
            message: response?.message
        };
    }, [response, filteredGridData]);

    const tableProps = useDataTableProps(normalizedResponse);
    const totalRecords = rawGridData.length;
    const totalSearchedRecords = appliedFilter ? filteredGridData.length : 0;

    const handleSearch = () => {
        if (!searchField) return;
        setAppliedFilter({
            field: searchField,
            text: searchText,
            amount: searchAmount,
            date: searchDate
        });
    };

    const handleCancelSearch = () => {
        setSearchField('');
        setSearchText('');
        setSearchAmount('');
        setSearchDate(undefined);
        setAppliedFilter(null);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header Actions */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-3'>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>College Fee Refundable</h1>
                        {totalRecords > 0 && (
                            <Badge variant='secondary' className='font-semibold text-xs'>
                                Total Records: {totalRecords}
                            </Badge>
                        )}
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-1.5 h-4 w-4' />
                        Add Refundable
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='FEE REFUNDABLE GRID VIEW'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {/* IVRM Custom Search Bar */}
                    <div className='mb-4 space-y-4 rounded-lg border bg-card p-4 shadow-sm'>
                        <div className='flex flex-wrap items-center gap-6 font-medium text-sm'>
                            <div className='flex items-center gap-2'>
                                <span className='font-semibold text-muted-foreground'>Total Grid Records :</span>
                                <Badge variant='secondary' className='bg-primary/10 px-2.5 py-0.5 font-bold text-primary text-xs'>
                                    {totalRecords}
                                </Badge>
                            </div>
                            {appliedFilter && (
                                <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-muted-foreground'>Total Records Searched :</span>
                                    <Badge
                                        variant='outline'
                                        className='border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 text-xs'>
                                        {totalSearchedRecords}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <div className='grid grid-cols-1 items-end gap-3 border-t pt-1 md:grid-cols-12'>
                            <div className='space-y-1.5 md:col-span-4'>
                                <Label className='font-semibold text-xs'>Search For:</Label>
                                <Select
                                    value={searchField}
                                    onValueChange={(val) => {
                                        setSearchField(val);
                                        setSearchText('');
                                        setSearchAmount('');
                                        setSearchDate(undefined);
                                    }}>
                                    <SelectTrigger className='h-9 text-xs'>
                                        <SelectValue placeholder='--Select Field--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Student Name</SelectItem>
                                        <SelectItem value='1'>Head Name</SelectItem>
                                        <SelectItem value='2'>Refunded Amount</SelectItem>
                                        <SelectItem value='3'>Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {searchField !== '' && (
                                <div className='space-y-1.5 md:col-span-5'>
                                    {(searchField === '0' || searchField === '1') && (
                                        <>
                                            <Label className='font-semibold text-xs'>
                                                {searchField === '0' ? 'Search Text (Student Name):' : 'Search Text (Head Name):'}
                                            </Label>
                                            <InputText
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                                placeholder='Enter search text...'
                                                className='h-9 text-xs'
                                            />
                                        </>
                                    )}
                                    {searchField === '2' && (
                                        <>
                                            <Label className='font-semibold text-xs'>Search Amount:</Label>
                                            <InputText
                                                type='number'
                                                value={searchAmount}
                                                onChange={(e) => setSearchAmount(e.target.value)}
                                                placeholder='Enter search amount...'
                                                className='h-9 text-xs'
                                            />
                                        </>
                                    )}
                                    {searchField === '3' && (
                                        <>
                                            <Label className='font-semibold text-xs'>Search Date:</Label>
                                            <DatePicker date={searchDate} setDate={setSearchDate} placeholder='Select search date' />
                                        </>
                                    )}
                                </div>
                            )}

                            {searchField !== '' && (
                                <div className='flex items-center gap-2 md:col-span-3'>
                                    <Button type='button' size='sm' onClick={handleSearch} className='h-9 min-w-24 text-xs shadow-sm'>
                                        <Search className='mr-1.5 h-3.5 w-3.5' /> Search
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={handleCancelSearch}
                                        className='h-9 min-w-24 text-xs hover:bg-destructive/10 hover:text-destructive'>
                                        <X className='mr-1.5 h-3.5 w-3.5' /> Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <GenericDataTable<ICollegeFeeRefundableGrid>
                        {...tableProps}
                        columns={collegeFeeRefundableColumns}
                        isLoading={isLoading}
                        error={error}
                        isSearchRequired={true}
                        isPaginationRequired={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading college fee refundable records...'
                        noDataTitle='No Refundable Records Found'
                        noDataDescription='Get started by creating your first fee refundable entry'
                        errorTitle='Error Loading Fee Refundable Records'
                    />
                </CollapsibleSection>

                {/* Forms Section */}
                <FormSections pageData={response} />
            </div>
        </div>
    );
}

function FormSections({ pageData }: { pageData?: any }) {
    const { isAddFormOpen, selectedRow, isDeleteFormOpen, closeAddForm, closeDeleteForm, addFormRef } =
        useFormContext<ICollegeFeeRefundableGrid>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Fee Refundable'
                        description='Select academic year, course, branch, semester, student and fee heads to process a refund'
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
                            <AddCollegeFeeRefundableForm pageData={pageData} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Dialog */}
            {isDeleteFormOpen && selectedRow && (
                <DeleteCollegeFeeRefundableForm rowData={selectedRow} onClose={closeDeleteForm} onSuccess={closeDeleteForm} />
            )}
        </>
    );
}
