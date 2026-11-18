'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategoryDropDownMasterPeriod, useMasterPeriodDetails } from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';
import type { IMasterPeriodDetailsList } from '@/types/timetable/masters/masters';

import { masterPeriodSchema } from '@/schemas/timetable/masters';
import { ADDORUPDATEMasterPeriod, getMasterPeriodEditDetails } from '@/server/timetable/masters/masterperiod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CheckSquare, RotateCcw, Save, Square } from 'lucide-react';

type FormFields = z.infer<typeof masterPeriodSchema.save>;

interface MasterPeriodFormProps {
    onSuccess?: () => void;
    selectedRow?: IMasterPeriodDetailsList;
}

const findListByKeys = (data: any, candidateKeys: string[]): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined && data?.data !== null ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target || typeof target !== 'object') return [];

    for (const key of candidateKeys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey) {
            const val = target[foundKey];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
            if (Array.isArray(val)) return val;
        }
    }

    if (target.$values && Array.isArray(target.$values)) return target.$values;

    return [];
};

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target || typeof target !== 'object') return [];

    // If preferredKey is provided and exists as an array
    if (preferredKey) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
        if (foundKey) {
            const val = target[foundKey];
            if (Array.isArray(val)) return val;
            if (val?.$values && Array.isArray(val.$values)) return val.$values;
        }
    }

    if (target.$values && Array.isArray(target.$values)) return target.$values;

    // Common keys for list/data
    const keys = [
        'categoryDropDown',
        'categorylist',
        'catelist',
        'gridDetails',
        'geteditmaster',
        'academiclist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }

    // Handle nested data property in legacy API structures
    if (target.data && Array.isArray(target.data)) return target.data;

    const firstArray = Object.values(target).find((v) => Array.isArray(v));
    return Array.isArray(firstArray) ? firstArray : [];
};

const getCategoryId = (obj: any): string => {
    if (!obj || typeof obj !== 'object') return '';
    const rawId =
        obj.amC_Id ??
        obj.amc_Id ??
        obj.amC_ID ??
        obj.TTMC_Id ??
        obj.ttmC_Id ??
        obj.ttmC_ID ??
        obj.mC_Id ??
        obj.mc_Id ??
        obj.id;
    if (rawId !== undefined && rawId !== null && rawId !== '') {
        const num = Number(rawId);
        if (!isNaN(num) && num > 0) {
            return String(num);
        }
    }
    return '';
};

const getCategoryName = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj.trim();
    return String(
        obj.amC_Name ??
        obj.amc_Name ??
        obj.amC_NAME ??
        obj.categoryName ??
        obj.category_name ??
        obj.ttmC_CategoryName ??
        obj.name ??
        ''
    ).trim();
};

