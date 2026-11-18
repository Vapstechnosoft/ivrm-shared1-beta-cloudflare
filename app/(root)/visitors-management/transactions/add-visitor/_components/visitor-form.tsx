'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAddVisitor } from '@/hooks/visitors-management/transactions/useAddVisitor';
import { type AddVisitorSchema, addVisitorSchema } from '@/schemas/visitors-management/transaction-schema';
import type { AppointmentVisitorData, PreviousVisitorData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Trash } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { SearchAppointmentModal } from './search-appointment-modal';
import { SearchPreviousModal } from './search-previous-modal';

interface VisitorFormProps {
    onSuccess: () => void;
    initialData?: any; // To be typed properly if we handle edits
}

export default function VisitorForm({ onSuccess, initialData: _initialData }: VisitorFormProps) {
    const { saveVisitor, data: loadedData, searchPrevious, searchAppointment } = useAddVisitor();
    const [showPreviousModal, setShowPreviousModal] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    const emplist = loadedData?.emplist || [];

    const form = useForm<AddVisitorSchema>({
        resolver: zodResolver(addVisitorSchema),
        defaultValues: {
            visitorName: '',
            contactNo: '',
            email: '',
            idCardType: '',
            idCardNo: '',
            visitType: '',
            fromPlace: '',
            meetingLocation: '',
            entryDate: new Date(),
            entryTime: '',
            purpose: '',
            personsAccompanying: 0,
            fromAddress: '',
            vehicleNo: '',
            smsRequired: false,
            emailRequired: false,
            externalFlag: false,
            toMeetInternal: undefined,
            toMeetExternal: '',
            remarks: '',
            multiVisitors: [],
            documents: [] // Initial empty documents
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

    const {
        fields: docFields,
        append: appendDoc,
        remove: removeDoc
    } = useFieldArray({
        control: form.control,
        name: 'documents'
    });

    const onSubmit = async (data: AddVisitorSchema) => {
        try {
            await saveVisitor(data);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    const onSelectPrevious = (visitor: PreviousVisitorData) => {
        form.setValue('visitorName', visitor.vmmV_VisitorName);
        form.setValue('contactNo', visitor.vmmV_VisitorContactNo);
        form.setValue('email', visitor.vmmV_VisitorEmailid);
        form.setValue('fromPlace', visitor.vmmV_FromPlace);
        if (visitor.vmmV_FromAddress) form.setValue('fromAddress', visitor.vmmV_FromAddress);
        setShowPreviousModal(false);
    };

    const onSelectAppointment = (visitor: AppointmentVisitorData) => {
        form.setValue('visitorName', visitor.vpA_VisitorName);
        form.setValue('contactNo', visitor.vpA_ContactNo);
        form.setValue('email', visitor.vpA_EmailId);
        if (visitor.vpA_FromPlace) form.setValue('fromPlace', visitor.vpA_FromPlace);
        if (visitor.vpA_Purpose) form.setValue('purpose', visitor.vpA_Purpose);
        setShowAppointmentModal(false);
    };

    const externalFlag = form.watch('externalFlag');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-md border p-4'>
                {/* Header Actions */}
                <div className='mb-4 flex justify-end gap-2'>
                    <Button type='button' variant='outline' size='sm' onClick={() => setShowAppointmentModal(true)}>
                        <Search className='mr-2 h-4 w-4' /> Search Appointment
                    </Button>
                    <Button type='button' variant='outline' size='sm' onClick={() => setShowPreviousModal(true)}>
                        <Search className='mr-2 h-4 w-4' /> Search Previous
                    </Button>
                </div>

                {/* Section 1: Visitor Information */}
                <h3 className='font-semibold text-lg'>Visitor Information</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='visitorName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Visitor Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Visitor Name' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='contactNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Contact No <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder='Enter Mobile No'
                                        maxLength={10}
                                        inputMode='numeric'
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Id</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Email Id' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='idCardType'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Identity Card Type <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='PAN Card'>PAN Card</SelectItem>
                                        <SelectItem value='Adhar Card'>Aadhar Card</SelectItem>
                                        <SelectItem value='Voter Card'>Voter Card</SelectItem>
                                        <SelectItem value='Other'>Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='idCardNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    ID Card No <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter ID Card No' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='visitType'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Visit Type <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='Personal'>Personal</SelectItem>
                                        <SelectItem value='Official'>Official</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='fromPlace'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    From Place <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter From Place' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* External Flag Toggle */}
                    <FormField
                        control={form.control}
                        name='externalFlag'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm'>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                    <FormLabel>External Visitor (Not meeting staff?)</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Conditional To Meet */}
                    {externalFlag ? (
                        <FormField
                            control={form.control}
                            name='toMeetExternal'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        To Meet (External) <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Enter Person Name' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <FormField
                            control={form.control}
                            name='toMeetInternal'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        To Meet (Staff) <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Staff' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {emplist.map((emp) => (
                                                <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()}>
                                                    {emp.hrmE_EmployeeFirstName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name='entryDate'
                        render={({ field, fieldState }) => <DateField field={field} fieldState={fieldState} label='Entry Date' />}
                    />

                    <FormField
                        control={form.control}
                        name='entryTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Entry Time <span className='text-red-500'>*</span>
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
                        name='meetingLocation'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Meeting Location <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Meeting Location' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='purpose'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Purpose <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Purpose of Visit' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='personsAccompanying'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Persons Accompanying</FormLabel>
                                <FormControl>
                                    <Input type='number' {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='fromAddress'
                        render={({ field }) => (
                            <FormItem className='col-span-1 md:col-span-2'>
                                <FormLabel>
                                    Address <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Full Address' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='remarks'
                        render={({ field }) => (
                            <FormItem className='col-span-1 md:col-span-2'>
                                <FormLabel>
                                    Remarks <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Remarks' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Checkboxes */}
                    <div className='col-span-1 flex gap-4 md:col-span-2'>
                        <FormField
                            control={form.control}
                            name='smsRequired'
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>SMS Required</FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='emailRequired'
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel>Email Required</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator />

                {/* Section 2: Add Multiple Visitors */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-lg'>Add Multiple Visitors</h3>
                        <Button
                            type='button'
                            variant='secondary'
                            size='sm'
                            onClick={() => appendVisitor({ name: '', contactNo: '', email: '', identityCardNo: '' })}>
                            <Plus className='mr-2 h-4 w-4' /> Add Visitor
                        </Button>
                    </div>

                    {visitorFields.map((field, index) => (
                        <div
                            key={field.id}
                            className='relative grid grid-cols-1 gap-4 rounded border bg-slate-50 p-4 md:grid-cols-3 dark:bg-slate-900'>
                            <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute top-2 right-2 h-6 w-6'
                                onClick={() => removeVisitor(index)}>
                                <Trash className='h-3 w-3' />
                            </Button>
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Name <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Visitor Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.contactNo`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Contact No <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='Mobile No'
                                                maxLength={10}
                                                inputMode='numeric'
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/\D/g, '');
                                                    field.onChange(numericValue);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (
                                                        !/[0-9]/.test(e.key) &&
                                                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(
                                                            e.key
                                                        ) &&
                                                        !e.ctrlKey &&
                                                        !e.metaKey
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.email`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Email' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Section 3: Documents */}
                <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-lg'>Documents</h3>
                        <Button type='button' variant='secondary' size='sm' onClick={() => appendDoc({ remarks: '' })}>
                            <Plus className='mr-2 h-4 w-4' /> Add Document
                        </Button>
                    </div>

                    {docFields.map((field, index) => (
                        <div
                            key={field.id}
                            className='relative grid grid-cols-1 gap-4 rounded border bg-slate-50 p-4 md:grid-cols-3 dark:bg-slate-900'>
                            <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute top-2 right-2 h-6 w-6'
                                onClick={() => removeDoc(index)}>
                                <Trash className='h-3 w-3' />
                            </Button>

                            <FormField
                                control={form.control}
                                name={`documents.${index}.remarks`}
                                render={({ field }) => (
                                    <FormItem className='col-span-2'>
                                        <FormLabel>File Remarks</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Remarks' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex items-end'>
                                {/* File input would go here. Using a placeholder for now as generic file input support varies */}
                                <Input type='file' />
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' className='w-40'>
                        Save
                    </Button>
                    <Button type='button' variant='outline' className='w-40' onClick={() => onSuccess()}>
                        Cancel
                    </Button>
                </div>
            </form>

            <SearchPreviousModal
                isOpen={showPreviousModal}
                onClose={() => setShowPreviousModal(false)}
                onSearch={searchPrevious}
                onSelect={onSelectPrevious}
            />

            <SearchAppointmentModal
                isOpen={showAppointmentModal}
                onClose={() => setShowAppointmentModal(false)}
                onSearch={searchAppointment}
                onSelect={onSelectAppointment}
            />
        </Form>
    );
}
