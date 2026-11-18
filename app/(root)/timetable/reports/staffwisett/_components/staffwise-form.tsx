'use client';

import { useTimeTableAcademicYear } from '@/hooks/timetable/useMasters';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { staffdropdowndatattstaffreport } from '@/hooks/timetable/reports';
import { staffWiseReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { getStaffWiseReportUsingFacade } from '@/server/timetable/reports/staffwisett';

type FormFields = z.infer<typeof staffWiseReportSchema.search>;

interface StaffWiseFormProps {
    onReportGenerated: (response: any, payload: any) => void;
    onCancel: () => void;
}

export default function StaffWiseForm({ onReportGenerated, onCancel }: StaffWiseFormProps) {
    const { data: academicyeardata, isLoading: academicyearloading } = useTimeTableAcademicYear();

    const { data: staffdata } = staffdropdowndatattstaffreport();

    const academicList = Array.isArray(academicyeardata) ? academicyeardata : (academicyeardata as any)?.data || [];
    const staffList = Array.isArray(staffdata) ? staffdata : (staffdata as any)?.data || [];

    const staffOptions = useMemo(() => {
        let dataArray: any[] = [];
        if (Array.isArray(staffList)) {
            dataArray = staffList;
        } else if (Array.isArray((staffList as any)?.data)) {
            dataArray = (staffList as any).data;
        }

        if (!dataArray || dataArray.length === 0) return [];

        const uniqueMap = new Map();
        dataArray.forEach((s: any) => {
            const id = s.hrmE_Id || s.HRME_Id;
            if (id && !uniqueMap.has(id)) {
                uniqueMap.set(id, s);
            }
        });

        return Array.from(uniqueMap.values()).map((s: any) => ({
            label: s.staffName || s.empName || s.hrmE_EmployeeName || '',
            value: (s.hrmE_Id || s.HRME_Id).toString()
        }));
    }, [staffList]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(staffWiseReportSchema.search),
        defaultValues: {
            staffId: [],
            asmaY_Id: undefined,
            rpttyp: 'SAWC'
        }
    });

    const onFormSubmit = async (data: FormFields) => {
        // Construct payload exactly as requested by user
        const payload = {
            asmaY_Id: data.asmaY_Id,
            staffarray: data.staffId?.map((id) => ({ hrmE_Id: id })) || []
        };
        console.log('staff data payload', JSON.stringify(payload));

        try {
            const response = await getStaffWiseReportUsingFacade(payload);
            console.log('staff data response', response);
            const selectedStaffObjects =
                data.staffId?.map((id) => {
                    const s = staffOptions.find((opt) => opt.value === id.toString());
                    return { hrmE_Id: id, staffName: s?.label || '' };
                }) || [];

            // Pass the rpttyp along for processing purposes, even if not in API payload
            onReportGenerated(response, { ...payload, staffarray: selectedStaffObjects, rpttyp: data.rpttyp });
        } catch (error: any) {
            console.error('Error fetching staff wise report:', error);
            throw error;
        }
    };

    const handleCancelClick = () => {
        reset();
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='space-y-2'>
                    <Label htmlFor='asmaY_Id'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value ?? 'empty'}
                                value={field.value ? field.value.toString() : undefined}
                                onValueChange={(val) => field.onChange(Number(val))}>
                                <SelectTrigger id='asmaY_Id'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Staff */}
                <div className='space-y-2'>
                    <Label htmlFor='staffId'>
                        Staff Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='staffId'
                        render={({ field }) => (
                            <MultiSelect
                                options={staffOptions}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map((item: string) => Number(item)))}
                                placeholder='Select Staff'
                            />
                        )}
                    />
                    {errors.staffId && <span className='text-red-500 text-sm'>{errors.staffId.message}</span>}
                </div>
            </div>

            {/* Report Type */}
            <div className='space-y-2'>
                <Label>Report Type</Label>
                <Controller
                    control={control}
                    name='rpttyp'
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-row space-x-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='SAWC' id='SAWC' />
                                <Label htmlFor='SAWC'>Subject Along With Class</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='SNWC' id='SNWC' />
                                <Label htmlFor='SNWC'>Subject Not With Class</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            <div className='flex justify-center space-x-4'>
                <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                    {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleCancelClick} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
