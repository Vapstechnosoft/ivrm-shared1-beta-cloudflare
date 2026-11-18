'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, FileSpreadsheet, Mail, MessageSquare, Printer, Search, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import {
    useReportProspectusDetails,
    useReportProspectusInitialData,
    useSearchReportProspectus,
    useSendMail,
    useSendSms
} from '@/hooks/admission/preadmission/sophia/reports/useReportProspectus';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
const formSchema = z
    .object({
        yearwiseorbtwdates: z.enum(['yearwise', 'btwdates'], {
            required_error: 'Please select Year Wise or Between Dates'
        }),
        ASMAY: z.string().optional(),
        FromDate: z.date().optional(),
        ToDate: z.date().optional()
    })
    .refine(
        (data) => {
            if (data.yearwiseorbtwdates === 'yearwise') {
                return !!data.ASMAY;
            }
            if (data.yearwiseorbtwdates === 'btwdates') {
                return !!data.FromDate && !!data.ToDate;
            }
            return true;
        },
        {
            message: 'Please fill in the required fields based on your selection',
            path: ['yearwiseorbtwdates'] // attach error to radio group, or could attach to specific fields
        }
    );

type FormValues = z.infer<typeof formSchema>;

export default function ReportProspectusPage() {
    const { data: initialData, isLoading: isInitialLoading } = useReportProspectusInitialData();
    const getDetailsMutation = useReportProspectusDetails();
    const searchMutation = useSearchReportProspectus();
    const sendMailMutation = useSendMail();
    const sendSmsMutation = useSendSms();
    const { institutionData } = { institutionData: [{ asC_Logo_Path: '', userName: 'Admin' }] }; // Dummy data since provider doesn't exist

    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');

    const printRef = useRef<HTMLDivElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            yearwiseorbtwdates: 'yearwise',
            ASMAY: ''
        }
    });

    const watchOption = form.watch('yearwiseorbtwdates');

    const onSubmit = async (values: FormValues) => {
        const payload: any = {
            MI_Id: 2
        };

        if (values.yearwiseorbtwdates === 'yearwise') {
            payload.ASMAY_Id = values.ASMAY;
            payload.From_Date = '';
            payload.To_Date = '';
        } else {
            payload.ASMAY_Id = 0;
            payload.From_Date = values.FromDate ? format(values.FromDate, 'yyyy-MM-dd') : '';
            payload.To_Date = values.ToDate ? format(values.ToDate, 'yyyy-MM-dd') : '';
        }

        try {
            const result = await getDetailsMutation.mutateAsync(payload);
            const studentDetails = result?.data?.searchstudentDetails || result?.searchstudentDetails;

            if (studentDetails && studentDetails.length > 0) {
                setReportData(studentDetails);
                setSelectedIds(new Set()); // Reset selections
            } else {
                setReportData([]);
                toast.error('No Records Found');
            }
        } catch (error) {
            toast.error('Error fetching report');
        }
    };

    const onClear = () => {
        form.reset();
        setReportData([]);
        setSelectedIds(new Set());
        setSearchTerm('');
        setSearchType('all');
    };

    const handleBackendSearch = async () => {
        const values = form.getValues();
        let asmaY_Id = 0;
        let from_Date = '';
        let to_Date = '';

        if (values.yearwiseorbtwdates === 'yearwise') {
            asmaY_Id = Number.parseInt(values.ASMAY || '0', 10);
        } else {
            from_Date = values.FromDate ? format(values.FromDate, 'yyyy-MM-dd') : '';
            to_Date = values.ToDate ? format(values.ToDate, 'yyyy-MM-dd') : '';
        }

        const payload = {
            asmaY_Id,
            from_Date,
            to_Date,
            searchType,
            searchString: searchType === 'all' ? '' : searchTerm
        };

        try {
            const result = await searchMutation.mutateAsync(payload);
            const studentDetails = result?.data?.searchstudentDetails || result?.searchstudentDetails;
            if (studentDetails && studentDetails.length > 0) {
                setReportData(studentDetails);
                setSelectedIds(new Set());
            } else {
                setReportData([]);
                toast.error('No Records Found');
            }
        } catch (error) {
            toast.error('Error searching records');
        }
    };

    const handleSendSms = async () => {
        if (selectedData.length === 0) {
            toast.warning('Please select records to send SMS');
            return;
        }

        const payload = {
            smsMailStudentDetails: selectedData.map((user) => ({
                id: user.pasP_Id || 0,
                pasE_MobileNo: user.pasP_MobileNo || 0
            }))
        };

        try {
            const result = await sendSmsMutation.mutateAsync(payload);
            if (result?.success || result?.message?.toLowerCase().includes('success')) {
                toast.success(result?.message || 'SMS sent successfully');
            } else {
                toast.error(result?.message || 'Failed to send SMS');
            }
        } catch (error) {
            toast.error('Error sending SMS');
        }
    };

    const handleSendMail = async () => {
        if (selectedData.length === 0) {
            toast.warning('Please select records to send Email');
            return;
        }

        const payload = {
            smsMailStudentDetails: selectedData.map((user) => ({
                pasE_emailid: user.pasP_emailid || ''
            }))
        };

        try {
            const result = await sendMailMutation.mutateAsync(payload);
            if (result?.success || result?.message?.toLowerCase().includes('success')) {
                toast.success(result?.message || 'Email sent successfully');
            } else {
                toast.error(result?.message || 'Failed to send Email');
            }
        } catch (error) {
            toast.error('Error sending Email');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(reportData.map((item, index) => index)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (index: number, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(index);
        } else {
            newSelected.delete(index);
        }
        setSelectedIds(newSelected);
    };

    const selectedData = reportData.filter((_, index) => selectedIds.has(index));

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Prospectus_Report'
    });

    const exportToExcel = () => {
        if (selectedData.length === 0) {
            toast.warning('Please select records to export');
            return;
        }

        const excelData = selectedData.map((user, index) => ({
            'SL.NO.': index + 1,
            'FIRST NAME': user.pasP_FirstName,
            'Father Name': user.pasP_MiddleName,
            'Date of Birth': user.pasP_LastName, // This matches original angular mapping
            'EMAIL-ID': user.pasP_emailid,
            'Mobile Number': user.pasP_MobileNo,
            'PHONE NO': user.pasP_Phone,
            DATE: format(new Date(user.pasP_Date), 'dd-MM-yyyy'),
            State: user.state,
            'Prospectus No': user.pasP_ProspectusNo
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospectus Report');
        XLSX.writeFile(workbook, 'Prospectus_Report.xlsx');
    };

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Prospectus Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <div className='mb-6 flex justify-center'>
                                <FormField
                                    control={form.control}
                                    name='yearwiseorbtwdates'
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue('ASMAY', '');
                                                        form.setValue('FromDate', undefined);
                                                        form.setValue('ToDate', undefined);
                                                    }}
                                                    defaultValue={field.value}
                                                    className='flex space-x-6'>
                                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                                        <FormControl>
                                                            <RadioGroupItem value='yearwise' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>
                                                            Year Wise <span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                                        <FormControl>
                                                            <RadioGroupItem value='btwdates' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>
                                                            Between Dates <span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {watchOption === 'yearwise' && (
                                <div className='flex justify-center'>
                                    <FormField
                                        control={form.control}
                                        name='ASMAY'
                                        render={({ field }) => (
                                            <FormItem className='w-1/2'>
                                                <FormLabel>
                                                    Academic Year <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Academic Year' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(initialData?.data?.fillyear || initialData?.fillyear)?.map((year: any) => (
                                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                                {year.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {watchOption === 'btwdates' && (
                                <div className='flex justify-center gap-6'>
                                    <FormField
                                        control={form.control}
                                        name='FromDate'
                                        render={({ field }) => (
                                            <FormItem className='flex w-1/3 flex-col'>
                                                <FormLabel>
                                                    From Date <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={'outline'}
                                                                className={cn(
                                                                    'w-full pl-3 text-left font-normal',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}>
                                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='ToDate'
                                        render={({ field }) => (
                                            <FormItem className='flex w-1/3 flex-col'>
                                                <FormLabel>
                                                    To Date <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={'outline'}
                                                                className={cn(
                                                                    'w-full pl-3 text-left font-normal',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}>
                                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                const fromDate = form.getValues('FromDate');
                                                                return (
                                                                    date > new Date() ||
                                                                    date < new Date('1900-01-01') ||
                                                                    (fromDate ? date < fromDate : false)
                                                                );
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <div className='flex justify-center space-x-4 pt-4'>
                                <Button type='submit' disabled={getDetailsMutation.isPending}>
                                    <Search className='mr-2 h-4 w-4' /> Search
                                </Button>
                                <Button type='button' variant='destructive' onClick={onClear}>
                                    <X className='mr-2 h-4 w-4' /> Cancel
                                </Button>
                                {reportData.length > 0 && (
                                    <>
                                        <Button
                                            type='button'
                                            variant='secondary'
                                            onClick={handleSendSms}
                                            disabled={sendSmsMutation.isPending}>
                                            <MessageSquare className='mr-2 h-4 w-4' /> Send SMS
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='secondary'
                                            onClick={handleSendMail}
                                            disabled={sendMailMutation.isPending}>
                                            <Mail className='mr-2 h-4 w-4' /> Send Mail
                                        </Button>
                                        <Button type='button' variant='secondary' onClick={exportToExcel}>
                                            <FileSpreadsheet className='mr-2 h-4 w-4' /> Export to Excel
                                        </Button>
                                        <Button type='button' variant='secondary' onClick={handlePrint}>
                                            <Printer className='mr-2 h-4 w-4' /> Print
                                        </Button>
                                    </>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {reportData.length > 0 && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle>Prospectus Report Details</CardTitle>
                        <div className='flex items-center space-x-2'>
                            <div className='mr-4 font-medium text-sm'>
                                Total Records: <span className='text-muted-foreground'>{reportData.length}</span>
                            </div>
                            <Select value={searchType} onValueChange={setSearchType}>
                                <SelectTrigger className='w-[150px]'>
                                    <SelectValue placeholder='Search By' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All</SelectItem>
                                    <SelectItem value='first_name'>First Name</SelectItem>
                                    <SelectItem value='middle_name'>Middle Name</SelectItem>
                                    <SelectItem value='last_name'>Last Name</SelectItem>
                                    <SelectItem value='email_id'>Email ID</SelectItem>
                                    <SelectItem value='mobile_no'>Mobile No.</SelectItem>
                                    <SelectItem value='phone_no'>Phone No.</SelectItem>
                                    <SelectItem value='date_search'>Date</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder='Search...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-[150px]'
                                disabled={searchType === 'all'}
                            />
                            <Button type='button' onClick={handleBackendSearch} disabled={searchMutation.isPending}>
                                Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='max-h-[500px] overflow-x-auto rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[50px]'>
                                            <Checkbox
                                                checked={reportData.length > 0 && selectedIds.size === reportData.length}
                                                onCheckedChange={handleSelectAll}
                                                aria-label='Select all'
                                            />
                                        </TableHead>
                                        <TableHead>SL.NO.</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Father Name</TableHead>
                                        <TableHead>Date of Birth</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Mobile No.</TableHead>
                                        <TableHead>Phone No.</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>Prospectus No</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.has(index)}
                                                    onCheckedChange={(checked) => handleSelect(index, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{user.pasP_FirstName}</TableCell>
                                            <TableCell>{user.pasP_MiddleName}</TableCell>
                                            <TableCell>{user.pasP_LastName}</TableCell>
                                            <TableCell>{user.pasP_emailid}</TableCell>
                                            <TableCell>{user.pasP_MobileNo}</TableCell>
                                            <TableCell>{user.pasP_Phone}</TableCell>
                                            <TableCell>{user.pasP_Date ? format(new Date(user.pasP_Date), 'dd-MM-yyyy') : ''}</TableCell>
                                            <TableCell>{user.state}</TableCell>
                                            <TableCell>{user.pasP_ProspectusNo}</TableCell>
                                        </TableRow>
                                    ))}
                                    {reportData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={11} className='h-24 text-center'>
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Hidden Print Layout */}
            <div style={{ display: 'none' }}>
                <div ref={printRef} className='p-8'>
                    <div className='mb-6 text-center'>
                        {institutionData && institutionData[0]?.asC_Logo_Path && (
                            <img src={institutionData[0].asC_Logo_Path} alt='Logo' className='mx-auto mb-4 h-24' />
                        )}
                        <h2 className='font-bold text-2xl underline'>PROSPECTUS REPORT</h2>
                    </div>
                    <table className='w-full border-collapse border border-black'>
                        <thead>
                            <tr>
                                <th className='border border-black p-2'>SL.NO.</th>
                                <th className='border border-black p-2'>FIRST NAME</th>
                                <th className='border border-black p-2'>Father Name</th>
                                <th className='border border-black p-2'>Date of Birth</th>
                                <th className='border border-black p-2'>EMAIL-ID</th>
                                <th className='border border-black p-2'>Mobile Number</th>
                                <th className='border border-black p-2'>PHONE NO</th>
                                <th className='border border-black p-2'>DATE</th>
                                <th className='border border-black p-2'>State</th>
                                <th className='border border-black p-2'>Prospectus No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedData.map((user, index) => (
                                <tr key={index}>
                                    <td className='border border-black p-2 text-center'>{index + 1}</td>
                                    <td className='border border-black p-2'>{user.pasP_FirstName}</td>
                                    <td className='border border-black p-2'>{user.pasP_MiddleName}</td>
                                    <td className='border border-black p-2'>{user.pasP_LastName}</td>
                                    <td className='border border-black p-2'>{user.pasP_emailid}</td>
                                    <td className='border border-black p-2'>{user.pasP_MobileNo}</td>
                                    <td className='border border-black p-2'>{user.pasP_Phone}</td>
                                    <td className='border border-black p-2 text-center'>
                                        {user.pasP_Date ? format(new Date(user.pasP_Date), 'dd-MM-yyyy') : ''}
                                    </td>
                                    <td className='border border-black p-2'>{user.state}</td>
                                    <td className='border border-black p-2'>{user.pasP_ProspectusNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='mt-8 text-sm'>
                        Date: {format(new Date(), 'dd/MM/yyyy')} | UserName: {institutionData?.[0]?.userName || ''}
                    </div>
                </div>
            </div>
        </div>
    );
}
