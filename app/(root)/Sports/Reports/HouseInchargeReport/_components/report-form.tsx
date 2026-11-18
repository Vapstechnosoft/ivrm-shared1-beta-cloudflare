'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHouseInchargeReport } from '@/hooks/sports/useHouseInchargeReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type HouseInchargeReportFormData, houseInchargeReportSchema } from '../schema';
import type { IHouse, IHouseInchargeReportData } from '../types';

interface ReportFormProps {
    onReportGenerated: (data: IHouseInchargeReportData[] | null) => void;
    onReset: () => void;
}

export default function ReportForm({ onReportGenerated, onReset }: ReportFormProps) {
    const { initialData, houseMutation, reportMutation } = useHouseInchargeReport();
    const [houseList, setHouseList] = useState<IHouse[]>([]);

    const form = useForm<HouseInchargeReportFormData>({
        resolver: zodResolver(houseInchargeReportSchema),
        defaultValues: {
            asmaY_Id: undefined,
            selectedhouselist: []
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    const watchedYear = form.watch('asmaY_Id');

    // Fetch houses when year changes
    useEffect(() => {
        if (watchedYear) {
            houseMutation.mutate(watchedYear, {
                onSuccess: (data) => {
                    setHouseList(data.houseList || []);
                    form.setValue('selectedhouselist', []);
                }
            });
        } else {
            setHouseList([]);
            form.setValue('selectedhouselist', []);
        }
    }, [watchedYear]);

    function onSubmit(data: HouseInchargeReportFormData) {
        const payload = {
            asmaY_Id: data.asmaY_Id,
            selectedhouselist: data.selectedhouselist.map((id) => ({ spccmH_Id: id }))
        };

        reportMutation.mutate(payload, {
            onSuccess: (responseData) => {
                onReportGenerated(responseData);
                if (responseData && responseData.length > 0) {
                    toast.success('Report generated successfully');
                } else {
                    toast.info('No records found');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
            }
        });
    }

    const handleReset = () => {
        form.reset();
        setHouseList([]);
        onReset();
        window.location.reload();
    };

    return (
        <Card>
            <CardHeader className='border-b bg-primary/5 py-4'>
                <CardTitle className='flex items-center gap-2 font-bold text-lg'>
                    <FileText className='h-5 w-5 text-primary' />
                    House Incharge Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {/* Academic Year */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                    Academic Year
                                </Label>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={initialData.isLoading}>
                                                <SelectTrigger className={errors.asmaY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData.data?.asmay_list?.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.asmaY_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.asmaY_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* House Multi-select */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">House</Label>
                                <Controller
                                    control={control}
                                    name='selectedhouselist'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <MultiSelect
                                                options={houseList.map((h) => ({
                                                    value: h.spccmH_Id.toString(),
                                                    label: h.spccmH_HouseName
                                                }))}
                                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                defaultValue={field.value?.map(String) || []}
                                                placeholder='Select Houses'
                                                disabled={!watchedYear || houseMutation.isPending}
                                                className={errors.selectedhouselist ? 'border-destructive ring-destructive/20' : ''}
                                            />
                                            {errors.selectedhouselist && (
                                                <span className='font-medium text-destructive text-xs'>
                                                    {errors.selectedhouselist.message}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Buttons */}
                            <div className='flex gap-4'>
                                <Button
                                    type='submit'
                                    className='flex-1 font-bold shadow-md transition-all hover:shadow-lg'
                                    disabled={reportMutation.isPending}>
                                    {reportMutation.isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <FileText className='mr-2 h-4 w-4' />
                                    )}
                                    Report
                                </Button>
                                <Button type='button' variant='outline' onClick={handleReset} className='border-2 px-6 hover:bg-muted'>
                                    <RefreshCcw className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
