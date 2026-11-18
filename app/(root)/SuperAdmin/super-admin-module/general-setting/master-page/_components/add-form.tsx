'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useFormContext } from '@/components/ui/form/form-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';
import { type MasterPageSchema, masterPageSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-page';
import { getMasterPageById, saveMasterPage } from '@/server/super-admin/super-admin-module/general-setting/master-page';
import type { IMasterPage } from '@/types/super-admin/super-admin-module/general-setting/master-page';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterPageFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function AddMasterPageForm({ onSuccess, onCancel }: AddMasterPageFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { selectedRow } = useFormContext<IMasterPage>();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterPageSchema>({
        resolver: zodResolver(masterPageSchema),
        defaultValues: {
            ivrmP_Id: 0,
            ivrmmP_PageName: '',
            ivrmP_PageDisplayName: '',
            ivrmP_PageDesc: '',
            ivrmP_MandatoryFlag: 1
        }
    });

    useEffect(() => {
        let isMounted = true;

        if (selectedRow?.ivrmP_Id) {
            // 1. Immediately prefill from selectedRow to prevent empty fields while fetching
            const initialName = selectedRow.ivrmmP_PageName || (selectedRow as any).IVRMMP_PageName || '';
            const initialDisplayName = selectedRow.ivrmP_PageDisplayName || (selectedRow as any).IVRMP_PageDisplayName || initialName;
            const initialDesc =
                selectedRow.ivrmP_PageDesc || (selectedRow as any).IVRMP_PageDesc || (selectedRow as any).ivrmP_PageURL || '';
            const initialMandatory = selectedRow.ivrmP_MandatoryFlag ? 1 : 0;

            reset({
                ivrmP_Id: Number(selectedRow.ivrmP_Id),
                ivrmmP_PageName: initialName,
                ivrmP_PageDisplayName: initialDisplayName,
                ivrmP_PageDesc: initialDesc,
                ivrmP_MandatoryFlag: initialMandatory
            });

            // 2. Fetch fresh details from backend
            const fetchDetails = async () => {
                setIsLoading(true);
                try {
                    const response = await getMasterPageById(Number(selectedRow.ivrmP_Id));
                    if (!isMounted) return;

                    if (response.success && response.data) {
                        const pageData = response.data;
                        const pageName = pageData.ivrmmP_PageName || (pageData as any).IVRMMP_PageName || initialName;
                        const displayName = pageData.ivrmP_PageDisplayName || (pageData as any).IVRMP_PageDisplayName || pageName;
                        const pageDesc =
                            pageData.ivrmP_PageDesc || (pageData as any).IVRMP_PageDesc || (pageData as any).ivrmP_PageURL || initialDesc;
                        const mandatory =
                            pageData.ivrmP_MandatoryFlag === null || pageData.ivrmP_MandatoryFlag === undefined
                                ? initialMandatory
                                : pageData.ivrmP_MandatoryFlag
                                  ? 1
                                  : 0;

                        reset({
                            ivrmP_Id: Number(pageData.ivrmP_Id || selectedRow.ivrmP_Id),
                            ivrmmP_PageName: pageName,
                            ivrmP_PageDisplayName: displayName,
                            ivrmP_PageDesc: pageDesc,
                            ivrmP_MandatoryFlag: mandatory
                        });
                    }
                } catch (error) {
                    console.error('Error fetching page details', error);
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

            fetchDetails();
        } else {
            reset({
                ivrmP_Id: 0,
                ivrmmP_PageName: '',
                ivrmP_PageDisplayName: '',
                ivrmP_PageDesc: '',
                ivrmP_MandatoryFlag: 1
            });
        }

        return () => {
            isMounted = false;
        };
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterPageSchema) => {
        setIsLoading(true);
        try {
            const pageId = selectedRow?.ivrmP_Id ? Number(selectedRow.ivrmP_Id) : 0;
            const pageName = (data.ivrmmP_PageName || '').trim();
            const displayName = data.ivrmP_PageDisplayName?.trim() || pageName;
            const pageDesc = (data.ivrmP_PageDesc || '').trim();
            const mandatoryFlag = data.ivrmP_MandatoryFlag === 1 || data.ivrmP_MandatoryFlag === true;

            const payload = {
                ivrmP_Id: pageId,
                IVRMP_Id: pageId,
                ivrmmP_PageName: pageName,
                IVRMMP_PageName: pageName,
                ivrmP_PageDisplayName: displayName,
                IVRMP_PageDisplayName: displayName,
                ivrmP_PageDesc: pageDesc,
                IVRMP_PageDesc: pageDesc,
                ivrmP_PageURL: pageDesc,
                IVRMP_PageURL: pageDesc,
                ivrmP_MandatoryFlag: mandatoryFlag,
                IVRMP_MandatoryFlag: mandatoryFlag
            };

            const result = await saveMasterPage(payload);
            if (result.success) {
                toast.success(result.message || (pageId > 0 ? 'Master Page updated successfully' : 'Master Page saved successfully'));
                reset();
                onSuccess?.();
            } else {
                toast.error(result.message || 'Failed to save master page');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error?.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const onValidationError = (formErrors: any) => {
        console.warn('Master page validation errors:', formErrors);
        const firstKey = Object.keys(formErrors)[0];
        if (firstKey && formErrors[firstKey]?.message) {
            toast.error(formErrors[firstKey].message);
        } else {
            toast.error('Please fill in all required fields');
        }
    };

    const isEditMode = Boolean(selectedRow?.ivrmP_Id);

    return (
        <form onSubmit={handleSubmit(onSubmit, onValidationError)} className='space-y-6'>
            <div className='p-4'>
                <div className='mx-auto max-w-2xl space-y-4'>
                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Page Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmmP_PageName'
                                render={({ field }) => (
                                    <InputText
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder='Enter Page Name'
                                        maxLength={100}
                                    />
                                )}
                            />
                            <FormError>{errors.ivrmmP_PageName?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Display Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmP_PageDisplayName'
                                render={({ field }) => (
                                    <InputText
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder='Enter Display Name'
                                        maxLength={100}
                                    />
                                )}
                            />
                            <FormError>{errors.ivrmP_PageDisplayName?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Page URL: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmP_PageDesc'
                                render={({ field }) => (
                                    <InputText value={field.value} onChange={field.onChange} placeholder='Enter Page URL' maxLength={100} />
                                )}
                            />
                            <FormError>{errors.ivrmP_PageDesc?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Page Mandatory?: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 flex items-center gap-4 md:col-span-8'>
                            <Controller
                                control={control}
                                name='ivrmP_MandatoryFlag'
                                render={({ field }) => (
                                    <RadioGroup
                                        className='flex gap-4'
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={String(field.value ?? 1)}>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='r1' />
                                            <Label htmlFor='r1'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='r2' />
                                            <Label htmlFor='r2'>No</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            <FormError>{errors.ivrmP_MandatoryFlag?.message}</FormError>
                        </div>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4 border-t pt-4'>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={() => {
                            reset();
                            if (onCancel) {
                                onCancel();
                            } else {
                                onSuccess?.();
                            }
                        }}
                        className='w-32 bg-red-500 hover:bg-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>

                    <Button type='submit' disabled={isLoading} className='w-32 bg-blue-600 hover:bg-blue-700'>
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
