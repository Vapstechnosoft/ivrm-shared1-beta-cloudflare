'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';
import { type MasterMainMenuSchema, masterMainMenuSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-main-menu';
import {
    getMasterMainMenuDetails,
    getModuleDropdown,
    saveMasterMainMenu
} from '@/server/super-admin/super-admin-module/general-setting/master-main-menu';
import type { IMasterMainMenu, IModuleDropdownItem } from '@/types/super-admin/super-admin-module/general-setting/master-main-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterMainMenuFormProps {
    onSuccess?: () => void;
    initialData?: IMasterMainMenu;
}

export default function AddMasterMainMenuForm({ onSuccess, initialData }: AddMasterMainMenuFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [modules, setModules] = useState<IModuleDropdownItem[]>([]);

    useEffect(() => {
        // Fetch modules for dropdown
        getModuleDropdown().then((res) => {
            if (res.success && res.data) {
                setModules(res.data);
            }
        });
    }, []);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterMainMenuSchema>({
        resolver: zodResolver(masterMainMenuSchema),
        defaultValues: {
            ivrmmM_Id: initialData?.ivrmmM_Id,
            ivrmmM_MenuName: initialData?.ivrmmM_MenuName || '',
            ivrmM_Id: initialData?.ivrmM_Id || 0
        }
    });

    // Fetch details on edit
    useEffect(() => {
        if (initialData && initialData.ivrmmM_Id) {
            setIsLoading(true);
            getMasterMainMenuDetails(initialData.ivrmmM_Id)
                .then((res) => {
                    setIsLoading(false);
                    if (res.success) {
                        // Cast to any to handle flexible response structure (root level vs data level)
                        const response = res as any;
                        const data = response.edit_m_menu?.[0] || response.data?.[0] || response.data || response;

                        if (data) {
                            reset({
                                ivrmmM_Id: data.ivrmmM_Id,
                                ivrmmM_MenuName: data.ivrmmM_MenuName,
                                ivrmM_Id: data.ivrmM_Id
                            });
                        }
                    } else {
                        toast.error('Failed to fetch details');
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    toast.error('Error fetching details');
                });
        }
    }, [initialData, reset]);

    const onSubmit = async (data: MasterMainMenuSchema) => {
        setIsLoading(true);
        try {
            const result = await saveMasterMainMenu(data);
            if (result.success) {
                toast.success(initialData ? 'Master Main Menu Updated Successfully' : 'Master Main Menu Saved Successfully');
                if (!initialData) reset();
                onSuccess?.();
            } else {
                toast.error(result.message || 'Failed to save data');
            }
        } catch (error: any) {
            console.error('Client Error:', error);
            toast.error(error?.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='p-4'>
                <div className='mx-auto max-w-2xl space-y-4'>
                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Module Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmM_Id'
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(value) => field.onChange(Number(value))}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Module' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modules.map((module, index) => (
                                                <SelectItem key={`${module.ivrmM_Id}_${index}`} value={module.ivrmM_Id.toString()}>
                                                    {module.ivrmM_ModuleName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.ivrmM_Id?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Main Menu Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmmM_MenuName'
                                render={({ field }) => (
                                    <InputText
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder='Enter Main Menu Name'
                                        maxLength={20}
                                    />
                                )}
                            />
                            <FormError>{errors.ivrmmM_MenuName?.message}</FormError>
                        </div>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4 border-t pt-4'>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={() => {
                            reset();
                            onSuccess?.();
                        }}
                        className='w-32 bg-red-500 hover:bg-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button type='submit' disabled={isLoading} className='w-32 bg-blue-600 hover:bg-blue-700'>
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        {initialData ? 'Update' : 'Save'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
