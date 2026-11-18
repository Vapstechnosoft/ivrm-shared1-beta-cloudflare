'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountStatusReportDetails, useCountStatusReportInitialDetails } from '@/hooks/exam/exammodule/useCountStatusReport';
import { countStatusReportSchema, type CountStatusReportFormValues } from '@/schemas/exam/exam-module/reports/count-status-report';
import type { IAdmissionStatusItem, IApplicationStatusItem } from '@/types/exam/exam-module/reports/count-status-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart2, Loader2, RotateCcw, Search } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (
        admissionData: IAdmissionStatusItem[],
        applicationData: IApplicationStatusItem[],
        yearName: string
    ) => void;
    onReset: () => void;
    showGraphs: boolean;
    onToggleGraphs: () => void;
    hasReportData: boolean;
}

export function ReportForm({
    onReportGenerated,
    onReset,
    showGraphs,
    onToggleGraphs,
    hasReportData
}: ReportFormProps) {
    const { data: initialDetails, isLoading: isInitialLoading } = useCountStatusReportInitialDetails();
    const { mutate: fetchReport, isPending } = useCountStatusReportDetails();

    const form = useForm<CountStatusReportFormValues>({
        resolver: zodResolver(countStatusReportSchema),
        defaultValues: {
            ASMAY_Id: '0'
        }
    });

    // Auto-fetch on initial load (equivalent to old ShowReport_today)
    useEffect(() => {
        if (initialDetails && !hasReportData) {
            handleSearch({ ASMAY_Id: '0' });
        }
    }, [initialDetails]);

    const handleSearch = (values: CountStatusReportFormValues) => {
        const payload = {
            ASMAY_Id: Number(values.ASMAY_Id)
        };

        const academicYears: any[] =
            Array.isArray(initialDetails?.academicList)
                ? initialDetails.academicList
                : Array.isArray((initialDetails as any)?.yearlist)
                  ? (initialDetails as any).yearlist
                  : Array.isArray((initialDetails as any)?.yearList)
                    ? (initialDetails as any).yearList
                    : Array.isArray((initialDetails as any)?.data?.academicList)
                      ? (initialDetails as any).data.academicList
                      : Array.isArray((initialDetails as any)?.data?.yearlist)
                        ? (initialDetails as any).data.yearlist
                        : [];

        const selectedYear =
            values.ASMAY_Id === '0'
                ? 'All Academic Years'
                : academicYears.find((y: any) => String(y.asmaY_Id) === String(values.ASMAY_Id))?.asmaY_Year ||
                  `Year ${values.ASMAY_Id}`;

        fetchReport(payload, {
            onSuccess: (res: any) => {
                const countReportStatus: IAdmissionStatusItem[] =
                    res?.countreportstatus || res?.data?.countreportstatus || [];
                const rawAppStatus: any[] =
                    res?.applicationstatus || res?.data?.applicationstatus || [];

                const mappedAppStatus: IApplicationStatusItem[] = rawAppStatus.map((item: any) => {
                    let statusName = '';
                    const idStr = String(item.PASRAPS_ID);
                    if (idStr === '787926') statusName = 'APP WAITING';
                    else if (idStr === '787927') statusName = 'APP REJECTED';
                    else if (idStr === '787928') statusName = 'APP ACCEPTED';
                    else statusName = `Status ${item.PASRAPS_ID}`;

                    return {
                        ...item,
                        statusName,
                        data: Number(item.data || 0)
                    };
                });

                if (countReportStatus.length > 0 || mappedAppStatus.length > 0) {
                    onReportGenerated(countReportStatus, mappedAppStatus, selectedYear);
                    toast.success('Report loaded successfully');
                } else {
                    onReset();
                    toast.info('No Record found!!');
                }
            },
            onError: (err: any) => {
                toast.error(err?.message || 'Failed to fetch report data');
            }
        });
    };

    const handleClear = () => {
        form.reset({ ASMAY_Id: '0' });
        onReset();
    };

    const academicYears: any[] =
        Array.isArray(initialDetails?.academicList)
            ? initialDetails.academicList
            : Array.isArray((initialDetails as any)?.yearlist)
              ? (initialDetails as any).yearlist
              : Array.isArray((initialDetails as any)?.yearList)
                ? (initialDetails as any).yearList
                : Array.isArray((initialDetails as any)?.data?.academicList)
                  ? (initialDetails as any).data.academicList
                  : Array.isArray((initialDetails as any)?.data?.yearlist)
                    ? (initialDetails as any).data.yearlist
                    : [];

    return (
        <Card className='shadow-md border border-border/60 transition-all'>
            <CardHeader className='border-b bg-muted/30 pb-4'>
                <CardTitle className='text-lg font-semibold text-foreground flex items-center justify-between'>
                    <span>Status Count Report</span>
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSearch)} className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            <FormField
                                control={form.control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <FormItem className='flex flex-col'>
                                        <FormLabel className='text-sm font-medium'>
                                            Academic Year <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                            }}
                                            value={field.value}
                                            disabled={isInitialLoading || isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='0'>ALL</SelectItem>
                                                {academicYears.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <hr className='border-border/40' />

                        <div className='flex flex-wrap items-center justify-center gap-3'>
                            <Button
                                type='submit'
                                disabled={isPending || isInitialLoading}
                                className='min-w-[120px] shadow-sm'>
                                {isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className='mr-2 h-4 w-4' />
                                        Search
                                    </>
                                )}
                            </Button>

                            {hasReportData && (
                                <Button
                                    type='button'
                                    variant={showGraphs ? 'secondary' : 'outline'}
                                    onClick={onToggleGraphs}
                                    className='min-w-[130px] shadow-sm'>
                                    <BarChart2 className='mr-2 h-4 w-4' />
                                    {showGraphs ? 'Hide Graphs' : 'View Graphs'}
                                </Button>
                            )}

                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleClear}
                                disabled={isPending}
                                className='min-w-[100px]'>
                                <RotateCcw className='mr-2 h-4 w-4 text-muted-foreground' />
                                Reset
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
