'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeClassListDefaulterreport, useFeeHeadDropDown } from '@/hooks/fees/useReports';
import { feeRefundReportGmvps } from '@/schemas/fees/reports';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import { getFeeRefundReport } from '@/server/fees/reports/fee_refund_report_gmvps';
import type { IFeeClassDropdownList, IFeeSectionDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Input } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
// import DataTablePrint from "./_components/datatable_print";
// import { exportToExcel, printTabl } from "./_components/export_and_excel";

type FormFields = z.infer<typeof feeRefundReportGmvps>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeReFundReportGmvps() {
    const [filters, setFilters] = useState({
        reportType: 'All',
        academicYearId: '',
        classId: '',
        sectionId: '',
        feeHead: ''
    });

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeRefundReportGmvps),
        defaultValues: {
            academicYearId: '',
            reportType: 'All',
            classId: '',
            sectionId: '',
            feeHead: '',
            fromDate: format(new Date(), 'yyyy-MM-dd'),
            toDate: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [SectionLoading, setSectionLoading] = useState(false);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const { data: feeHeadResponse, isLoading: loadingfeeHead } = useFeeHeadDropDown();

    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
            setClasses([]);
            return;
        }
        if (classListResponse?.data && Array.isArray(classListResponse.data)) {
            setClasses(classListResponse.data);
        }
    }, [classListResponse, classListError]);

    const classId = watch('classId') ?? 0;
    const academicYearId = watch('academicYearId');

    useEffect(() => {
        const fetchSections = async () => {
            if (!academicYearId || Number(classId) === 0) {
                setSections([]);
                return;
            }
            const classIdNum = Number(classId);
            if (!academicYearId || !classId || Number.isNaN(classIdNum) || classIdNum <= 0) {
                setSections([]);
                return;
            }
            setSectionLoading(true);

            try {
                const result = await getFeesSectionListByClassId(Number(academicYearId), Number(classId ?? 0));

                const data = Array.isArray(result?.data) ? result.data : [];
                setSections(data);

                if (data.length === 0) {
                    toast.info('No sections found for this class');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load sections');
                setSections([]);
            } finally {
                setSectionLoading(false);
            }
        };

        fetchSections();
    }, [academicYearId, classId, setValue]);

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((r) => r.id));
        }
    };

    const selectedRows = reportData.filter((r) => selectedIds.includes(r.id));

    const handleExport = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }
        // `exportToExcel(selectedRows, filteredHeads, "Fee-Defaulter-Report");`
    };

    const handlePrint = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }

        // const feeTermColumns = filteredHeads.map((head) => head.fmH_FeeName);

        // const columns = [
        //   "Sl No",
        //   "Student Name",
        //   "Adm.No",
        //   "Class",
        //   "Section",
        //   ...feeTermColumns,
        //   "Total Amount",
        // ];

        // const printableRows = selectedRows.map((row, index) => {
        //   const feeTermData: Record<string, number> = {};
        //   filteredHeads.forEach((term) => {
        //     feeTermData[term.fmH_FeeName] = term.amount;
        //   });

        //   return {
        //     "Sl No": index + 1,
        //     "Student Name": row.studentName,
        //     "Adm.No": row.regNo,
        //     Class: row.class,
        //     Section: row.section,
        //     ...feeTermData,
        //     "Total Amount": row.totalAmount,
        //   };
        // });

        // printTabl(columns, printableRows);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setShowReport(false);
        try {
            const payload = {
                asmyid: Number(data.academicYearId),
                asmcL_Id: Number(data.classId) ?? 0,
                regornamedetails: '',
                amsC_Id: Number(data.sectionId) ?? 0,
                asmc_sectionname: '',
                fmh_id: Number(data.feeHead),
                fmh_feename: '',
                fromdate: data.fromDate,
                todate: data.toDate
            };

            const apiData = await getFeeRefundReport(payload);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('apiData', apiData);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                setReportData(responseJson.data);
                setShowReport(true);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='mb-8'>
                                <div className='flex items-center justify-center'>
                                    <Card className='min-w-[400px] border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex justify-center gap-6'>
                                            {['All', 'Individual'].map((option) => (
                                                <Label key={option} className='flex cursor-pointer items-center gap-3'>
                                                    <Input
                                                        type='radio'
                                                        name='reportType'
                                                        checked={filters.reportType === option}
                                                        onChange={() => {
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                reportType: option
                                                            }));
                                                            setValue('reportType', option as 'All' | 'Individual');
                                                            setShowReport(false);
                                                            setReportData([]);
                                                            setSelectedIds([]);
                                                        }}
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium'>{option}</span>
                                                </Label>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            <div className='space-y-8'>
                                <div className='grid grid-cols-2 gap-8'>
                                    <div className='space-y-8'>
                                        <div className='flex items-center gap-4'>
                                            <Label className='w-48 text-right font-medium'>
                                                Academic Year: <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='academicYearId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                setFilters((prev) => ({
                                                                    ...prev,
                                                                    academicYearId: value
                                                                }));
                                                            }}
                                                            value={field.value?.toString() || ''}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue
                                                                    placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {academicYears.map((item) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                            </div>
                                        </div>
                                        {filters.reportType === 'Individual' && (
                                            <div className='flex items-center gap-4'>
                                                <Label className='w-48 text-right font-medium'>
                                                    Class: <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Controller
                                                        name='classId'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} value={field.value?.toString() || ''}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue
                                                                        placeholder={loadingClasses ? 'Loading...' : 'Select Class Name'}
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {classes.map((item) => (
                                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                            {item.asmcL_ClassName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                        <div className='flex items-center gap-4'>
                                            <Label htmlFor='fromDate' className='w-48 text-right font-medium'>
                                                From Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='fromDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex-1'>
                                                        <Input
                                                            id='fromDate'
                                                            type='date'
                                                            {...field}
                                                            className='w-full rounded border px-3 py-1'
                                                        />
                                                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className='space-y-8'>
                                        <div className='flex items-center gap-4'>
                                            <Label className='w-48 text-right font-medium'>
                                                Fee Head: <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='feeHead'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                setFilters((prev) => ({
                                                                    ...prev,
                                                                    feeHead: value
                                                                }));
                                                            }}
                                                            value={field.value?.toString() || ''}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue
                                                                    placeholder={loadingfeeHead ? 'Loading...' : 'Select Fee Head'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {feeHeadResponse?.data?.map((item) => (
                                                                    <SelectItem key={item.fmH_Id} value={item.fmH_Id.toString()}>
                                                                        {item.fmH_FeeName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.feeHead && <FormError>{errors.feeHead.message}</FormError>}
                                            </div>
                                        </div>
                                        {filters.reportType === 'Individual' && (
                                            <div className='flex items-center gap-4'>
                                                <Label className='w-48 text-right font-medium'>
                                                    Section: <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Controller
                                                        name='sectionId'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select onValueChange={field.onChange} value={field.value?.toString() || ''}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue
                                                                        placeholder={SectionLoading ? 'Loading...' : 'Select Section Name'}
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {sections.map((item) => (
                                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                            {item.asmC_SectionName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                        <div className='flex items-center gap-4'>
                                            <Label htmlFor='toDate' className='w-48 text-right font-medium'>
                                                To Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='toDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex-1'>
                                                        <Input
                                                            id='toDate'
                                                            type='date'
                                                            {...field}
                                                            className='w-full rounded border px-3 py-1'
                                                        />
                                                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex justify-end gap-4 border-t pt-8'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='px-8'
                                        onClick={() => window.location.reload()}
                                        type='button'>
                                        Cancel
                                    </Button>
                                    <Button type='submit' disabled={isSubmitting} className='px-12'>
                                        {isSubmitting ? 'Generating...' : 'Generate Report'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Report Section */}
                    {showReport && (
                        <CollapsibleSection defaultOpen={true}>
                            <div className='mt-8 rounded-lg border bg-white shadow-xl'>
                                {/* Header */}
                                <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                    <div className='text-center'>
                                        <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                    </div>
                                    <div className='flex gap-3'>
                                        <Button
                                            size='sm'
                                            className='h-8 w-auto px-3 text-xs'
                                            onClick={handleExport}
                                            disabled={!selectedRows.length}>
                                            Export Excel
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='h-8 w-auto px-3 text-xs'
                                            onClick={handlePrint}
                                            disabled={!selectedRows.length}>
                                            Print
                                        </Button>
                                    </div>
                                </div>

                                {/* TABLE */}
                                <div className='overflow-x-auto'>
                                    <table className='w-full border-collapse text-sm'>
                                        <thead className='bg-primary text-white'>
                                            <tr>
                                                <th className='border px-4 py-3 text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={selectedIds.length === reportData.length && reportData.length > 0}
                                                        onChange={toggleAll}
                                                    />
                                                </th>
                                                <th className='border px-4 py-3'>Sl No</th>
                                                <th className='border px-4 py-3'>ADMNO:Student Name</th>
                                                <th className='border px-4 py-3'>Class:Section</th>
                                                <th className='border px-4 py-3'>Refund Date</th>
                                                <th className='border px-4 py-3'>Receipt No</th>
                                                <th className='border px-4 py-3'>Fee Head</th>
                                                <th className='border px-4 py-3'>Refund Amount</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reportData.map((row, index) => (
                                                <tr
                                                    key={row.id}
                                                    className={
                                                        selectedIds.includes(row.id)
                                                            ? 'bg-blue-100'
                                                            : index % 2 === 0
                                                              ? 'bg-white'
                                                              : 'bg-gray-50'
                                                    }>
                                                    <td className='border px-4 py-2 text-center'>
                                                        <input
                                                            type='checkbox'
                                                            checked={selectedIds.includes(row.id)}
                                                            onChange={() => toggleRow(row.id)}
                                                        />
                                                    </td>
                                                    <td className='border px-4 py-2 text-center'>{index + 1}</td>
                                                    <td className='border px-4 py-2 font-semibold'>{row.studentName}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.regNo}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.class}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.section}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.refundDate}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.receiptNo}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.feeHead}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.refundAmount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {/* {showPrint && (
                    <DataTablePrint onClose={() => setShowPrint(false)} />
                  )} */}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </form>
        </div>
    );
}