const extractFormAndCategoryData = (
    editResponse: any,
    row: any,
    categoriesList: any[]
) => {
    const foundIds = new Set<string>();
    let periodName: number | undefined;
    let periodOrder: number | undefined;
    let half: string | undefined;
    let impcM_Id: number | undefined;
    let imP_Id: number | undefined;

    const targetImpId = Number(row?.imP_Id ?? row?.IMP_Id ?? 0);

    const matchCategoryNames = (rawName: string) => {
        if (!rawName || !categoriesList || categoriesList.length === 0) return;
        const tokens = rawName.split(/[,/;\n\r]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
        for (const token of tokens) {
            const matched = categoriesList.find((c) => {
                const cName = getCategoryName(c).toLowerCase();
                return cName === token;
            });
            if (matched) {
                const id = getCategoryId(matched);
                if (id) foundIds.add(id);
            }
        }
    };

    const inspectItem = (item: any) => {
        if (!item || typeof item !== 'object') return;

        const directCatId = getCategoryId(item);
        if (directCatId) {
            foundIds.add(directCatId);
        }

        const catName = getCategoryName(item);
        if (catName) {
            matchCategoryNames(catName);
        }

        const pName = Number(item.imP_PeriodName ?? item.IMP_PeriodName ?? item.periodname ?? 0);
        if (pName > 0 && periodName === undefined) periodName = pName;

        const pOrder = Number(item.imP_PeriodOrder ?? item.IMP_PeriodOrder ?? item.periodorder ?? 0);
        if (pOrder > 0 && periodOrder === undefined) periodOrder = pOrder;

        const h = item.half ?? item.Half ?? item.imP_Half ?? item.IMP_Half;
        if (h && typeof h === 'string' && h.trim() && half === undefined) half = h.trim();

        const impId = Number(item.imP_Id ?? item.IMP_Id ?? 0);
        if (impId > 0 && imP_Id === undefined) imP_Id = impId;

        const impcmId = Number(item.impcM_Id ?? item.IMPCM_Id ?? 0);
        if (impcmId > 0 && impcM_Id === undefined) impcM_Id = impcmId;
    };

    if (editResponse) {
        const root = editResponse?.data !== undefined && editResponse?.data !== null ? editResponse.data : editResponse;

        if (Array.isArray(root)) {
            for (const item of root) {
                const itemImpId = Number(item.imP_Id ?? item.IMP_Id ?? 0);
                if (targetImpId > 0 && itemImpId > 0 && itemImpId !== targetImpId) continue;
                inspectItem(item);
            }
        } else if (root && typeof root === 'object') {
            inspectItem(root);

            const candidateKeys = [
                'geteditmaster',
                'selectedCategoryDetails',
                'selectedcategorydetails',
                'category_list',
                'categorylist',
                'catelist',
                'editcategory',
                'editcategorydetails',
                'editdetails',
                'editlist',
                'masterPeriodList',
                'masterperiodlist',
                'gridDetails',
                'geteditmasterdata',
                'catlist',
                'periodCategoryList',
                'impcMList'
            ];

            for (const key of candidateKeys) {
                const list = findListByKeys(root, [key]);
                if (Array.isArray(list) && list.length > 0) {
                    for (const item of list) {
                        const itemImpId = Number(item.imP_Id ?? item.IMP_Id ?? 0);
                        if (targetImpId > 0 && itemImpId > 0 && itemImpId !== targetImpId) continue;
                        inspectItem(item);
                    }
                }
            }

            const catDropdown = findListByKeys(root, ['categoryDropDown', 'categorydropdown']);
            if (Array.isArray(catDropdown) && catDropdown.length > 0) {
                for (const item of catDropdown) {
                    if (item.selected === true || item.checked === true || item.isSelected === true || item.isChecked === true) {
                        inspectItem(item);
                    }
                }
            }
        }
    }

    if (row) {
        inspectItem(row);
        if (row.categoryName) {
            matchCategoryNames(String(row.categoryName));
        }
    }

    return {
        categoryIds: Array.from(foundIds),
        periodName: periodName || Number(row?.imP_PeriodName ?? 0),
        periodOrder: periodOrder || Number(row?.imP_PeriodOrder ?? 0),
        half: half || String(row?.half ?? ''),
        impcM_Id: impcM_Id || Number(row?.impcM_Id ?? 0),
        imP_Id: imP_Id || targetImpId
    };
};

export default function MasterPeriodForm({ onSuccess, selectedRow }: MasterPeriodFormProps) {
    const { refetchAll } = useMasterPeriodDetails();
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [PeriodSearch, setPeriodSearch] = useState('');
    const lastEditResponseRef = useRef<any>(null);

    const form = useForm<FormFields>({
        resolver: zodResolver(masterPeriodSchema.save),
        defaultValues: {
            periodname: 0,
            periodorder: 0,
            half: '',
            categoryids: [] as any,
            noOfPeriods: 1,
            imP_Id: 0,
            impcM_Id: 0
        }
    });

    const {
        handleSubmit,
        watch,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = form;

    const Category_ids = (watch('categoryids') || []).map(String);
    const { data: MasterPerioddata, isLoading: masterPerioddataloading } = useCategoryDropDownMasterPeriod();
    const categories = useMemo(() => {
        return extractList(MasterPerioddata, 'categoryDropDown');
    }, [MasterPerioddata]);

    const filteredPeriodIds = categories.filter((d: any) =>
        getCategoryName(d).toLowerCase().includes(PeriodSearch.toLowerCase())
    );

    const togglePeriod = (id: string) => {
        if (!id) return;
        const currentIds = (form.getValues('categoryids') || []).map(String);
        let updated: string[] = [];
        if (currentIds.includes(id)) {
            updated = currentIds.filter((v) => v !== id);
        } else {
            updated = [...currentIds, id];
        }

        setValue('categoryids', updated as [string, ...string[]], { shouldValidate: true });
    };

    useEffect(() => {
        let isMounted = true;

        const fetchEditData = async () => {
            if (!selectedRow?.imP_Id) {
                lastEditResponseRef.current = null;
                reset({
                    periodname: 0,
                    periodorder: 0,
                    half: '',
                    categoryids: [] as any,
                    noOfPeriods: 1,
                    imP_Id: 0,
                    impcM_Id: 0
                });
                return;
            }

            setIsLoadingDetails(true);
            try {
                let response: any = null;
                try {
                    response = await getMasterPeriodEditDetails(Number(selectedRow.imP_Id));
                    lastEditResponseRef.current = response;
                    console.info('Master Period Edit Response:', response);
                } catch (err) {
                    console.error('Failed to fetch edit details:', err);
                }

                if (!isMounted) return;

                const extracted = extractFormAndCategoryData(response, selectedRow, categories);

                reset({
                    imP_Id: extracted.imP_Id,
                    impcM_Id: extracted.impcM_Id,
                    periodname: extracted.periodName,
                    periodorder: extracted.periodOrder,
                    half: extracted.half,
                    categoryids: extracted.categoryIds.length > 0 ? (extracted.categoryIds as [string, ...string[]]) : ([] as any),
                    noOfPeriods: 1
                });
            } catch (error) {
                console.error('Failed to process edit details:', error);
                const extracted = extractFormAndCategoryData(null, selectedRow, categories);
                reset({
                    imP_Id: Number(selectedRow.imP_Id || 0),
                    impcM_Id: Number(selectedRow.impcM_Id || 0),
                    periodname: Number(selectedRow.imP_PeriodName || 0),
                    periodorder: Number(selectedRow.imP_PeriodOrder || 0),
                    half: selectedRow.half || '',
                    categoryids: extracted.categoryIds.length > 0 ? (extracted.categoryIds as [string, ...string[]]) : ([] as any),
                    noOfPeriods: 1
                });
            } finally {
                if (isMounted) setIsLoadingDetails(false);
            }
        };

        fetchEditData();

        return () => {
            isMounted = false;
        };
    }, [selectedRow, reset]);

    // Secondary effect: Sync categories when category list finishes loading asynchronously
    useEffect(() => {
        if (!selectedRow || categories.length === 0) return;

        const currentCatIds = (form.getValues('categoryids') || []).map(String).filter((id) => Number(id) > 0);
        if (currentCatIds.length === 0) {
            const extracted = extractFormAndCategoryData(lastEditResponseRef.current, selectedRow, categories);
            if (extracted.categoryIds.length > 0) {
                setValue('categoryids', extracted.categoryIds as [string, ...string[]], { shouldValidate: true });
            }
        }
    }, [categories, selectedRow, setValue, form]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                selectedCategoryDetails: Category_ids.map((id) => ({ amC_Id: Number(id) })),
                imP_PeriodName: data.periodname,
                imP_PeriodOrder: data.periodorder,
                half: data.half,
                ...(selectedRow && {
                    imP_Id: data.imP_Id || selectedRow?.imP_Id || 0,
                    impcM_Id: data.impcM_Id || selectedRow?.impcM_Id || 0
                })
            };

            const response = await ADDORUPDATEMasterPeriod(payload);
            if (response.success) {
                toast.success(response.message);
                if (!selectedRow) reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset({
            periodname: 0,
            periodorder: 0,
            half: '',
            categoryids: [] as any,
            noOfPeriods: 1,
            imP_Id: 0,
            impcM_Id: 0
        });
        setPeriodSearch('');
    };

    if (isLoadingDetails) {
        return <div className='flex h-40 items-center justify-center'>Loading details...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Period Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='periodname'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={`periodname-${field.value || 'empty'}`}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}
                                    onValueChange={(val) => field.onChange(val ? Number(val) : 0)}>
                                    <SelectTrigger className={cn(!field.value || field.value === 0 ? 'text-gray-400' : 'text-black')}>
                                        <SelectValue placeholder='Select Period Name' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                                            <SelectItem key={n} value={n.toString()}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.periodname && <p className='text-red-500 text-sm'>{errors.periodname.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Period Order <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='periodorder'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={`periodorder-${field.value || 'empty'}`}
                                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}
                                    onValueChange={(val) => field.onChange(val ? Number(val) : 0)}>
                                    <SelectTrigger className={cn(!field.value || field.value === 0 ? 'text-gray-400' : 'text-black')}>
                                        <SelectValue placeholder='Select Period Order' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                                            <SelectItem key={n} value={n.toString()}>
                                                {n}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.periodorder && <p className='text-red-500 text-sm'>{errors.periodorder.message}</p>}
                    </div>

                    <div className='space-y-2 pt-2'>
                        <Label className='mb-3 block'>
                            Select Half <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex items-center space-x-6'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='half'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id='period-first-half'
                                            checked={field.value === 'I Half'}
                                            onChange={() => field.onChange('I Half')}
                                            className='h-4 w-4 text-primary focus:ring-primary'
                                        />
                                    )}
                                />
                                <label htmlFor='period-first-half' className='cursor-pointer font-medium text-sm'>
                                    I Half
                                </label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='half'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id='period-second-half'
                                            checked={field.value === 'II Half'}
                                            onChange={() => field.onChange('II Half')}
                                            className='h-4 w-4 text-primary focus:ring-primary'
                                        />
                                    )}
                                />
                                <label htmlFor='period-second-half' className='cursor-pointer font-medium text-sm'>
                                    II Half
                                </label>
                            </div>
                        </div>
                        {errors.half && <p className='text-red-500 text-sm'>{errors.half.message}</p>}
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label>
                        Category <span className='text-red-500'>*</span>
                    </Label>
                    <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                        <InputText
                            placeholder='Search Category...'
                            value={PeriodSearch}
                            onChange={(e) => setPeriodSearch(e.target.value)}
                            className='mb-3'
                        />

                        <div className='max-h-48 overflow-y-auto rounded-md border border-gray-200 p-1'>
                            {masterPerioddataloading ? (
                                <div className='py-4 text-center text-gray-500 text-sm'>Loading Categories...</div>
                            ) : filteredPeriodIds.length === 0 ? (
                                <div className='py-4 text-center text-gray-500 text-sm'>No Category found</div>
                            ) : (
                                filteredPeriodIds.map((d: any) => {
                                    const id = getCategoryId(d);
                                    const name = getCategoryName(d);
                                    const selected = Category_ids.includes(id);

                                    return (
                                        <div
                                            key={id || name}
                                            onClick={() => togglePeriod(id)}
                                            className={cn(
                                                'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                selected
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-transparent hover:bg-gray-50'
                                            )}>
                                            {selected ? (
                                                <CheckSquare className='h-4 w-4 text-primary' />
                                            ) : (
                                                <Square className='h-4 w-4 text-gray-400' />
                                            )}
                                            <span>{name}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    {errors.categoryids && <p className='text-red-500 text-sm'>{errors.categoryids.message}</p>}
                </div>
            </div>

            <div className='flex items-center justify-start gap-3 border-t pt-6'>
                <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting}>
                    <RotateCcw className='mr-2 h-4 w-4' /> Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText={selectedRow ? 'Updating...' : 'Saving...'}>
                    <Save className='mr-2 h-4 w-4' /> {selectedRow ? 'Update' : 'Save'} Master Period
                </Button>
            </div>
        </form>
    );
}
