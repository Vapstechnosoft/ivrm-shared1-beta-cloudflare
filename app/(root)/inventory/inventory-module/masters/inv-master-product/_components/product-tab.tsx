'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { useInvMasterProduct } from '@/hooks/inventory/masters/use-inv-master-product';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, PlusCircle, X } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { getProductColumns } from './product-columns';

const formSchema = z.object({
    invmP_Id: z.number().optional(),
    invmP_ProductName: z.string().min(1, 'Product Name is required'),
    invmP_ProductCode: z.string().min(1, 'Product Code is required'),
    invmP_ProductPrice: z.coerce.number().min(0, 'Price must be positive'),
    invmP_TaxApplFlg: z.boolean().default(false),
    product_tax: z
        .array(
            z.object({
                invmT_Id: z.number(),
                invmpT_Id: z.number().optional(),
                invmpT_TaxValue: z.coerce.number(),
                selected: z.boolean().default(false),
                invmT_TaxName: z.string().optional(),
                invmT_TaxAliasName: z.string().optional()
            })
        )
        .optional()
});

interface ProductTabProps {
    searchParams?: any;
}

export default function ProductTab({ searchParams }: ProductTabProps) {
    const { loadData, saveProductMutation, refreshAll, isLoadDataLoading, getTaxListMutation, getProductTaxMutation } =
        useInvMasterProduct(searchParams ?? {});

    const { isAddFormOpen, isEditFormOpen, closeAddForm, closeEditForm, openEditForm, addFormRef, editFormRef } = useFormContext<any>();

    const enrichedData = useMemo(() => {
        if (!loadData) return undefined;
        const items =
            (loadData as any)?.get_product ||
            (loadData as any)?.data ||
            (Array.isArray(loadData) ? loadData : []);
        const total =
            (loadData as any)?.total ||
            (loadData as any)?.data?.total ||
            (Array.isArray(items) ? items.length : 0);
        return {
            ...loadData,
            data: items,
            total
        };
    }, [loadData]);

    const data = enrichedData?.data || [];
    const tableProps = useDataTableProps(enrichedData);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invmP_ProductName: '',
            invmP_ProductCode: '',
            invmP_ProductPrice: 0,
            invmP_TaxApplFlg: false,
            invmP_Id: 0,
            product_tax: []
        }
    });

    const { fields, append, replace } = useFieldArray({
        control: form.control,
        name: 'product_tax'
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            INVMP_Id: values.invmP_Id || 0,
            INVMP_ProductName: values.invmP_ProductName,
            INVMP_ProductCode: values.invmP_ProductCode,
            INVMP_ProductPrice: values.invmP_ProductPrice,
            INVMP_TaxApplFlg: values.invmP_TaxApplFlg,
            product_tax: values.invmP_TaxApplFlg
                ? values.product_tax
                      ?.filter((t) => t.selected)
                      .map((t) => ({
                          INVMT_Id: t.invmT_Id,
                          INVMPT_Id: t.invmpT_Id || 0,
                          INVMPT_TaxValue: t.invmpT_TaxValue
                      }))
                : []
        };
        saveProductMutation.mutate(payload, {
            onSuccess: () => {
                onCancel();
                refreshAll();
            }
        });
    };

    const onEdit = (item: any) => {
        form.setValue('invmP_Id', item.invmP_Id);
        form.setValue('invmP_ProductName', item.invmP_ProductName);
        form.setValue('invmP_ProductCode', item.invmP_ProductCode);
        form.setValue('invmP_ProductPrice', item.invmP_ProductPrice);
        form.setValue('invmP_TaxApplFlg', item.invmP_TaxApplFlg === true);
        openEditForm(item);

        if (item.invmP_TaxApplFlg === true) {
            Promise.all([getTaxListMutation.mutateAsync(undefined), getProductTaxMutation.mutateAsync(item.invmP_Id)])
                .then(([taxListRes, productTaxRes]) => {
                    let taxListRaw: any[] = [];
                    // Handle tax list response structure
                    if (taxListRes?.get_taxlist && Array.isArray(taxListRes.get_taxlist)) {
                        taxListRaw = taxListRes.get_taxlist;
                    } else if (Array.isArray(taxListRes)) {
                        taxListRaw = taxListRes;
                    } else if (taxListRes?.data && Array.isArray(taxListRes.data)) {
                        taxListRaw = taxListRes.data;
                    }

                    let productTaxRaw: any[] = [];
                    // Handle product tax response structure
                    if (productTaxRes?.product_tax && Array.isArray(productTaxRes.product_tax)) {
                        productTaxRaw = productTaxRes.product_tax;
                    } else if (Array.isArray(productTaxRes)) {
                        productTaxRaw = productTaxRes;
                    } else if (productTaxRes?.data && Array.isArray(productTaxRes.data)) {
                        productTaxRaw = productTaxRes.data;
                    } else if (productTaxRes?.get_product_tax && Array.isArray(productTaxRes.get_product_tax)) {
                        productTaxRaw = productTaxRes.get_product_tax;
                    }

                    // Merge lists
                    const mergedTaxes = taxListRaw.map((masterTax: any) => {
                        const masterTaxId = masterTax.invmT_Id ?? masterTax.INVMT_Id ?? masterTax.id ?? 0;
                        // Find matching product tax
                        const specificTax = productTaxRaw.find((pt: any) => (pt.invmT_Id ?? pt.INVMT_Id) === masterTaxId);

                        if (specificTax) {
                            return {
                                invmT_Id: masterTaxId,
                                invmpT_Id: specificTax.invmpT_Id ?? specificTax.INVMPT_Id ?? 0,
                                invmpT_TaxValue: specificTax.invmpT_TaxValue ?? specificTax.INVMPT_TaxValue ?? 0,
                                selected: true,
                                invmT_TaxName: masterTax.invmT_TaxName ?? masterTax.INVMT_TaxName ?? '',
                                invmT_TaxAliasName: masterTax.invmT_TaxAliasName ?? masterTax.INVMT_TaxAliasName ?? ''
                            };
                        } else {
                            return {
                                invmT_Id: masterTaxId,
                                invmpT_Id: 0,
                                invmpT_TaxValue: masterTax.invmiT_TaxValue ?? masterTax.INVMIT_TaxValue ?? 0,
                                selected: false,
                                invmT_TaxName: masterTax.invmT_TaxName ?? masterTax.INVMT_TaxName ?? '',
                                invmT_TaxAliasName: masterTax.invmT_TaxAliasName ?? masterTax.INVMT_TaxAliasName ?? ''
                            };
                        }
                    });
                    replace(mergedTaxes);
                })
                .catch((error) => {
                    console.error('Error fetching tax details for edit:', error);
                });
        } else {
            replace([]);
        }
    };

    const onCancel = () => {
        form.reset({
            invmP_ProductName: '',
            invmP_ProductCode: '',
            invmP_ProductPrice: 0,
            invmP_TaxApplFlg: false,
            invmP_Id: 0
        });
        closeAddForm();
        closeEditForm();
    };

    const columns = getProductColumns(onEdit);

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                title='Product List'
                icon={<Box className='h-5 w-5' />}>
                <GenericDataTable {...tableProps} data={data} columns={columns} isLoading={isLoadDataLoading} />
            </CollapsibleSection>

            {(isAddFormOpen || isEditFormOpen) && (
                <div ref={isEditFormOpen ? editFormRef : addFormRef}>
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'
                        title={isEditFormOpen ? 'Edit Product' : 'Add Product'}
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
                                            name='invmP_ProductName'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder='Enter Product Name' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='invmP_ProductCode'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Code</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder='Enter Product Code' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='invmP_ProductPrice'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Price</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type='number' placeholder='Enter Product Price' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name='invmP_TaxApplFlg'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked);
                                                            if (checked) {
                                                                getTaxListMutation.mutate(undefined, {
                                                                    onSuccess: (res: any) => {
                                                                        let taxListRaw: any[] = [];
                                                                        if (res?.get_taxlist && Array.isArray(res.get_taxlist)) {
                                                                            taxListRaw = res.get_taxlist;
                                                                        } else if (Array.isArray(res)) {
                                                                            taxListRaw = res;
                                                                        } else if (res?.data && Array.isArray(res.data)) {
                                                                            taxListRaw = res.data;
                                                                        }

                                                                        const taxes = taxListRaw.map((item: any) => ({
                                                                            invmT_Id: item.invmT_Id ?? item.INVMT_Id ?? item.id ?? 0,
                                                                            invmpT_Id: 0,
                                                                            invmpT_TaxValue:
                                                                                item.invmiT_TaxValue ?? item.INVMIT_TaxValue ?? 0,
                                                                            selected: false,
                                                                            invmT_TaxName: item.invmT_TaxName ?? item.INVMT_TaxName ?? '',
                                                                            invmT_TaxAliasName:
                                                                                item.invmT_TaxAliasName ?? item.INVMT_TaxAliasName ?? ''
                                                                        }));
                                                                        replace(taxes);
                                                                    }
                                                                });
                                                            } else {
                                                                replace([]);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className='space-y-1 leading-none'>
                                                    <FormLabel>Tax Applicable</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch('invmP_TaxApplFlg') && (
                                        <div className='rounded-md border p-4'>
                                            <h4 className='mb-4 font-medium text-sm'>Select Taxes</h4>
                                            <table className='min-w-full text-sm'>
                                                <thead>
                                                    <tr>
                                                        <th className='p-2 text-left'>Select</th>
                                                        <th className='p-2 text-left'>Tax Name</th>
                                                        <th className='p-2 text-left'>Alias</th>
                                                        <th className='p-2 text-left'>Current Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fields.map((field, index) => (
                                                        <tr key={field.id} className='border-t'>
                                                            <td className='p-2'>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`product_tax.${index}.selected`}
                                                                    render={({ field: cbField }) => (
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={cbField.value}
                                                                                onCheckedChange={cbField.onChange}
                                                                            />
                                                                        </FormControl>
                                                                    )}
                                                                />
                                                            </td>
                                                            <td className='p-2'>{form.getValues(`product_tax.${index}.invmT_TaxName`)}</td>
                                                            <td className='p-2'>
                                                                {form.getValues(`product_tax.${index}.invmT_TaxAliasName`)}
                                                            </td>
                                                            <td className='p-2'>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`product_tax.${index}.invmpT_TaxValue`}
                                                                    render={({ field: inpField }) => (
                                                                        <FormControl>
                                                                            <Input
                                                                                {...inpField}
                                                                                type='number'
                                                                                className='w-24'
                                                                                disabled={!form.watch(`product_tax.${index}.selected`)}
                                                                            />
                                                                        </FormControl>
                                                                    )}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className='flex justify-center gap-4 border-t pt-4'>
                                        <Button
                                            type='submit'
                                            variant='secondary'
                                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                                            isLoading={saveProductMutation.isPending}>
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
