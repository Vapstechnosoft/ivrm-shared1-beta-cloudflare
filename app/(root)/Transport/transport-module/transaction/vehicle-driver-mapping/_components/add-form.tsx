'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDriverDropDown,
    useSessionDropDown,
    useVehicleDriverMapping,
    useVehicleDropDown
} from '@/hooks/transport/transportmodule/usetransaction';
import { cn } from '@/lib/utils';
import { vehicleDriverMappingSchema } from '@/schemas/transport/transaction';
import { saveVehicleDriverMapping } from '@/server/transport/transport-module/transaction/vehicle-driver-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddFormProps {
    onClose?: () => void;
}

const formSchema = vehicleDriverMappingSchema.addOrUpdate;

export default function AddForm({ onClose }: AddFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { refetchAll } = useVehicleDriverMapping();

    // Fetch master data directly in the form
    const { data: vehicleData } = useVehicleDropDown();
    console.log('vehi--------------------', vehicleData);
    const { data: driverData } = useDriverDropDown();
    const { data: sessionData } = useSessionDropDown();

    const vehicles = Array.isArray(vehicleData) ? vehicleData : vehicleData?.data || [];
    const drivers = Array.isArray(driverData) ? driverData : driverData?.data || [];
    const sessions = Array.isArray(sessionData) ? sessionData : sessionData?.data || [];

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            trmV_Id: 0,
            trmD_Id: 0,
            trmS_Id: 0,
            trmS_Flag: 'PickUp',
            trvD_Date: new Date().toISOString()
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            console.log('vehicledrivermapping', values);
            const response = await saveVehicleDriverMapping(values);

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                onClose?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Vehicle */}
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='trmV_Id'>
                        Vehicle <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='trmV_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger id='trmV_Id'>
                                    <SelectValue placeholder='Select Vehicle' />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((item: any) => (
                                        <SelectItem key={item.trmV_Id} value={item.trmV_Id.toString()}>
                                            {item.trmV_VehicleNo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.trmV_Id && <FormError>{errors.trmV_Id.message}</FormError>}
                </div>

                {/* Driver */}
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='trmD_Id'>
                        Driver <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='trmD_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger id='trmD_Id'>
                                    <SelectValue placeholder='Select Driver' />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map((item: any) => (
                                        <SelectItem key={item.trmD_Id} value={item.trmD_Id.toString()}>
                                            {item.trmD_DriverName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.trmD_Id && <FormError>{errors.trmD_Id.message}</FormError>}
                </div>

                {/* Date */}
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='trvD_Date'>
                        Date <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='trvD_Date'
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id='trvD_Date'
                                        variant={'outline'}
                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        {field.value ? <span>{new Date(field.value).toLocaleDateString()}</span> : <span>Pick a date</span>}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => field.onChange(date?.toISOString())}
                                        defaultMonth={new Date()}
                                        disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            return date < today;
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.trvD_Date && <FormError>{errors.trvD_Date.message}</FormError>}
                </div>

                {/* Session */}
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='trmS_Id'>
                        Session Name <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='trmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger id='trmS_Id'>
                                    <SelectValue placeholder='Select Session' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map((item: any) => (
                                        <SelectItem key={item.trmS_Id} value={item.trmS_Id.toString()}>
                                            {item.trmS_SessionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.trmS_Id && <FormError>{errors.trmS_Id.message}</FormError>}
                </div>

                {/* PickUp / Drop */}
                <div className='group flex flex-col gap-1.5'>
                    <Label htmlFor='trmS_Flag'>PickUp / Drop</Label>
                    <Controller
                        name='trmS_Flag'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id='trmS_Flag'>
                                    <SelectValue placeholder='Select Flag' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='PickUp'>PickUp</SelectItem>
                                    <SelectItem value='Drop'>Drop</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.trmS_Flag && <FormError>{errors.trmS_Flag.message}</FormError>}
                </div>
            </div>

            <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isLoading}>
                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Save className='mr-2 h-4 w-4' />
                    Save
                </Button>
            </div>
        </form>
    );
}
