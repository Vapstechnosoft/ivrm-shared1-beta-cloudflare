'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useMasterFeeInstallment } from '@/hooks/fees/useMasters';
import { masterInstallmentSchema } from '@/schemas/fees/masters';
import { addOrUpdateInstallment, getfeeInstallmentsByFmiId } from '@/server/fees/masters/feeinstallment';
import type { IMasterFeesInstallmentList } from '@/types/fees/masters/masters';

type FormFields = z.infer<typeof masterInstallmentSchema.addOrUpdate> & {
    fmI_Id?: number;
    installments?: { sno: number; ftI_Name: string; ftI_Id?: number }[];
};

interface UpdateMasterFeeInstallmentFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterFeesInstallmentList;
}

export default function UpdateMasterFeeInstallmentForm({ onSuccess, selectedRow: row }: UpdateMasterFeeInstallmentFormProps) {
    const { refetchAll } = useMasterFeeInstallment();

    const sanitizeId = (id: any): number | undefined => {
        if (id === null || id === undefined) return undefined;
        if (typeof id === 'string') {
            const trimmed = id.trim();
            const lower = trimmed.toLowerCase();
            if (lower === '$undefined' || lower === 'undefined' || trimmed === '') {
                return undefined;
            }
            const n = Number(trimmed);
            if (!Number.isNaN(n) && n > 0 && Number.isInteger(n)) {
                return n;
            }
            return undefined;
        }
        if (typeof id === 'number') {
            return id > 0 && Number.isInteger(id) ? id : undefined;
        }
        return undefined;
    };

    const getRowId = (r: any): number | undefined => {
        if (!r) return undefined;
        return sanitizeId(r.fmI_Id) ?? sanitizeId(r.FMI_Id) ?? sanitizeId(r.fmIId) ?? sanitizeId(r.fmi_id) ?? sanitizeId(r.id);
    };

    const getInstId = (inst: any): number | undefined => {
        if (!inst) return undefined;
        return sanitizeId(inst.ftI_Id) ?? sanitizeId(inst.FTI_Id) ?? sanitizeId(inst.fti_id) ?? sanitizeId(inst.ftiId) ?? sanitizeId(inst.id);
    };

    const sanitizedRef = useRef<{
        fmI_Id?: number | string;
        fmI_ActiveFlag?: any;
    }>({});

    const sanitizeSnapshot = (vals: any): FormFields | null => {
        if (!vals) return null;
        const copy: any = { ...vals };

        copy.fmI_Id = getRowId(copy);

        if (Array.isArray(copy.installments)) {
            copy.installments = copy.installments.map((inst: any) => ({
                sno: inst?.sno,
                ftI_Name: inst?.ftI_Name ?? '',
                ftI_Id: getInstId(inst)
            }));
        }

        copy.fmI_No_Of_Installments = Number(copy.fmI_No_Of_Installments) || 1;
        copy.fmI_Installment_Type = copy.fmI_Installment_Type ?? '';
        copy.fmI_Name = copy.fmI_Name ?? '';

        return copy as FormFields;
    };

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstallmentSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            installments: [],
            fmI_Installment_Type: '',
            fmI_Name: '',
            fmI_No_Of_Installments: 1
        }
    });

    const initialValuesRef = useRef<FormFields | null>(null);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'installments'
    });

    const watchNoOfInstallments = useWatch({
        control,
        name: 'fmI_No_Of_Installments'
    });

    const installmentType = watch('fmI_Installment_Type');

    const INSTALLMENT_TYPES = [
        { value: '1', label: 'General', count: 0 },
        { value: '2', label: 'Once In a Carrier', count: 1 },
        { value: '3', label: 'Monthly', count: 12 },
        { value: '4', label: 'Quarterly', count: 4 },
        { value: '5', label: 'Yearly', count: 1 },
        { value: '6', label: 'Half Yearly', count: 2 },
        { value: '7', label: 'Bi Monthly', count: 6 },
        { value: '8', label: 'Anytime', count: 1 }
    ] as const;

    const normalizeInstallmentType = (type: any): string => {
        if (type === null || type === undefined) return '';
        const str = String(type).trim().toLowerCase();
        switch (str) {
            case '1':
            case 'general':
                return '1';
            case '2':
            case 'once in a carrier':
            case 'once in a career':
                return '2';
            case '3':
            case 'monthly':
                return '3';
            case '4':
            case 'quarterly':
                return '4';
            case '5':
            case 'yearly':
                return '5';
            case '6':
            case 'half yearly':
            case 'halfyearly':
                return '6';
            case '7':
            case 'bi monthly':
            case 'bimonthly':
                return '7';
            case '8':
            case 'anytime':
                return '8';
            default:
                return str;
        }
    };

    const initialLoadComplete = useRef(false);

   // Initial load effect
    useEffect(() => {
        if (!row) return;

        let isMounted = true;

        const loadData = async () => {
            const normalizedType = normalizeInstallmentType(
                row.fmI_Installment_Type ??
                (row as any).FMI_Installment_Type ??
                (row as any).fmi_installment_type ??
                (row as any).installmenttype ??
                (row as any).type
            );

            const fmIId = getRowId(row);

            sanitizedRef.current = {
                fmI_Id: fmIId,
                fmI_ActiveFlag: row.fmI_ActiceFlag ?? (row as any).fmI_ActiveFlag ?? (row as any).FMI_ActiveFlag ?? true
            };

            let targetCount = Number(row.fmI_No_Of_Installments ?? (row as any).FMI_No_Of_Installments) || 1;
            const preset = INSTALLMENT_TYPES.find((t) => t.value === normalizedType);
            if (preset && preset.count > 0 && normalizedType !== '1') {
                targetCount = preset.count;
            }

            let rowFydto =
                (row as any).fydto ??
                (row as any).installments ??
                (row as any).installmentnameList ??
                (row as any).installmentlist ??
                (row as any).installmentvaluelist ??
                (row as any).feeinstallmentList;

            // If row has no installments yet and we have fmIId, fetch the installment list from API
            if ((!Array.isArray(rowFydto) || rowFydto.length === 0) && fmIId) {
                try {
                    const fetched = await getfeeInstallmentsByFmiId(fmIId);
                    if (Array.isArray(fetched) && fetched.length > 0) {
                        rowFydto = fetched;
                    }
                } catch (e) {
                    console.error('Failed to fetch installments by fmi_id', e);
                }
            }

            if (!isMounted) return;

            let installments: { sno: number; ftI_Name: string; ftI_Id?: number }[] = [];

            if (Array.isArray(rowFydto) && rowFydto.length > 0) {
                targetCount = Math.max(targetCount, rowFydto.length);
                installments = rowFydto.map((inst: any, index: number) => ({
                    sno: index + 1,
                    ftI_Name: inst.ftI_Name || inst.FTI_Name || `Installment ${index + 1}`,
                    ftI_Id: getInstId(inst)
                }));

                while (installments.length < targetCount) {
                    installments.push({
                        sno: installments.length + 1,
                        ftI_Name: `Installment ${installments.length + 1}`
                    });
                }
            } else {
                installments = Array.from({ length: targetCount }, (_, i) => ({
                    sno: i + 1,
                    ftI_Name: `Installment ${i + 1}`
                }));
            }

            // Set the initial values ref
            initialValuesRef.current = {
                fmI_Id: fmIId,
                fmI_Installment_Type: normalizedType,
                fmI_Name: row.fmI_Name || (row as any).FMI_Name || '',
                fmI_No_Of_Installments: targetCount,
                installments
            };

          // Push the update to the next tick so the Select component is fully mounted and ready to receive it
setTimeout(() => {
    reset(sanitizeSnapshot(initialValuesRef.current) ?? undefined);
}, 50);

            initialLoadComplete.current = true;
        };

        loadData();

        return () => {
            isMounted = false;
            initialLoadComplete.current = false;
        };
    }, [row, reset]); 

    // Handle manual count change for General type
    useEffect(() => {
        if (!initialLoadComplete.current) return;
        if (watchNoOfInstallments === undefined) return;
        if (installmentType !== '1') return;

        const targetLength = Number(watchNoOfInstallments);
        const currentLength = fields.length;

        if (targetLength > currentLength) {
            for (let i = currentLength; i < targetLength; i++) {
                append({ sno: i + 1, ftI_Name: `Installment ${i + 1}` });
            }
        } else if (targetLength < currentLength) {
            for (let i = currentLength - 1; i >= targetLength; i--) {
                remove(i);
            }
        }
    }, [watchNoOfInstallments, fields.length, append, remove, installmentType]);

    const onSubmit = async (data: FormFields) => {
        try {
            // Always get the most reliable fmI_Id
            const idFromForm = getRowId(data);
            const idFromRef = sanitizeId(sanitizedRef.current?.fmI_Id);
            const idFromRow = getRowId(row);
            const idFromInit = sanitizeId(initialValuesRef.current?.fmI_Id);
            const fmI_Id = idFromForm ?? idFromRef ?? idFromRow ?? idFromInit;

            if (!fmI_Id) {
                toast.error('Installment ID is missing for update');
                return;
            }

            const payload: any = {
                fmI_Id,
                mI_Id: row.mI_Id ?? (row as any).MI_Id,
                fmI_Name: data.fmI_Name,
                fmI_Installment_Type: String(data.fmI_Installment_Type),
                fmI_No_Of_Installments: data.fmI_No_Of_Installments,
                fydto: (data.installments || []).map((inst: any, idx: number) => {
                    const originalInst =
                        (row as any).fydto?.[idx] ??
                        initialValuesRef.current?.installments?.[idx] ??
                        {};
                    const originalId = getInstId(originalInst);
                    const idFromForm = getInstId(inst);
                    const ftI_Id = idFromForm ?? originalId;

                    const item: any = {
                        ftI_Name: inst.ftI_Name
                    };
                    if (ftI_Id) {
                        item.ftI_Id = ftI_Id;
                    }
                    return item;
                })
            };

            const sanitizeOutgoing = (obj: any): any => {
                if (obj === null || obj === undefined) return undefined;
                if (typeof obj === 'string') {
                    const t = obj.trim();
                    if (t.toLowerCase() === '$undefined' || t.toLowerCase() === 'undefined' || t === '') return undefined;
                    const n = Number(t);
                    if (!Number.isNaN(n) && Number.isInteger(n) && n > 0) return n;
                    return obj;
                }
                if (typeof obj === 'number' || typeof obj === 'boolean') return obj;
                if (Array.isArray(obj)) return obj.map(sanitizeOutgoing);
                if (typeof obj === 'object') {
                    const out: any = Array.isArray(obj) ? [] : {};
                    for (const k of Object.keys(obj)) {
                        const v = sanitizeOutgoing(obj[k]);
                        if (v !== undefined) out[k] = v;
                    }
                    return out;
                }
                return undefined;
            };

            const clean = sanitizeOutgoing(payload);
            clean.fmI_Id = fmI_Id;
            clean.fmI_Installment_Type = String(data.fmI_Installment_Type);

            const response = await addOrUpdateInstallment(clean);

            if (response?.success) {
                toast.success(response?.message ?? 'Master Installment updated successfully!');
                refetchAll();
                reset(sanitizeSnapshot(initialValuesRef.current) ?? undefined);
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update installment');
            }
        } catch (error: any) {
            console.error('Error in onSubmit:', error);
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        if (initialValuesRef.current) {
            reset(sanitizeSnapshot(initialValuesRef.current) ?? undefined);
        } else {
            reset();
        }
    };

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Use Controller for hidden fmI_Id so DOM value stays in sync with form state when setValue is used */}
                <Controller
                    name='fmI_Id'
                    control={control}
                    render={({ field }) => <input type='hidden' {...field} value={field.value ?? ''} />}
                />

                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='fmI_Name'>
                        Master Installment Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fmI_Name'
                        control={control}
                        render={({ field }) => <InputText id='fmI_Name' placeholder='Enter master installment name' {...field} disabled />}
                    />
                    {/* <Controller
                        name='fmI_Name'
                        control={control}
                        render={({ field }) => (
                            <InputText
                                id='fmI_Name'
                                placeholder='Enter master installment name'
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => {
                                    const sanitized = e.target.value.replace(/[^A-Za-z ]/g, '');
                                    field.onChange(sanitized);
                                }}
                                disabled
                            />
                        )}
                    /> */}

                    {errors.fmI_Name && <FormError>{errors.fmI_Name.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='fmI_Installment_Type'>
                        Installment Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fmI_Installment_Type'
                        control={control}
                        render={({ field }) => (
                           <Select key={field.value || 'empty'} disabled={true} onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Installment Type' />
                                </SelectTrigger>
                                <SelectContent>
                                    {INSTALLMENT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.fmI_Installment_Type && <FormError>{errors.fmI_Installment_Type.message}</FormError>}
                </div>

                {installmentType === '1' && (
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_No_Of_Installments'>No. of Installments</Label>
                        <Controller
                            name='fmI_No_Of_Installments'
                            control={control}
                            render={({ field }) => (
                                <input
                                    id='fmI_No_Of_Installments'
                                    type='number'
                                    min='1'
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val === '' ? undefined : Number(val));
                                    }}
                                    placeholder='Enter number of installments'
                                    className='w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                />
                            )}
                        />
                        {errors.fmI_No_Of_Installments && <FormError>{errors.fmI_No_Of_Installments.message}</FormError>}
                    </div>
                )}

                {fields.length > 0 && (
                    <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm'>
                        <table className='min-w-full border-collapse bg-white'>
                            <thead>
                                <tr className='bg-gray-100 text-left font-semibold text-gray-700 text-sm'>
                                    <th className='w-16 border border-gray-200 px-4 py-2 text-center'>S.No</th>
                                    <th className='border border-gray-200 px-4 py-2'>Installment Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id} className='text-gray-800 text-sm transition-colors duration-150 hover:bg-gray-50'>
                                        <td className='border border-gray-200 px-4 py-2 text-center font-medium'>{index + 1}</td>
                                        <td className='border border-gray-200 px-4 py-2'>
                                            <Controller
                                                name={`installments.${index}.ftI_Name`}
                                                control={control}
                                                render={({ field: nameField }) => (
                                                    <input
                                                        type='text'
                                                        {...nameField}
                                                        placeholder={`Installment ${index + 1}`}
                                                        className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name={`installments.${index}.ftI_Id`}
                                                control={control}
                                                render={({ field: idField }) => (
                                                    <input type='hidden' {...idField} value={idField.value ?? ''} />
                                                )}
                                            />
                                            {errors.installments?.[index]?.ftI_Name && (
                                                <FormError>{errors.installments?.[index]?.ftI_Name?.message}</FormError>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                        disabled={isSubmitting}>
                        Reset
                    </Button>

                    <Button
                        type='submit'
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Installment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
