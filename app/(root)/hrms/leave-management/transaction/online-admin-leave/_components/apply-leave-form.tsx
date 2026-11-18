'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSaveAdminEmployeeLeaveApplication } from '@/hooks/hrms/leave-management/useOnlineAdminLeave';
import { cn } from '@/lib/utils';
import { saveLeaveRequestDocument } from '@/server/hrms/leave-management/transaction/online-leave-application';
import type { OnlineAdminLeaveApplication } from '@/types/hrms/leave-management/online-admin-leave';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ArrowRight, CalendarIcon, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z
    .object({
        hrmE_Id: z.coerce.number().min(1, 'Employee is required'),
        hrmL_Id: z.coerce.number().min(1, 'Leave type is required'),
        fromDate: z.date({ required_error: 'From date is required' }),
        toDate: z.date({ required_error: 'To date is required' }),
        totalDays: z.coerce.number().min(0.5, 'Total days must be at least 0.5'),
        leaveReason: z.string().min(1, 'Reason is required'),
        reportingDate: z.date({ required_error: 'Reporting date is required' }),
        supportingDocument: z.string().optional(),
        contactNoOnLeave: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits')
    })
    .refine((data) => data.toDate >= data.fromDate, {
        message: 'To Date cannot be before From Date',
        path: ['toDate']
    });

type FormValues = z.infer<typeof formSchema>;

interface ApplyLeaveFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    editingRow?: OnlineAdminLeaveApplication | null;
    selectedEmployeeId: number | null;
    selectedLeave?: any | null;
    selectedFromDate?: Date;
    selectedToDate?: Date;
    totalDays?: number;
    combinedBalanceData?: any; // Add this prop
    isLoadingBalance?: boolean; // Add this prop
}

