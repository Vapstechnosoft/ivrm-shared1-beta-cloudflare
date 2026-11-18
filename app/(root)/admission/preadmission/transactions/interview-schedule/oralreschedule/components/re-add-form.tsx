'use client';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useOralReScheduleDetails,
    useReScheduleReportDetails,
    useReScheduleSelectedRow,
    useSaveOralReSchedule
} from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import { type OralReScheduleFormValues, oralReScheduleSchema } from '@/schemas/admission/preadmission/transactions/oral-test-schedule';
import type { IOralTestSchedule, IStudentDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { differenceInMinutes, format } from 'date-fns';
import { ChevronDown, ChevronUp, FileText, Loader2, RotateCcw, Save, Trash } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface OralReScheduleFormProps {
    onSuccess: () => void;
    initialData?: IOralTestSchedule;
}

export default function OralReScheduleForm({ onSuccess, initialData }: OralReScheduleFormProps) {
    const { data: details } = useOralReScheduleDetails(0) as any;
    const [selectedPrevId, setSelectedPrevId] = useState<string>('');
    const { data: reportResponse, isLoading: isReportLoading } = useReScheduleReportDetails(selectedPrevId) as any;
    const { data: selectedRowDetails } = useReScheduleSelectedRow(Number(selectedPrevId));
    const { mutate: saveSchedule, isPending: isSaving } = useSaveOralReSchedule();

    const [availableStudents, setAvailableStudents] = useState<IStudentDetails[]>([]);
    const [cartStudents, setCartStudents] = useState<IStudentDetails[]>([]);

    const form = useForm<OralReScheduleFormValues>({
        resolver: zodResolver(oralReScheduleSchema),
        defaultValues: {
            paotS_Id: 0,
            paotS_ScheduleName: '',
            asmcL_Id: '0',
            paotS_ScheduleDate: new Date(),
            paotS_ScheduleTime: '',
            paotS_ScheduleTimeTo: '',
            paotS_TPFlag: true,
            paotS_TimePeriod: 0,
            paotS_Strength: 0,
            paotS_Remarks: '',
            paotS_Superviser: '',
            paotS_Skills: '',
            previousScheduleId: '',
            autoschedule: false,
            autostudent: true,
            meetingvc: false,
            pavidc: false,
            stafflag: false,
            principalflg: false,
            managerflg: false,
            anybodystart: false,
            addParticipants: false
        }
    });

    // Handle initialData for editing
    useEffect(() => {
        if (initialData) {
            form.reset({
                paotS_Id: initialData.paotS_Id,
                previousScheduleId: String(initialData.paotS_Id), // Using its own ID if editing?
                // Wait, if it's "re-schedule", previousScheduleId might be something else.
                // But let's map what we have.
                paotS_ScheduleName: initialData.paotS_ScheduleName || '',
                paotS_ScheduleDate: initialData.paotS_ScheduleDate ? new Date(initialData.paotS_ScheduleDate) : new Date(),
                paotS_ScheduleTime: initialData.paotS_ScheduleTime || '09:00',
                paotS_ScheduleTimeTo: initialData.paotS_ScheduleTimeTo || '10:00',
                paotS_Remarks: initialData.paotS_Remarks || '',
                paotS_Superviser: initialData.paotS_Superviser || '',
                paotS_Skills: initialData.paotS_Skills || '',
                paotS_TPFlag: initialData.paotS_TPFlag ?? true,
                paotS_TimePeriod: initialData.paotS_TimePeriod || 0,
                paotS_Strength: initialData.paotS_Strength || 0,
                meetingvc: initialData.vc || false,
                autostudent: true
            });
            if (initialData.paotS_Id) {
                setSelectedPrevId(String(initialData.paotS_Id));
            }
        }
    }, [initialData, form]);

    // Populate form when previous schedule details are fetched
    useEffect(() => {
        const rawData = selectedRowDetails?.data || selectedRowDetails;
        if (rawData?.oralTestSchedule && rawData.oralTestSchedule.length > 0) {
            const details = rawData.oralTestSchedule[0];
            form.setValue('paotS_ScheduleName', details.paotS_ScheduleName || '');
            form.setValue('paotS_ScheduleDate', details.paotS_ScheduleDate ? new Date(details.paotS_ScheduleDate) : new Date());
            form.setValue('paotS_ScheduleTime', details.paotS_ScheduleTime || '');
            form.setValue('paotS_ScheduleTimeTo', details.paotS_ScheduleTimeTo || '');
            form.setValue('paotS_Remarks', details.paotS_Remarks || '');
            form.setValue('paotS_Superviser', details.paotS_Superviser || '');
            form.setValue('paotS_Skills', details.paotS_Skills || '');
            form.setValue('paotS_Strength', details.paotS_Strength || 0);
            form.setValue('paotS_TimePeriod', details.paotS_TimePeriod || 10);
            form.setValue('paotS_TPFlag', details.paotS_TPFlag ?? true);
        }

        if (rawData?.selectedStudentDetails && rawData.selectedStudentDetails.length > 0) {
            const students = rawData.selectedStudentDetails.map((s: any) => ({
                pasR_Id: s.pasr_id || s.pasR_Id || 0,
                name: `${s.pasR_FirstName || ''} ${s.pasR_MiddleName || ''} ${s.pasR_LastName || ''}`.trim() || s.name || 'Unknown',
                regno: s.pasR_RegistrationNo || s.regno || '',
                gender: s.pasR_Sex || s.gender || '',
                pasR_MobileNo: s.pasR_MobileNo || 0,
                pasR_emailId: s.pasR_emailId || '',
                vcmeeting: s.vcmeeting !== undefined ? !!s.vcmeeting : !!s.paotS_ScheduleTimeTo && !!s.paotS_ScheduleTime, // Default logic if missing
                ScheduleDate: s.paotS_ScheduleDate || s.ScheduleDate || null,
                ScheduleTime: s.paotS_ScheduleTime || s.ScheduleTime || '',
                ScheduleTimeTo: s.paotS_ScheduleTimeTo || s.ScheduleTimeTo || ''
            }));
            setCartStudents(students);

            // If paotS_Strength is missing from oralTestSchedule, use the count of students
            if (!form.getValues('paotS_Strength')) {
                form.setValue('paotS_Strength', students.length);
            }
        }
    }, [selectedRowDetails, form]);

    // Handle initial available students
    useEffect(() => {
        const rawData = Array.isArray(reportResponse) ? reportResponse : reportResponse?.data || reportResponse?.allreports || [];
        const normalizedData = (Array.isArray(rawData) ? rawData : rawData?.$values || []).map((s: any) => ({
            ...s,
            pasR_Id: s.pasR_Id || s.pasr_id || 0,
            name: s.name || s.pasR_FirstName || '',
            regno: s.regno || s.pasR_RegistrationNo || '',
            gender: s.gender || s.pasR_Sex || '',
            pasR_MobileNo: s.pasR_MobileNo || s.mobileNo || 0,
            pasR_emailId: s.pasR_emailId || s.emailId || '',
            ScheduleDate: s.scheduledate || s.ScheduleDate || null,
            ScheduleTime: s.scheduletime || s.ScheduleTime || '',
            ScheduleTimeTo: s.scheduletimeto || s.ScheduleTimeTo || ''
        }));
        setAvailableStudents(normalizedData);
    }, [reportResponse]);

    // Auto-select logic
    const autostudent = form.watch('autostudent');
    const strength = form.watch('paotS_Strength');

    useEffect(() => {
        if (autostudent && strength > 0 && availableStudents.length > 0) {
            const toSelect = availableStudents.slice(0, Math.min(strength, availableStudents.length));
            setCartStudents(toSelect);
        }
    }, [autostudent, strength, availableStudents]);

    const isVCEnabled = form.watch('meetingvc');
    const startTime = form.watch('paotS_ScheduleTime');
    const endTime = form.watch('paotS_ScheduleTimeTo');

    useEffect(() => {
        if (startTime && endTime && startTime === endTime) {
            Swal.fire({
                title: '<span style="color: #435ebe; font-size: 1.5rem; font-weight: 700;">Schedule time and mapping time of student is not possible</span>',
                icon: undefined,
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#8cd4f5',
                customClass: {
                    popup: 'rounded-lg border-none shadow-xl',
                    confirmButton: 'px-8 py-2 font-bold uppercase rounded text-sm'
                }
            });
        }
    }, [startTime, endTime]);

    // Video conferencing auto-check logic
    useEffect(() => {
        if (isVCEnabled) {
            setAvailableStudents((prev) => prev.map((s) => ({ ...s, vcmeeting: true })));
            setCartStudents((prev) => prev.map((s) => ({ ...s, vcmeeting: true })));
        } else {
            setAvailableStudents((prev) => prev.map((s) => ({ ...s, vcmeeting: false })));
            setCartStudents((prev) => prev.map((s) => ({ ...s, vcmeeting: false })));
        }
    }, [isVCEnabled]);

    const availableColumns = useMemo<ColumnDef<IStudentDetails>[]>(() => {
        const cols: ColumnDef<IStudentDetails>[] = [
            {
                id: 'select',
                header: 'Select',
                cell: ({ row }) => (
                    <Checkbox
                        checked={cartStudents.some((s) => s.pasR_Id === row.original.pasR_Id)}
                        onCheckedChange={(value: any) => {
                            if (value) {
                                if (cartStudents.length < strength) {
                                    setCartStudents([...cartStudents, row.original]);
                                } else {
                                    toast.error(`Cannot select more than ${strength} students`);
                                }
                            } else {
                                setCartStudents(cartStudents.filter((s) => s.pasR_Id !== row.original.pasR_Id));
                            }
                        }}
                    />
                )
            },
            {
                id: 'slno',
                header: 'SL.NO',
                cell: ({ row }) => row.index + 1
            },
            { accessorKey: 'regno', header: 'Reg. No' },
            { accessorKey: 'name', header: 'Student Name' },
            { accessorKey: 'gender', header: 'Gender' },
            {
                accessorKey: 'ScheduleDate',
                header: 'Previous Date',
                cell: ({ row }) => (row.original.ScheduleDate ? format(new Date(row.original.ScheduleDate), 'dd-MM-yyyy') : '')
            },
            {
                id: 'time',
                header: 'Previous Time',
                cell: ({ row }) => {
                    const from = row.original.ScheduleTime || '';
                    const to = row.original.ScheduleTimeTo || '';
                    return from && to ? `${from} - ${to}` : from || to || 'N/A';
                }
            }
        ];

        if (isVCEnabled) {
            cols.splice(6, 0, {
                id: 'vcmeeting',
                header: 'Vc Meeting',
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.original.vcmeeting}
                        onCheckedChange={(val) => {
                            setAvailableStudents((prev) =>
                                prev.map((s) => (s.pasR_Id === row.original.pasR_Id ? { ...s, vcmeeting: !!val } : s))
                            );
                            // Also update in cart if present
                            setCartStudents((prev) =>
                                prev.map((s) => (s.pasR_Id === row.original.pasR_Id ? { ...s, vcmeeting: !!val } : s))
                            );
                        }}
                    />
                )
            });
        }

        return cols;
    }, [cartStudents, strength, isVCEnabled]);

    const cartColumns = useMemo<ColumnDef<IStudentDetails>[]>(() => {
        const cols: ColumnDef<IStudentDetails>[] = [
            {
                id: 'slno',
                header: 'SL.NO',
                cell: ({ row }) => row.index + 1
            },
            { accessorKey: 'regno', header: 'Reg. No' },
            { accessorKey: 'name', header: 'Student Name' },
            { accessorKey: 'gender', header: 'Gender' },
            {
                accessorKey: 'ScheduleDate',
                header: 'Previous Date',
                cell: ({ row }) => (row.original.ScheduleDate ? format(new Date(row.original.ScheduleDate), 'dd-MM-yyyy') : '')
            },
            {
                id: 'time',
                header: 'Previous Time',
                cell: ({ row }) => {
                    const from = row.original.ScheduleTime || '';
                    const to = row.original.ScheduleTimeTo || '';
                    return from && to ? `${from} - ${to}` : from || to || 'N/A';
                }
            }
        ];

        if (isVCEnabled) {
            cols.push({
                id: 'vcmeeting',
                header: 'VC Meeting',
                cell: ({ row }) => <span className='font-bold text-green-600 text-xs'>{row.original.vcmeeting ? 'Yes' : 'No'}</span>
            });
        }

        cols.push({
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-destructive'
                    onClick={() => setCartStudents(cartStudents.filter((s) => s.pasR_Id !== row.original.pasR_Id))}>
                    <Trash className='h-4 w-4' />
                </Button>
            )
        });

        return cols;
    }, [cartStudents, isVCEnabled]);

    async function onSubmit(values: OralReScheduleFormValues) {
        if (values.paotS_ScheduleTime === values.paotS_ScheduleTimeTo) {
            Swal.fire({
                title: 'Schedule time and mapping time of student is not possible',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Time Validation
        const from = parseTimeString(values.paotS_ScheduleTime);
        const to = parseTimeString(values.paotS_ScheduleTimeTo);
        const diff = differenceInMinutes(to, from);

        const interactionTime = Number(values.paotS_TimePeriod);
        const totalNeeded = values.paotS_TPFlag ? interactionTime * values.paotS_Strength : interactionTime * 60 * values.paotS_Strength;

        if (totalNeeded > diff) {
            toast.error(`Total interaction time (${totalNeeded} mins) exceeds schedule duration (${diff} mins)`);
            return;
        }

        if (cartStudents.length === 0) {
            toast.error('Please select at least one student to cart');
            return;
        }

        const payload = {
            PAOTS_Id: Number(values.previousScheduleId),
            PAOTS_ScheduleName: values.paotS_ScheduleName,
            PAOTS_ScheduleDate: format(values.paotS_ScheduleDate, 'yyyy-MM-dd'),
            PAOTS_ScheduleTime: values.paotS_ScheduleTime,
            PAOTS_ScheduleTimeTo: values.paotS_ScheduleTimeTo,
            PAOTS_TimePeriod: values.paotS_TimePeriod,
            PAOTS_TPFlag: values.paotS_TPFlag,
            SelectedStudentData: cartStudents.map((s) => ({
                PASR_Id: s.pasR_Id,
                PASR_MobileNo: s.pasR_MobileNo,
                PASR_emailId: s.pasR_emailId,
                vcmeeting: !!s.vcmeeting
            })),
            SelectedStudentDataForEdit: [],
            PAOTS_Superviser: values.paotS_Superviser || '',
            PAOTS_Skills: values.paotS_Skills || ''
        };

        saveSchedule(payload, {
            onSuccess: (res: any) => {
                if (res?.returnval === false) {
                    // Handled by mutation hook's toast
                    return;
                }
                Swal.fire({
                    title: res?.message || 'ReSchedule Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    onSuccess();
                });
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Failed to save schedule');
            }
        });
    }

    const onInvalid = (errors: any) => {
        console.error('Form Validation Errors:', errors);
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    const handleCancel = () => {
        onSuccess(); // Close the form
    };

    function parseTimeString(time: string) {
        const [h, m] = time.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='space-y-6'>
                <div className='flex items-center justify-between rounded-t-lg border-b bg-slate-50 p-3'>
                    <h3 className='font-semibold text-slate-700'>Re-Schedule Details</h3>
                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => form.reset()}
                        className='border-none bg-blue-600 text-white hover:bg-blue-700 hover:text-white'>
                        <RotateCcw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                </div>

                <div className='space-y-4 rounded-b-lg border bg-white p-6 shadow-sm'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                        {/* Left Column: Schedule Basics */}
                        <div className='space-y-4 md:col-span-7'>
                            <div className='grid grid-cols-12 items-center gap-2'>
                                <div className='col-span-4'>
                                    <FormLabel className='flex justify-end font-bold text-xs'>
                                        Previous Schedule : <span className='ml-1 text-destructive'>*</span>
                                    </FormLabel>
                                </div>
                                <div className='col-span-5'>
                                    <FormField
                                        control={form.control}
                                        name='previousScheduleId'
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val: string) => {
                                                    field.onChange(val);
                                                    setSelectedPrevId(val);
                                                }}
                                                value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className='h-8 text-xs'>
                                                        <SelectValue placeholder='Select' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(details?.oralTestSchedule || details?.data?.oralTestSchedule || [])?.map((sch: any) => (
                                                        <SelectItem key={sch.paotS_Id} value={String(sch.paotS_Id)}>
                                                            {sch.paotS_ScheduleName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className='col-span-3'>
                                    <RadioGroup defaultValue='12' className='flex items-center space-x-2'>
                                        <div className='flex items-center space-x-1'>
                                            <RadioGroupItem value='12' id='r1' className='h-3 w-3' />
                                            <Label htmlFor='r1' className='font-bold text-[10px]'>
                                                12 Hours
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-1'>
                                            <RadioGroupItem value='24' id='r2' className='h-3 w-3' />
                                            <Label htmlFor='r2' className='font-bold text-[10px]'>
                                                24 Hours
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className='grid grid-cols-12 items-center gap-2'>
                                <div className='col-span-4'>
                                    <FormLabel className='flex justify-end font-bold text-xs'>
                                        Re-Schedule Name : <span className='ml-1 text-destructive'>*</span>
                                    </FormLabel>
                                </div>
                                <div className='col-span-8'>
                                    <FormField
                                        control={form.control}
                                        name='paotS_ScheduleName'
                                        render={({ field }) => (
                                            <FormControl>
                                                <Input {...field} placeholder='Enter reschedule name' className='h-8 text-xs' />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-12 items-center gap-2'>
                                <div className='col-span-4'>
                                    <FormLabel className='flex justify-end font-bold text-xs'>
                                        Schedule Date : <span className='ml-1 text-destructive'>*</span>
                                    </FormLabel>
                                </div>
                                <div className='col-span-8'>
                                    <FormField
                                        control={form.control}
                                        name='paotS_ScheduleDate'
                                        render={({ field }) => (
                                            <DatePicker date={field.value} setDate={field.onChange} className='h-8 w-full text-xs' />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-12 items-start gap-2'>
                                <div className='col-span-4 pt-2'>
                                    <FormLabel className='flex justify-end font-bold text-xs'>Remarks :</FormLabel>
                                </div>
                                <div className='col-span-8'>
                                    <FormField
                                        control={form.control}
                                        name='paotS_Remarks'
                                        render={({ field }) => (
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    placeholder='Enter remarks'
                                                    className='min-h-[60px] resize-none text-xs'
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-12 items-center gap-2'>
                                <div className='col-span-4'>
                                    <FormLabel className='flex justify-end font-bold text-xs'>Supervisor :</FormLabel>
                                </div>
                                <div className='col-span-8'>
                                    <FormField
                                        control={form.control}
                                        name='paotS_Superviser'
                                        render={({ field }) => (
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    placeholder='Supervisor Name'
                                                    className='h-8 text-xs'
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-12 items-center gap-2'>
                                <div className='col-span-4'>
                                    <FormLabel className='flex justify-end font-bold text-xs'>Skill/Knowledge :</FormLabel>
                                </div>
                                <div className='col-span-8'>
                                    <FormField
                                        control={form.control}
                                        name='paotS_Skills'
                                        render={({ field }) => (
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    placeholder='Enter Skills/Knowledge'
                                                    className='h-8 text-xs'
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Time and Options */}
                        <div className='space-y-6 md:col-span-5'>
                            <div className='space-y-4 pt-4'>
                                <FormField
                                    control={form.control}
                                    name='paotS_ScheduleTime'
                                    render={({ field }) => (
                                        <TimeSpinnerField label='Schedule Time From : *' value={field.value} onChange={field.onChange} />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='paotS_ScheduleTimeTo'
                                    render={({ field }) => (
                                        <TimeSpinnerField label='Schedule Time To : *' value={field.value} onChange={field.onChange} />
                                    )}
                                />
                            </div>

                            <div className='space-y-3 rounded-lg border border-slate-300 border-dashed bg-slate-50 p-3'>
                                <div className='flex flex-wrap gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='meetingvc'
                                        render={({ field }) => (
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='flex items-center gap-1 font-bold text-[10px] uppercase'>
                                                    <FileText className='h-3 w-3' /> Video conferencing
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='autostudent'
                                        render={({ field }) => (
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-bold text-[10px] uppercase'>Auto Select Students</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='space-y-2 pt-2'>
                                    <div className='grid grid-cols-12 items-center gap-2'>
                                        <div className='col-span-8'>
                                            <FormLabel className='flex justify-end font-bold text-[10px]'>
                                                Individual student interaction time : <span className='ml-1 text-destructive'>*</span>
                                            </FormLabel>
                                        </div>
                                        <div className='col-span-4'>
                                            <FormField
                                                control={form.control}
                                                name='paotS_TimePeriod'
                                                render={({ field }) => <Input type='number' {...field} className='h-7 text-xs' />}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-12 items-center gap-2'>
                                        <div className='col-span-8'>
                                            <FormLabel className='flex justify-end font-bold text-[10px]'>
                                                No. Of Students : <span className='ml-1 text-destructive'>*</span>
                                            </FormLabel>
                                        </div>
                                        <div className='col-span-4'>
                                            <FormField
                                                control={form.control}
                                                name='paotS_Strength'
                                                render={({ field }) => (
                                                    <Input
                                                        type='number'
                                                        {...field}
                                                        className='h-7 text-xs'
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='space-y-6'>
                    {form.watch('previousScheduleId') && (
                        <Card className='border-slate-200 shadow-sm'>
                            <CardHeader className='rounded-t-sm border-b bg-[#0066cc] px-4 py-2'>
                                <CardTitle className='font-bold text-sm text-white uppercase tracking-wider'>
                                    Scheduled Student List
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='p-0'>
                                <div className='[&_.bg-slate-50]:bg-[#0066cc] [&_.bg-slate-50_th]:border-blue-400 [&_.bg-slate-50_th]:border-r [&_.bg-slate-50_th]:font-bold [&_.bg-slate-50_th]:text-[11px] [&_.bg-slate-50_th]:text-white'>
                                    <GenericDataTable
                                        data={availableStudents}
                                        columns={availableColumns}
                                        isLoading={isReportLoading}
                                        isSearchRequired={true}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {Number(form.watch('paotS_Strength')) > 0 && (
                        <Card className='overflow-hidden border-slate-200 shadow-sm'>
                            <CardHeader className='flex flex-row items-center justify-between border-b bg-[#0066cc] px-4 py-2'>
                                <CardTitle className='font-bold text-sm text-white uppercase tracking-wider'>
                                    Selected Student To Cart
                                </CardTitle>
                                <div className='flex items-center gap-4'>
                                    <FormField
                                        control={form.control}
                                        name='meetingvc'
                                        render={({ field }) => (
                                            <div className='flex items-center space-x-2 rounded bg-white/10 px-2 py-1'>
                                                <Checkbox
                                                    id='vc-check'
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className='border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600'
                                                />
                                                <Label
                                                    htmlFor='vc-check'
                                                    className='flex cursor-pointer items-center gap-1 font-bold text-white text-xs'>
                                                    <FileText className='h-3 w-3' /> Video conferencing
                                                </Label>
                                            </div>
                                        )}
                                    />
                                    <div className='rounded border border-white/30 bg-white/20 px-2 py-1 font-bold text-[11px] text-white'>
                                        Count: {cartStudents.length} / {strength}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className='p-0'>
                                <div className='[&_.bg-slate-50]:bg-[#0066cc] [&_.bg-slate-50_th]:border-blue-400 [&_.bg-slate-50_th]:border-r [&_.bg-slate-50_th]:font-bold [&_.bg-slate-50_th]:text-[11px] [&_.bg-slate-50_th]:text-white'>
                                    <GenericDataTable data={cartStudents} columns={cartColumns} isLoading={false} isSearchRequired={true} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {Number(form.watch('paotS_Strength')) > 0 && (
                    <div className='flex items-center justify-center gap-4 pt-6'>
                        <Button
                            type='submit'
                            disabled={isSaving}
                            className='flex h-9 items-center gap-2 bg-[#0066cc] px-10 font-bold text-white hover:bg-blue-700'>
                            {isSaving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                            SAVE
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleCancel}
                            className='flex h-9 items-center gap-2 bg-[#ff4d4d] px-10 font-bold hover:bg-red-600'>
                            <RotateCcw className='h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}

function TimeSpinnerField({
    label,
    value,
    onChange,
    error
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    error?: string;
}) {
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const ampmRef = useRef<HTMLDivElement>(null);

    function parse(v: string) {
        const [hStr = '12', mStr = '00'] = (v || '').split(':');
        let h = Number(hStr) % 24;
        const m = Math.min(59, Math.max(0, Number(mStr)));
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return { h, m, ampm };
    }

    function emit(h: number, m: number, ampm: string) {
        let h24 = h % 12;
        if (ampm === 'PM') h24 += 12;
        onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }

    const { h, m, ampm } = parse(value);

    useEffect(() => {
        const handleHoursWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) emit((h % 12) + 1 || 12, m, ampm);
            else emit(((h - 2 + 12) % 12) + 1, m, ampm);
        };
        const handleMinutesWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) emit(h, (m + 1) % 60, ampm);
            else emit(h, (m - 1 + 60) % 60, ampm);
        };
        const handleAmpmWheel = (e: WheelEvent) => {
            e.preventDefault();
            emit(h, m, ampm === 'AM' ? 'PM' : 'AM');
        };

        const hEl = hoursRef.current;
        const mEl = minutesRef.current;
        const aEl = ampmRef.current;

        if (hEl) hEl.addEventListener('wheel', handleHoursWheel, { passive: false });
        if (mEl) mEl.addEventListener('wheel', handleMinutesWheel, { passive: false });
        if (aEl) aEl.addEventListener('wheel', handleAmpmWheel, { passive: false });

        return () => {
            if (hEl) hEl.removeEventListener('wheel', handleHoursWheel);
            if (mEl) mEl.removeEventListener('wheel', handleMinutesWheel);
            if (aEl) aEl.removeEventListener('wheel', handleAmpmWheel);
        };
    }, [h, m, ampm]);

    return (
        <div className='flex items-center gap-4'>
            <Label className='w-40 text-right font-medium'>{label}</Label>
            <div className='flex items-center gap-2'>
                <div ref={hoursRef} className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit((h % 12) + 1 || 12, m, ampm)} className='p-0.5'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <div className='flex h-8 w-10 items-center justify-center rounded border border-blue-400 bg-white font-bold text-sm'>
                        {String(h).padStart(2, '0')}
                    </div>
                    <button type='button' onClick={() => emit(((h - 2 + 12) % 12) + 1, m, ampm)} className='p-0.5'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>
                <span className='font-bold'>:</span>
                <div ref={minutesRef} className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit(h, (m + 1) % 60, ampm)} className='p-0.5'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <div className='flex h-8 w-10 items-center justify-center rounded border border-blue-400 bg-white font-bold text-sm'>
                        {String(m).padStart(2, '0')}
                    </div>
                    <button type='button' onClick={() => emit(h, (m - 1 + 60) % 60, ampm)} className='p-0.5'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>
                <div ref={ampmRef} className='ml-2 flex flex-col items-center'>
                    <button type='button' onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')} className='p-0.5'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <div className='flex h-8 w-10 items-center justify-center rounded border border-blue-400 bg-white font-bold text-blue-600 text-sm'>
                        {ampm}
                    </div>
                    <button type='button' onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')} className='p-0.5'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>
            </div>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
        </div>
    );
}
