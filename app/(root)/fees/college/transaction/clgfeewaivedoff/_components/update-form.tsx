'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCollegeFeeWaivedOffEdit, useCollegeFeeWaivedOffList } from '@/hooks/fees/college/useTransactions';
import { cn } from '@/lib/utils';
import { collegeFeeWaivedOffSchema } from '@/schemas/fees/college/transactions/clgfeewaivedoff';
import { saveCollegeFeeWaivedOff } from '@/server/fees/college/transaction/clgfeewaivedoff';
import type { ICollegeFeeGroup, ICollegeFeeHeadItem, ICollegeFeeWaivedOffGrid } from '@/types/fees/college/transaction/clgfeewaivedoff';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface UpdateCollegeFeeWaivedOffFormProps {
    selectedRow: ICollegeFeeWaivedOffGrid;
    onSuccess?: () => void;
    className?: string;
}

type FormFields = z.infer<typeof collegeFeeWaivedOffSchema.addOrUpdate>;

function extractArrayData<T = any>(data: any, preferredKeys: string[] = []): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.$values)) return data.data.$values;

    const source = data.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

    for (const key of preferredKeys) {
        if (Array.isArray(source[key]) && source[key].length > 0) {
            return source[key];
        }
        if (Array.isArray(source[key]?.$values) && source[key].$values.length > 0) {
            return source[key].$values;
        }
    }

    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key]) && source[key].length > 0) {
            return source[key];
        }
    }

    return [];
}

