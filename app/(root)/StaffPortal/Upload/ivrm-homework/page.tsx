'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { HomeWorkUploadedList, useHomeWork } from '@/hooks/upload/transactions/useHomeWork';
import type { IHomeWorkDetails } from '@/types/upload/reports/homework-upload-report';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AddHomeWorkForm from './_components/add-form';
import { homeWorkColumns } from './_components/columns';
import ToggleHomeWorkForm from './_components/toggle-form';
import UpdateHomeWorkForm from './_components/update-form';

import { viewHomeWorkAttachments } from '@/server/upload/transactions/ivrm-homework/server-action';
import AttachmentViewModal from './_components/attachment-view-modal';
import MarksEntryModal from './_components/marks-entry-modal';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function HomeWorkPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const { data: initialData, isLoading: initialLoading } = useHomeWork();
    const academicYears = initialData?.academicyear || initialData?.yearlist || [];
    const classList = initialData?.classlist || [];

    const { data: response, isLoading, error, refetchAll } = HomeWorkUploadedList(selectedYear ?? 0, searchParams ?? {});

    useEffect(() => {
        if (academicYears && academicYears.length > 0 && !selectedYear) {
            setSelectedYear(academicYears[0].asmaY_Id);
        }
    }, [academicYears, selectedYear]);

    return (
        <FormProvider<IHomeWorkDetails>>
            <HomeWorkContent
                data={response}
                isLoading={isLoading || initialLoading}
                error={error}
                selectedYear={selectedYear ?? 0}
                setSelectedYear={setSelectedYear}
                academicYears={academicYears}
                classList={classList}
                academicYearLoading={initialLoading}
                refetchAll={refetchAll}
                initialData={initialData}
            />
        </FormProvider>
    );
}

function HomeWorkContent({
    data,
    isLoading,
    error,
    selectedYear,
    setSelectedYear,
    academicYears,
    classList,
    academicYearLoading,
    refetchAll,
    initialData
}: {
    data: any;
    isLoading: boolean;
    error: any;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    academicYears: any[];
    classList: any[];
    academicYearLoading: boolean;
    refetchAll: () => void;
    initialData: any;
}) {
    const { openAddForm } = useFormContext<IHomeWorkDetails>();

    const tableProps = useDataTableProps(data);

    // Legacy support: Parse stringified JSON if present in homeworkgridlist
    const processedGrid = useMemo(() => {
        let grid = tableProps.data;
        const gridSource = data?.data?.homeworkgridlist || academicYears?.[0]?.homeworkgridlist || initialData?.homeworkgridlist;

        if (gridSource?.[0]?.IVRM_ClassHomeworkGrid_List) {
            try {
                grid = JSON.parse(gridSource[0].IVRM_ClassHomeworkGrid_List);
            } catch (e) {
                console.error('Failed to parse homework grid list', e);
            }
        } else if (Array.isArray(data?.data)) {
            grid = data.data;
        } else if (Array.isArray(initialData?.homeworkgridlist)) {
            grid = initialData.homeworkgridlist;
        } else {
            grid = [];
        }
        return grid;
    }, [data, academicYears, initialData, tableProps.data]);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div></div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit bg-blue-600 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add HomeWork
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='HomeWork Grid Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='border-blue-100 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-2 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <span className='font-bold text-gray-700 text-sm'>Total Grid Records :</span>
                            <span className='flex h-6 w-fit min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 font-bold text-white text-xs shadow-sm'>
                                {Array.isArray(processedGrid) ? processedGrid.length : 0}
                            </span>
                        </div>
                    </div>
                    <GenericDataTable<IHomeWorkDetails>
                        {...tableProps}
                        data={processedGrid || []}
                        totalItems={Array.isArray(processedGrid) ? processedGrid.length : 0}
                        columns={homeWorkColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['Status'] }}
                        scrollable={true}
                        loadingMessage='Loading homework details...'
                        noDataTitle='No HomeWork Found'
                        noDataDescription='Select academic year or add a new homework entry'
                        errorTitle='Error Loading HomeWork'
                    />
                </CollapsibleSection>

                {/* Forms and Modals */}
                <FormSections yearList={academicYears || []} classList={classList} onSuccess={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({
    onSuccess,
    yearList,
    classList
}: {
    onSuccess: () => void;
    yearList: any[];
    classList: any[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDetailsViewOpen,
        isMarksEntryOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDetailsView,
        closeMarksEntry,
        addFormRef,
        editFormRef
    } = useFormContext<IHomeWorkDetails>();

    const [attachments, setAttachments] = useState<any[]>([]);
    const [isFetchingAttachments, setIsFetchingAttachments] = useState(false);

    useEffect(() => {
        if (isDetailsViewOpen && selectedRow?.IHW_Id) {
            const loadAttachments = async () => {
                setIsFetchingAttachments(true);
                try {
                    const response: any = await viewHomeWorkAttachments(selectedRow.IHW_Id!);
                    let list = [];
                    if (Array.isArray(response.data)) {
                        list = response.data;
                    } else {
                        list = response.data?.attachementlist || response.attachementlist || [];
                    }

                    if (response.success && list.length > 0) {
                        setAttachments(list);
                    } else if (response.success && list.length === 0) {
                        setAttachments([]);
                    } else {
                        setAttachments([]);
                        toast.error(response.message || 'Failed to load attachments');
                    }
                } catch (error) {
                    toast.error('An error occurred while fetching attachments');
                } finally {
                    setIsFetchingAttachments(false);
                }
            };
            loadAttachments();
        } else {
            setAttachments([]);
        }
    }, [isDetailsViewOpen, selectedRow]);

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New HomeWork'
                        description='Fill in the details below to create a new homework entry'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-blue-200 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='absolute top-[-3.7rem] right-12 w-fit border border-red-200 p-2 text-red-600 shadow-sm hover:bg-red-50'>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                            <AddHomeWorkForm
                                onSuccess={() => {
                                    closeAddForm();
                                    onSuccess();
                                }}
                                classList={classList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit HomeWork'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-blue-200 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='absolute top-[-3.7rem] right-12 w-fit border border-red-200 p-2 text-red-600 shadow-sm hover:bg-red-50'>
                                <X className='mr-1 h-4 w-4' /> Close
                            </Button>
                            <UpdateHomeWorkForm
                                selectedRow={selectedRow as any}
                                onSuccess={() => {
                                    closeEditForm();
                                    onSuccess();
                                }}
                                classList={classList}
                                yearList={yearList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form (Activate/Deactivate) */}
            {isToggleFormOpen && selectedRow && (
                <ToggleHomeWorkForm
                    rowData={selectedRow as any}
                    onClose={() => {
                        closeToggleForm();
                        onSuccess();
                    }}
                />
            )}

            {/* Attachment View Modal */}
            <AttachmentViewModal
                isOpen={isDetailsViewOpen}
                onClose={closeDetailsView}
                attachments={attachments}
                title={`Attachments for: ${selectedRow?.IHW_Topic || 'HomeWork'}`}
            />

            {/* Marks Entry Modal */}
            {isMarksEntryOpen && selectedRow && (
                <MarksEntryModal isOpen={isMarksEntryOpen} onClose={closeMarksEntry} selectedRow={selectedRow as any} />
            )}
        </>
    );
}
