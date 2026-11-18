'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    edit_admission_cancel_student,
    on_change_admission_cancel_student,
    on_change_admission_cancel_year,
    on_load_admission_cancel,
    save_admission_cancel_student
} from '@/server/admission/hutchings/transactions/admission-cancel-or-wd';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    AMST_Id: z.string().min(1, 'Select Student Name'),
    AACA_ACDate: z.date({ required_error: 'Select Date' }),
    AACA_CancellationFee: z.string().optional(),
    AACA_ToRefundAmount: z.string().optional(),
    AACA_ACReason: z.string().min(1, 'Enter Remarks')
});

export default function AdmissionCancelOrWDPage() {
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [studentsList, setStudentsList] = useState<any[]>([]);
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [withdrawnStudents, setWithdrawnStudents] = useState<any[]>([]);
    const [editId, setEditId] = useState<number | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            AMST_Id: '',
            AACA_ACDate: new Date(),
            AACA_CancellationFee: '',
            AACA_ToRefundAmount: '',
            AACA_ACReason: ''
        }
    });

    const watchYear = form.watch('ASMAY_Id');
    const watchStudent = form.watch('AMST_Id');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const res = await on_load_admission_cancel();
            if (res?.success) {
                if (res.message) toast.success(res.message);
                setAcademicYears(res.data.academicYearOnLoad || []);

                if (res.data.allAcademicYear && res.data.allAcademicYear.length > 0) {
                    form.setValue('ASMAY_Id', res.data.allAcademicYear[0].asmaY_Id.toString());
                }

                if (res.data.getstudentdetailslist) {
                    setStudentsList(res.data.getstudentdetailslist);
                }
                setWithdrawnStudents(res.data.getwdstudentdetails || []);
            } else {
                if (res?.message) toast.error(res.message);
            }
        } catch (error) {
            toast.error('Failed to load initial data');
        }
    };

    const handleYearChange = async (yearId: string) => {
        try {
            const res = await on_change_admission_cancel_year({ ASMAY_Id: Number(yearId) });
            if (res?.success) {
                if (res.message) toast.success(res.message);
                setStudentsList(res.data.getstudentdetailslist || []);
                setWithdrawnStudents(res.data.getwdstudentdetails || []);
                form.setValue('AMST_Id', '');
                setStudentDetails(null);
            } else {
                if (res?.message) toast.error(res.message);
            }
        } catch (error) {
            toast.error('Failed to load students for selected year');
        }
    };

    const handleStudentChange = async (yearId: string, studentId: string) => {
        try {
            const res = await on_change_admission_cancel_student({
                ASMAY_Id: Number(yearId),
                AMST_Id: Number(studentId)
            });
            if (res?.success) {
                if (res.message) toast.success(res.message);
                if (res.data.getstudentdetails?.length > 0) {
                    setStudentDetails(res.data.getstudentdetails[0]);
                } else {
                    setStudentDetails(null);
                }
            } else {
                if (res?.message) toast.error(res.message);
            }
        } catch (error) {
            toast.error('Failed to load student details');
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const payload = {
                asmaY_Id: Number(values.ASMAY_Id),
                amsT_Id: Number(values.AMST_Id),
                aacA_CancellationFee: values.AACA_CancellationFee ? Number(values.AACA_CancellationFee) : 0,
                aacA_ToRefundAmount: values.AACA_ToRefundAmount ? Number(values.AACA_ToRefundAmount) : 0,
                aacA_ACReason: values.AACA_ACReason,
                aacA_ACDate: values.AACA_ACDate.toISOString(),
                aacA_Id: editId || 0
            };

            const res = await save_admission_cancel_student(payload);

            if (res?.success) {
                toast.success(res.message || 'Record Saved/Updated Successfully');
                form.reset();
                setStudentDetails(null);
                setEditId(null);
                loadInitialData();
            } else {
                toast.error(res?.message || 'Failed To Save/Update');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const onClear = () => {
        form.reset();
        setStudentDetails(null);
        setEditId(null);
        loadInitialData();
    };

    const handleEdit = async (student: any) => {
        try {
            const res = await edit_admission_cancel_student({
                ASMAY_Id: student.asmaY_Id || student.ASMAY_Id,
                AMST_Id: student.amsT_Id || student.AMST_Id,
                AACA_Id: student.aacA_Id || student.AACA_Id
            });

            if (res?.success) {
                if (res.message) toast.success(res.message);

                if (res.data?.getstudentdetails?.length > 0) {
                    setStudentDetails(res.data.getstudentdetails[0]);
                }

                if (res.data?.geteditdetails?.length > 0) {
                    const editData = res.data.geteditdetails[0];
                    setEditId(editData.aacA_Id);
                    form.setValue('ASMAY_Id', editData.asmaY_Id.toString());
                    form.setValue('AMST_Id', editData.amsT_Id.toString());
                    form.setValue('AACA_ACDate', new Date(editData.aacA_ACDate));
                    form.setValue('AACA_CancellationFee', editData.aacA_CancellationFee?.toString() || '');
                    form.setValue('AACA_ToRefundAmount', editData.aacA_ToRefundAmount?.toString() || '');
                    form.setValue('AACA_ACReason', editData.aacA_ACReason || '');
                } else {
                    // Fallback in case geteditdetails is empty
                    setEditId(student.aacA_Id || student.AACA_Id);
                    form.setValue('ASMAY_Id', (student.asmaY_Id || student.ASMAY_Id).toString());
                    form.setValue('AMST_Id', (student.amsT_Id || student.AMST_Id).toString());
                    if (student.aacA_ACDate) form.setValue('AACA_ACDate', new Date(student.aacA_ACDate));
                    form.setValue('AACA_CancellationFee', student.aacA_CancellationFee?.toString() || '');
                    form.setValue('AACA_ToRefundAmount', student.aacA_ToRefundAmount?.toString() || '');
                    form.setValue('AACA_ACReason', student.aacA_ACReason || '');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                if (res?.message) toast.error(res.message);
            }
        } catch (error) {
            toast.error('Failed to load edit details');
        }
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <Card>
                        <CardHeader className='border-b'>
                            <CardTitle>Student Cancel Or Withdraw</CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-1 gap-6 pt-6 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Academic Year <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                handleYearChange(val);
                                            }}
                                            value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {academicYears.map((year) => (
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
                                name='AMST_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Student Name <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                handleStudentChange(watchYear, val);
                                            }}
                                            value={field.value}
                                            disabled={!watchYear}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Student' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {studentsList.map((student) => (
                                                    <SelectItem key={student.amsT_Id} value={student.amsT_Id.toString()}>
                                                        {student.studentname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {studentDetails && (
                        <Card>
                            <CardHeader className='border-b'>
                                <CardTitle>STUDENT'S DETAILS</CardTitle>
                            </CardHeader>
                            <CardContent className='grid grid-cols-1 gap-6 pt-6 md:grid-cols-12'>
                                <div className='space-y-4 md:col-span-5'>
                                    <div className='grid grid-cols-3 gap-2'>
                                        <span className='font-semibold text-muted-foreground'>Student's Name</span>
                                        <span className='col-span-2 font-medium'>: {studentDetails.studentname}</span>
                                    </div>
                                    <div className='grid grid-cols-3 gap-2'>
                                        <span className='font-semibold text-muted-foreground'>Admno.</span>
                                        <span className='col-span-2 font-medium'>: {studentDetails.amsT_AdmNo}</span>
                                    </div>
                                    <div className='grid grid-cols-3 gap-2'>
                                        <span className='font-semibold text-muted-foreground'>Class</span>
                                        <span className='col-span-2 font-medium'>: {studentDetails.classname}</span>
                                    </div>
                                    <div className='grid grid-cols-3 gap-2'>
                                        <span className='font-semibold text-muted-foreground'>Father Name</span>
                                        <span className='col-span-2 font-medium'>: {studentDetails.amsT_FatherName}</span>
                                    </div>
                                    <div className='grid grid-cols-3 gap-2'>
                                        <span className='font-semibold text-muted-foreground'>Mother Name</span>
                                        <span className='col-span-2 font-medium'>: {studentDetails.amsT_MotherName}</span>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name='AACA_ACDate'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-2'>
                                                <FormLabel className='m-0 font-semibold text-muted-foreground'>
                                                    Date <span className='text-destructive'>*</span>
                                                </FormLabel>
                                                <div className='col-span-2'>
                                                    <DatePicker date={field.value} setDate={field.onChange} />
                                                </div>
                                                <div className='col-span-3'>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='space-y-4 md:col-span-5'>
                                    <FormField
                                        control={form.control}
                                        name='AACA_CancellationFee'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-2'>
                                                <FormLabel className='m-0 font-semibold text-muted-foreground'>
                                                    Cancellation Fee :
                                                </FormLabel>
                                                <FormControl className='col-span-2'>
                                                    <Input {...field} type='number' step='0.01' />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='AACA_ToRefundAmount'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-2'>
                                                <FormLabel className='m-0 font-semibold text-muted-foreground'>Refund Amount :</FormLabel>
                                                <FormControl className='col-span-2'>
                                                    <Input {...field} type='number' step='0.01' />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='AACA_ACReason'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-start gap-2'>
                                                <FormLabel className='m-0 mt-2 font-semibold text-muted-foreground'>
                                                    Remarks <span className='text-destructive'>*</span> :
                                                </FormLabel>
                                                <FormControl className='col-span-2'>
                                                    <Textarea {...field} rows={4} className='resize-none' />
                                                </FormControl>
                                                <div className='col-span-3'>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='flex justify-end md:col-span-2'>
                                    <div className='flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-md border border-blue-400 bg-muted/20'>
                                        {studentDetails.photoName ? (
                                            <Image
                                                src={studentDetails.photoName}
                                                alt='Student Photo'
                                                width={120}
                                                height={120}
                                                className='h-full w-full object-cover'
                                            />
                                        ) : (
                                            <span className='p-2 text-center text-muted-foreground text-xs'>Photo Not Available</span>
                                        )}
                                    </div>
                                </div>

                                <div className='mt-2 flex justify-center gap-4 border-t pt-4 md:col-span-12'>
                                    <Button type='submit' className='w-32'>
                                        <Check className='mr-2 h-4 w-4' /> Save
                                    </Button>
                                    <Button type='button' variant='destructive' className='w-32' onClick={onClear}>
                                        <X className='mr-2 h-4 w-4' /> Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </form>
            </Form>

            <Card>
                <CardHeader className='border-b'>
                    <CardTitle>STUDENT'S CANCEL OR WITH DRAW DETAILS</CardTitle>
                </CardHeader>
                <CardContent className='overflow-x-auto pt-6'>
                    <table className='w-full border-collapse border text-left text-sm'>
                        <thead className='bg-muted/50 text-xs uppercase'>
                            <tr>
                                <th className='border p-2 text-center'>Sl.No</th>
                                <th className='border p-2'>Year</th>
                                <th className='border p-2'>Student Name</th>
                                <th className='border p-2'>Admno</th>
                                <th className='border p-2 text-center'>Class</th>
                                <th className='border p-2'>Section</th>
                                <th className='border p-2'>Date</th>
                                <th className='border p-2'>Reason</th>
                                <th className='border p-2'>Cancelled Fee</th>
                                <th className='border p-2'>Refund Amount</th>
                                {/* <th className="border p-2 text-center">Action</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawnStudents.length > 0 ? (
                                withdrawnStudents.map((student, index) => (
                                    <tr key={index} className='border-b transition-colors hover:bg-muted/20'>
                                        <td className='border p-2 text-center'>{index + 1}</td>
                                        <td className='border p-2'>{student.asmaY_Year}</td>
                                        <td className='border p-2'>{student.studentname}</td>
                                        <td className='border p-2'>
                                            {student.amsT_AdmNo || student.AMST_AdmNo || student.amst_AdmNo || student.amstAdmNo || ''}
                                        </td>
                                        <td className='border p-2 text-center'>
                                            {student.asmcL_ClassName || student.ASMCL_ClassName || student.asmcl_ClassName || ''}
                                        </td>
                                        <td className='border p-2'>
                                            {student.asmC_SectionName || student.ASMC_SectionName || student.asmc_SectionName || ''}
                                        </td>
                                        <td className='border p-2'>
                                            {student.aacA_ACDate ? format(new Date(student.aacA_ACDate), 'dd-MM-yyyy') : ''}
                                        </td>
                                        <td className='border p-2'>{student.aacA_ACReason}</td>
                                        <td className='border p-2'>{student.aacA_CancellationFee}</td>
                                        <td className='border p-2'>{student.aacA_ToRefundAmount}</td>
                                        {/* <td className="border p-2 text-center">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                    </td> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className='border p-4 text-center text-muted-foreground'>
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
