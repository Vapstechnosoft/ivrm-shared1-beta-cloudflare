'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { useEmployeePunchAttendanceReport } from '@/hooks/staff-portal/useEmployeePunchAttendance';
import type { IEmployeeDetails } from '@/types/staff-portal/biometric-report/employee-punch-attendance.types';

interface EmployeePunchAttendanceFilterProps {
    employeeDetails: IEmployeeDetails | null;
    setReportData: (data: any) => void;
}

const formSchema = z.object({
    fromdate: z.string().min(1, 'From date is required.'),
    todate: z.string().min(1, 'To date is required.')
});

type EmployeePunchAttendanceFormValues = z.infer<typeof formSchema>;

export const EmployeePunchAttendanceFilter = ({ employeeDetails, setReportData }: EmployeePunchAttendanceFilterProps) => {
    const { getReport, isLoading } = useEmployeePunchAttendanceReport();

    const form = useForm<EmployeePunchAttendanceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fromdate: '',
            todate: ''
        }
    });

    console.log('employeeDetails', employeeDetails);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors }
    } = form;

    console.log('form errors', errors);

    const onReportSubmit = async (values: EmployeePunchAttendanceFormValues) => {
        const payload = {
            fromdate: format(new Date(values.fromdate), 'yyyy-MM-dd'),
            todate: format(new Date(values.todate), 'yyyy-MM-dd')
        };
        console.log('payload', payload);

        const response = await getReport(payload);
        console.log('response', response);

        if (response.success && response.data && response.data.length > 0) {
            setReportData(response.data);
            toast.success('Report fetched successfully');
        } else {
            setReportData([]);
            toast.error('No Record Found');
        }
    };

    const fromDate = watch('fromdate');

    return (
        <div className='w-full rounded-lg border bg-white p-4 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
                <h3 className='font-semibold text-gray-800 text-lg'>EMPLOYEE PUNCH REPORT</h3>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onReportSubmit)} className='space-y-6'>
                    {/* Employee Details */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex flex-row items-center gap-2'>
                                <label className='w-1/3 text-right font-medium text-gray-700 text-sm'>Employee Name:</label>

                                <div className='w-2/3 rounded border border-gray-200 bg-gray-50 p-2 text-sm'>
                                    {employeeDetails
                                        ? `${employeeDetails.empFname} ${employeeDetails.empMname || ''} ${employeeDetails.empLname || ''}`
                                        : 'Loading...'}
                                </div>
                            </div>

                            <div className='flex flex-row items-center gap-2'>
                                <label className='w-1/3 text-right font-medium text-gray-700 text-sm'>Designation:</label>

                                <div className='w-2/3 rounded border border-gray-200 bg-gray-50 p-2 text-sm'>
                                    {employeeDetails?.hrmdeS_DesignationName || 'Loading...'}
                                </div>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex flex-row items-center gap-2'>
                                <label className='w-1/3 text-right font-medium text-gray-700 text-sm'>Department:</label>

                                <div className='w-2/3 rounded border border-gray-200 bg-gray-50 p-2 text-sm'>
                                    {employeeDetails?.hrmD_DepartmentName || 'Loading...'}
                                </div>
                            </div>

                            <div className='flex flex-row items-center gap-2'>
                                <label className='w-1/3 text-right font-medium text-gray-700 text-sm'>DOJ:</label>

                                <div className='w-2/3 rounded border border-gray-200 bg-gray-50 p-2 text-sm'>
                                    {employeeDetails?.hrmE_DOJ ? format(new Date(employeeDetails.hrmE_DOJ), 'dd-MM-yyyy') : 'Loading...'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
                        {/* From Date */}
                        <div className='col-span-1'>
                            <div className='flex items-start gap-3'>
                                <Label className='w-1/3 pt-2 text-right font-medium text-gray-700 text-sm'>
                                    From Date
                                    <span className='ml-1 text-red-500'>*</span>
                                </Label>

                                <div className='w-2/3'>
                                    <Controller
                                        name='fromdate'
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value ? new Date(field.value) : undefined}
                                                setDate={(date) => {
                                                    if (date) {
                                                        const year = date.getFullYear();
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const day = String(date.getDate()).padStart(2, '0');

                                                        field.onChange(`${year}-${month}-${day}`);
                                                    } else {
                                                        field.onChange('');
                                                        // setValue('todate', '');
                                                    }
                                                }}
                                                placeholder='From date'
                                                className={errors.fromdate ? 'w-full border-red-500' : 'w-full'}
                                                disabled={[{ after: new Date() }]}
                                            />
                                        )}
                                    />

                                    {errors.fromdate && <FormError className='mt-1'>{errors.fromdate.message}</FormError>}
                                </div>
                            </div>
                        </div>

                        {/* To Date */}
                        <div className='col-span-1'>
                            <div className='flex items-start gap-3'>
                                <Label className='w-1/3 pt-2 text-right font-medium text-gray-700 text-sm'>
                                    To Date
                                    <span className='ml-1 text-red-500'>*</span>
                                </Label>

                                <div className='w-2/3'>
                                    <Controller
                                        name='todate'
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value ? new Date(field.value) : undefined}
                                                setDate={(date) => {
                                                    if (date) {
                                                        const year = date.getFullYear();
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const day = String(date.getDate()).padStart(2, '0');

                                                        field.onChange(`${year}-${month}-${day}`);
                                                    } else {
                                                        field.onChange('');
                                                    }
                                                }}
                                                placeholder='To date'
                                                className={errors.todate ? 'w-full border-red-500' : 'w-full'}
                                                disabled={
                                                    fromDate
                                                        ? [
                                                              {
                                                                  before: new Date(fromDate)
                                                              },
                                                              { after: new Date() }
                                                          ]
                                                        : [{ after: new Date() }]
                                                }
                                            />
                                        )}
                                    />

                                    {errors.todate && <FormError className='mt-1'>{errors.todate.message}</FormError>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className='flex justify-center pt-4'>
                        <Button type='submit' disabled={isLoading} className='w-32'>
                            {isLoading ? (
                                'Checking...'
                            ) : (
                                <>
                                    <Search className='mr-2 h-4 w-4' />
                                    Check
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
