'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateField } from '@/components/ui/dateField';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type ConfirmReportValues, confirmReportSchema } from '@/schemas/hostel/reports/confirm-report.schema';
import { type ConfirmReportDto, getConfirmReport } from '@/server/hostel/hostel-management/reports/confirm-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileText, Loader2, Minus, Printer, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ConfirmReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'student' | 'staff'>('student');
    const [currentDate] = useState(new Date());

    const form = useForm<ConfirmReportValues>({
        resolver: zodResolver(confirmReportSchema),
        defaultValues: {
            type: 'student',
            fromDate: new Date(),
            toDate: new Date()
        }
    });

    async function onSubmit(values: ConfirmReportValues) {
        setLoading(true);
        setType(values.type);
        try {
            const data: ConfirmReportDto = await getConfirmReport(values);
            if (data?.grid_list) {
                setReportData(data.grid_list);
                if (data.grid_list.length === 0) {
                    toast.info('No data found for selected criteria');
                }
            } else {
                setReportData([]);
                toast.info('No data found for selected criteria');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch report');
        } finally {
            setLoading(false);
        }
    }

    const handlePrint = () => {
        if (!reportData || reportData.length === 0) return;

        const tableContent = document.getElementById('reportTable');
        const fromDate = form.getValues('fromDate');
        const toDate = form.getValues('toDate');

        if (tableContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>Hostel Confirm Report</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; padding: 20px; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .school-name { font-size: 24px; font-weight: bold; color: #2e57a0; margin: 0; }
                                .report-title { font-size: 18px; font-weight: bold; margin-top: 10px; }
                                .dates { font-size: 14px; margin-top: 5px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; font-weight: bold; }
                                .text-center { text-align: center; }
                            </style>
                        </head>
                        <body onload="window.print(); window.close();">
                            <div class="header">
                                <h1 class="school-name">Hostel Confirm Report</h1>
                                <div class="report-title">Confirmation Details</div>
                                <div class="dates">
                                    From: ${format(fromDate, 'dd/MM/yyyy')} To: ${format(toDate, 'dd/MM/yyyy')}
                                </div>
                            </div>
                            ${tableContent.outerHTML}
                            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
                                <div>Signature</div>
                                <div>Date: ${format(currentDate, 'dd/MM/yyyy')}</div>
                            </div>
                        </body>
                    </html>
                `);
                popupWindow.document.close();
            }
        }
    };

    return (
        <div className='flex-col'>
            <div className='flex items-center justify-end bg-gray-100/50 px-8 py-2 font-medium text-[10px] text-gray-500'>
                <span>Report &gt; ConfirmReport</span>
            </div>
            <div className='min-h-screen flex-1 space-y-4 bg-slate-50/50 p-8 pt-4'>
                <Heading title='Confirm Report' description='View and generate hostel confirmation reports.' />

                <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                    <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
                        <CardHeader className='flex flex-row items-center justify-between border-b bg-white px-4 py-2'>
                            <CardTitle className='font-bold text-[#4255a7] text-sm uppercase tracking-wider'>
                                HOSTEL STUDENT AND STAFF CONFIRM REPORT
                            </CardTitle>
                            <Minus className='h-4 w-4 cursor-pointer text-gray-400' />
                        </CardHeader>
                        <CardContent className='p-0'>
                            <FormProvider {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-0'>
                                    {/* Type Selection Bar */}
                                    <div className='flex justify-center border-b bg-gray-50/50 p-4'>
                                        <Controller
                                            control={form.control}
                                            name='type'
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-12'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='student' id='student' />
                                                        <Label htmlFor='student' className='cursor-pointer font-bold text-xs uppercase'>
                                                            Student
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='staff' id='staff' />
                                                        <Label htmlFor='staff' className='cursor-pointer font-bold text-xs uppercase'>
                                                            Staff
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {/* Form Body */}
                                    <div className='p-8'>
                                        <div className='mx-auto grid max-w-3xl grid-cols-1 gap-x-20 gap-y-1 md:grid-cols-2'>
                                            <div className='flex items-center py-1'>
                                                <Label className='w-40 text-left font-medium text-gray-700'>
                                                    From Date:<span className='text-red-500'>*</span>
                                                </Label>
                                                <span className='mr-4 text-gray-500'>:</span>
                                                <div className='flex-1'>
                                                    <Controller
                                                        control={form.control}
                                                        name='fromDate'
                                                        render={({ field, fieldState }) => (
                                                            <DateField
                                                                field={field}
                                                                fieldState={fieldState}
                                                                label=''
                                                                placeholder='Select date'
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className='flex items-center py-1'>
                                                <Label className='w-40 text-left font-medium text-gray-700'>
                                                    To Date:<span className='text-red-500'>*</span>
                                                </Label>
                                                <span className='mr-4 text-gray-500'>:</span>
                                                <div className='flex-1'>
                                                    <Controller
                                                        control={form.control}
                                                        name='toDate'
                                                        render={({ field, fieldState }) => (
                                                            <DateField
                                                                field={field}
                                                                fieldState={fieldState}
                                                                label=''
                                                                placeholder='Select date'
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Row */}
                                        <div className='mt-12 flex items-center justify-center gap-4'>
                                            <Button
                                                type='submit'
                                                disabled={loading}
                                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                                {loading ? (
                                                    <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                                                ) : (
                                                    <FileText className='mr-2 h-3 w-3' />
                                                )}
                                                REPORT
                                            </Button>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                onClick={() => {
                                                    form.reset();
                                                    setReportData([]);
                                                }}
                                                className='w-32 rounded-md border-none bg-[#ff5c33] font-bold text-white text-xs uppercase shadow-md hover:bg-[#e64d26]'>
                                                <XCircle className='mr-2 h-3 w-3' />
                                                CANCEL
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </div>

                {reportData.length > 0 && (
                    <Card className='fade-in slide-in-from-top-4 animate-in border-t-4 border-t-[#4255a7] shadow-md duration-700'>
                        <CardHeader className='flex flex-row items-center justify-between bg-[#4255a7] px-4 py-1'>
                            <CardTitle className='font-bold text-[11px] text-white uppercase tracking-wider'>REPORT DETAILS</CardTitle>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handlePrint}
                                    className='h-6 text-[10px] text-white hover:bg-white/20'>
                                    <Printer className='mr-1 h-3 w-3' /> PRINT
                                </Button>
                                <Minus className='h-3 w-3 cursor-pointer text-white opacity-70' />
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <div className='overflow-x-auto'>
                                <Table id='reportTable'>
                                    <TableHeader className='bg-gray-50'>
                                        <TableRow>
                                            <TableHead className='w-[80px] font-bold text-gray-700'>SL.No.</TableHead>
                                            <TableHead className='font-bold text-gray-700'>
                                                {type === 'student' ? 'Student Name' : 'Staff Name'}
                                            </TableHead>
                                            <TableHead className='font-bold text-gray-700'>
                                                {type === 'student' ? 'Class' : 'Department'}
                                            </TableHead>
                                            <TableHead className='font-bold text-gray-700'>Hostel</TableHead>
                                            <TableHead className='font-bold text-gray-700'>Room No</TableHead>
                                            <TableHead className='font-bold text-gray-700'>Confirm Date</TableHead>
                                            <TableHead className='font-bold text-gray-700'>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className='hover:bg-gray-50/50'>
                                                <TableCell className='py-2 text-xs'>{index + 1}</TableCell>
                                                <TableCell className='py-2 text-xs'>
                                                    {type === 'student' ? item.studentname : item.empname}
                                                </TableCell>
                                                <TableCell className='py-2 text-xs'>
                                                    {type === 'student' ? item.ASMCL_ClassName : item.HRMD_DepartmentName}
                                                </TableCell>
                                                <TableCell className='py-2 text-xs'>{item.HLMH_Name}</TableCell>
                                                <TableCell className='py-2 text-xs'>{item.HRMRM_RoomNo}</TableCell>
                                                <TableCell className='py-2 text-xs'>
                                                    {item.HLHSREQC_ConfirmDate || item.HLHSTREQC_ConfirmDate
                                                        ? format(
                                                              new Date(item.HLHSREQC_ConfirmDate || item.HLHSTREQC_ConfirmDate),
                                                              'dd/MM/yyyy'
                                                          )
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className='py-2 text-xs'>
                                                    {item.HLHSREQC_Remarks || item.HLHSTREQC_Remarks || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
