'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvTGRN } from '@/hooks/inventory/transactions/use-inv-t-grn';
import { type InvTGRNSchema, invTGRNSchema } from '@/schemas/inventory/transactions/inv-t-grn';
import { getInvItemDetail, getInvTGRNEditDetails } from '@/server/inventory/transactions/inv-t-grn';
import type { IInvTGRN } from '@/types/inventory/transactions/inv-t-grn';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calculator, Minus, Plus, ReceiptIndianRupee, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

interface UpdateGRNFormProps {
    selectedRow: IInvTGRN;
    onSuccess: () => void;
}

export default function UpdateGRNForm({ selectedRow, onSuccess }: UpdateGRNFormProps) {
    const { data: loadData, suppliers, stores, items, saveMutation } = useInvTGRN();
    const [discountType, setDiscountType] = useState<'A' | 'P'>('A');
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const form = useForm<InvTGRNSchema>({
        resolver: zodResolver(invTGRNSchema),
        defaultValues: {
            invmgrN_Id: selectedRow.invmgrN_Id,
            invmgrN_PurchaseDate: new Date(selectedRow.invmgrN_PurchaseDate),
            invmgrN_InvoiceNo: selectedRow.invmgrN_InvoiceNo || '',
            invmS_Id: selectedRow.invmS_Id,
            invmsT_Id: selectedRow.invmsT_Id,
            invmgrN_POReference: selectedRow.invmgrN_POReference || '',
            invmgrN_EWayBillRef: selectedRow.invmgrN_EWayBillRef || '',
            invmgrN_TowardsProjects: selectedRow.invmgrN_TowardsProjects || '',
            invmgrN_PODate: selectedRow.invmgrN_PODate ? new Date(selectedRow.invmgrN_PODate) : undefined,
            invmgrN_Prepared: selectedRow.invmgrN_Prepared || '',
            invmgrN_SignedBy: selectedRow.invmgrN_SignedBy || '',
            invmgrN_ChallanNo: selectedRow.invmgrN_ChallanNo || '',
            invmgrN_Challandate: selectedRow.invmgrN_Challandate ? new Date(selectedRow.invmgrN_Challandate) : undefined,
            invmgrN_Challanverfied: selectedRow.invmgrN_Challanverfied || '',
            invmgrN_KitNo: selectedRow.invmgrN_KitNo || '',
            invmgrN_Remarks: selectedRow.invmgrN_Remarks || '',
            invmgrN_TotalAmount: selectedRow.invmgrN_TotalAmount,
            invmgrN_TotDiscount: selectedRow.invmgrN_TotDiscount,
            invmgrN_TotTaxAmt: selectedRow.invmgrN_TotTaxAmt,
            invmgrN_PurchaseValue: selectedRow.invmgrN_PurchaseValue,
            GRNItem: []
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
        name: 'GRNItem'
    });

    const watchedItems = watch('GRNItem');

    useEffect(() => {
        async function fetchEditDetails() {
            try {
                const res = await getInvTGRNEditDetails(selectedRow.invmgrN_Id);
                if (res.success && res.data) {
                    // keys are mapped to 'edit_GRN', 'get_GRNItem', etc. in the server action
                    const master = res.data.edit_GRN?.[0];
                    const items = res.data.get_GRNItem || [];

                    if (master) {
                        // Ensure all dates are properly parsed or undefined
                        const poDate = master.invmgrN_PODate ? new Date(master.invmgrN_PODate) : undefined;
                        const challanDate = master.invmgrN_Challandate ? new Date(master.invmgrN_Challandate) : undefined;

                        reset({
                            invmgrN_Id: master.invmgrN_Id,
                            invmgrN_PurchaseDate: master.invmgrN_PurchaseDate ? new Date(master.invmgrN_PurchaseDate) : new Date(),
                            invmS_Id: master.invmS_Id,
                            invmsT_Id: master.invmsT_Id,
                            invmgrN_InvoiceNo: master.invmgrN_InvoiceNo || '',

                            // Explicitly Map Optional Fields to handle UI rendering
                            invmgrN_POReference: master.invmgrN_POReference || '',
                            invmgrN_PODate: poDate, // React Hook Form handles Date | undefined
                            invmgrN_TowardsProjects: master.invmgrN_TowardsProjects || '',
                            invmgrN_EWayBillRef: master.invmgrN_EWayBillRef || '',
                            invmgrN_Prepared: master.invmgrN_Prepared || '',
                            invmgrN_SignedBy: master.invmgrN_SignedBy || '',
                            invmgrN_ChallanNo: master.invmgrN_ChallanNo || '',
                            invmgrN_Challandate: challanDate,
                            invmgrN_Challanverfied: master.invmgrN_Challanverfied || '',
                            invmgrN_KitNo: master.invmgrN_KitNo || '',
                            invmgrN_Remarks: master.invmgrN_Remarks || '',

                            // Amounts
                            invmgrN_TotalAmount: Number(master.invmgrN_TotalAmount || 0),
                            invmgrN_TotDiscount: Number(master.invmgrN_TotDiscount || 0),
                            invmgrN_TotTaxAmt: Number(master.invmgrN_TotTaxAmt || 0),
                            invmgrN_PurchaseValue: Number(master.invmgrN_PurchaseValue || 0),

                            // Items
                            GRNItem: items.map((item: any) => ({
                                invtgrN_Id: item.invtgrN_Id,
                                invmgrN_Id: item.invmgrN_Id,
                                invmI_Id: item.invmI_Id,
                                invmuoM_Id: item.invmuoM_Id,
                                invmuoM_UOMName: item.invmuoM_UOMName || item.INVMUOM_UOMName,
                                invtgrN_BatchNo: item.invtgrN_BatchNo || '',
                                invtgrN_Qty: Number(item.invtgrN_Qty || 0),
                                invtgrN_PurchaseRate: Number(item.invtgrN_PurchaseRate || 0),
                                invtgrN_MRP: Number(item.invtgrN_MRP || 0),
                                invtgrN_DiscountAmt: Number(item.invtgrN_DiscountAmt || 0),
                                invtgrN_SalesPrice: Number(item.invtgrN_SalesPrice || 0),
                                invtgrN_Amount: Number(item.invtgrN_Amount || 0),
                                invtgrN_TaxAmt: Number(item.invtgrN_TaxAmt || 0),
                                GRNItemTax: [] // Tax logic handles separately
                            }))
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching GRN edit details:', error);
            } finally {
                setIsLoadingDetails(false);
            }
        }
        fetchEditDetails();
    }, [selectedRow, reset, form]);

    useEffect(() => {
        if (isLoadingDetails) return;

        let totalBasic = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        watchedItems.forEach((item) => {
            totalBasic += Number(item.invtgrN_Amount) || 0;
            totalDiscount += Number(item.invtgrN_DiscountAmt) || 0;
            totalTax += Number(item.invtgrN_TaxAmt) || 0;
        });

        setValue('invmgrN_TotalAmount', totalBasic);
        setValue('invmgrN_TotDiscount', totalDiscount);
        setValue('invmgrN_TotTaxAmt', totalTax);
        setValue('invmgrN_PurchaseValue', totalBasic - totalDiscount + totalTax);
    }, [watchedItems, setValue, isLoadingDetails]);

    const handleItemChange = async (index: number, itemId: number) => {
        const item = items?.find((i: any) => i.invmI_Id === itemId) || loadData?.data?.get_item?.find((i: any) => i.invmI_Id === itemId);
        if (item) {
            try {
                const res = await getInvItemDetail(item.invmI_Id);
                if (res.success && res.data) {
                    const detail = res.data.get_itemDetail?.[0];
                    const taxes = res.data.get_itemTax || [];

                    if (detail) {
                        if (detail.invmuoM_UOMName) {
                            setValue(`GRNItem.${index}.invmuoM_UOMName`, detail.invmuoM_UOMName);
                        }
                    }
                    setValue(`GRNItem.${index}.invmuoM_Id`, item.invmuoM_Id);

                    if (taxes.length > 0) {
                        const mappedTaxes = taxes.map((t: any) => ({
                            invmT_Id: t.invmT_Id,
                            invtgrnT_TaxPer: t.invmiT_TaxValue,
                            invtgrnT_TaxAmt: 0
                        }));
                        setValue(`GRNItem.${index}.GRNItemTax`, mappedTaxes);
                        calculateTax(index, mappedTaxes);
                    } else {
                        setValue(`GRNItem.${index}.GRNItemTax`, []);
                        calculateTax(index, []);
                    }
                }
            } catch (error) {
                console.error('Error fetching item details:', error);
            }
        }
    };

    const calculateItemAmount = (index: number) => {
        const qty = watch(`GRNItem.${index}.invtgrN_Qty`) || 0;
        const rate = watch(`GRNItem.${index}.invtgrN_PurchaseRate`) || 0;
        const basicAmt = qty * rate;
        setValue(`GRNItem.${index}.invtgrN_Amount`, basicAmt);
        calculateDiscount(index);
    };

    const calculateDiscount = (index: number) => {
        const basicAmt = watch(`GRNItem.${index}.invtgrN_Amount`) || 0;
        let discountAmt = watch(`GRNItem.${index}.invtgrN_DiscountAmt`) || 0;

        if (discountType === 'P') {
            const perc = watch(`GRNItem.${index}.invtgrN_DiscountAmt`) || 0;
            discountAmt = (basicAmt * perc) / 100;
        }

        setValue(`GRNItem.${index}.invtgrN_DiscountAmt`, discountAmt);
        calculateTax(index);
    };

    const calculateTax = (index: number, currentItemTaxes?: any[]) => {
        const basicAmt = watch(`GRNItem.${index}.invtgrN_Amount`) || 0;
        const discountAmt = watch(`GRNItem.${index}.invtgrN_DiscountAmt`) || 0;
        const taxableAmt = basicAmt - discountAmt;

        const itemTaxes = currentItemTaxes || watch(`GRNItem.${index}.GRNItemTax`) || [];
        let totalItemTax = 0;

        itemTaxes.forEach((tax: any, taxIdx: number) => {
            const taxAmt = (taxableAmt * tax.invtgrnT_TaxPer) / 100;
            setValue(`GRNItem.${index}.GRNItemTax.${taxIdx}.invtgrnT_TaxAmt`, taxAmt);
            totalItemTax += taxAmt;
        });

        setValue(`GRNItem.${index}.invtgrN_TaxAmt`, totalItemTax);
    };

    const onSubmit = (data: InvTGRNSchema) => {
        const payload = {
            invmgrN_Id: Number(data.invmgrN_Id || selectedRow?.invmgrN_Id || 0),
            invmgrN_InvoiceNo: String(data.invmgrN_InvoiceNo || ''),
            invmgrN_PurchaseDate:
                data.invmgrN_PurchaseDate instanceof Date
                    ? data.invmgrN_PurchaseDate.toISOString()
                    : data.invmgrN_PurchaseDate
                      ? new Date(data.invmgrN_PurchaseDate).toISOString()
                      : new Date().toISOString(),
            invmgrN_PurchaseValue: Number(data.invmgrN_PurchaseValue || 0),
            invmgrN_TotDiscount: Number(data.invmgrN_TotDiscount || 0),
            invmgrN_TotTaxAmt: Number(data.invmgrN_TotTaxAmt || 0),
            invmgrN_TotalAmount: Number(data.invmgrN_TotalAmount || 0),
            invmgrN_Remarks: String(data.invmgrN_Remarks || ''),
            invmgrN_ReturnFlg: Boolean(data.invmgrN_ReturnFlg ?? false),
            invmgrN_PaidFlg: Boolean(data.invmgrN_PaidFlg ?? false),
            invmgrN_CreditFlg: Boolean(data.invmgrN_CreditFlg ?? false),
            invmsT_Id: Number(data.invmsT_Id || 0),
            invmS_Id: Number(data.invmS_Id || 0),
            invmgrN_POReference: String(data.invmgrN_POReference || ''),
            invmgrN_EWayBillRef: String(data.invmgrN_EWayBillRef || ''),
            invmgrN_TowardsProjects: String(data.invmgrN_TowardsProjects || ''),
            invmgrN_Prepared: String(data.invmgrN_Prepared || ''),
            invmgrN_SignedBy: String(data.invmgrN_SignedBy || ''),
            invmgrN_ChallanNo: String(data.invmgrN_ChallanNo || ''),
            invmgrN_Challanverfied: String(data.invmgrN_Challanverfied || ''),
            invmgrN_KitNo: String(data.invmgrN_KitNo || ''),
            ...(data.invmgrN_PODate && {
                invmgrN_PODate:
                    data.invmgrN_PODate instanceof Date ? data.invmgrN_PODate.toISOString() : new Date(data.invmgrN_PODate).toISOString()
            }),
            ...(data.invmgrN_Challandate && {
                invmgrN_Challandate:
                    data.invmgrN_Challandate instanceof Date
                        ? data.invmgrN_Challandate.toISOString()
                        : new Date(data.invmgrN_Challandate).toISOString()
            }),
            GRNItem: (data.GRNItem || []).map((item) => ({
                invtgrN_Id: Number(item.invtgrN_Id || 0),
                invmgrN_Id: Number(item.invmgrN_Id || data.invmgrN_Id || selectedRow?.invmgrN_Id || 0),
                invmI_Id: Number(item.invmI_Id || 0),
                invmuoM_Id: Number(item.invmuoM_Id || 0),
                invtgrN_BatchNo: String(item.invtgrN_BatchNo || ''),
                invtgrN_Qty: Number(item.invtgrN_Qty || 0),
                invtgrN_PurchaseRate: Number(item.invtgrN_PurchaseRate || 0),
                invtgrN_MRP: Number(item.invtgrN_MRP || 0),
                invtgrN_DiscountAmt: Number(item.invtgrN_DiscountAmt || 0),
                invtgrN_SalesPrice: Number(item.invtgrN_SalesPrice || 0),
                invtgrN_Amount: Number(item.invtgrN_Amount || 0),
                invtgrN_TaxAmt: Number(item.invtgrN_TaxAmt || 0),
                ...(item.invtgrN_Naration ? { invtgrN_Naration: String(item.invtgrN_Naration) } : {}),
                ...(item.invtgrN_MfgDate
                    ? {
                          invtgrN_MfgDate:
                              item.invtgrN_MfgDate instanceof Date
                                  ? item.invtgrN_MfgDate.toISOString()
                                  : new Date(item.invtgrN_MfgDate).toISOString()
                      }
                    : {}),
                ...(item.invtgrN_ExpDate
                    ? {
                          invtgrN_ExpDate:
                              item.invtgrN_ExpDate instanceof Date
                                  ? item.invtgrN_ExpDate.toISOString()
                                  : new Date(item.invtgrN_ExpDate).toISOString()
                      }
                    : {}),
                GRNItemTax: (item.GRNItemTax || []).map((tax) => ({
                    invtgrnT_Id: Number(tax.invtgrnT_Id || 0),
                    invtgrN_Id: Number(tax.invtgrN_Id || item.invtgrN_Id || 0),
                    invmT_Id: Number(tax.invmT_Id || 0),
                    invtgrnT_TaxPer: Number(tax.invtgrnT_TaxPer || 0),
                    invtgrnT_TaxAmt: Number(tax.invtgrnT_TaxAmt || 0)
                }))
            }))
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    onSuccess();
                }
            }
        });
    };

    if (isLoadingDetails) {
        return <div className='p-8 text-center'>Loading details...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-[1400px] space-y-6'>
            {/* Header Details */}
            <CollapsibleSection
                title={`GRN Header Details - ${selectedRow.invmgrN_GRNNo}`}
                defaultOpen={true}
                className='border-primary/10 shadow-sm'>
                <div className='grid grid-cols-1 gap-6 p-1 md:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label>
                            Purchase Date <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='invmgrN_PurchaseDate'
                            control={control}
                            render={({ field }) => (
                                <input
                                    type='date'
                                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                            )}
                        />
                        {errors.invmgrN_PurchaseDate && <FormError>{errors.invmgrN_PurchaseDate.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Supplier <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='invmS_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger className='transition-all duration-200'>
                                        <SelectValue placeholder='Select Supplier' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(suppliers?.length > 0 ? suppliers : loadData?.data?.get_supplier || [])?.map((s: any) => (
                                            <SelectItem key={s.invmS_Id} value={s.invmS_Id.toString()}>
                                                {s.invmS_SupplierName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.invmS_Id && <FormError>{errors.invmS_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Store <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='invmsT_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger className='transition-all duration-200'>
                                        <SelectValue placeholder='Select Store' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(stores?.length > 0 ? stores : loadData?.data?.get_Store || [])?.map((s: any) => (
                                            <SelectItem key={s.invmsT_Id} value={s.invmsT_Id.toString()}>
                                                {s.invmS_StoreName || s.invmsT_StoreName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.invmsT_Id && <FormError>{errors.invmsT_Id.message}</FormError>}
                    </div>

                    <InputText label='Invoice No' {...register('invmgrN_InvoiceNo')} />
                    <InputText label='Order No (PO Ref)' {...register('invmgrN_POReference')} />
                    <InputText label='Bill Reference' {...register('invmgrN_EWayBillRef')} />
                </div>
            </CollapsibleSection>

            {/* Items Collection */}
            <CollapsibleSection title='GRN Items Collection' defaultOpen={true} className='border-primary/10 shadow-sm'>
                <div className='-mx-1 overflow-x-auto p-1'>
                    <table className='w-full min-w-[1300px] border-collapse text-xs'>
                        <thead>
                            <tr className='bg-muted/50 text-[10px] text-muted-foreground uppercase tracking-wider'>
                                <th className='w-[40px] border p-3 text-center'>#</th>
                                <th className='min-w-[220px] border p-3 text-left'>Item Name</th>
                                <th className='w-[80px] border p-3 text-center'>UOM</th>
                                <th className='w-[140px] border p-3 text-left'>Batch No</th>
                                <th className='w-[80px] border p-3 text-right'>Qty</th>
                                <th className='w-[110px] border p-3 text-right'>Rate (₹)</th>
                                <th className='w-[100px] border p-3 text-right'>MRP (₹)</th>
                                <th className='w-[100px] border p-3 text-right'>Sales (₹)</th>
                                <th className='w-[110px] border p-3 text-right'>Disc {discountType === 'P' ? '(%)' : ''}</th>
                                <th className='w-[120px] border p-3 text-right'>Basic Amt (₹)</th>
                                <th className='w-[120px] border p-3 text-right'>Tax Amt (₹)</th>
                                <th className='w-[50px] border p-3 text-center'></th>
                            </tr>
                        </thead>
                        <tbody className='divide-y'>
                            {fields.map((field, index) => (
                                <tr key={field.id} className='transition-colors duration-150 hover:bg-primary/5'>
                                    <td className='border p-2 text-center font-mono text-muted-foreground'>{index + 1}</td>
                                    <td className='border p-2'>
                                        <Controller
                                            name={`GRNItem.${index}.invmI_Id`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => {
                                                        const id = Number(val);
                                                        field.onChange(id);
                                                        handleItemChange(index, id);
                                                    }}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger className='h-8 border-primary/20 text-xs hover:border-primary/40 focus:ring-primary/20'>
                                                        <SelectValue placeholder='Select Item' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(items?.length > 0 ? items : loadData?.data?.get_item || [])?.map((i: any) => (
                                                            <SelectItem key={i.invmI_Id} value={i.invmI_Id.toString()}>
                                                                {i.invmI_ItemName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.GRNItem?.[index]?.invmI_Id && (
                                            <FormError className='mt-1 text-[10px]'>{errors.GRNItem[index]?.invmI_Id?.message}</FormError>
                                        )}
                                    </td>
                                    <td className='border p-2'>
                                        <div className='flex h-8 items-center justify-center rounded border border-dashed bg-muted/30 font-semibold text-[11px] text-muted-foreground'>
                                            {watch(`GRNItem.${index}.invmuoM_UOMName`) ||
                                                (watch(`GRNItem.${index}.invmI_Id`)
                                                    ? items?.find((i: any) => i.invmI_Id === watch(`GRNItem.${index}.invmI_Id`))
                                                          ?.invmuoM_UOMName ||
                                                      loadData?.data?.get_item?.find(
                                                          (i: any) => i.invmI_Id === watch(`GRNItem.${index}.invmI_Id`)
                                                      )?.invmuoM_UOMName
                                                    : '-')}
                                        </div>
                                    </td>
                                    <td className='border p-2'>
                                        <Input {...register(`GRNItem.${index}.invtgrN_BatchNo`)} className='h-8 text-xs' />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_Qty`, { valueAsNumber: true })}
                                            className='h-8 text-right font-mono text-xs'
                                            onBlur={() => calculateItemAmount(index)}
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_PurchaseRate`, { valueAsNumber: true })}
                                            className='h-8 text-right font-mono text-xs'
                                            onBlur={() => calculateItemAmount(index)}
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_MRP`, { valueAsNumber: true })}
                                            className='h-8 text-right font-mono text-xs'
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_SalesPrice`, { valueAsNumber: true })}
                                            className='h-8 text-right font-mono text-xs'
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_DiscountAmt`, { valueAsNumber: true })}
                                            className='h-8 text-right font-mono text-xs transition-all focus:bg-primary/5'
                                            onBlur={() => calculateDiscount(index)}
                                        />
                                    </td>
                                    <td className='border bg-muted/10 p-2 text-right font-mono font-semibold text-xs'>
                                        {watch(`GRNItem.${index}.invtgrN_Amount`)?.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }) || '0.00'}
                                    </td>
                                    <td className='border bg-green-50/20 p-2'>
                                        <div className='flex items-center justify-end gap-1 font-mono font-semibold text-green-700 text-xs'>
                                            <span>
                                                {watch(`GRNItem.${index}.invtgrN_TaxAmt`)?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }) || '0.00'}
                                            </span>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='h-5 w-5 hover:bg-green-100/50'
                                                onClick={() => calculateTax(index)}
                                                title='Recalculate Tax'>
                                                <Calculator className='h-3 w-3 text-green-600' />
                                            </Button>
                                        </div>
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='h-7 w-7 text-destructive/60 transition-colors hover:bg-destructive/10 hover:text-destructive'
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}>
                                            <Minus className='h-3.5 w-3.5' />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='mt-4 flex justify-start'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() =>
                                append({
                                    invtgrN_Id: 0,
                                    invmgrN_Id: selectedRow.invmgrN_Id,
                                    invmI_Id: 0,
                                    invmuoM_Id: 0,
                                    invtgrN_BatchNo: '',
                                    invtgrN_Qty: 0,
                                    invtgrN_PurchaseRate: 0,
                                    invtgrN_MRP: 0,
                                    invtgrN_DiscountAmt: 0,
                                    invtgrN_SalesPrice: 0,
                                    invtgrN_Amount: 0,
                                    invtgrN_TaxAmt: 0,
                                    GRNItemTax: []
                                })
                            }
                            className='h-8 border-primary/20 font-bold text-[11px] text-primary tracking-tight shadow-sm transition-all hover:bg-primary/5'>
                            <Plus className='mr-2 h-3 w-3' /> ADD ROW
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Footer and Totals */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <div className='lg:col-span-2'>
                    <CollapsibleSection title='Additional Information' defaultOpen={true} className='h-full border-primary/10 shadow-sm'>
                        <div className='p-1'>
                            <InputTextarea
                                label='Remarks / Narration'
                                {...register('invmgrN_Remarks')}
                                rows={6}
                                className='resize-none rounded-lg border-primary/10 text-xs transition-all focus:border-primary/30'
                                placeholder='Enter any additional notes here...'
                            />
                        </div>
                    </CollapsibleSection>
                </div>

                <div className='lg:col-span-1'>
                    <Card className='relative space-y-4 overflow-hidden border-primary/20 bg-primary/5 p-6 shadow-md'>
                        <div className='-mr-8 -mt-8 pointer-events-none absolute top-0 right-0 rounded-bl-full bg-primary/5 p-8 opacity-20' />

                        <h3 className='flex items-center gap-2 font-bold text-primary text-sm uppercase tracking-widest'>
                            <ReceiptIndianRupee className='h-4 w-4' /> Final Summary
                        </h3>

                        <div className='space-y-3 pt-2 font-medium'>
                            <div className='flex items-center justify-between text-sm'>
                                <span className='text-muted-foreground'>Total Basic Amount:</span>
                                <span className='font-mono'>
                                    ₹
                                    {watch('invmgrN_TotalAmount')?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                            </div>
                            <div className='flex items-center justify-between text-destructive text-sm'>
                                <span className='flex items-center gap-1.5'>Total Discount:</span>
                                <span className='font-mono'>
                                    - ₹
                                    {watch('invmgrN_TotDiscount')?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                            </div>
                            <div className='flex items-center justify-between text-green-700 text-sm'>
                                <span className='flex items-center gap-1.5'>Total Tax Amount:</span>
                                <span className='font-mono'>
                                    + ₹
                                    {watch('invmgrN_TotTaxAmt')?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                            </div>

                            <div className='mt-2 border-primary/20 border-t pt-4'>
                                <div className='flex items-end justify-between'>
                                    <div className='flex flex-col'>
                                        <span className='font-bold text-[10px] text-primary/70 uppercase tracking-widest'>
                                            Net Purchase Value
                                        </span>
                                        <span className='font-extrabold text-3xl text-primary tracking-tighter'>
                                            ₹
                                            {watch('invmgrN_PurchaseValue')?.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
                        <Button
                            type='submit'
                            className='flex-1 py-6 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]'
                            isLoading={saveMutation.isPending}>
                            <Save className='mr-2 h-5 w-5' /> Update Record
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            className='border-destructive/20 px-6 py-6 text-destructive transition-all duration-300 hover:bg-destructive hover:text-white'
                            onClick={onSuccess}>
                            <X className='h-5 w-5' />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
