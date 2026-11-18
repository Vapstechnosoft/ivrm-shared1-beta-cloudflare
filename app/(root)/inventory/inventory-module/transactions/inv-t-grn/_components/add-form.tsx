'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvTGRN } from '@/hooks/inventory/transactions/use-inv-t-grn';
import { type InvTGRNSchema, invTGRNSchema } from '@/schemas/inventory/transactions/inv-t-grn';
import { getItemDetail, getItemTaxDetail } from '@/server/inventory/transactions/inv-t-grn';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calculator, Minus, Plus, ReceiptIndianRupee, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

interface AddGRNFormProps {
    onSuccess: () => void;
}

export default function AddGRNForm({ onSuccess }: AddGRNFormProps) {
    const { data: loadData, suppliers, stores, items, saveMutation } = useInvTGRN();
    const [discountType, setDiscountType] = useState<'A' | 'P'>('A');

    // Tax Modal State
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [selectedTaxRowIndex, setSelectedTaxRowIndex] = useState<number | null>(null);

    const form = useForm<InvTGRNSchema>({
        resolver: zodResolver(invTGRNSchema),
        defaultValues: {
            invmgrN_Id: 0,
            invmgrN_PurchaseDate: new Date(),
            invmgrN_InvoiceNo: '',
            invmS_Id: undefined,
            invmsT_Id: undefined,
            invmgrN_POReference: '',
            invmgrN_EWayBillRef: '',
            invmgrN_TowardsProjects: '',
            invmgrN_Prepared: '',
            invmgrN_SignedBy: '',
            invmgrN_ChallanNo: '',
            invmgrN_Challanverfied: '',
            invmgrN_KitNo: '',
            invmgrN_Remarks: '',
            invmgrN_ReturnFlg: false,
            invmgrN_PaidFlg: false,
            invmgrN_CreditFlg: false,
            invmgrN_TotalAmount: 0,
            invmgrN_TotDiscount: 0,
            invmgrN_TotTaxAmt: 0,
            invmgrN_PurchaseValue: 0,
            GRNItem: [
                {
                    invtgrN_Id: 0,
                    invmgrN_Id: 0,
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
        getValues,
        formState: { errors }
    } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'GRNItem'
    });

    const watchedItems = watch('GRNItem') || [];

    const calculateTotals = () => {
        const items = getValues('GRNItem') || [];
        let totalBasic = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        if (items && Array.isArray(items)) {
            items.forEach((item) => {
                if (!item) return;
                totalBasic += Number(item.invtgrN_Amount) || 0;
                totalDiscount += Number(item.invtgrN_DiscountAmt) || 0;
                totalTax += Number(item.invtgrN_TaxAmt) || 0;
            });
        }

        totalBasic = round(totalBasic);
        totalDiscount = round(totalDiscount);
        totalTax = round(totalTax);

        setValue('invmgrN_TotalAmount', totalBasic);
        setValue('invmgrN_TotDiscount', totalDiscount);
        setValue('invmgrN_TotTaxAmt', totalTax);
        setValue('invmgrN_PurchaseValue', round(totalBasic - totalDiscount + totalTax));
    };

    // Calculate totals whenever items change (sync with internal state changes that might trigger re-renders)
    useEffect(() => {
        calculateTotals();
    }, [watchedItems]);

    const handleItemChange = async (index: number, itemId: number) => {
        const item = items?.find((i: any) => i.invmI_Id === itemId) || loadData?.data?.get_item?.find((i: any) => i.invmI_Id === itemId);
        if (item) {
            if (item.invmuoM_Id) {
                setValue(`GRNItem.${index}.invmuoM_Id`, item.invmuoM_Id);
            }
            if (item.invmuoM_UOMName) {
                setValue(`GRNItem.${index}.invmuoM_UOMName`, item.invmuoM_UOMName);
            }

            try {
                // Call both APIs concurrently
                const [itemRes, taxRes] = await Promise.all([
                    getItemDetail(item.invmI_Id).catch(() => null),
                    getItemTaxDetail(item.invmI_Id).catch(() => null)
                ]);

                const itemDetailList =
                    itemRes?.get_itemDetail ||
                    itemRes?.data?.get_itemDetail ||
                    (Array.isArray(itemRes?.data) ? itemRes.data : Array.isArray(itemRes) ? itemRes : []);
                const detail = itemDetailList?.[0];

                if (detail) {
                    if (detail.invmuoM_UOMName || detail.INVMUOM_UOMName) {
                        setValue(`GRNItem.${index}.invmuoM_UOMName`, detail.invmuoM_UOMName || detail.INVMUOM_UOMName);
                    }
                    if (detail.invmuoM_Id || detail.INVMUOM_Id) {
                        setValue(`GRNItem.${index}.invmuoM_Id`, detail.invmuoM_Id || detail.INVMUOM_Id);
                    }
                }

                // Use taxRes for tax details
                const taxes =
                    taxRes?.get_itemTax ||
                    taxRes?.get_itemtax ||
                    taxRes?.get_tax ||
                    taxRes?.data?.get_itemTax ||
                    taxRes?.data?.get_itemtax ||
                    taxRes?.data?.get_tax ||
                    (Array.isArray(taxRes?.data) ? taxRes.data : Array.isArray(taxRes) ? taxRes : []);

                if (taxes.length > 0) {
                    const mappedTaxes = taxes.map((t: any) => ({
                        invmT_Id: t.invmT_Id || t.INVMT_Id,
                        invtgrnT_TaxPer: t.invmiT_TaxValue ?? t.INVMIT_TaxValue ?? t.invtgrnT_TaxPer ?? 0,
                        invtgrnT_TaxAmt: 0
                    }));
                    setValue(`GRNItem.${index}.GRNItemTax`, mappedTaxes);
                    calculateTax(index, mappedTaxes);
                } else {
                    setValue(`GRNItem.${index}.GRNItemTax`, []);
                    calculateTax(index, []);
                }
            } catch (error) {
                console.error('Error fetching item details:', error);
            }
        }
    };

    const calculateItemAmount = (index: number) => {
        const qty = watch(`GRNItem.${index}.invtgrN_Qty`) || 0;
        const rate = watch(`GRNItem.${index}.invtgrN_PurchaseRate`) || 0;
        const basicAmt = round(qty * rate);
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

        discountAmt = round(discountAmt);
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
            if (!tax) return;
            const taxAmt = round((taxableAmt * (tax.invtgrnT_TaxPer || 0)) / 100);
            setValue(`GRNItem.${index}.GRNItemTax.${taxIdx}.invtgrnT_TaxAmt`, taxAmt);
            totalItemTax += taxAmt;
        });

        setValue(`GRNItem.${index}.invtgrN_TaxAmt`, round(totalItemTax));
        calculateTotals();
    };

    const isSuccessResponse = (res: any) => {
        return Boolean(
            res?.success ||
            res?.returnval === true ||
            res?.returnval === 'true' ||
            (typeof res?.message === 'string' && res.message.toLowerCase().includes('success')) ||
            (typeof res?.returnval === 'string' && res.returnval.toLowerCase().includes('save'))
        );
    };

    const onSubmit = (data: InvTGRNSchema) => {
        const itemsPayload = (data.GRNItem || []).map((item) => {
            const taxes = (item.GRNItemTax || []).map((tax) => ({
                invtgrnT_Id: Number(tax.invtgrnT_Id || 0),
                invtgrN_Id: Number(tax.invtgrN_Id || item.invtgrN_Id || 0),
                invmT_Id: Number(tax.invmT_Id || 0),
                invtgrnT_TaxPer: Number(tax.invtgrnT_TaxPer || 0),
                invtgrnT_TaxAmt: Number(tax.invtgrnT_TaxAmt || 0)
            }));
            return {
                invtgrN_Id: Number(item.invtgrN_Id || 0),
                invmgrN_Id: Number(item.invmgrN_Id || data.invmgrN_Id || 0),
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
                GRNItemTax: taxes,
                grnItemTax: taxes
            };
        });

        const payload: any = {
            invmgrN_Id: Number(data.invmgrN_Id || 0),
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
            GRNItem: itemsPayload,
            grnItem: itemsPayload
        };

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                if (isSuccessResponse(res)) {
                    reset();
                    onSuccess();
                }
            }
        });
    };

    const onInvalid = (formErrors: any) => {
        console.warn('Form validation failed:', formErrors);
        const firstErrorKey = Object.keys(formErrors)[0];
        const firstError = formErrors[firstErrorKey];
        if (firstError?.message) {
            toast.error(firstError.message);
        } else if (formErrors.GRNItem) {
            toast.error('Please complete all required item fields');
        } else {
            toast.error('Please check the required fields');
        }
    };

    const openTaxModal = (index: number) => {
        setSelectedTaxRowIndex(index);
        setIsTaxModalOpen(true);
    };

    const getCurrentRowTaxDetails = () => {
        if (selectedTaxRowIndex === null) return [];
        const updateTaxes = watch(`GRNItem.${selectedTaxRowIndex}.GRNItemTax`) || [];
        const basicAmt = watch(`GRNItem.${selectedTaxRowIndex}.invtgrN_Amount`) || 0;
        const discountAmt = watch(`GRNItem.${selectedTaxRowIndex}.invtgrN_DiscountAmt`) || 0;
        const taxableAmt = basicAmt - discountAmt;

        return updateTaxes.map((tax) => {
            const taxMaster = loadData?.data?.get_tax?.find((t: any) => t.invmT_Id === tax.invmT_Id);
            return {
                name: taxMaster?.invmT_TaxName || 'Unknown Tax',
                percent: tax.invtgrnT_TaxPer,
                amount: (taxableAmt * tax.invtgrnT_TaxPer) / 100
            };
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className='mx-auto max-w-[1400px] space-y-6'>
            {/* Header Details */}
            <CollapsibleSection
                title='GRN Header Information'
                // icon={<ReceiptIndianRupee className="h-5 w-5 text-primary" />}
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

                    <InputText label='Invoice No' {...register('invmgrN_InvoiceNo')} placeholder='Enter Invoice Number' />
                    <InputText label='Order No (PO Ref)' {...register('invmgrN_POReference')} placeholder='Enter PO Reference' />
                    <InputText label='Bill Reference' {...register('invmgrN_EWayBillRef')} placeholder='Enter Bill Ref' />

                    <InputText label='Towards Projects' {...register('invmgrN_TowardsProjects')} placeholder='Enter Project Name' />
                    <InputText label='Challan No' {...register('invmgrN_ChallanNo')} placeholder='Enter Challan No' />
                    <InputText label='Challan Verified By' {...register('invmgrN_Challanverfied')} placeholder='Verified By' />

                    <div className='space-y-2'>
                        <Label>PO Date</Label>
                        <Controller
                            name='invmgrN_PODate'
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
                    </div>

                    <InputText label='Prepared By' {...register('invmgrN_Prepared')} placeholder='Prepared By' />
                    <InputText label='Signed By' {...register('invmgrN_SignedBy')} placeholder='Signed By' />

                    <div className='space-y-2'>
                        <Label>Challan Date</Label>
                        <Controller
                            name='invmgrN_Challandate'
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
                    </div>
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
                                                items?.find((i: any) => i.invmI_Id === watch(`GRNItem.${index}.invmI_Id`))
                                                    ?.invmuoM_UOMName ||
                                                loadData?.data?.get_item?.find(
                                                    (i: any) => i.invmI_Id === watch(`GRNItem.${index}.invmI_Id`)
                                                )?.invmuoM_UOMName ||
                                                '-'}
                                        </div>
                                    </td>
                                    <td className='border p-2'>
                                        <Input {...register(`GRNItem.${index}.invtgrN_BatchNo`)} className='h-8 text-xs' />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_Qty`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    calculateItemAmount(index);
                                                }
                                            })}
                                            className='h-8 text-right font-mono text-xs'
                                        />
                                    </td>
                                    <td className='border p-2'>
                                        <Input
                                            {...register(`GRNItem.${index}.invtgrN_PurchaseRate`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    calculateItemAmount(index);
                                                }
                                            })}
                                            className='h-8 text-right font-mono text-xs'
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
                                            {...register(`GRNItem.${index}.invtgrN_DiscountAmt`, {
                                                valueAsNumber: true,
                                                onChange: (e) => {
                                                    calculateDiscount(index);
                                                }
                                            })}
                                            className='h-8 text-right font-mono text-xs transition-all focus:bg-primary/5'
                                        />
                                    </td>
                                    <td className='border bg-muted/10 p-2 text-right font-mono font-semibold text-xs'>
                                        {watch(`GRNItem.${index}.invtgrN_Amount`)?.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }) || '0.00'}
                                    </td>
                                    <td className='border bg-green-50/20 p-2'>
                                        <div
                                            className='flex cursor-pointer items-center justify-end gap-1 rounded p-1 font-mono font-semibold text-green-700 text-xs transition-colors hover:bg-green-100/50'
                                            onClick={() => openTaxModal(index)}
                                            title='Click to view Tax Details'>
                                            <span>
                                                {watch(`GRNItem.${index}.invtgrN_TaxAmt`)?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }) || '0.00'}
                                            </span>
                                            <Calculator className='h-3 w-3 text-green-600' />
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
                                    invmgrN_Id: 0,
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

            {/* Tax Details Modal */}
            <Dialog open={isTaxModalOpen} onOpenChange={setIsTaxModalOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2 text-primary'>
                            <ReceiptIndianRupee className='h-5 w-5' />
                            Tax Breakdown
                        </DialogTitle>
                    </DialogHeader>
                    <div className='py-4'>
                        {selectedTaxRowIndex !== null && (
                            <div className='space-y-4'>
                                <div className='flex justify-between border-b pb-2 font-medium text-sm'>
                                    <span>Tax Name</span>
                                    <div className='flex gap-8'>
                                        <span>Rate (%)</span>
                                        <span className='w-20 text-right'>Amount</span>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    {getCurrentRowTaxDetails().length > 0 ? (
                                        getCurrentRowTaxDetails().map((tax, i) => (
                                            <div key={i} className='flex justify-between text-sm'>
                                                <span className='text-muted-foreground'>{tax.name}</span>
                                                <div className='flex gap-8'>
                                                    <span className='font-mono text-xs'>{tax.percent}%</span>
                                                    <span className='w-20 text-right font-medium font-mono'>₹{tax.amount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='py-2 text-center text-muted-foreground text-sm'>No taxes active for this item</div>
                                    )}
                                </div>
                                <div className='mt-2 flex justify-between border-t pt-3 font-bold text-sm'>
                                    <span>Total Tax</span>
                                    <span className='font-mono text-green-600'>
                                        ₹
                                        {getCurrentRowTaxDetails()
                                            .reduce((sum, t) => sum + t.amount, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
                            <Save className='mr-2 h-5 w-5' /> Save GRN
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            className='border-primary/20 px-6 py-6 text-primary transition-all duration-300 hover:bg-primary/5'
                            onClick={() => reset()}>
                            <RotateCcw className='h-5 w-5' />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
