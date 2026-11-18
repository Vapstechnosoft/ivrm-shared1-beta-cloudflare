'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterClass } from '@/hooks/admission/preadmission/useMasters';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import AddMasterClassForm from './_components/add-form';
import { masterClassColumns } from './_components/columns';
import ReorderClassForm from './_components/reorder-form';
import ToggleMasterClassForm from './_components/toggle-form';
import UpdateMasterClassForm from './_components/update-form';
import ViewDetailsDialog from './_components/view-details-dialog';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterClass(searchParams);

    return (
        <FormProvider<IMasterClassList>>
            <MasterClassPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />
        </FormProvider>
    );
}

function MasterClassPageContent({
    response,
    isLoading,
    error,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams: any;
}) {
    const { openAddForm, openEditForm, isEditFormOpen } = useFormContext<IMasterClassList>();
    const tableProps = useDataTableProps({
        ...response,
        data: response?.data?.list ? response.data.list : Array.isArray(response?.data) ? response.data : []
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const dataList = response?.data?.list ? response.data.list : Array.isArray(response?.data) ? response.data : [];
        if (!isLoading && dataList.length > 0 && searchParams?.asmcl_id) {
            const record = dataList.find((r: IMasterClassList) => String(r.asmcL_Id) === String(searchParams.asmcl_id));
            if (record && !isEditFormOpen) {
                openEditForm(record);
            }
        }
    }, [isLoading, response, searchParams, openEditForm]);

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
                        Add Master Class
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-2 flex justify-end gap-2'>
                        <ViewDetailsDialog />
                        <ReorderClassForm />
                    </div>
                    <GenericDataTable<IMasterClassList>
                        {...tableProps}
                        columns={masterClassColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master classes...'
                        noDataTitle='No Master Classes Found'
                        noDataDescription='Get started by creating your first master class'
                        errorTitle='Error Loading Classes'
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
    } = useFormContext<IMasterClassList>();

    const router = useRouter();

    const handleCloseEdit = () => {
        closeEditForm();
        router.replace(window.location.pathname);
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Class'
                        description='Fill in the details below to create a new master class'
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
                            <AddMasterClassForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Class'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={handleCloseEdit}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateMasterClassForm selectedRow={selectedRow} onSuccess={handleCloseEdit} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterClassForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
