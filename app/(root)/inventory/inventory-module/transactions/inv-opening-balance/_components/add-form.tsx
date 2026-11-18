import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useInvOpeningBalance,
    useInvOpeningBalanceDetails,
    useInvOpeningBalanceItemDetails
} from '@/hooks/inventory/transactions/use-inv-opening-balance';
import { type TInvOpeningBalance, invOpeningBalanceSchema } from '@/schemas/inventory/transactions/inv-opening-balance';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Package, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddOBFormProps {
    onSuccess: () => void;
    storeList: any[];
    itemList: any[];
    initialData?: any;
    isEdit?: boolean;
}

export default function AddOBForm({
    onSuccess,
    storeList: initialStoreList,
    itemList: initialItemList,
    initialData,
    isEdit
}: AddOBFormProps) {
    const { saveMutation, getItemsMutation, getStoresMutation } = useInvOpeningBalance();
    const itemDetailMutation = useInvOpeningBalanceItemDetails();
    const obDetailsMutation = useInvOpeningBalanceDetails();

    const [stores, setStores] = useState<any[]>(() => {
        const list = initialStoreList || [];
        return list.filter((store: any, index: number, self: any[]) => index === self.findIndex((s) => s.invmsT_Id === store.invmsT_Id));
    });

    const [items, setItems] = useState<any[]>(() => {
        const list = initialItemList || [];
        return list.filter(
            (item: any, index: number, self: any[]) =>
                index === self.findIndex((t) => (t.invmI_Id || t.invmi_Id) === (item.invmI_Id || item.invmi_Id))
        );
    });

    const form = useForm<TInvOpeningBalance>({
        resolver: zodResolver(invOpeningBalanceSchema),
        defaultValues: {
            invmsT_Id: 0,
            transrows: [
                {
                    itrS_Id: 'trans1',
                    invmI_Id: 0,
                    invmuoM_Id: 0,
                    invmuoM_UOMName: '',
                    invoB_BatchNo: '',
                    invoB_PurchaseDate: new Date(),
                    invoB_Qty: 0,
                    invstO_PurchaseRate: 0,
                    invstO_SalesRate: 0,
                    invoB_Naration: '',
                    invoB_TotalAmount: 0
                }
            ]
        }
    });

    const {
        control,
        handleSubmit,
        register,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'transrows'
    });

    const watchedStoreId = watch('invmsT_Id');

    // Sync stores state with props
    useEffect(() => {
        if (initialStoreList && initialStoreList.length > 0) {
            setStores(initialStoreList);
        }
    }, [initialStoreList]);

    // Fetch Stores fallback
    useEffect(() => {
        if (!initialStoreList || initialStoreList.length === 0) {
            getStoresMutation.mutate(undefined, {
                onSuccess: (res) => {
                    const data = res?.data;
                    if (Array.isArray(data)) {
                        setStores(data);
                    } else if (data?.$values) {
                        setStores(data.$values);
                    } else if (data?.get_Store) {
                        setStores(Array.isArray(data.get_Store) ? data.get_Store : data.get_Store?.$values || []);
                    }
                }
            });
        }
    }, [initialStoreList]);

    // Fetch Items when Store changes
    useEffect(() => {
        if (watchedStoreId && watchedStoreId !== 0) {
            getItemsMutation.mutate(
                { INVMST_Id: watchedStoreId, INVC_LIFOFIFOFlg: 'LIFO' },
                {
                    onSuccess: (res: any) => {
                        const data = res.data;
                        let extractedItems = [];
                        if (Array.isArray(data)) {
                            extractedItems = data;
                        } else if (data?.$values) {
                            extractedItems = data.$values;
                        } else if (data?.get_item) {
                            extractedItems = Array.isArray(data.get_item) ? data.get_item : data.get_item?.$values || [];
                        }
                        // Deduplicate items based on ID to avoid duplicate key errors in Select
                        const uniqueItems = extractedItems.filter(
                            (item: any, index: number, self: any[]) =>
                                index === self.findIndex((t) => (t.invmI_Id || t.invmi_Id) === (item.invmI_Id || item.invmi_Id))
                        );
                        setItems(uniqueItems);
                    }
                }
            );
        }
    }, [watchedStoreId]);

    // Populate data for Edit
    useEffect(() => {
        if (isEdit && initialData?.invoB_Id) {
            obDetailsMutation.mutate(
                { INVOB_Id: initialData.invoB_Id },
                {
                    onSuccess: (res: any) => {
                        if (res.get_obdetails && res.get_obdetails.length > 0) {
                            const detail = res.get_obdetails[0];
                            const rows = res.get_obdetails.map((obj: any, index: number) => ({
                                itrS_Id: `trans${index + 1}`,
                                invmI_Id: obj.invmI_Id,
                                invmI_ItemName: obj.invmI_ItemName,
                                invmuoM_Id: obj.invmuoM_Id,
                                invmuoM_UOMName: obj.invmuoM_UOMName,
                                invoB_BatchNo: obj.invoB_BatchNo,
                                invoB_PurchaseDate: new Date(obj.invoB_PurchaseDate),
                                invoB_Qty: obj.invoB_Qty,
                                invoB_MfgDate: obj.invoB_MfgDate ? new Date(obj.invoB_MfgDate) : null,
                                invoB_ExpDate: obj.invoB_ExpDate ? new Date(obj.invoB_ExpDate) : null,
                                invstO_PurchaseRate: obj.invoB_PurchaseRate,
                                invstO_SalesRate: obj.invoB_SaleRate,
                                invoB_Naration: obj.invoB_Naration,
                                invoB_TotalAmount: (obj.invoB_PurchaseRate || 0) * (obj.qty || obj.invoB_Qty || 0)
                            }));

                            reset({
                                invoB_Id: initialData.invoB_Id,
                                invmsT_Id: initialData.invmsT_Id || detail.invmsT_Id,
                                transrows: rows
                            });
                        }
                    }
                }
            );
        }
    }, [isEdit, initialData, reset]);

    const handleItemChange = (index: number, itemId: string) => {
        const id = Number(itemId);
        setValue(`transrows.${index}.invmI_Id`, id);

        if (id) {
            itemDetailMutation.mutate(
                { INVMI_Id: id },
                {
                    onSuccess: (res: any) => {
                        const data = res.data;
                        let rawDetails = [];
                        if (Array.isArray(data)) {
                            rawDetails = data;
                        } else if (data?.$values) {
                            rawDetails = data.$values;
                        } else if (data?.get_itemdetails) {
                            rawDetails = Array.isArray(data.get_itemdetails) ? data.get_itemdetails : data.get_itemdetails?.$values || [];
                        }

                        if (rawDetails.length > 0) {
                            const details = rawDetails[0];
                            setValue(`transrows.${index}.invmuoM_Id`, details.invmuoM_Id);
                            setValue(`transrows.${index}.invmuoM_UOMName`, details.invmuoM_UOMName);
                            // Reset other fields on item change
                            setValue(`transrows.${index}.invoB_BatchNo`, '');
                            setValue(`transrows.${index}.invoB_Qty`, 0);
                            setValue(`transrows.${index}.invstO_PurchaseRate`, 0);
                            setValue(`transrows.${index}.invstO_SalesRate`, 0);
                            setValue(`transrows.${index}.invoB_PurchaseDate`, new Date());
                        }
                    }
                }
            );
        }
    };

    const watchedRows = watch('transrows');

    const totalQty = watchedRows?.reduce((sum, row) => sum + (Number(row.invoB_Qty) || 0), 0) || 0;
    const grandTotal = watchedRows?.reduce((sum, row) => sum + (Number(row.invoB_TotalAmount) || 0), 0) || 0;
    const totalItems = watchedRows?.length || 0;

    const onSubmit = (data: TInvOpeningBalance) => {
        saveMutation.mutate(data, {
            onSuccess: (res: any) => {
                if (res.success || res.returnval) {
                    toast.success(res.message || 'Opening Balance saved successfully');
                    onSuccess();
                } else {
                    toast.error(res.message || 'Failed to save Opening Balance');
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-[1400px] space-y-6'>
            <CollapsibleSection
                title={
                    <div className='flex items-center gap-2'>
                        <RotateCcw className='h-5 w-5 text-primary' />
                        <span>Store Inventory Details</span>
                    </div>
                }
                defaultOpen={true}
                className='border-primary/10 shadow-sm'>
                <div className='grid grid-cols-1 gap-6 p-1 md:grid-cols-3'>
                    <div className='space-y-4 md:col-span-1'>
                        <div className='rounded-lg border border-primary/5 bg-muted/30 p-4'>
                            <Label className='mb-2 block font-semibold text-primary/80'>
                                Select Store <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='invmsT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value?.toString()}
                                        disabled={isEdit}>
                                        <SelectTrigger
                                            className={`h-11 bg-background shadow-sm ${errors.invmsT_Id ? 'border-red-500 ring-red-500' : 'border-primary/20 hover:border-primary/40'}`}>
                                            <SelectValue placeholder='-- Select Store --' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores.map((store: any, idx: number) => (
                                                <SelectItem key={`${store.invmsT_Id}-${idx}`} value={store.invmsT_Id.toString()}>
                                                    {store.invmS_StoreName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.invmsT_Id && <p className='mt-2 font-medium text-red-500 text-xs'>{errors.invmsT_Id.message}</p>}
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection
                title={
                    <div className='flex items-center gap-2'>
                        <Package className='h-5 w-5 text-primary' />
                        <span>Opening Balance Items</span>
                    </div>
                }
                defaultOpen={true}
                className='border-primary/10 shadow-sm'>
                <div className='-mx-1 overflow-x-auto p-1'>
                    <Table className='min-w-[1200px] border-collapse text-xs'>
                        <TableHeader>
                            <TableRow className='bg-muted/50 text-[10px] text-muted-foreground uppercase tracking-wider'>
                                <TableHead className='w-[50px] border text-center'>#</TableHead>
                                <TableHead className='min-w-[200px] border'>Item Name</TableHead>
                                <TableHead className='min-w-[80px] border'>UOM</TableHead>
                                <TableHead className='min-w-[100px] border'>Batch No</TableHead>
                                <TableHead className='min-w-[140px] border'>Purchase Date</TableHead>
                                <TableHead className='min-w-[140px] border'>Mfg Date</TableHead>
                                <TableHead className='min-w-[140px] border'>Exp Date</TableHead>
                                <TableHead className='min-w-[80px] border text-right'>Qty</TableHead>
                                <TableHead className='min-w-[100px] border text-right'>Purchase Rate</TableHead>
                                <TableHead className='min-w-[110px] border text-right'>Total Amount</TableHead>
                                <TableHead className='min-w-[100px] border text-right'>Sales Rate</TableHead>
                                <TableHead className='min-w-[150px] border'>Narration</TableHead>
                                <TableHead className='w-[50px] border text-center'></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='divide-y'>
                            {fields.map((field, index) => (
                                <TableRow key={field.id} className='group transition-colors hover:bg-primary/5'>
                                    <TableCell className='border text-center font-medium'>{index + 1}</TableCell>
                                    <TableCell className='border'>
                                        {isEdit ? (
                                            <div className='px-1 py-2 font-semibold text-primary/80'>
                                                {watch(`transrows.${index}.invmI_ItemName`)}
                                            </div>
                                        ) : (
                                            <Controller
                                                name={`transrows.${index}.invmI_Id`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={(val) => handleItemChange(index, val)}
                                                        value={field.value?.toString()}
                                                        disabled={!watchedStoreId}>
                                                        <SelectTrigger
                                                            className={`h-9 bg-background ${errors.transrows?.[index]?.invmI_Id ? 'border-red-500' : 'border-primary/10'}`}>
                                                            <SelectValue
                                                                placeholder={watchedStoreId ? 'Select Item' : 'Select Store first'}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {items.map((item: any, idx: number) => (
                                                                <SelectItem
                                                                    key={`${item.invmI_Id || item.invmi_Id}-${idx}`}
                                                                    value={(item.invmI_Id || item.invmi_Id)?.toString()}>
                                                                    {item.invmI_ItemName || item.invmi_ItemName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        )}
                                        {errors.transrows?.[index]?.invmI_Id && (
                                            <p className='mt-1 font-semibold text-[10px] text-red-500'>Required</p>
                                        )}
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            {...register(`transrows.${index}.invmuoM_UOMName`)}
                                            disabled
                                            className='h-9 border-none bg-muted/50 text-center font-medium'
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            {...register(`transrows.${index}.invoB_BatchNo`)}
                                            disabled={isEdit}
                                            className='h-9 border-primary/10 transition-all focus:border-primary/40'
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Controller
                                            name={`transrows.${index}.invoB_PurchaseDate`}
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
                                        <Controller
                                            name={`transrows.${index}.invoB_MfgDate`}
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='date'
                                                    className='flex h-9 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-xs transition-all hover:border-primary/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/20'
                                                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Controller
                                            name={`transrows.${index}.invoB_ExpDate`}
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='date'
                                                    className='flex h-9 w-full rounded-md border border-primary/10 bg-background px-3 py-2 text-xs transition-all hover:border-primary/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/20'
                                                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`transrows.${index}.invoB_Qty`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    const qty = Number(e.target.value) || 0;
                                                    const rate = Number(form.getValues(`transrows.${index}.invstO_PurchaseRate`)) || 0;
                                                    form.setValue(`transrows.${index}.invoB_TotalAmount`, Number((qty * rate).toFixed(2)));
                                                }
                                            })}
                                            className='h-9 border-primary/10 text-right font-medium focus:border-primary/40'
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`transrows.${index}.invstO_PurchaseRate`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    const rate = Number(e.target.value) || 0;
                                                    const qty = Number(form.getValues(`transrows.${index}.invoB_Qty`)) || 0;
                                                    form.setValue(`transrows.${index}.invoB_TotalAmount`, Number((qty * rate).toFixed(2)));
                                                }
                                            })}
                                            className='h-9 border-primary/10 text-right font-medium focus:border-primary/40'
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`transrows.${index}.invoB_TotalAmount`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    const amt = Number(e.target.value) || 0;
                                                    const qty = Number(form.getValues(`transrows.${index}.invoB_Qty`)) || 0;
                                                    if (qty > 0) {
                                                        form.setValue(
                                                            `transrows.${index}.invstO_PurchaseRate`,
                                                            Number((amt / qty).toFixed(2))
                                                        );
                                                    }
                                                }
                                            })}
                                            className='h-9 border-primary/10 bg-primary/5 text-right font-bold text-primary focus:border-primary/40'
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            type='number'
                                            {...register(`transrows.${index}.invstO_SalesRate`, { valueAsNumber: true })}
                                            disabled={isEdit}
                                            className='h-9 border-primary/10 text-right focus:border-primary/40'
                                        />
                                    </TableCell>
                                    <TableCell className='border'>
                                        <Input
                                            {...register(`transrows.${index}.invoB_Naration`)}
                                            disabled={isEdit}
                                            className='h-9 border-primary/10 focus:border-primary/40'
                                            placeholder='Enter Narration'
                                        />
                                    </TableCell>
                                    <TableCell className='border text-center'>
                                        {!isEdit && (
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                                className='h-7 w-7 p-0 text-destructive/60 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100'>
                                                <Trash2 className='h-3.5 w-3.5' />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className='mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row'>
                    {!isEdit && (
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='border-primary/10 bg-primary/5 font-medium text-primary transition-all hover:bg-primary/10'
                            onClick={() =>
                                append({
                                    itrS_Id: `trans${fields.length + 1}`,
                                    invmI_Id: 0,
                                    invmuoM_Id: 0,
                                    invmuoM_UOMName: '',
                                    invoB_BatchNo: '0',
                                    invoB_PurchaseDate: new Date(),
                                    invoB_Qty: 0,
                                    invstO_PurchaseRate: 0,
                                    invstO_SalesRate: 0,
                                    invoB_Naration: '',
                                    invoB_TotalAmount: 0
                                })
                            }>
                            <Plus className='mr-2 h-4 w-4' /> Add Item
                        </Button>
                    )}

                    <div className='ml-auto flex gap-4 rounded-lg border border-primary/10 bg-muted/30 p-3'>
                        <div className='flex flex-col items-center border-primary/10 border-r px-4'>
                            <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-tight'>Total Items</span>
                            <span className='font-bold text-md text-primary'>{totalItems}</span>
                        </div>
                        <div className='flex flex-col items-center border-primary/10 border-r px-4'>
                            <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-tight'>Total Qty</span>
                            <span className='font-bold text-md text-primary'>{totalQty}</span>
                        </div>
                        <div className='flex flex-col items-center px-4'>
                            <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-tight'>Grand Total</span>
                            <span className='font-bold text-md text-primary'>₹ {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            <div className='flex justify-end gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={() => reset()} className='text-destructive/80 hover:bg-destructive/10'>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
                <Button type='submit' disabled={saveMutation.isPending} className='min-w-[120px]'>
                    {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
