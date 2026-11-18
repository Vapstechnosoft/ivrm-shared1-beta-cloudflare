'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usePreAdmissionAcademicYear } from '@/hooks/admission/preadmission/useConfigurations';
import type { IInstitutionItem, IMasterAcademicYearMasterList } from '@/types/admission/preadmission/configaration';
import { Plus, X } from 'lucide-react';
import { Suspense } from 'react';
import AddAcademicYearMasterForm from './_components/add-form';
import { masterAcademicYearColumns } from './_components/columns';
import ReorderAcademicYearForm from './_components/reorder-form';
import TogglePreAdmissionAcademicYearForm from './_components/toggle-form';
import UpdateMasterAcademicYearForm from './_components/update-form';
import ViewDetailsForm from './_components/view-details-form';

export default function MasterAcademicYearPage() {
    return (
        <Suspense fallback={<div className='flex min-h-screen items-center justify-center'>Loading page...</div>}>
            <MasterAcademicYearPageContentWrapper />
        </Suspense>
    );
}

function MasterAcademicYearPageContentWrapper() {
    const { data: academicYearResponse, isLoading: isLoadingAcademicYear, error: academicYearError } = usePreAdmissionAcademicYear();

    return (
        <FormProvider<IMasterAcademicYearMasterList>>
            <MasterAcademicYearPageContent response={academicYearResponse} isLoading={isLoadingAcademicYear} error={academicYearError} />
        </FormProvider>
    );
}

function MasterAcademicYearPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterAcademicYearMasterList>();

    // The API returns: { success, data: list, total: totalRecords, page, page_size }
    const nestedData = response?.data;
    const tableData: IMasterAcademicYearMasterList[] = Array.isArray(nestedData)
        ? nestedData
        : (nestedData?.paginatedList ?? nestedData?.academicList ?? []);
    const totalItems: number = response?.total ?? nestedData?.totalRecords ?? nestedData?.total ?? tableData.length;
    const institutionList: IInstitutionItem[] = nestedData?.institutionList ?? response?.institutionList ?? [];

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
                        Add Master Academic Year
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-2 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end md:gap-0'>
                        <p className='font-semibold text-destructive text-sm'>Note: Only one preadmission flag should be activated.</p>
                        <div className='flex items-center gap-2'>
                            <ViewDetailsForm data={nestedData?.academicList ?? tableData} institution={institutionList[0]} />
                            <ReorderAcademicYearForm />
                        </div>
                    </div>

                    <GenericDataTable<IMasterAcademicYearMasterList>
                        data={tableData}
                        totalItems={totalItems}
                        success={response?.success}
                        errorMessage={response?.message}
                        columns={masterAcademicYearColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master Academic Year...'
                        noDataTitle='No Master Academic Year Found'
                        noDataDescription='Get started by creating your first Master Academic Year'
                        errorTitle='Error Loading Master Academic Year'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections institutionList={institutionList} />
            </div>
        </div>
    );
}

function FormSections({ institutionList }: { institutionList: IInstitutionItem[] }) {
    const {
        isAddFormOpen,
        isToggleFormOpen,
        isEditFormOpen,
        closeToggleForm,
        selectedRow,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterAcademicYearMasterList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Academic Year'
                        description='Fill in the details below to create a new Master Academic Year'
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
                            <AddAcademicYearMasterForm onSuccess={closeAddForm} institutionList={institutionList} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Academic Year'
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
                            <UpdateMasterAcademicYearForm
                                selectedRow={selectedRow as any}
                                onSuccess={closeEditForm}
                                institutionList={institutionList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <TogglePreAdmissionAcademicYearForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
