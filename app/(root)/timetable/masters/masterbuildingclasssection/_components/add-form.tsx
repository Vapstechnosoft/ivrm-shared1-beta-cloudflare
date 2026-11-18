'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useMasterBuildingClasssection,
    useMasterBuildingDropDown,
    useMasterClassDropDown,
    useMasterSectionDropDown
} from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';
import { masterBuildingClassSectionSchema } from '@/schemas/timetable/masters';
import { addOrUpdateMasterBuildingclasssection } from '@/server/timetable/masters/masterbuilding';
import type { ClassDropDownDataTT } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Save, Square } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterBuildingClassSectionSchema.addOrUpdate>;

interface AddMasterBuildingProps {
    onSuccess?: () => void;
    buildingname?: string;
}

export default function AddMasterBuildingForm({ onSuccess, buildingname = '' }: AddMasterBuildingProps) {
    const { refetchAll } = useMasterBuildingClasssection();

    const {
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterBuildingClassSectionSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const calss_ids = watch('calssids') || [];
    const section_ids = watch('sectionids') || [];
    const [classSearch, setClassSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const [selectedcalssidsItems, setSelectedcalssidsItems] = useState<{ asmcL_Id: string }[]>([]);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const [selectedSectionidsItems, setSelectedSectionidsItems] = useState<{ asmS_Id: string }[]>([]);
    const {
        data: masterbuildingDropDown,
        isLoading: masterbuildingDropDownLoading,
        error: masterbuildingDropDownError
    } = useMasterBuildingDropDown();

    const { data: masterClassDropDown, isLoading: masterClassDropDownLoading } = useMasterClassDropDown();

    const { data: masterSectionDropDown, isLoading: masterSectionDropDownLoading } = useMasterSectionDropDown();
    const filteredClassIds = masterClassDropDown?.data?.filter((d: ClassDropDownDataTT) =>
        d.asmcL_ClassName.toLowerCase().includes(classSearch.toLowerCase())
    );
    const filteredSectionIds =
        masterSectionDropDown?.data?.filter((d: any) => d.asmC_SectionName.toLowerCase().includes(sectionSearch.toLowerCase())) ?? [];

    const selectAllcalssids = () => {
        const source =
            classSearch.trim().length > 0
                ? masterClassDropDown?.data?.map((h: ClassDropDownDataTT) => h.asmcL_Id.toString())
                : masterClassDropDown?.data?.map((h: ClassDropDownDataTT) => h.asmcL_Id.toString());

        const isAllSelected = source.every((id: string) => calss_ids.includes(id));
        if (isAllSelected) {
            const remaining = calss_ids.filter((id) => !source.includes(id));

            if (remaining.length === 0) {
                setValue('calssids', undefined as any);
                setSelectedcalssidsItems([]);
            } else {
                setValue('calssids', remaining as [string, ...string[]], {
                    shouldValidate: true
                });
                setSelectedcalssidsItems(remaining.map((x) => ({ asmcL_Id: x })));
            }
        } else {
            const merged = Array.from(new Set([...calss_ids, ...source]));

            setValue('calssids', merged as [string, ...string[]], {
                shouldValidate: true
            });
            setSelectedcalssidsItems(merged.map((x) => ({ asmcL_Id: x })));
        }
    };

    const selectAllSectionIds = () => {
        const source =
            sectionSearch.trim().length > 0
                ? masterSectionDropDown?.data?.map((h: any) => h.asmS_Id.toString())
                : masterSectionDropDown?.data?.map((h: any) => h.asmS_Id.toString());

        const isAllSelected = source.every((id: string) => section_ids.includes(id));
        if (isAllSelected) {
            const remaining = section_ids.filter((id) => !source.includes(id));

            if (remaining.length === 0) {
                setValue('sectionids', undefined as any);
                setSelectedSectionidsItems([]);
            } else {
                setValue('sectionids', remaining as [string, ...string[]], {
                    shouldValidate: true
                });
                setSelectedSectionidsItems(remaining.map((x) => ({ asmS_Id: x })));
            }
        } else {
            const merged = Array.from(new Set([...calss_ids, ...source]));

            setValue('sectionids', merged as [string, ...string[]], {
                shouldValidate: true
            });
            setSelectedSectionidsItems(merged.map((x) => ({ asmS_Id: x })));
        }
    };

    const toggleClass = (id: string) => {
        let updated = [];

        if (calss_ids.includes(id)) {
            updated = calss_ids.filter((v: string) => v !== id);
        } else {
            updated = [...calss_ids, id];
        }

        // MUST be tuple: at least 1 element
        if (updated.length === 0) {
            setValue('calssids', undefined as any);
        } else {
            setValue('calssids', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedcalssidsItems(updated.map((x) => ({ asmcL_Id: x })));
    };

    const toggleSection = (id: string) => {
        let updated = [];

        if (section_ids.includes(id)) {
            updated = section_ids.filter((v: string) => v !== id);
        } else {
            updated = [...section_ids, id];
        }

        // MUST be tuple: at least 1 element
        if (updated.length === 0) {
            setValue('sectionids', undefined as any);
        } else {
            setValue('sectionids', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedSectionidsItems(updated.map((x) => ({ asmS_Id: x })));
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const classArray = calss_ids.map((id) => ({ asmcL_Id: Number(id) }));
            const sectionArray = section_ids.map((id) => ({ asmS_Id: Number(id) }));

            const payload = {
                classarray: classArray,
                sectionarray: sectionArray,
                ttmbcS_Id: 0,
                ttmB_Id: data.ttmB_Id
            };

            console.log('payload', JSON.stringify(payload));
            const response = await addOrUpdateMasterBuildingclasssection(payload);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${buildingname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='items-center justify-center space-y-2'>
                        <Label>
                            Building Name: <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='ttmB_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(value) => {
                                        field.onChange(value ? Number(value) : '');
                                    }}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger className='w-full text-gray-500'>
                                        <SelectValue placeholder='Select Building Name' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterbuildingDropDownLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading BuildingData
                                            </SelectItem>
                                        ) : masterbuildingDropDownError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading BuildingData
                                            </SelectItem>
                                        ) : (
                                            masterbuildingDropDown?.data?.map((item: any) => (
                                                <SelectItem key={item.ttmB_Id} value={item.ttmB_Id.toString()}>
                                                    {item.ttmB_BuildingName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ttmB_Id && <span className='text-red-500 text-sm'>{errors.ttmB_Id.message}</span>}
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>

                            <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                                <InputText
                                    placeholder='Search classes...'
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                    className='mb-3'
                                />

                                {/* Select All Classes */}
                                {masterClassDropDown?.data?.length > 0 && (
                                    <div
                                        onClick={selectAllcalssids}
                                        className={cn(
                                            'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                            calss_ids.length === filteredClassIds.length && masterClassDropDown?.data?.length > 0
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {calss_ids.length === filteredClassIds.length && masterClassDropDown?.data?.length > 0 ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>
                                )}

                                <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                    {masterClassDropDownLoading ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>Loading Classes...</div>
                                    ) : filteredClassIds?.length === 0 ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>No classes found</div>
                                    ) : (
                                        filteredClassIds?.map((u: ClassDropDownDataTT) => {
                                            const id = u.asmcL_Id.toString();
                                            const selected = calss_ids.includes(id);

                                            return (
                                                <div
                                                    key={u.asmcL_Id}
                                                    onClick={() => toggleClass(id)}
                                                    className={cn(
                                                        'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                        selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-300 hover:border-primary/40'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{u.asmcL_ClassName}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            {errors.calssids && <span className='text-red-500 text-sm'>{errors.calssids.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Section <span className='text-red-500'>*</span>
                            </Label>

                            <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                                <InputText
                                    placeholder='Search Section...'
                                    value={sectionSearch}
                                    onChange={(e) => setSectionSearch(e.target.value)}
                                    className='mb-3'
                                />

                                {masterSectionDropDown?.data && (
                                    <div
                                        onClick={selectAllSectionIds}
                                        className={cn(
                                            'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                            section_ids.length ===
                                                (sectionSearch.trim() ? filteredSectionIds.length : masterSectionDropDown?.data.length) &&
                                                section_ids.length > 0
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {section_ids.length ===
                                            (sectionSearch.trim() ? filteredSectionIds.length : masterSectionDropDown?.data.length) &&
                                        section_ids.length > 0 ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>
                                )}

                                <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                    {masterSectionDropDownLoading ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>Loading Section...</div>
                                    ) : filteredSectionIds.length === 0 ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>No Section found</div>
                                    ) : (
                                        filteredSectionIds.map((d: any) => {
                                            const id = d.asmS_Id.toString();
                                            const selected = section_ids.includes(id);

                                            return (
                                                <div
                                                    key={d.asmS_Id}
                                                    onClick={() => toggleSection(id)}
                                                    className={cn(
                                                        'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                        selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-300 hover:border-primary/40'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{d.asmC_SectionName}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {errors.sectionids && <span className='text-red-500 text-sm'>{errors.sectionids.message}</span>}
                        </div>
                    </div>
                </div>

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
                            Save Master Building
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
