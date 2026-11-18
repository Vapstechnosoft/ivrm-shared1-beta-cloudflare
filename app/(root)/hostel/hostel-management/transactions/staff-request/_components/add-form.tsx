'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type StaffRequestValues, staffRequestSchema } from '@/schemas/hostel/transactions/hostel-requests.schema';
import { getStaffRequestLoadData, saveStaffRequest } from '@/server/hostel/hostel-management/transactions/staff-request-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Minus, Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function StaffRequestForm({
    onSaveSuccess,
    editData
}: {
    onSaveSuccess: () => void;
    editData?: any;
}) {
    const [loading, setLoading] = useState(false);
    const [hostels, setHostels] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [staffProfile, setStaffProfile] = useState<any>(null);

    const form = useForm<StaffRequestValues>({
        resolver: zodResolver(staffRequestSchema),
        defaultValues: {
            HLHSTREQ_Id: 0,
            HLHSTREQ_RequestDate: new Date(),
            HLHSTREQ_ACRoomFlg: false,
            HLHSTREQ_SingleRoomFlg: false,
            HLHSTREQ_VegMessFlg: false,
            HLHSTREQ_NonVegMessFlg: false
        }
    });

    const { control, handleSubmit, reset } = form;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editData) {
            form.reset({
                HLHSTREQ_Id: editData.HLHSTREQ_Id,
                HLHSTREQ_RequestDate: new Date(editData.HLHSTREQ_RequestDate),
                HLMH_Id: editData.HLMH_Id.toString(),
                HLMRCA_Id: editData.HLMRCA_Id.toString(),
                HLHSTREQ_ACRoomFlg: editData.HLHSTREQ_ACRoomFlg,
                HLHSTREQ_SingleRoomFlg: editData.HLHSTREQ_SingleRoomFlg,
                HLHSTREQ_VegMessFlg: editData.HLHSTREQ_VegMessFlg,
                HLHSTREQ_NonVegMessFlg: editData.HLHSTREQ_NonVegMessFlg,
                HLHSTREQ_Remarks: editData.HLHSTREQ_Remarks || ''
            });
        }
    }, [editData]);

    async function loadData() {
        const response = await getStaffRequestLoadData();
        if (response.success && response.data) {
            setHostels(response.data.hostel_list || []);
            setCategories(response.data.room_list || []);
            if (response.data.staff_wisedata?.length > 0) {
                setStaffProfile(response.data.staff_wisedata[0]);
            }
        }
    }

    async function onSubmit(values: StaffRequestValues) {
        setLoading(true);
        const payload = {
            ...values,
            HLHSTREQ_RequestDate: format(values.HLHSTREQ_RequestDate, 'yyyy-MM-dd'),
            HLMH_Id: Number.parseInt(values.HLMH_Id),
            HLMRCA_Id: Number.parseInt(values.HLMRCA_Id)
        };

        const result = await saveStaffRequest(payload);
        if (result?.success) {
            toast.success('Request saved successfully!');
            onSaveSuccess();
            form.reset();
        } else {
            toast.error(result?.message || 'Failed to save request');
        }
        setLoading(false);
    }

    const ReadOnlyField = ({ label, value }: { label: string; value: any }) => (
        <div className='flex items-center py-1'>
            <Label className='w-40 text-left font-medium text-gray-700'>{label}</Label>
            <span className='mr-4 text-gray-500'>:</span>
            <span className='flex-1 truncate font-semibold text-blue-900'>{value || '-'}</span>
        </div>
    );

    return (
        <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between border-b bg-white px-4 py-2'>
                <CardTitle className='font-bold text-[#4255a7] text-sm uppercase'>HOSTEL STAFF REQUEST</CardTitle>
                <Minus className='h-4 w-4 cursor-pointer text-gray-400' />
            </CardHeader>
            <CardContent className='p-8'>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-x-20 gap-y-1 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-2'>
                                <ReadOnlyField label='Staff Name' value={staffProfile?.empName} />
                                <ReadOnlyField label='Designation' value={staffProfile?.HRMDES_DesignationName} />

                                <div className='flex items-center py-1'>
                                    <Label className='w-40 text-left font-medium text-gray-700'>Hostel</Label>
                                    <span className='mr-4 text-gray-500'>:</span>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='HLMH_Id'
                                            render={({ field, fieldState }) => (
                                                <div className='w-full'>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className='h-8 border-blue-200 text-xs'>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {hostels.map((h) => (
                                                                <SelectItem key={h.hlmH_Id} value={String(h.hlmH_Id)}>
                                                                    {h.hlmH_Name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Mess Type Box */}
                                <div className='mt-4 flex items-center space-x-20 rounded-md border bg-white p-1.5 shadow-sm'>
                                    <Label className='w-32 pl-4 font-medium text-gray-700'>Mess Type :</Label>
                                    <div className='flex items-center space-x-6'>
                                        <Controller
                                            control={control}
                                            name='HLHSTREQ_VegMessFlg'
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <Label className='font-medium text-xs'>Veg</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name='HLHSTREQ_NonVegMessFlg'
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <Label className='font-medium text-xs'>Non-Veg</Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Room Features Box */}
                                <div className='flex items-center justify-center space-x-12 rounded-md border bg-white p-1.5 shadow-sm'>
                                    <Controller
                                        control={control}
                                        name='HLHSTREQ_ACRoomFlg'
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                <Label className='font-medium text-xs'>AC</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name='HLHSTREQ_SingleRoomFlg'
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                <Label className='font-medium text-xs'>Single</Label>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-2'>
                                <ReadOnlyField label='Department' value={staffProfile?.HRMD_DepartmentName} />
                                <ReadOnlyField label='Emp Code' value={staffProfile?.HRME_EmployeeCode} />

                                <div className='flex items-center py-1'>
                                    <Label className='w-40 text-left font-medium text-gray-700'>Room category:</Label>
                                    <span className='mr-4 text-gray-500'>:</span>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='HLMRCA_Id'
                                            render={({ field, fieldState }) => (
                                                <div className='w-full'>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className='h-8 border-blue-200 text-xs'>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((c) => (
                                                                <SelectItem key={c.hlmrcA_Id} value={String(c.hlmrcA_Id)}>
                                                                    {c.hlmrcA_RoomCategory}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='flex items-center py-1'>
                                    <Label className='w-40 text-left font-medium text-gray-700'>
                                        Request Date:<span className='text-red-500'>*</span>
                                    </Label>
                                    <span className='mr-4 text-gray-500'>:</span>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='HLHSTREQ_RequestDate'
                                            render={({ field, fieldState }) => (
                                                <DateField field={field} fieldState={fieldState} label='' placeholder='Select date' />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='flex items-start py-1'>
                                    <Label className='w-40 pt-2 text-left font-medium text-gray-700'>Remarks</Label>
                                    <span className='mr-4 pt-2 text-gray-500'>:</span>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='HLHSTREQ_Remarks'
                                            render={({ field, fieldState }) => (
                                                <div className='w-full'>
                                                    <Textarea {...field} className='min-h-[60px] border-blue-100' />
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-center gap-4 pt-6'>
                            <Button
                                type='submit'
                                disabled={loading}
                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-3 w-3' />}
                                SAVE
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    onSaveSuccess();
                                }}
                                className='w-32 rounded-md border-none bg-[#ff5c33] font-bold text-white text-xs uppercase shadow-md hover:bg-[#e64d26]'>
                                <XCircle className='mr-2 h-3 w-3' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
