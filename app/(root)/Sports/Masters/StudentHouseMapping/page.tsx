'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentHouseMapping } from '@/hooks/sports/useStudentHouseMapping';
import type { StudentHouseMappingDTO } from '@/types/sports/masters/student-house-mapping';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddForm from './_components/add-form';
import { columns } from './_components/columns';
import ToggleForm from './_components/toggle-form';
import UpdateForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentHouseMappingPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll } = useStudentHouseMapping(searchParams);

    return (
        <FormProvider<StudentHouseMappingDTO>>
            <StudentHouseMappingContent
                response={loadData.data}
                isLoading={loadData.isPending || loadData.isFetching}
                error={loadData.error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function StudentHouseMappingContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<StudentHouseMappingDTO>();

    const tableProps = useDataTableProps(response, { dataKey: 'alldata' });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Mapping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Student House Mapping List'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<StudentHouseMappingDTO>
                        {...tableProps}
                        totalItems={tableProps.totalItems || tableProps.data.length}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading student house mappings...'
                        noDataTitle='No Mappings Found'
                        noDataDescription='Get started by creating your first mapping'
                        errorTitle='Error Loading Mappings'
                    />
                </CollapsibleSection>

                {/* Forms */}
                {/* Add Form */}
                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection
                            title='Add New Student House Mapping'
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
                                <AddForm
                                    onSuccess={() => {
                                        refetchAll();
                                        closeAddForm();
                                    }}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* Edit Form */}
                {isEditFormOpen && selectedRow && (
                    <div ref={editFormRef}>
                        <CollapsibleSection
                            title='Edit Student House Mapping'
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
                                <UpdateForm
                                    selectedRow={selectedRow}
                                    onSuccess={() => {
                                        refetchAll();
                                        closeEditForm();
                                    }}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* Toggle Form */}
                {isToggleFormOpen && selectedRow && <ToggleForm rowData={selectedRow} onClose={closeToggleForm} onSuccess={refetchAll} />}
            </div>
        </div>
    );
}
