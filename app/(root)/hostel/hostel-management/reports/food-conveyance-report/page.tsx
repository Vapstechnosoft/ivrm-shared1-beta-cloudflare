'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel } from '@/lib/export-to-file';
import {
    type HostelFoodConveyanceReportValues,
    hostelFoodConveyanceReportSchema
} from '@/schemas/hostel/reports/hostel-food-conveyance-report.schema';
import {
    type HFCReportLoadDataResponse,
    type HFCReportResponse,
    type HFCReportStudent,
    getHFCReport,
    getHFCReportLoadData
} from '@/server/hostel/hostel-management/reports/hostel-food-conveyance-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, FileText, Loader2, Minus, Printer, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function HostelFoodConveyanceReportPage() {
    const [reportData, setReportData] = useState<HFCReportStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [currentDate] = useState(new Date());

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    const form = useForm<HostelFoodConveyanceReportValues>({
        resolver: zodResolver(hostelFoodConveyanceReportSchema),
        defaultValues: {
            hfcFlag: 'H'
        }
    });

    useEffect(() => {
        async function load() {
            try {
                setIsInitialLoading(true);
                const data: HFCReportLoadDataResponse | null = await getHFCReportLoadData();
                if (data) {
                    const years = data.allAcademicYear || [];
                    setAcademicYears(years);
                    setClasses(data.allClass || []);
                    setSections(data.allSection || []);

                    if (years.length > 0 && !form.getValues('asmaY_Id')) {
                        const activeYear = years.find((y: any) => y.asmaY_ActiveFlag === 1 || y.ASMAY_ActiveFlag === 1) || years[0];
                        const activeId = activeYear?.asmaY_Id ?? activeYear?.ASMAY_Id;
                        if (activeId) {
                            form.setValue('asmaY_Id', Number(activeId));
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading initial data:', err);
                toast.error('Failed to load initial data');
            } finally {
                setIsInitialLoading(false);
            }
        }
        load();
    }, [form]);

    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');

    const prevYearRef = useRef<number | undefined>(undefined);
    const prevClassRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (prevYearRef.current !== undefined && prevYearRef.current !== watchYear) {
            form.setValue('asmcL_Id', undefined as any);
            form.setValue('asmC_Id', undefined as any);
        }
        prevYearRef.current = watchYear;
    }, [watchYear, form]);

    useEffect(() => {
        if (prevClassRef.current !== undefined && prevClassRef.current !== watchClass) {
            form.setValue('asmC_Id', undefined as any);
        }
        prevClassRef.current = watchClass;
    }, [watchClass, form]);

    async function onSubmit(values: HostelFoodConveyanceReportValues) {
        setLoading(true);
        try {
            const data: HFCReportResponse | null = await getHFCReport(values);
            if (data?.studentlist && data.studentlist.length > 0) {
                const formattedList = data.studentlist.map((item: any) => {
                    let name = item.stuFN || item.AMST_FirstName || '';
                    const mn = item.stuMN || item.AMST_MiddleName;
                    const ln = item.stuLN || item.AMST_LastName;
                    if (mn) name += ` ${mn}`;
                    if (ln) name += ` ${ln}`;
                    return {
                        ...item,
                        regno: item.regno || item.AMST_RegistrationNo,
                        admno: item.admno || item.AMST_AdmNo,
                        class: item.class || item.ASMCL_ClassName,
                        section: item.section || item.ASMC_SectionName,
                        namme: item.namme || name.replace(/ {2,}/g, ' ').trim()
                    };
                });
                setReportData(formattedList);
                toast.success(`Successfully loaded ${formattedList.length} record(s)`);
            } else {
                setReportData([]);
                toast.info('No data found');
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
        if (tableContent) {
            const popupWindow = window.open('', '_blank', 'width=1000,height=1000');
            if (popupWindow) {
                popupWindow.document.open();
                popupWindow.document.write(`
                    <html>
                        <head>
                            <title>Hostel Food Conveyance Report</title>
                            <style>
                                body { font-family: 'Times New Roman', serif; padding: 20px; }
                                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4255a7; padding-bottom: 10px; }
                                .school-name { font-size: 24px; font-weight: bold; color: #4255a7; margin: 0; text-transform: uppercase; }
                                .report-title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #444; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                                .text-center { text-align: center; }
                                .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; }
                            </style>
                        </head>
                        <body onload="window.print(); window.close();">
                            <div class="header">
                                <h1 class="school-name">Hostel / Food / Conveyance Report</h1>
                                <div class="report-title">${form.getValues('hfcFlag') === 'H' ? 'HOSTEL' : 'CONVEYANCE'} DETAILS</div>
                            </div>
                            ${tableContent.outerHTML}
                            <div class="footer">
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

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) return;

        const exportData = reportData.map((item, index) => ({
            sno: index + 1,
            regno: item.regno,
            admno: item.admno,
            studentname: item.namme,
            classname: item.class,
            sectionname: item.section
        }));

        const columns = JSON.stringify([
            { label: 'SL. No.', value: 'sno' },
            { label: 'Reg. No.', value: 'regno' },
            { label: 'Adm. No.', value: 'admno' },
            { label: 'Student Name', value: 'studentname' },
            { label: 'Class', value: 'classname' },
            { label: 'Section', value: 'sectionname' }
        ]);

        exportToExcel('HostelFoodConveyanceReport', columns, JSON.stringify(exportData), true);
    };

    return (
        <div className='flex-col'>
            <div className='flex items-center justify-end bg-gray-100/50 px-8 py-2 font-medium text-[10px] text-gray-500'>
                <span>Report &gt; HostelFoodConveyanceReport</span>
            </div>
            <div className='min-h-screen flex-1 space-y-4 bg-slate-50/50 p-8 pt-4'>
                <Heading title='Hostel / Food / Conveyance Report' description='View and generate hostel food conveyance reports.' />

                <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                    <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
                        <CardHeader className='flex flex-row items-center justify-between border-b bg-white px-4 py-2'>
                            <CardTitle className='font-bold text-[#4255a7] text-sm uppercase tracking-wider'>
                                HOSTEL / FOOD / CONVEYANCE REPORT
                            </CardTitle>
                            <Minus className='h-4 w-4 cursor-pointer text-gray-400' />
                        </CardHeader>
                        <CardContent className='p-0'>
                            <FormProvider {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-0'>
                                    {/* HFC Type Selection Bar */}
                                    <div className='flex justify-center border-b bg-gray-50/50 p-4'>
                                        <Controller
                                            control={form.control}
                                            name='hfcFlag'
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-12'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='H' id='r-hostel' />
                                                        <Label htmlFor='r-hostel' className='cursor-pointer font-bold text-xs uppercase'>
                                                            Hostel
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='C' id='r-conveyance' />
                                                        <Label
                                                            htmlFor='r-conveyance'
                                                            className='cursor-pointer font-bold text-xs uppercase'>
                                                            Conveyance
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {/* Form Fields */}
                                    <div className='p-8'>
                                        <div className='mx-auto grid max-w-5xl grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3'>
                                            {/* Academic Year */}
                                            <Controller
                                                control={form.control}
                                                name='asmaY_Id'
                                                render={({ field, fieldState }) => (
                                                    <div className='flex flex-col gap-2'>
                                                        <Label className='font-semibold text-gray-700 text-xs uppercase tracking-wider'>
                                                            Academic Year: <span className='text-red-500'>*</span>
                                                        </Label>
                                                        <Select
                                                            disabled={isInitialLoading}
                                                            onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                            value={
                                                                field.value !== undefined && field.value !== null && field.value !== ''
                                                                    ? String(field.value)
                                                                    : undefined
                                                            }>
                                                            <SelectTrigger className='w-full border border-gray-200 bg-white'>
                                                                <SelectValue
                                                                    placeholder={
                                                                        isInitialLoading
                                                                            ? 'Loading Academic Years...'
                                                                            : 'Select Academic Year'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {academicYears.map((y: any) => {
                                                                    const id = y.asmaY_Id ?? y.ASMAY_Id;
                                                                    const yearName = y.asmaY_Year ?? y.ASMAY_Year;
                                                                    if (id === undefined || id === null) return null;
                                                                    return (
                                                                        <SelectItem key={String(id)} value={String(id)}>
                                                                            {yearName}
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />

                                            {/* Class */}
                                            <Controller
                                                control={form.control}
                                                name='asmcL_Id'
                                                render={({ field, fieldState }) => (
                                                    <div className='flex flex-col gap-2'>
                                                        <Label className='font-semibold text-gray-700 text-xs uppercase tracking-wider'>
                                                            Class: <span className='text-red-500'>*</span>
                                                        </Label>
                                                        <Select
                                                            disabled={isInitialLoading}
                                                            onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                            value={
                                                                field.value !== undefined && field.value !== null && field.value !== ''
                                                                    ? String(field.value)
                                                                    : undefined
                                                            }>
                                                            <SelectTrigger className='w-full border border-gray-200 bg-white'>
                                                                <SelectValue placeholder='Select Class' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classes.map((c: any) => {
                                                                    const id = c.asmcL_Id ?? c.ASMCL_Id;
                                                                    const className = c.asmcL_ClassName ?? c.ASMCL_ClassName;
                                                                    if (id === undefined || id === null) return null;
                                                                    return (
                                                                        <SelectItem key={String(id)} value={String(id)}>
                                                                            {className}
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />

                                            {/* Section */}
                                            <Controller
                                                control={form.control}
                                                name='asmC_Id'
                                                render={({ field, fieldState }) => (
                                                    <div className='flex flex-col gap-2'>
                                                        <Label className='font-semibold text-gray-700 text-xs uppercase tracking-wider'>
                                                            Section: <span className='text-red-500'>*</span>
                                                        </Label>
                                                        <Select
                                                            disabled={isInitialLoading}
                                                            onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                                            value={
                                                                field.value !== undefined && field.value !== null && field.value !== ''
                                                                    ? String(field.value)
                                                                    : undefined
                                                            }>
                                                            <SelectTrigger className='w-full border border-gray-200 bg-white'>
                                                                <SelectValue placeholder='Select Section' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sections.map((s: any) => {
                                                                    const id = s.asmS_Id ?? s.asmC_Id ?? s.ASMS_Id ?? s.ASMC_Id;
                                                                    const sectionName =
                                                                        s.asmC_SectionName ?? s.ASMC_SectionName ?? s.sectionName;
                                                                    if (id === undefined || id === null) return null;
                                                                    return (
                                                                        <SelectItem key={String(id)} value={String(id)}>
                                                                            {sectionName}
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='mt-12 flex items-center justify-center gap-4'>
                                            <Button
                                                type='submit'
                                                disabled={loading}
                                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                                {loading ? (
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
                                    onClick={handleExportExcel}
                                    className='h-6 text-[10px] text-white hover:bg-white/20'>
                                    <FileSpreadsheet className='mr-1 h-3 w-3' /> EXPORT
                                </Button>
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
                                    <TableHeader className='bg-blue-50'>
                                        <TableRow>
                                            <TableHead className='w-[80px] border text-center font-bold text-blue-900'>SL.No.</TableHead>
                                            <TableHead className='border font-bold text-blue-900'>Reg. No.</TableHead>
                                            <TableHead className='border font-bold text-blue-900'>Adm. No.</TableHead>
                                            <TableHead className='border font-bold text-blue-900'>Student Name</TableHead>
                                            <TableHead className='border font-bold text-blue-900'>Class</TableHead>
                                            <TableHead className='border text-center font-bold text-blue-900'>Section</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item, index) => (
                                            <TableRow key={index} className='transition-colors hover:bg-gray-50/50'>
                                                <TableCell className='border py-2 text-center text-xs'>{index + 1}</TableCell>
                                                <TableCell className='border py-2 text-xs'>{item.regno || '-'}</TableCell>
                                                <TableCell className='border py-2 text-xs'>{item.admno || '-'}</TableCell>
                                                <TableCell className='border py-2 font-semibold text-xs'>{item.namme || '-'}</TableCell>
                                                <TableCell className='border py-2 text-xs'>{item.class || '-'}</TableCell>
                                                <TableCell className='border py-2 text-center text-xs'>{item.section || '-'}</TableCell>
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
