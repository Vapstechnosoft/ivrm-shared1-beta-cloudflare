'use client';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAmountOrPercentageDropdown,
    useEarningsDeductionsTypeDropdown,
    useMasterEarningsDeductions,
    useRoundingTypeDropdown,
    useSalaryComponentTypeDropdown,
    useEarningAndDeductionDropdown
} from '@/hooks/hrms/useMasters';
import { EARNING_DEDUCTION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { saveMasterEarningsDeductions } from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import type {
    IAmountOrPercentageDropdown,
    IEarningsDeductionsTypeDropdown,
    IRoundingTypeDropdown,
    ISalaryComponentTypeDropdown
} from '@/types/hrms/hrms-config/master';
import type { MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

// SafeSelectItem component to filter out invalid/empty dropdown items
const SafeSelectItem = ({
    children,
    value,
    ...props
}: {
    children: React.ReactNode;
    value: string;
    [key: string]: any;
}) => {
    if (!value || value.trim() === '') return null;
    return (
        <SelectItem value={value} {...props}>
            {children}
        </SelectItem>
    );
};

interface AddEarningsDeductionsFormProps {
    onSuccess?: () => void;
    className?: string;
}
export default function AddEarningsDeductionsForm({ onSuccess, className = '' }: AddEarningsDeductionsFormProps) {
    const { refetchAll } = useMasterEarningsDeductions();
    const [resetKey, setResetKey] = useState(0);
    const [earnDeduList,setEarnDeduList] = useState([]);

    // Helper function to map API response to dropdown items
    const mapToDropdownItems = (response: any) => {
        let rawData: any[] = [];
        if (Array.isArray(response)) {
            rawData = response;
        } else if (response?.data) {
            if (Array.isArray(response.data)) {
                rawData = response.data;
            } else if (response.data?.$values && Array.isArray(response.data.$values)) {
                rawData = response.data.$values;
            } else if (typeof response.data === 'object') {
                rawData = [response.data];
            }
        } else if (response?.$values && Array.isArray(response.$values)) {
            rawData = response.$values;
        }

        return rawData.map((item: any) => {
            if (!item || typeof item !== 'object') return { key: String(item || ''), value: String(item || '') };

            const keyVal = item.key ?? item.id ?? item.idField ?? item.hrmedT_Id ?? item.HRMED_Id;
            const displayVal = item.hrmedT_EarnDedType ?? item.HRMEDT_EarnDedType ?? item.name ?? item.text ?? item.label ?? item.value;

            if (keyVal !== undefined && displayVal !== undefined) {
                return { key: String(keyVal).trim(), value: String(displayVal).trim() };
            }

            const keys = Object.keys(item);
            const idField = keys.find((k) => k.toLowerCase().endsWith('id'));
            const nameField = keys.find(
                (k) =>
                    (k.toLowerCase().includes('type') ||
                        k.toLowerCase().includes('name') ||
                        k.toLowerCase().includes('flag') ||
                        k.toLowerCase().includes('desc') ||
                        k.toLowerCase().includes('text') ||
                        k.toLowerCase().includes('label')) &&
                    !k.toLowerCase().endsWith('id')
            );

            const finalKey = idField ? item[idField] : (keyVal ?? (keys[0] ? item[keys[0]] : ''));
            const finalValue = nameField ? item[nameField] : (displayVal ?? finalKey);

            return {
                key: String(finalKey ?? '').trim(),
                value: String(finalValue ?? '').trim()
            };
        });
    };

    // Earnings Deductions Type dropdown
    const { data: earningsDeductionsTypeDropdownResponse, isLoading: isLoadingEarningsDeductionsTypes } =
        useEarningsDeductionsTypeDropdown();
    const earningsDeductionsTypeDropdown: IEarningsDeductionsTypeDropdown[] = useMemo(() => {
        return mapToDropdownItems(earningsDeductionsTypeDropdownResponse);
    }, [earningsDeductionsTypeDropdownResponse]);
    console.log("earningsDeductionsTypeDropdown", earningsDeductionsTypeDropdown)
    // Rounding Type dropdown
    const { data: roundingTypeDropdownResponse, isLoading: isLoadingRoundingTypes } = useRoundingTypeDropdown();
    console.log("rounding types", roundingTypeDropdownResponse)
    const roundingTypeDropdown: IRoundingTypeDropdown[] = useMemo(() => {
        return mapToDropdownItems(roundingTypeDropdownResponse);
    }, [roundingTypeDropdownResponse]);

    // Amount Or Percentage dropdown
    const { data: amountOrPercentageDropdownResponse, isLoading: isLoadingAmountOrPercentage } = useAmountOrPercentageDropdown();
    const amountOrPercentageDropdown: IAmountOrPercentageDropdown[] = useMemo(() => {
        return mapToDropdownItems(amountOrPercentageDropdownResponse);
    }, [amountOrPercentageDropdownResponse]);

    // Salary Component Type dropdown (Earning/Deduction)
    const { data: salaryComponentTypeDropdownResponse, isLoading: isLoadingSalaryComponentType } = useSalaryComponentTypeDropdown();
    const salaryComponentTypeDropdown: ISalaryComponentTypeDropdown[] = useMemo(() => {
        return mapToDropdownItems(salaryComponentTypeDropdownResponse);
    }, [salaryComponentTypeDropdownResponse]);
    const {
        register,
        handleSubmit,
        reset,
        control,
        getValues,
        trigger,
        formState: { errors, isSubmitting }
    } = useForm<MasterEarningsDeductionsInput>({
        mode: 'onChange',
        defaultValues: {
            HRMED_EDTypeFlag: ''
        }
    });
    const calculationType = useWatch({
        control,
        name: 'HRMED_AmountPercentFlag',
        defaultValue: 'Amount'
    });

    const isPercentage = calculationType === 'Percentage' || calculationType?.toLowerCase() === 'percentage';

    const {
        data: earningAndDeductionDropdownResponse,
        isLoading: isLoadingEarningAndDeduction
    } = useEarningAndDeductionDropdown({
        enabled: isPercentage
    });

    

    const [selectedPercentageIds, setSelectedPercentageIds] = useState<number[]>([]);
    const [percentagePage, setPercentagePage] = useState<number>(1);
    const pageSize = 10;

    // Filter only items where "hrmeD_AmountPercentFlag": "Percentage"
    const percentageOfList = useMemo(() => {
        let rawData: any[] = [];
        const res = earningAndDeductionDropdownResponse as any;
        console.log("result  for percentage",res)
        if (!res) return [];

        if (Array.isArray(res)) {
            rawData = res;
        } else if (Array.isArray(res?.data?.earningdetectionList)) {
            rawData = res.data.earningdetectionList;
        } else if (Array.isArray(res?.data?.EarningdetectionList)) {
            rawData = res.data.EarningdetectionList;
        } else if (res?.data?.earningdetectionList?.$values && Array.isArray(res.data.earningdetectionList.$values)) {
            rawData = res.data.earningdetectionList.$values;
        } else if (Array.isArray(res?.earningdetectionList)) {
            rawData = res.earningdetectionList;
        } else if (Array.isArray(res?.data)) {
            rawData = res.data;
        }

        // return rawData.filter((item: any) => {
        //     const flag = item?.hrmeD_AmountPercentFlag || item?.HRMED_AmountPercentFlag || '';
        //     return flag.toLowerCase() === 'percentage';
        // });
        return rawData;
    }, [earningAndDeductionDropdownResponse]);

    const totalPercentagePages = Math.ceil(percentageOfList.length / pageSize) || 1;

    const paginatedPercentageList = useMemo(() => {
        const startIndex = (percentagePage - 1) * pageSize;
        return percentageOfList.slice(startIndex, startIndex + pageSize);
    }, [percentageOfList, percentagePage, pageSize]);

    const togglePercentageSelection = (id: number) => {
        setSelectedPercentageIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const onSubmit = async (data: MasterEarningsDeductionsInput) => {
        try {
            // Build the request body - map to lowercase field names as per API
            const payload: any = {
                hrmeD_Id: 0,
                HRMED_Id: 0,
                hrmeD_Name: data.HRMED_Name?.trim() || '',
                HRMED_Name: data.HRMED_Name?.trim() || '',
                hrmeD_EDTypeFlag: data.HRMED_EDTypeFlag?.trim() || '',
                HRMED_EDTypeFlag: data.HRMED_EDTypeFlag?.trim() || '',
                hrmeD_EarnDedFlag: data.HRMED_EarnDedFlag,
                HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
                hrmeD_AmountPercentFlag: data.HRMED_AmountPercentFlag,
                HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
                hrmeD_AmountPercent: data.HRMED_AmountPercent,
                HRMED_AmountPercent: data.HRMED_AmountPercent,
                hrmeD_RoundOffFlag: data.HRMED_RoundOffFlag,
                HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
                hrmeD_ReviseFlg: data.HRMED_ReviseFlg ?? false,
                HRMED_ReviseFlg: data.HRMED_ReviseFlg ?? false,
                hrmeD_Order: data.HRMED_Order || 0,
                HRMED_Order: data.HRMED_Order || 0,
                perc_OfDTO: isPercentage
                    ? selectedPercentageIds.map((id) => ({
                          hrmeD_Id: 0,
                          HRMED_Id: 0,
                          hrmedP_HRMED_Id: id,
                          HRMEDP_HRMED_Id: id
                      }))
                    : []
            };
            console.log("Payload earn deduction", payload);
            const response = await saveMasterEarningsDeductions(payload);

            if (response?.success) {
                toast.success(response?.message || 'Earning/Deduction added successfully');
                reset();
                setSelectedPercentageIds([]);
                setPercentagePage(1);
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(response?.message || 'Failed to add earning/deduction');
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || error?.data?.message || 'Failed to add earning/deduction';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
        setSelectedPercentageIds([]);
        setPercentagePage(1);
        setResetKey((prev) => prev + 1);
    };
    return (
        <div className={className}>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_Name'>
                            Name <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMED_Name'
                            placeholder='Enter earning/deduction name'
                            maxLength={EARNING_DEDUCTION_VALIDATION.HRMED_Name.maxLength?.value}
                            error={errors.HRMED_Name?.message}
                            {...register('HRMED_Name', EARNING_DEDUCTION_VALIDATION.HRMED_Name)}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_EDTypeFlag'>Type</Label>
                        <Controller
                            key={resetKey}
                            name='HRMED_EDTypeFlag'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value=' '>
                                                --select--
                                        </SelectItem>
                                        {isLoadingEarningsDeductionsTypes ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (earningsDeductionsTypeDropdown || []).length === 0 ? (
                                            <SelectItem value='no-options' disabled>
                                                No options available
                                            </SelectItem>
                                        ) : (
                                            (earningsDeductionsTypeDropdown || [])
                                                .filter((item) => {
                                                    const val = item.value || item.key;
                                                    return val != null && val !== '' && String(val).trim() !== '';
                                                })
                                                .map((item) => {
                                                    const key = item.key?.toString().trim();
                                                    const value = item.value || String(key);
                                                    if (!key || key === '') return null;
                                                    return (
                                                        <SafeSelectItem key={key} value={value}>
                                                            {value}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_RoundOffFlag'>
                            Rounding To <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            key={resetKey}
                            name='HRMED_RoundOffFlag'
                            control={control}
                            rules={{ required: 'Rounding option is required' }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Rounding' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingRoundingTypes ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (roundingTypeDropdown || []).length === 0 ? (
                                            <SelectItem value='no-options' disabled>
                                                No options available
                                            </SelectItem>
                                        ) : (
                                            (roundingTypeDropdown || [])
                                                .filter((item) => {
                                                    const key = item.key || item.value;
                                                    return key != null && key !== '' && String(key).trim() !== '';
                                                })
                                                .map((item) => {
                                                    const key = item.key?.toString().trim();
                                                    const value = item.value || String(key);
                                                    if (!key || key === '') return null;
                                                    return (
                                                        <SafeSelectItem key={key} value={key}>
                                                            {value}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRMED_RoundOffFlag && <FormError>{errors.HRMED_RoundOffFlag.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_EarnDedFlag'>
                            Earning/Deduction <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            key={resetKey}
                            name='HRMED_EarnDedFlag'
                            control={control}
                            rules={{ required: 'Earning/Deduction is required' }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingSalaryComponentType ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (salaryComponentTypeDropdown || []).length === 0 ? (
                                            <SelectItem value='no-options' disabled>
                                                No options available
                                            </SelectItem>
                                        ) : (
                                            (salaryComponentTypeDropdown || [])
                                                .filter((item) => {
                                                    const key = item.key || item.value;
                                                    return key != null && key !== '' && String(key).trim() !== '';
                                                })
                                                .map((item) => {
                                                    const key = item.key?.toString().trim();
                                                    const value = item.value || String(key);
                                                    if (!key || key === '') return null;
                                                    return (
                                                        <SafeSelectItem key={key} value={key}>
                                                            {value}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRMED_EarnDedFlag && <FormError>{errors.HRMED_EarnDedFlag.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_AmountPercentFlag'>
                            Calculation Type <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            key={resetKey}
                            name='HRMED_AmountPercentFlag'
                            control={control}
                            rules={{ required: 'Calculation Type is required' }}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (getValues('HRMED_AmountPercent')) {
                                            trigger('HRMED_AmountPercent');
                                        }
                                    }}
                                    value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Calculation Type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingAmountOrPercentage ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : (amountOrPercentageDropdown || []).length === 0 ? (
                                            <SelectItem value='no-options' disabled>
                                                No options available
                                            </SelectItem>
                                        ) : (
                                            (amountOrPercentageDropdown || [])
                                                .filter((item) => {
                                                    const key = item.key || item.value;
                                                    return key != null && key !== '' && String(key).trim() !== '';
                                                })
                                                .map((item) => {
                                                    const key = item.key?.toString().trim();
                                                    const value = item.value || String(key);
                                                    if (!key || key === '') return null;
                                                    return (
                                                        <SafeSelectItem key={key} value={key}>
                                                            {value}
                                                        </SafeSelectItem>
                                                    );
                                                })
                                                .filter(Boolean)
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.HRMED_AmountPercentFlag && <FormError>{errors.HRMED_AmountPercentFlag.message}</FormError>}
                    </div>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='HRMED_AmountPercent'>
                            {calculationType === 'Percentage' ? 'Percentage' : 'Amount'} <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='HRMED_AmountPercent'
                            placeholder={`Enter ${calculationType === 'Percentage' ? 'percentage' : 'amount'}`}
                            maxLength={calculationType === 'Percentage' ? 5 : undefined}
                            error={errors.HRMED_AmountPercent?.message}
                            {...register('HRMED_AmountPercent', {
                                required: EARNING_DEDUCTION_VALIDATION.HRMED_AmountPercent.required,
                                validate: (value) => {
                                    const numValue = Number.parseFloat(value);
                                    if (Number.isNaN(numValue)) {
                                        return 'Amount/Percentage must be a valid number';
                                    }
                                    if (numValue < 0) {
                                        return 'Amount/Percentage cannot be negative';
                                    }
                                    const currentCalculationType = getValues('HRMED_AmountPercentFlag') || calculationType;
                                    if (currentCalculationType === 'Amount') {
                                        if (numValue > 9999999999) {
                                            return 'Amount must not exceed 10 digits';
                                        }
                                    } else if (currentCalculationType === 'Percentage') {
                                        if (numValue > 100) {
                                            return 'Percentage must not exceed 100';
                                        }
                                        if (value.length > 5) {
                                            return 'Percentage must not exceed 5 characters (e.g., 99.99)';
                                        }
                                    }
                                    return true;
                                }
                            })}
                            onInput={(e) => {
                                const target = e.currentTarget;
                                let val = target.value;
                                val = val.replace(/[^0-9.]/g, '');
                                const parts = val.split('.');
                                if (parts.length > 2) {
                                    val = parts[0] + '.' + parts.slice(1).join('');
                                }
                                target.value = val;
                            }}
                        />
                    </div>
                    <div className='group flex items-center gap-2'>
                        <Input type='checkbox' id='HRMED_ReviseFlg' className='h-4 w-4' {...register('HRMED_ReviseFlg')} />
                        <Label htmlFor='HRMED_ReviseFlg' className='cursor-pointer'>
                            Revise
                        </Label>
                    </div>

                    {/* Percentage Of Table */}
                    {isPercentage && (
                        <div className='col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 items-start pt-2'>
                            <div className='w-36 shrink-0 pt-2'>
                                <Label className='text-sm font-semibold'>
                                    Percentage Of:<span className='text-destructive'>*</span>
                                </Label>
                            </div>
                            <div className='flex-1 w-full max-w-4xl'>
                                <div className='border border-[#0056b3] rounded-sm overflow-hidden shadow-sm'>
                                    <table className='w-full border-collapse text-sm'>
                                        <thead>
                                            <tr className='bg-violet-700 text-white text-sm font-bold'>
                                                <th className='py-2.5 px-4 text-center border-r border-blue-400/30 w-2/5'>Name</th>
                                                <th className='py-2.5 px-4 text-center border-r border-blue-400/30 w-1/4'>Type</th>
                                                <th className='py-2.5 px-4 text-center border-r border-blue-400/30 w-1/5'>Amt/Per</th>
                                                <th className='py-2.5 px-4 text-center w-1/6'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-gray-200 bg-white'>
                                            {isLoadingEarningAndDeduction ? (
                                                <tr>
                                                    <td colSpan={4} className='py-6 text-center text-muted-foreground'>
                                                        <div className='flex items-center justify-center gap-2'>
                                                            <Loader2 className='h-4 w-4 animate-spin text-primary' />
                                                            <span>Loading components...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : paginatedPercentageList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className='py-6 text-center text-muted-foreground'>
                                                        No percentage records available.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedPercentageList.map((item: any, index: number) => {
                                                    const numId = Number(item.hrmeD_Id ?? item.HRMED_Id);
                                                    const isChecked = selectedPercentageIds.includes(numId);
                                                    const name = item.hrmeD_Name ?? item.HRMED_Name ?? '-';
                                                    const type = item.hrmeD_EarnDedFlag ?? item.HRMED_EarnDedFlag ?? item.hrmeD_EDTypeFlag ?? '-';
                                                    const amountPercent = item.hrmeD_AmountPercent ?? item.HRMED_AmountPercent ?? '0';
                                                    const isItemPercentage =
                                                        (item.hrmeD_AmountPercentFlag ?? item.HRMED_AmountPercentFlag ?? '').toLowerCase() === 'percentage';

                                                    return (
                                                        <tr
                                                            key={numId || index}
                                                            onClick={() => togglePercentageSelection(numId)}
                                                            className={`transition-colors hover:bg-blue-50/50 cursor-pointer ${isChecked ? 'bg-blue-50/30' : ''}`}>
                                                            <td className='py-2.5 px-4 text-center border-r border-gray-200 font-medium text-gray-800'>
                                                                {name}
                                                            </td>
                                                            <td className='py-2.5 px-4 text-center border-r border-gray-200 text-gray-700'>
                                                                {type}
                                                            </td>
                                                            <td className='py-2.5 px-4 text-center border-r border-gray-200 text-gray-700'>
                                                                {isItemPercentage ? `${amountPercent} %` : amountPercent}
                                                            </td>
                                                            <td className='py-2.5 px-4 text-center'>
                                                                <div
                                                                    className='flex items-center justify-center'
                                                                    onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type='checkbox'
                                                                        checked={isChecked}
                                                                        onChange={() => togglePercentageSelection(numId)}
                                                                        className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer'
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPercentagePages > 1 && (
                                    <div className='flex flex-wrap items-center justify-between gap-3 mt-3 px-1'>
                                        <span className='text-xs text-muted-foreground'>
                                            Showing {((percentagePage - 1) * pageSize) + 1} to {Math.min(percentagePage * pageSize, percentageOfList.length)} of {percentageOfList.length} items
                                        </span>
                                        <div className='flex items-center gap-1 border border-border bg-background rounded-full p-1 shadow-xs'>
                                            <button
                                                type='button'
                                                onClick={() => setPercentagePage(1)}
                                                disabled={percentagePage === 1}
                                                className='h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
                                                title='First Page'>
                                                <ChevronsLeft className='h-3.5 w-3.5' />
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => setPercentagePage((p) => Math.max(1, p - 1))}
                                                disabled={percentagePage === 1}
                                                className='h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
                                                title='Previous Page'>
                                                <ChevronLeft className='h-3.5 w-3.5' />
                                            </button>
                                            {Array.from({ length: totalPercentagePages }, (_, i) => i + 1)
                                                .filter((page) => {
                                                    if (totalPercentagePages <= 5) return true;
                                                    if (page === 1 || page === totalPercentagePages) return true;
                                                    return Math.abs(page - percentagePage) <= 1;
                                                })
                                                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                                                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (page as number) - (arr[idx - 1] as number) > 1) {
                                                        acc.push('...');
                                                    }
                                                    acc.push(page);
                                                    return acc;
                                                }, [])
                                                .map((page, index) =>
                                                    page === '...' ? (
                                                        <span
                                                            key={`ellipsis-${index}`}
                                                            className='h-7 w-6 flex items-center justify-center text-xs text-muted-foreground'>
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={`page-${page}`}
                                                            type='button'
                                                            onClick={() => setPercentagePage(Number(page))}
                                                            className={`h-7 w-7 flex items-center justify-center text-xs font-semibold rounded-full transition-all ${
                                                                percentagePage === page
                                                                    ? 'bg-destructive text-destructive-foreground shadow-xs font-bold'
                                                                    : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                                                            }`}>
                                                            {page}
                                                        </button>
                                                    )
                                                )}
                                            <button
                                                type='button'
                                                onClick={() => setPercentagePage((p) => Math.min(totalPercentagePages, p + 1))}
                                                disabled={percentagePage === totalPercentagePages}
                                                className='h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
                                                title='Next Page'>
                                                <ChevronRight className='h-3.5 w-3.5' />
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => setPercentagePage(totalPercentagePages)}
                                                disabled={percentagePage === totalPercentagePages}
                                                className='h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
                                                title='Last Page'>
                                                <ChevronsRight className='h-3.5 w-3.5' />
                                            </button>
                                            <div className='h-3.5 w-px bg-border mx-1' />
                                            <span className='text-xs font-medium text-muted-foreground px-2 whitespace-nowrap'>
                                                Page {percentagePage} of {totalPercentagePages}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Earning/Deduction
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
