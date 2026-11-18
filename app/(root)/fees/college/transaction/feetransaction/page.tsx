'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCollegeFeeTransactionAcademicYears,
    useCollegeFeeTransactionList
} from '@/hooks/fees/college/useCollegeTransaction';
import type { ICollegeFeeTransaction } from '@/types/fees/college/transaction/transaction';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import CollegeFeeTransactionAddForm from './_components/add-form';
import { collegeFeeTransactionColumns } from './_components/columns';
import DeleteCollegeFeeTransactionForm from './_components/delete-form';
import CollegeReceiptView from './_components/receiptview';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeFeeTransactionPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const { data: academicYearData, isLoading: loadingYears } = useCollegeFeeTransactionAcademicYears();
    const { data: response, isLoading, error } = useCollegeFeeTransactionList(selectedAsmayId ?? 0, searchParams);

    useEffect(() => {
        if (!loadingYears && academicYearData?.data && (academicYearData.data as any)?.length > 0) {
            const firstItem = (academicYearData.data as any)[0];
            if (!selectedAsmayId) {
                setSelectedAsmayId(firstItem.asmaY_Id);
                setSelectedAcademicYear(firstItem.asmaY_Year);
            }
        }
    }, [loadingYears, academicYearData, selectedAsmayId]);

    return (
        <FormProvider<ICollegeFeeTransaction>>
            <CollegeFeeTransactionContent
                selectedAsmayId={selectedAsmayId}
                setSelectedAsmayId={setSelectedAsmayId}
                selectedAcademicYear={selectedAcademicYear}
                setSelectedAcademicYear={setSelectedAcademicYear}
                academicYearData={academicYearData}
                loadingYears={loadingYears}
                isLoading={isLoading}
                response={response}
                error={error}
            />
        </FormProvider>
    );
}

function CollegeFeeTransactionContent({
    response,
    isLoading,
    error,
    selectedAsmayId,
    selectedAcademicYear,
    setSelectedAsmayId,
    setSelectedAcademicYear,
    loadingYears,
    academicYearData
}: {
    selectedAcademicYear: string;
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    setSelectedAcademicYear: (year: string) => void;
    response: any;
    isLoading: boolean;
    error: any;
    loadingYears: boolean;
    academicYearData: any;
}) {
    const { openAddForm } = useFormContext<ICollegeFeeTransaction>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen pb-12'>
            <div className='container space-y-4 p-2'>
                {/* Header Filter Bar */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-4 rounded-xl border bg-white px-5 py-3 shadow-xs'>
                        <Label className='whitespace-nowrap text-xs font-bold text-gray-700 uppercase'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            value={selectedAsmayId?.toString() || ''}
                            onValueChange={(v) => {
                                const id = Number(v);
                                setSelectedAsmayId(id);
                                const selectedItem = academicYearData?.data?.find(
                                    (item: any) => item.asmaY_Id === id
                                );
                                if (selectedItem) {
                                    setSelectedAcademicYear(selectedItem.asmaY_Year);
                                }
                            }}
                            disabled={loadingYears}>
                            <SelectTrigger className='w-60 text-xs h-9 bg-gray-50/50'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYearData?.data?.map((item: any) => (
                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)} className='text-xs'>
                                        {item.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-1.5'>
                        <Plus className='h-4 w-4' />
                        Add College Fee Transaction
                    </Button>
                </div>



                {/* STUDENT TRANSACTION LIST Table */}
                <CollapsibleSection
                    title='STUDENT TRANSACTION LIST'
                    description='History and records of college fee payments and collections'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ICollegeFeeTransaction>
                        {...tableProps}
                        columns={collegeFeeTransactionColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading College Fee Transactions...'
                        noDataTitle='No College Fee Transactions Found'
                        noDataDescription='Get started by recording a new College Fee Transaction.'
                        errorTitle='Failed to Load Fee Transactions'
                    />
                </CollapsibleSection>
                {/* Form Sections for Add / Edit */}
                <FormSections asmayId={Number(selectedAsmayId ?? 0)} asmayYear={selectedAcademicYear} />
            </div>
        </div>
    );
}

function FormSections({ asmayId, asmayYear }: { asmayId: number; asmayYear: string }) {
    const {
        isAddFormOpen,
        closeAddForm,
        isDetailsViewOpen,
        closeDetailsView,
        addFormRef,
        selectedRow,
        isDeleteFormOpen,
        closeDeleteForm,
        isEditFormOpen,
        closeEditForm,
        editFormRef
    } = useFormContext<ICollegeFeeTransaction>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title='Add College Fee Transaction'
                        description='Fill in student, fee head, and payment mode details to record transaction.'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg relative'>
                        <div className='relative pt-2'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-12 absolute right-0 w-fit border bg-white p-2 shadow-sm hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-1' /> Close
                            </Button>
                            <CollegeFeeTransactionAddForm
                                onSuccess={closeAddForm}
                                asmayId={asmayId}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title='Edit College Fee Transaction'
                        description={`Modifying transaction receipt ${selectedRow.fyp_Receipt_No}`}
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg relative'>
                        <div className='relative pt-2'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-12 absolute right-0 w-fit border bg-white p-2 shadow-sm hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-1' /> Close
                            </Button>
                            <CollegeFeeTransactionAddForm
                                onSuccess={closeEditForm}
                                asmayId={asmayId}
                                initialData={selectedRow}
                                isEdit={true}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isDetailsViewOpen && selectedRow && (
                <CollegeReceiptView
                    rowData={selectedRow}
                    onClose={closeDetailsView}
                    asmayId={asmayId}
                    asmayYear={asmayYear}
                />
            )}

            {isDeleteFormOpen && selectedRow && (
                <DeleteCollegeFeeTransactionForm
                    rowData={selectedRow}
                    asmayId={asmayId}
                    onClose={closeDeleteForm}
                    onSuccess={() => {
                        closeDeleteForm();
                    }}
                />
            )}
        </>
    );
}
