'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvStock } from '@/hooks/inventory/transactions/use-inv-stock';
import { type TInvStock, invStockSchema } from '@/schemas/inventory/transactions/inv-stock';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Package, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddStockFormProps {
    onSuccess: () => void;
    initialData?: any;
}

export default function AddStockForm({ onSuccess, initialData }: AddStockFormProps) {
    const { saveMutation, editMutation, getStoresQuery, getItemsQuery } = useInvStock();
    const fetchEditData = editMutation.mutate;
    const isEdit = !!initialData;

    const storeList = getStoresQuery.data?.data || getStoresQuery.data?.get_store || (Array.isArray(getStoresQuery.data) ? getStoresQuery.data : []);
    const itemList = getItemsQuery.data?.data || getItemsQuery.data?.get_item || (Array.isArray(getItemsQuery.data) ? getItemsQuery.data : []);

    const form = useForm<TInvStock>({
        resolver: zodResolver(invStockSchema),
        defaultValues: {
            stocklist: [
                {
                    invstO_Id: 0,
                    invmsT_Id: 0,
                    invmI_Id: 0,
                    invstO_BatchNo: '',
                    invstO_PurchaseDate: new Date(),
                    invstO_PurchaseRate: 0,
                    invstO_SalesRate: 0,
                    invstO_ItemConQty: 0,
                    invstO_PurOBQty: 0,
                    invstO_PurRetQty: 0,
                    invstO_SalesQty: 0,
                    invstO_SalesRetQty: 0,
                    invstO_MatIssPlusQty: 0,
                    invstO_MatIssMinusQty: 0,
                    invstO_PhyPlusQty: 0,
                    invstO_PhyMinQty: 0,
                    invstO_AvaiableStock: 0
                }
            ]
        }
    });

    const { control, handleSubmit, register, reset, setValue } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'stocklist'
    });

    const handleStoreChange = (storeId: number, index: number) => {
        setValue(`stocklist.${index}.invmsT_Id`, storeId);
    };

    const handleItemChange = (itemId: number, index: number) => {
        setValue(`stocklist.${index}.invmI_Id`, itemId);
    };

    useEffect(() => {
        if (isEdit && initialData?.invstO_Id) {
            fetchEditData(initialData.invstO_Id, {
                onSuccess: (res: any) => {
                    if (res.data && res.data.length > 0) {
                        const editData = res.data[0];

                        reset({
                            stocklist: [
                                {
                                    ...editData,
                                    invstO_PurchaseDate: new Date(editData.invstO_PurchaseDate)
                                }
                            ]
                        });
                    }
                }
            });
        }
    }, [isEdit, initialData, reset, fetchEditData]);

    const onSubmit = (data: TInvStock) => {
        saveMutation.mutate(data, {
            onSuccess: (res: any) => {
                if (res.success || res.returnval) {
                    toast.success(res.message || 'Stock records updated successfully');
                    onSuccess();
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <CollapsibleSection
                title={
                    <div className='flex items-center gap-2 font-bold text-lg'>
                        <Package className='h-5 w-5 text-primary' />
                        <span>Stock Management</span>
                    </div>
                }
                defaultOpen={true}
                className='border-primary/20 shadow-md'>
                <div className='overflow-x-auto rounded-lg border border-primary/5 bg-muted/30 p-4'>
                    <Table className='min-w-[2000px] border-collapse text-xs'>
                        <TableHeader>
                            <TableRow className='bg-primary/5 font-bold uppercase tracking-wider hover:bg-primary/5'>
                                <TableHead className='w-[50px] border text-center'>#</TableHead>
                                <TableHead className='min-w-[200px] border'>Store</TableHead>
                                <TableHead className='min-w-[250px] border'>Item</TableHead>
                                <TableHead className='min-w-[120px] border'>Batch No</TableHead>
                                <TableHead className='min-w-[150px] border'>Purchase Date</TableHead>
                                <TableHead className='min-w-[100px] border text-right'>Purchase Rate</TableHead>
                                <TableHead className='min-w-[100px] border text-right'>Sale Rate</TableHead>
                                <TableHead className='min-w-[100px] border text-right'>Item Qty</TableHead>
                                <TableHead className='min-w-[120px] border text-right'>Purchase Qty</TableHead>
                                <TableHead className='min-w-[150px] border text-right'>Purchase Ret Qty</TableHead>
                                <TableHead className='min-w-[100px] border text-right'>Sale Qty</TableHead>
                                <TableHead className='min-w-[150px] border text-right'>Sale Ret Qty</TableHead>
                                <TableHead className='min-w-[120px] border text-right'>Material +</TableHead>
                                <TableHead className='min-w-[120px] border text-right'>Material -</TableHead>
                                <TableHead className='min-w-[120px] border text-right'>Physical +</TableHead>
                                <TableHead className='min-w-[120px] border text-right'>Physical -</TableHead>
                                <TableHead className='min-w-[150px] border text-right'>Avaiable Stock</TableHead>
                                <TableHead className='w-[80px] border text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='divide-y'>
                            {fields.map((field, index) => (
                                <TableRow key={field.id} className='group transition-all duration-200 hover:bg-primary/5'>
                                    <TableCell className='border bg-muted/20 text-center font-semibold'>{index + 1}</TableCell>

                                    <TableCell className='border'>
                                        <Controller
                                            name={`stocklist.${index}.invmsT_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => handleStoreChange(Number(val), index)}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger className='h-9 border-primary/10 bg-background hover:border-primary/40 focus:ring-primary/20'>
                                                        <SelectValue placeholder='Select Store' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {storeList.map((store: any) => (
                                                            <SelectItem key={store.invmsT_Id} value={store.invmsT_Id.toString()}>
                                                                {store.invmS_StoreName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Controller
                                            name={`stocklist.${index}.invmI_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => handleItemChange(Number(val), index)}
                                                    value={field.value ? field.value.toString() : undefined}>
                                                    <SelectTrigger className='h-9 border-primary/10 bg-background hover:border-primary/40 focus:ring-primary/20'>
                                                        <SelectValue
                                                            placeholder={getItemsQuery.isLoading ? 'Loading items...' : 'Select Item'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itemList.map((item: any) => {
                                                            const itemId = item.invmI_Id ?? item.invmi_Id;
                                                            const itemName = item.invmI_ItemName ?? item.invmi_ItemName;
                                                            return (
                                                                <SelectItem key={itemId} value={itemId?.toString()}>
                                                                    {itemName}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            {...register(`stocklist.${index}.invstO_BatchNo`)}
                                            className='h-9 border-primary/10 bg-background focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Controller
                                            name={`stocklist.${index}.invstO_PurchaseDate`}
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='date'
                                                    className='flex h-9 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-xs transition-all hover:border-primary/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/20'
                                                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            )}
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_PurchaseRate`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_SalesRate`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_ItemConQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_PurOBQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_PurRetQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_SalesQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_SalesRetQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_MatIssPlusQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_MatIssMinusQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_PhyPlusQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_PhyMinQty`, { valueAsNumber: true })}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`stocklist.${index}.invstO_AvaiableStock`, { valueAsNumber: true })}
                                            className='h-9 border-primary/20 bg-primary/5 text-right font-bold text-primary focus:border-primary/40'
                                        />
                                    </TableCell>

                                    <TableCell className='border bg-muted/20 text-center'>
                                        {!isEdit && (
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                                className='h-7 w-7 p-0 text-destructive/60 hover:bg-destructive/10 hover:text-destructive'>
                                                <Trash2 className='h-3.5 w-3.5' />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className='mt-6 flex items-center justify-between border-primary/10 border-t p-4'>
                    {!isEdit && (
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='border-primary/20 bg-primary/5 font-semibold text-primary hover:bg-primary/10'
                            onClick={() =>
                                append({
                                    invstO_Id: 0,
                                    invmsT_Id: 0,
                                    invmI_Id: 0,
                                    invstO_BatchNo: '',
                                    invstO_PurchaseDate: new Date(),
                                    invstO_PurchaseRate: 0,
                                    invstO_SalesRate: 0,
                                    invstO_ItemConQty: 0,
                                    invstO_PurOBQty: 0,
                                    invstO_PurRetQty: 0,
                                    invstO_SalesQty: 0,
                                    invstO_SalesRetQty: 0,
                                    invstO_MatIssPlusQty: 0,
                                    invstO_MatIssMinusQty: 0,
                                    invstO_PhyPlusQty: 0,
                                    invstO_PhyMinQty: 0,
                                    invstO_AvaiableStock: 0
                                })
                            }>
                            <Plus className='mr-2 h-4 w-4' /> Add Row
                        </Button>
                    )}

                    <div className='flex gap-3'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='border-destructive/20 text-destructive/80 hover:bg-destructive/10'
                            onClick={() => reset()}>
                            <RotateCcw className='mr-2 h-4 w-4' /> Reset
                        </Button>
                        <Button
                            type='submit'
                            size='sm'
                            disabled={saveMutation.isPending}
                            className='bg-primary shadow-lg hover:bg-primary/90'>
                            <Save className='mr-2 h-4 w-4' />
                            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Stock' : 'Save Stock'}
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>
        </form>
    );
}
