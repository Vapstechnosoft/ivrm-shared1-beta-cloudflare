'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type VacateRoomSchema, vacateRoomSchema } from '@/schemas/hostel/transactions/vacate-room.schema';
import {
    getDetailsOnType,
    getGuestDetail,
    getStaffDetail,
    getStudentDetail,
    saveVacate
} from '@/server/hostel/hostel-management/transactions/vacate-room';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Minus, Save, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface VacateFormProps {
    initialData: {
        studentdata: any[];
        staffdata: any[];
        guestdata: any[];
    };
    onSuccess?: (type: string) => void;
    onTypeChange?: (type: string) => void;
}

export default function VacateForm({ initialData, onSuccess, onTypeChange }: VacateFormProps) {
    const [people, setPeople] = useState<any[]>(initialData.studentdata);
    const [details, setDetails] = useState<any>(null);

    const methods = useForm<VacateRoomSchema>({
        resolver: zodResolver(vacateRoomSchema),
        mode: 'onSubmit',
        defaultValues: {
            type: 'student',
            AMST_Id: null,
            HRME_Id: null,
            HLHGSTALT_Id: null,
            HLHSALT_VacatedDate: new Date(),
            HLHSALT_VacateRemarks: ''
        }
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = methods;

    const selectedType = useWatch({ control, name: 'type' });
    const selectedAMST = useWatch({ control, name: 'AMST_Id' });
    const selectedHRME = useWatch({ control, name: 'HRME_Id' });
    const selectedHLHGSTALT = useWatch({ control, name: 'HLHGSTALT_Id' });

    // Handle Type Change
    useEffect(() => {
        onTypeChange?.(selectedType);
        setDetails(null);
        reset({
            type: selectedType,
            AMST_Id: null,
            HRME_Id: null,
            HLHGSTALT_Id: null,
            HLHSALT_VacatedDate: new Date(),
            HLHSALT_VacateRemarks: ''
        });

        // Fetch people based on type
        (async () => {
            const res = await getDetailsOnType(selectedType);
            if (res?.list) {
                setPeople(res.list);
            }
        })();
    }, [selectedType, onTypeChange, reset]);

    // Handle Person Selection Details
    useEffect(() => {
        if (selectedType === 'student' && selectedAMST) {
            (async () => {
                const res = await getStudentDetail(Number(selectedAMST));
                if (res?.studentdata?.[0]) {
                    setDetails(res.studentdata[0]);
                }
            })();
        } else if (selectedType === 'staff' && selectedHRME) {
            (async () => {
                const res = await getStaffDetail(Number(selectedHRME));
                if (res?.staffdata?.[0]) {
                    setDetails(res.staffdata[0]);
                }
            })();
        } else if (selectedType === 'guest' && selectedHLHGSTALT) {
            (async () => {
                const res = await getGuestDetail(Number(selectedHLHGSTALT));
                if (res?.guest_details?.[0]) {
                    setDetails(res.guest_details[0]);
                }
            })();
        }
    }, [selectedType, selectedAMST, selectedHRME, selectedHLHGSTALT]);

    const onSubmit = async (data: any) => {
        try {
            const payload: any = { type: data.type };
            if (data.type === 'student') {
                payload.AMST_Id = data.AMST_Id;
                payload.HLHSALT_VacatedDate = data.HLHSALT_VacatedDate ? format(data.HLHSALT_VacatedDate, 'yyyy-MM-dd') : null;
                payload.HLHSALT_VacateRemarks = data.HLHSALT_VacateRemarks;
            } else if (data.type === 'staff') {
                payload.HRME_Id = data.HRME_Id;
                payload.HLHSTALT_VacatedDate = data.HLHSALT_VacatedDate ? format(data.HLHSALT_VacatedDate, 'yyyy-MM-dd') : null;
                payload.HLHSTALT_VacateRemarks = data.HLHSALT_VacateRemarks;
            } else if (data.type === 'guest') {
                payload.HLHGSTALT_Id = data.HLHGSTALT_Id;
                payload.HLHGSTALT_VacatedDate = data.HLHSALT_VacatedDate ? format(data.HLHSALT_VacatedDate, 'yyyy-MM-dd') : null;
                payload.HLHGSTALT_VacateRemarks = data.HLHSALT_VacateRemarks;
            }

            const res: any = await saveVacate(payload);
            if (res.success) {
                toast.success(String(res.message));
                reset();
                onSuccess?.(data.type);
            } else {
                toast.error(res.message || 'Failed to update');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

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
                <CardTitle className='font-bold text-[#4255a7] text-sm uppercase'>HOSTEL VACATE ROOM</CardTitle>
                <Minus className='h-4 w-4 cursor-pointer text-gray-400' />
            </CardHeader>
            <CardContent className='p-8'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Radio Group Header */}
                        <div className='flex justify-center'>
                            <div className='flex items-center space-x-8 rounded-full border bg-white px-12 py-2 shadow-sm'>
                                <Controller
                                    control={control}
                                    name='type'
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-8'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='student' id='r1' />
                                                <Label htmlFor='r1' className='cursor-pointer font-bold text-xs uppercase'>
                                                    Student
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='staff' id='r2' />
                                                <Label htmlFor='r2' className='cursor-pointer font-bold text-xs uppercase'>
                                                    Staff
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='guest' id='r3' />
                                                <Label htmlFor='r3' className='cursor-pointer font-bold text-xs uppercase'>
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
                            <Label className='w-40 whitespace-nowrap text-right font-bold text-gray-700'>
                                {selectedType === 'student' ? 'Student' : selectedType === 'staff' ? 'Staff' : 'Guest'} Name:
                                <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-72'>
                                <Controller
                                    control={control}
                                    name={selectedType === 'student' ? 'AMST_Id' : selectedType === 'staff' ? 'HRME_Id' : 'HLHGSTALT_Id'}
                                    render={({ field, fieldState }) => (
                                        <div className='w-full'>
                                            <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger className='h-8 border-blue-200 text-xs'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {people?.map((p: any) => (
                                                        <SelectItem
                                                            key={p.amsT_Id || p.hrmE_Id || p.hlhgstalT_Id}
                                                            value={String(p.amsT_Id || p.hrmE_Id || p.hlhgstalT_Id)}
                                                            className='text-xs'>
                                                            {p.studentname || p.staffname || p.hlhgstalT_GuestName}
                                                            {p.amsT_AdmNo ? ` : ${p.amsT_AdmNo}` : ''}
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

                        {/* Details Grid */}
                        <div className='mx-auto my-4 grid max-w-5xl grid-cols-1 gap-x-20 gap-y-1 rounded-lg border-y bg-slate-50/50 px-4 py-4 md:grid-cols-2'>
                            <ReadOnlyField
                                label={selectedType === 'student' ? 'Course' : selectedType === 'staff' ? 'Department' : 'Guest Type'}
                                value={details?.ASMCL_ClassName || details?.HRMD_DepartmentName || '-'}
                            />
                            <ReadOnlyField
                                label={selectedType === 'student' ? 'Branch' : selectedType === 'staff' ? 'Designation' : ''}
                                value={details?.ASMC_SectionName || details?.HRMDES_DesignationName || ''}
                            />
                            <ReadOnlyField
                                label='Date Of Joining'
                                value={
                                    details
                                        ? format(
                                              new Date(
                                                  details.HLHSALT_AllotmentDate ||
                                                      details.HLHSTALT_AllotmentDate ||
                                                      details.hlhgstalT_AllotmentDate
                                              ),
                                              'dd-MM-yyyy'
                                          )
                                        : '-'
                                }
                            />
                            <ReadOnlyField label='Hostel Name' value={details?.HLMH_Name} />
                            <ReadOnlyField label='Room Name' value={details?.HRMRM_RoomNo} />
                        </div>

                        {/* Vacate Date and Remarks */}
                        <div className='mx-auto grid max-w-5xl grid-cols-1 gap-x-20 gap-y-1 md:grid-cols-2'>
                            <div className='flex items-center py-1'>
                                <Label className='w-40 whitespace-nowrap text-left font-medium text-gray-700'>
                                    Vacate Date:<span className='text-red-500'>*</span>
                                </Label>
                                <span className='mr-4 text-gray-500'>:</span>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='HLHSALT_VacatedDate'
                                        render={({ field, fieldState }) => (
                                            <DateField
                                                field={field}
                                                fieldState={fieldState}
                                                label=''
                                                placeholder='Select date...'
                                                outputFormat='date'
                                            />
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
                                        name='HLHSALT_VacateRemarks'
                                        render={({ field, fieldState }) => (
                                            <div className='w-full'>
                                                <Textarea {...field} value={field.value || ''} className='min-h-[60px] border-blue-100' />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center justify-center gap-4 pt-6'>
                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-3 w-3' />}
                                SUBMIT
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setDetails(null);
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
