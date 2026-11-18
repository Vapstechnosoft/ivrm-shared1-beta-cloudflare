'use client';

import { use, useState } from 'react';

import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import ProductQtyTab from './_components/product-qty-tab';
import ProductTab from './_components/product-tab';
import ToggleProductForm from './_components/toggle-form';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function InvMasterProductPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    return (
        <FormProvider<any>>
            <InvMasterProductContent searchParams={searchParams} />
        </FormProvider>
    );
}

function InvMasterProductContent({ searchParams }: { searchParams: any }) {
    const [, setPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [, setPageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [, setSearchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const [activeTab, setActiveTab] = useState('product');
    const { isToggleFormOpen, selectedRow, closeToggleForm, openAddForm, closeAddForm, closeEditForm } = useFormContext<any>();

    const onTabChange = (value: string) => {
        setActiveTab(value);
        setPage(1);
        setPageSize(10);
        setSearchQuery(null);
        closeAddForm();
        closeEditForm();
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <Tabs value={activeTab} onValueChange={onTabChange} className='w-full'>
                        <div className='mb-4 flex w-full items-center justify-between'>
                            <TabsList>
                                <TabsTrigger value='product'>Product</TabsTrigger>
                                <TabsTrigger value='productQty'>Product Quantity</TabsTrigger>
                            </TabsList>
                            <Button
                                type='button'
                                onClick={openAddForm}
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Plus className='mr-2 h-4 w-4' />
                                Add {activeTab === 'product' ? 'Product' : 'Quantity'}
                            </Button>
                        </div>
                        <TabsContent value='product' className='space-y-4'>
                            <ProductTab searchParams={searchParams} />
                        </TabsContent>
                        <TabsContent value='productQty' className='space-y-4'>
                            {activeTab === 'productQty' && <ProductQtyTab searchParams={searchParams} />}
                        </TabsContent>
                    </Tabs>
                </div>

                {isToggleFormOpen && selectedRow && <ToggleProductForm rowData={selectedRow} onClose={closeToggleForm} />}
            </div>
        </div>
    );
}
