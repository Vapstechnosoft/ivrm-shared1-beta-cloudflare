'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePDAHeadWiseInitialData, usePDAHeadWiseReportMutation } from '@/hooks/pettycash/report/usePDAHeadWiseReport';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Download, Printer } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import * as z from 'zod';

const formSchema = z
    .object({
        ASMAY_Id: z.string().min(1, 'Please Select Academic Year'),
        PDAMH_ID: z.string().min(1, 'Please Select Expenditure Head'),
        asmcL_Id: z.string().min(1, 'Please Select Class'),
        asmS_Id: z.string().min(1, 'Please Select Section'),
        From_Date: z.date({
            required_error: 'Please Select From Date'
        }),
        To_Date: z.date({
            required_error: 'Please Select To Date'
        }),
        active: z.boolean(),
        deactive: z.boolean(),
        left: z.boolean()
    })
    .refine((data) => data.active || data.deactive || data.left, {
        message: 'Please Select at least one Status',
        path: ['active']
    });

interface PDAHeadWiseReportFormProps {
    setReportData: (data: any) => void;
    reportData: any;
}

export function PDAHeadWiseReportForm({ setReportData, reportData }: PDAHeadWiseReportFormProps) {
    const { data: initialData, isLoading: isInitialLoading } = usePDAHeadWiseInitialData();
    const reportMutation = usePDAHeadWiseReportMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            PDAMH_ID: '',
            asmcL_Id: '',
            asmS_Id: '',
            active: false,
            deactive: false,
            left: false
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            ASMAY_Id: Number.parseInt(values.ASMAY_Id),
            PDAMH_ID: Number.parseInt(values.PDAMH_ID),
            ASMCL_Id: Number.parseInt(values.asmcL_Id),
            ASMS_Id: Number.parseInt(values.asmS_Id),
            From_Date: format(values.From_Date, 'yyyy-MM-dd'),
            To_Date: format(values.To_Date, 'yyyy-MM-dd'),
            active: values.active ? 1 : 0,
            deactive: values.deactive ? 1 : 0,
            left: values.left ? 1 : 0
        };

        reportMutation.mutate(payload, {
            onSuccess: (res: any) => {
                if (res?.data?.headwise && res.data.headwise.length > 0) {
                    processReportData(res.data.headwise);
                    toast.success('Report Generated Successfully');
                } else {
                    setReportData(null);
                    toast.error('No Record Found');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
                setReportData(null);
            }
        });
    };

    const processReportData = (headwiseData: any[]) => {
        // Process data to group by student (AMST_Id)
        const employeeMap = new Map();

        headwiseData.forEach((item) => {
            if (!employeeMap.has(item.AMST_Id)) {
                employeeMap.set(item.AMST_Id, {
                    AMST_Id: item.AMST_Id,
                    AMST_AdmNo: item.AMST_AdmNo,
                    AMST_FirstName: item.AMST_FirstName,
                    ASMCL_ClassName: item.ASMCL_ClassName,
                    ASMC_SectionName: item.ASMC_SectionName,
                    PDAE_TotAmount: item.PDAE_TotAmount, // This might need accumulation or taken from the first record if it's overall
                    plannerdetails: [],
                    headwisereport: [],
                    totA_p: 0
                });
            }
            employeeMap.get(item.AMST_Id).plannerdetails.push(item);
        });

        const employees = Array.from(employeeMap.values());

        employees.forEach((emp) => {
            // Create unique headwise reports for each employee
            const headMap = new Map();
            emp.plannerdetails.forEach((detail: any) => {
                if (!headMap.has(detail.PDAMH_Id)) {
                    headMap.set(detail.PDAMH_Id, {
                        PDAMH_Id: detail.PDAMH_Id,
                        PDAMH_HeadName: detail.PDAMH_HeadName,
                        TotalAmount: detail.TotalAmount || 0, // Ensure TotalAmount is captured or default to 0
                        transactions: []
                    });
                }
                headMap.get(detail.PDAMH_Id).transactions.push(detail);
            });

            emp.headwisereport = Array.from(headMap.values());

            // Calculate totA_p
            let totA_p = 0;
            emp.headwisereport.forEach((head: any) => {
                totA_p += Number(head.TotalAmount || 0);
            });
            emp.totA_p = totA_p;
        });

        let d_Amount = 0;
        let d_total_Amount = 0;

        employees.forEach((emp) => {
            if (emp.PDAE_TotAmount) {
                d_Amount += Number(emp.PDAE_TotAmount);
            }
            emp.headwisereport.forEach((head: any) => {
                if (head.TotalAmount) {
                    d_total_Amount += Number(head.TotalAmount);
                }
            });
        });

        setReportData({
            employees,
            d_Amount,
            d_total_Amount
        });
    };

    const handleCancel = () => {
        form.reset();
        setReportData(null);
    };

    const exportToExcel = () => {
        if (!reportData || !reportData.employees) return;

        const table = document.getElementById('printSectionId');
        if (table) {
            const wb = XLSX.utils.table_to_book(table);
            XLSX.writeFile(wb, 'PDA_HEADWISE_REPORT.xlsx');
        }
    };

    const printData = () => {
        const printContents = document.getElementById('printSectionId')?.innerHTML;
        if (printContents) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = `
              <html>
                  <head>
                      <title>Print Report</title>
                      <style>
                          table { width: 100%; border-collapse: collapse; }
                          th, td { border: 1px solid black; padding: 8px; text-align: left; }
                          .text-center { text-align: center; }
                      </style>
                  </head>
                  <body>
                       <h2 style="text-align: center;">PDA HEADWISE REPORT</h2>
                      ${printContents}
                  </body>
              </html>
          `;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore React bindings
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>PDA Head Wise Report</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='h-8 text-xs'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData?.data?.fillyear?.map((year: any) => (
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

                            <FormField
                                control={form.control}
                                name='PDAMH_ID'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Pda Expenditure Head <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='h-8 text-xs'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='0'>--All--</SelectItem>
                                                {initialData?.data?.pdadata?.map((head: any) => (
                                                    <SelectItem key={head.pdamH_Id} value={head.pdamH_Id.toString()}>
                                                        {head.pdamH_HeadName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='asmcL_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Class <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select Class--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData?.data?.classlist?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='asmS_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Section <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select Section--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='0'>All</SelectItem>
                                                {initialData?.data?.searcharray?.map((sec: any) => (
                                                    <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='From_Date'
                                render={({ field }) => (
                                    <FormItem className='flex flex-col'>
                                        <FormLabel>
                                            From Date <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'h-9 w-full pl-3 text-left text-sm',
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
                                name='To_Date'
                                render={({ field }) => (
                                    <FormItem className='flex flex-col'>
                                        <FormLabel>
                                            To Date <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'h-9 w-full pl-3 text-left text-sm',
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

                            <StudentStatusToggles form={form} />
                        </div>

                        <div className='mt-6 flex justify-center gap-4'>
                            <Button type='submit' disabled={reportMutation.isPending}>
                                {reportMutation.isPending ? 'Loading...' : 'Report'}
                            </Button>
                            <Button type='button' variant='outline' onClick={handleCancel}>
                                Cancel
                            </Button>
                            {reportData && (
                                <>
                                    <Button type='button' variant='secondary' onClick={exportToExcel}>
                                        <Download className='mr-2 h-4 w-4' /> Export to Excel
                                    </Button>
                                    <Button type='button' variant='secondary' onClick={printData}>
                                        <Printer className='mr-2 h-4 w-4' /> Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function StudentStatusToggles({ form }: { form: any }) {
    return (
        <div className='mt-4 flex flex-row items-center justify-center gap-6 rounded-md border bg-gray-50 p-4 md:col-span-2'>
            <FormField
                control={form.control}
                name='active'
                render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                            <FormLabel>Active</FormLabel>
                        </div>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name='deactive'
                render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                            <FormLabel>Deactive</FormLabel>
                        </div>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name='left'
                render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                            <FormLabel>Left</FormLabel>
                        </div>
                    </FormItem>
                )}
            />
            {form.formState.errors.active && (
                <p className='ml-4 font-medium text-[0.8rem] text-destructive'>{form.formState.errors.active.message as string}</p>
            )}
        </div>
    );
}