export default function ApplyLeaveForm({
    onSuccess,
    onCancel,
    editingRow,
    selectedEmployeeId,
    selectedLeave,
    selectedFromDate,
    selectedToDate,
    totalDays,
    combinedBalanceData,
    isLoadingBalance
}: ApplyLeaveFormProps) {
    const { mutate: saveLeave, isPending } = useSaveAdminEmployeeLeaveApplication();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hrmE_Id: selectedEmployeeId || 0,
            hrmL_Id: 0,
            totalDays: 1,
            leaveReason: '',
            reportingDate: new Date(),
            supportingDocument: '',
            contactNoOnLeave: ''
        }
    });
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [isReportingDateOpen, setIsReportingDateOpen] = useState(false);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const hrmL_Id = form.watch('hrmL_Id');
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const fromDate = form.watch('fromDate');
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const toDate = form.watch('toDate');

    // Sync hrmE_Id with selectedEmployeeId
    useEffect(() => {
        if (selectedEmployeeId) {
            form.setValue('hrmE_Id', selectedEmployeeId);
        }
    }, [selectedEmployeeId, form]);

    // Sync with selectedLeave and Picked Dates from Parent
    useEffect(() => {
        if (selectedLeave) {
            form.setValue('hrmL_Id', selectedLeave.hrmL_Id);
            form.setValue('reportingDate', new Date());
        }
    }, [selectedLeave, form]);

    useEffect(() => {
        if (selectedFromDate) form.setValue('fromDate', selectedFromDate);
    }, [selectedFromDate, form]);

    useEffect(() => {
        if (selectedToDate) form.setValue('toDate', selectedToDate);
    }, [selectedToDate, form]);

    useEffect(() => {
        if (totalDays !== undefined) form.setValue('totalDays', totalDays);
    }, [totalDays, form]);

    useEffect(() => {
        if (editingRow) {
            form.reset({
                hrmE_Id: selectedEmployeeId || 0,
                hrmL_Id: editingRow.hrmL_Id,
                fromDate: new Date(editingRow.hrelaP_FromDate),
                toDate: new Date(editingRow.hrelaP_ToDate),
                totalDays: editingRow.hreltD_TotDays,
                leaveReason: editingRow.hrelaP_LeaveReason,
                reportingDate: new Date(),
                supportingDocument: editingRow.hrelaP_SupportingDocument,
                contactNoOnLeave: ''
            });
        }
    }, [editingRow, form, selectedEmployeeId]);

    function onSubmit(values: FormValues) {
        console.log('values', values);
        saveLeave(
            {
                HRME_Id: values.hrmE_Id,
                HRELT_Reportingdate: values.reportingDate.toISOString(),
                HRELT_LeaveReason: values.leaveReason,
                HRELT_SupportingDocument: values.supportingDocument || '',
                HRELT_ContactNoOnLeave: values.contactNoOnLeave,
                frmToDates: [
                    {
                        HRELAP_FromDate: values.fromDate.toISOString(),
                        HRELAP_ToDate: values.toDate.toISOString(),
                        HRELAP_TotalDays: values.totalDays
                    }
                ],
                temp_table_data: [
                    {
                        HRML_Id: values.hrmL_Id
                    }
                ]
            },
            {
                onSuccess: () => {
                    form.reset({
                        hrmE_Id: selectedEmployeeId || 0,
                        hrmL_Id: 0,
                        totalDays: 1,
                        leaveReason: '',
                        reportingDate: new Date(),
                        fromDate: undefined,
                        toDate: undefined,
                        supportingDocument: '',
                        contactNoOnLeave: ''
                    });
                    onSuccess?.();
                }
            }
        );
    }

    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

    // Reset uploaded file name if the form is reset or successful
    useEffect(() => {
        if (!form.watch('supportingDocument')) {
            setUploadedFileName(null);
        }
    }, [form.watch('supportingDocument')]);

    const handleFileUrl = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const hrmeId = form.getValues('hrmE_Id');

        if (!hrmeId || hrmeId === 0) {
            toast.error('Please select an employee first');
            return;
        }

        if (file) {
            try {
                setIsUploading(true);
                const formData = new FormData();

                // The swagger UI specifically expects the key 'leave_document'
                formData.append('leave_document', file);
                const response = await saveLeaveRequestDocument(hrmeId, formData);
                console.log('Upload API response:', response);

                if (response.success && response.data) {
                    form.setValue('supportingDocument', response.data);
                    setUploadedFileName(file.name);
                    toast.success('Document uploaded successfully');
                } else {
                    toast.error(response.message || 'Failed to upload document');
                }
            } catch (error: any) {
                toast.error(error.message || 'Error uploading document');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleViewFile = () => {
        const file = form.getValues('supportingDocument');
        if (file) {
            setPreviewFile(file);
        }
    };

    return (
        <div className='slide-in-from-top-2 animate-in space-y-8 p-6 pt-0 duration-300'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Middle Row: Details */}
                    <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='leaveReason'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='mb-1 flex items-center gap-2'>
                                        <FormLabel className='font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                            Reasons for Leave: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            className='h-11 rounded-xl border-sky-100 bg-white shadow-sm focus:ring-sky-100'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='contactNoOnLeave'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='mb-1 flex items-center gap-1'>
                                        <FormLabel className='font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                            Contact Number While on Leave: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input
                                            className='h-11 rounded-xl border-sky-100 bg-white shadow-sm focus:ring-sky-100'
                                            type='text'
                                            maxLength={10}
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='reportingDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='mb-1 block font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                        Date Reporting Back
                                    </FormLabel>
                                    <Popover open={isReportingDateOpen} onOpenChange={setIsReportingDateOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    className={cn(
                                                        'h-11 w-full rounded-xl border-slate-200 bg-white text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4 text-slate-400' />
                                                    {field.value ? format(field.value, 'dd-MM-yyyy') : '01-03-2025'}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    setIsReportingDateOpen(false);
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel className='mb-1 block font-black text-[10px] text-slate-500 uppercase tracking-wider'>
                                Supporting Document
                            </FormLabel>
                            <FormControl>
                                <div className='relative w-full'>
                                    <Input
                                        type='file'
                                        className='absolute inset-0 z-10 cursor-pointer opacity-0'
                                        onChange={handleFileUrl}
                                        disabled={isUploading}
                                    />
                                    <Button
                                        type='button'
                                        variant='outline'
                                        disabled={isUploading}
                                        className='flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-amber-400 font-bold text-[10px] text-slate-900 uppercase shadow-sm hover:bg-amber-700'>
                                        <FileText className='h-4 w-4' /> {isUploading ? 'Uploading...' : 'Choose File'}
                                    </Button>
                                    <div className='mt-2 flex items-center gap-2'>
                                        {uploadedFileName && (
                                            <span className='w-full truncate text-[10px] text-slate-400 italic' title={uploadedFileName}>
                                                {uploadedFileName}
                                            </span>
                                        )}
                                        {uploadedFileName && (
                                            <div
                                                className='cursor-pointer pr-2 font-semibold text-[12px] hover:text-orange-500'
                                                onClick={handleViewFile}>
                                                View
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </FormControl>
                            {previewFile && (
                                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                                    {/* Popup Box */}
                                    <div className='relative w-full max-w-3xl rounded-lg bg-white p-4 shadow-lg'>
                                        {/* Close Button */}
                                        <button
                                            onClick={() => setPreviewFile(null)}
                                            className='absolute top-2 right-2 rounded bg-red-500 px-3 py-1 text-white'>
                                            ✕
                                        </button>

                                        {/* Image */}
                                        <img src={previewFile} alt='Preview' className='max-h-[70vh] w-full rounded object-contain' />
                                    </div>
                                </div>
                            )}
                        </FormItem>
                    </div>

                    {/* Bottom Actions Cluster */}
                    <div className='flex flex-col items-center gap-6 pt-8'>
                        <div className='flex items-center gap-4'>
                            <Button
                                type='submit'
                                disabled={combinedBalanceData?.length === 0 || isPending || !selectedEmployeeId}
                                className='flex h-12 items-center gap-3 rounded-full bg-orange-500 px-16 font-black text-sm text-white uppercase shadow-orange-200 shadow-xl transition-all hover:bg-orange-600 active:scale-95'>
                                APPLY LEAVE NOW <ArrowRight className='h-5 w-5' />
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='flex h-12 items-center gap-2 rounded-full border-slate-200 px-10 font-bold text-slate-400 text-xs uppercase transition-all hover:bg-slate-50 hover:text-slate-600'
                                onClick={() => {
                                    form.reset();
                                    onCancel?.();
                                }}>
                                <span className='text-xl leading-none'>×</span> CANCEL
                            </Button>
                        </div>
                        {combinedBalanceData?.length === 0 && !isLoadingBalance && (
                            <Badge variant='destructive' className='w-auto px-2 py-1 text-xs'>
                                No leave balance available for the selected leave type.
                            </Badge>
                        )}

                        <p className='font-medium text-[10px] text-slate-400 uppercase tracking-widest opacity-60'>
                            This will directly update the employee's leave records as an administrator action.
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
}
