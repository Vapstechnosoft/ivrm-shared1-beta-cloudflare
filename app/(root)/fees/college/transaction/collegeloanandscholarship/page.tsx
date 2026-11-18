'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCollegeLoanInitialData,
    useCollegeLoanSavedRecords
} from '@/hooks/fees/college/useCollegeLoanAndScholarship';
import type {
    IClgBatch,
    IClgLoanScholarshipRecord,
    IClgStudentItem
} from '@/types/fees/college/transaction/collegeloanandscholarship';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import CollegeLoanAmountEntrySection from './_components/amount-entry-section';
import { collegeLoanColumns } from './_components/columns';
import CollegeLoanDeleteDialog from './_components/delete-dialog';
import CollegeLoanFilterSection from './_components/filter-section';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function CollegeLoanAndScholarshipPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(1);
    const [selectedBatchName, setSelectedBatchName] = useState<string>('2026-2027');

    const { data: initialData, isLoading: loadingBatches } = useCollegeLoanInitialData();
    const { data: response, isLoading, error } = useCollegeLoanSavedRecords(selectedBatchId ?? 1, searchParams);

    const batches: IClgBatch[] = initialData?.batchList || [
        { acmB_Id: 1, acmsN_SessionName: '2026-2027' },
        { acmB_Id: 2, acmsN_SessionName: '2025-2026' },
        { acmB_Id: 3, acmsN_SessionName: '2024-2025' }
    ];

    useEffect(() => {
        if (!selectedBatchId && batches.length > 0) {
            setSelectedBatchId(batches[0].acmB_Id);
            setSelectedBatchName(batches[0].acmsN_SessionName);
        }
    }, [batches, selectedBatchId]);

    return (
        <FormProvider<IClgLoanScholarshipRecord>>
            <CollegeLoanContent
                batches={batches}
                selectedBatchId={selectedBatchId}
                selectedBatchName={selectedBatchName}
                setSelectedBatchId={setSelectedBatchId}
                setSelectedBatchName={setSelectedBatchName}
                loadingBatches={loadingBatches}
                response={response}
                isLoading={isLoading}
                error={error}
            />
        </FormProvider>
    );
}

