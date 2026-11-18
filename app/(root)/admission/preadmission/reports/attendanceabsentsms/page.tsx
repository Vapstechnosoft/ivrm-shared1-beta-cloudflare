'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Bell, CalendarIcon, Mail, Save, Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStudentColumns, summaryColumns } from './_components/columns';

import {
    useAttendanceAbsentCommunication,
    useAttendanceAbsentInitialDetails,
    useAttendanceAbsentSmsReport
} from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';

// helper to compare local dates
const isBeforeOrEqualLocalDate = (a: Date, b: Date) =>
    a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() < b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() <= b.getDate());

const schema = z.object({
    frequency: z.enum(['0', '1']).default('0'), // 0: Daily Once, 1: Daily Twice
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    amC_Id: z.number().optional(),
    from_date: z
        .string()
        .nonempty('Date is required')
        .refine((val) => {
            const d = new Date(val);
            return isBeforeOrEqualLocalDate(d, new Date());
        }, 'Only today or previous dates are allowed')
});

type FormFields = z.infer<typeof schema>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function AttendanceAbsentSmsPage(props: { searchParams: SearchParams }) {
    const searchParams = (React as any).use(props.searchParams);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Grids Data
    const [students, setStudents] = useState<any[]>([]);
    const [studentTeacherList, setStudentTeacherList] = useState<any[]>([]);

    // Pagination Totals
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalAbsent, setTotalAbsent] = useState(0);

    // Search
    const [searchValue, setSearchValue] = useState('');
    const [searchValue1234, setSearchValue1234] = useState('');

    // Modal states
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    const [otpType, setOtpType] = useState<'M' | 'E'>('M');
    const [forgetEmailOTP, setForgetEmailOTP] = useState('');
    const [otpVerified, setOtpVerified] = useState(true); // default to true if no otp needed
    const [resendOtpButton, setResendOtpButton] = useState(false);

    const [actionType, setActionType] = useState<'sms' | 'email' | 'notice' | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            frequency: '0',
            from_date: new Date().toISOString(),
            amC_Id: 0
        }
    });

    const frequency = watch('frequency');
    const asmaY_Id = watch('asmaY_Id');
    const from_date = watch('from_date');
    const amC_Id = watch('amC_Id');

    const { data: initialData, isLoading: initialLoading } = useAttendanceAbsentInitialDetails();

    // Format date properly before sending to API to avoid timezone shifts
    const formattedFromDate = from_date ? format(new Date(from_date), 'yyyy-MM-dd') : '';
    const { refetch: fetchReport } = useAttendanceAbsentSmsReport(
        asmaY_Id,
        formattedFromDate,
        frequency,
        amC_Id,
        frequency === '0' ? 'D' : 'H',
        searchParams
    );
    const { sendSms, sendEmail, sendNotice, sendOtp, verifyOtp } = useAttendanceAbsentCommunication();

    const initData = initialData as any;
    const academicList: any[] = initData?.academicList || initData?.data?.academicList || [];
    const academicListdefault: any[] = initData?.academicListdefault || initData?.data?.academicListdefault || [];
    const categoryDropdown: any[] = initData?.category_list || initData?.data?.category_list || [];
    const categoryflag = initData?.categoryflag || initData?.data?.categoryflag;

    // IVRM General Config for OTP
    const [emailOtpEnabled, setEmailOtpEnabled] = useState(false);
    const [mobileOtpEnabled, setMobileOtpEnabled] = useState(false);
    const [mobileNoMasked, setMobileNoMasked] = useState('');
    const [emailIdMasked, setEmailIdMasked] = useState('');
    const [mobileFull, setMobileFull] = useState('');
    const [emailFull, setEmailFull] = useState('');

    useEffect(() => {
        // Set default academic year
        if (academicListdefault.length > 0 && !asmaY_Id) {
            setValue('asmaY_Id', academicListdefault[0].asmaY_Id);
        }

        // Config settings from local storage
        try {
            const configsettingsnew = JSON.parse(localStorage.getItem('ivrmgeneralconfiglist') || 'null');
            if (configsettingsnew && configsettingsnew.length > 0) {
                const config = configsettingsnew[0];
                setEmailOtpEnabled(config.ivrmgC_emailValOTPFlag === 1);
                setMobileOtpEnabled(config.ivrmgC_MobileValOTPFlag === 1);

                const mobilenofull = config.ivrmgC_OTPMobileNo?.toString() || '0';
                setMobileFull(mobilenofull);
                if (mobilenofull !== '0' && mobilenofull.length >= 10) {
                    setMobileNoMasked(mobilenofull.substring(6, 10));
                }

                const emailidforotp = config.ivrmgC_OTPMailId;
                setEmailFull(emailidforotp || '');
                if (emailidforotp) {
                    setEmailIdMasked(emailidforotp.substring(0, 4));
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [initialData, setValue, asmaY_Id, academicListdefault]);

    const onSubmit = async () => {
        if (!asmaY_Id || asmaY_Id === 0) {
            toast.error('Please select Academic Year');
            return;
        }
        setIsLoading(true);
        try {
            const result = await fetchReport();
            const resData = (result.data as any)?.data || result.data;
            if (resData) {
                setStudents(resData.studentAttendanceList || []);
                setTotalStudents(resData.totalAttendanceRecords || resData.studentAttendanceList?.length || 0);

                const detailedList: any[] = resData.absentStudentList || [];
                setTotalAbsent(resData.totalAbsentRecords || detailedList.length || 0);

                // Initialize selected property
                detailedList.forEach((item: any) => {
                    item.selected = false;
                    item.FirstHalfflag = item.ASA_Class_Attended === 0.5 || (item.ASA_Class_Attended === 0.0 && item.FirstHalf === 1);
                    item.SecondHalfflag = item.ASA_Class_Attended === 0.5 || (item.ASA_Class_Attended === 0.0 && item.SecondHalf === 1);
                });
                setStudentTeacherList(detailedList);

                if (!resData.studentAttendanceList?.length && !detailedList.length) {
                    toast.error('No Records Found!');
                }
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        reset();
        setStudents([]);
        setStudentTeacherList([]);
        setTotalStudents(0);
        setTotalAbsent(0);
        setSearchValue('');
        setSearchValue1234('');
    };

    // Filter Logic
    const filteredStudents = students.filter((obj) =>
        (obj.ASMCL_ClassName + '-' + obj.ASMC_SectionName).toLowerCase().includes(searchValue.toLowerCase())
    );

    const filteredStudentTeacherList = studentTeacherList.filter(
        (obj) =>
            (obj.classsection || '').toLowerCase().includes(searchValue1234.toLowerCase()) ||
            (obj.studentname || '').toLowerCase().includes(searchValue1234.toLowerCase())
    );

    const selectedStudents = studentTeacherList.filter((item) => item.selected);

    const handleRowSelection = (selectedRows: any[]) => {
        // Update the 'selected' property based on row selection from DataTable
        const selectedIds = new Set(selectedRows.map((r) => r.AMST_Id));
        setStudentTeacherList((prev) =>
            prev.map((item) => ({
                ...item,
                selected: selectedIds.has(item.AMST_Id)
            }))
        );
    };

    // ACTION Handlers
    const handleActionClick = (type: 'sms' | 'email' | 'notice') => {
        if (selectedStudents.length === 0) {
            toast.error('Kindly select atleast one student..!');
            return;
        }
        setActionType(type);
        setOtpVerified(!(emailOtpEnabled || mobileOtpEnabled));

        if (emailOtpEnabled || mobileOtpEnabled) {
            setShowOtpModal(true);
            setOtpType(mobileOtpEnabled ? 'M' : 'E');
        } else {
            setShowSmsModal(true);
        }
    };

    const handleSendOtp = async () => {
        try {
            const data = {
                clickedlinkname: otpType,
                Mobile: mobileFull,
                Email: emailFull || 'test@mail'
            };
            await sendOtp.mutateAsync(data);
            setShowOtpModal(false);
            setShowSmsModal(true);
            setResendOtpButton(false);
            setForgetEmailOTP('');
            toast.success('OTP sent successfully');
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (!forgetEmailOTP) {
            toast.error('Please Enter OTP Number!');
            return;
        }
        try {
            const response = (await verifyOtp.mutateAsync({ EMAILOTP: forgetEmailOTP })) as any;
            if (response === 'Success' || response?.data === 'Success' || response?.message === 'Success') {
                setOtpVerified(true);
                toast.success('OTP Verified successfully');
            } else if (response === 'Fail' || response?.data === 'Fail' || response?.message === 'Fail') {
                setOtpVerified(false);
                setResendOtpButton(true);
                toast.error('OTP Mismatch!');
            } else {
                setShowSmsModal(false);
                setShowOtpModal(true);
                toast.error('OTP Expired. Please resend OTP');
            }
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const executeAction = async () => {
        const data = {
            absentlist: selectedStudents,
            ASMAY_Id: asmaY_Id,
            fromdate: format(new Date(from_date), 'yyyy-MM-dd'),
            attType: frequency === '0' ? 'D' : 'H'
        };

        try {
            let res;
            if (actionType === 'sms') {
                res = await sendSms.mutateAsync(data);
            } else if (actionType === 'email') {
                res = await sendEmail.mutateAsync(data);
            } else if (actionType === 'notice') {
                res = await sendNotice.mutateAsync(data);
            }
            if (res?.message) {
                toast.success(res.message);
                setShowSmsModal(false);
            }
        } catch (error) {
            toast.error(`Failed to send ${actionType}`);
        }
    };

    return (
        <div className='min-h-screen'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4 rounded-xl border bg-card p-6 shadow-xl'>
                    <div className='mb-4 border-b pb-4'>
                        <h3 className='font-semibold text-lg'>Overall Daily Attendance Report</h3>
                    </div>

                    <div className='mb-6 flex justify-center'>
                        <div className='rounded-lg bg-muted/50 p-4'>
                            <Controller
                                name='frequency'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='0' />
                                            <Label htmlFor='0'>Daily Once</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='1' />
                                            <Label htmlFor='1'>Daily Twice</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>

                    <div className='mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {/* Academic Year */}
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {initialLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                academicList.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        {/* Category */}
                        {categoryflag && (
                            <div className='flex flex-col gap-1.5'>
                                <Label>Category</Label>
                                <Controller
                                    name='amC_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='0'>All</SelectItem>
                                                {categoryDropdown.map((c: any) => (
                                                    <SelectItem key={c.amC_Id} value={c.amC_Id.toString()}>
                                                        {c.amC_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        )}

                        {/* Date */}
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Date <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='from_date'
                                control={control}
                                render={({ field }) => (
                                    <Popover
                                        open={openPopover === 'from_date'}
                                        onOpenChange={(open) => setOpenPopover(open ? 'from_date' : null)}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'justify-start text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    if (!isBeforeOrEqualLocalDate(date, new Date())) {
                                                        toast.error('Please select today or a previous date');
                                                        return;
                                                    }
                                                    field.onChange(date.toISOString());
                                                    setOpenPopover(null);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                        </div>
                    </div>

                    <div className='mt-8 flex flex-wrap justify-center gap-3 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} isLoading={isLoading}>
                            <Save className='mr-2 h-4 w-4' /> Report
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleClear}>
                            <X className='mr-2 h-4 w-4' /> Cancel
                        </Button>
                        <Button
                            type='button'
                            onClick={() => handleActionClick('sms')}
                            disabled={studentTeacherList.length === 0}
                            variant='secondary'>
                            <Send className='mr-2 h-4 w-4' /> Send SMS
                        </Button>
                        <Button
                            type='button'
                            onClick={() => handleActionClick('email')}
                            disabled={studentTeacherList.length === 0}
                            variant='secondary'>
                            <Mail className='mr-2 h-4 w-4' /> Send Email
                        </Button>
                        <Button
                            type='button'
                            onClick={() => handleActionClick('notice')}
                            disabled={studentTeacherList.length === 0}
                            variant='secondary'>
                            <Bell className='mr-2 h-4 w-4' /> Send Notice
                        </Button>
                    </div>
                </div>
            </form>

            {(students.length > 0 || studentTeacherList.length > 0) && (
                <div className='rounded-xl border bg-card p-6 shadow-xl'>
                    <div className='mb-8'>
                        <div className='mb-4 flex items-center justify-between'>
                            <div>
                                <span className='font-semibold'>Total Grid Records: </span>
                                <span className='rounded-full bg-primary/10 px-2 py-1 text-primary text-sm'>{totalStudents}</span>
                            </div>
                        </div>
                        <DataTable
                            columns={summaryColumns}
                            data={students}
                            totalItems={totalStudents}
                            isSearchRequired={true}
                            isPaginationRequired={true}
                            showExportOptions={false}
                            showViewOptions={true}
                        />
                    </div>

                    {/* Second Table - Detailed List */}
                    <div>
                        <div className='mb-4 flex items-center justify-between'>
                            <div>
                                <span className='font-semibold'>Total Absent Records: </span>
                                <span className='rounded-full bg-primary/10 px-2 py-1 text-primary text-sm'>{totalAbsent}</span>
                            </div>
                        </div>
                        <DataTable
                            columns={getStudentColumns(frequency)}
                            data={studentTeacherList}
                            totalItems={totalAbsent}
                            isSearchRequired={true}
                            isPaginationRequired={true}
                            showExportOptions={false}
                            showViewOptions={true}
                            onRowSelectionChange={handleRowSelection}
                            getRowId={(row: any) => String(row.AMST_Id)}
                        />
                    </div>
                </div>
            )}

            {/* OTP Modal */}
            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Absent Student SMS - OTP</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-6 py-6 text-center'>
                        <div className='flex justify-center gap-4'>
                            {mobileOtpEnabled && (
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='M' id='M' checked={otpType === 'M'} onClick={() => setOtpType('M')} />
                                    <Label htmlFor='M'>Mobile OTP</Label>
                                </div>
                            )}
                            {emailOtpEnabled && (
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='E' id='E' checked={otpType === 'E'} onClick={() => setOtpType('E')} />
                                    <Label htmlFor='E'>Email OTP</Label>
                                </div>
                            )}
                        </div>

                        {otpType === 'M' ? (
                            <div>
                                <h4 className='font-medium text-red-500'>OTP will be Send To Authorised Mobile No!!</h4>
                                <p className='mt-2'>Mobile Number: ******{mobileNoMasked}</p>
                            </div>
                        ) : (
                            <div>
                                <h4 className='font-medium text-red-500'>OTP will be Send To Authorised Email Id!!</h4>
                                <p className='mt-2'>Email Id: {emailIdMasked}******</p>
                            </div>
                        )}

                        <div className='mt-6 flex justify-center gap-4'>
                            <Button onClick={handleSendOtp}>SEND OTP</Button>
                            <Button variant='outline' onClick={() => setShowOtpModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Action Modal (SMS/Email/Notice confirmation) */}
            <Dialog open={showSmsModal} onOpenChange={setShowSmsModal}>
                <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle>Absent Student {actionType?.toUpperCase()}</DialogTitle>
                    </DialogHeader>
                    <div className='py-4'>
                        <div className='mb-4 text-center'>
                            <h4 className='font-medium text-red-500'>Students List Which You Are Selected !!!</h4>
                            <p className='mt-1 font-medium text-sm'>NOTE: {actionType?.toUpperCase()} Will Trigger For The Same</p>
                        </div>

                        <div className='mb-6 max-h-60 overflow-y-auto rounded-md border'>
                            <table className='w-full text-center text-sm'>
                                <thead className='sticky top-0 bg-muted/50'>
                                    <tr>
                                        <th className='p-2'>SL.NO.</th>
                                        <th className='p-2'>Class-Section</th>
                                        <th className='p-2'>NAME</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedStudents.map((s, idx) => (
                                        <tr key={idx} className='border-b last:border-0'>
                                            <td className='p-2'>{idx + 1}</td>
                                            <td className='p-2'>{s.classsection}</td>
                                            <td className='p-2 text-left'>{s.studentname}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {!otpVerified && (
                            <div className='mb-6 flex items-center justify-center gap-4 rounded-lg bg-muted/30 p-4'>
                                <Label>Enter OTP:</Label>
                                <Input
                                    type='password'
                                    placeholder='ENTER OTP NUMBER'
                                    value={forgetEmailOTP}
                                    onChange={(e) => setForgetEmailOTP(e.target.value)}
                                    className='max-w-[200px]'
                                />
                                <Button onClick={handleVerifyOtp} size='sm'>
                                    Submit
                                </Button>
                                {resendOtpButton && (
                                    <Button onClick={handleSendOtp} variant='outline' size='sm'>
                                        Resend OTP
                                    </Button>
                                )}
                            </div>
                        )}

                        <DialogFooter className='sm:justify-center'>
                            <Button
                                onClick={executeAction}
                                disabled={!otpVerified}
                                isLoading={sendSms.isPending || sendEmail.isPending || sendNotice.isPending}>
                                SEND
                            </Button>
                            <Button variant='outline' onClick={() => setShowSmsModal(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
