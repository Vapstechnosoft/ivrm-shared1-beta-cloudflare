'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    // API from hooks
    staffwiseWorkingHoursReportDetails,
    staffwiseWorkingHoursStaffData
} from '@/hooks/timetable/reports';
import { useTimeTableAcademicYear } from '@/hooks/timetable/useMasters';
import { staffWiseWorkingHoursReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof staffWiseWorkingHoursReportSchema.search>;

interface StaffWiseWorkingHoursFormProps {
    onReportGenerated: (response: any, payload: any) => void;
    onCancel: () => void;
}

export default function StaffWiseWorkingHoursForm({ onReportGenerated, onCancel }: StaffWiseWorkingHoursFormProps) {
    const reportMutation = staffwiseWorkingHoursReportDetails();
    const { mutateAsync: generateReport, isPending: isReportGenerating } = reportMutation;

    const [resetKey, setResetKey] = useState(0);

    const { data: academicyeardata } = useTimeTableAcademicYear();
    const { data: staffData, isLoading: isLoadingStaff } = staffwiseWorkingHoursStaffData();

    const academicList = useMemo(() => {
        const data = (academicyeardata as any)?.data ?? academicyeardata;
        const list = Array.isArray(data) ? data : ((data as any)?.$values ?? (data as any)?.academicyearlist ?? []);
        return Array.isArray(list) ? list : [];
    }, [academicyeardata]);

    const staffList: any[] = staffData || [];

    const staffOptions = useMemo(() => {
        const uniqueMap = new Map();

        staffList.forEach((s: any) => {
            const id = s.hrmE_Id ?? s.HRME_Id ?? s.staffId;
            if (id && !uniqueMap.has(id)) {
                uniqueMap.set(id, s);
            }
        });

        return Array.from(uniqueMap.values()).map((s: any) => ({
            label: (s.staffName ?? s.staffname ?? s.hrmE_EmployeeName ?? s.empName ?? '').toString().trim(),
            value: (s.hrmE_Id ?? s.HRME_Id).toString()
        }));
    }, [staffList]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(staffWiseWorkingHoursReportSchema.search),
        defaultValues: {
            hrmE_Id: [],
            asmaY_Id: undefined
        }
    });

    const onFormSubmit = async (data: FormFields) => {
        try {
            const selectedStaffObjects =
                data.hrmE_Id?.map((id) => {
                    const s = staffOptions.find((opt) => opt.value === id.toString());
                    return {
                        hrmE_Id: id,
                        staffName: s?.label || ''
                    };
                }) || [];

            // Payload required by backend report endpoint
            const reportPayload = {
                asmaY_Id: data.asmaY_Id,
                staffarray: selectedStaffObjects.map((s) => ({ hrmE_Id: s.hrmE_Id }))
            };

            const response = await generateReport(reportPayload);

            onReportGenerated(response, {
                asmaY_Id: data.asmaY_Id,
                staffarray: selectedStaffObjects
            });
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    const handleCancelClick = () => {
        reset({
            asmaY_Id: undefined,
            hrmE_Id: []
        });
        setResetKey((prev) => prev + 1);
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select
                                key={`academic-year-${resetKey}`}
                                value={field.value ? field.value.toString() : undefined}
                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicList.map((item: any) => (
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
                    <Label>
                        Staff Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='hrmE_Id'
                        render={({ field }) => (
                            <MultiSelect
                                key={`staff-select-${resetKey}`}
                                options={staffOptions}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map((v: string) => Number(v)))}
                                placeholder='Select Staff'
                            />
                        )}
                    />
                    {errors.hrmE_Id && <span className='text-red-500 text-sm'>{errors.hrmE_Id.message}</span>}
                </div>
            </div>

            {/* Buttons */}
            <div className='flex justify-center space-x-4'>
                <Button type='submit' disabled={isSubmitting || isReportGenerating}>
                    {(isSubmitting || isReportGenerating) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>

                <Button type='button' variant='outline' onClick={handleCancelClick}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
