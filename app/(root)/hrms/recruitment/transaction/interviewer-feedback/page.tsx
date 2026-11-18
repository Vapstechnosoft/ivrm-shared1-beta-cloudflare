'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useGetCandidateInterviewListVMS } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import AddInterviewerFeedbackForm from './_components/add-form';
import { interviewerFeedbackColumns } from './_components/columns';
export default function InterviewerFeedbackPage() {
    const { data: response, isLoading, error, refetchAll } = useGetCandidateInterviewListVMS();
    console.log('response', response);
    return (
        <FormProvider<any>>
            <InterviewerFeedbackPageContent response={response} isLoading={isLoading} refetch={refetchAll} />
        </FormProvider>
    );
}
function InterviewerFeedbackPageContent({
    response,
    isLoading,
    refetch
}: {
    response: any;
    isLoading: boolean;
    refetch: () => void;
}) {
    const gridData = useMemo(() => response?.data?.vmsCandidateInterviewList || response?.vmsCandidateInterviewList || [], [response]);
    const candidateList = useMemo(() => response?.data?.candidateDetailsList || response?.candidateDetailsList || [], [response]);
    const interviewerList = useMemo(() => response?.data?.interviewerList || response?.interviewerList || [], [response]);

    const { openAddForm } = useFormContext();
    const tableProps = useDataTableProps(gridData);
    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                {/* Header */}
                {/* <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Interviewer Feedback
                    </Button>
                </div> */}
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<any>
                        {...tableProps}
                        columns={interviewerFeedbackColumns}
                        isLoading={isLoading}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading feedback...'
                        noDataTitle='No Feedback Found'
                        noDataDescription='Get started by adding your first feedback'
                        errorTitle='Error Loading Feedback'
                    />
                </CollapsibleSection>
                {/* Forms - Below Table */}
                <FormSections refetch={refetch} candidateList={candidateList} interviewerList={interviewerList} />
            </div>
        </div>
    );
}
function FormSections({
    refetch,
    candidateList,
    interviewerList
}: {
    refetch: () => void;
    candidateList: any[];
    interviewerList: any[];
}) {
    const { isAddFormOpen, closeAddForm, addFormRef, isEditFormOpen, closeEditForm, editFormRef } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Interviewer Feedback'
                        description='Fill in the details below to add interviewer feedback'
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
                            <AddInterviewerFeedbackForm
                                onSuccess={() => {
                                    closeAddForm();
                                    refetch();
                                }}
                                onCancel={closeAddForm}
                                candidateList={candidateList}
                                interviewerList={interviewerList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Interviewer Feedback'
                        description='Modify the details of the interviewer feedback below'
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
                            <AddInterviewerFeedbackForm
                                onSuccess={() => {
                                    closeEditForm();
                                    refetch();
                                }}
                                onCancel={closeEditForm}
                                candidateList={candidateList}
                                interviewerList={interviewerList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
