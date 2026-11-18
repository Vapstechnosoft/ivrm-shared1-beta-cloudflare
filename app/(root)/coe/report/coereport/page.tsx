'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { coeReportSchema } from '@/schemas/coe/master';
import { getCoeReport } from '@/server/coe/masters/masterevent';
import { getCoeMonthEndReport } from '@/server/coe/masters/report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import xlsx, { type IJsonSheet } from 'json-as-xlsx';
import { CalendarIcon, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CoeReportPrint } from './_components/coe-report-print';

const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

type FormFields = z.infer<typeof coeReportSchema.addOrUpdate>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function coeReport() {
    // ---------------------------- FORM ----------------------------
    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(coeReportSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: undefined,
            asmcl_Id: undefined,
            month: undefined
        }
    });

    const [filterType, setFilterType] = useState<string>('1');
    const [filters, setFilters] = useState({
        fromDate: new Date(),
        toDate: new Date()
    });
    const [showReport, setShowReport] = useState(false);
    const [coeReportData, setCoeReportData] = useState<any[]>([]);
    const [masterCompany, setMasterCompany] = useState<any>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handleFilterChange = (value: string) => {
        setFilterType(value);
    };

    const handleReset = () => {
        reset();
        window.location.reload();
    };

    const [isPrinting, setIsPrinting] = useState(false);
    const triggerPrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'COE_Report'
    });

    const handlePrint = () => {
        setIsPrinting(true);
        const toastId = toast.loading('Preparing all records for print...');
        setTimeout(() => {
            triggerPrint();
            setIsPrinting(false);
            toast.dismiss(toastId);
        }, 1000);
    };

    const handleExport = () => {
        if (!coeReportData || coeReportData.length === 0) return;

        const data = [
            {
                sheet: 'COE Report',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Event Name', value: 'coemE_EventName' },
                    { label: 'Event Description', value: 'coemE_EventDesc' },
                    { label: 'Event Start Date', value: 'startDate' },
                    { label: 'Event End Date', value: 'endDate' }
                ],
                content: (coeReportData || []).map((row, idx) => ({
                    slNo: idx + 1,
                    coemE_EventName: row.eventName || row.coemE_EventName || 'NA',
                    coemE_EventDesc: row.eventDesc || row.coemE_EventDesc || 'NA',
                    startDate: row.coeE_EStartDate ? new Date(row.coeE_EStartDate).toISOString().slice(0, 10) : 'NA',
                    endDate: row.coeE_EEndDate ? new Date(row.coeE_EEndDate).toISOString().slice(0, 10) : 'NA'
                }))
            }
        ] as IJsonSheet[];

        const settings = {
            fileName: 'COE_Report',
            extraLength: 3,
            writeMode: 'writeFile',
            writeOptions: {},
            RTL: false
        };

        xlsx(data, settings);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // Validation based on filter type
            if (filterType === '1') {
                if (!data.month) {
                    toast.error('Month is required');
                    return;
                }
            } else if (filterType === '2') {
                if (!data.asmcl_Id || data.asmcl_Id === 0) {
                    toast.error('Class is required');
                    return;
                }
            } else if (filterType === '3') {
                if (!filters.fromDate || !filters.toDate) {
                    toast.error('Both From Date and To Date are required');
                    return;
                }
            }

            const payload = {
                ASMAY_Id: data.asmaY_Id ?? 0,
                ASMCL_Id: data.asmcl_Id ?? 0,
                type: filterType,
                Monthid: Number(data.month ?? 0) ?? 0,
                COEE_EStartDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : '',
                COEE_EEndDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : '',
                year: data.asmaY_Id ?? 0
            };

            const js = JSON.stringify(payload);
            console.log('Payload JSON:', js);

            const response = await getCoeReport(payload);

            if (response.success) {
                toast.success(response.message || 'COE Report fetched successfully');
                
                const dataObj = response.data || [];
                const reportData = dataObj.$values || dataObj.reportlist?.$values || dataObj.reportlist || dataObj.coereport?.$values || dataObj.coereport || (Array.isArray(dataObj) ? dataObj : []);
                const companyData = dataObj.masterCompany?.$values || dataObj.masterCompany || [];
                
                setCoeReportData(reportData);
                setMasterCompany(companyData.length > 0 ? companyData[0] : null);
                setShowReport(true);
            } else {
                toast.error(response.message || 'Failed to fetch COE Report');
                setShowReport(false);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
            setShowReport(false);
        }
    };

    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [selectedclassId, setSelectedClassId] = useState<number | null>(null);
    const [initialData, setInitialData] = useState<any>({ year: [], classlist: [], month: [] });
    const [loadingInitial, setLoadingInitial] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getCoeMonthEndReport({ MI_Id: 2 });
                console.log('Initial Data:', response);

                // Flexibly handle the response format (whether wrapped in { success, data } or returned directly)
                if (response) {
                    const dataObj = response.data || response;

                    // The backend might use different keys like 'yearlist', 'academicYear', 'monthlist', etc.
                    const yearData =
                        dataObj.year?.$values ||
                        dataObj.year ||
                        dataObj.yearlist?.$values ||
                        dataObj.yearlist ||
                        dataObj.academicYear?.$values ||
                        dataObj.academicYear ||
                        [];
                    const classData = dataObj.classlist?.$values || dataObj.classlist || dataObj.class?.$values || dataObj.class || [];
                    const monthData = dataObj.month?.$values || dataObj.month || dataObj.monthlist?.$values || dataObj.monthlist || [];

                    setInitialData({
                        year: yearData,
                        classlist: classData,
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

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='flex flex-col items-center justify-center space-y-6 p-6'>
                            {/* Filter Type Radio Group */}
                            <Card className='p-4'>
                                <RadioGroup value={filterType} onValueChange={handleFilterChange}>
                                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5'>
                                        {[
                                            { value: '1', label: 'Monthly' },
                                            { value: '2', label: 'Classwise' },
                                            { value: '3', label: 'Between Date' }
                                        ].map((item) => {
                                            return (
                                                <div key={item.value} className='flex items-center space-x-2'>
                                                    <RadioGroupItem value={item.value} id={item.value} />
                                                    <Label htmlFor={item.value} className='cursor-pointer text-sm'>
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </RadioGroup>
                            </Card>

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
                                            searchable={false}
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                                setSelectedAsmayId(id);
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
                                                            key={item.hrmlY_Id || item.hrmlY_Id}
                                                            value={String(item.hrmlY_Id || item.hrmlY_Id)}>
                                                            {item.hrmlY_LeaveYear || item.hrmlY_LeaveYear}
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

                            {/* Class Selection (for Classwise filter) */}
                            {filterType === '2' && (
                                <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                    <Label htmlFor='asmcl_Id' className='whitespace-nowrap font-semibold'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcl_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => {
                                                    const id = Number(val);
                                                    field.onChange(id);
                                                    setSelectedClassId(id);
                                                }}
                                                value={
                                                    typeof field.value === 'number' || typeof field.value === 'string'
                                                        ? String(field.value)
                                                        : ''
                                                }
                                                disabled={loadingInitial}>
                                                <SelectTrigger className='w-64'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData.classlist?.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}

                            {filterType === '1' && (
                                <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                    <Label htmlFor='month' className='whitespace-nowrap font-semibold'>
                                        Month <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='month'
                                        control={control}
                                        render={({ field }) => {
                                            // Convert field.value number (1-12) to two-digit string
                                            const valueStr = field.value ? String(field.value).padStart(2, '0') : '';

                                            return (
                                                <Select
                                                    value={valueStr}
                                                    onValueChange={(val) => field.onChange(Number(val))} // Save as number
                                                >
                                                    <SelectTrigger className='w-64'>
                                                        <SelectValue placeholder='Select Month' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {initialData.month?.map((item: any) => (
                                                            <SelectItem key={item.monthid} value={String(item.monthid).padStart(2, '0')}>
                                                                {item.monthname}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        }}
                                    />
                                </div>
                            )}

                            {/* Date Range Selection (for Between Date filter) */}
                            {filterType === '3' && (
                                <>
                                    <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                        <Label className='min-w-32 font-medium'>
                                            From Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {format(filters.fromDate, 'dd-MM-yyyy')}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <Calendar
                                                    mode='single'
                                                    selected={filters.fromDate}
                                                    onSelect={(date) => date && setFilters((prev) => ({ ...prev, fromDate: date }))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className='flex w-full max-w-md items-center justify-between gap-4'>
                                        <Label className='min-w-32 font-medium'>
                                            To Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {format(filters.toDate, 'dd-MM-yyyy')}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <Calendar
                                                    mode='single'
                                                    selected={filters.toDate}
                                                    onSelect={(date) => date && setFilters((prev) => ({ ...prev, toDate: date }))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className='flex w-full max-w-md justify-center gap-4 pt-4'>
                                <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                                    {isSubmitting ? 'Loading...' : 'Submit'}
                                </Button>
                                <Button type='button' variant='outline' onClick={handleReset} className='min-w-[120px]'>
                                    Reset
                                </Button>
                                {showReport && (
                                    <>
                                        <Button
                                            type='button'
                                            onClick={handleExport}
                                            className='min-w-[120px] bg-green-600 text-white hover:bg-green-700'>
                                            <FileSpreadsheet className='mr-2 h-4 w-4' /> Export
                                        </Button>
                                        <Button
                                            type='button'
                                            onClick={handlePrint}
                                            disabled={isPrinting}
                                            className='min-w-[120px] bg-blue-600 text-white hover:bg-blue-700'>
                                            <Printer className='mr-2 h-4 w-4' /> {isPrinting ? 'Preparing...' : 'Print'}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {showReport && (
                                <CollapsibleSection defaultOpen title='COE Report'>
                                    <div className='mt-6 rounded-lg border bg-white shadow-xl'>
                                        <div className='border-b bg-primary/5 px-8 py-6'>
                                            <div className='flex flex-col items-center justify-center space-y-4'>
                                                {masterCompany?.logo && (
                                                    <div className='w-full max-w-2xl'>
                                                        <img src={masterCompany.logo} alt='Institution Logo' className='h-auto w-full object-contain' />
                                                    </div>
                                                )}
                                                <div className='text-center'>
                                                    <h2 className='font-bold text-xl text-primary'>COE Report</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='overflow-x-auto p-4'>
                                            <table className='w-full border-collapse border border-gray-300 text-sm'>
                                                <thead className='bg-primary text-white'>
                                                    <tr>
                                                        <th className='border border-gray-300 px-2 py-2'>Sl No</th>
                                                        <th className='border border-gray-300 px-2 py-2'>Event Name</th>
                                                        <th className='border border-gray-300 px-2 py-2'>Event Description</th>
                                                        <th className='border border-gray-300 px-2 py-2'>Event Start Date</th>
                                                        <th className='border border-gray-300 px-2 py-2'>Event End Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(coeReportData || []).map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className='border border-gray-300 px-2 py-2 text-center'>{idx + 1}</td>
                                                            <td className='border border-gray-300 px-2 py-2 font-medium'>
                                                                {row.eventName ?? row.coemE_EventName ?? 'NA'}
                                                            </td>
                                                            <td className='border border-gray-300 px-2 py-2 text-center'>
                                                                {row.eventDesc ?? row.coemE_EventDesc ?? 'NA'}
                                                            </td>

                                                            <td className='border border-gray-300 px-2 py-2 text-center'>
                                                                {new Date(row.coeE_EStartDate).toISOString().slice(0, 10)}
                                                            </td>
                                                            <td className='border border-gray-300 px-2 py-2 text-center'>
                                                                {new Date(row.coeE_EEndDate).toISOString().slice(0, 10)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!coeReportData || coeReportData.length === 0) && (
                                                        <tr>
                                                            <td colSpan={5} className='py-4 text-center font-bold text-red-600'>
                                                                No records found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            )}
                        </div>
                    </Card>

                    {/* Hidden Print Wrapper */}
                    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
                        <CoeReportPrint ref={componentRef} coeReportData={coeReportData} masterCompany={masterCompany} />
                    </div>
                </div>
            </form>
        </div>
    );
}
