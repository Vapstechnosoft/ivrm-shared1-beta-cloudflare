'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    useAdminOnDutyEmployeeDropdown,
    useEmployeeOnDutyDetails,
    useSaveOnDutyLeaveRequest
} from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import { cn } from '@/lib/utils';
import type { AdminOnDutyApply } from '@/types/hrms/leave-management/admin-on-duty-apply';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInDays, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Briefcase, CalendarIcon, Clock, FileText, Info, Mail, Phone, UserIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
    .object({
        hrmE_Id: z.coerce.number().min(1, 'Employee ID is required'),
        leaveType: z.string().min(1, 'Leave type is required'),
        fromDate: z.date({
            required_error: 'From date is required',
            invalid_type_error: 'Please select a valid From Date'
        }),
        toDate: z.date({
            required_error: 'To date is required',
            invalid_type_error: 'Please select a valid To Date'
        }),
        totalDays: z.coerce.number().min(0.5, 'Total days must be at least 0.5'),
        leaveReason: z.string().min(5, 'Reason must be at least 5 characters long').max(500, 'Reason cannot exceed 500 characters'),
        inTime: z
            .string()
            .min(1, 'In time is required')
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
        outTime: z
            .string()
            .min(1, 'Out time is required')
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    })
    .refine((data) => data.toDate >= data.fromDate, {
        message: 'To Date cannot be before From Date',
        path: ['toDate']
    })
    .refine(
        (data) => {
            // Ensure outTime is after inTime if it's a single day leave
            if (data.fromDate.getTime() === data.toDate.getTime()) {
                const inMinutes = Number.parseInt(data.inTime.split(':')[0]) * 60 + Number.parseInt(data.inTime.split(':')[1]);
                const outMinutes = Number.parseInt(data.outTime.split(':')[0]) * 60 + Number.parseInt(data.outTime.split(':')[1]);
                return outMinutes > inMinutes;
            }
            return true;
        },
        {
            message: 'Out time must be after In time for single day applications',
            path: ['outTime']
        }
    );

type FormValues = z.infer<typeof formSchema>;

interface ApplyLeaveFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    editingRow?: AdminOnDutyApply | null;
}

