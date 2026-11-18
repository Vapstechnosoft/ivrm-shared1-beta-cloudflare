'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useSportsCCNames } from '@/hooks/sports/useSportsCCNames';
import type { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import { AddForm } from './_components/add-form';
import { MasterSportsCCNameColumns } from './_components/columns';
import { ToggleForm } from './_components/toggle-form';
import { UpdateForm } from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SportsCCNamePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll } = useSportsCCNames(searchParams);

    return (
        <FormProvider<SportsCCNameDTO>>
            <SportsCCNamePageContent
                response={loadData.data}
                isLoading={loadData.isPending || loadData.isFetching}
                error={loadData.error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

function SportsCCNamePageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
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
    } = useFormContext<SportsCCNameDTO>();

    const tableData = response?.data?.sportsccName || response?.data?.groupNameList || response?.data || [];
    const totalItems =
        response?.total ||
        response?.data?.total ||
        response?.data?.count ||
        response?.data?.Count ||
        response?.count ||
        tableData.length ||
        0;

    const tableProps = {
        data: tableData,
        totalItems,
        success: response?.success,
        errorMessage: response?.message
    };

    const handleSuccess = () => {
        refetchAll();
        if (isAddFormOpen) closeAddForm();
        if (isEditFormOpen) closeEditForm();
        if (isToggleFormOpen) closeToggleForm();
    };

    const groupNameList = response?.data?.groupNameList || [];

    return (
        <div className='container space-y-4 p-1'>
            <div className='flex items-center justify-between'>
                <Button onClick={openAddForm} className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='mr-2 h-4 w-4' /> Add Master SportsCC Name
                </Button>
            </div>

            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<SportsCCNameDTO>
                    {...tableProps}
                    columns={MasterSportsCCNameColumns}
                    isLoading={isLoading}
                    error={error}
                    showSearchColumns={true}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading master sports cc names...'
                    noDataTitle='No Records Found'
                    errorTitle='Error Loading Names'
                />
            </CollapsibleSection>

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master SportsCC Name'
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
                            <AddForm onSuccess={handleSuccess} onCancel={closeAddForm} groupNameList={groupNameList} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master SportsCC Name'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
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
                                id={selectedRow.spccmscC_Id}
                                onSuccess={handleSuccess}
                                onCancel={closeEditForm}
                                groupNameList={groupNameList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && (
                <ToggleForm
                    id={selectedRow.spccmscC_Id}
                    activeFlag={!!selectedRow.spccmscC_ActiveFlag}
                    onSuccess={handleSuccess}
                    onCancel={closeToggleForm}
                />
            )}
        </div>
    );
}
