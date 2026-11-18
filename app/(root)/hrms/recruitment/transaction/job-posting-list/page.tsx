'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useGetBasicDataJobListVMS } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { Plus, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import AddJobPostingForm from './_components/add-form';
import { jobPostingListColumns } from './_components/columns';

export default function JobPostingListPage() {
    const { data: response, isLoading, error, refetchAll } = useGetBasicDataJobListVMS();
    console.log('response ', response);
    const [formOpen, setFormOpen] = useState(false);

    const openAddForm = () => {
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
    };

    const gridResponse = useMemo(() => {
        return response?.data?.vmsmrfList ?? [];
    }, [response]);

    const tableProps = useDataTableProps(gridResponse);

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-6 px-4 py-6 md:px-6 lg:px-8'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Job
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<any>
                        {...tableProps}
                        columns={jobPostingListColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading job postings...'
                        noDataTitle='No Job Postings Found'
                        noDataDescription='Get started by creating your first job posting'
                        errorTitle='Error Loading Job Postings'
                    />
                </CollapsibleSection>

                {/* Forms - Below Table */}
                {formOpen && (
                    <FormSections
                        refetch={refetchAll}
                        basicDataResponse={response}
                        isLoadingBasicData={isLoading}
                        onClose={handleCloseForm}
                    />
                )}
            </div>
        </div>
    );
}

function FormSections({
    refetch,
    basicDataResponse,
    isLoadingBasicData,
    onClose
}: {
    refetch: () => void;
    basicDataResponse: any;
    isLoadingBasicData: boolean;
    onClose: () => void;
}) {
    const handleSuccess = useCallback(() => {
        onClose();
        refetch();
    }, [onClose, refetch]);

    return (
        <div className='slide-in-from-top-4 animate-in'>
            <CollapsibleSection
                title='Job Posting'
                description='Fill in the details below to create a new job posting'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <div className='relative'>
                    <Button
                        type='button'
                        onClick={onClose}
                        variant='ghost'
                        size='sm'
                        className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                        <X className='h-4 w-4 text-destructive' /> Close
                    </Button>
                    <AddJobPostingForm
                        basicDataResponse={basicDataResponse}
                        isLoadingBasicData={isLoadingBasicData}
                        onSuccess={handleSuccess}
                        onCancel={onClose}
                    />
                </div>
            </CollapsibleSection>
        </div>
    );
}
