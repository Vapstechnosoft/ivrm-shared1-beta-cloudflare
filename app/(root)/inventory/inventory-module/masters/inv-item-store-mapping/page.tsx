'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useInvItemStoreMapping } from '@/hooks/inventory/masters/use-inv-item-store-mapping';
import type { IInvItemStoreMapping } from '@/types/inventory/masters/inv-item-store-mapping';
import { ListChecks, Plus, X } from 'lucide-react';
import { use, useState } from 'react';
import AddInvItemStoreMappingForm from './_components/add-form';
import { invItemStoreMappingColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvItemStoreMappingPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useInvItemStoreMapping(searchParams);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const is404Error =
        error &&
        ((error as any)?.status === 404 ||
            (error as any)?.response?.status === 404 ||
            error?.message?.includes('404') ||
            error?.message?.toLowerCase()?.includes('not found'));

    const mappedItems = response?.data?.get_mapped_items || [];
    const tableError = is404Error ? null : error;

    const tableProps = useDataTableProps(mappedItems, {
        dataKey: 'get_mapped_items'
    });

    return (
        <div className='min-h-screen bg-slate-50/50 dark:bg-slate-950/50'>
            <div className='container mx-auto max-w-[1600px] space-y-6 p-6'>
                <div className='flex flex-col gap-6 rounded-xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900'>
                    <Heading title='Item Store Mapping' description='Manage associations between items and stores' />
                    <Button
                        type='button'
                        onClick={() => setIsAddFormOpen(true)}
                        className='w-fit bg-primary shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-95'
                        disabled={isAddFormOpen}>
                        <Plus className='mr-2 h-4 w-4' />
                        New Mapping
                    </Button>
                </div>

                {isAddFormOpen && (
                    <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={() => setIsAddFormOpen(false)}
                                variant='ghost'
                                size='sm'
                                className='absolute top-3 right-3 z-10 h-8 w-8 rounded-full p-0 text-destructive hover:bg-destructive/10'>
                                <X className='h-4 w-4' />
                            </Button>
                            <AddInvItemStoreMappingForm response={response} onSuccess={() => setIsAddFormOpen(false)} />
                        </div>
                    </div>
                )}

                <CollapsibleSection
                    title={
                        <div className='flex items-center gap-2'>
                            <ListChecks className='h-5 w-5 text-primary' />
                            <span>Mapped Items</span>
                        </div>
                    }
                    defaultOpen={true}
                    variant='default'
                    className='border-none bg-white shadow-lg dark:bg-slate-900'>
                    <div className='p-1'>
                        <GenericDataTable<IInvItemStoreMapping>
                            {...tableProps}
                            data={mappedItems}
                            columns={invItemStoreMappingColumns}
                            isLoading={isLoading}
                            error={tableError}
                            loadingMessage='Retrieving mapped items...'
                            noDataTitle='No Mappings Found'
                            noDataDescription='Create a new mapping to associate items with stores.'
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
