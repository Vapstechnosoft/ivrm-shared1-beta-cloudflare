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
    year: z
        .number({
            required_error: 'Year is required',
            invalid_type_error: 'Year is required'
        })
        .min(1, 'Year is required')
});

export default function PS8ReportStjames() {
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
                flag: 'YearWise',
                year: Number(year)
            };
            const response = await getPS8MonthWiseReportData(payload);
            if (response.success) {
                // Note: The response data itself seems to be the array based on the provided sample,
                // but if it's nested under another property, adjust accordingly.
                setReportData(response.data || []);
                toast.success(response.message || 'Report data fetched successfully');
            } else {
                toast.error(response.message);
                setReportData([]);
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while fetching the report data.');
            setReportData([]);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setReportData([]);
        setCurrentYear(null);
        reset({
            year: undefined
        });
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
                <CollapsibleSection title='PS8 FORM REPORT' description='Filter the report data by selecting the year.' defaultOpen={true}>
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
                                            value={field.value?.toString() ?? ''}
                                            onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
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
                    <CollapsibleSection title='PS8 FORM REPORT' defaultOpen={true} className='mt-6 shadow-sm'>
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

                        <div className='space-y-4' id='printable-report'>
                            <div className='text-center'>
                                <h2 className='font-bold text-lg'>FORM NO.8(P.S)</h2>
                                <h4>( FOR EXEMPTED ESTABLISHMENTS ONLY )</h4>
                                <h4>THE EMPLOYEES' FAMILY PENSION SCHEME, 1995</h4>
                                <h4>[PARAGRAPH 20]</h4>
                            </div>

                            <div className='mt-4 flex text-sm'>
                                <p className='mr-2 font-semibold'>Annual Statement for the Currency Period:</p>
                                <p className=''>
                                    From March <span className='mr-2 font-semibold'>{currentYear}</span>
                                </p>
                                <p className=''>
                                    To Feb <span className='mr-2 font-semibold'>{currentYear ? currentYear + 1 : ''}</span>
                                </p>
                            </div>

                            <div className='mt-2 text-sm'>
                                <p className='font-semibold'>Name & Address of the Establishment:</p>
                                <p>St. James School</p>
                                <p>165, A.J.C. Bose Road, Kolkata 700014</p>
                            </div>

                            <div className='flex max-w-xl justify-between'>
                                <p className='font-semibold'>Code No. of the Establishment:</p>
                                <p>WB/19651/P-</p>
                            </div>

                            <div className='mt-4 overflow-x-auto'>
                                <table className='w-full border border-gray-500 text-sm' border={1} style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className='bg-gray-100 text-center'>
                                            <th className='border p-2'>
                                                SL.NO <br />
                                                (1)
                                            </th>
                                            <th className='border p-2'>
                                                Account Number <br />
                                                (2)
                                            </th>
                                            <th className='border p-2'>
                                                Name of the Member <br />
                                                (in block letters)
                                                <br />
                                                (3)
                                            </th>
                                            <th className='border p-2'>
                                                Wages,retaining allown.(if any)
                                                <br />
                                                And D.A.Includ.cash value of food concession
                                                <br />
                                                paid during the currency peroid
                                                <br />
                                                (4)
                                            </th>
                                            <th className='border p-2'>
                                                Contri.to
                                                <br />
                                                Pension Fund 8.33%
                                                <br />
                                                (5)
                                            </th>
                                            <th className='border p-2'>
                                                Remarks
                                                <br />
                                                (6)
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {reportData.map((row: any, index: number) => (
                                            <tr key={row.accNumber}>
                                                <td className='border p-2 text-center'>{index + 1}</td>
                                                <td className='border p-2 text-center'>{row.accNumber}</td>
                                                <td className='border p-2 text-center '>{row.employeeName}</td>
                                                <td className='border p-2 text-center'>{row.sumCondition}</td>
                                                <td className='border p-2 text-center'>{row.pensionAmount}</td>
                                                <td className='border p-2 text-center'></td>
                                            </tr>
                                        ))}
                                    </tbody>

                                    <tfoot>
                                        <tr className='bg-gray-100 font-bold'>
                                            <td colSpan={3} className='border p-2 text-center'>
                                                Total Amount
                                            </td>
                                            <td className='border p-2 text-center'>
                                                {reportData.reduce((acc, val) => acc + (val.sumCondition || 0), 0)}
                                            </td>
                                            <td className='border p-2 text-center'>
                                                {reportData.reduce((acc, val) => acc + (val.pensionAmount || 0), 0)}
                                            </td>
                                            <td className='border p-2 text-center'></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </>
    );
}
