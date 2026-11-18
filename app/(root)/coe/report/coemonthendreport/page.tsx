'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { coeMonthEndReportSchema } from '@/schemas/coe/master';
import { getCoeMonthEndReport, getCoeMonthEndReportResult } from '@/server/coe/masters/report';
import { zodResolver } from '@hookform/resolvers/zod';
import xlsx, { type IJsonSheet } from 'json-as-xlsx';
import { FileSpreadsheet, Loader2, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CoeMonthEndReportPrint } from './_components/coe-month-end-report-print';

type FormFields = z.infer<typeof coeMonthEndReportSchema.addOrUpdate>;

export default function CoeMonthEndReport() {
    const componentRef = useRef<HTMLDivElement>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const {
        handleSubmit,
        reset,
        control,
        register,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(coeMonthEndReportSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: undefined,
            month: undefined
        }
    });

    const ieName = watch('ieName');

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const [initialData, setInitialData] = useState<any>({ year: [], month: [] });
    const [loadingInitial, setLoadingInitial] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getCoeMonthEndReport({ MI_Id: 2 });
                console.log('Initial Data:', response);

                if (response) {
                    const dataObj = response.data || response;

                    const yearData =
                        dataObj.year?.$values ||
                        dataObj.year ||
                        dataObj.yearlist?.$values ||
                        dataObj.yearlist ||
                        dataObj.academicYear?.$values ||
                        dataObj.academicYear ||
                        [];
                    const monthData = dataObj.month?.$values || dataObj.month || dataObj.monthlist?.$values || dataObj.monthlist || [];

                    setInitialData({
                        year: yearData,
                        month: monthData
                    });
                }
            } catch (error) {
                console.error('Failed to load initial data', error);
            } finally {
                setLoadingInitial(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleReset = () => {
        reset();
        setReportData(null);
        setSelectedYear('');
        setSelectedMonth('');
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'COE_Month_End_Report'
    });

    const handleExport = () => {
        if (!reportData) return;

        const data = [
            {
                sheet: 'COE Report',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Event Name', value: 'eventName' },
                    { label: 'Event Description', value: 'eventDesc' },
                    { label: 'Event Start Date', value: 'startDate' },
                    { label: 'Event End Date', value: 'endDate' }
                ],
                content: (reportData || []).map((row: any, idx: number) => ({
                    slNo: idx + 1,
                    eventName: row.eventName || 'NA',
                    eventDesc: row.eventDesc || 'NA',
                    startDate: row.coeE_EStartDate ? new Date(row.coeE_EStartDate).toISOString().slice(0, 10) : 'NA',
                    endDate: row.coeE_EEndDate ? new Date(row.coeE_EEndDate).toISOString().slice(0, 10) : 'NA'
                }))
            }
        ] as IJsonSheet[];

        const settings = {
            fileName: 'COE_Month_End_Report',
            extraLength: 3,
            writeMode: 'writeFile',
            writeOptions: {},
            RTL: false
        };

        xlsx(data, settings);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportData(null);
        try {
            if (!data.month) {
                toast.error('Month is required');
                return;
            }
            const payload = {
                Monthid: Number(data.month ?? 0) ?? 0,
                ASMAY_Id: data.asmaY_Id ?? 0
            };

            const selectedYearObj = initialData.year?.find((y: any) => String(y.asmaY_Id || y.hrmlY_Id) === String(data.asmaY_Id));
            setSelectedYear(selectedYearObj?.asmaY_Year || selectedYearObj?.hrmlY_LeaveYear || '');

            const selectedMonthObj = months.find((m) => m.value === data.month);
            setSelectedMonth(selectedMonthObj?.label || '');

            const response = await getCoeMonthEndReportResult(payload);

            if (response.data?.coereport && response.data.coereport.length > 0) {
                setReportData(response.data.coereport);
                toast.success('Report fetched successfully');
            } else {
                setReportData(null);
                toast.error('No data found');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const today = new Date();

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='flex flex-col items-center justify-center space-y-6 p-6'>
                            {/* Academic Year */}
                            <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                <Label htmlFor='asmaY_Id' className='whitespace-nowrap font-semibold'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value || 'empty'}
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                            }}
                                            value={
                                                typeof field.value === 'number' || typeof field.value === 'string'
                                                    ? String(field.value)
                                                    : ''
                                            }>
                                            <SelectTrigger className='w-64'>
                                                <SelectValue placeholder='--Select Academic Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingInitial ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    initialData.year?.map((item: any) => (
                                                        <SelectItem
                                                            key={item.hrmlY_Id || item.asmaY_Id}
                                                            value={String(item.hrmlY_Id || item.asmaY_Id)}>
                                                            {item.hrmlY_LeaveYear || item.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            {errors.asmaY_Id && (
                                <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                    <div className='w-[145px]'> </div>
                                    <FormError>{errors.asmaY_Id.message}</FormError>
                                </div>
                            )}

                            {/* Month Selection */}
                            <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                <Label htmlFor='month' className='whitespace-nowrap font-semibold'>
                                    Month <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='month'
                                    control={control}
                                    render={({ field }) => (
                                        <Select key={field.value || 'empty'} onValueChange={field.onChange} value={field.value || ''}>
                                            <SelectTrigger className='w-64'>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialData.month?.length > 0
                                                    ? initialData.month.map((item: any) => (
                                                          <SelectItem key={item.monthid} value={String(item.monthid).padStart(2, '0')}>
                                                              {item.monthname}
                                                          </SelectItem>
                                                      ))
                                                    : months?.map((item) => (
                                                          <SelectItem key={item.value} value={String(item.value)}>
                                                              {item.label}
                                                          </SelectItem>
                                                      ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                <Label htmlFor='ieName' className='whitespace-nowrap font-semibold'>
                                    IE Name
                                </Label>
                                <InputText
                                    id='ieName'
                                    placeholder='Enter Name'
                                    {...register('ieName')}
                                    error={errors.ieName?.message}
                                    className='w-64 transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex w-full max-w-md justify-center gap-4 pt-4'>
                                <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                                    {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Report'}
                                </Button>
                                <Button type='button' variant='destructive' onClick={handleReset} className='min-w-[120px]'>
                                    Clear
                                </Button>
                                {reportData && (
                                    <>
                                        <Button
                                            type='button'
                                            onClick={handleExport}
                                            className='min-w-[120px] bg-green-600 hover:bg-green-700'>
                                            <FileSpreadsheet className='mr-2 h-4 w-4' /> Export
                                        </Button>
                                        <Button
                                            type='button'
                                            onClick={() => handlePrint()}
                                            className='min-w-[120px] bg-blue-600 hover:bg-blue-700'>
                                            <Printer className='mr-2 h-4 w-4' /> Print
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Report Content */}
                    {reportData && (
                        <Card className='mt-8 border-0 p-8 shadow-xl'>
                            <div className='flex flex-col gap-6'>
                                {/* Header */}
                                <div className='space-y-2 text-center'>
                                    <div className='mb-4 flex justify-center'></div>
                                    <h2 className='font-bold text-2xl uppercase underline decoration-2 underline-offset-4'>COE Report</h2>
                                    <div className='mt-2 inline-block min-w-[300px] border border-black p-2'>
                                        <h3 className='text-center font-semibold uppercase'>COE {selectedMonth} MONTH REPORT</h3>
                                    </div>
                                </div>

                                {/* Info Table */}
                                <div className='mx-auto grid w-full max-w-3xl grid-cols-2 gap-x-12 gap-y-4'>
                                    <div className='flex justify-center gap-4 pb-1'>
                                        <span className='font-semibold'>Name:</span>
                                        <span>
                                            {ieName ||
                                                (Array.isArray(reportData) && reportData.length > 0 ? reportData[0].ieName : undefined) ||
                                                '_________________'}
                                        </span>
                                    </div>
                                    <div className='flex justify-center gap-4 pb-1'>
                                        <span className='font-semibold'>Date:</span>
                                        <span>{today.toLocaleDateString()}</span>
                                    </div>
                                    <div className='flex justify-center gap-4 pb-1'>
                                        <span className='font-semibold'>Designation:</span>
                                        <span>
                                            {(Array.isArray(reportData) && reportData.length > 0 ? reportData[0].designation : undefined) ||
                                                'Implementation Engineer'}
                                        </span>
                                    </div>
                                    <div className='flex justify-center gap-4 pb-1'>
                                        <span className='font-semibold'>Academic Year:</span>
                                        <span>{selectedYear}</span>
                                    </div>
                                    <div className='col-span-2 flex justify-center gap-4 pb-1'>
                                        <span className='font-semibold'>Module:</span>
                                        <span>COE</span>
                                    </div>
                                </div>

                                {/* Data Table */}
                                <div className='mt-6'>
                                    <table className='w-full border-collapse border border-black'>
                                        <thead>
                                            <tr className='bg-gray-100'>
                                                <th className='border border-black p-2 text-center'>SL.NO</th>
                                                <th className='border border-black p-2 text-left'>Event Name</th>
                                                <th className='border border-black p-2 text-left'>Event Description</th>
                                                <th className='border border-black p-2 text-center'>Start Date</th>
                                                <th className='border border-black p-2 text-center'>End Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(reportData) &&
                                                reportData.map((row: any, index: number) => (
                                                    <tr key={index}>
                                                        <td className='border border-black p-2 text-center'>{index + 1}</td>
                                                        <td className='border border-black p-2 text-left'>{row.eventName || 'NA'}</td>
                                                        <td className='border border-black p-2 text-left'>{row.eventDesc || 'NA'}</td>
                                                        <td className='border border-black p-2 text-center'>
                                                            {row.coeE_EStartDate
                                                                ? new Date(row.coeE_EStartDate).toISOString().slice(0, 10)
                                                                : 'NA'}
                                                        </td>
                                                        <td className='border border-black p-2 text-center'>
                                                            {row.coeE_EEndDate
                                                                ? new Date(row.coeE_EEndDate).toISOString().slice(0, 10)
                                                                : 'NA'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {(!Array.isArray(reportData) || reportData.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className='border border-black p-4 text-center font-bold text-red-600'>
                                                        No records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer Signatures */}
                                <div className='mt-16 space-y-12'>
                                    <div className='flex justify-between px-12'>
                                        <div className='text-left'>Implementation Engineer: ________________</div>
                                        <div className='text-right'>Nodal Officer: ________________</div>
                                    </div>
                                    <div className='flex justify-between px-12'>
                                        <div className='text-left'>End User: ________________</div>
                                        <div className='text-right'>Seal: ________________</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Hidden Print Wrapper */}
                    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
                        <CoeMonthEndReportPrint
                            ref={componentRef}
                            reportData={reportData}
                            selectedYear={selectedYear}
                            selectedMonth={selectedMonth}
                            ieName={ieName}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
