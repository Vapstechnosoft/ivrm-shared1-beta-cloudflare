'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useOutward } from '@/hooks/visitors-management/transactions/useOutward';
import type { OutwardTransactionData } from '@/types/visitors-management/transactions';
import { Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { getColumns } from './_components/columns';
import OutwardForm from './_components/outward-form';

export default function OutwardPage() {
    const { data: loadedData, isLoading, refetch } = useOutward();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<OutwardTransactionData | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const data = loadedData?.getdata || [];

    const handleEdit = (record: OutwardTransactionData) => {
        setSelectedRecord(record);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleAddNew = () => {
        setSelectedRecord(null);
        setIsFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        setSelectedRecord(null);
        refetch();
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedRecord(null);
    };

    const columns = getColumns({ onEdit: handleEdit });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={handleAddNew}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Outward
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable
                        columns={columns}
                        data={data}
                        isLoading={isLoading}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading outward entries...'
                        noDataTitle='No Outward Entries Found'
                        noDataDescription='Add one by clicking the button above'
                    />
                </CollapsibleSection>

                {isFormOpen && (
                    <div ref={formRef}>
                        <CollapsibleSection
                            title={selectedRecord ? 'Edit Outward Entry' : 'Add Outward Entry'}
                            description='Fill in the details below'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeForm}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <OutwardForm onSuccess={handleSuccess} initialData={selectedRecord} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
