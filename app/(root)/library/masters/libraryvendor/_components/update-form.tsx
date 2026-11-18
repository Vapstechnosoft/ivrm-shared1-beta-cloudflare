'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterVendor } from '@/hooks/library/useMasters';
import { masterVendorSchema } from '@/schemas/library/masters';
import { addOrUpdateMasterVendor } from '@/server/library/masters/library_vendor';
import type { IMasterVendorList } from '@/types/library/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterVendorSchema.addOrUpdate>;

interface UpdateMasterVendorFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterVendorList;
}

export default function UpdateMasterVendorForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterVendorFormProps) {
    const { refetchAll } = useMasterVendor();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterVendorSchema.addOrUpdate),
        mode: 'onChange',
        values: row
            ? {
                  lmV_Id: row.lmV_Id,
                  lmV_VendorName: row.lmV_VendorName,
                  lmV_EMailId: row.lmV_EMailId,
                  lmV_MobileNo: row.lmV_MobileNo,
                  lmV_Address: row.lmV_Address,
                  lmV_PhoneNo: row.lmV_PhoneNo || ''
              }
            : undefined
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { lmV_VendorName, lmV_EMailId, lmV_MobileNo, lmV_Address, lmV_PhoneNo } = data;

            const payload = {
                lmV_Id: row.lmV_Id,
                mI_Id: 0,
                lmV_VendorName,
                lmV_EMailId,
                lmV_MobileNo,
                lmV_Address,
                lmV_PhoneNo: lmV_PhoneNo || '',
                lmV_ActiveFlg: true
            };

            const response = await addOrUpdateMasterVendor(payload);

            if (response?.success) {
                toast.success(response.message || 'Master Vendor updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update Master Vendor');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset({
            lmV_Id: row.lmV_Id,
            lmV_VendorName: '',
            lmV_EMailId: '',
            lmV_MobileNo: '',
            lmV_Address: '',
            lmV_PhoneNo: ''
        });
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Vendor Name'
                            required
                            id='lmV_VendorName'
                            onKeyDown={(e) => {
                                if (e.key.length === 1 && !/^[a-zA-Z\s]$/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            {...register('lmV_VendorName')}
                            error={errors.lmV_VendorName?.message}
                            placeholder='e.g. Acme Books Dist'
                        />
                        <InputText
                            label='Email Id'
                            id='lmV_EMailId'
                            {...register('lmV_EMailId')}
                            error={errors.lmV_EMailId?.message}
                            placeholder='e.g. contact@vendor.com'
                        />
                    </div>
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Mobile No'
                            required
                            id='lmV_MobileNo'
                            onKeyDown={(e) => {
                                if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            maxLength={10}
                            {...register('lmV_MobileNo')}
                            error={errors.lmV_MobileNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                            placeholder='10-digit mobile number'
                        />

                        <InputText
                            label='Vendor Address'
                            id='lmV_Address'
                            onKeyDown={(e) => {
                                if (e.key.length === 1 && !/^[a-zA-Z0-9\s,./#\-]$/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            {...register('lmV_Address')}
                            error={errors.lmV_Address?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                            placeholder='Enter full office address'
                        />
                    </div>
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>{' '}
                {/* Phone No section removed */}
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
                            Update Master Vendor
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
