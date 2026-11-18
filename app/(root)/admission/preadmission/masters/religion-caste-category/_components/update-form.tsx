'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    useEditMasterReligionCasteCategory,
    useMasterCasteCategoryDropdown,
    useMasterReligionCasteCategory
} from '@/hooks/admission/preadmission/useMasters';
import { useReligionDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { addMasterReligionCasteCategory } from '@/server/admission/preadmission/masters/religion_caste_category';
import type { IMasterReligionCasteCategoryList } from '@/types/admission/preadmission/masters';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type FormFields = {
    ircC_Id: number;
    ivrmmR_Id: number;
    imcC_Id: number;
};

interface UpdateMasterReligionCasteCategoryFormProps {
    selectedRow: IMasterReligionCasteCategoryList;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateMasterReligionCasteCategoryForm({
    selectedRow,
    onSuccess,
    className = ''
}: UpdateMasterReligionCasteCategoryFormProps) {
    const { refetchAll } = useMasterReligionCasteCategory();
    const { data: religion, isLoading: religionLoading } = useReligionDropdown();
    const { data: casteCategory, isLoading: casteCategoryLoading } = useMasterCasteCategoryDropdown();

    const { data: editResponse, isLoading: editDataLoading } = useEditMasterReligionCasteCategory(selectedRow.ircC_Id);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        // resolver: zodResolver(masterReligionCasteCategorySchema.add), // Reuse or adjust
        mode: 'onChange',
        defaultValues: {
            ircC_Id: selectedRow.ircC_Id,
            ivrmmR_Id: selectedRow.ivrmmR_Id,
            imcC_Id: selectedRow.imcC_Id
        }
    });

    useEffect(() => {
        if (editResponse?.data?.editdata && editResponse.data.editdata.length > 0) {
            const editData = editResponse.data.editdata[0];
            reset({
                ircC_Id: editData.ircC_Id || selectedRow.ircC_Id,
                ivrmmR_Id: editData.ivrmmR_Id || selectedRow.ivrmmR_Id,
                imcC_Id: editData.imcC_Id || selectedRow.imcC_Id
            });
        } else if (selectedRow) {
            reset({
                ircC_Id: selectedRow.ircC_Id,
                ivrmmR_Id: selectedRow.ivrmmR_Id,
                imcC_Id: selectedRow.imcC_Id
            });
        }
    }, [editResponse, reset, selectedRow]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ircC_Id: data.ircC_Id,
                ivrmmR_Id: data.ivrmmR_Id,
                // The API expects an array of caste categories even for single update usually
                caste_categories: [{ imcC_Id: data.imcC_Id }]
            };

            const response = await addMasterReligionCasteCategory(payload);

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Merge the current mapped caste category from the edit response into the full list
    // to ensure the selected item is always visible in the dropdown even if it's "mapped"
    const casteOptions = [...(casteCategory?.data || [])];
    if (editResponse?.data?.caste_list) {
        for (const item of editResponse.data.caste_list) {
            if (!casteOptions.some((opt) => opt.imcC_Id === item.imcC_Id)) {
                casteOptions.push(item);
            }
        }
    }

    if (editDataLoading) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <Spinner className='h-8 w-8' />
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Religion' htmlFor='ivrmmR_Id'>
                                Religion <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='ivrmmR_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString()}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a Religion' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {religionLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading religion...
                                                </SelectItem>
                                            ) : (
                                                religion?.data?.map((item) => (
                                                    <SelectItem key={item.ivrmmR_Id} value={item.ivrmmR_Id.toString()}>
                                                        {item.ivrmmR_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ivrmmR_Id && <FormError>{errors.ivrmmR_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Caste Category' htmlFor='imcC_Id'>
                                Caste Category <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='imcC_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString()}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {casteCategoryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading categories...
                                                </SelectItem>
                                            ) : (
                                                casteOptions.map((item) => (
                                                    <SelectItem key={item.imcC_Id} value={item.imcC_Id.toString()}>
                                                        {item.imcC_CategoryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.imcC_Id && <FormError>{errors.imcC_Id.message}</FormError>}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => reset()}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Religion Caste Category
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
