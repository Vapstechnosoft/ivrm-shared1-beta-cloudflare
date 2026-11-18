'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppointmentStatus } from '@/hooks/visitors-management/transactions/useAppointmentStatus';
import type { AppointmentStatusVisitorData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    vmmV_Id: z.number().min(1, 'Visitor ID is required'),
    empname: z.string(),
    vmmV_EntryDate: z.date().optional(),
    vmmV_EntryTime: z.string().optional(),
    vmmV_CkeckedInOutStatus: z.string().min(1, 'Status is required'),
    vmmV_ExitDate: z.date({
        required_error: 'Exit date is required'
    }),
    vmmV_ExitTime: z.string().min(1, 'Exit time is required'),
    vmmV_Remarks: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentStatusFormProps {
    onSuccess: () => void;
}

export default function AppointmentStatusForm({ onSuccess }: AppointmentStatusFormProps) {
    const { selectedRow: formData } = useFormContext<AppointmentStatusVisitorData>();
    const { saveAppointmentStatus, isSaving, getEditData, isFetchingEdit } = useAppointmentStatus();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vmmV_Id: formData?.vmmV_Id || 0,
            empname: '',
            vmmV_EntryDate: undefined,
            vmmV_EntryTime: '',
            vmmV_CkeckedInOutStatus: 'Checked Out',
            vmmV_ExitDate: new Date(),
            vmmV_ExitTime: format(new Date(), 'HH:mm'),
            vmmV_Remarks: ''
        }
    });
    useEffect(() => {
        const fetchEditData = async () => {
            if (formData?.vmmV_Id) {
                const data = await getEditData(formData.vmmV_Id);
                if (data) {
                    form.reset({
                        vmmV_Id: data.vmmV_Id,
                        empname: data.empname || '',
                        vmmV_EntryDate: data.vmmV_MeetingDateTime ? new Date(data.vmmV_MeetingDateTime) : undefined,
                        vmmV_EntryTime: data.vmmV_EntryDateTime ? format(new Date(data.vmmV_EntryDateTime), 'HH:mm') : '',
                        vmmV_CkeckedInOutStatus: formData.vmmV_CkeckedInOutStatus || 'Checked Out',
                        vmmV_ExitDate: new Date(),
                        vmmV_ExitTime: format(new Date(), 'HH:mm'),
                        vmmV_Remarks: data.vmmV_Remarks || ''
                    });
                }
            }
        };

        fetchEditData();
    }, [formData, getEditData, form]);

    const onSubmit = async (data: FormValues) => {
        const submitData = {
            ...data,
            vmmV_ExitDate: data.vmmV_ExitDate.toISOString()
            // Ensure exit time is formatted correctly depending on backend expectations
        };
        await saveAppointmentStatus(submitData);
        onSuccess();
    };

    if (isFetchingEdit) {
        return (
            <div className='flex h-40 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='max-h-[60vh] space-y-6 overflow-y-auto px-1 pb-2'>
                <div className='mb-4 flex items-center gap-2 rounded-md border bg-secondary/10 p-3 font-medium text-sm'>
                    <span>Selected Visitor:</span>
                    <span className='font-bold text-primary'>{formData?.vmmV_VisitorName}</span>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='empname'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Meet</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='vmmV_EntryDate'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Entry Date</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        // disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='vmmV_EntryTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Entry Time</FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='vmmV_CkeckedInOutStatus'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Status <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Status' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='Checked In'>Checked In</SelectItem>
                                        <SelectItem value='Checked Out'>Checked Out</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='vmmV_ExitDate'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Exit Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='vmmV_ExitTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Exit Time <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='vmmV_Remarks'
                        render={({ field }) => (
                            <FormItem className='md:col-span-2'>
                                <FormLabel>Feedback / Remarks</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter feedback here...' rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='mt-6 flex justify-end gap-4'>
                    <Button type='button' variant='outline' onClick={onSuccess}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSaving}>
                        {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save & Send SMS/Mail
                    </Button>
                </div>
            </form>
        </Form>
    );
}
