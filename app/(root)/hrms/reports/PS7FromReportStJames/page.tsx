'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { usePS7ReportData, usePS7ReportEmployees } from '@/hooks/hrms/useReports';
import type { PS7ReportDataRequest } from '@/server/hrms/reports/PS7FromReportStJames';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search as SearchIcon, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PS7ReportDisplay } from './_components/ps7-report-display';

interface FilterFormValues {
    hreme_Ids: string[];
    year: number;
}

const PS7ReportSchema = z.object({
    hreme_Ids: z.array(z.string()).min(1, 'Employee is required'),
    year: z.number().min(1, 'Year is required')
});

export default function PS7FromReportStJames() {
    const [reportedData, setReportData] = useState<any>(null);
    const [resetkey, setResetKey] = useState(0);
    const [selectedYear, setSelectedYear] = useState<string>('');

    const { data: yearsData } = useLeaveYearDropdown();
    const { data: employeesData } = usePS7ReportEmployees();
    const { mutateAsync: getPS7ReportData, isPending: isLoading } = usePS7ReportData();

    console.log('Employees Data for PS7 Report:', employeesData);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<FilterFormValues>({
        resolver: zodResolver(PS7ReportSchema),
        defaultValues: {
            hreme_Ids: [],
            year: 0
        }
    });

    const onSubmit = async (data: FilterFormValues) => {
        const year = yearsData?.data?.find((year: any) => year.hrmlY_Id === data.year)?.hrmlY_LeaveYear;
        setSelectedYear(year || '');
        const hrmE_Ids = data.hreme_Ids.join(',');
        const requestData: PS7ReportDataRequest = {
            hrmE_Ids,
            year: Number(year)
        };
        const response = await getPS7ReportData(requestData);
        if (response.success && response.data) {
            if (response.data && response.data.employeeDetails && response.data.employeeDetails.length > 0) {
                setReportData(response.data);
            } else {
                setReportData(null);
                toast.info('No data found');
            }
        } else {
            setReportData(null);
            toast.error(response.message || 'Failed to fetch report data');
        }
    };

    const formateEmployees = useMemo(() => {
        return (
            employeesData?.data?.map((employee: any) => ({
                label: employee.employeeFullName || 'Unknown Employee',
                value: employee.hrmE_Id.toString()
            })) || []
        );
    }, [employeesData]);

    console.log('Formatted Employees for MultiSelect:', formateEmployees);

    const handleReset = () => {
        reset();
        setReportData(null);
        setResetKey((prev) => prev + 1);
    };

    const isDisabled = formateEmployees.length === 0;

    return (
        <div className='container min-h-screen space-y-4 p-2 pt-4'>
            <CollapsibleSection title='PS7 From Report' defaultOpen={true} variant='outline'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className=''>
                        <div className='rounded-md p-4'>
                            <div>
                                <Label className='mb-2 block font-semibold'>
                                    Select Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetkey}
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            value={field.value?.toString()}
                                            onValueChange={(value) => field.onChange(Number(value))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearsData?.data?.map((year: any) => (
                                                    <SelectItem key={year.hrmlY_Id} value={year.hrmlY_Id.toString()}>
                                                        {year.hrmlY_LeaveYear}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.year && <FormError>{errors.year.message}</FormError>}
                            </div>
                        </div>
                        <div className='rounded-md p-4'>
                            <div>
                                <Label className='mb-2 block font-semibold'>
                                    Select Employee <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetkey}
                                    name='hreme_Ids'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={formateEmployees}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Select Employees'
                                            className={`min-h-9 `}
                                            disabled={isDisabled}
                                        />
                                    )}
                                />
                                {errors.hreme_Ids && <FormError>{errors.hreme_Ids.message}</FormError>}
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-4 p-4'>
                        <Button type='submit' className='w-fit' disabled={isLoading}>
                            {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <SearchIcon className='h-4 w-4' />}
                            Generate Report
                        </Button>
                        <Button type='button' variant='outline' className='w-fit' onClick={handleReset}>
                            <X className='h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportedData && reportedData?.employeeDetails?.length > 0 && (
                <CollapsibleSection title='PS7 From Report' defaultOpen={true} variant='outline'>
                    {
                        <div className='fade-in slide-in-from-bottom-4 animate-in duration-500'>
                            <PS7ReportDisplay data={reportedData} year={selectedYear} />
                        </div>
                    }
                </CollapsibleSection>
            )}
        </div>
    );
}
