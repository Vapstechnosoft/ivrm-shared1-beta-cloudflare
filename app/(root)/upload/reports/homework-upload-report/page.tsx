'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, RefreshCcw, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { getHomeWorkInitialData, getHomeWorkReport, viewHomeWorkAttachmentData } from '@/server/upload/reports/homework-upload-report';
import type { IHomeWorkAttachment, IHomeWorkReport } from '@/types/upload/reports/homework-upload-report';
import { AttachmentViewModal } from './_components/attachment-view-modal';
import { HomeWorkReportTable } from './_components/homework-report-table';

const formSchema = z.object({
    fromdate: z.date({
        required_error: 'Select from date'
    }),
    todate: z.date({
        required_error: 'Select to date'
    }),
    classarray: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function HomeWorkUploadReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isReporting, setIsReporting] = useState(false);
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
    const [reportData, setReportData] = useState<IHomeWorkReport[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachments, setAttachments] = useState<IHomeWorkAttachment[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            classarray: []
        }
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await getHomeWorkInitialData();
                if (response.success && response.data) {
                    setClasses(
                        response.data.classes.map((c) => ({
                            value: String(c.ASMCL_Id),
                            label: c.ASMCL_ClassName
                        }))
                    );
                } else {
                    toast.error(response.message || 'Failed to load initial data');
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('An error occurred while fetching initial data');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const onSubmit = async (values: FormValues) => {
        setIsReporting(true);
        try {
            const payload = {
                fromdate: format(values.fromdate, "yyyy-MM-dd'T'00:00:00"),
                todate: format(values.todate, "yyyy-MM-dd'T'23:59:59"),
                classarray: values.classarray?.map((id) => ({ asmcL_Id: Number(id) }))
            };

            const response = await getHomeWorkReport(payload);
            if (response.success && response.data) {
                if (response.data.report && response.data.report.length > 0) {
                    setReportData(response.data.report);
                    toast.success('Report generated successfully');
                } else {
                    setReportData([]);
                    toast.info('No records found for the selected criteria.');
                }
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('An error occurred while generating the report');
        } finally {
            setIsReporting(false);
        }
    };

    const handleViewAttachment = async (item: IHomeWorkReport) => {
        try {
            const payload = {
                Temp: 1,
                ihW_Id: item.Id
            };
            const response = await viewHomeWorkAttachmentData(payload);
            if (response.success && response.data) {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setAttachments(response.data);
                    setIsModalOpen(true);
                } else {
                    toast.info('No attachments found for this homework.');
                }
            } else {
                toast.error(response.message || 'Failed to fetch attachments');
            }
        } catch (error) {
            console.error('Error fetching attachments:', error);
            toast.error('An error occurred while fetching attachments');
        }
    };

    const handleCancel = () => {
        form.reset({
            fromdate: undefined,
            todate: undefined,
            classarray: []
        });
        setReportData([]);
    };

    if (isLoading) {
        return (
            <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4'>
                <Spinner size='lg' className='text-primary' />
                <p className='animate-pulse font-medium text-muted-foreground'>Initializing HomeWork Report...</p>
            </div>
        );
    }

    return (
        <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 py-6 duration-500'>
            <CollapsibleSection
                title='Homework Upload Report'
                defaultOpen={true}
                className='overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 p-8'>
                        <div className='grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3'>
                            <div className='space-y-6'>
                                {/* From Date */}
                                <FormField
                                    control={form.control}
                                    name='fromdate'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-col'>
                                            <FormLabel className='flex items-center gap-2 font-bold text-[11px] text-slate-600 uppercase tracking-wider'>
                                                From Date <span className='font-black text-red-500'>*</span>
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'h-12 w-full rounded-xl border-slate-200 pl-3 text-left font-semibold shadow-sm transition-all hover:border-primary/50',
                                                                !field.value && 'text-muted-foreground'
                                                            )}>
                                                            {field.value ? (
                                                                format(field.value, 'PPP')
                                                            ) : (
                                                                <span className='text-[11px] uppercase tracking-widest opacity-60'>
                                                                    Select from date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-40' />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className='w-auto rounded-2xl border-slate-100 p-0 shadow-2xl'
                                                    align='start'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        className='rounded-2xl'
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className='font-bold text-[10px] uppercase tracking-tighter' />
                                        </FormItem>
                                    )}
                                />

                                {/* To Date */}
                                <FormField
                                    control={form.control}
                                    name='todate'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-col'>
                                            <FormLabel className='flex items-center gap-2 font-bold text-[11px] text-slate-600 uppercase tracking-wider'>
                                                To Date <span className='font-black text-red-500'>*</span>
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'h-12 w-full rounded-xl border-slate-200 pl-3 text-left font-semibold shadow-sm transition-all hover:border-primary/50',
                                                                !field.value && 'text-muted-foreground'
                                                            )}>
                                                            {field.value ? (
                                                                format(field.value, 'PPP')
                                                            ) : (
                                                                <span className='text-[11px] uppercase tracking-widest opacity-60'>
                                                                    Select to date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-40' />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className='w-auto rounded-2xl border-slate-100 p-0 shadow-2xl'
                                                    align='start'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => form.getValues('fromdate') && date < form.getValues('fromdate')}
                                                        initialFocus
                                                        className='rounded-2xl'
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className='font-bold text-[10px] uppercase tracking-tighter' />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Class Multi-Select Box */}
                            <div className='lg:col-span-2'>
                                <FormField
                                    control={form.control}
                                    name='classarray'
                                    render={({ field }) => (
                                        <FormItem className='flex h-full flex-col'>
                                            <FormLabel className='mb-2 font-bold text-[11px] text-slate-600 uppercase tracking-wider'>
                                                Class Name Selection
                                            </FormLabel>
                                            <FormControl>
                                                <CustomMultiSelectBox
                                                    options={classes}
                                                    value={field.value ?? []}
                                                    onChange={field.onChange}
                                                    height='280px'
                                                    isSearchRequired
                                                />
                                            </FormControl>
                                            <FormMessage className='font-bold text-[10px] uppercase tracking-tighter' />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='flex flex-wrap items-center justify-center gap-4 border-slate-50 border-t pt-6'>
                            <Button
                                type='submit'
                                disabled={isReporting}
                                className='h-12 min-w-[160px] rounded-full bg-primary px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95'>
                                {isReporting ? (
                                    <>
                                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Send className='mr-2 h-4 w-4' /> Generate Report
                                    </>
                                )}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleCancel}
                                className='h-12 min-w-[140px] rounded-full border-slate-200 px-8 text-slate-600 transition-all hover:bg-slate-50'>
                                <RefreshCcw className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CollapsibleSection>

            {/* Report Table Section */}
            {reportData.length > 0 && (
                <div className='slide-in-from-bottom animate-in duration-700'>
                    <Card className='overflow-hidden rounded-2xl border-none shadow-xl'>
                        <CardContent className='bg-slate-50/30 p-6'>
                            <HomeWorkReportTable data={reportData} onViewAttachment={handleViewAttachment} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attachment Modal */}
            <AttachmentViewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} attachments={attachments} />
        </div>
    );
}
