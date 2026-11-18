'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterCategoryListData } from '@/hooks/library/useMasters';
import type { IMasterCategoryList } from '@/types/library/masters/masters';
import { X } from 'lucide-react';
import { use } from 'react';
import AddMasterCategoryForm from '../mastercategory/_components/add-form';
import { masterCategoryColumns } from '../mastercategory/_components/columns';
import ToggleMasterCategoryForm from '../mastercategory/_components/toggle-form';
import UpdateMasterCategoryForm from '../mastercategory/_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassCategoryPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useMasterCategoryListData(searchParams);

    return (
        <FormProvider<IMasterCategoryList>>
            <MasterClassCategoryPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function MasterClassCategoryPageContent({
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
    const { isEditFormOpen, selectedRow, closeEditForm } = useFormContext<IMasterCategoryList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Entry Form Section */}
                <CollapsibleSection
                    title={isEditFormOpen ? 'EDIT BOOKS CATEGORY' : 'MASTER BOOKS CATEGORY ENTRY'}
                    description={
                        isEditFormOpen
                            ? 'Update the details of the selected books category'
                            : 'Fill in the details below to create a new books category'
                    }
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='shadow-lg duration-300'>
                    <div className='relative'>
                        {isEditFormOpen && selectedRow ? (
                            <>
                                <button
                                    type='button'
                                    onClick={closeEditForm}
                                    className='-top-[3.5rem] absolute right-12 flex w-fit items-center gap-1 rounded-md border bg-background p-2 text-xs shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </button>
                                <UpdateMasterCategoryForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                            </>
                        ) : (
                            <AddMasterCategoryForm onSuccess={refetchAll} />
                        )}
                    </div>
                </CollapsibleSection>

                {/* List Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    title='BOOKS CATEGORY LIST'
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterCategoryList>
                        {...tableProps}
                        columns={masterCategoryColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading books categories...'
                        noDataTitle='No Books Categories Found'
                        noDataDescription='Get started by creating your first books category'
                        errorTitle='Error Loading Books Categories'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isToggleFormOpen, selectedRow, closeToggleForm } = useFormContext<IMasterCategoryList>();

    return <>{isToggleFormOpen && selectedRow && <ToggleMasterCategoryForm rowData={selectedRow} onClose={closeToggleForm} />}</>;
}
