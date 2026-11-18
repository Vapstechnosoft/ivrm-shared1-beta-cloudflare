'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useInvMasterItem } from '@/hooks/inventory/masters/use-inv-master-item';
import type { IInvMasterItem } from '@/types/inventory/masters/inv-master-item';
import { Box, Pencil, Plus, PlusCircle, X } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import AddInvMasterItemForm from './_components/add-form';
import { invMasterItemColumns } from './_components/columns';
import ItemTaxDialog from './_components/item-tax-dialog';
import ToggleInvMasterItemForm from './_components/toggle-form';
import UpdateInvMasterItemForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvMasterItemPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useInvMasterItem(searchParams);

    return (
        <FormProvider<IInvMasterItem>>
            <InvMasterItemPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function InvMasterItemPageContent({
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
    const { openAddForm } = useFormContext<IInvMasterItem>();
    const [taxModalItem, setTaxModalItem] = useState<IInvMasterItem | null>(null);

    const enrichedData = useMemo(() => {
        if (!response) return undefined;

        let items = [];
        const payload = response?.data || response;

        // Extract array from various possible API response structures
        if (Array.isArray(response)) {
            items = response;
        } else if (Array.isArray(response?.data)) {
            items = response.data;
        } else if (Array.isArray(response?.get_item)) {
            items = response.get_item;
        } else if (response?.data?.$values) {
            items = response.data.$values;
        } else if (response?.get_item?.$values) {
            items = response.get_item.$values;
        } else if (payload?.$values) {
            items = payload.$values;
        }

        return {
            ...response,
            data: items
        };
    }, [response]);

    const tableProps = useDataTableProps(enrichedData, {
        dataKey: 'data',
        totalKey: 'total'
    });

    useEffect(() => {
        // Expose modal opener to columns component
        (window as any).openTaxModal = (item: IInvMasterItem) => {
            setTaxModalItem(item);
        };
        return () => {
            delete (window as any).openTaxModal;
        };
    }, []);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Item
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    title='Item List'
                    icon={<Box className='h-5 w-5' />}>
                    <GenericDataTable<IInvMasterItem>
                        {...tableProps}
                        data={enrichedData?.data || []}
                        columns={invMasterItemColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading items...'
                        noDataTitle='No Items Found'
                        noDataDescription='Get started by creating your first item'
                        errorTitle='Error Loading Items'
                    />
                </CollapsibleSection>

                <FormSections dropdowns={response || {}} />

                {taxModalItem && <ItemTaxDialog item={taxModalItem} onClose={() => setTaxModalItem(null)} />}
            </div>
        </div>
    );
}

function FormSections({ dropdowns }: { dropdowns: any }) {
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
    } = useFormContext<IInvMasterItem>();

    const safeDropdowns = {
        ...dropdowns,
        get_tax: dropdowns?.get_tax?.$values || (Array.isArray(dropdowns?.get_tax) ? dropdowns?.get_tax : []),
        get_itemgroup: dropdowns?.get_itemgroup?.$values || (Array.isArray(dropdowns?.get_itemgroup) ? dropdowns?.get_itemgroup : []),
        companynames: dropdowns?.companynames?.$values || (Array.isArray(dropdowns?.companynames) ? dropdowns?.companynames : []),
        ledgernames: dropdowns?.ledgernames?.$values || (Array.isArray(dropdowns?.ledgernames) ? dropdowns?.ledgernames : []),
        get_UOM: dropdowns?.get_UOM?.$values || (Array.isArray(dropdowns?.get_UOM) ? dropdowns?.get_UOM : []),
        get_maingroup: dropdowns?.get_maingroup?.$values || (Array.isArray(dropdowns?.get_maingroup) ? dropdowns?.get_maingroup : [])
    };

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Item'
                        description='Fill in the details below to create a new item'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        icon={<PlusCircle className='h-5 w-5' />}>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddInvMasterItemForm dropdowns={safeDropdowns} onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Item'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'
                        icon={<Pencil className='h-5 w-5' />}>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateInvMasterItemForm dropdowns={safeDropdowns} selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isToggleFormOpen && selectedRow && <ToggleInvMasterItemForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
