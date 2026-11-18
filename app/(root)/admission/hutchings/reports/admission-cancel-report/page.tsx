'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import {
    useAdmissionCancelReportByYearMutation,
    useAdmissionCancelReportInitialDetails
} from '@/hooks/admission/hutchings/useAdmissionCancelReport';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function AdmissionCancelReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedYearName, setSelectedYearName] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    // Fetch initial details (Academic Years)
    const { data: initialDetails, isLoading: isInitialLoading } = useAdmissionCancelReportInitialDetails();

    const academicYears: any[] = (initialDetails as any)?.allAcademicYear || [];

    const fetchReportMutation = useAdmissionCancelReportByYearMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: ''
        }
    });

    const onSubmit = (data: FormValues) => {
        // Find selected year name for display
        const yearObj = Array.isArray(academicYears) ? academicYears.find((y: any) => y.asmaY_Id.toString() === data.ASMAY_Id) : null;
        if (yearObj) {
            setSelectedYearName(yearObj.asmaY_Year);
        }

        fetchReportMutation.mutate(
            { ASMAY_Id: Number(data.ASMAY_Id) },
            {
                onSuccess: (res: any) => {
                    const studentDetails: any[] = res?.getwdstudentdetails || [];
                    if (studentDetails.length > 0) {
                        setReportData(studentDetails);
                    } else {
                        setReportData([]);
                        toast.error('No Records Found');
                    }
                },
                onError: () => {
                    toast.error('Failed to fetch report data');
                }
            }
        );
    };

    const handleClear = () => {
        form.reset();
        setReportData([]);
        setSelectedYearName('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Admission_Cancel_Report'
    });

    const handleExcelExport = () => {
        if (reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const excelData = (Array.isArray(reportData) ? reportData : []).map((item, index) => ({
            'Sl.No': index + 1,
            'Student Name': item.studentname,
            Admno: item.amsT_AdmNo,
            Class: item.asmcL_ClassName,
            Section: item.asmC_SectionName,
            Date: item.aacA_ACDate ? format(new Date(item.aacA_ACDate), 'dd-MM-yyyy') : '',
            Reason: item.aacA_ACReason,
            'Cancelled Fee': item.aacA_CancellationFee,
            'Refund Amount': item.aacA_ToRefundAmount
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, 'Admission_Cancelled_Report.xlsx');
    };

    const columns = [
        {
            header: 'Sl.No',
            cell: (info: any) => info.row.index + 1
        },
        { accessorKey: 'asmaY_Year', header: 'Year' },
        { accessorKey: 'studentname', header: 'Student Name' },
        { accessorKey: 'amsT_AdmNo', header: 'Admno' },
        { accessorKey: 'asmcL_ClassName', header: 'Class' },
        { accessorKey: 'asmC_SectionName', header: 'Section' },
        {
            accessorKey: 'aacA_ACDate',
            header: 'Date',
            cell: (info: any) => (info.getValue() ? format(new Date(info.getValue()), 'dd-MM-yyyy') : '')
        },
        { accessorKey: 'aacA_ACReason', header: 'Reason' },
        { accessorKey: 'aacA_CancellationFee', header: 'Cancelled Fee' },
        { accessorKey: 'aacA_ToRefundAmount', header: 'Refund Amount' }
    ];

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <CollapsibleSection
                        title='Student Cancel Or Withdraw Report'
                        description='View students who have cancelled or withdrawn their admission'
                        defaultOpen={true}
                        variant='outline'
                        className='shadow-lg'>
                        <div className='grid grid-cols-1 gap-8 bg-white p-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                        <FormLabel className='m-0 pt-2 text-right font-bold text-sm'>
                                            Academic Year:<span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <div className='space-y-1'>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    // Trigger fetch automatically on change like Angular
                                                    form.handleSubmit(onSubmit)();
                                                }}
                                                value={field.value}
                                                disabled={isInitialLoading}>
                                                <FormControl>
                                                    <SelectTrigger className='h-8'>
                                                        <SelectValue placeholder='--Select Year--' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(Array.isArray(academicYears) ? academicYears : []).map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className='flex flex-wrap items-center justify-center gap-4'>
                                <Button
                                    type='button'
                                    onClick={handleClear}
                                    className='min-w-[100px] bg-red-500 text-white hover:bg-red-600'>
                                    <X className='mr-2 h-4 w-4' /> Cancel
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleExcelExport}
                                    disabled={reportData.length === 0}
                                    className='min-w-[100px] bg-blue-600 text-white hover:bg-blue-700'>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' /> Export To Excel
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handlePrint}
                                    disabled={reportData.length === 0}
                                    className='min-w-[100px] bg-gray-200 text-gray-800 hover:bg-gray-300'>
                                    <Printer className='mr-2 h-4 w-4' /> Print
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </form>
            </Form>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title="STUDENT'S CANCEL OR WITH DRAW REPORT DETAILS"
                    defaultOpen={true}
                    variant='outline'
                    className='shadow-lg'>
                    <div className='bg-white p-4'>
                        <GenericDataTable
                            data={reportData}
                            columns={columns}
                            isLoading={fetchReportMutation.isPending}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Print Layout */}
            <div className='hidden'>
                <div ref={printRef} className='p-8'>
                    <div className='mb-6 text-center'>
                        <h2 className='mb-2 font-bold text-xl'>Admission Cancelled Report : {selectedYearName}</h2>
                    </div>
                    <table className='mt-4 w-full border-collapse border border-gray-300 text-sm'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2 text-center'>Sl.No</th>
                                <th className='border border-gray-300 p-2 text-left'>Student Name</th>
                                <th className='border border-gray-300 p-2 text-left'>Admno</th>
                                <th className='border border-gray-300 p-2 text-center'>Class</th>
                                <th className='border border-gray-300 p-2 text-left'>Section</th>
                                <th className='border border-gray-300 p-2 text-center'>Date</th>
                                <th className='border border-gray-300 p-2 text-left'>Reason</th>
                                <th className='border border-gray-300 p-2 text-right'>Cancelled Fee</th>
                                <th className='border border-gray-300 p-2 text-right'>Refund Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(reportData) ? reportData : []).map((item, index) => (
                                <tr key={index}>
                                    <td className='border border-gray-300 p-2 text-center'>{index + 1}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{item.studentname}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{item.amsT_AdmNo}</td>
                                    <td className='border border-gray-300 p-2 text-center'>{item.asmcL_ClassName}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{item.asmC_SectionName}</td>
                                    <td className='border border-gray-300 p-2 text-center'>
                                        {item.aacA_ACDate ? format(new Date(item.aacA_ACDate), 'dd-MM-yyyy') : ''}
                                    </td>
                                    <td className='border border-gray-300 p-2 text-left'>{item.aacA_ACReason}</td>
                                    <td className='border border-gray-300 p-2 text-right'>{item.aacA_CancellationFee}</td>
                                    <td className='border border-gray-300 p-2 text-right'>{item.aacA_ToRefundAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
