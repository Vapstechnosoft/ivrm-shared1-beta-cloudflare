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
    useEarningAndDeductionDropdown,
    useMasterEarningsDeductionsById
} from '@/hooks/hrms/useMasters';
import { EARNING_DEDUCTION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { saveMasterEarningsDeductions } from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import type { IMasterEarningsDeductionsList } from '@/types/hrms/hrms-config/master';
import type { MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

interface DropdownItem {
    key: string;
    value: string;
}

interface UpdateEarningsDeductionsFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterEarningsDeductionsList;
}
export default function UpdateEarningsDeductionsForm({ onSuccess, className = '', selectedRow: row }: UpdateEarningsDeductionsFormProps) {
    const { refetchAll } = useMasterEarningsDeductions();

    // Helper function to map API response to dropdown items
    const mapToDropdownItems = (response: any): DropdownItem[] => {
        // Handle different response structures
        let rawData: any[] = [];
        if (Array.isArray(response)) {
            rawData = response;
        } else if (response?.data) {
            if (Array.isArray(response.data)) {
                rawData = response.data;
            } else if (response.data?.$values && Array.isArray(response.data.$values)) {
                rawData = response.data.$values;
            } else if (typeof response.data === 'object') {
                // If it's a single object that isn't a wrapper, wrap it
                rawData = [response.data];
            }
        } else if (response?.$values && Array.isArray(response.$values)) {
            rawData = response.$values;
        }

        return rawData.map((item: any) => {
            if (!item || typeof item !== 'object') return { key: String(item || ''), value: String(item || '') };

            // Case 1: Already has key/value or id/name
            const keyVal = item.key ?? item.id ?? item.idField ?? item.hrmedT_Id ?? item.HRMEDT_Id;
            const displayVal = item.hrmedT_EarnDedType ?? item.HRMEDT_EarnDedType ?? item.name ?? item.text ?? item.label ?? item.value;

            if (keyVal !== undefined && displayVal !== undefined) {
                return { key: String(keyVal).trim(), value: String(displayVal).trim() };
            }

            // Case 2: Infer from object keys
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

    // dropdown data
    const { data: earningsDeductionsTypeDropdownResponse, isLoading: isLoadingEarningsDeductionsTypes } =
        useEarningsDeductionsTypeDropdown();
    const earningsDeductionsTypeDropdown = useMemo(
        () => mapToDropdownItems(earningsDeductionsTypeDropdownResponse),
        [earningsDeductionsTypeDropdownResponse]
    );

    const { data: roundingTypeDropdownResponse, isLoading: isLoadingRoundingTypes } = useRoundingTypeDropdown();
    const roundingTypeDropdown = useMemo(() => mapToDropdownItems(roundingTypeDropdownResponse), [roundingTypeDropdownResponse]);

    const { data: amountOrPercentageDropdownResponse, isLoading: isLoadingAmountOrPercentage } = useAmountOrPercentageDropdown();
    const amountOrPercentageDropdown = useMemo(
        () => mapToDropdownItems(amountOrPercentageDropdownResponse),
        [amountOrPercentageDropdownResponse]
    );

    const { data: salaryComponentTypeDropdownResponse, isLoading: isLoadingSalaryComponentType } = useSalaryComponentTypeDropdown();
    const salaryComponentTypeDropdown = useMemo(
        () => mapToDropdownItems(salaryComponentTypeDropdownResponse),
        [salaryComponentTypeDropdownResponse]
    );

    const {
        register,
        handleSubmit,
        reset,
        control,
        getValues,
        trigger,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterEarningsDeductionsInput>({
        mode: 'onChange'
    });

    const calculationType = useWatch({
        control,
        name: 'HRMED_AmountPercentFlag',
        defaultValue: 'Amount'
    });

    const isPercentage = calculationType === 'Percentage' || calculationType?.toLowerCase() === 'percentage';

    const { data: earningAndDeductionDropdownResponse, isLoading: isLoadingEarningAndDeduction } =
        useEarningAndDeductionDropdown({
            enabled: isPercentage
        });

    const { data: recordDetailsResponse, isLoading: isLoadingDetails } = useMasterEarningsDeductionsById(row?.hrmeD_Id);

    const [selectedPercentageIds, setSelectedPercentageIds] = useState<number[]>([]);
    const initialSelectedPercentageIdsRef = useRef<number[]>([]);
    const [percentagePage, setPercentagePage] = useState<number>(1);
    const pageSize = 10;

    useEffect(() => {
        const res = recordDetailsResponse as any;
        if (!res) return;

        // Extract list from various possible response shapes
        let rawSelected: any[] = [];
        if (Array.isArray(res?.data?.selectedearningdetectionList)) {
            rawSelected = res.data.selectedearningdetectionList;
        } else if (Array.isArray(res?.data?.perc_OfDTO)) {
            rawSelected = res.data.perc_OfDTO;
        } else if (Array.isArray(res?.selectedearningdetectionList)) {
            rawSelected = res.selectedearningdetectionList;
        } else if (Array.isArray(res?.perc_OfDTO)) {
            rawSelected = res.perc_OfDTO;
        } else if (Array.isArray(res?.data)) {
            res.data.forEach((d: any) => {
                if (Array.isArray(d?.selectedearningdetectionList)) {
                    rawSelected.push(...d.selectedearningdetectionList);
                } else if (Array.isArray(d?.perc_OfDTO)) {
                    rawSelected.push(...d.perc_OfDTO);
                }
            });
        }

        const ids: number[] = [];
        rawSelected.forEach((s: any) => {
            const targetId = s.hrmedP_HRMED_Id ?? s.HRMEDP_HRMED_Id ?? s.HRMEDP_Id;
            if (targetId != null && Number(targetId) > 0 && !ids.includes(Number(targetId))) {
                ids.push(Number(targetId));
            } else if (s.hrmeD_Id != null && Number(s.hrmeD_Id) !== Number(row?.hrmeD_Id) && !ids.includes(Number(s.hrmeD_Id))) {
                ids.push(Number(s.hrmeD_Id));
            }
        });

        if (ids.length > 0) {
            setSelectedPercentageIds(ids);
            initialSelectedPercentageIdsRef.current = ids;
        }
    }, [recordDetailsResponse, row?.hrmeD_Id]);

    const percentageOfList = useMemo(() => {
        let rawData: any[] = [];
        const res = earningAndDeductionDropdownResponse as any;
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

        return rawData.filter((item: any) => {
            const itemId = item.hrmeD_Id ?? item.HRMED_Id;
            return itemId !== row?.hrmeD_Id;
        });
    }, [earningAndDeductionDropdownResponse, row?.hrmeD_Id]);

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

    const isPercentageListDirty = useMemo(() => {
        if (!isPercentage) return false;
        const initial = initialSelectedPercentageIdsRef.current;
        if (initial.length !== selectedPercentageIds.length) return true;
        return selectedPercentageIds.some((id) => !initial.includes(id));
    }, [isPercentage, selectedPercentageIds]);

    const findKey = (list: DropdownItem[], val: any) => {
        if (val === undefined || val === null) return undefined;
        const stringVal = String(val).trim();
        if (stringVal === '') return undefined;

        // Normalize function to remove spaces and special chars
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedVal = normalize(stringVal);

        // 1. Try exact key match (Internal ID)
        const exactKeyMatch = list.find((item: DropdownItem) => String(item.key).trim() === stringVal);
        if (exactKeyMatch) return String(exactKeyMatch.key).trim();

        // 2. Try normalized key match
        const normKeyMatch = list.find((item: DropdownItem) => normalize(String(item.key)) === normalizedVal);
        if (normKeyMatch) return String(normKeyMatch.key).trim();

        // 3. Try exact value/name match (Display Label) - Case Insensitive
        const exactValueMatch = list.find((item: DropdownItem) => String(item.value).trim().toLowerCase() === stringVal.toLowerCase());
        if (exactValueMatch) return String(exactValueMatch.key).trim();

        // 4. Try normalized value match
        const normValueMatch = list.find((item: DropdownItem) => normalize(String(item.value)) === normalizedVal);
        if (normValueMatch) return String(normValueMatch.key).trim();

        // 5. Try partial matches
        const partialMatch = list.find((item: DropdownItem) => {
            const v = normalize(String(item.value));
            const s = normalizedVal;
            return v.startsWith(s) || s.startsWith(v) || v.includes(s) || s.includes(v);
        });
        if (partialMatch) return String(partialMatch.key).trim();

        return undefined; // Return undefined if no mapping found
    };

    const findValue = (list: DropdownItem[], val: any) => {
        if (val === undefined || val === null) return undefined;
        const stringVal = String(val).trim();
        if (stringVal === '') return undefined;

        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedVal = normalize(stringVal);

        // 1. Try exact value match (Display Label) - Case Insensitive
        const exactValueMatch = list.find((item: DropdownItem) => String(item.value).trim().toLowerCase() === stringVal.toLowerCase());
        if (exactValueMatch) return String(exactValueMatch.value).trim();

        // 2. Try normalized value match
        const normValueMatch = list.find((item: DropdownItem) => normalize(String(item.value)) === normalizedVal);
        if (normValueMatch) return String(normValueMatch.value).trim();

        // 3. Try exact key match (Internal ID)
        const exactKeyMatch = list.find((item: DropdownItem) => String(item.key).trim() === stringVal);
        if (exactKeyMatch) return String(exactKeyMatch.value).trim();

        // 4. Try normalized key match
        const normKeyMatch = list.find((item: DropdownItem) => normalize(String(item.key)) === normalizedVal);
        if (normKeyMatch) return String(normKeyMatch.value).trim();

        return undefined;
    };

    const [isBinding, setIsBinding] = useState(true);
    const boundRowIdRef = useRef<number | null>(null);

    // Wait until all dropdown APIs have completed their initial fetch and populated
    const isReady =
        !isLoadingEarningsDeductionsTypes &&
        !isLoadingRoundingTypes &&
        !isLoadingAmountOrPercentage &&
        !isLoadingSalaryComponentType &&
        earningsDeductionsTypeDropdown.length > 0;

    useEffect(() => {
        if (row && isReady && boundRowIdRef.current !== row.hrmeD_Id) {
            const mappedType =
                findValue(earningsDeductionsTypeDropdown, row.hrmeD_EDTypeFlag) ??
                (row.hrmeD_EDTypeFlag != null ? String(row.hrmeD_EDTypeFlag) : undefined);

            reset({
                HRMED_Id: row.hrmeD_Id,
                MI_Id: row.mI_Id || 0,
                HRMED_Name: row.hrmeD_Name || '',
                HRMED_EDTypeFlag: mappedType,
                HRMED_EarnDedFlag:
                    findKey(salaryComponentTypeDropdown, row.hrmeD_EarnDedFlag) ??
                    (row.hrmeD_EarnDedFlag != null ? String(row.hrmeD_EarnDedFlag) : undefined),
                HRMED_AmountPercentFlag:
                    findKey(amountOrPercentageDropdown, row.hrmeD_AmountPercentFlag) ??
                    (row.hrmeD_AmountPercentFlag != null ? String(row.hrmeD_AmountPercentFlag) : undefined),
                HRMED_AmountPercent: String(row.hrmeD_AmountPercent ?? ''),
                HRMED_ActiveFlag: row.hrmeD_ActiveFlag,
                HRMED_RoundOffFlag:
                    findKey(roundingTypeDropdown, row.hrmeD_RoundOffFlag) ??
                    (row.hrmeD_RoundOffFlag != null ? String(row.hrmeD_RoundOffFlag) : undefined),
                HRMED_Order: row.hrmeD_Order,
                HRMED_ReviseFlg: row.hrmeD_ReviseFlg
            });
            boundRowIdRef.current = row.hrmeD_Id;
            setIsBinding(false);
        }
    }, [
        row,
        reset,
        isReady,
        earningsDeductionsTypeDropdown,
        salaryComponentTypeDropdown,
        amountOrPercentageDropdown,
        roundingTypeDropdown
    ]);

    const onSubmit = async (data: MasterEarningsDeductionsInput) => {
        try {
            // Build the request body - support both casing conventions required by ASP.NET backend
            const hrmeD_Id = data.HRMED_Id || row?.hrmeD_Id || 0;
            const mI_Id = data.MI_Id || row?.mI_Id || 0;
            const edType = data.HRMED_EDTypeFlag || '';

            const payload: any = {
                hrmeD_Id: hrmeD_Id,
                HRMED_Id: hrmeD_Id,
                mI_Id: mI_Id,
                MI_Id: mI_Id,
                hrmeD_Name: data.HRMED_Name?.trim() || '',
                HRMED_Name: data.HRMED_Name?.trim() || '',
                hrmeD_EDTypeFlag: edType,
                HRMED_EDTypeFlag: edType,
                hrmeD_EarnDedFlag: data.HRMED_EarnDedFlag,
                HRMED_EarnDedFlag: data.HRMED_EarnDedFlag,
                hrmeD_AmountPercentFlag: data.HRMED_AmountPercentFlag,
                HRMED_AmountPercentFlag: data.HRMED_AmountPercentFlag,
                hrmeD_AmountPercent: data.HRMED_AmountPercent,
                HRMED_AmountPercent: data.HRMED_AmountPercent,
                hrmeD_RoundOffFlag: data.HRMED_RoundOffFlag,
                HRMED_RoundOffFlag: data.HRMED_RoundOffFlag,
                hrmeD_ActiveFlag: row?.hrmeD_ActiveFlag ?? true,
                HRMED_ActiveFlag: row?.hrmeD_ActiveFlag ?? true,
                hrmeD_ReviseFlg: data.HRMED_ReviseFlg ?? true,
                HRMED_ReviseFlg: data.HRMED_ReviseFlg ?? true,
                hrmeD_Order: data.HRMED_Order ?? row?.hrmeD_Order ?? 0,
                HRMED_Order: data.HRMED_Order ?? row?.hrmeD_Order ?? 0,
                perc_OfDTO: isPercentage
                    ? selectedPercentageIds.map((id) => ({
                          hrmeD_Id: hrmeD_Id,
                          HRMED_Id: hrmeD_Id,
                          mI_Id: mI_Id,
                          MI_Id: mI_Id,
                          hrmedP_HRMED_Id: id,
                          HRMEDP_HRMED_Id: id
                      }))
                    : []
            };

            console.log('Update payload:', payload);
            const response = await saveMasterEarningsDeductions(payload);
            console.log('Update response:', response);

            if (response?.success) {
                toast.success(response?.message || 'Earning/Deduction updated successfully');
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(response?.message || 'Failed to update earning/deduction');
            }
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message || error?.message || error?.data?.message || 'Failed to update earning/deduction';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
        setPercentagePage(1);
        setSelectedPercentageIds(initialSelectedPercentageIdsRef.current);
    };
    return (
        <div className={className}>
            {isBinding ? (
                <div className='flex h-48 flex-col items-center justify-center space-y-4'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                    <p className='text-muted-foreground text-sm'>Binding data...</p>
                </div>
            ) : (
                <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <input type='hidden' {...register('HRMED_Id', { valueAsNumber: true })} />
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
                                name='HRMED_EDTypeFlag'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Type' />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                                    .filter((item: DropdownItem) => {
                                                        const val = item.value || item.key;
                                                        return val != null && val !== '' && String(val).trim() !== '';
                                                    })
                                                    .map((item: DropdownItem) => {
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
                                                    .filter((item: DropdownItem) => {
                                                        const key = item.key || item.value;
                                                        return key != null && key !== '' && String(key).trim() !== '';
                                                    })
                                                    .map((item: DropdownItem) => {
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
                                name='HRMED_EarnDedFlag'
                                control={control}
                                rules={{ required: 'Earning/Deduction is required' }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Earning/Deduction' />
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
                                                    .filter((item: DropdownItem) => {
                                                        const key = item.key || item.value;
                                                        return key != null && key !== '' && String(key).trim() !== '';
                                                    })
                                                    .map((item: DropdownItem) => {
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
                                                    .filter((item: DropdownItem) => {
                                                        const key = item.key || item.value;
                                                        return key != null && key !== '' && String(key).trim() !== '';
                                                    })
                                                    .map((item: DropdownItem) => {
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
                                        if (!value || value.trim() === '') return 'Amount/Percentage is required';
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
                            disabled={isSubmitting || (!isDirty && !isPercentageListDirty)}
                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                            isLoading={isSubmitting}
                            loadingText='Updating...'>
                            <div className='flex items-center'>
                                <Save className='mr-2 h-4 w-4' />
                                Update Earning/Deduction
                            </div>
                        </Button>
                        {!isDirty && !isPercentageListDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                    </div>
                </form>
            )}
        </div>
    );
}
