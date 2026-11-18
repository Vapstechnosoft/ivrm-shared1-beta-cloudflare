'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterCourse } from '@/hooks/college/useCollegeMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { IMasterCourse } from '@/types/college/masters';
import { Plus, X, ArrowDownUp } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import AddMasterCourseForm from './_components/add-form';
import { getColumns } from './_components/columns';
import ToggleMasterCourseForm from './_components/toggle-form';
import UpdateMasterCourseForm from './_components/update-form';
import OrderMasterCourseForm from './_components/order-form';

export default function MasterCoursePage() {
    const { data: response, isLoading, error } = useMasterCourse();

    return (
        <FormProvider<IMasterCourse>>
            <MasterCoursePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterCoursePageContent({ response, isLoading, error }: { response: any; isLoading: boolean; error: any }) {
    const { openAddForm } = useFormContext<IMasterCourse>();
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));
    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

    const dataList = Array.isArray(response?.data) ? response.data : (response?.masterCourseList || []);

    const filteredData = useMemo(() => {
        if (!searchQuery) return dataList;
        const query = searchQuery.toLowerCase();
        return dataList.filter((item: IMasterCourse) =>
            item.amcO_CourseName?.toLowerCase().includes(query) ||
            item.amcO_CourseCode?.toLowerCase().includes(query) ||
            item.amcO_CourseInfo?.toLowerCase().includes(query) ||
            String(item.amcO_NoOfYears ?? '').toLowerCase().includes(query) ||
            String(item.amcO_NoOfSemesters ?? '').toLowerCase().includes(query) ||
            String(item.amcO_MinAttPer ?? '').toLowerCase().includes(query) ||
            String(item.amcO_Order ?? '').toLowerCase().includes(query)
        );
    }, [dataList, searchQuery]);

    const tableProps = useDataTableProps({ ...response, data: filteredData });

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <div className='flex justify-end gap-2'>
                    <Button type='button' onClick={() => setIsOrderFormOpen(true)} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg' variant='outline'>
                        <ArrowDownUp className='h-4 w-4 mr-2' /> Set Order
                    </Button>
                    <Button type='button' onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' /> Add Course
                    </Button>
                </div>

                <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterCourse>
                        {...tableProps}
                        columns={getColumns()}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading courses...'
                        noDataTitle='No Courses Found'
                        noDataDescription='Get started by creating your first course'
                        errorTitle='Error Loading Courses'
                    />
                </CollapsibleSection>

                <FormSections />
                
                {isOrderFormOpen && (
                    <OrderMasterCourseForm data={dataList} onClose={() => setIsOrderFormOpen(false)} />
                )}
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, isToggleFormOpen, selectedRow, closeAddForm, closeEditForm, closeToggleForm, addFormRef, editFormRef } = useFormContext<IMasterCourse>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection title='Add New Course' description='Fill in the details below' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeAddForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <AddMasterCourseForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection title='Edit Course' defaultOpen={true} variant='outline' size='md' className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button type='button' onClick={closeEditForm} variant='ghost' size='sm' className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive mr-2' /> Close
                            </Button>
                            <UpdateMasterCourseForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterCourseForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
