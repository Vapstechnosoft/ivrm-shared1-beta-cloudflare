'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAvailableBooksReportInitialData } from '@/hooks/library/reports/useAvailableBooksReport';
import type { IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z.object({
    LMAL_Id: z.preprocess(
        (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
        z.number({ required_error: 'Select Library', invalid_type_error: 'Select Library' }).min(1, 'Select Library')
    ),
    Type: z.string().default('ALL'),
    Type2: z.string().default('ALL'),
    LMD_Id: z.preprocess((val) => (val === undefined || val === '' || val === null ? 0 : Number(val)), z.number().default(0)).default(0),
    statuscount: z.boolean().default(true),
    IssueFromDate: z.date().optional().nullable(),
    IssueToDate: z.date().optional().nullable()
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IAvailableBooksReportRequest) => void;
    isLoading: boolean;
    onPrint?: () => void;
    onExport?: () => void;
    onCancel?: () => void;
    hasData?: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, onCancel, hasData }: ReportFormProps) => {
    const { data: initialData } = useAvailableBooksReportInitialData();

    const rawData: any = initialData?.data || initialData;

    const extractList = (list: any): any[] => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (list && typeof list === 'object' && '$values' in list) return list.$values;
        const inner = list.data || list.$values;
        if (Array.isArray(inner)) return inner;
        if (inner && typeof inner === 'object' && '$values' in inner) return inner.$values;
        return [];
    };

    const libraries = useMemo(() => {
        const rawLibraries =
            rawData?.libraryList ??
            rawData?.lib_list ??
            rawData?.libList ??
            rawData?.msterliblist1 ??
            rawData?.msterliblist ??
            rawData?.library_list ??
            [];

        return extractList(rawLibraries).map((lib: any) => ({
            lmaL_Id: Number(lib.lmaL_Id ?? lib.lmal_Id ?? lib.LMAL_Id ?? lib.lmal_id ?? lib.id ?? 0),
            lmaL_LibraryName: String(
                lib.lmaL_LibraryName ??
                    lib.lmal_LibraryName ??
                    lib.LMAL_LibraryName ??
                    lib.lmal_libraryname ??
                    lib.libraryname ??
                    lib.libraryName ??
                    lib.name ??
                    ''
            )
        }));
    }, [rawData]);

    const departments = useMemo(() => {
        const rawDepartments =
            rawData?.departmentList ??
            rawData?.dept_list ??
            rawData?.deptList ??
            rawData?.msterdepartmentlist ??
            rawData?.department_list ??
            rawData?.msterdepartmentlist1 ??
            [];

        return extractList(rawDepartments).map((dept: any) => ({
            lmD_Id: Number(dept.lmD_Id ?? dept.lmd_Id ?? dept.LMD_Id ?? dept.lmd_id ?? dept.id ?? 0),
            lmD_DepartmentName: String(
                dept.lmD_DepartmentName ??
                    dept.lmd_DepartmentName ??
                    dept.LMD_DepartmentName ??
                    dept.lmd_departmentname ??
                    dept.departmentName ??
                    dept.departmentname ??
                    dept.name ??
                    ''
            )
        }));
    }, [rawData]);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            Type: 'ALL',
            Type2: 'ALL',
            statuscount: true,
            LMD_Id: 0
        }
    });

    useEffect(() => {
        if (libraries.length === 1 && !watch('LMAL_Id')) {
            setValue('LMAL_Id', libraries[0].lmaL_Id);
        }
    }, [libraries, setValue, watch]);

    const onSubmit = (data: ReportFormValues) => {
        const hasFromDate = Boolean(data.IssueFromDate);
        const hasToDate = Boolean(data.IssueToDate);
        const hasDates = hasFromDate || hasToDate;

        const payload: IAvailableBooksReportRequest = {
            type: data.Type || 'ALL',
            Type: data.Type || 'ALL',
            type2: data.Type2 || 'ALL',
            Type2: data.Type2 || 'ALL',
            lmD_Id: Number(data.LMD_Id || 0),
            LMD_Id: Number(data.LMD_Id || 0),
            lmaL_Id: Number(data.LMAL_Id),
            LMAL_Id: Number(data.LMAL_Id),
            statuscount: hasDates ? true : Boolean(data.statuscount),
            subjectsthomos: false,
            stthomosSubject: []
        };

        if (data.IssueFromDate) {
            const fromFormatted = format(new Date(data.IssueFromDate), 'yyyy-MM-dd');
            payload.Fromdate = fromFormatted;
            payload.fromdate = fromFormatted;
            payload.FromDate = fromFormatted;
            payload.fromDate = fromFormatted;
            payload.IssueFromDate = fromFormatted;
        }

        if (data.IssueToDate) {
            const toFormatted = format(new Date(data.IssueToDate), 'yyyy-MM-dd');
            payload.ToDate = toFormatted;
            payload.todate = toFormatted;
            payload.toDate = toFormatted;
            payload.Todate = toFormatted;
            payload.IssueToDate = toFormatted;
        }

        // If only From Date is selected, set To Date to match
        if (data.IssueFromDate && !data.IssueToDate) {
            const fromFormatted = format(new Date(data.IssueFromDate), 'yyyy-MM-dd');
            payload.ToDate = fromFormatted;
            payload.todate = fromFormatted;
            payload.toDate = fromFormatted;
            payload.Todate = fromFormatted;
            payload.IssueToDate = fromFormatted;
        }

        // If only To Date is selected, set From Date to match
        if (data.IssueToDate && !data.IssueFromDate) {
            const toFormatted = format(new Date(data.IssueToDate), 'yyyy-MM-dd');
            payload.Fromdate = toFormatted;
            payload.fromdate = toFormatted;
            payload.FromDate = toFormatted;
            payload.fromDate = toFormatted;
            payload.IssueFromDate = toFormatted;
        }

        onSearch(payload);
    };

    const handleCancel = () => {
        reset({
            Type: 'ALL',
            Type2: 'ALL',
            statuscount: true,
            LMD_Id: 0,
            LMAL_Id: libraries.length === 1 ? libraries[0].lmaL_Id : undefined,
            IssueFromDate: undefined,
            IssueToDate: undefined
        });
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-6xl space-y-8 rounded-lg border bg-white p-8 shadow-sm'>
            {/* Library Name Row */}
            <div className='flex justify-center pb-4'>
                <div className='flex w-full max-w-3xl items-center gap-8'>
                    <Label className='min-w-[180px] text-right font-medium text-sm'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='LMAL_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                    value={field.value ? field.value.toString() : ''}>
                                    <SelectTrigger className='w-full border-muted-foreground/30'>
                                        <SelectValue placeholder='Select Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(libraries) &&
                                            libraries.map((lib) => (
                                                <SelectItem key={lib.lmaL_Id} value={lib.lmaL_Id.toString()}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.LMAL_Id?.message && <p className='mt-1 text-destructive text-xs'>{errors.LMAL_Id.message}</p>}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Book Type Section */}
                    <div className='space-y-2'>
                        <div className='flex justify-center'>
                            <Label className='font-bold text-[#3b82f6] text-sm'>BOOK TYPE :-</Label>
                        </div>
                        <div className='rounded-md border bg-gray-50/30 p-4'>
                            <Controller
                                control={control}
                                name='Type'
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className='grid grid-cols-3 gap-x-2 gap-y-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ALL' id='bt_all' />
                                            <Label htmlFor='bt_all' className='cursor-pointer font-normal text-[10px]'>
                                                ALL
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issue' id='bt_issue' />
                                            <Label htmlFor='bt_issue' className='cursor-pointer font-normal text-[10px]'>
                                                Issue
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issuable' id='bt_issuable' />
                                            <Label htmlFor='bt_issuable' className='cursor-pointer font-normal text-[10px]'>
                                                Issuable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Reference' id='bt_ref' />
                                            <Label htmlFor='bt_ref' className='cursor-pointer font-normal text-[10px]'>
                                                Not Issuable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ReferenceonlyIssuable' id='bt_r_iss' />
                                            <Label htmlFor='bt_r_iss' className='cursor-pointer font-normal text-[10px]'>
                                                Reference only Issuable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ReferenceonlyNon-Issuable' id='bt_r_niss' />
                                            <Label htmlFor='bt_r_niss' className='cursor-pointer font-normal text-[10px]'>
                                                Reference only Non-Issuable
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>

                    {/* Source Type Section */}
                    <div className='space-y-2'>
                        <div className='flex justify-center'>
                            <Label className='font-bold text-[#3b82f6] text-sm'>SOURCE TYPE :-</Label>
                        </div>
                        <div className='rounded-md border bg-gray-50/30 p-4'>
                            <Controller
                                control={control}
                                name='Type2'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex justify-around'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ALL' id='st_all' />
                                            <Label htmlFor='st_all' className='cursor-pointer font-normal text-[10px]'>
                                                ALL
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Purchased' id='st_pur' />
                                            <Label htmlFor='st_pur' className='cursor-pointer font-normal text-[10px]'>
                                                Purchased
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Donated' id='st_don' />
                                            <Label htmlFor='st_don' className='cursor-pointer font-normal text-[10px]'>
                                                Donated
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='flex flex-col justify-start space-y-8'>
                    {/* Department */}
                    <div className='mt-6 flex items-center gap-4'>
                        <Label className='min-w-[100px] text-right font-medium text-sm'>Department:</Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='LMD_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value !== undefined ? field.value.toString() : '0'}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='ALL' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>ALL</SelectItem>
                                            {Array.isArray(departments) &&
                                                departments.map((dept) => (
                                                    <SelectItem key={dept.lmD_Id} value={dept.lmD_Id.toString()}>
                                                        {dept.lmD_DepartmentName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.LMD_Id?.message && <p className='mt-1 text-destructive text-xs'>{errors.LMD_Id.message}</p>}
                        </div>
                    </div>

                    {/* Date Section */}
                    <div className='space-y-4 pt-4'>
                        <div className='flex items-center gap-2 pl-[116px]'>
                            <Controller
                                control={control}
                                name='statuscount'
                                render={({ field }) => (
                                    <Checkbox
                                        id='statuscount'
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    />
                                )}
                            />
                            <Label htmlFor='statuscount' className='cursor-pointer font-medium text-xs'>
                                Entry Date
                            </Label>
                        </div>

                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[100px] text-right font-medium text-xs'>Entry Date</Label>
                            <div className='flex flex-1 items-center gap-2'>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='IssueFromDate'
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value ?? undefined}
                                                setDate={(d) => {
                                                    field.onChange(d);
                                                    if (d) setValue('statuscount', true);
                                                }}
                                                placeholder='Enter From date'
                                                className='w-full'
                                            />
                                        )}
                                    />
                                </div>
                                <span className='font-bold text-[10px]'>AND</span>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='IssueToDate'
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value ?? undefined}
                                                setDate={(d) => {
                                                    field.onChange(d);
                                                    if (d) setValue('statuscount', true);
                                                }}
                                                placeholder='Enter To date'
                                                className='w-full'
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-row items-center justify-center gap-4 pt-6'>
                <Button
                    type='submit'
                    className='!w-auto h-9 min-w-[120px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'
                    disabled={isLoading}>
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='!w-auto h-9 min-w-[120px] rounded-md bg-[#ff5a30] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#e64d26]'
                    onClick={handleCancel}
                    disabled={isLoading}>
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
                {hasData && (
                    <>
                        {onPrint && (
                            <Button
                                type='button'
                                className='!w-auto h-9 min-w-[120px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'
                                onClick={onPrint}
                                disabled={isLoading}>
                                <Printer className='mr-1.5 h-3.5 w-3.5' />
                                PRINT
                            </Button>
                        )}
                        {onExport && (
                            <Button
                                type='button'
                                className='!w-auto h-9 min-w-[140px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'
                                onClick={onExport}
                                disabled={isLoading}>
                                <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                                EXPORT TO EXCEL
                            </Button>
                        )}
                    </>
                )}
            </div>
        </form>
    );
};