export default function UpdateCollegeFeeWaivedOffForm({ selectedRow, onSuccess, className }: UpdateCollegeFeeWaivedOffFormProps) {
    const { refetchAll } = useCollegeFeeWaivedOffList();

    const editId = Number(selectedRow.fcswO_Id || selectedRow.FCSWO_Id);
    const { data: editData, isLoading: isEditLoading } = useCollegeFeeWaivedOffEdit(editId);

    const [feeHeadsState, setFeeHeadsState] = useState<
        Array<
            ICollegeFeeHeadItem & {
                isSelected: boolean;
                waivedOffAmount: string;
            }
        >
    >([]);

    const [groupsList, setGroupsList] = useState<ICollegeFeeGroup[]>([]);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeeWaivedOffSchema.addOrUpdate),
        defaultValues: {
            fcswO_Id: editId,
            asmaY_Id: String(selectedRow.asmaY_Id || ''),
            amcO_Id: String(selectedRow.amcO_Id || '1'),
            amB_Id: String(selectedRow.amB_Id || '1'),
            amsE_Id: String(selectedRow.amsE_Id || '1'),
            amcsT_Id: String(selectedRow.amcsT_Id || ''),
            fcswO_Date: selectedRow.fcswO_Date ? new Date(selectedRow.fcswO_Date) : new Date(),
            filterrefund: 'NonRefunable',
            selectedGroups: ['1'],
            checkedlist: []
        },
        mode: 'onChange'
    });

    // Populate data once fetched from edit API
    useEffect(() => {
        if (editData) {
            const rawEdit: any = (editData as any).data || editData;

            const fetchedGroups = extractArrayData<ICollegeFeeGroup>(rawEdit, ['grouplist', 'groups']);
            setGroupsList(fetchedGroups);

            const fetchedHeads = extractArrayData<ICollegeFeeHeadItem>(rawEdit, ['headlist', 'heads']);
            if (fetchedHeads && fetchedHeads.length > 0) {
                setFeeHeadsState(
                    fetchedHeads.map((head) => ({
                        ...head,
                        isSelected: true,
                        waivedOffAmount: String(
                            head.fcswO_WaivedOffAmount ?? head.FCSWO_WaivedOffAmount ?? selectedRow.fcswO_WaivedOffAmount ?? ''
                        )
                    }))
                );
            } else {
                // Fallback to selected row as head
                setFeeHeadsState([
                    {
                        fmH_Id: Number(selectedRow.fmH_Id || 0),
                        fmH_FeeName: selectedRow.fmH_FeeName,
                        ftI_Id: Number(selectedRow.ftI_Id || 0),
                        ftI_Name: selectedRow.ftI_Name,
                        fcsS_ToBePaid: Number(selectedRow.fcsS_ToBePaid || 0),
                        fcsS_PaidAmount: Number(selectedRow.fcsS_PaidAmount || 0),
                        fcmaS_Id: Number(selectedRow.fcmaS_Id || 0),
                        fmG_Id: Number(selectedRow.fmG_Id || 0),
                        fcswO_WaivedOffAmount: Number(selectedRow.fcswO_WaivedOffAmount || 0),
                        isSelected: true,
                        waivedOffAmount: String(selectedRow.fcswO_WaivedOffAmount || '')
                    }
                ]);
            }

            if (rawEdit.asmaY_Id) setValue('asmaY_Id', String(rawEdit.asmaY_Id));
            if (rawEdit.amcO_Id) setValue('amcO_Id', String(rawEdit.amcO_Id));
            if (rawEdit.amB_Id) setValue('amB_Id', String(rawEdit.amB_Id));
            if (rawEdit.amsE_Id) setValue('amsE_Id', String(rawEdit.amsE_Id));
            if (rawEdit.amcsT_Id) setValue('amcsT_Id', String(rawEdit.amcsT_Id));
            if (rawEdit.filterrefund) setValue('filterrefund', rawEdit.filterrefund);
            if (rawEdit.fcswO_Date) setValue('fcswO_Date', new Date(rawEdit.fcswO_Date));
            if (fetchedGroups.length > 0) {
                setValue(
                    'selectedGroups',
                    fetchedGroups.map((g) => String(g.fmG_Id))
                );
            }
        }
    }, [editData, selectedRow, setValue]);

    // Sync selected heads with form
    useEffect(() => {
        const activeList = feeHeadsState
            .filter((h) => h.isSelected && Number(h.waivedOffAmount) > 0)
            .map((h) => ({
                fmG_Id: Number(h.fmG_Id || selectedRow.fmG_Id || 0),
                fmH_Id: Number(h.fmH_Id || selectedRow.fmH_Id || 0),
                ftI_Id: Number(h.ftI_Id || selectedRow.ftI_Id || 0),
                fcmaS_Id: Number(h.fcmaS_Id || selectedRow.fcmaS_Id || 0),
                fcswO_WaivedOffAmount: Number(h.waivedOffAmount),
                fmH_FeeName: h.fmH_FeeName,
                ftI_Name: h.ftI_Name,
                fcsS_ToBePaid: Number(h.fcsS_ToBePaid || 0),
                fcsS_PaidAmount: Number(h.fcsS_PaidAmount || 0)
            }));
        setValue('checkedlist', activeList, { shouldValidate: true });
    }, [feeHeadsState, selectedRow, setValue]);

    const toggleHeadRow = (index: number) => {
        setFeeHeadsState((prev) =>
            prev.map((head, idx) => {
                if (idx === index) {
                    const nextSelected = !head.isSelected;
                    return {
                        ...head,
                        isSelected: nextSelected,
                        waivedOffAmount: nextSelected ? head.waivedOffAmount || '' : ''
                    };
                }
                return head;
            })
        );
    };

    const updateHeadAmount = (index: number, val: string) => {
        if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
        setFeeHeadsState((prev) =>
            prev.map((head, idx) => {
                if (idx === index) {
                    return {
                        ...head,
                        waivedOffAmount: val
                    };
                }
                return head;
            })
        );
    };

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            if (!formData.checkedlist || formData.checkedlist.length === 0) {
                toast.error('Please select at least one Fee Head and enter a valid Waived Off Amount greater than 0');
                return;
            }

            const zeroAmountItem = formData.checkedlist.find((item) => Number(item.fcswO_WaivedOffAmount) <= 0);
            if (zeroAmountItem) {
                toast.error('Entered amount for selected heads must be greater than zero');
                return;
            }

            const payload = {
                fcswO_Id: editId,
                FCSWO_Id: editId,
                asmaY_Id: Number(formData.asmaY_Id || selectedRow.asmaY_Id),
                ASMAY_Id: Number(formData.asmaY_Id || selectedRow.asmaY_Id),
                amcsT_Id: Number(formData.amcsT_Id || selectedRow.amcsT_Id),
                AMCST_Id: Number(formData.amcsT_Id || selectedRow.amcsT_Id),
                fcswO_Date: new Date(formData.fcswO_Date).toISOString(),
                FCSWO_Date: new Date(formData.fcswO_Date).toISOString(),
                checkedlist: formData.checkedlist.map((item) => ({
                    fmG_Id: Number(item.fmG_Id),
                    FMG_Id: Number(item.fmG_Id),
                    fmH_Id: Number(item.fmH_Id),
                    FMH_Id: Number(item.fmH_Id),
                    ftI_Id: Number(item.ftI_Id),
                    FTI_Id: Number(item.ftI_Id),
                    fcmaS_Id: Number(item.fcmaS_Id || 0),
                    FCMAS_Id: Number(item.fcmaS_Id || 0),
                    fcswO_WaivedOffAmount: Number(item.fcswO_WaivedOffAmount),
                    FCSWO_WaivedOffAmount: Number(item.fcswO_WaivedOffAmount)
                }))
            };

            const response = await saveCollegeFeeWaivedOff(payload);

            const status = response?.returnduplicatestatus || response?.returnval || response?.message;
            if (status === 'Saved' || status === 'Updated' || response?.success) {
                toast.success('Record Updated Successfully');
                refetchAll();
                onSuccess?.();
            } else if (status === 'adjusted') {
                toast.warning('Record already adjusted / refunded');
                refetchAll();
            } else {
                toast.info(response?.message || `Record ${status || 'processed'}`);
                refetchAll();
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error(error.message ?? 'An error occurred while updating Waived Off record');
        }
    };

    if (isEditLoading) {
        return (
            <Card className='border-border/60 p-8 text-center'>
                <div className='font-medium text-muted-foreground text-sm'>Loading details for edit...</div>
            </Card>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit, (errs) => {
                console.log('Form errors:', errs);
                const failedFields = Object.keys(errs).join(', ');
                toast.error(`Validation failed on: ${failedFields}. Check console for details.`);
            })}
            className={cn('space-y-6', className)}>
            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Left Column: Readonly Info */}
                <Card className='border-border/60 shadow-sm'>
                    <CardContent className='space-y-4 pt-5'>
                        <div className='rounded-lg bg-muted/40 p-4'>
                            <h4 className='mb-3 font-semibold text-foreground text-sm'>Student Information</h4>
                            <div className='grid grid-cols-2 gap-3 text-xs'>
                                <div>
                                    <span className='text-muted-foreground'>Student Name:</span>
                                    <div className='font-semibold text-foreground'>
                                        {selectedRow.amcsT_FirstName || selectedRow.AMCST_FirstName || 'N.A'}
                                    </div>
                                </div>
                                <div>
                                    <span className='text-muted-foreground'>Fee Head:</span>
                                    <div className='font-semibold text-foreground'>
                                        {selectedRow.fmH_FeeName || selectedRow.FMH_FeeName || 'N.A'}
                                    </div>
                                </div>
                                <div>
                                    <span className='text-muted-foreground'>Installment:</span>
                                    <div className='font-semibold text-foreground'>
                                        {selectedRow.ftI_Name || selectedRow.FTI_Name || 'N.A'}
                                    </div>
                                </div>
                                <div>
                                    <span className='text-muted-foreground'>Current Waived Amount:</span>
                                    <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                                        ₹{' '}
                                        {Number(selectedRow.fcswO_WaivedOffAmount || 0).toLocaleString('en-IN', {
                                            minimumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Readonly Groups */}
                        {groupsList.length > 0 && (
                            <div className='space-y-1.5'>
                                <Label>Associated Fee Groups</Label>
                                <div className='flex flex-wrap gap-1.5'>
                                    {groupsList.map((g) => (
                                        <span
                                            key={g.fmG_Id}
                                            className='rounded-md bg-secondary/80 px-2.5 py-1 font-medium text-secondary-foreground text-xs'>
                                            {g.fmG_GroupName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Editable Date & Radio */}
                <Card className='border-border/60 shadow-sm'>
                    <CardContent className='space-y-5 pt-5'>
                        {/* Waived Off Date */}
                        <div className='space-y-1.5'>
                            <Label htmlFor='fcswO_Date' isRequired>
                                Waived Off Date
                            </Label>
                            <Controller
                                control={control}
                                name='fcswO_Date'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={(d) => {
                                            if (d) field.onChange(d);
                                        }}
                                        placeholder='Select Date'
                                    />
                                )}
                            />
                            <FormError>{errors.fcswO_Date?.message}</FormError>
                        </div>

                        {/* Refundable / Non-Refundable Radio Options */}
                        <div className='rounded-lg border bg-muted/30 p-3.5'>
                            <Label className='mb-2.5 block font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                Refund Category
                            </Label>
                            <Controller
                                control={control}
                                name='filterrefund'
                                render={({ field }) => (
                                    <RadioGroup value={field.value} disabled className='flex flex-row gap-6 opacity-70'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='NonRefunable' id='edit_nonrefundable' />
                                            <Label htmlFor='edit_nonrefundable' className='font-medium'>
                                                Non Refundable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Refunable' id='edit_refundable' />
                                            <Label htmlFor='edit_refundable' className='font-medium'>
                                                Refundable
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fee Heads Dynamic Table */}
            {feeHeadsState.length > 0 && (
                <Card className='border-primary/20 shadow-md transition-shadow hover:shadow-lg'>
                    <div className='flex items-center justify-between border-b bg-muted/40 px-5 py-3.5'>
                        <div className='flex items-center gap-2'>
                            <DollarSign className='h-4 w-4 text-primary' />
                            <h3 className='font-semibold text-base text-foreground'>Fee Heads & Waived Off Amount</h3>
                        </div>
                    </div>

                    <CardContent className='p-0'>
                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow className='bg-muted/20'>
                                        <TableHead className='w-12 text-center'>Select</TableHead>
                                        <TableHead className='w-12 text-center'>SLNO</TableHead>
                                        <TableHead>Fee Name</TableHead>
                                        <TableHead>Installment</TableHead>
                                        <TableHead className='text-right'>Balance</TableHead>
                                        <TableHead className='text-right'>Paid Amount</TableHead>
                                        <TableHead className='w-48 text-right'>Waived Off Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feeHeadsState.map((head, index) => (
                                        <TableRow
                                            key={`${head.fmG_Id}-${head.fmH_Id}-${head.ftI_Id}-${index}`}
                                            className={cn(head.isSelected ? 'bg-primary/[0.03]' : '')}>
                                            <TableCell className='text-center'>
                                                <input
                                                    type='checkbox'
                                                    checked={head.isSelected}
                                                    onChange={() => toggleHeadRow(index)}
                                                    className='h-4 w-4 rounded border-gray-300 accent-primary'
                                                />
                                            </TableCell>
                                            <TableCell className='text-center font-medium text-muted-foreground text-xs'>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className='font-medium text-foreground'>{head.fmH_FeeName}</TableCell>
                                            <TableCell>
                                                <span className='rounded bg-muted px-2 py-0.5 font-medium text-xs'>{head.ftI_Name}</span>
                                            </TableCell>
                                            <TableCell className='text-right font-medium text-amber-600 dark:text-amber-400'>
                                                ₹ {Number(head.fcsS_ToBePaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className='text-right font-medium text-emerald-600 dark:text-emerald-400'>
                                                ₹ {Number(head.fcsS_PaidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <div className='flex flex-col items-end gap-1'>
                                                    <InputText
                                                        type='text'
                                                        disabled={!head.isSelected}
                                                        value={head.waivedOffAmount}
                                                        onChange={(e) => updateHeadAmount(index, e.target.value)}
                                                        placeholder='0.00'
                                                        className={cn(
                                                            'h-9 w-36 text-right font-semibold',
                                                            head.isSelected && !head.waivedOffAmount
                                                                ? 'border-destructive focus-visible:ring-destructive'
                                                                : ''
                                                        )}
                                                    />
                                                    {head.isSelected && !head.waivedOffAmount && (
                                                        <span className='text-[10px] text-destructive'>Amount required</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Actions */}
            <div className='flex items-center justify-center gap-3 pt-2'>
                <Button
                    type='submit'
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className='min-w-32 shadow-md transition-all hover:scale-105 hover:shadow-lg'>
                    <Save className='mr-2 h-4 w-4' />
                    Update
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onSuccess}
                    className='min-w-32 hover:bg-destructive/10 hover:text-destructive'>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
