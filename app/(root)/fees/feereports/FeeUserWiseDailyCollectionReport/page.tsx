// app/(root)/fees/feereports/feeuserwisedailycollectionreport/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DatePicker } from '@/components/ui/date-picker';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeGroupDefaulterreport, useUserWiseDailyCollectionReport } from '@/hooks/fees/useReports';
import { feeUserWiseDailyCollectionReportSchema } from '@/schemas/fees/reports';
import type { FeeUserWiseDailyCollectionData } from '@/types/fees/reports/reports';
import { Download, Printer, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, printTable } from './_components/print-and-export-excel';

interface FormFields {
    type: 'STW' | 'TCW';
    ASMAY: number;
    groupIds: number[];
    fromDate: Date | undefined | string;
    toDate: Date | undefined | string;
}

const today = new Date();

export default function FeeUserWiseDailyCollectionReport() {
    const [loading, setLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<FeeUserWiseDailyCollectionData[] | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchString, setSearchString] = useState('');
    const [filteredData, setFilteredData] = useState<FeeUserWiseDailyCollectionData[] | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        register,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeUserWiseDailyCollectionReportSchema),
        defaultValues: {
            type: 'STW',
            ASMAY: 0,
            groupIds: [],
            fromDate: '',
            toDate: ''
        }
    });

    const fromDateValue = watch('fromDate');

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = watch('type');
    const selectedGroupIds = watch('groupIds') || [];

    // Dropdowns
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [feeGroups, setFeeGroups] = useState<any[]>([]);

    const { data: academicData, error: academicError, isLoading: loadingAcademic } = useAcademicYearDropdown();
    const { mutateAsync: generateReportAsync, isPending: loadingReport } = useUserWiseDailyCollectionReport();
    const { data: groupData, error: groupError, isLoading: loadingGroup } = useFeeGroupDefaulterreport();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
        }
        if (academicData?.data) {
            setAcademicYears(academicData.data);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (groupError) {
            toast.error(groupError?.message || 'Failed to load groups');
        }
        if (groupData?.data) {
            const formattedGroups = groupData.data.map((item: any) => ({
                label: item.fmG_GroupName,
                value: item.fmG_Id.toString()
            }));
            setFeeGroups(formattedGroups);
        }
    }, [groupData, groupError]);

    useEffect(() => {
        setSelectedIds([]);
    }, [result]); // Clear selections when report type changes

    const handleGroupChange = (values: string[]) => {
        const ids = values.map(Number);
        setValue('groupIds', ids, { shouldValidate: true });
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        console.log('Form Data:', data);
        setLoading(true);
        try {
            const payload = {
                regornamedetails: data.type === 'STW' ? 'STW' : 'TCW',
                amaY_Id: data.ASMAY,
                fromdate: new Date(data.fromDate as string).toISOString().split('T')[0],
                todate: new Date(data.toDate as string).toISOString().split('T')[0],
                all_ListData: data.groupIds.map((id) => {
                    const selectedGroup = feeGroups.find((group) => group.value === id.toString());
                    return {
                        columnID: id.toString(),
                        columnName: selectedGroup ? selectedGroup.label : 'Group',
                        fmG_Id: id
                    };
                })
            };

            console.log('payload', payload);

            const response: any = await generateReportAsync(payload as any);
            const responseData = Array.isArray(response?.data) ? response.data : [];

            console.log('response', responseData);

            if (responseData && responseData.length > 0) {
                setReportData(responseData);
                setShowReport(true);
                toast.success('Report generated successfully');
            } else {
                toast.error('No records found');
                setReportData(null);
                setShowReport(false);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to generate report');
            setReportData(null);
            setShowReport(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const activeData = filteredData || reportData;
        if (checked && activeData) {
            setSelectedIds(activeData.map((_, index) => index));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (index: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, index]);
        } else {
            setSelectedIds((prev) => prev.filter((id) => id !== index));
        }
    };

    const handleExportToExcel = () => {
        const activeData = filteredData || reportData;
        if (!activeData) return;

        if (selectedIds.length === 0) {
            toast.warning('Please select at least one record to export');
            return;
        }

        const items = activeData.filter((_, idx: number) => selectedIds.includes(idx));
        let exportData: any = {};
        if (result === 'STW') {
            exportData = { studentWise: items };
        } else if (result === 'TCW') {
            exportData = { totalCollection: items };
        }

        exportToExcel(exportData, 'FeeUserWiseDailyCollectionReport');
    };

    const handleClear = () => {
        reset();
        setShowReport(false);
        setReportData(null);
        setSelectedIds([]);
    };

    const handlePrint = () => {
        if (selectedIds.length === 0) {
            toast.warning('Please select at least one record to print');
            return;
        }
        printTable('report-table');
    };

    useEffect(() => {
        if (searchString.trim() !== '') {
            if (reportData) {
                if (result === 'STW') {
                    const filtered = reportData.filter(
                        (item) =>
                            (item.studentName || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.admissionNo || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.className || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.sectionName || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.modeOfPayment || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.fmhFeeName || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.receiptNo || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.generatedBy || '').toLowerCase().includes(searchString.toLowerCase())
                    );
                    setFilteredData(filtered);
                } else if (result === 'TCW') {
                    const filtered = reportData.filter(
                        (item) =>
                            (item.modeOfPayment || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.receiptNo || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.generatedBy || '').toLowerCase().includes(searchString.toLowerCase()) ||
                            (item.date || '').includes(searchString)
                    );
                    setFilteredData(filtered);
                }
            }
        } else {
            setFilteredData(reportData);
        }
    }, [searchString, reportData, result]);

    const activeData = filteredData || reportData;

    return (
        <div className='container mt-4'>
            <CollapsibleSection title='Fee User Wise Daily Collection Report' defaultOpen>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='flex justify-center space-x-6'>
                        <Label>Report Type:</Label>
                        <Controller
                            name='type'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex space-x-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='STW' id='stw' />
                                        <Label htmlFor='stw'>Student Wise</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='TCW' id='tcw' />
                                        <Label htmlFor='tcw'>Total Collection</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='ASMAY'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(Number(value))}>
                                            <SelectTrigger>
                                                {academicYears.find((year) => year.asmaY_Id === field.value)?.asmaY_Year ||
                                                    'Select Academic Year'}
                                                {/* <SelectValue placeholder="Select Academic Year" /> */}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            {errors.ASMAY && <FormError>{errors.ASMAY.message}</FormError>}

                            <div className='space-y-2'>
                                <Label>
                                    Group <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='groupIds'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={feeGroups}
                                            onValueChange={(values) => {
                                                const ids = values.map(Number);
                                                field.onChange(ids);
                                            }}
                                            defaultValue={field.value?.map(String) || []}
                                            placeholder='Select groups'
                                            className='min-h-9'
                                        />
                                    )}
                                />
                            </div>
                            {errors.groupIds && <FormError>{errors.groupIds.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            {/* <div className="space-y-2">
                                <Label>From Date <span className="text-red-500">*</span></Label>
                                <input
                                    type="date"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register('fromDate')}
                                />
                                <FormError>{errors.fromDate?.message}</FormError>
                            </div> */}

                            <div className='w-full space-y-2'>
                                <Label>
                                    From Date <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='fromDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date: Date | undefined) => {
                                                field.onChange(date?.toISOString());
                                            }}
                                            placeholder='Select From Date'
                                            className={errors.fromDate ? 'border-red-500' : ''}
                                            disabled={[{ after: today }]}
                                        />
                                    )}
                                />
                                {errors.fromDate && <FormError>{errors.fromDate?.message}</FormError>}
                            </div>

                            {/* <div className="space-y-2">
                                <Label>To Date <span className="text-red-500">*</span></Label>
                                <input
                                    type="date"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register('toDate')}
                                />
                                <FormError>{errors.toDate?.message}</FormError>
                            </div> */}
                            <div className='w-full space-y-2'>
                                <Label>
                                    To Date <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='toDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date: Date | undefined) => field.onChange(date?.toISOString())}
                                            placeholder='Select To Date'
                                            className={errors.toDate ? 'border-red-500' : ''}
                                            disabled={fromDateObject ? [{ before: fromDateObject }, { after: today }] : [{ after: today }]}
                                        />
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate?.message}</FormError>}
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center space-x-4'>
                        <Button type='submit' disabled={isSubmitting}>
                            <Search className='h-4 w-4' />
                            Search Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handleClear}>
                            <X className='h-4 w-4' />
                            Cancel
                        </Button>
                        {showReport && (
                            <>
                                <Button type='button' variant='outline' onClick={handleExportToExcel}>
                                    <Download className='h-4 w-4' />
                                    Export to Excel
                                </Button>
                                <Button type='button' variant='outline' onClick={handlePrint}>
                                    <Printer className='h-4 w-4' />
                                    Print
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </CollapsibleSection>
            {showReport && reportData && (
                <CollapsibleSection title='Report Grid View' defaultOpen className='mt-6'>
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <strong>Total Grid Records:</strong> {activeData?.length || 0}
                            </div>
                            <div>
                                <input
                                    type='text'
                                    placeholder='Search here...'
                                    className='rounded px-3 py-2'
                                    onChange={(e) => setSearchString(e.target.value)}
                                />
                            </div>
                        </div>

                        {watch('type') === 'STW' ? (
                            <Table id='report-table'>
                                <TableHeader className='w-full border bg-violet-600'>
                                    <TableRow>
                                        <TableHead className='border text-white '>
                                            <input
                                                type='checkbox'
                                                checked={Boolean(activeData?.length) && selectedIds.length === activeData?.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className='border-white bg-white text-white'
                                            />
                                        </TableHead>
                                        <TableHead className='w-fit border text-white'>Sl No</TableHead>
                                        <TableHead className='w-fit border text-white'>Student Name</TableHead>
                                        <TableHead className='w-fit border text-white'>Admission No</TableHead>
                                        <TableHead className='w-fit border text-white'>Class Name</TableHead>
                                        <TableHead className='w-fit border text-white'>Section Name</TableHead>
                                        <TableHead className='w-fit min-w-[120px] whitespace-nowrap border text-white'>Date</TableHead>
                                        <TableHead className='w-fit border text-white'>Mode Of Payment</TableHead>
                                        <TableHead className='w-fit border text-white'>Bank Name</TableHead>
                                        <TableHead className='w-fit border text-white'>Cheque No</TableHead>
                                        <TableHead className='w-fit border text-white'>Head Name</TableHead>
                                        <TableHead className='w-fit border text-white'>Amount</TableHead>
                                        <TableHead className='w-fit border text-white'>Receipt No</TableHead>
                                        <TableHead className='w-fit border text-white'>GeneratedBy</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeData?.map((item, index) => (
                                        <TableRow key={index} className={!selectedIds.includes(index) ? 'no-print' : ''}>
                                            <TableCell className='border'>
                                                <input
                                                    type='checkbox'
                                                    checked={selectedIds.includes(index)}
                                                    onChange={(e) => handleSelectRow(index, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell className='w-fit border '>{index + 1}</TableCell>
                                            <TableCell className='w-fit border'>{item.studentName}</TableCell>
                                            <TableCell className='w-fit border'>{item.admissionNo}</TableCell>
                                            <TableCell className='w-fit border'>{item.className}</TableCell>
                                            <TableCell className='w-fit border'>{item.sectionName}</TableCell>
                                            <TableCell className='w-fit min-w-[120px] whitespace-nowrap border'>
                                                {item.date ? item.date.split('T')[0] : ''}
                                            </TableCell>
                                            <TableCell className='w-fit border'>{item.modeOfPayment}</TableCell>
                                            <TableCell className='w-fit border'>{item.bankName}</TableCell>
                                            <TableCell className='w-fit border'>{item.ddOrChequeNo}</TableCell>
                                            <TableCell className='w-fit border'>{item.fmhFeeName}</TableCell>
                                            <TableCell className='w-fit border'>{item.amount || item.totalAmount}</TableCell>
                                            <TableCell className='w-fit border'>{item.receiptNo}</TableCell>
                                            <TableCell className='w-fit border'>{item.generatedBy}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className='no-print border'>
                                        <TableCell colSpan={11} className='border text-center'>
                                            <strong>Total</strong>
                                        </TableCell>
                                        <TableCell colSpan={3} className='border text-center'>
                                            <strong>
                                                {activeData?.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0)}
                                            </strong>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <Table id='report-table'>
                                <TableHeader className='border bg-violet-600'>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type='checkbox'
                                                checked={Boolean(activeData?.length) && selectedIds.length === activeData?.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className='border-white bg-white text-white'
                                            />
                                        </TableHead>
                                        <TableHead className='border text-white'>Sl No</TableHead>
                                        <TableHead className='min-w-[120px] whitespace-nowrap border text-white'>Date</TableHead>
                                        <TableHead className='border text-white'>Mode Of Payment</TableHead>
                                        <TableHead className='border text-white'>Total Amount</TableHead>
                                        <TableHead className='border text-white'>Receipt No</TableHead>
                                        <TableHead className='border text-white'>GeneratedBy</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeData?.map((item, index) => (
                                        <TableRow key={index} className={!selectedIds.includes(index) ? 'no-print' : ''}>
                                            <TableCell>
                                                <input
                                                    type='checkbox'
                                                    checked={selectedIds.includes(index)}
                                                    onChange={(e) => handleSelectRow(index, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell className='border'>{index + 1}</TableCell>
                                            <TableCell className='min-w-[120px] whitespace-nowrap border'>
                                                {item.date ? item.date.split('T')[0] : ''}
                                            </TableCell>
                                            <TableCell className='border'>{item.modeOfPayment}</TableCell>
                                            <TableCell className='border'>{item.amount || item.totalAmount}</TableCell>
                                            <TableCell className='border'>{item.receiptCount}</TableCell>
                                            <TableCell className='border'>{item.generatedBy}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className='no-print'>
                                        <TableCell colSpan={4} className='border'>
                                            <strong>Total</strong>
                                        </TableCell>
                                        <TableCell colSpan={1} className='border'>
                                            <strong>
                                                {activeData?.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0)}
                                            </strong>
                                        </TableCell>
                                        <TableCell colSpan={2} className='border'>
                                            <strong>{activeData?.reduce((sum, item) => sum + (item.receiptCount || 0), 0)}</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
