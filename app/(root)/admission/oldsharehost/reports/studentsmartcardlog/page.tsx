'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useStudentSmartCardLogInitialDetails,
    useStudentSmartCardLogNameRegNo,
    useStudentSmartCardLogReport
} from '@/hooks/admission/oldsharehost/reports/useStudentSmartCardLog';

const formSchema = z
    .object({
        allorindiv: z.enum(['All', 'indi']),
        regorname: z.enum(['regno', 'stdname']).optional(),
        amst_Id: z.string().optional(),
        dailybtedates: z.enum(['daily', 'btwdates']),
        dailydate: z.date().optional().nullable(),
        fromdate: z.date().optional().nullable(),
        todate: z.date().optional().nullable(),
        mallorindi: z.enum(['mall', 'mindi']),
        ASModule: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.allorindiv === 'indi' && !data.amst_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Student Name is required',
                path: ['amst_Id']
            });
        }
        if (data.dailybtedates === 'daily' && !data.dailydate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Date is required',
                path: ['dailydate']
            });
        }
        if (data.dailybtedates === 'btwdates') {
            if (!data.fromdate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'From Date is required',
                    path: ['fromdate']
                });
            }
            if (!data.todate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'To Date is required',
                    path: ['todate']
                });
            }
        }
        if (data.mallorindi === 'mindi' && !data.ASModule) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Module is required',
                path: ['ASModule']
            });
        }
    });

type FormValues = z.infer<typeof formSchema>;

