'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useHostelDropdownList } from '@/hooks/hostel/useMasterHostel';
import { useMasterRoomDropdown } from '@/hooks/hostel/useMasterRoom';
import { useRoomCategoryDropdownList } from '@/hooks/hostel/useRoomCategory';
import { cn } from '@/lib/utils';
import { type GuestAllotmentSchema, guestAllotmentSchema } from '@/schemas/hostel/transactions/guest-allotment.schema';
import { getEditData, getRoomDetails, saveGuestAllotment } from '@/server/hostel/hostel-management/transactions/guest-allotment';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { GuestAllotmentColumn } from './columns';

interface AddFormProps {
    onSuccess?: () => void;
    initialData?: GuestAllotmentColumn;
}

export default function GuestAllotmentForm({ onSuccess, initialData }: AddFormProps) {
    const methods = useForm<GuestAllotmentSchema>({
        resolver: zodResolver(guestAllotmentSchema),
        mode: 'onSubmit',
        defaultValues: {
            HLHGSTALT_Id: 0,
            HLHGSTALT_GuestName: '',
            HLHGSTALT_GuestPhoneNo: '',
            HLMH_Id: 0,
            HRMRM_Id: 0,
            HLHGSTALT_NoOfBeds: 0,
            HLHGSTALT_AllotRemarks: '',
            HLHGSTALT_AllotmentDate: new Date(),
            HLHGSTALT_GuestEmailId: '',
            HLMRCA_Id: 0,
            HLHGSTALT_AddressProof: '',
            HLHGSTALT_GuestAddress: '',
            HLHGSTALT_GuestPhoto: ''
        }
    });
    const { data: hostels } = useHostelDropdownList();
    const { data: roomCategories } = useRoomCategoryDropdownList();
    const { data: rooms } = useMasterRoomDropdown();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = methods;

    const [isFetchingEditData, setIsFetchingEditData] = useState(false);

    useEffect(() => {
        if (!initialData?.hlhgstalT_Id) {
            reset();
            return;
        }

        console.log(initialData);

        const fetchEditData = async () => {
            try {
                setIsFetchingEditData(true);

                const res = await getEditData(initialData.hlhgstalT_Id);

                const editData = Array.isArray(res?.data) ? res.data[0] : res?.data;

                if (!editData) return;

                reset({
                    HLHGSTALT_Id: editData.hlhgstalT_Id || editData.hlhgstalt_Id || editData.HLHGSTALT_Id || 0,

                    HLHGSTALT_GuestName: editData.hlhgstalT_GuestName || '',

                    HLHGSTALT_GuestPhoneNo: editData.hlhgstalT_GuestPhoneNo || '',

                    HLMH_Id: editData.hlmH_Id || 0,

                    HRMRM_Id: editData.hrmrM_Id || 0,

                    HLHGSTALT_NoOfBeds: editData.hlhgstalT_NoOfBeds || 0,

                    HLHGSTALT_AllotRemarks: editData.hlhgstalT_AllotRemarks || '',

                    HLHGSTALT_AllotmentDate: editData.hlhgstalT_AllotmentDate ? new Date(editData.hlhgstalT_AllotmentDate) : new Date(),

                    HLHGSTALT_GuestEmailId: editData.hlhgstalT_GuestEmailId || '',

                    HLMRCA_Id: editData.hlmrcA_Id || 0,

                    HLHGSTALT_AddressProof: editData.hlhgstalT_AddressProof || '',

                    HLHGSTALT_GuestAddress: editData.hlhgstalT_GuestAddress || '',

                    HLHGSTALT_GuestPhoto: editData.hlhgstalT_GuestPhoto || ''
                });
            } catch (err) {
                console.error('getEditData Error:', err);
                toast.error('Failed to load edit details');
            } finally {
                setIsFetchingEditData(false);
            }
        };

        fetchEditData();
    }, [initialData, reset]);

    const selectedRoomId = useWatch({ control, name: 'HRMRM_Id' });

    // Load Room Details when Room Selected
    useEffect(() => {
        if (!selectedRoomId) return;
        (async () => {
            const res = await getRoomDetails({ HRMRM_Id: Number(selectedRoomId) });
            if (res) {
                setValue('HLHGSTALT_NoOfBeds', res?.data);
            }
        })();
    }, [selectedRoomId, setValue]);

    const onSubmit = async (data: GuestAllotmentSchema) => {
        try {
            const res = await saveGuestAllotment(data);
            if (res.success) {
                toast.success(res.message.toString());
                reset();
                onSuccess?.();
            } else {
                toast.error(res.message.toString());
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    if (isFetchingEditData) {
        return (
            <div className='flex min-h-[300px] w-full items-center justify-center rounded-2xl border bg-white p-6 shadow-sm'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='w-full rounded-2xl border bg-white p-6 shadow-sm'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <h3 className='font-semibold text-gray-800 text-lg'>
                        {initialData?.hlhgstalT_Id ? 'Edit Guest Allotment' : 'Hostel Allotment For Guest'}
                    </h3>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Guest Name */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_GuestName'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Guest Name <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input {...field} placeholder='Enter Guest Name' />
                                    {errors.HLHGSTALT_GuestName && <FormError>{errors.HLHGSTALT_GuestName.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Guest Phone */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_GuestPhoneNo'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Guest Phone No <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input {...field} placeholder='Enter Phone No' maxLength={10} />
                                    {errors.HLHGSTALT_GuestPhoneNo && <FormError>{errors.HLHGSTALT_GuestPhoneNo.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Guest Email */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_GuestEmailId'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Guest Email ID <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input {...field} placeholder='Enter Email' />
                                    {errors.HLHGSTALT_GuestEmailId && <FormError>{errors.HLHGSTALT_GuestEmailId.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Allotment Date */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_AllotmentDate'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Alloted Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0'>
                                            <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.HLHGSTALT_AllotmentDate && <FormError>{errors.HLHGSTALT_AllotmentDate.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Hostel */}
                        <Controller
                            control={control}
                            name='HLMH_Id'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Hostel <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Hostel' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostels?.map((h: any) => (
                                                <SelectItem key={h.hlmH_Id} value={String(h.hlmH_Id)}>
                                                    {h.hlmH_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.HLMH_Id && <FormError>{errors.HLMH_Id.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Room Category */}
                        <Controller
                            control={control}
                            name='HLMRCA_Id'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Room Category <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(roomCategories as any[])?.map((c: any) => (
                                                <SelectItem key={c.hlmrcA_Id} value={String(c.hlmrcA_Id)}>
                                                    {c.hlmrcA_RoomCategory}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.HLMRCA_Id && <FormError>{errors.HLMRCA_Id.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Room No */}
                        <Controller
                            control={control}
                            name='HRMRM_Id'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Room <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Room' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms?.data?.map((r: any) => (
                                                <SelectItem key={r.hrmrM_Id} value={String(r.hrmrM_Id)}>
                                                    {r.hrmrM_RoomNo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.HRMRM_Id && <FormError>{errors.HRMRM_Id.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* No of Beds (Readonly) */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_NoOfBeds'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>No of Bed</Label>
                                    <Input {...field} disabled className='bg-gray-50' />
                                </div>
                            )}
                        />

                        {/* Guest Proof */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_AddressProof'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Guest Proof <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input {...field} placeholder='Enter Guest Proof' />
                                    {errors.HLHGSTALT_AddressProof && <FormError>{errors.HLHGSTALT_AddressProof.message}</FormError>}
                                </div>
                            )}
                        />

                        {/* Remarks */}
                        <Controller
                            control={control}
                            name='HLHGSTALT_AllotRemarks'
                            render={({ field }) => (
                                <div className='space-y-1'>
                                    <Label>
                                        Remarks <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input {...field} placeholder='Enter Remarks' />
                                    {errors.HLHGSTALT_AllotRemarks && <FormError>{errors.HLHGSTALT_AllotRemarks.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* Guest Address */}
                    <Controller
                        control={control}
                        name='HLHGSTALT_GuestAddress'
                        render={({ field }) => (
                            <div className='space-y-1'>
                                <Label>
                                    Guest Address <span className='text-red-500'>*</span>
                                </Label>
                                <Textarea {...field} placeholder='Enter Address' maxLength={350} />
                                {errors.HLHGSTALT_GuestAddress && <FormError>{errors.HLHGSTALT_GuestAddress.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Actions */}
                    <div className='flex items-center justify-center gap-4 pt-4'>
                        <Button type='button' variant='outline' onClick={() => reset()}>
                            Cancel
                        </Button>
                        <Button type='submit' disabled={isSubmitting}>
                            Save
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
