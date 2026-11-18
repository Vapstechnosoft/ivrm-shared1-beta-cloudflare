'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DataTable } from '@/components/ui/data-table'; // Assuming a generic DataTable component exists
import { DateField } from '@/components/ui/dateField';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAppointmentApproval } from '@/hooks/visitors-management/use-appointment-approval';
import { type AppointmentApprovalSchema, appointmentApprovalSchema } from '@/schemas/visitors-management/appointment-approval-schema';
import type { AppointmentApprovalDTO } from '@/types/visitors-management/appointment-approval-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getColumns } from './columns';

export default function AppointmentApprovalForm() {
    const { loadData, saveData, isSaving, saveFeedback, sendMOM } = useAppointmentApproval();
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentApprovalDTO | null>(null);
    const [showForm, setShowForm] = useState(false);

    const form = useForm<AppointmentApprovalSchema>({
        resolver: zodResolver(appointmentApprovalSchema),
        defaultValues: {
            VMAP_Status: 'Approved',
            VMAP_RepeatFlag: 'Never',
            VMAP_ReminderFlag: 'Day',
            VMAP_Remarks: ''
        }
    });

    const statusObj = form.watch('VMAP_Status');
    const reminderFlag = form.watch('VMAP_ReminderFlag');

    useEffect(() => {
        if (selectedAppointment) {
            form.reset({
                VMAP_Id: selectedAppointment.VMAP_Id,
                VMAP_HRME_Id: selectedAppointment.hrmE_Id,
                VMAP_MeetingDateTime: new Date(selectedAppointment.VMAP_MeetingDateTime),
                VMAP_MeetingTiming: selectedAppointment.VMAP_MeetingTiming,
                VMAP_MeetingToTime: selectedAppointment.VMAP_MeetingToTime,
                VMAP_Remarks: selectedAppointment.VMAP_Remarks,
                VMAP_Status: (selectedAppointment.VMAP_Status as any) || 'Approved'
                // Initialize other fields as needed based on logic
            });
            setShowForm(true);
        }
    }, [selectedAppointment, form]);

    const onSubmit = async (data: AppointmentApprovalSchema) => {
        await saveData(data);
        setShowForm(false);
        setSelectedAppointment(null);
        form.reset();
    };

    const handleEdit = (data: AppointmentApprovalDTO) => {
        setSelectedAppointment(data);
    };

    const handleUploadMOM = (data: AppointmentApprovalDTO) => {
        // Implementation for MOM modal
        console.log('Upload MOM', data);
    };

    const handleUpdateFeedback = (data: AppointmentApprovalDTO) => {
        // Implementation for Feedback modal
        console.log('Update Feedback', data);
    };

    const handleViewDocuments = (data: AppointmentApprovalDTO) => {
        // Implementation for View Documents modal
        console.log('View Documents', data);
    };

    const onCancel = () => {
        setShowForm(false);
        setSelectedAppointment(null);
        form.reset();
    };

    if (loadData.isLoading) return <div>Loading...</div>;

    const staffOptions =
        loadData.data?.emplist.map((emp: { hrmE_EmployeeFirstName: any; hrmE_Id: { toString: () => any } }) => ({
            label: emp.hrmE_EmployeeFirstName,
            value: emp.hrmE_Id.toString()
        })) || [];

    return (
        <div className='space-y-6'>
            {showForm && selectedAppointment && (
                <div className='rounded-md border bg-white p-4 shadow-sm'>
                    <div className='mb-4 flex items-center justify-between border-b pb-2'>
                        <h3 className='font-semibold text-lg'>VISITOR APPOINTMENT APPROVAL STATUS</h3>
                        <Button variant='ghost' size='sm' onClick={onCancel}>
                            Close
                        </Button>
                    </div>

                    <div className='mb-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                        <div>
                            <strong>To Meet:</strong> {selectedAppointment.hrmE_EmployeeFirstName}
                        </div>
                        <div>
                            <strong>Place:</strong> {selectedAppointment.VMAP_FromPlace}
                        </div>
                        <div>
                            <strong>Meeting Location:</strong> {selectedAppointment.VMAP_MeetingLocation}
                        </div>
                        <div>
                            <strong>Purpose:</strong> {selectedAppointment.VMAP_MeetingPurpose}
                        </div>
                        <div>
                            <strong>Logged Date & Time:</strong>{' '}
                            {selectedAppointment.LoginDate ? new Date(selectedAppointment.LoginDate).toLocaleDateString() : ''}{' '}
                            {selectedAppointment.LoginTime1}
                        </div>
                    </div>

                    <hr className='my-4' />
                    <h4 className='mb-2 font-semibold'>VISITOR DETAILS</h4>
                    <div className='mb-4 grid grid-cols-1 gap-4 rounded bg-gray-50 p-2 text-sm md:grid-cols-3'>
                        <div>
                            <strong>Name:</strong> {selectedAppointment.VMAP_VisitorName}
                        </div>
                        <div>
                            <strong>Contact No:</strong> {selectedAppointment.VMAP_VisitorContactNo}
                        </div>
                        <div>
                            <strong>Email:</strong> {selectedAppointment.VMAP_VisitorEmailid}
                        </div>
                        <div className='col-span-3'>
                            <strong>Address:</strong> {selectedAppointment.VMAP_FromAddress}
                        </div>
                    </div>
                    <hr className='my-4' />

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <FormItem>
                                    <FormLabel>
                                        Staff Name <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <CustomMultiSelectBox
                                        options={staffOptions}
                                        value={form.watch('VMAP_HRME_Id') ? [form.watch('VMAP_HRME_Id').toString()] : []}
                                        onChange={(vals: string[]) => {
                                            const current = form.getValues('VMAP_HRME_Id')?.toString();
                                            let newValue = 0;
                                            if (vals.length > 0) {
                                                if (vals.length > 1 && current) {
                                                    const newlySelected = vals.find((v) => v !== current);
                                                    newValue = Number(newlySelected || vals[vals.length - 1]);
                                                } else {
                                                    newValue = Number(vals[0]);
                                                }
                                            }
                                            form.setValue('VMAP_HRME_Id', newValue);
                                        }}
                                        label='Select Staff'
                                    />
                                    <FormMessage />
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name='VMAP_MeetingDateTime'
                                    render={({ field, fieldState }) => (
                                        <DateField label='Meeting Date' field={field} fieldState={fieldState} outputFormat='date' />
                                    )}
                                />
                            </div>

                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                <FormField
                                    control={form.control}
                                    name='VMAP_MeetingTiming'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                From Time <span className='text-red-500'>*</span>
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
                                    name='VMAP_MeetingToTime'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                To Time <span className='text-red-500'>*</span>
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
                                    name='VMAP_Remarks'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder='Enter Remarks' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='rounded-md border p-4'>
                                <FormField
                                    control={form.control}
                                    name='VMAP_Status'
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel>
                                                Status <span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className='flex space-x-4'>
                                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                                        <FormControl>
                                                            <RadioGroupItem value='Approved' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>APPROVE</FormLabel>
                                                    </FormItem>
                                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                                        <FormControl>
                                                            <RadioGroupItem value='RE-SCHEDULE' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>RE-SCHEDULE</FormLabel>
                                                    </FormItem>
                                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                                        <FormControl>
                                                            <RadioGroupItem value='Rejected' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>REJECT</FormLabel>
                                                    </FormItem>
                                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                                        <FormControl>
                                                            <RadioGroupItem value='Canceled' />
                                                        </FormControl>
                                                        <FormLabel className='font-normal'>CANCEL</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {statusObj === 'Approved' && (
                                    <div className='mt-4'>
                                        <FormField
                                            control={form.control}
                                            name='VMAP_ReminderFlag'
                                            render={({ field }) => (
                                                <FormItem className='space-y-3'>
                                                    <FormLabel>Reminder flag:</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className='flex space-x-4'>
                                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                                <FormControl>
                                                                    <RadioGroupItem value='Day' />
                                                                </FormControl>
                                                                <FormLabel className='font-normal'>Day</FormLabel>
                                                            </FormItem>
                                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                                <FormControl>
                                                                    <RadioGroupItem value='Hour' />
                                                                </FormControl>
                                                                <FormLabel className='font-normal'>Hour</FormLabel>
                                                            </FormItem>
                                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                                <FormControl>
                                                                    <RadioGroupItem value='Mints' />
                                                                </FormControl>
                                                                <FormLabel className='font-normal'>Minute</FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* Conditional rendering for Reminder Days/Hours/Mins and Repeat Flag based on reminderFlag would go here */}
                                    </div>
                                )}

                                {statusObj === 'RE-SCHEDULE' && (
                                    <div className='mt-4'>
                                        <FormField
                                            control={form.control}
                                            name='VMAP_RescheduleReason'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Reschedule Reason <span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder='Enter Reason' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className='flex justify-center gap-4'>
                                <Button type='submit' disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button type='button' variant='destructive' onClick={onCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            )}

            <div className='rounded-md bg-white p-4 shadow-sm'>
                <h3 className='mb-4 font-semibold text-lg'>VISITOR APPOINTMENT APPROVAL LIST</h3>
                <DataTable
                    columns={getColumns({
                        onEdit: handleEdit,
                        onUploadMOM: handleUploadMOM,
                        onUpdateFeedback: handleUpdateFeedback,
                        onViewDocuments: handleViewDocuments
                    })}
                    data={loadData.data?.griddata || []}
                    isLoading={loadData.isLoading}
                    totalItems={0}
                />
            </div>
        </div>
    );
}
