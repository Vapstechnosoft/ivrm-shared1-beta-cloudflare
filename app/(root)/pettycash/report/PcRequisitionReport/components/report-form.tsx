'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UsePcRequisitionReportOrganization } from '@/hooks/pettycash/report/PcRequisitionReport';
import { type UsePcRequisitionReport, UsePcRequisitionReportSchemas } from '@/schemas/pettycash/PcRequisitionReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface SimpleRequisitionReportProps {
    onSearch?: (params: any) => void;
}

// RequisitionReport

export default function SimpleRequisitionReport({ onSearch }: SimpleRequisitionReportProps) {
    const [reportType, setReportType] = useState<'Overall' | 'Particular'>('Overall');

    const {
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<UsePcRequisitionReport>({
        resolver: zodResolver(UsePcRequisitionReportSchemas.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            mI_Id: undefined,
            fromDate: undefined,
            toDate: undefined
        }
    });
    const handleReport = (data: UsePcRequisitionReport) => {
        const payload = {
            mI_Id: data.mI_Id,
            fromDate: data.fromDate ? format(data.fromDate, 'yyyy-MM-dd') : null,
            toDate: data.toDate ? format(data.toDate, 'yyyy-MM-dd') : null,
            reportType: reportType
        };

        console.log('Clean Payload:', payload);

        onSearch?.(payload);
    };
    const {
        data: ReportOrganizationDropDown,
        isLoading: ReportOrganizationdropdownloading,
        error: ReportOrganizationdropdownerror,
        refetchAll: refetchAllReportOrganization
    } = UsePcRequisitionReportOrganization();

    const handleCancel = () => {
        reset({
            mI_Id: undefined,
            fromDate: undefined,
            toDate: undefined
        });

        setReportType('Overall');
    };

    return (
        <div className='fade-in mx-auto w-full animate-in space-y-8 rounded-xl border border-purple-100 bg-white p-8 shadow-sm duration-500'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                {/* Organization */}
                <div className='space-y-3'>
                    <Label>
                        Organization: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='mI_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                key={field.value?.toString() || 'empty'}
                                onValueChange={(value) => {
                                    field.onChange(value ? Number(value) : null);
                                }}
                                value={field.value ? field.value.toString() : ''}
                                disabled={ReportOrganizationdropdownloading || !!ReportOrganizationdropdownerror}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue
                                        placeholder='Select Organization'
                                        className='text-gray-400' // only placeholder is grey
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {ReportOrganizationdropdownloading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading Organizations
                                        </SelectItem>
                                    ) : ReportOrganizationdropdownerror ? (
                                        <SelectItem value='error' disabled>
                                            Error loading Organizations
                                        </SelectItem>
                                    ) : (
                                        (
                                            ReportOrganizationDropDown?.data?.getuserinstitution ||
                                            ReportOrganizationDropDown?.data ||
                                            []
                                        )?.map((item: any) => (
                                            <SelectItem key={item.mI_Id} value={item.mI_Id.toString()}>
                                                {item.mI_Name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.mI_Id && <span className='text-red-500 text-sm'>{errors.mI_Id.message}</span>}
                </div>

                {/* From Date */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900'>
                        Requisition From Date: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fromDate'
                        control={control}
                        render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                    />
                    {errors.fromDate && <span className='text-red-500 text-sm'>{errors.fromDate.message}</span>}
                </div>

                {/* To Date */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900'>
                        Requisition To Date: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='toDate'
                        control={control}
                        render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                    />
                    {errors.toDate && <span className='text-red-500 text-sm'>{errors.toDate.message}</span>}
                </div>
            </div>

            {/* Radio Buttons & Actions */}
            <div className='flex flex-col items-center justify-between gap-6 border-purple-50 border-t pt-4 md:flex-row'>
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900'>Report Type</Label>
                    <div className='flex items-center gap-8 rounded-lg border border-purple-100/50 bg-purple-50/50 p-2 px-4'>
                        <label className='group flex cursor-pointer items-center gap-3 font-medium text-purple-700 text-sm'>
                            <input
                                type='radio'
                                className='h-4 w-4 cursor-pointer accent-purple-600'
                                value='Overall'
                                checked={reportType === 'Overall'}
                                onChange={() => setReportType('Overall')}
                            />
                            Overall
                        </label>

                        <label className='group flex cursor-pointer items-center gap-3 font-medium text-purple-700 text-sm'>
                            <input
                                type='radio'
                                className='h-4 w-4 cursor-pointer accent-purple-600'
                                value='Particular'
                                checked={reportType === 'Particular'}
                                onChange={() => setReportType('Particular')}
                            />
                            Particular
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className='flex w-full items-center gap-4 md:w-auto'>
                    <Button
                        onClick={handleSubmit(handleReport)}
                        className='h-10 rounded-md bg-gradient-to-r from-orange-600 to-orange-700 px-6 text-white hover:from-orange-700 hover:to-orange-800'>
                        <Search className='mr-2 h-4 w-4' />
                        Report
                    </Button>

                    <Button
                        variant='outline'
                        onClick={handleCancel}
                        className='h-10 rounded-md border-orange-200 px-6 text-orange-700 hover:bg-orange-50'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
