'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Minus, RefreshCw, Trash2 } from 'lucide-react';

import {
    deleteWrittenTestSchedule,
    deleteWrittenTestScheduleStudentData,
    getWrittenTestScheduleDetails,
    getWrittenTestSelectedRowDetails,
    saveWrittenTestSchedule
} from '@/server/admission/preadmission/transactions/written_test_schedule';
import type { IStudentDetails } from '@/types/admission/preadmission/transactions/written-test-schedule';

const formSchema = z.object({
    pawtS_Id: z.number().optional(),
    scheduleName: z.string().min(1, 'Schedule Name is required').max(50),
    classId: z.string().min(1, 'Class is required'),
    scheduleDate: z.date({ required_error: 'Schedule Date is required' }),
    remarks: z.string().max(100).optional(),
    supervisor: z.string().max(100).optional(),
    skill: z.string().max(100).optional(),
    timeFrom: z.string().min(1, 'Time From is required'),
    timeTo: z.string().min(1, 'Time To is required'),
    noOfStudents: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function WrittenTestScheduleForm() {
    const queryClient = useQueryClient();
    const [cartStudents, setCartStudents] = useState<IStudentDetails[]>([]);
    const [scheduledStudents, setScheduledStudents] = useState<IStudentDetails[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            scheduleName: '',
            classId: '0',
            remarks: '',
            supervisor: '',
            skill: '',
            timeFrom: '12:00',
            timeTo: '12:00',
            noOfStudents: ''
        }
    });

    const watchClassId = useWatch({ control: form.control, name: 'classId' });

    const [page] = useQueryState('page', parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState('page_size', parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState('search_query', parseAsString.withDefault(''));

    // Queries
    const { data: scheduleData, isLoading } = useQuery({
        queryKey: ['writtenTestSchedule', watchClassId],
        queryFn: () => getWrittenTestScheduleDetails(Number(watchClassId) || 0)
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: saveWrittenTestSchedule,
        onSuccess: (response) => {
            if (response.returnvalue === 'false') {
                toast.error('Schedule Name/Date Already Exist');
            } else {
                toast.success('Record Saved Successfully');
                queryClient.invalidateQueries({ queryKey: ['writtenTestSchedule'] });
                handleReset();
            }
        },
        onError: () => {
            toast.error('Failed to save record');
        }
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: deleteWrittenTestSchedule,
        onSuccess: () => {
            toast.success('Record Deleted Successfully');
            queryClient.invalidateQueries({ queryKey: ['writtenTestSchedule'] });
        },
        onError: () => {
            toast.error('Failed to delete record');
        }
    });

    const deleteStudentMutation = useMutation({
        mutationFn: deleteWrittenTestScheduleStudentData,
        onSuccess: () => {
            toast.success('Record Deleted Successfully');
            queryClient.invalidateQueries({ queryKey: ['writtenTestSchedule'] });
            // Optionally refetch selected row details
        },
        onError: () => {
            toast.error('Failed to delete record');
        }
    });

    const fetchSelectedRowDetails = async (id: number) => {
        try {
            const response = await getWrittenTestSelectedRowDetails(id);
            if (response && response.writtenTestSchedule && response.writtenTestSchedule.length > 0) {
                const schedule = response.writtenTestSchedule[0];
                form.reset({
                    pawtS_Id: schedule.pawtS_Id,
                    scheduleName: schedule.pawtS_ScheduleName,
                    classId: form.getValues('classId'), // keep current class or set to appropriate
                    scheduleDate: new Date(schedule.pawtS_ScheduleDate),
                    remarks: schedule.pawtS_Remarks || '',
                    supervisor: schedule.pawtS_Superviser || '',
                    skill: schedule.pawtS_Skills || '',
                    timeFrom: schedule.pawtS_ScheduleTime,
                    timeTo: schedule.pawtS_ScheduleTimeTo
                });
                setIsEditMode(true);
                setShowForm(true);
                setScheduledStudents(response.selectedStudentDetails || []);
            }
        } catch (error) {
            toast.error('Failed to fetch details');
        }
    };

    const handleReset = () => {
        form.reset({
            pawtS_Id: undefined,
            scheduleName: '',
            classId: '0',
            remarks: '',
            supervisor: '',
            skill: '',
            timeFrom: '',
            timeTo: '',
            noOfStudents: '',
            scheduleDate: undefined
        });
        setCartStudents([]);
        setScheduledStudents([]);
        setIsEditMode(false);
        setShowForm(false);
    };

    const onError = () => {
        toast.error('Please Fill Mandatory Details');
    };

    const onSubmit = (data: FormValues) => {
        if (!isEditMode && cartStudents.length === 0) {
            toast.error('Please select at least one student to schedule.');
            return;
        }

        const payload = {
            PAWTS_Id: data.pawtS_Id,
            PAWTS_ScheduleName: data.scheduleName,
            PAWTS_ScheduleTime: data.timeFrom,
            PAWTS_ScheduleTimeTo: data.timeTo,
            PAWTS_ScheduleDate: format(data.scheduleDate, 'yyyy-MM-dd'),
            PAWTS_Remarks: data.remarks,
            PAWTS_Superviser: data.supervisor,
            PAWTS_Skills: data.skill,
            SelectedStudentData: cartStudents,
            SelectedStudentDataForEdit: scheduledStudents
        };

        saveMutation.mutate(payload);
    };

    const handleAddToCart = (student: IStudentDetails, isChecked: boolean) => {
        if (isChecked) {
            setCartStudents((prev) => [...prev, student]);
        } else {
            setCartStudents((prev) => prev.filter((s) => s.pasR_Id !== student.pasR_Id));
        }
    };

    const handleRemoveFromCart = (studentId: number) => {
        setCartStudents((prev) => prev.filter((s) => s.pasR_Id !== studentId));
    };

    const dataAny: any = scheduleData;
    const classList: any[] = (dataAny?.data?.admissioncatdrpall || dataAny?.admissioncatdrpall || []) as any[];
    const rawStudentDetailsList = (dataAny?.data?.allname5 || dataAny?.allname5 || []) as any[];
    const mappedStudentDetailsList: IStudentDetails[] = rawStudentDetailsList.map((s: any) => ({
        pasR_Id: s.pasr_id,
        pasR_FirstName: s.studentname,
        pasR_RegistrationNo: s.registrationNo,
        asmcL_Id: s.classid,
        pasR_Sex: s.gender,
        pasR_emailId: s.email,
        pasR_MobileNo: s.mobileNumber,
        classname: classList.find((c: any) => c.asmcL_Id === s.classid)?.asmcL_ClassName || ''
    }));

    const studentDetailsList = useMemo(() => {
        if (!searchQuery) return mappedStudentDetailsList;
        const lower = searchQuery.toLowerCase();
        return mappedStudentDetailsList.filter(
            (s) =>
                s.pasR_FirstName?.toLowerCase().includes(lower) ||
                s.pasR_RegistrationNo?.toLowerCase().includes(lower) ||
                s.classname?.toLowerCase().includes(lower) ||
                s.pasR_Sex?.toLowerCase().includes(lower) ||
                s.pasR_emailId?.toLowerCase().includes(lower) ||
                s.pasR_MobileNo?.toString().includes(lower)
        );
    }, [mappedStudentDetailsList, searchQuery]);

    const rawMasterScheduleList: any[] = (dataAny?.data?.writtenTestSchedule ||
        dataAny?.writtenTestSchedule ||
        dataAny?.data?.WrittenTestSchedule ||
        dataAny?.WrittenTestSchedule ||
        []) as any[];

    const masterScheduleList = useMemo(() => {
        if (!searchQuery) return rawMasterScheduleList;
        const lower = searchQuery.toLowerCase();
        return rawMasterScheduleList.filter((item: any) => {
            const dateStr = item.pawtS_ScheduleDate ? format(new Date(item.pawtS_ScheduleDate), 'dd-MM-yyyy') : '';
            return (
                item.pawtS_ScheduleName?.toLowerCase().includes(lower) ||
                dateStr.includes(lower) ||
                item.pawtS_ScheduleTime?.toLowerCase().includes(lower) ||
                item.pawtS_ScheduleTimeTo?.toLowerCase().includes(lower) ||
                item.pawtS_Remarks?.toLowerCase().includes(lower)
            );
        });
    }, [rawMasterScheduleList, searchQuery]);

    const filteredCartStudents = useMemo(() => {
        if (!searchQuery) return cartStudents;
        const lower = searchQuery.toLowerCase();
        return cartStudents.filter(
            (s) =>
                s.pasR_FirstName?.toLowerCase().includes(lower) ||
                s.pasR_RegistrationNo?.toLowerCase().includes(lower) ||
                s.pasR_Sex?.toLowerCase().includes(lower) ||
                s.pasR_emailId?.toLowerCase().includes(lower) ||
                s.pasR_MobileNo?.toString().includes(lower)
        );
    }, [cartStudents, searchQuery]);

    const filteredScheduledStudents = useMemo(() => {
        if (!searchQuery) return scheduledStudents;
        const lower = searchQuery.toLowerCase();
        return scheduledStudents.filter(
            (s) =>
                s.pasR_FirstName?.toLowerCase().includes(lower) ||
                s.pasR_RegistrationNo?.toLowerCase().includes(lower) ||
                s.pasR_Sex?.toLowerCase().includes(lower) ||
                s.pasR_emailId?.toLowerCase().includes(lower) ||
                s.pasR_MobileNo?.toString().includes(lower)
        );
    }, [scheduledStudents, searchQuery]);

    const handleAutoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = Number.parseInt(e.target.value, 10);
        const rawStudents = (dataAny?.data?.allname5 || dataAny?.allname5 || []) as any[];
        const students: IStudentDetails[] = rawStudents.map((s: any) => ({
            pasR_Id: s.pasr_id,
            pasR_FirstName: s.studentname,
            pasR_RegistrationNo: s.registrationNo,
            asmcL_Id: s.classid,
            pasR_Sex: s.gender,
            pasR_emailId: s.email,
            pasR_MobileNo: s.mobileNumber,
            classname: classList.find((c: any) => c.asmcL_Id === s.classid)?.asmcL_ClassName || ''
        }));
        form.setValue('noOfStudents', e.target.value);
        if (!isNaN(count) && count > 0) {
            const selected = students.slice(0, count);
            setCartStudents(selected);
        } else {
            setCartStudents([]);
        }
    };

    // Columns Definitions
    const studentListColumns = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold text-black'>Sl.No.</div>,
            cell: ({ row }: any) => <div className='text-center'>{(page - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'pasR_FirstName',
            header: () => <div className='text-center font-bold text-black'>Student Name</div>,
            cell: ({ row }: any) => {
                const s = row.original;
                return (
                    <div className='text-center'>{`${s.pasR_FirstName} ${s.pasR_MiddleName || ''} ${s.pasR_LastName || ''}`.trim()}</div>
                );
            }
        },
        {
            accessorKey: 'pasR_RegistrationNo',
            header: () => <div className='text-center font-bold text-black'>Registration No</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_RegistrationNo}</div>
        },
        {
            accessorKey: 'classname',
            header: () => <div className='text-center font-bold text-black'>Class</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.classname}</div>
        },
        {
            accessorKey: 'pasR_Sex',
            header: () => <div className='text-center font-bold text-black'>Gender</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_Sex}</div>
        },
        {
            accessorKey: 'pasR_MobileNo',
            header: () => <div className='text-center font-bold text-black'>Mobile Number</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_MobileNo}</div>
        },
        {
            accessorKey: 'pasR_emailId',
            header: () => <div className='text-center font-bold text-black'>Email Id</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_emailId}</div>
        },
        {
            accessorKey: 'select',
            header: () => <div className='text-center font-bold text-black'>Select</div>,
            cell: ({ row }: any) => {
                const student = row.original as IStudentDetails;
                const isSelected = cartStudents.some((s) => s.pasR_Id === student.pasR_Id);
                const isScheduled = scheduledStudents.some((s) => s.pasR_Id === student.pasR_Id);
                return (
                    <div className='flex justify-center'>
                        <Checkbox
                            checked={isSelected || isScheduled}
                            disabled={isScheduled || isEditMode}
                            onCheckedChange={(checked) => handleAddToCart(student, checked as boolean)}
                        />
                    </div>
                );
            }
        }
    ];

    const cartColumns = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold text-black'>Sl.No.</div>,
            cell: ({ row }: any) => <div className='text-center'>{(page - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'pasR_FirstName',
            header: () => <div className='text-center font-bold text-black'>Student Name</div>,
            cell: ({ row }: any) => {
                const s = row.original;
                return (
                    <div className='text-center'>{`${s.pasR_FirstName} ${s.pasR_MiddleName || ''} ${s.pasR_LastName || ''}`.trim()}</div>
                );
            }
        },
        {
            accessorKey: 'pasR_RegistrationNo',
            header: () => <div className='text-center font-bold text-black'>Registration No</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_RegistrationNo}</div>
        },
        {
            accessorKey: 'pasR_Sex',
            header: () => <div className='text-center font-bold text-black'>Gender</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_Sex}</div>
        },
        {
            accessorKey: 'pasR_MobileNo',
            header: () => <div className='text-center font-bold text-black'>Mobile Number</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_MobileNo}</div>
        },
        {
            accessorKey: 'pasR_emailId',
            header: () => <div className='text-center font-bold text-black'>Email Id</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_emailId}</div>
        },
        {
            accessorKey: 'action',
            header: () => <div className='text-center font-bold text-black'>Action</div>,
            cell: ({ row }: any) => (
                <div className='flex justify-center gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => handleRemoveFromCart(row.original.pasR_Id)} title='Remove'>
                        <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                </div>
            )
        }
    ];

    const scheduledStudentColumns = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold text-black'>Sl.No.</div>,
            cell: ({ row }: any) => <div className='text-center'>{(page - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'pasR_FirstName',
            header: () => <div className='text-center font-bold text-black'>Student Name</div>,
            cell: ({ row }: any) => {
                const s = row.original;
                return (
                    <div className='text-center'>{`${s.pasR_FirstName} ${s.pasR_MiddleName || ''} ${s.pasR_LastName || ''}`.trim()}</div>
                );
            }
        },
        {
            accessorKey: 'pasR_RegistrationNo',
            header: () => <div className='text-center font-bold text-black'>Registration No</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_RegistrationNo}</div>
        },
        {
            accessorKey: 'pasR_Sex',
            header: () => <div className='text-center font-bold text-black'>Gender</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_Sex}</div>
        },
        {
            accessorKey: 'pasR_MobileNo',
            header: () => <div className='text-center font-bold text-black'>Mobile Number</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_MobileNo}</div>
        },
        {
            accessorKey: 'pasR_emailId',
            header: () => <div className='text-center font-bold text-black'>Email Id</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pasR_emailId}</div>
        },
        {
            accessorKey: 'action',
            header: () => <div className='text-center font-bold text-black'>Action</div>,
            cell: ({ row }: any) => (
                <div className='flex justify-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                            deleteStudentMutation.mutate({
                                PAWTS_Id: row.original.pawtS_Id || form.getValues('pawtS_Id') || 0,
                                PASR_Id: row.original.pasR_Id || row.original.pasr_id
                            })
                        }
                        title='Delete'>
                        <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                </div>
            )
        }
    ];

    const masterScheduleColumns = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold text-black'>Sl.No.</div>,
            cell: ({ row }: any) => <div className='text-center'>{(page - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'pawtS_ScheduleName',
            header: () => <div className='text-center font-bold text-black'>Schedule Name</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pawtS_ScheduleName}</div>
        },
        {
            accessorKey: 'studentCount',
            header: () => <div className='text-center font-bold text-black'>Student Count</div>,
            cell: ({ row }: any) => {
                const dataAny: any = scheduleData;
                const schedulecounts: any[] = (dataAny?.data?.studentDetails ||
                    dataAny?.studentDetails ||
                    dataAny?.data?.StudentDetails ||
                    dataAny?.StudentDetails ||
                    []) as any[];
                const countObj = schedulecounts.find(
                    (c: any) => c.pawts_id === row.original.pawtS_Id || c.pawtS_Id === row.original.pawtS_Id
                );
                return <div className='text-center'>{countObj ? countObj.count : 0}</div>;
            }
        },
        {
            accessorKey: 'pawtS_ScheduleDate',
            header: () => <div className='text-center font-bold text-black'>Schedule Date</div>,
            cell: ({ row }: any) => <div className='text-center'>{format(new Date(row.original.pawtS_ScheduleDate), 'dd-MM-yyyy')}</div>
        },
        {
            accessorKey: 'pawtS_ScheduleTime',
            header: () => <div className='text-center font-bold text-black'>Time From</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pawtS_ScheduleTime}</div>
        },
        {
            accessorKey: 'pawtS_ScheduleTimeTo',
            header: () => <div className='text-center font-bold text-black'>To</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pawtS_ScheduleTimeTo}</div>
        },
        {
            accessorKey: 'pawtS_Remarks',
            header: () => <div className='text-center font-bold text-black'>Remarks</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.pawtS_Remarks || '-'}</div>
        }
        // {
        //     accessorKey: 'actions',
        //     header: () => <div className="text-center font-semibold">Actions</div>,
        //     cell: ({ row }: any) => (
        //         <div className="flex justify-center gap-2">
        //             <Button variant="ghost" size="icon" onClick={() => fetchSelectedRowDetails(row.original.pawtS_Id)} title="Edit">
        //                 <Edit className="w-4 h-4 text-blue-500" />
        //             </Button>
        //             <Button variant="ghost" size="icon" onClick={() => deleteScheduleMutation.mutate(row.original.pawtS_Id)} title="Delete">
        //                 <Trash2 className="w-4 h-4 text-red-500" />
        //             </Button>
        //         </div>
        //     ),
        // },
    ];

    return (
        <div className='flex flex-col gap-4'>
            {!showForm ? (
                <Card className='rounded-none border-t-4 border-t-blue-600 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between border-b pt-3 pb-3'>
                        <CardTitle className='font-bold text-blue-800 text-sm uppercase tracking-wide'>
                            Written/Apptitude Test Schedule List
                        </CardTitle>
                        <Button
                            type='button'
                            onClick={() => setShowForm(true)}
                            className='h-8 bg-[#246bce] px-4 font-semibold text-xs hover:bg-blue-700'>
                            Add New
                        </Button>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <GenericDataTable
                            data={masterScheduleList.slice((page - 1) * pageSize, page * pageSize)}
                            totalItems={masterScheduleList.length}
                            columns={masterScheduleColumns}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className='rounded-none border-t-4 border-t-blue-600 shadow-sm'>
                        <CardHeader className='flex flex-row items-center justify-between border-b pt-3 pb-3'>
                            <CardTitle className='font-bold text-blue-800 text-sm uppercase tracking-wide'>
                                WRITTEN\APPTITUDE TEST SCHEDULE
                            </CardTitle>
                            <div className='flex items-center gap-2'>
                                <Button
                                    type='button'
                                    variant='default'
                                    size='sm'
                                    className='h-8 rounded-full bg-[#246bce] px-4 font-semibold text-xs hover:bg-blue-700'
                                    onClick={() => window.location.reload()}>
                                    <RefreshCw className='mr-1 h-3.5 w-3.5' /> Reset
                                </Button>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8 text-gray-500'
                                    onClick={() => setShowForm(false)}>
                                    <Minus className='h-4 w-4' />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className='pt-6'>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit, onError)} className='space-y-4'>
                                    <div className='grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2'>
                                        <div className='space-y-4'>
                                            <FormField
                                                control={form.control}
                                                name='scheduleName'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Schedule Name:<span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    disabled={isEditMode}
                                                                    className='h-9 rounded-sm border-[#96c8da] focus-visible:border-blue-500 focus-visible:ring-0'
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='classId'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Class: <span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className='h-9 rounded-sm border-[#96c8da] focus:ring-0'>
                                                                        <SelectValue placeholder='Select Class' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value='0'>ALL</SelectItem>
                                                                    {classList.map((c: any) => (
                                                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                                            {c.asmcL_ClassName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='scheduleDate'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Date:<span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                        <div className='flex w-2/3 flex-col'>
                                                            <DatePicker
                                                                date={field.value}
                                                                setDate={field.onChange}
                                                                disabled={
                                                                    isEditMode
                                                                        ? true
                                                                        : { before: new Date(new Date().setHours(0, 0, 0, 0)) }
                                                                }
                                                            />
                                                            <FormMessage className='mt-1 text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='remarks'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>Remarks:</FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    disabled={isEditMode}
                                                                    className='h-9 rounded-sm border-[#96c8da] focus-visible:border-blue-500 focus-visible:ring-0'
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='supervisor'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Supervisor:
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    disabled={isEditMode}
                                                                    className='h-9 rounded-sm border-[#96c8da] focus-visible:border-blue-500 focus-visible:ring-0'
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='skill'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-start gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 pt-2 font-medium text-gray-700 text-sm'>
                                                            Skill/Knowledge:
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    disabled={isEditMode}
                                                                    rows={2}
                                                                    className='min-h-[60px] resize-none rounded-sm border-[#96c8da] focus-visible:border-blue-500 focus-visible:ring-0'
                                                                    placeholder='Enter Skills/Knowledge'
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='space-y-4'>
                                            <FormField
                                                control={form.control}
                                                name='timeFrom'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Schedule Time From:<span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <TimeSpinnerField
                                                                    value={field.value || '12:00'}
                                                                    onChange={field.onChange}
                                                                    disabled={isEditMode}
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='timeTo'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Schedule Time To:<span className='text-red-500'>*</span>
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <TimeSpinnerField
                                                                    value={field.value || '12:00'}
                                                                    onChange={field.onChange}
                                                                    disabled={isEditMode}
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='noOfStudents'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-center gap-4 space-y-0'>
                                                        <FormLabel className='w-1/3 font-medium text-gray-700 text-sm'>
                                                            Auto Select Students:
                                                        </FormLabel>
                                                        <div className='w-2/3'>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    onChange={handleAutoSelect}
                                                                    placeholder='Enter Students Count'
                                                                    disabled={
                                                                        !form.watch('timeFrom') || !form.watch('timeTo') || isEditMode
                                                                    }
                                                                    className='h-9 rounded-sm border-[#96c8da] bg-gray-100 focus-visible:border-blue-500 focus-visible:ring-0'
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-xs' />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {studentDetailsList.length > 0 && !isEditMode && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Student List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GenericDataTable
                                    data={studentDetailsList.slice((page - 1) * pageSize, page * pageSize)}
                                    totalItems={studentDetailsList.length}
                                    columns={studentListColumns}
                                    isLoading={isLoading}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {cartStudents.length > 0 && !isEditMode && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selected Student To Cart</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <GenericDataTable
                                    data={filteredCartStudents.slice((page - 1) * pageSize, page * pageSize)}
                                    totalItems={filteredCartStudents.length}
                                    columns={cartColumns}
                                    isLoading={isLoading}
                                />
                                <div className='flex justify-center gap-2'>
                                    <Button onClick={form.handleSubmit(onSubmit, onError)} disabled={saveMutation.isPending}>
                                        Save
                                    </Button>
                                    <Button variant='destructive' onClick={() => window.location.reload()}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {scheduledStudents.length > 0 && isEditMode && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Scheduled Student</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GenericDataTable
                                    data={filteredScheduledStudents.slice((page - 1) * pageSize, page * pageSize)}
                                    totalItems={filteredScheduledStudents.length}
                                    columns={scheduledStudentColumns}
                                    isLoading={isLoading}
                                />
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Reusable Time Spinner ────────────────────────────────────────────────────
function TimeSpinnerField({
    value,
    onChange,
    disabled
}: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
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
        if (disabled) return;
        let h24 = h % 12;
        if (ampm === 'PM') h24 += 12;
        onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }

    const { h, m, ampm } = parse(value);

    useEffect(() => {
        if (disabled) return;

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
    }, [h, m, ampm, disabled]);

    return (
        <div className={`flex items-center gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
            {/* Hours */}
            <div ref={hoursRef} className='flex flex-col items-center'>
                <button
                    type='button'
                    onClick={() => emit((h % 12) + 1 || 12, m, ampm)}
                    className='rounded p-0.5 hover:bg-muted focus:outline-none'>
                    <ChevronUp className='h-4 w-4' />
                </button>
                <input
                    className='flex h-9 w-12 rounded-md border border-input bg-transparent text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    value={String(h).padStart(2, '0')}
                    disabled={disabled}
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
                <button
                    type='button'
                    onClick={() => emit(((h - 2 + 12) % 12) + 1, m, ampm)}
                    className='rounded p-0.5 hover:bg-muted focus:outline-none'>
                    <ChevronDown className='h-4 w-4' />
                </button>
            </div>

            <span className='font-bold text-lg leading-none'>:</span>

            {/* Minutes */}
            <div ref={minutesRef} className='flex flex-col items-center'>
                <button
                    type='button'
                    onClick={() => emit(h, (m + 1) % 60, ampm)}
                    className='rounded p-0.5 hover:bg-muted focus:outline-none'>
                    <ChevronUp className='h-4 w-4' />
                </button>
                <input
                    className='flex h-9 w-12 rounded-md border border-input bg-transparent text-center font-medium text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    value={String(m).padStart(2, '0')}
                    disabled={disabled}
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
                <button
                    type='button'
                    onClick={() => emit(h, (m - 1 + 60) % 60, ampm)}
                    className='rounded p-0.5 hover:bg-muted focus:outline-none'>
                    <ChevronDown className='h-4 w-4' />
                </button>
            </div>

            {/* AM / PM toggle */}
            <div ref={ampmRef} className='flex flex-col items-center'>
                <button
                    type='button'
                    onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')}
                    className='rounded p-0.5 hover:bg-muted focus:outline-none'>
                    <ChevronUp className='h-4 w-4' />
                </button>
                <div
                    className='flex h-9 w-12 cursor-pointer select-none items-center justify-center rounded-md border border-input bg-transparent font-medium text-sm'
                    onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')}>
                    {ampm}
                </div>
                <button
                    type='button'
                    onClick={() => emit(h, m, ampm === 'AM' ? 'PM' : 'AM')}
                    className='rounded p-0.5 hover:bg-muted focus:outline-none'>
                    <ChevronDown className='h-4 w-4' />
                </button>
            </div>
        </div>
    );
}
