'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
// import { GenericDataTable, useDataTableProps } from './_components/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterCourse } from '@/hooks/hrms/useMasters';
import type { IMasterCourseList } from '@/types/hrms/hrms-config/master';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import AddCourseForm from './_components/add-form';
import { columns } from './_components/columns';
import ReorderCourseForm from './_components/reorder-form';
import ToggleMasterCourseForm from './_components/toggle-form';
import UpdateCourseForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterCoursePage(props: { searchParams: SearchParams }) {
    // const [searchParams, setSearchParams] = useState<any>({});
    const searchParams = use(props.searchParams);

    // useEffect(() => {
    //     const fetchParams = async () => {
    //         const params = await props.searchParams;
    //         // Override page and page_size to fetch all records for client-side filtering
    //         setSearchParams({ ...params, page: 1, page_size: 10000 });
    //     };
    //     fetchParams();
    // }, [props.searchParams]);

    const { data: response, isLoading, error } = useMasterCourse(searchParams);

    return (
        <FormProvider<IMasterCourseList>>
            <MasterCoursePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}
function MasterCoursePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterCourseList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Course
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-4 flex justify-end'>
                        <ReorderCourseForm />
                    </div>
                    <GenericDataTable<IMasterCourseList>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading departments...'
                        noDataTitle='No Departments Found'
                        noDataDescription='Get started by creating your first department'
                        errorTitle='Error Loading Departments'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterCourseList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Course'
                        description='Fill in the details below to create a new course'
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
                            <AddCourseForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Course'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateCourseForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterCourseForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