function CollegeLoanContent({
    batches,
    selectedBatchId,
    selectedBatchName,
    setSelectedBatchId,
    setSelectedBatchName,
    loadingBatches,
    response,
    isLoading,
    error
}: {
    batches: IClgBatch[];
    selectedBatchId: number | null;
    selectedBatchName: string;
    setSelectedBatchId: (id: number | null) => void;
    setSelectedBatchName: (name: string) => void;
    loadingBatches: boolean;
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IClgLoanScholarshipRecord>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen pb-16'>
            <div className='container space-y-5 p-2'>
                {/* Header Action Bar: Batch selector & Add Button */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-center gap-4 rounded-xl border bg-white px-5 py-3 shadow-xs'>
                        <Label className='whitespace-nowrap text-xs font-bold text-gray-700 uppercase'>
                            Batch <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            value={selectedBatchId?.toString() || ''}
                            onValueChange={(v) => {
                                const id = Number(v);
                                setSelectedBatchId(id);
                                const found = batches.find((b) => b.acmB_Id === id);
                                if (found) setSelectedBatchName(found.acmsN_SessionName);
                            }}
                            disabled={loadingBatches}>
                            <SelectTrigger className='w-60 text-xs h-9 bg-gray-50/50'>
                                <SelectValue placeholder='Select Batch' />
                            </SelectTrigger>
                            <SelectContent>
                                {batches.map((item) => (
                                    <SelectItem key={item.acmB_Id} value={String(item.acmB_Id)} className='text-xs'>
                                        {item.acmsN_SessionName}
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
                        Add College Loan & Scholarship
                    </Button>
                </div>

                {/* Saved Records / History Section */}
                <CollapsibleSection
                    title='COLLEGE LOAN & SCHOLARSHIP RECORDS'
                    description='Historical entries of approved institutional loans and scholarships'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IClgLoanScholarshipRecord>
                        {...tableProps}
                        columns={collegeLoanColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Loan & Scholarship records...'
                        noDataTitle='No Loan or Scholarship Records Found'
                        noDataDescription='Get started by clicking Add College Loan & Scholarship above.'
                        errorTitle='Failed to load records'
                    />
                </CollapsibleSection>

                {/* Form Sections for Add / Edit */}
                <FormSections
                    batchId={selectedBatchId ?? 1}
                    batchName={selectedBatchName}
                    selectedBatchId={selectedBatchId}
                    setSelectedBatchId={setSelectedBatchId}
                />
            </div>
        </div>
    );
}

function FormSections({
    batchId,
    batchName,
    selectedBatchId,
    setSelectedBatchId
}: {
    batchId: number;
    batchName: string;
    selectedBatchId: number | null;
    setSelectedBatchId: (id: number | null) => void;
}) {
    const {
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        isDeleteFormOpen,
        closeDeleteForm,
        selectedRow
    } = useFormContext<IClgLoanScholarshipRecord>();

    const [activeStudentsForEntry, setActiveStudentsForEntry] = useState<IClgStudentItem[]>([]);
    const [isEntryOpen, setIsEntryOpen] = useState(false);

    const handleShowStudents = (students: IClgStudentItem[], bId: number) => {
        setActiveStudentsForEntry(students);
        setSelectedBatchId(bId);
        setIsEntryOpen(true);
    };

    const handleReset = () => {
        setActiveStudentsForEntry([]);
        setIsEntryOpen(false);
    };

    return (
        <>
            {/* Add Form Section */}
            {isAddFormOpen && (
                <div ref={addFormRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title='Add College Loan From Institution & Scholarship Amount Entry'
                        description='Select academic criteria, courses, branches, semesters, and students to enter loan and scholarship amounts.'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg relative'>
                        <div className='relative pt-2 space-y-4'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-12 absolute right-0 w-fit border bg-white p-2 shadow-sm hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-1' /> Close
                            </Button>

                            {/* Filter and Selection Section (Card 1) */}
                            <CollegeLoanFilterSection
                                onShowStudents={handleShowStudents}
                                onReset={handleReset}
                                selectedBatchId={selectedBatchId}
                                setSelectedBatchId={setSelectedBatchId}
                            />

                            {/* Amount Entry Interface (Card 2 - Shown when user clicks SHOW) */}
                            {isEntryOpen && activeStudentsForEntry.length > 0 && (
                                <CollegeLoanAmountEntrySection
                                    students={activeStudentsForEntry}
                                    batchId={batchId}
                                    batchName={batchName}
                                    onClose={() => setIsEntryOpen(false)}
                                    onSaved={() => {
                                        setIsEntryOpen(false);
                                        setActiveStudentsForEntry([]);
                                        closeAddForm();
                                    }}
                                />
                            )}
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form Section */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title='Edit College Loan & Scholarship Entry'
                        description={`Modifying approved loan & scholarship amounts for ${selectedRow.studentName}`}
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
                            <CollegeLoanAmountEntrySection
                                students={[
                                    {
                                        amcsT_Id: selectedRow.amcsT_Id,
                                        amcsT_FirstName: selectedRow.studentName,
                                        studentName: selectedRow.studentName,
                                        amcsT_AdmNo: selectedRow.amcsT_AdmNo,
                                        amcO_CourseName: selectedRow.amcO_CourseName,
                                        amB_BranchName: selectedRow.amB_BranchName,
                                        amsE_SEMName: selectedRow.amsE_SEMName,
                                        displayName: `${selectedRow.studentName} - ${selectedRow.amcO_CourseName}-${selectedRow.amB_BranchName}-${selectedRow.amsE_SEMName}`,
                                        applicableFee: 85000,
                                        existingLoanAmount: selectedRow.loanAmount,
                                        existingScholarshipAmount: selectedRow.scholarshipAmount
                                    }
                                ]}
                                batchId={batchId}
                                batchName={batchName}
                                onClose={closeEditForm}
                                onSaved={closeEditForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {isDeleteFormOpen && selectedRow && (
                <CollegeLoanDeleteDialog
                    record={selectedRow}
                    batchId={batchId}
                    onClose={closeDeleteForm}
                />
            )}
        </>
    );
}