export default function StudentSmartCardLogPage() {
    const { data: initialData, isLoading: isInitialLoading } = useStudentSmartCardLogInitialDetails();
    const nameRegNoMutation = useStudentSmartCardLogNameRegNo();
    const reportMutation = useStudentSmartCardLogReport();

    const [studentList, setStudentList] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Print layout info
    const [logoPath, setLogoPath] = useState('');
    const [disclaimer, setDisclaimer] = useState('');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            allorindiv: 'All',
            regorname: 'regno',
            amst_Id: '',
            dailybtedates: 'daily',
            dailydate: new Date(),
            fromdate: new Date(),
            todate: new Date(),
            mallorindi: 'mall',
            ASModule: ''
        }
    });

    const watchAllOrIndiv = form.watch('allorindiv');
    const watchRegOrName = form.watch('regorname');
    const watchDailyBtwDates = form.watch('dailybtedates');
    const watchMallOrIndi = form.watch('mallorindi');

    useEffect(() => {
        if (watchAllOrIndiv === 'indi' && watchRegOrName) {
            fetchStudentList(watchRegOrName);
        }
    }, [watchAllOrIndiv, watchRegOrName]);

    useEffect(() => {
        if (initialData?.data) {
            setStudentList(initialData.data);
        }
    }, [initialData]);

    const fetchStudentList = async (regorname: string) => {
        try {
            const res = await nameRegNoMutation.mutateAsync({ regornamedetails: regorname });
            if (res?.data?.data) {
                setStudentList(res.data.data);
            } else if (res?.data?.studentlist) {
                setStudentList(res.data.studentlist);
            } else if (Array.isArray(res?.data)) {
                setStudentList(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch student list');
        }
    };

    useEffect(() => {
        // Dummy data for logo path handling (could read from global state if needed)
    }, []);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);

            let dailydateStr = '';
            let fromdateStr = '';
            let todateStr = '';

            if (data.dailybtedates === 'daily' && data.dailydate) {
                fromdateStr = new Date().toDateString();
                todateStr = new Date().toDateString();
                dailydateStr = data.dailydate.toDateString();
            } else if (data.dailybtedates === 'btwdates' && data.fromdate && data.todate) {
                fromdateStr = data.fromdate.toDateString();
                todateStr = data.todate.toDateString();
                dailydateStr = new Date().toDateString();
            }

            const payload = {
                allorindiv: data.allorindiv,
                mallorindi: data.mallorindi,
                regorname: data.allorindiv === 'indi' ? data.regorname : undefined,
                dailydate: dailydateStr,
                dailybtedates: data.dailybtedates,
                fromdate: fromdateStr,
                todate: todateStr,
                Amst_Id: data.amst_Id ? Number(data.amst_Id) : undefined,
                ASMODULE: data.mallorindi === 'mall' ? 'all' : data.ASModule
            };

            const res = await reportMutation.mutateAsync(payload);
            const resultData = res?.data;

            if (resultData?.alldatagridreport && resultData.alldatagridreport.length > 0) {
                // Initialize selected property to false
                const reports = resultData.alldatagridreport.map((x: any) => ({ ...x, selected: false }));
                setReportData(reports);
            } else {
                setReportData([]);
                toast.info('Record Not Found !!');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        form.reset({
            allorindiv: 'All',
            regorname: 'regno',
            amst_Id: '',
            dailybtedates: 'daily',
            dailydate: new Date(),
            fromdate: new Date(),
            todate: new Date(),
            mallorindi: 'mall',
            ASModule: ''
        });
        setReportData([]);
    };

    const selectedRows = reportData.filter((x) => x.selected);

    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.warning('Please Select Records to be Printed');
            return;
        }
        window.print();
    };

    const handleExportExcel = () => {
        if (selectedRows.length === 0) {
            toast.warning('Please Select Records to be Exported');
            return;
        }

        const dataToExport = selectedRows.map((item, index) => ({
            'SL. No.': index + 1,
            'Student Name': item.Name,
            Class: item.Class,
            Section: item.Section,
            'Module Name': item.Modulename,
            Date: item.Mdate ? format(new Date(item.Mdate), 'dd/MM/yyyy') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SmartCard_Log');
        XLSX.writeFile(wb, 'Student_Smart_Card_Log.xlsx');
    };

    // Table Columns Setup
    const columns = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }: any) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'sno',
            header: 'Sno',
            cell: ({ row }: any) => row.index + 1
        },
        {
            accessorKey: 'Name',
            header: 'Student Name'
        },
        {
            accessorKey: 'Class',
            header: 'Class'
        },
        {
            accessorKey: 'Section',
            header: 'Section'
        },
        {
            accessorKey: 'Modulename',
            header: 'Module Name'
        },
        {
            accessorKey: 'Mdate',
            header: 'Date',
            cell: ({ row }: any) => {
                const dateVal = row.original.Mdate;
                return dateVal ? format(new Date(dateVal), 'dd/MM/yyyy') : '';
            }
        }
    ];

    const today = new Date();
    const fromDateValue = form.watch('fromdate');

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4 print:bg-white print:p-0'>
            <div className='print:hidden'>
                <CollapsibleSection title='SmartCard Log Report' defaultOpen={true} variant='outline' className='shadow-md'>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg bg-white p-6'>
                        <div className='mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-6'>
                                <Controller
                                    name='allorindiv'
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className='rounded-md bg-gray-100 p-4 text-center'>
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val === 'All') {
                                                        form.setValue('amst_Id', '');
                                                        form.clearErrors('amst_Id');
                                                    }
                                                }}
                                                value={field.value}
                                                className='flex flex-row justify-center space-x-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='All' id='all-std' />
                                                    <Label htmlFor='all-std'>All Student</Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='indi' id='indi-std' />
                                                    <Label htmlFor='indi-std'>Individual</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                />
                                {form.formState.errors.allorindiv && (
                                    <span className='mt-1 block text-center text-red-500 text-sm'>
                                        {form.formState.errors.allorindiv.message}
                                    </span>
                                )}

                                {watchAllOrIndiv === 'indi' && (
                                    <>
                                        <Controller
                                            name='regorname'
                                            control={form.control}
                                            render={({ field }) => (
                                                <div className='mt-4 rounded-md border bg-gray-50 p-4 text-center'>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className='flex flex-row justify-center space-x-6'>
                                                        <div className='flex items-center space-x-2'>
                                                            <RadioGroupItem value='regno' id='regno' />
                                                            <Label htmlFor='regno'>Register NO.</Label>
                                                        </div>
                                                        <div className='flex items-center space-x-2'>
                                                            <RadioGroupItem value='stdname' id='stdname' />
                                                            <Label htmlFor='stdname'>Name</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            )}
                                        />

                                        <div className='mt-4 space-y-2'>
                                            <Label className='font-bold text-sm'>
                                                Student Name:<span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='amst_Id'
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        disabled={nameRegNoMutation.isPending}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='Select Student' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {studentList?.map((item: any) => {
                                                                const id = item.Amst_id || item.amst_Id;
                                                                const displayName = item.name
                                                                    ? item.name
                                                                    : `${item.amsT_FirstName || ''} ${item.amsT_MiddleName || ''} ${item.amsT_LastName || ''}`.trim();
                                                                return (
                                                                    <SelectItem key={id} value={id?.toString()}>
                                                                        {displayName}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {form.formState.errors.amst_Id && (
                                                <span className='text-red-500 text-sm'>{form.formState.errors.amst_Id.message}</span>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className='pt-2'>
                                    <Controller
                                        name='dailybtedates'
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className='mb-4 rounded-md bg-gray-100 p-4 text-center'>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className='flex flex-row justify-center space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='daily' id='daily' />
                                                        <Label htmlFor='daily'>Daily</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='btwdates' id='btwdates' />
                                                        <Label htmlFor='btwdates'>Between Dates</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        )}
                                    />
                                    {form.formState.errors.dailybtedates && (
                                        <span className='mt-1 block text-center text-red-500 text-sm'>
                                            {form.formState.errors.dailybtedates.message}
                                        </span>
                                    )}

                                    {watchDailyBtwDates === 'daily' ? (
                                        <div className='mt-4 space-y-2'>
                                            <Label className='flex items-center space-x-2 font-bold text-sm'>
                                                <span className='w-20'>
                                                    Date:<span className='text-red-500'>*</span>
                                                </span>
                                                <div className='flex-1'>
                                                    <Controller
                                                        name='dailydate'
                                                        control={form.control}
                                                        render={({ field }) => (
                                                            <DatePicker
                                                                date={field.value || undefined}
                                                                setDate={field.onChange}
                                                                toDate={today}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </Label>
                                            {form.formState.errors.dailydate && (
                                                <span className='ml-22 text-red-500 text-sm'>
                                                    {form.formState.errors.dailydate.message}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='mt-4 grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-sm'>
                                                    From Date:<span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='fromdate'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <DatePicker date={field.value || undefined} setDate={field.onChange} />
                                                    )}
                                                />
                                                {form.formState.errors.fromdate && (
                                                    <span className='text-red-500 text-sm'>{form.formState.errors.fromdate.message}</span>
                                                )}
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='font-bold text-sm'>
                                                    To Date:<span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='todate'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            date={field.value || undefined}
                                                            setDate={field.onChange}
                                                            fromDate={fromDateValue || undefined}
                                                        />
                                                    )}
                                                />
                                                {form.formState.errors.todate && (
                                                    <span className='text-red-500 text-sm'>{form.formState.errors.todate.message}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-6'>
                                <Controller
                                    name='mallorindi'
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className='rounded-md bg-gray-100 p-4 text-center'>
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val === 'mall') {
                                                        form.setValue('ASModule', '');
                                                        form.clearErrors('ASModule');
                                                    }
                                                }}
                                                value={field.value}
                                                className='flex flex-row justify-center space-x-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='mall' id='mall' />
                                                    <Label htmlFor='mall'>All Module</Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='mindi' id='mindi' />
                                                    <Label htmlFor='mindi'>Individual</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                />
                                {form.formState.errors.mallorindi && (
                                    <span className='mt-1 block text-center text-red-500 text-sm'>
                                        {form.formState.errors.mallorindi.message}
                                    </span>
                                )}

                                {watchMallOrIndi === 'mindi' && (
                                    <div className='mt-4 space-y-2'>
                                        <Label className='flex items-center space-x-2 font-bold text-sm'>
                                            <span className='w-32'>
                                                Module Name:<span className='text-red-500'>*</span>
                                            </span>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='ASModule'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Module' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='kiosk'>kiosk</SelectItem>
                                                                <SelectItem value='Fees'>Fees</SelectItem>
                                                                <SelectItem value='Library'>Library</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </Label>
                                        {form.formState.errors.ASModule && (
                                            <span className='ml-34 text-red-500 text-sm'>{form.formState.errors.ASModule.message}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center gap-4 border-t pt-6'>
                            <Button
                                type='submit'
                                disabled={isGenerating}
                                className='min-w-[120px] bg-indigo-600 font-bold text-white hover:bg-indigo-700'>
                                {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                                Report
                            </Button>

                            <Button type='button' onClick={handleClear} variant='destructive' className='min-w-[120px] font-bold'>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>

                            {reportData.length > 0 && (
                                <>
                                    <Button
                                        type='button'
                                        onClick={handlePrint}
                                        className='min-w-[120px] bg-gray-600 font-bold text-white hover:bg-gray-700'>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>

                                    <Button
                                        type='button'
                                        onClick={handleExportExcel}
                                        className='min-w-[120px] bg-green-600 font-bold text-white hover:bg-green-700'>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                                        Export to Excel
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </CollapsibleSection>
            </div>

            {reportData.length > 0 && (
                <div className='print:hidden'>
                    <CollapsibleSection
                        title='SmartCard Log Report Details'
                        defaultOpen={true}
                        variant='outline'
                        className='mt-6 shadow-md'>
                        <div className='rounded-lg bg-white p-4'>
                            <GenericDataTable
                                data={reportData}
                                columns={columns}
                                isLoading={isGenerating}
                                isPaginationRequired={true}
                                onRowSelectionChange={(updatedData: any) => setReportData(updatedData)}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Print Section */}
            {selectedRows.length > 0 && (
                <div className='hidden w-full text-black print:block'>
                    <div className='mb-6 text-center'>
                        {logoPath && <img src={logoPath} alt='Logo' className='mx-auto h-24 object-contain' />}
                        <h4 className='mt-4 font-bold text-xl'>Smart Card Log Report</h4>
                    </div>

                    <table className='mt-4 w-full border-collapse border border-black'>
                        <thead className='bg-gray-100 font-bold'>
                            <tr>
                                <th className='border border-black p-2'>SL. No.</th>
                                <th className='border border-black p-2'>Student Name</th>
                                <th className='border border-black p-2'>Class</th>
                                <th className='border border-black p-2'>Section</th>
                                <th className='border border-black p-2'>Module Name</th>
                                <th className='border border-black p-2'>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedRows.map((user, index) => (
                                <tr key={index}>
                                    <td className='border border-black p-2 text-center'>{index + 1}</td>
                                    <td className='border border-black p-2'>{user.Name}</td>
                                    <td className='border border-black p-2'>{user.Class}</td>
                                    <td className='border border-black p-2'>{user.Section}</td>
                                    <td className='border border-black p-2'>{user.Modulename}</td>
                                    <td className='border border-black p-2 text-center'>
                                        {user.Mdate ? format(new Date(user.Mdate), 'dd/MM/yyyy') : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={6} className='border-black border-t py-4 text-center font-semibold text-sm'>
                                    Date: {format(new Date(), 'dd/MM/yyyy')} | UserName: User
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
