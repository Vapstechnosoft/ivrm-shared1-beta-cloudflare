'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvMasterStore } from '@/hooks/inventory/masters/use-inv-master-store';
import { type TInvMasterStore, invMasterStoreSchema } from '@/schemas/inventory/masters/inv-master-store';
import { saveInvMasterStore } from '@/server/inventory/masters/inv-master-store';
import type { IEmployeeDropdown } from '@/types/inventory/masters/inv-master-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddInvMasterStoreFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
    empname_list: IEmployeeDropdown[];
}

export default function AddInvMasterStoreForm({ onSuccess, onCancel, empname_list }: AddInvMasterStoreFormProps) {
    const { refetchAll } = useInvMasterStore();
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting, errors }
    } = useForm<TInvMasterStore>({
        resolver: zodResolver(invMasterStoreSchema),
        defaultValues: {
            invmsT_Id: 0,
            invmS_StoreName: '',
            invmS_StoreLocation: '',
            invmS_ContactPerson: '',
            invmS_ContactNo: '',
            hrmE_Id: 0,
            invmS_ActiveFlg: true
        }
    });

    const onInvalid = (errors: any) => {
        console.error('AddInvMasterStoreForm: Validation errors:', errors);
    };

    const onSubmit = async (data: TInvMasterStore) => {
        console.log('AddInvMasterStoreForm: onSubmit triggered with data:', data);
        try {
            const result = await saveInvMasterStore(data);
            if (result.success || result.returnval) {
                toast.success(result.message || 'Record saved successfully');
                refetchAll();
                onSuccess();
                reset();
            } else if (result.returnduplicatestatus === 'Duplicate') {
                toast.error('Record already exists');
            } else {
                toast.error(result.message || 'Failed to save record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleCancel = () => {
        reset();
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className='space-y-4 p-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label htmlFor='invmS_StoreName'>
                        Store Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='invmS_StoreName'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='invmS_StoreName'
                                placeholder='Enter Store Name'
                                className={errors.invmS_StoreName ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {errors.invmS_StoreName && <p className='text-red-500 text-xs'>{errors.invmS_StoreName.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='invmS_StoreLocation'>
                        Store Location <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='invmS_StoreLocation'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='invmS_StoreLocation'
                                placeholder='Enter Store Location'
                                className={errors.invmS_StoreLocation ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {errors.invmS_StoreLocation && <p className='text-red-500 text-xs'>{errors.invmS_StoreLocation.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='hrmE_Id'>
                        Store Incharge <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='hrmE_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => {
                                    const id = Number(val);
                                    field.onChange(id);
                                    const emp = empname_list?.find((e) => e.hrmE_Id === id);
                                    if (emp && emp.hrmE_MobileNo) {
                                        setValue('invmS_ContactNo', String(emp.hrmE_MobileNo));
                                    }
                                }}
                                value={field.value?.toString()}>
                                <SelectTrigger className={errors.hrmE_Id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select Incharge' />
                                </SelectTrigger>
                                <SelectContent>
                                    {empname_list?.map((emp, index) => (
                                        <SelectItem key={emp.hrmE_Id || `emp-${index}`} value={emp.hrmE_Id?.toString() || `emp-${index}`}>
                                            {emp.employeename}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.hrmE_Id && <p className='text-red-500 text-xs'>{errors.hrmE_Id.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='invmS_ContactPerson'>Contact Person</Label>
                    <Controller
                        name='invmS_ContactPerson'
                        control={control}
                        render={({ field }) => <Input {...field} id='invmS_ContactPerson' placeholder='Enter Contact Person' />}
                    />
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='invmS_ContactNo'>
                        Contact Number <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='invmS_ContactNo'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='invmS_ContactNo'
                                placeholder='Enter Contact Number'
                                className={errors.invmS_ContactNo ? 'border-red-500' : ''}
                                maxLength={10}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    field.onChange(val);
                                }}
                            />
                        )}
                    />
                    {errors.invmS_ContactNo && <p className='text-red-500 text-xs'>{errors.invmS_ContactNo.message}</p>}
                </div>
            </div>

            <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
