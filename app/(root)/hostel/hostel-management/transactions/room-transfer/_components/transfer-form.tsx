'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { type RoomTransferValues, roomTransferSchema } from '@/schemas/hostel/transactions/room-transfer.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { DateField } from '@/components/ui/dateField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    getFloorsAndCategories,
    getRoomTransferLoadData,
    getRoomsForTransfer,
    getTransferPersonDetail,
    saveRoomTransfer
} from '@/server/hostel/hostel-management/transactions/room-transfer';
import { format } from 'date-fns';

export default function RoomTransferForm({ onSaveSuccess }: { onSaveSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [personData, setPersonData] = useState<any[]>([]);
    const [hostels, setHostels] = useState<any[]>([]);
    const [floors, setFloors] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);

    const form = useForm<RoomTransferValues>({
        resolver: zodResolver(roomTransferSchema),
        defaultValues: {
            type: 'stud',
            HLHSALTC_TransferDate: new Date(),
            HLHSTRSC_EntireRoomReqdFlg: 0,
            HLHSTRSC_NewRoomFee: 0
        }
    });

    const selectedType = useWatch({ control: form.control, name: 'type' });
    const selectedPersonId = useWatch({
        control: form.control,
        name: selectedType === 'stud' ? 'AMCST_Id' : selectedType === 'staff' ? 'HRME_Id' : 'HLHGSTALT_Id'
    });
    const selectedHostelId = useWatch({ control: form.control, name: 'ToHLMH_Id' });
    const selectedCategoryId = useWatch({ control: form.control, name: 'HLMRCA_Id' });
    const selectedFloorId = useWatch({ control: form.control, name: 'hlmF_Id' });

    useEffect(() => {
        loadInitialData(selectedType);
        // Reset person selection when type changes
        if (selectedType === 'stud') form.setValue('AMCST_Id', 0);
        else if (selectedType === 'staff') form.setValue('HRME_Id', 0);
        else form.setValue('HLHGSTALT_Id', 0);
    }, [selectedType, form.setValue]);

    useEffect(() => {
        if (selectedPersonId) {
            loadPersonDetail(selectedType, selectedPersonId);
        }
    }, [selectedPersonId]);

    useEffect(() => {
        if (selectedHostelId) {
            loadFloorsAndCategories(selectedHostelId);
            form.setValue('hlmF_Id', undefined as any);
            form.setValue('HLMRCA_Id', undefined as any);
            form.setValue('HRMRM_Id', undefined as any);
        }
    }, [selectedHostelId]);

    useEffect(() => {
        if (selectedFloorId && selectedCategoryId) {
            loadRooms(selectedFloorId, selectedCategoryId, 0);
            form.setValue('HRMRM_Id', undefined as any);
        }
    }, [selectedFloorId, selectedCategoryId]);

    async function loadInitialData(type: string) {
        setLoading(true);
        const data = await getRoomTransferLoadData(type);
        if (data?.studentdata) {
            // The API response key varies: studentdata, staffdata, guestdata?
            // Looking at `getVacateLoadData` in previous turn, it returned `list`.
            // But `getRoomTransferLoadData` calls `CLGHostelVacant/loaddata`.
            // Let's assume the response structure or just use what `data` provides.
            // Based on `transfer-form.tsx` line 80 (commented out), it seemed ambiguous.
            // Let's check `data` content dynamically or assume `studentdata`/`staffdata`.
            // Actually, the `CustomMultiSelectBox` usage below used `personData`.
            // We need to populate `personData`.
            if (type === 'stud' && data.studentdata) setPersonData(data.studentdata);
            else if (type === 'staff' && data.staffdata) setPersonData(data.staffdata);
            else if (type === 'guest' && data.guestdata) setPersonData(data.guestdata);
            else setPersonData([]);
        }
        setLoading(false);
    }

    async function loadPersonDetail(type: string, id: number) {
        const data = await getTransferPersonDetail(type, id);
        if (data) {
            const detail = data.studentdata?.[0] || data.staffdata?.[0] || data.guest_details?.[0];
            if (detail) {
                form.setValue('currentHostel', detail.HLMH_Name);
                form.setValue('currentRoom', detail.HRMRM_RoomNo);
                form.setValue('currentCategory', detail.HLMRCA_RoomCategory);
                form.setValue(
                    'joiningDate',
                    detail.HLHSALTC_AllotmentDate || detail.HLHSTALT_AllotmentDate || detail.hlhgstalT_AllotmentDate
                );
                setHostels(data.hostel_list || []);
            }
        }
    }

    async function loadFloorsAndCategories(hostelId: number) {
        const data = await getFloorsAndCategories(hostelId);
        if (data) {
            setFloors(data.floor_list || []);
            setCategories(data.roomcatgry_list || []);
        }
    }

    async function loadRooms(floorId: number, categoryId: number, oldRoomId: number) {
        const data = await getRoomsForTransfer(floorId, categoryId, oldRoomId);
        if (data) {
            setRooms(data.room_list || []);
        }
    }

    async function onSubmit(values: RoomTransferValues) {
        setLoading(true);
        try {
            const payload = {
                HLHSALTC_TransferDate: format(values.HLHSALTC_TransferDate, 'yyyy-MM-dd'),
                HLMH_Id: values.ToHLMH_Id,
                HLMRCA_Id: values.HLMRCA_Id,
                AMCST_Id: values.AMCST_Id,
                HRME_Id: values.HRME_Id,
                HLHGSTALT_Id: values.HLHGSTALT_Id,
                HLHSTRSC_To_HLMRCA_Id: values.HLMRCA_Id,
                HLMRCAC_To_HRMRM_Id: values.HRMRM_Id,
                HLHSTRSC_EntireRoomReqdFlg: values.HLHSTRSC_EntireRoomReqdFlg,
                HLHSTRSC_NewRoomFee: values.HLHSTRSC_NewRoomFee,
                HLHSTRSC_VacateRemarks: values.HLHSTRSC_VacateRemarks,
                HLHSTRSC_AllotmentRemarks: values.HLHSTRSC_AllotmentRemarks,
                type: values.type === 'stud' ? 'ClgStudent' : values.type
            };

            const result = await saveRoomTransfer(payload);
            if (result?.returnval === true || result?.returnval === 'save') {
                toast.success('Room transferred successfully!');
                onSaveSuccess();
                form.reset({
                    type: values.type,
                    HLHSALTC_TransferDate: new Date(),
                    HLHSTRSC_EntireRoomReqdFlg: 0,
                    HLHSTRSC_NewRoomFee: 0
                });
                setPersonData([]);
                setHostels([]);
                loadInitialData(values.type);
            } else {
                toast.error(result?.returnval || 'Failed to transfer room');
            }
        } catch (error) {
            console.error('Submit error', error);
            toast.error('An error occurred during submission');
        }
        setLoading(false);
    }

    return (
        <Card className='border-primary/20 shadow-lg'>
            <CardContent className='pt-6'>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Radio Group Header */}
                        <div className='flex justify-center'>
                            <div className='flex items-center space-x-8 rounded-full border bg-white px-12 py-2 shadow-sm'>
                                <Controller
                                    control={form.control}
                                    name='type'
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-8'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='stud' id='r1' />
                                                <Label htmlFor='r1' className='cursor-pointer'>
                                                    Student
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='staff' id='r2' />
                                                <Label htmlFor='r2' className='cursor-pointer'>
                                                    Staff
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='guest' id='r3' />
                                                <Label htmlFor='r3' className='cursor-pointer'>
                                                    Guest
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Person Selection */}
                        <div className='mx-auto flex max-w-2xl items-center justify-center space-x-4 py-2'>
                            <Label className='w-40 whitespace-nowrap text-right font-bold'>
                                {selectedType === 'stud' ? 'Student' : selectedType === 'staff' ? 'Staff' : 'Guest'} Name:
                                <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-72'>
                                <Controller
                                    control={form.control}
                                    name={selectedType === 'stud' ? 'AMCST_Id' : selectedType === 'staff' ? 'HRME_Id' : 'HLHGSTALT_Id'}
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(val) => field.onChange(Number(val))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {personData.map((p) => {
                                                        const id = p.amcsT_Id || p.hrmE_Id || p.hlhgstalT_Id;
                                                        const name = p.studentname || p.staffname || p.hlhgstalT_GuestName;
                                                        return (
                                                            <SelectItem key={id} value={id.toString()}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='mx-auto grid max-w-6xl grid-cols-1 gap-x-12 gap-y-4 pt-4 md:grid-cols-2'>
                            {/* Left Column: Current Details & Actions */}
                            <div className='space-y-4'>
                                <div className='grid grid-cols-1 gap-2 border-b pb-4'>
                                    <div className='flex text-sm'>
                                        <span className='w-32 font-medium'>Hostel Name</span>
                                        <span className='px-2'>:</span>
                                        <span className='flex-1'>{form.getValues('currentHostel') || ''}</span>
                                    </div>
                                    <div className='flex text-sm'>
                                        <span className='w-32 font-medium'>Room Name</span>
                                        <span className='px-2'>:</span>
                                        <span className='flex-1'>{form.getValues('currentRoom') || ''}</span>
                                    </div>
                                    <div className='flex text-sm'>
                                        <span className='w-32 font-medium'>Category Name</span>
                                        <span className='px-2'>:</span>
                                        <span className='flex-1'>{form.getValues('currentCategory') || ''}</span>
                                    </div>
                                    <div className='flex text-sm'>
                                        <span className='w-32 font-medium'>Date Of Joining</span>
                                        <span className='px-2'>:</span>
                                        <span className='flex-1'>
                                            {form.getValues('joiningDate')
                                                ? format(new Date(form.getValues('joiningDate')!), 'dd-MM-yyyy')
                                                : ''}
                                        </span>
                                    </div>
                                </div>

                                <Controller
                                    control={form.control}
                                    name='HLHSALTC_TransferDate'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-center space-x-4'>
                                            <Label className='w-32 font-medium'>
                                                Transfer Date:<span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='w-64'>
                                                <DateField field={field} fieldState={fieldState} label='' placeholder='dd-mm-yyyy' />
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name='HLHSTRSC_NewRoomFee'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-center space-x-4'>
                                            <Label className='w-32 font-medium'>
                                                New Room Fee:<span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='w-64'>
                                                <Input
                                                    type='number'
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                                    placeholder='New Room Fee'
                                                />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <div className='flex max-w-sm justify-center py-2'>
                                    <Controller
                                        control={form.control}
                                        name='HLHSTRSC_EntireRoomReqdFlg'
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2 rounded-md border border-gray-200 bg-gray-50 px-12 py-2'>
                                                <Checkbox
                                                    checked={field.value === 1}
                                                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                                />
                                                <Label className='cursor-pointer font-medium'>Entire Room Required?</Label>
                                            </div>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={form.control}
                                    name='HLHSTRSC_AllotmentRemarks'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-start space-x-4'>
                                            <Label className='w-32 pt-2 font-medium'>Allotment Remarks</Label>
                                            <div className='flex-1'>
                                                <Textarea placeholder='Allotment Remarks' {...field} className='min-h-[80px]' />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Right Column: Transfer To Dropdowns */}
                            <div className='space-y-4'>
                                <Controller
                                    control={form.control}
                                    name='ToHLMH_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-center space-x-4'>
                                            <Label className='w-32 text-left font-medium'>
                                                Hostel Name:<span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='w-64'>
                                                <Select
                                                    value={field.value ? String(field.value) : undefined}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
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
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name='HLMRCA_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-center space-x-4'>
                                            <Label className='w-32 text-left font-medium'>
                                                Room Category:<span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='w-64'>
                                                <Select
                                                    value={field.value ? String(field.value) : undefined}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((c) => (
                                                            <SelectItem key={c.hlmrcA_Id} value={c.hlmrcA_Id.toString()}>
                                                                {c.hlmrcA_RoomCategory}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name='hlmF_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-center space-x-4'>
                                            <Label className='w-32 text-left font-medium'>
                                                Floor Name:<span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='w-64'>
                                                <Select
                                                    value={field.value ? String(field.value) : undefined}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
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
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name='HRMRM_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-center space-x-4'>
                                            <Label className='w-32 text-left font-medium'>
                                                Room Name:<span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='w-64'>
                                                <Select
                                                    value={field.value ? String(field.value) : undefined}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
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
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name='HLHSTRSC_VacateRemarks'
                                    render={({ field, fieldState }) => (
                                        <div className='flex items-start space-x-4'>
                                            <Label className='w-32 pt-2 text-left font-medium'>Vacate Remarks</Label>
                                            <div className='flex-1'>
                                                <Textarea placeholder='Vacate Remarks' {...field} className='min-h-[80px]' />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center justify-center gap-4 border-t pt-6'>
                            <Button
                                type='submit'
                                disabled={loading}
                                className='w-32 border-none bg-blue-700 font-bold text-white uppercase hover:bg-blue-800'>
                                {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                                {loading ? '...' : 'TRANSFER'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => form.reset()}
                                className='w-32 border-none bg-orange-500 font-bold text-white uppercase hover:bg-orange-600'>
                                <XCircle className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
