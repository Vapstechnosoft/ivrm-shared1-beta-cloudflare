'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvMasterItem } from '@/hooks/inventory/masters/use-inv-master-item';
import { type TInvMasterItem, invMasterItemSchema } from '@/schemas/inventory/masters/inv-master-item';
import { getItemTax, saveInvMasterItem } from '@/server/inventory/masters/inv-master-item';
import type { IInvMasterItem } from '@/types/inventory/masters/inv-master-item';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateInvMasterItemFormProps {
    onSuccess: () => void;
    selectedRow: IInvMasterItem;
    dropdowns: {
        get_tax: any[];
        get_itemgroup: any[];
        get_maingroup?: any[];
        get_usergroup?: any[];
        get_UOM: any[];
        companynames: any[];
        ledgernames: any[];
        companyconfig: any[];
    };
}

export default function UpdateInvMasterItemForm({ onSuccess, selectedRow, dropdowns }: UpdateInvMasterItemFormProps) {
    const { refetchAll } = useInvMasterItem();
    const [selectedTaxes, setSelectedTaxes] = useState<Record<number, boolean>>({});
    const [taxValues, setTaxValues] = useState<Record<number, number>>({});
    const [taxIds, setTaxIds] = useState<Record<number, number>>({});
    const [isLoadingTaxes, setIsLoadingTaxes] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { isSubmitting, errors }
    } = useForm<TInvMasterItem>({
        resolver: zodResolver(invMasterItemSchema),
        defaultValues: {
            invmI_Id: selectedRow.invmI_Id,
            invmG_Id: selectedRow.invmG_Id,
            invmuoM_Id: selectedRow.invmuoM_Id,
            invmI_ItemName: selectedRow.invmI_ItemName,
            invmI_ItemCode: selectedRow.invmI_ItemCode || '',
            invmI_MaxStock: selectedRow.invmI_MaxStock || 0,
            invmI_ReorderStock: selectedRow.invmI_ReorderStock || 0,
            invmI_HSNCode: selectedRow.invmI_HSNCode || '',
            invmI_TaxAplFlg: selectedRow.invmI_TaxAplFlg,
            invmI_RawMatFlg: selectedRow.invmI_RawMatFlg,
            invmI_ForSaleFlg: selectedRow.invmI_ForSaleFlg,
            invmI_MaintenanceAplFlg: selectedRow.invmI_MaintenanceAplFlg,
            famcomP_Id: selectedRow.famcomP_Id || 0,
            famleD_Id: selectedRow.famleD_Id || 0,
            tax_Applicable: []
        }
    });

    const isTaxApplied = watch('invmI_TaxAplFlg');

    useEffect(() => {
        if (selectedRow.invmG_Id && dropdowns?.get_maingroup) {
            // Check if the current ID is directly in main group
            const isMainGroup = dropdowns?.get_maingroup?.some((g: any) => g.invmG_Id === selectedRow.invmG_Id);

            if (isMainGroup) {
                setValue('invmG_Id', selectedRow.invmG_Id);
            } else if (dropdowns?.get_itemgroup && dropdowns?.get_usergroup) {
                // Try to resolve from item group hierarchy
                const currentItemGroup = dropdowns?.get_itemgroup?.find((g: any) => g.invmG_Id === selectedRow.invmG_Id);
                if (currentItemGroup) {
                    const userGroupId = currentItemGroup.invmG_ParentId;
                    const currentUserGroup = dropdowns?.get_usergroup?.find((g: any) => g.invmG_Id === userGroupId);
                    if (currentUserGroup) {
                        setValue('invmG_Id', currentUserGroup.invmG_ParentId);
                    }
                }
            }
        }
    }, [selectedRow, dropdowns, setValue]);

    useEffect(() => {
        const fetchTaxes = async () => {
            if (selectedRow.invmI_Id && selectedRow.invmI_TaxAplFlg) {
                setIsLoadingTaxes(true);
                const res = await getItemTax(selectedRow.invmI_Id);
                const rawTaxList = (res as any).get_itemTax;
                const itemTaxes = Array.isArray(rawTaxList) ? rawTaxList : (rawTaxList?.$values ?? []);

                const selected: Record<number, boolean> = {};
                const values: Record<number, number> = {};
                const ids: Record<number, number> = {};

                itemTaxes.forEach((it: any) => {
                    selected[it.invmT_Id] = true;
                    values[it.invmT_Id] = it.invmiT_TaxValue;
                    ids[it.invmT_Id] = it.invmiT_Id;
                });

                setSelectedTaxes(selected);
                setTaxValues(values);
                setTaxIds(ids);
                setIsLoadingTaxes(false);
            }
        };
        fetchTaxes();
    }, [selectedRow]);

    const onTaxToggle = (taxId: number, checked: boolean) => {
        setSelectedTaxes((prev) => ({ ...prev, [taxId]: checked }));
    };

    const onTaxValueChange = (taxId: number, value: string) => {
        setTaxValues((prev) => ({ ...prev, [taxId]: Number.parseFloat(value) || 0 }));
    };

    const onSubmit = async (data: TInvMasterItem) => {
        try {
            const taxApplicable = [];
            if (data.invmI_TaxAplFlg) {
                for (const tax of dropdowns?.get_tax || []) {
                    if (selectedTaxes[tax.invmT_Id]) {
                        taxApplicable.push({
                            invmiT_Id: taxIds[tax.invmT_Id] || 0,
                            invmT_Id: tax.invmT_Id,
                            invmiT_TaxValue: taxValues[tax.invmT_Id] ?? tax.invmiT_TaxValue ?? 0
                        });
                    }
                }
            }

            const payload = { ...data, tax_Applicable: taxApplicable };
            const result = await saveInvMasterItem(payload);
            const res = result as any;

            if (res.success || res.returnval === true) {
                const msg =
                    typeof res.message === 'string'
                        ? res.message
                        : typeof res.returnval === 'string'
                          ? res.returnval
                          : 'Record updated successfully';
                toast.success(msg);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (res.returnval === 'Duplicate' || res.returnduplicatestatus === 'Duplicate') {
                toast.error('Record already exists');
            } else {
                const msg = typeof res.message === 'string' ? res.message : 'Failed to update record';
                toast.error(msg);
            }
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Group <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='invmG_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                    <SelectTrigger className={errors.invmG_Id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='Select Group' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dropdowns?.get_maingroup?.map((group: any) => (
                                            <SelectItem key={group.invmG_Id} value={group.invmG_Id?.toString() || ''}>
                                                {group.invmG_GroupName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.invmG_Id && <p className='text-red-500 text-xs'>{errors.invmG_Id.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Item Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='invmI_ItemName'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder='Enter Item Name' className={errors.invmI_ItemName ? 'border-red-500' : ''} />
                            )}
                        />
                        {errors.invmI_ItemName && <p className='text-red-500 text-xs'>{errors.invmI_ItemName.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Max Stock</Label>
                        <Controller
                            name='invmI_MaxStock'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} type='number' placeholder='Enter Max Stock' value={field.value || ''} />
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-2'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='invmI_TaxAplFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='tax_applied_update' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='tax_applied_update'>Tax</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='invmI_RawMatFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='raw_mat_update' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='raw_mat_update'>Raw Material</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='invmI_ForSaleFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='for_sale_update' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='for_sale_update'>For Sale</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='invmI_MaintenanceAplFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='maintenance_update' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor='maintenance_update'>Maintenance</Label>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            UOM <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='invmuoM_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value?.toString() || ''}>
                                    <SelectTrigger className={errors.invmuoM_Id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='Select UOM' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dropdowns?.get_UOM?.map((uom) => (
                                            <SelectItem key={uom.invmuoM_Id} value={uom.invmuoM_Id?.toString() || uom.invmuoM_Id || ''}>
                                                {uom.invmuoM_UOMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.invmuoM_Id && <p className='text-red-500 text-xs'>{errors.invmuoM_Id.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>Item Code</Label>
                        <Controller
                            name='invmI_ItemCode'
                            control={control}
                            render={({ field }) => <Input {...field} placeholder='Enter Item Code' value={field.value || ''} />}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>Re-Order Stock</Label>
                        <Controller
                            name='invmI_ReorderStock'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} type='number' placeholder='Enter Re-Order Stock' value={field.value || ''} />
                            )}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label>HSN Code</Label>
                        <Controller
                            name='invmI_HSNCode'
                            control={control}
                            render={({ field }) => <Input {...field} placeholder='Enter HSN Code' value={field.value || ''} />}
                        />
                    </div>
                </div>
            </div>

            {/* Tax Grid Section */}
            {isTaxApplied && dropdowns?.get_tax?.length > 0 && (
                <div className='mt-8 rounded-lg border bg-muted/30 p-4'>
                    <h3 className='mb-3 font-semibold text-sm'>Tax Details {isLoadingTaxes && '(Loading existing...)'}</h3>
                    <div className='max-h-[300px] overflow-auto rounded border'>
                        <Table>
                            <TableHeader className='bg-muted'>
                                <TableRow>
                                    <TableHead className='w-[60px]'>SL NO</TableHead>
                                    <TableHead className='w-[60px]'>Select</TableHead>
                                    <TableHead>Tax Name</TableHead>
                                    <TableHead>Tax Alias</TableHead>
                                    <TableHead className='w-[150px]'>Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dropdowns?.get_tax?.map((tax, idx) => (
                                    <TableRow key={tax.invmT_Id}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTaxes[tax.invmT_Id] || false}
                                                onCheckedChange={(checked) => onTaxToggle(tax.invmT_Id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>{tax.invmT_TaxName}</TableCell>
                                        <TableCell>{tax.invmT_TaxAliasName}</TableCell>
                                        <TableCell>
                                            <Input
                                                type='number'
                                                step='0.01'
                                                disabled={!selectedTaxes[tax.invmT_Id]}
                                                value={taxValues[tax.invmT_Id] ?? tax.invmiT_TaxValue ?? ''}
                                                onChange={(e) => onTaxValueChange(tax.invmT_Id, e.target.value)}
                                                className='h-8'
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <div className='flex justify-end gap-3 border-t pt-4'>
                <Button type='button' variant='outline' onClick={onSuccess}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
            </div>
        </form>
    );
}
