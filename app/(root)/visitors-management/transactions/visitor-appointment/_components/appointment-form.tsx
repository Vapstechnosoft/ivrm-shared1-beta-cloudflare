'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useVisitorAppointment } from '@/hooks/visitors-management/transactions/useVisitorAppointment';
import { type VisitorAppointmentSchema, visitorAppointmentSchema } from '@/schemas/visitors-management/visitor-appointment-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface AppointmentFormProps {
    onSuccess: () => void;
    initialData?: any;
    onCancel?: () => void;
}

export default function AppointmentForm({ onSuccess, initialData, onCancel }: AppointmentFormProps) {
    const { saveAppointment, data: loadedData, isSaving } = useVisitorAppointment();
    const emplist = loadedData?.emplist || [];

    const form = useForm<VisitorAppointmentSchema>({
        resolver: zodResolver(visitorAppointmentSchema),
        defaultValues: {
            visitorName: '',
            contactNo: '',
            email: '',
            fromPlace: '',
            meetingDurationHrs: 0,
            meetingDurationMins: 0,
            toMeet: '',
            staffId: undefined,
            visitType: '',
            purpose: '',
            personsAccompanying: 0,
            entryDate: new Date(),
            fromTime: '',
            toTime: '',
            location: '',
            remarks: '',
            address: '',
            multiVisitors: [],
            documents: []
        }
    });

    const {
        fields: visitorFields,
        append: appendVisitor,
        remove: removeVisitor
    } = useFieldArray({
        control: form.control,
        name: 'multiVisitors'
    });

    // Form reset on initialData change

    useEffect(() => {
        if (initialData) {
            form.reset({
                vmaP_Id: initialData.vmaP_Id,
                visitorName: initialData.vmaP_VisitorName || '',
                contactNo: initialData.vmaP_VisitorContactNo || '',
                email: initialData.vmaP_VisitorEmailid || '',
                fromPlace: initialData.vmaP_FromPlace || '',
                meetingDurationHrs: initialData.vmaP_MeetingDurationHrs || 0,
                meetingDurationMins: initialData.vmaP_MeetingDurationMins || 0,
                toMeet: initialData.vmaP_ToMeet || '',
                staffId: initialData.hrmE_Id,
                visitType: initialData.vmaP_VisitTypeFlg || '',
                purpose: initialData.vmaP_MeetingPurpose || '',
                personsAccompanying: initialData.vmaP_PersonsAccompanying || 0,
                entryDate: initialData.vmaP_EntryDateTime ? new Date(initialData.vmaP_EntryDateTime) : new Date(),
                fromTime: initialData.vmaP_MeetingFromTime || '',
                toTime: initialData.vmaP_MeetingToTime || '',
                location: initialData.vmaP_MeetingLocation || '',
                remarks: initialData.vmaP_Remarks || '',
                address: initialData.vmaP_VisitorAddress || '',
                multiVisitors: initialData.multiVisitors || [],
                documents: initialData.documents || []
            });
        }
    }, [initialData, form]);

    const onSubmit = async (data: VisitorAppointmentSchema) => {
        try {
            await saveAppointment(data);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* 1. Appointment Information Grid */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {/* Visitor Name */}
                    <FormField
                        control={form.control}
                        name='visitorName'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    Visitor Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Visitor Name' className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Contact No */}
                    <FormField
                        control={form.control}
                        name='contactNo'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    Contact No <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder='Enter Mobile No'
                                        maxLength={10}
                                        inputMode='numeric'
                                        className='h-9 text-xs'
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '');
                                            field.onChange(numericValue);
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                !/[0-9]/.test(e.key) &&
                                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key) &&
                                                !e.ctrlKey &&
                                                !e.metaKey
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Email Id */}
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    Email Id <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Email Id' className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* From Place */}
                    <FormField
                        control={form.control}
                        name='fromPlace'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    From Place <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter From Place' className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* To Meet (Staff) */}
                    <FormField
                        control={form.control}
                        name='staffId'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    To Meet (Staff) <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder='Select Staff' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {emplist.map((emp) => (
                                            <SelectItem key={emp.hrmE_Id} value={String(emp.hrmE_Id)} className='text-xs'>
                                                {emp.hrmE_EmployeeFirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Visit Type */}
                    <FormField
                        control={form.control}
                        name='visitType'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    Visit Type <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='Personal' className='text-xs'>
                                            Personal
                                        </SelectItem>
                                        <SelectItem value='Official' className='text-xs'>
                                            Official
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Entry Date */}
                    <FormField
                        control={form.control}
                        name='entryDate'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    Entry Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Select Entry Date'
                                        className='h-9 w-full text-xs'
                                    />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Location */}
                    <FormField
                        control={form.control}
                        name='location'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    Meeting Location <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Location' className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* From Time */}
                    <FormField
                        control={form.control}
                        name='fromTime'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    From Time <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* To Time */}
                    <FormField
                        control={form.control}
                        name='toTime'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='font-semibold text-xs'>
                                    To Time <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Purpose */}
                    <FormField
                        control={form.control}
                        name='purpose'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5 sm:col-span-2'>
                                <FormLabel className='font-semibold text-xs'>
                                    Purpose <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Purpose' className='h-9 text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Address */}
                    <FormField
                        control={form.control}
                        name='address'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5 sm:col-span-2 lg:col-span-2'>
                                <FormLabel className='font-semibold text-xs'>
                                    Address <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Full Address' rows={2} className='text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Remarks */}
                    <FormField
                        control={form.control}
                        name='remarks'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5 sm:col-span-2 lg:col-span-2'>
                                <FormLabel className='font-semibold text-xs'>
                                    Remarks <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Remarks' rows={2} className='text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                {/* 2. Multiple Visitors */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h4 className='font-semibold text-sm'>Add Multiple Visitors</h4>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='h-8 text-xs'
                            onClick={() => appendVisitor({ vmapvI_VisitorName: '' })}>
                            <Plus className='mr-1.5 h-3.5 w-3.5' /> Add Visitor
                        </Button>
                    </div>
                    {visitorFields.map((field, index) => (
                        <div key={field.id} className='relative grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-3'>
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10'
                                onClick={() => removeVisitor(index)}>
                                <Trash className='h-3.5 w-3.5' />
                            </Button>
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorName`}
                                render={({ field }) => (
                                    <FormItem className='space-y-1'>
                                        <FormLabel className='font-medium text-xs'>Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Visitor Name' className='h-8 text-xs' />
                                        </FormControl>
                                        <FormMessage className='text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorContactNo`}
                                render={({ field }) => (
                                    <FormItem className='space-y-1'>
                                        <FormLabel className='font-medium text-xs'>Contact No</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='Mobile No'
                                                maxLength={10}
                                                inputMode='numeric'
                                                className='h-8 text-xs'
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/\D/g, '');
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorEmailId`}
                                render={({ field }) => (
                                    <FormItem className='space-y-1'>
                                        <FormLabel className='font-medium text-xs'>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Email' className='h-8 text-xs' />
                                        </FormControl>
                                        <FormMessage className='text-xs' />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </div>

                {/* 3. Action Buttons matching Screenshot 1 */}
                <div className='flex flex-wrap items-center gap-3 border-t pt-4 sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            form.reset();
                            if (onCancel) onCancel();
                        }}
                        className='w-fit text-xs transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSaving}
                        className='w-fit bg-primary text-primary-foreground text-xs transition-all duration-200 hover:scale-105'>
                        <Save className='mr-2 h-3.5 w-3.5' />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
