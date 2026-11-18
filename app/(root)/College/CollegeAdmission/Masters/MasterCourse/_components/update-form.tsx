'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEditMasterCourse, useSaveMasterCourse } from '@/hooks/college/useCollegeMasters';
import type { IMasterCourse } from '@/types/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    amcO_CourseName: z
        .string()
        .min(1, 'Course Name is required')
        .regex(/^[a-zA-Z\W]+$/, 'Invalid format'),
    amcO_CourseCode: z
        .string()
        .min(1, 'Course Code is required')
        .regex(/^[a-zA-Z0-9\-]+$/, 'Only alphanumeric characters and hyphens are allowed'),
    amcO_CourseInfo: z
        .string()
        .min(1, 'Course Information is required')
        .regex(/^[a-zA-Z\W]+$/, 'Invalid format'),
    amcO_NoOfYears: z.coerce.number().min(1, 'No of Years must be greater than 0'),
    amcO_NoOfSemesters: z.coerce.number().min(1, 'No of Semesters must be greater than 0'),
    amcO_MinAttPer: z.coerce.number().min(0).max(100, 'Min Attendance Percentage cannot exceed 100'),
    amcO_Order: z.coerce.number().min(1, 'Order must be greater than 0'),
    amcO_CourseFlag: z.boolean().default(false),
    amcO_FeeAplFlg: z.boolean().default(false),
    amcO_RegFeeFlg: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateMasterCourseFormProps {
    selectedRow: IMasterCourse;
    onSuccess: () => void;
}

export default function UpdateMasterCourseForm({ selectedRow, onSuccess }: UpdateMasterCourseFormProps) {
    const saveMutation = useSaveMasterCourse();
    const editMutation = useEditMasterCourse();
    const [isSemesterDisabled, setIsSemesterDisabled] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amcO_CourseName: selectedRow.amcO_CourseName || '',
            amcO_CourseCode: selectedRow.amcO_CourseCode || '',
            amcO_CourseInfo: selectedRow.amcO_CourseInfo || '',
            amcO_NoOfYears: Number(selectedRow.amcO_NoOfYears) || 0,
            amcO_NoOfSemesters: Number(selectedRow.amcO_NoOfSemesters) || 0,
            amcO_MinAttPer: Number(selectedRow.amcO_MinAttPer) || 0,
            amcO_Order: Number(selectedRow.amcO_Order) || 0,
            amcO_CourseFlag: selectedRow.amcO_CourseFlag || false,
            amcO_FeeAplFlg: selectedRow.amcO_FeeAplFlg || false,
            amcO_RegFeeFlg: selectedRow.amcO_RegFeeFlg || false
        }
    });

    useEffect(() => {
        // Check if the record is mapped, if so, disable semester editing
        editMutation
            .mutateAsync(selectedRow)
            .then((response: any) => {
                if (response?.msg === 'Mapped') {
                    setIsSemesterDisabled(true);
                }
            })
            .catch((err) => {
                console.error('Failed to check mapping status', err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (values: FormValues) => {
        const promise = saveMutation.mutateAsync({
            amcO_Id: selectedRow.amcO_Id,
            amcO_CourseName: values.amcO_CourseName,
            amcO_CourseCode: values.amcO_CourseCode,
            amcO_CourseInfo: values.amcO_CourseInfo,
            amcO_NoOfYears: values.amcO_NoOfYears,
            amcO_NoOfSemesters: values.amcO_NoOfSemesters,
            amcO_Order: values.amcO_Order,
            amcO_MinAttPer: values.amcO_MinAttPer,
            amcO_CourseFlag: values.amcO_CourseFlag,
            amcO_FeeAplFlg: values.amcO_FeeAplFlg,
            amcO_RegFeeFlg: values.amcO_RegFeeFlg,
            amcO_ActiveFlag: selectedRow.amcO_ActiveFlag ?? true,
            AMCO_Id: selectedRow.amcO_Id,
            AMCO_CourseName: values.amcO_CourseName,
            AMCO_CourseCode: values.amcO_CourseCode,
            AMCO_CourseInfo: values.amcO_CourseInfo,
            AMCO_NoOfYears: values.amcO_NoOfYears,
            AMCO_NoOfSemesters: values.amcO_NoOfSemesters,
            AMCO_Order: values.amcO_Order,
            AMCO_MinAttPer: values.amcO_MinAttPer,
            AMCO_CourseFlag: values.amcO_CourseFlag,
            AMCO_FeeAplFlg: values.amcO_FeeAplFlg,
            AMCO_RegFeeFlg: values.amcO_RegFeeFlg,
            AMCO_ActiveFlag: selectedRow.amcO_ActiveFlag ?? true
        });

        toast.promise(promise, {
            loading: 'Updating master course...',
            success: (data: any) => {
                if (data?.duplicateval === true || data?.msg === 'Duplicate' || data?.retrunMsg === 'Duplicate') {
                    throw new Error('Record already exist');
                }
                if (data?.returnval === false || data?.success === false) {
                    throw new Error(data?.retrunMsg || data?.msg || data?.message || 'Updation Failed!!!');
                }
                onSuccess();
                return data?.retrunMsg || data?.msg || 'Data record Updated Successfully!!!';
            },
            error: (err: any) => err.message || 'Updation Failed!!!'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='amcO_CourseName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Course Name <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter Course Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amcO_CourseInfo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Course Information <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter Course Information' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amcO_NoOfSemesters'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        No. of Semesters <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            placeholder='Enter No. of Semesters'
                                            {...field}
                                            disabled={isSemesterDisabled}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amcO_Order'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Order <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='Enter Order' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='amcO_CourseCode'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Course Code <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter Course Code' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amcO_NoOfYears'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        No. of Years <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='Enter No. of Years' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='amcO_MinAttPer'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Min Attendance % <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type='number' step='0.01' placeholder='Enter Min Attendance %' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-3 gap-2 pt-8'>
                            <FormField
                                control={form.control}
                                name='amcO_CourseFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Course Flag</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='amcO_FeeAplFlg'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Fee Applicable</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='amcO_RegFeeFlg'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Reg Fee Flag</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2 pt-4'>
                    <Button type='submit' disabled={saveMutation.isPending || editMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Update
                    </Button>
                    <Button type='button' variant='outline' onClick={onSuccess}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