export default function ApplyLeaveForm({ onSuccess, onCancel, editingRow }: ApplyLeaveFormProps) {
    const { mutate: saveLeave, isPending } = useSaveOnDutyLeaveRequest();
    const { data: employeeList, isLoading: isLoadingList } = useAdminOnDutyEmployeeDropdown();

    const formatTime = (time?: string) => {
        if (!time) return '';
        const parts = time.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
        return time;
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            hrmE_Id: editingRow?.employeeId || 0,
            leaveType: 'OD',
            fromDate: editingRow?.fromDate ? new Date(editingRow.fromDate) : undefined,
            toDate: editingRow?.toDate ? new Date(editingRow.toDate) : undefined,
            totalDays: editingRow?.totalDays || 1,
            leaveReason: editingRow?.leaveReason || '',
            inTime: formatTime(editingRow?.inTime) || '10:00',
            outTime: formatTime(editingRow?.outTime) || '18:00'
        }
    });

    console.log('Form default values:', editingRow);

    const hrmE_Id = form.watch('hrmE_Id');
    const fromDate = form.watch('fromDate');
    const toDate = form.watch('toDate');

    // Auto-calculate total days
    useEffect(() => {
        if (fromDate && toDate && !editingRow) {
            const days = differenceInDays(toDate, fromDate) + 1;
            if (days > 0) {
                form.setValue('totalDays', days);
            }
        }
    }, [fromDate, toDate, form, editingRow]);

    const { data: employeeData, isLoading: isLoadingEmp } = useEmployeeOnDutyDetails(hrmE_Id > 0 ? hrmE_Id : null);

    function onSubmit(values: FormValues) {
        console.log('Submitting form with values:', values);
        saveLeave(
            {
                HRME_Id: values.hrmE_Id,
                HRML_LeaveType: values.leaveType,
                HRELAP_FromDate: format(values.fromDate, 'yyyy-MM-dd'),
                HRELAP_ToDate: format(values.toDate, 'yyyy-MM-dd'),
                HRELAP_TotalDays: values.totalDays,
                HRELAP_LeaveReason: values.leaveReason,
                HRELAPD_InTime: values.inTime,
                HRELAPD_OutTime: values.outTime,
                HRELT_SupportingDocument: ''
            },
            {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                }
            }
        );
    }

    const { isValid } = form.formState;

    return (
        <div className='space-y-6'>
            <Card className='border-none bg-gradient-to-br from-background to-muted/20 shadow-md'>
                <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2 font-bold text-lg'>
                            <FileText className='h-5 w-5 text-primary' />
                            On Duty Application Form
                        </CardTitle>
                        <Badge variant='outline' className='border-primary/20 bg-primary/5 text-primary'>
                            Admin Mode
                        </Badge>
                    </div>
                    <CardDescription>Fill in the details to apply for On Duty leave on behalf of an employee.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            {/* Employee Selection Section */}
                            <div className='space-y-4'>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FormField
                                        control={form.control}
                                        name='hrmE_Id'
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className='font-semibold'>
                                                    Select Employee <span className='text-destructive'>*</span>
                                                </Label>
                                                <Select
                                                    onValueChange={(value) => {
                                                        const id = Number(value);
                                                        field.onChange(id);
                                                    }}
                                                    value={field.value > 0 ? field.value.toString() : ''}>
                                                    <FormControl>
                                                        <SelectTrigger className='h-11 border-muted-foreground/20 transition-all focus:ring-primary/30'>
                                                            <div className='flex items-center gap-2'>
                                                                <UserIcon className='h-4 w-4 text-muted-foreground' />
                                                                <SelectValue placeholder='Search/Select Employee' />
                                                            </div>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingList ? (
                                                            <div className='p-2 text-center text-muted-foreground text-sm'>
                                                                Loading employees...
                                                            </div>
                                                        ) : (
                                                            employeeList?.map((emp) => (
                                                                <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()}>
                                                                    {emp.employeeName} (ID: {emp.hrmE_Id})
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className='text-[11px]'>
                                                    Select an employee to auto-fetch details.
                                                </FormDescription>
                                                {form.formState.errors.hrmE_Id?.message && (
                                                    <FormError>{form.formState.errors.hrmE_Id.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='leaveType'
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className='font-semibold'>
                                                    Leave Type <span className='text-destructive'>*</span>
                                                </Label>
                                                <FormControl>
                                                    <div className='flex h-11 items-center rounded-md border border-muted-foreground/10 bg-muted/30 px-4 font-bold text-primary'>
                                                        On Duty (OD)
                                                    </div>
                                                </FormControl>
                                                {form.formState.errors.leaveType?.message && (
                                                    <FormError>{form.formState.errors.leaveType.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <AnimatePresence mode='wait'>
                                    {employeeData && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -10, height: 0 }}
                                            className='overflow-hidden'>
                                            <div className='mt-2 rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-inner'>
                                                <div className='flex flex-col gap-6 md:flex-row'>
                                                    {/* Avatar/Photo */}
                                                    <div className='flex flex-shrink-0 items-center justify-center'>
                                                        <div className='h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md'>
                                                            {employeeData.employeeDetails.photo ? (
                                                                <img
                                                                    src={employeeData.employeeDetails.photo}
                                                                    alt='Profile'
                                                                    className='h-full w-full object-cover'
                                                                />
                                                            ) : (
                                                                <div className='flex h-full w-full items-center justify-center bg-muted'>
                                                                    <UserIcon className='h-10 w-10 text-muted-foreground' />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Info Grid */}
                                                    <div className='flex-grow'>
                                                        <div className='mb-4 flex flex-col justify-between md:flex-row md:items-end'>
                                                            <div>
                                                                <h4 className='flex items-center gap-2 font-bold text-primary text-xl'>
                                                                    {employeeData.employeeDetails.name}
                                                                    <Badge className='h-5 border-green-500/20 bg-green-500/10 text-[10px] text-green-600'>
                                                                        ACTIVE
                                                                    </Badge>
                                                                </h4>
                                                                <p className='flex items-center gap-1.5 text-muted-foreground text-sm'>
                                                                    <Briefcase className='h-3.5 w-3.5' />{' '}
                                                                    {employeeData.employeeDetails.designation}
                                                                </p>
                                                            </div>
                                                            <div className='mt-2 text-right md:mt-0'>
                                                                <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                                    Join Date
                                                                </p>
                                                                <p className='font-semibold text-sm'>
                                                                    {format(employeeData.employeeDetails.doj, 'dd-MMM-yyyy')}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className='grid grid-cols-1 gap-x-6 gap-y-3 border-primary/10 border-t pt-3 sm:grid-cols-2 md:grid-cols-3'>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='rounded-full bg-blue-100 p-1.5 text-blue-600'>
                                                                    <Mail className='h-3.5 w-3.5' />
                                                                </div>
                                                                <span className='max-w-[150px] truncate font-medium text-xs'>
                                                                    {employeeData.employeeDetails.email || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='rounded-full bg-orange-100 p-1.5 text-orange-600'>
                                                                    <Phone className='h-3.5 w-3.5' />
                                                                </div>
                                                                <span className='font-medium text-xs'>
                                                                    {employeeData.employeeDetails.mobile || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className='flex items-center gap-2'>
                                                                <div className='rounded-full bg-green-100 p-1.5 text-green-600'>
                                                                    <Clock className='h-3.5 w-3.5' />
                                                                </div>
                                                                <span className='font-medium text-xs'>
                                                                    {employeeData.employeeDetails.loginTime} -{' '}
                                                                    {employeeData.employeeDetails.logoutTime}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Recent Applications Sidebar/Inline */}
                                                {/* {employeeData.leaveDetails.length > 0 && (
                                                    <div className='mt-5 pt-4 border-t border-primary/10'>
                                                        <h5 className='text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1'>
                                                            <History className='h-3 w-3' /> Recent OD History
                                                        </h5>
                                                        <div className='flex gap-4 overflow-x-auto pb-2 scrollbar-hide'>
                                                            {employeeData.leaveDetails.slice(0, 3).map((leave, i) => (
                                                                <div key={i} className='min-w-[180px] bg-white rounded-lg p-2 shadow-sm border border-muted flex items-center gap-3'>
                                                                    <div className='bg-orange-50 p-2 rounded text-orange-600'><CalendarIcon className='h-4 w-4' /></div>
                                                                    <div className='flex flex-col'>
                                                                        <span className='text-[10px] font-bold italic line-clamp-1'>{leave.leaveReason}</span>
                                                                        <span className='text-[9px] text-muted-foreground'>{format(leave.fromDate, 'dd MMM')} - {format(leave.toDate, 'dd MMM')}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Separator className='opacity-40' />

                            {/* Date and Time Section */}
                            <div className='grid gap-6 md:grid-cols-2'>
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <FormField
                                        control={form.control}
                                        name='fromDate'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col'>
                                                <Label className='font-semibold'>
                                                    From Date <span className='text-destructive'>*</span>
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={'outline'}
                                                                className={cn(
                                                                    'h-11 w-full border-muted-foreground/20 pl-3 text-left font-normal transition-all hover:border-primary/50',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}>
                                                                {field.value ? (
                                                                    format(field.value, 'dd MMMM yyyy')
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className='ml-auto h-4 w-4 text-primary opacity-70' />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                            className='rounded-md border'
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {form.formState.errors.fromDate?.message && (
                                                    <FormError>{form.formState.errors.fromDate.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='toDate'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col'>
                                                <Label className='font-semibold'>
                                                    To Date <span className='text-destructive'>*</span>
                                                </Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={'outline'}
                                                                className={cn(
                                                                    'h-11 w-full border-muted-foreground/20 pl-3 text-left font-normal transition-all hover:border-primary/50',
                                                                    !field.value && 'text-muted-foreground'
                                                                )}>
                                                                {field.value ? (
                                                                    format(field.value, 'dd MMMM yyyy')
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className='ml-auto h-4 w-4 text-primary opacity-70' />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                if (!fromDate) return false;
                                                                return date < fromDate;
                                                            }}
                                                            initialFocus
                                                            className='rounded-md border'
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {form.formState.errors.toDate?.message && (
                                                    <FormError>{form.formState.errors.toDate.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='grid gap-4 sm:grid-cols-3'>
                                    <FormField
                                        control={form.control}
                                        name='totalDays'
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className='font-semibold'>
                                                    Total Days <span className='text-destructive'>*</span>
                                                </Label>
                                                <FormControl>
                                                    <div className='relative'>
                                                        <Input
                                                            type='number'
                                                            step='0.5'
                                                            className='h-11 border-muted-foreground/20 text-center font-bold'
                                                            {...field}
                                                        />
                                                        <div className='pointer-events-none absolute inset-y-0 right-3 flex items-center font-bold text-[10px] text-muted-foreground'>
                                                            DAYS
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                {form.formState.errors.totalDays?.message && (
                                                    <FormError>{form.formState.errors.totalDays.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='inTime'
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className='font-semibold'>
                                                    In Time <span className='text-destructive'>*</span>
                                                </Label>
                                                <FormControl>
                                                    <Input type='time' className='h-11 border-muted-foreground/20' {...field} />
                                                </FormControl>
                                                {form.formState.errors.inTime?.message && (
                                                    <FormError>{form.formState.errors.inTime.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='outTime'
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className='font-semibold'>
                                                    Out Time <span className='text-destructive'>*</span>
                                                </Label>
                                                <FormControl>
                                                    <Input type='time' className='h-11 border-muted-foreground/20' {...field} />
                                                </FormControl>
                                                {form.formState.errors.outTime?.message && (
                                                    <FormError>{form.formState.errors.outTime.message}</FormError>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name='leaveReason'
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className='font-semibold'>
                                            Application Reason <span className='text-destructive'>*</span>
                                        </Label>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    placeholder='e.g. On duty for Board Meeting at Educational Summit...'
                                                    className='h-11 border-muted-foreground/20 pr-10 transition-all focus-visible:ring-primary/30'
                                                    {...field}
                                                />
                                                <FileText className='-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-muted-foreground opacity-50' />
                                            </div>
                                        </FormControl>
                                        {form.formState.errors.leaveReason?.message && (
                                            <FormError>{form.formState.errors.leaveReason.message}</FormError>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <div className='flex items-center justify-between pt-2'>
                                <div className='flex items-center gap-1.5 text-muted-foreground text-xs'>
                                    <Info className='h-3.5 w-3.5 text-blue-500' />
                                    <span>Applications will be submitted for approval automatically.</span>
                                </div>
                                <div className='flex gap-3'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            if (editingRow) {
                                                onCancel?.();
                                            } else {
                                                form.reset();
                                            }
                                        }}
                                        disabled={isPending}
                                        className='border-muted-foreground/20 px-6'>
                                        {editingRow ? 'Cancel' : 'Reset'}
                                    </Button>
                                    <Button
                                        type='submit'
                                        className='bg-primary px-8 shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95'>
                                        {isPending ? (
                                            <>
                                                <Clock className='mr-2 h-4 w-4 animate-spin' />
                                                {editingRow ? 'Updating...' : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                {editingRow ? 'Update Request' : 'Submit Request'}
                                                <ArrowRight className='ml-2 h-4 w-4' />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
