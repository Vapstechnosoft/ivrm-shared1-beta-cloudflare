'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvMasterProduct } from '@/hooks/inventory/masters/use-inv-master-product';
import { getInvMasterItemList, getInvMasterProductList } from '@/server/inventory/masters/inv-master-product';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, PlusCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { getProductQtyColumns } from './product-columns';

const formSchema = z.object({
    invmpI_Id: z.number().optional(),
    invmP_Id: z.coerce.number().min(1, 'Product is required'),
    invmI_Id: z.coerce.number().min(1, 'Item is required'),
    invmpI_ItemQty: z.coerce.number().min(1, 'Quantity must be greater than 0')
});

interface ProductQtyTabProps {
    searchParams?: any;
}

export default function ProductQtyTab({ searchParams }: ProductQtyTabProps) {
    console.log('ProductQtyTab - MOUNTED/RENDERED');

    const { productItemData, isProductItemLoading, saveProductQtyMutation, refreshAll } =
        useInvMasterProduct(undefined, searchParams ?? {});

    const { isAddFormOpen, isEditFormOpen, closeAddForm, closeEditForm, openEditForm, addFormRef, editFormRef } = useFormContext<any>();

    const [products, setProducts] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const productRes = await getInvMasterProductList();
                const pRes = productRes as any;
                if (isMounted && pRes?.success && Array.isArray(pRes.data)) {
                    setProducts(pRes.data);
                }

                const itemRes = await getInvMasterItemList();
                const iRes = itemRes as any;
                if (isMounted && iRes?.success && Array.isArray(iRes.data)) {
                    setItems(iRes.data);
                }
            } catch (error) {
                console.error('ProductQtyTab: Failed to fetch dropdown data', error);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [productItemData]);

    const enrichedData = useMemo(() => {
        if (!productItemData) return undefined;
        const itemsList =
            (productItemData as any)?.get_product_item ||
            (productItemData as any)?.data ||
            (Array.isArray(productItemData) ? productItemData : []);
        const total =
            (productItemData as any)?.total ||
            (productItemData as any)?.data?.total ||
            (Array.isArray(itemsList) ? itemsList.length : 0);
        return {
            ...productItemData,
            data: itemsList,
            total
        };
    }, [productItemData]);

    const data = enrichedData?.data || [];
    const tableProps = useDataTableProps(enrichedData);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invmpI_Id: 0,
            invmP_Id: 0,
            invmI_Id: 0,
            invmpI_ItemQty: 0
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            INVMPI_Id: values.invmpI_Id || 0,
            INVMP_Id: values.invmP_Id,
            INVMI_Id: values.invmI_Id,
            INVMPI_ItemQty: values.invmpI_ItemQty
        };
        saveProductQtyMutation.mutate(payload, {
            onSuccess: (res: any) => {
                if (res.success) {
                    onCancel();
                    refreshAll();
                }
            }
        });
    };

    const onEdit = (item: any) => {
        form.setValue('invmpI_Id', item.invmpI_Id);
        form.setValue('invmP_Id', item.invmP_Id);
        form.setValue('invmI_Id', item.invmI_Id);
        form.setValue('invmpI_ItemQty', item.invmpI_ItemQty);
        openEditForm(item);
    };

    const onCancel = () => {
        form.reset({
            invmpI_Id: 0,
            invmP_Id: 0,
            invmI_Id: 0,
            invmpI_ItemQty: 0
        });
        closeAddForm();
        closeEditForm();
    };

    const columns = getProductQtyColumns(onEdit);

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                title='Product Quantity List'
                icon={<Box className='h-5 w-5' />}>
                <GenericDataTable {...tableProps} data={data} columns={columns} isLoading={isProductItemLoading} />
            </CollapsibleSection>

            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isEditFormOpen ? editFormRef : addFormRef}>
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        title={isEditFormOpen ? 'Edit Product Quantity' : 'Add Product Quantity'}
                        icon={<PlusCircle className='h-5 w-5' />}>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={onCancel}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        <FormField
                                            control={form.control}
                                            name='invmP_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value?.toString() || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Product' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map((item: any) => (
                                                                <SelectItem key={item.invmP_Id} value={item.invmP_Id.toString()}>
                                                                    {item.invmP_ProductName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='invmI_Id'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value?.toString() || ''}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Item' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {items.map((item: any) => (
                                                                <SelectItem key={item.invmI_Id} value={item.invmI_Id.toString()}>
                                                                    {item.invmI_ItemName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='invmpI_ItemQty'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type='number' placeholder='Enter Quantity' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='flex justify-center gap-4 border-t pt-4'>
                                        <Button
                                            type='submit'
                                            variant='secondary'
                                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                                            isLoading={saveProductQtyMutation.isPending}>
                                            Save
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                                            onClick={onCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
