'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type AllotmentReportSchema, allotmentReportSchema } from '@/schemas/hostel/reports/allotment-report.schema';
import { getAllotmentReport } from '@/server/hostel/hostel-management/reports/allotment-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Printer, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { guestColumns, staffColumns, studentColumns } from './columns';

interface ReportFormProps {
    dropdowns: {
        yearlist: any[];
        hostellist: any[];
    };
}

export default function AllotmentReportClient({ dropdowns }: ReportFormProps) {
    const methods = useForm<AllotmentReportSchema>({
        resolver: zodResolver(allotmentReportSchema),
        defaultValues: {
            type: 'Student',
            ASMAY_Id: 0,
            HLMH_Id: 0,
            frmdate: new Date(),
            todate: new Date()
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = methods;
    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<string>('Student');
    const [currentDate] = useState(new Date());

    const onSubmit = async (data: AllotmentReportSchema) => {
        try {
            setReportType(data.type);
            const res = await getAllotmentReport(data);
            if (res && res.griddata) {
                setReportData(res.griddata);
                if (res.griddata.length === 0) {
                    toast.info('No records found');
                } else {
                    toast.success(`Successfully loaded ${res.griddata.length} allotment(s)`);
                }
            } else {
                setReportData([]);
                toast.error('Failed to fetch report');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    const getColumns = () => {
        switch (reportType) {
            case 'Staff':
                return staffColumns;
            case 'Guest':
                return guestColumns;
            default:
                return studentColumns;
        }
    };

    // Helper to get raw data for print table since columns are dynamic
    // This is a simplified print handler that tries to mimic the column structure
    const handlePrint = () => {
        if (!reportData || reportData.length === 0) return;

        const tableContent = document.getElementById('reportTableWrapper');
        // We use a specific ID on the datatable wrapper or create a hidden table for printing if needed.
        // Since DataTable component might be complex to print directly if it has pagination/virtualization,
        // it's better to render a hidden standard table for printing or just try to print the div if it is simple.
        // For consistency with request-report, let's look for a table ID.
        // IF DataTable does not expose ID easily, we might need a hidden print table.
        // However, generic DataTable usually renders a table. Let's assume we can capture the container.

        // Actually, creating a clean print view is better.
        // Let's generate the print HTML dynamically based on data and columns.

        const cols = getColumns();
        const headers = cols.map((c: any) => c.header as string);
        const accessors = cols.map((c: any) => c.accessorKey as string);

        const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
        if (popupWindow) {
            const rowsHtml = reportData
                .map((row) => {
                    return `<tr>${accessors.map((key) => `<td>${row[key] ?? ''}</td>`).join('')}</tr>`;
                })
                .join('');

            const headerHtml = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;

            popupWindow.document.open();
            popupWindow.document.write(`
                <html>
                    <head>
                        <title>${reportType} Allotment Report</title>
                        <style>
                            body { font-family: 'Times New Roman', serif; padding: 20px; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .school-name { font-size: 24px; font-weight: bold; color: #2e57a0; margin: 0; }
                            .report-title { font-size: 18px; font-weight: bold; margin-top: 10px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                            th, td { border: 1px solid black; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; font-weight: bold; }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        <div class="header">
                            <h1 class="school-name">${reportType} Allotment Report</h1>
                            <div>Date: ${format(currentDate, 'dd/MM/yyyy')}</div>
                        </div>
                        <table>
                            <thead>${headerHtml}</thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </body>
                </html>
            `);
            popupWindow.document.close();
        }
    };

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Hostel Allotment Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                            <div className='mb-6 flex justify-center'>
                                <Controller
                                    control={control}
                                    name='type'
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Student' id='r1' />
                                                <Label htmlFor='r1'>Student</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Staff' id='r2' />
                                                <Label htmlFor='r2'>Staff</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Guest' id='r3' />
                                                <Label htmlFor='r3'>Guest</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                {/* Academic Year */}
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field }) => (
                                        <div className='space-y-1'>
                                            <Label>Academic Year</Label>
                                            <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dropdowns.yearlist?.map((y: any) => {
                                                        const id = y.asmaY_Id ?? y.ASMAY_Id;
                                                        const name = y.asmaY_Year ?? y.ASMAY_Year;
                                                        return (
                                                            <SelectItem key={id} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />

                                {/* Hostel */}
                                <Controller
                                    control={control}
                                    name='HLMH_Id'
                                    render={({ field }) => (
                                        <div className='space-y-1'>
                                            <Label>Hostel</Label>
                                            <Select value={String(field.value || '')} onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Hostel' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dropdowns.hostellist?.map((h: any) => {
                                                        const id = h.hlmH_Id ?? h.HLMH_Id;
                                                        const name = h.hlmH_Name ?? h.HLMH_Name ?? h.hlmH_name;
                                                        return (
                                                            <SelectItem key={id} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />

                                {/* From Date */}
                                <Controller
                                    control={control}
                                    name='frmdate'
                                    render={({ field }) => (
                                        <div className='space-y-1'>
                                            <Label>
                                                From Date <span className='text-red-500'>*</span>
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0'>
                                                    <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                />

                                {/* To Date */}
                                <Controller
                                    control={control}
                                    name='todate'
                                    render={({ field }) => (
                                        <div className='space-y-1'>
                                            <Label>
                                                To Date <span className='text-red-500'>*</span>
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0'>
                                                    <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='flex justify-end gap-2'>
                                <Button type='submit' disabled={isSubmitting} className='w-32'>
                                    {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                                    Report
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => {
                                        setReportData([]);
                                        methods.reset();
                                    }}
                                    className='w-32'>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>

            {reportData.length > 0 && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle>{reportType} Allotment Report</CardTitle>
                        <Button variant='outline' size='sm' onClick={handlePrint}>
                            <Printer className='mr-2 h-4 w-4' /> Print
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <GenericDataTable columns={getColumns()} data={reportData} isLoading={false} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
