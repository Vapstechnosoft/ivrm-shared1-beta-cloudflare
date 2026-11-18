'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { FormInput } from '@/components/ui/form/form-input';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MasterBedSchema, type MasterBedSchemaType } from '@/schemas/hostel/master-bed.schema';
import { fetchFloors, fetchRooms, saveBed } from '@/server/hostel/hostel-management/masters/bed';
import type { IBedDisplay, IFloor, IHostel, IRoom } from '@/types/hostel/hostel-management/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateMasterBedFormProps {
    onSuccess: () => void;
    hostels: IHostel[];
    rowData: IBedDisplay;
}

export default function UpdateMasterBedForm({ onSuccess, hostels, rowData }: UpdateMasterBedFormProps) {
    const { closeEditForm } = useFormContext();
    const [floors, setFloors] = useState<IFloor[]>([]);
    const [rooms, setRooms] = useState<IRoom[]>([]);

    const form = useForm<MasterBedSchemaType>({
        resolver: zodResolver(MasterBedSchema),
        defaultValues: {
            HLMB_Id: rowData.hlmB_Id,
            HLMH_Id: rowData.hlmH_Id,
            HLMF_Id: rowData.hlmF_Id,
            HRMRM_Id: rowData.hrmrM_Id,
            HLMB_BedName: rowData.hlmB_BedName,
            HLMB_MattressFlg: rowData.hlmB_MattressFlg,
            HLMB_BedSheetFlg: rowData.hlmB_BedSheetFlg,
            HLMB_PillowFlg: rowData.hlmB_PillowFlg,
            HLMB_StudyTableFlg: rowData.hlmB_StudyTableFlg,
            HLMB_LampFlg: rowData.hlmB_LampFlg
        }
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = form;

    const selectedHostel = watch('HLMH_Id');
    const selectedFloor = watch('HLMF_Id');

    // Initial Load for Edit
    useEffect(() => {
        const loadInitialData = async () => {
            if (rowData.hlmH_Id) {
                const floorsRes = await fetchFloors(rowData.hlmH_Id);
                setFloors(floorsRes.floors);
            }
            if (rowData.hlmF_Id) {
                const roomsRes = await fetchRooms(rowData.hlmF_Id);
                setRooms(roomsRes.rooms);
            }
        };
        loadInitialData();
    }, [rowData]);

    // Fetch floors when Hostel changes (and reset dependents if changed by user)
    // Note: This runs on mount too if defaultValues set selectedHostel.
    // But we handle initial load separately to ensure data is there.
    // To distinguish user change vs initial, we can rely on standard behavior:
    // When user changes, we want to reset children.
    // When mounting, we don't.
    // We can rely on `onValueChange` in the Select for resetting logic, not useEffect.
    // The useEffect here should just ensure the list is available for the selected ID.

    useEffect(() => {
        if (selectedHostel) {
            const loadFloors = async () => {
                const result = await fetchFloors(Number(selectedHostel));
                setFloors(result.floors);
            };
            loadFloors();
        } else {
            setFloors([]);
        }
    }, [selectedHostel]);

    useEffect(() => {
        if (selectedFloor) {
            const loadRooms = async () => {
                const result = await fetchRooms(Number(selectedFloor));
                setRooms(result.rooms);
            };
            loadRooms();
        } else {
            setRooms([]);
        }
    }, [selectedFloor]);

    const onSubmit = async (data: MasterBedSchemaType) => {
        const result = await saveBed(data);
        if (result.success) {
            toast.success(result.message);
            onSuccess();
            closeEditForm();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className='rounded-lg border bg-background p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* LEFT COLUMN */}
                    <div className='space-y-4'>
                        {/* Hostel */}
                        <div className='space-y-2'>
                            <Label>
                                Hostel Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='HLMH_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                            setValue('HLMF_Id', 0); // Reset floor
                                            setValue('HRMRM_Id', 0); // Reset room
                                        }}
                                        value={field.value ? field.value.toString() : ''}>
                                        <SelectTrigger className={errors.HLMH_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostels.map((h) => (
                                                <SelectItem key={h.hlmH_Id} value={h.hlmH_Id.toString()}>
                                                    {h.hlmH_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.HLMH_Id?.message}</FormError>
                        </div>

                        {/* Floor */}
                        <div className='space-y-2'>
                            <Label>
                                Floor Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='HLMF_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                            setValue('HRMRM_Id', 0); // Reset room
                                        }}
                                        value={field.value ? field.value.toString() : ''}
                                        disabled={!selectedHostel}>
                                        <SelectTrigger className={errors.HLMF_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {floors.map((f) => (
                                                <SelectItem key={f.hlmF_Id} value={f.hlmF_Id.toString()}>
                                                    {f.hrmF_FloorName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.HLMF_Id?.message}</FormError>
                        </div>

                        {/* Room */}
                        <div className='space-y-2'>
                            <Label>
                                Room Details <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='HRMRM_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                        disabled={!selectedFloor}>
                                        <SelectTrigger className={errors.HRMRM_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.map((r) => (
                                                <SelectItem key={r.hrmrM_Id} value={r.hrmrM_Id.toString()}>
                                                    {r.hrmrM_RoomNo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.HRMRM_Id?.message}</FormError>
                        </div>

                        {/* Bed Name */}
                        <FormInput control={control} name='HLMB_BedName' label='Bed Name' placeholder='Enter Bed Name' required />
                    </div>

                    {/* RIGHT COLUMN - Facilities */}
                    <div className='space-y-4'>
                        <Label>Facility Flag :</Label>
                        <div className='flex flex-wrap gap-4 rounded-md border p-4'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='HLMB_MattressFlg'
                                    render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <span>Mattress</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='HLMB_BedSheetFlg'
                                    render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <span>BedSheet</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='HLMB_PillowFlg'
                                    render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <span>Pillow</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='HLMB_StudyTableFlg'
                                    render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <span>StudyTable</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='HLMB_LampFlg'
                                    render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <span>Lamp</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='mt-4 flex justify-center gap-4 border-t pt-4'>
                    <Button type='submit' disabled={isSubmitting} className='w-32'>
                        Update
                    </Button>
                    <Button type='button' variant='destructive' onClick={closeEditForm} className='w-32'>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
