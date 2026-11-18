'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookReturnInitialData } from '@/hooks/library/useBookReturn';
import type { IBookReturnList } from '@/types/library/transactions/book-return';
import { BookReturnColumns } from './_components/columns';
import { ReturnForm } from './_components/return-form';

export default function BookReturnTransactionPage() {
    // Initial load with defaults
    const { data, isLoading } = useBookReturnInitialData({
        booktype: 'issue',
        issuertype: 'std',
        bookcat_type: 'book'
    });

    const tableData = ((data as any)?.alldata || (data as any)?.data?.alldata || []) as IBookReturnList[];

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <CollapsibleSection
                title='BOOK RETURN'
                description='Fill in the details below to process a book return'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='shadow-lg duration-300'>
                <ReturnForm
                    onSuccess={() => {
                        // List refreshes automatically via React Query
                    }}
                />
            </CollapsibleSection>

            <CollapsibleSection
                title='TRANSACTION LIST'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable columns={BookReturnColumns} data={tableData} isLoading={isLoading} />
            </CollapsibleSection>
        </div>
    );
}
