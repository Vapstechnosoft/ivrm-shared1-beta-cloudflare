'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { usePS8MonthWiseReportStJames } from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveAs } from 'file-saver';
import { Download, Loader2, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface PS8MonthWiseReportFormValues {
    year: number | undefined;
}

const PS8MonthWiseReportFormSchema = z.object({
    year: z.number().min(1, 'Year is required')
});

const mockData = [
    {
        monthId: 1,
        monthName: 'April',
        pensionAmount: 1000
    },
    {
        monthId: 2,
        monthName: 'May',
        pensionAmount: 2000
    },
    {
        monthId: 3,
        monthName: 'June',
        pensionAmount: 3000
    },
    {
        monthId: 4,
        monthName: 'July',
        pensionAmount: 4000
    },
    {
        monthId: 5,
        monthName: 'August',
        pensionAmount: 5000
    },
    {
        monthId: 6,
        monthName: 'September',
        pensionAmount: 6000
    },
    {
        monthId: 7,
        monthName: 'October',
        pensionAmount: 7000
    },
    {
        monthId: 8,
        monthName: 'November',
        pensionAmount: 8000
    },
    {
        monthId: 9,
        monthName: 'December',
        pensionAmount: 9000
    },
    {
        monthId: 10,
        monthName: 'January',
        pensionAmount: 10000
    },
    {
        monthId: 11,
        monthName: 'February',
        pensionAmount: 11000
    },
    {
        monthId: 12,
        monthName: 'March',
        pensionAmount: 12000
    }
];

export default function PS8MonthWiseReportStjames() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const { data: yearsData } = useLeaveYearDropdown();
    const { mutateAsync: getPS8MonthWiseReportData, isPending: isLoading } = usePS8MonthWiseReportStJames();
    const {
        reset,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<PS8MonthWiseReportFormValues>({
        resolver: zodResolver(PS8MonthWiseReportFormSchema),
        defaultValues: {
            year: undefined
        }
    });

    const onSubmit = async (data: PS8MonthWiseReportFormValues) => {
        const year = yearsData?.data?.find((year: any) => year.hrmlY_Id === data.year)?.hrmlY_LeaveYear;
        setCurrentYear(Number(year));
        console.log('Form submitted with data:', year);
        try {
            const payload = {
                flag: 'MonthWise',
                year: Number(year)
            };
            const response = await getPS8MonthWiseReportData(payload);
            if (response.success && response.data && response.data.length > 0) {
                // Note: The response data itself seems to be the array based on the provided sample,
                // but if it's nested under another property, adjust accordingly.
                setReportData(response.data || []);
                toast.success(response.message || 'Report data fetched successfully');
            } else {
                setReportData([]);
                toast.error(response.message || 'No data found');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while fetching the report data.');
            setReportData([]);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const divToPrint = document.getElementById('printable-report');
        if (divToPrint) {
            const blob = new Blob([divToPrint.outerHTML], {
                type: 'application/vnd.ms-excel;charset=utf-8'
            });
            saveAs(blob, 'Report.xls');
        } else {
            toast.error('Report content not found');
        }
    };

    const handleReset = () => {
        setReportData([]);
        setCurrentYear(null);
        reset({
            year: undefined
        });
    };

    return (
        <>
            <style>
                {`
        @media print {
                body * {
                visibility: hidden;
                }

                #printable-report,
                #printable-report * {
                visibility: visible;
                }

                #printable-report {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                }
            }
        `}
            </style>
            <div className='container min-h-screen space-y-4 p-2 pt-4 md:p-4'>
                <CollapsibleSection
                    title='MONTH WISE REPORT(st.james)'
                    description='Filter the report data by selecting the year.'
                    defaultOpen={true}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='mx-auto w-full rounded-md p-4 md:w-1/2 '>
                            <div>
                                <Label className='mb-2 block font-semibold'>
                                    Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            value={field.value?.toString()}
                                            onValueChange={(value) => field.onChange(Number(value))}>
                                            <SelectTrigger>
                                                {field.value
                                                    ? yearsData?.data?.find((y: any) => y.hrmlY_Id === field.value)?.hrmlY_LeaveYear
                                                    : 'Select Year'}
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
                        <div className='flex justify-center gap-2'>
                            <Button type='submit' className='w-[120px]'>
                                {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4 ' />}{' '}
                                Report
                            </Button>
                            <Button type='button' variant='outline' className='w-[120px]' onClick={handleReset}>
                                <X className='mr-2 h-4 w-4 ' /> Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
                {reportData && reportData.length > 0 && (
                    <CollapsibleSection title='MONTH WISE REPORT(st.james)' defaultOpen={true} className='mt-6 shadow-sm'>
                        <div className='mb-4 flex justify-end gap-2 border-b pb-4 print:hidden'>
                            <Button type='button' variant='destructive' className='w-fit gap-2' onClick={handlePrint}>
                                <Printer className='h-4 w-4' /> Print
                            </Button>
                            <Button type='button' variant='destructive' className='w-fit gap-2' onClick={handleExport}>
                                <Download className='h-4 w-4' /> Export
                            </Button>
                            <Button type='button' variant='outline' className='w-fit' onClick={handleReset}>
                                <X className='h-4 w-4 ' /> Cancel
                            </Button>
                        </div>

                        <div className='space-y-6' id='printable-report'>
                            <div className='text-center'>
                                <h4 className='mb-6 font-bold text-lg'>
                                    Annual Statement For The Currency Period from March {currentYear} To Feb{' '}
                                    {currentYear ? currentYear + 1 : ''}
                                </h4>
                            </div>

                            <div className='mb-6 space-y-1 text-sm'>
                                <p className='mb-1 italic underline'>Name And Address Of the Establishment</p>
                                <p className='font-bold'>St.James School</p>
                                <p className='font-bold'>165, A.J.C.Bose Road, Kolkata 700014</p>
                            </div>

                            <div className='mb-2 text-sm'>
                                <p className='font-bold'>Reconcilliation of Remittances</p>
                            </div>

                            <div className='overflow-x-auto'>
                                <table
                                    className='w-full border-collapse border border-gray-400 text-sm'
                                    border={1}
                                    style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className='bg-slate-100'>
                                            <th className='border border-gray-400 px-4 py-3 text-center font-semibold'>Month</th>
                                            <th className='border border-gray-400 px-4 py-3 text-center font-semibold'>
                                                Contribution to Pension Fund
                                            </th>
                                            <th className='border border-gray-400 px-4 py-3 text-center font-semibold'>
                                                Pension Fund Contributions.Account No.10
                                            </th>
                                            {/* <th className="border border-gray-400 px-4 py-3 text-left font-semibold"></th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row: any, index: number) => (
                                            <tr key={row.monthId || index}>
                                                <td className='border border-gray-400 px-4 py-2 text-center'>{row.monthName}</td>
                                                <td className='border border-gray-400 px-4 py-2 text-center'>{row.pensionAmount ?? 0}</td>
                                                <td></td>
                                                {/* <td></td> */}
                                                {/* {index === 0 && (
                                        <>
                                            <td className="border border-gray-400 px-4 py-2 align-top w-[30%]" rowSpan={reportData.length}>
                                                Certified that the difference between the Figures of total Pension Fund Contribution remitted during the currency period and the total pension Fund Contribution shown under Col.5 is solely due to the rounding of amounts to the nearest Rupee under the rules.
                                            </td>
                                            <td className="border border-gray-400 px-4 py-2 align-top w-[30%]" rowSpan={reportData.length}>
                                                (i)Total Number of contribution cards enclosed (Form 7).<br/><br/>
                                                (ii) Certified that Forms 7 (PS) completed of all the members listed in this statement are enclosed except those already sent during the course of the currency period for the final settlement of the concerned member's account vide 'Remarks' furnished against the names of the respective members above.
                                            </td>
                                        </>
                                    )} */}
                                            </tr>
                                        ))}
                                        <tr className='bg-slate-50 font-bold'>
                                            <td className='border border-gray-400 px-4 py-3 text-center'>Grand Total:</td>
                                            <td className='border border-gray-400 px-4 py-3 text-center'>
                                                {reportData.reduce((acc: number, val: any) => acc + (val.pensionAmount || 0), 0)}
                                            </td>
                                            <td className='border border-gray-400 px-4 py-3 text-right' colSpan={2}>
                                                <div className='mt-8'>
                                                    Signature of the Employer
                                                    <br />
                                                    (with office seal)
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </>
    );
}
