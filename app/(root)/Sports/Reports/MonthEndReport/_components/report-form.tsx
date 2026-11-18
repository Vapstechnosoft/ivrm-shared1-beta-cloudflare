'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonthEndReport } from '@/hooks/sports/useMonthEndReport';
import { type IMonthEndReportData, type MonthEndReportFormSchema, MonthEndReportSchema } from '@/types/sports/reports/month-end-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    setReportData: (data: IMonthEndReportData | null) => void;
    setFormData: (data: MonthEndReportFormSchema | null) => void;
}

export default function ReportForm({ setReportData, setFormData }: ReportFormProps) {
    const { loadData, generateReport } = useMonthEndReport();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<MonthEndReportFormSchema>({
        resolver: zodResolver(MonthEndReportSchema),
        defaultValues: {
            ASMAY_Id: 0,
            month: 0,
            iename: ''
        }
    });

    const onSubmit = (data: MonthEndReportFormSchema) => {
        setFormData(data);
        generateReport.mutate(data, {
            onSuccess: (result) => {
                setReportData(result || null);
                if (result && (result.total_count_student > 0 || result.total_partic_student > 0)) {
                    toast.success('Report generated successfully');
                } else {
                    toast.info('No records found');
                }
            },
            onError: (error) => {
                toast.error('Failed to generate report.');
            }
        });
    };

    const handleClear = () => {
        setValue('ASMAY_Id', 0);
        setValue('month', 0);
        setValue('iename', '');
        setReportData(null);
        setFormData(null);
    };

    return (
        <div className='rounded-md border bg-card p-4 shadow-sm'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h2 className='font-semibold text-lg'>Sports Month End Report</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadData.data?.academicYear.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <p className='font-medium text-destructive text-sm'>{errors.ASMAY_Id.message}</p>}
                    </div>

                    {/* Month */}
                    <div className='space-y-2'>
                        <Label>
                            Month <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='month'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Month' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadData.data?.monthList.map((item) => (
                                            <SelectItem key={item.month} value={item.month.toString()}>
                                                {item.monthname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.month && <p className='font-medium text-destructive text-sm'>{errors.month.message}</p>}
                    </div>

                    {/* Implementation Name */}
                    <div className='space-y-2'>
                        <Label>Implementation Name</Label>
                        <Controller control={control} name='iename' render={({ field }) => <Input {...field} placeholder='Enter Name' />} />
                        {errors.iename && <p className='font-medium text-destructive text-sm'>{errors.iename.message}</p>}
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-4'>
                    <Button type='submit' disabled={generateReport.isPending}>
                        {generateReport.isPending ? 'Generating...' : 'Report'}
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleClear}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
