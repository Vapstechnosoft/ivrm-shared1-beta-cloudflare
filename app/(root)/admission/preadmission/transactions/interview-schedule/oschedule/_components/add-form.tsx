'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useClasswiseStudents,
    useOralTestScheduleDetails,
    useOralTestScheduleSelectedRow,
    useSaveOralTestSchedule
} from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { type OralTestScheduleFormValues, oralTestScheduleSchema } from '@/schemas/admission/preadmission/transactions/oral-test-schedule';
import type { IOralTestSchedule, IStaffDetails, IStudentDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { differenceInMinutes, format } from 'date-fns';
import { ChevronDown, ChevronUp, Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface OralTestScheduleFormProps {
    onSuccess: () => void;
    initialData?: IOralTestSchedule;
}

export default function OralTestScheduleForm({ onSuccess, initialData }: OralTestScheduleFormProps) {
    const { data: details } = useOralTestScheduleDetails() as any;
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const { data: studentsResponse, isLoading: isStudentsLoading } = useClasswiseStudents(selectedClassId) as any;
    const { data: editData } = useOralTestScheduleSelectedRow(initialData?.paotS_Id || 0) as any;
    const { mutate: saveSchedule, isPending: isSaving } = useSaveOralTestSchedule();

    const [selectedStudents, setSelectedStudents] = useState<IStudentDetails[]>([]);
    const [allStudents, setAllStudents] = useState<IStudentDetails[]>([]);
    const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
    const [staffSearch, setStaffSearch] = useState('');

    const form = useForm<OralTestScheduleFormValues>({
        resolver: zodResolver(oralTestScheduleSchema),
        defaultValues: {
            paotS_Id: 0,
            paotS_ScheduleName: '',
            asmcL_Id: '',
            paotS_ScheduleDate: new Date(),
            paotS_Remarks: '',
            paotS_Superviser: '',
            paotS_Skills: '',
            paotS_ScheduleTime: '12:00',
            paotS_ScheduleTimeTo: '12:00',
            paotS_TimePeriod: 0,
            paotS_Strength: 0,
            paotS_TPFlag: true, // true for minutes
            autostudent: true,
            autoschedule: false,
            meetingvc: false,
            pavidc: false,
            stafflag: false,
            principalflg: false,
            managerflg: false,
            anybodystart: false,
            addParticipants: false
        }
    });

    // Initialize edit data
    useEffect(() => {
        if (editData?.oralTestScheduleDetails?.[0]) {
            const data = editData.oralTestScheduleDetails[0];
            const child = editData.childarray?.[0];

            form.reset({
                paotS_Id: data.paotS_Id,
                paotS_ScheduleName: data.paotS_ScheduleName || '',
                asmcL_Id: String(child?.asmcL_Id || ''),
                paotS_ScheduleDate: new Date(data.paotS_ScheduleDate),
                paotS_ScheduleTime: data.paotS_ScheduleTime || '12:00',
                paotS_ScheduleTimeTo: data.paotS_ScheduleTimeTo || '12:00',
                paotS_Remarks: data.paotS_Remarks || '',
                paotS_Superviser: data.paotS_Superviser || '',
                paotS_Skills: data.paotS_Skills || '',
                paotS_TPFlag: data.paotS_TPFlag || false,
                paotS_TimePeriod: data.paotS_TimePeriod || '',
                paotS_Strength: data.paotS_Strength || 0,
                autoschedule: data.paotS_ScheduleTime !== '' && data.paotS_ScheduleTimeTo !== '',
                meetingvc: data.paotS_MeetingVC || false,
                pavidc: data.paotS_PAVIDC || false,
                autostudent: false,
                stafflag: data.paotS_StaffMapping || false,
                principalflg: data.paotS_PrincipalMapping || false,
                managerflg: data.paotS_ManagerMapping || false,
                anybodystart: data.paotS_AnybodyCanStart || false,
                addParticipants: data.paotS_StaffMapping || data.paotS_PrincipalMapping || data.paotS_ManagerMapping || false
            });

            if (child?.asmcL_Id) {
                setSelectedClassId(child.asmcL_Id);
            }

            if (editData.studentDetails) {
                setAllStudents(editData.studentDetails);
                setSelectedStudents(editData.studentDetails.filter((s: any) => s.checked));
            }
        }
    }, [editData, form]);

    // Handle class change
    useEffect(() => {
        if (studentsResponse && Array.isArray(studentsResponse) && !initialData) {
            setAllStudents(studentsResponse);
            setSelectedStudents([]);
        }
    }, [studentsResponse, initialData]);

    // Auto-select students logic
    const autostudent = form.watch('autostudent');
    const strength = form.watch('paotS_Strength');

    useEffect(() => {
        const strengthNum = Number(strength);
        if (autostudent && strengthNum > 0 && allStudents.length > 0) {
            const isVC = form.getValues('meetingvc');
            const toSelect = allStudents.slice(0, strengthNum).map((s) => ({
                ...s,
                vcmeeting: isVC
            }));
            setSelectedStudents(toSelect);
        }
    }, [autostudent, strength, allStudents, form.watch('meetingvc')]);

    const isFirstRender = useRef(true);
    const watchFromTime = form.watch('paotS_ScheduleTime');
    const watchToTime = form.watch('paotS_ScheduleTimeTo');

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (watchFromTime && watchToTime && watchFromTime === watchToTime) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Schedule time and mapping time of student is not possible'
            });
        }
    }, [watchFromTime, watchToTime]);

    const studentColumns: ColumnDef<IStudentDetails>[] = useMemo(() => {
        const cols: ColumnDef<IStudentDetails>[] = [
            {
                id: 'slno',
                header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
                cell: ({ row }) => row.index + 1
            },
            {
                accessorKey: 'pasR_FirstName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                cell: ({ row }) =>
                    `${row.original.pasR_FirstName} ${row.original.pasR_MiddleName || ''} ${row.original.pasR_LastName || ''}`
            },
            {
                accessorKey: 'pasR_RegistrationNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Registration No' />
            },
            {
                accessorKey: 'classname',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />
            },
            {
                accessorKey: 'pasR_Sex',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />
            },
            {
                accessorKey: 'pasR_MobileNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile Number' />
            },
            {
                accessorKey: 'pasR_EmailId',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Email No' />
            }
        ];

        if (form.watch('meetingvc')) {
            cols.push({
                id: 'vcmeeting',
                header: () => <div className='text-center'>VC Meeting</div>,
                cell: ({ row }) => {
                    const student = selectedStudents.find((s) => s.pasR_Id === row.original.pasR_Id);
                    const isSelected = !!student;
                    return (
                        <div className='flex justify-center'>
                            <Checkbox
                                checked={student?.vcmeeting || false}
                                disabled={!isSelected}
                                onCheckedChange={(value: any) => {
                                    if (isSelected) {
                                        setSelectedStudents(
                                            selectedStudents.map((s) =>
                                                s.pasR_Id === row.original.pasR_Id ? { ...s, vcmeeting: !!value } : s
                                            )
                                        );
                                    }
                                }}
                            />
                        </div>
                    );
                }
            });
        }

        cols.push({
            id: 'select',
            header: ({ table, column }) => (
                <div className='flex flex-col items-center gap-1'>
                    <DataTableColumnHeader column={column} title='Action' className='text-white' />
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value: any) => {
                            table.toggleAllPageRowsSelected(!!value);
                            if (value) {
                                setSelectedStudents(allStudents.map((s) => ({ ...s, vcmeeting: form.watch('meetingvc') })));
                            } else {
                                setSelectedStudents([]);
                            }
                        }}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={selectedStudents.some((s) => s.pasR_Id === row.original.pasR_Id)}
                        onCheckedChange={(value: any) => {
                            if (value) {
                                setSelectedStudents((prev) => {
                                    if (prev.some((s) => s.pasR_Id === row.original.pasR_Id)) return prev;
                                    return [...prev, { ...row.original, vcmeeting: form.watch('meetingvc') }];
                                });
                            } else {
                                setSelectedStudents((prev) => prev.filter((s) => s.pasR_Id !== row.original.pasR_Id));
                            }
                        }}
                    />
                </div>
            )
        });

        return cols;
    }, [allStudents, selectedStudents, form.watch('meetingvc')]);
    function parseTime(timeStr: string) {
        if (!timeStr) return new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    const onSubmit: SubmitHandler<OralTestScheduleFormValues> = async (values) => {
        // Time Validation
        const from = parseTime(values.paotS_ScheduleTime);
        const to = parseTime(values.paotS_ScheduleTimeTo);

        if (values.paotS_ScheduleTime === values.paotS_ScheduleTimeTo) {
            Swal.fire({
                title: 'Error!',
                text: 'Schedule Time From and Schedule Time To cannot be the same',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const diff = differenceInMinutes(to, from);
        if (diff < 0) {
            Swal.fire({
                title: 'Error!',
                text: 'Schedule Time From should be less than Schedule Time To',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const interactionTime = Number(values.paotS_TimePeriod);
        const totalNeeded = values.paotS_TPFlag ? interactionTime * values.paotS_Strength : interactionTime * 60 * values.paotS_Strength;

        if (totalNeeded > diff) {
            toast.error(`Total interaction time (${totalNeeded} mins) exceeds schedule duration (${diff} mins)`);
            return;
        }

        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        if (values.paotS_ScheduleTime === values.paotS_ScheduleTimeTo) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Schedule time and mapping time of student is not possible'
            });
            return;
        }

        const payload = {
            PAOTS_Id: Number(values.paotS_Id),
            ASMAY_Id: Number((details as any)?.asmaY_Id || 0),
            PAOTS_ScheduleName: values.paotS_ScheduleName,
            PAOTS_ScheduleDate: format(values.paotS_ScheduleDate, 'yyyy-MM-dd'),
            PAOTS_ScheduleTime: values.paotS_ScheduleTime,
            PAOTS_ScheduleTimeTo: values.paotS_ScheduleTimeTo,
            PAOTS_Remarks: values.paotS_Remarks || '',
            PAOTS_TimePeriod: Number(values.paotS_TimePeriod),
            PAOTS_TPFlag: values.paotS_TPFlag,
            autoschedule: values.autoschedule,
            PAOTS_Superviser: values.paotS_Superviser || '',
            PAOTS_Skills: values.paotS_Skills || '',
            SelectedStudentData: selectedStudents.map((s) => ({
                PASR_Id: Number(s.pasR_Id),
                PASR_emailId: s.pasR_emailId || '',
                PASR_MobileNo: Number(s.pasR_MobileNo) || 0,
                MI_Id: Number(s.mI_Id || (details as any)?.mI_Id || 0),
                vcmeeting: !!(s as any).vcmeeting
            })),
            anybodystart: values.anybodystart,
            pavidc: values.pavidc,
            stfids:
                (details as any)?.stafflist
                    ?.filter((staff: any) => selectedStaffIds.includes(staff.userid))
                    ?.map((staff: any) => ({
                        UserId: Number(staff.userid),
                        HRME_Id: Number(staff.hrmE_Id)
                    })) || []
        };

        saveSchedule(payload, {
            onSuccess: () => onSuccess()
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                    {/* Left Section */}
                    <div className='space-y-4'>
                        <FormField
                            control={form.control as any}
                            name='paotS_ScheduleName'
                            render={({ field }: any) => (
                                <FormItem className='grid grid-cols-4 items-center gap-4 space-y-0'>
                                    <FormLabel className='text-right'>
                                        Schedule Name: <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl className='col-span-3'>
                                        <Input placeholder='Enter schedule name' {...field} />
                                    </FormControl>
                                    <FormMessage className='col-span-3 col-start-2' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name='asmcL_Id'
                            render={({ field }: any) => (
                                <FormItem className='grid grid-cols-4 items-center gap-4 space-y-0'>
                                    <FormLabel className='text-right'>
                                        Class: <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(val: any) => {
                                            field.onChange(val);
                                            setSelectedClassId(Number(val));
                                        }}
                                        value={field.value}>
                                        <FormControl className='col-span-3'>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='0'>All</SelectItem>
                                            {details?.classlist
                                                ?.filter((cls: any) => cls.asmcL_ActiveFlag === true)
                                                ?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className='col-span-3 col-start-2' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name='paotS_ScheduleDate'
                            render={({ field }: any) => (
                                <FormItem className='grid grid-cols-4 items-center gap-4 space-y-0'>
                                    <FormLabel className='text-right'>
                                        Schedule Date: <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <div className='col-span-3'>
                                        <DatePicker date={field.value} setDate={field.onChange} placeholder='Schedule Date' />
                                    </div>
                                    <FormMessage className='col-span-3 col-start-2' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name='paotS_Remarks'
                            render={({ field }: any) => (
                                <FormItem className='grid grid-cols-4 items-center gap-4 space-y-0'>
                                    <FormLabel className='text-right'>Remarks:</FormLabel>
                                    <FormControl className='col-span-3'>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage className='col-span-3 col-start-2' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name='paotS_Superviser'
                            render={({ field }: any) => (
                                <FormItem className='grid grid-cols-4 items-center gap-4 space-y-0'>
                                    <FormLabel className='text-right'>Supervisor:</FormLabel>
                                    <FormControl className='col-span-3'>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage className='col-span-3 col-start-2' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name='paotS_Skills'
                            render={({ field }: any) => (
                                <FormItem className='grid grid-cols-4 items-start gap-4 space-y-0'>
                                    <FormLabel className='mt-2 text-right'>Skill/Knowledge:</FormLabel>
                                    <FormControl className='col-span-3'>
                                        <Textarea
                                            placeholder='Enter Skills/Knowledge'
                                            {...field}
                                            value={field.value || ''}
                                            className='min-h-[80px]'
                                        />
                                    </FormControl>
                                    <FormMessage className='col-span-3 col-start-2' />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Section */}
                    <div className='space-y-6'>
                        <div className='flex items-center justify-center space-x-6 rounded-md border bg-slate-50 p-2'>
                            <RadioGroup defaultValue='12' className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='12' id='r12' />
                                    <Label htmlFor='r12' className='cursor-pointer'>
                                        12 Hours
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='24' id='r24' />
                                    <Label htmlFor='r24' className='cursor-pointer'>
                                        24 Hours
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            {/* Time Selectors Column */}
                            <div className='space-y-6'>
                                <Controller
                                    name='paotS_ScheduleTime'
                                    control={form.control as any}
                                    render={({ field }) => (
                                        <TimeSpinnerField
                                            label='Schedule Time From: *'
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            error={form.formState.errors.paotS_ScheduleTime?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name='paotS_ScheduleTimeTo'
                                    control={form.control as any}
                                    render={({ field }) => (
                                        <TimeSpinnerField
                                            label='Schedule Time To: *'
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            error={form.formState.errors.paotS_ScheduleTimeTo?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Checkboxes Column */}
                            <div className='space-y-3 pt-2'>
                                <FormField
                                    control={form.control as any}
                                    name='meetingvc'
                                    render={({ field }: any) => (
                                        <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(val) => {
                                                        field.onChange(val);
                                                        if (val) {
                                                            form.setValue('addParticipants', true);
                                                            form.setValue('autostudent', true);
                                                            setSelectedStudents((prev) => prev.map((s) => ({ ...s, vcmeeting: true })));
                                                        } else {
                                                            form.setValue('addParticipants', false);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className='flex cursor-pointer items-center font-normal'>
                                                <span className='mr-2 text-blue-600'>🎥</span> Video conferencing
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                {form.watch('meetingvc') && (
                                    <FormField
                                        control={form.control as any}
                                        name='addParticipants'
                                        render={({ field }: any) => (
                                            <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='flex cursor-pointer items-center font-normal'>
                                                    <span className='mr-2 text-blue-600'>👤+</span> Add Participants
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control as any}
                                    name='autostudent'
                                    render={({ field }: any) => (
                                        <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className='cursor-pointer font-normal'>✅ Auto Select Students</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name='pavidc'
                                    render={({ field }: any) => (
                                        <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className='cursor-pointer font-normal'>Common ScheduleTime Slot</FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <div className='space-y-4 pt-4'>
                                    <FormField
                                        control={form.control as any}
                                        name='paotS_TimePeriod'
                                        render={({ field }: any) => (
                                            <FormItem className='flex flex-col space-y-1'>
                                                <FormLabel className='text-xs'>
                                                    Individual student interaction time: <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <div className='flex items-center space-x-2'>
                                                    <FormControl>
                                                        <Input type='number' {...field} className='h-8 w-24' />
                                                    </FormControl>
                                                    <span className='rounded border bg-slate-50 px-2 py-1 text-xs'>Minutes</span>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control as any}
                                        name='paotS_Strength'
                                        render={({ field }: any) => (
                                            <FormItem className='flex flex-col space-y-1'>
                                                <FormLabel className='font-bold text-xs'>
                                                    No. Of Students: <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='number'
                                                        {...field}
                                                        className='h-8 w-24 bg-slate-100'
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participants Selection Table */}
                {form.watch('addParticipants') && (
                    <div className='space-y-4'>
                        <div className='flex items-center justify-center space-x-8 rounded-md border bg-slate-50 p-4'>
                            <FormField
                                control={form.control as any}
                                name='principalflg'
                                render={({ field }: any) => (
                                    <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='cursor-pointer font-medium'>Principal</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='managerflg'
                                render={({ field }: any) => (
                                    <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='cursor-pointer font-medium'>Manager</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='stafflag'
                                render={({ field }: any) => (
                                    <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(val) => {
                                                    field.onChange(val);
                                                    if (!val) {
                                                        setSelectedStaffIds([]);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className='cursor-pointer font-medium'>STAFF</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='anybodystart'
                                render={({ field }: any) => (
                                    <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='cursor-pointer font-medium'>Can anybody Start/End Meeting</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.watch('stafflag') && (
                            <Card className='overflow-hidden border-blue-100'>
                                <div className='flex items-center justify-between bg-blue-800 px-4 py-2'>
                                    <h3 className='font-bold text-sm text-white uppercase'>Participants/Interviewer List</h3>
                                    <div className='relative w-64'>
                                        <Search className='-translate-y-1/2 absolute top-1/2 left-2 h-3.5 w-3.5 text-blue-200' />
                                        <Input
                                            placeholder='Search staff...'
                                            className='h-7 border-blue-600 bg-blue-700/50 pl-8 text-white text-xs placeholder:text-blue-300'
                                            value={staffSearch}
                                            onChange={(e) => setStaffSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='[&_tbody_tr:nth-child(even)]:bg-slate-50 [&_thead_tr_th]:py-2 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-[10px] [&_thead_tr_th]:text-black [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black'>
                                    <GenericDataTable<IStaffDetails>
                                        data={
                                            details?.stafflist?.filter((s: any) =>
                                                `${s.hrmE_EmployeeFirstName} ${s.hrmE_EmployeeMiddleName || ''} ${s.hrmE_EmployeeLastName || ''}`
                                                    .toLowerCase()
                                                    .includes(staffSearch.toLowerCase())
                                            ) || []
                                        }
                                        columns={[
                                            {
                                                id: 'slno',
                                                header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
                                                cell: ({ row }) => row.index + 1,
                                                size: 50
                                            },
                                            {
                                                accessorKey: 'hrmE_EmployeeFirstName',
                                                header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' />,
                                                cell: ({ row }) =>
                                                    `${row.original.hrmE_EmployeeFirstName} ${row.original.hrmE_EmployeeMiddleName || ''} ${row.original.hrmE_EmployeeLastName || ''}`
                                            },
                                            {
                                                id: 'select',
                                                header: ({ column }) => <DataTableColumnHeader column={column} title='Action' />,
                                                cell: ({ row }) => (
                                                    <Checkbox
                                                        checked={selectedStaffIds.includes(row.original.userid)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedStaffIds((prev) => [...new Set([...prev, row.original.userid])]);
                                                            } else {
                                                                setSelectedStaffIds((prev) =>
                                                                    prev.filter((id) => id !== row.original.userid)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                ),
                                                size: 80
                                            }
                                        ]}
                                        isLoading={false}
                                        isSearchRequired={false}
                                    />
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                <Card className='overflow-hidden'>
                    <div className='flex items-center justify-between bg-blue-800 px-4 py-2'>
                        <div className='flex items-center gap-4'>
                            <h3 className='font-bold text-sm text-white uppercase'>Student Selection</h3>
                            <div className='flex items-center gap-2 rounded bg-blue-700 px-2 py-0.5 font-bold text-[10px] text-white'>
                                Total Grid Records : <span className='rounded bg-white px-1 text-blue-800'>{allStudents.length}</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 font-bold text-[10px] text-blue-100 uppercase'>
                            Selected:{' '}
                            <span className='rounded bg-blue-700 px-2 py-0.5 text-white'>
                                {selectedStudents.length} / {allStudents.length}
                            </span>
                        </div>
                    </div>
                    <CardContent className='p-0'>
                        <div className='[&_tbody_tr:nth-child(even)]:bg-slate-50 [&_thead_tr_th]:py-3 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-[11px] [&_thead_tr_th]:text-black [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black'>
                            <GenericDataTable
                                data={allStudents}
                                columns={studentColumns}
                                isLoading={isStudentsLoading}
                                isSearchRequired={false}
                                loadingMessage='Fetching students...'
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className='flex justify-end gap-4'>
                    <Button type='button' variant='outline' onClick={() => form.reset()} disabled={isSaving}>
                        <RotateCcw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                    <Button type='submit' disabled={isSaving}>
                        {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                        {initialData ? 'Update Schedule' : 'Save Schedule'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// ─── Reusable Time Spinner ────────────────────────────────────────────────────
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

    // Parse "HH:mm" (24h) → h (1-12), mm, ampm
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
            if (e.deltaY < 0) {
                emit((h % 12) + 1 || 12, m, ampm);
            } else {
                emit(((h - 2 + 12) % 12) + 1, m, ampm);
            }
        };

        const handleMinutesWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                emit(h, (m + 1) % 60, ampm);
            } else {
                emit(h, (m - 1 + 60) % 60, ampm);
            }
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
        <div className='flex flex-col gap-1.5'>
            <Label>{label}</Label>
            <div className='flex items-center gap-2'>
                {/* Hours */}
                <div ref={hoursRef} className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit((h % 12) + 1 || 12, m, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <input
                        className='flex h-9 w-12 rounded-md border border-input bg-transparent text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        value={String(h).padStart(2, '0')}
                        onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) val = val.slice(-2);
                            let num = Number.parseInt(val, 10);
                            if (isNaN(num)) num = 12;
                            if (num > 12) num = 12;
                            if (num < 0) num = 12;
                            emit(num, m, ampm);
                        }}
                    />
                    <button type='button' onClick={() => emit(((h - 2 + 12) % 12) + 1, m, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>

                <span className='font-bold text-lg leading-none'>:</span>

                {/* Minutes */}
                <div ref={minutesRef} className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit(h, (m + 1) % 60, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <input
                        className='flex h-9 w-12 rounded-md border border-input bg-transparent text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        value={String(m).padStart(2, '0')}
                        onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 2) val = val.slice(-2);
                            let num = Number.parseInt(val, 10);
                            if (isNaN(num)) num = 0;
                            if (num > 59) num = 59;
                            if (num < 0) num = 0;
                            emit(h, num, ampm);
                        }}
                    />
                    <button type='button' onClick={() => emit(h, (m - 1 + 60) % 60, ampm)} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>

                {/* AM / PM toggle */}
                <div ref={ampmRef} className='flex flex-col items-center'>
                    <button type='button' onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronUp className='h-4 w-4' />
                    </button>
                    <div
                        className='flex h-9 w-12 cursor-pointer select-none items-center justify-center rounded-md border border-input bg-transparent font-medium text-sm'
                        onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')}>
                        {ampm}
                    </div>
                    <button type='button' onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')} className='rounded p-0.5 hover:bg-muted'>
                        <ChevronDown className='h-4 w-4' />
                    </button>
                </div>
            </div>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
        </div>
    );
}
