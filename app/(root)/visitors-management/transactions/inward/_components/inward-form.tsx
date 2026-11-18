'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInward } from '@/hooks/visitors-management/transactions/useInward';
import { type InwardSchema, inwardSchema } from '@/schemas/visitors-management/transactions';
import type { InwardTransactionData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface InwardFormProps {
    onSuccess: () => void;
    initialData?: InwardTransactionData | null;
}

export default function InwardForm({ onSuccess, initialData }: InwardFormProps) {
    const { saveInward, data: loadedData } = useInward();
    const emplist = loadedData?.emplist || [];

    const form = useForm<InwardSchema>({
        resolver: zodResolver(inwardSchema),
        defaultValues: {
            description: '',
            date: new Date(),
            from: '',
            contactPerson: '',
            phoneNo: '',
            emailId: '',
            personTo: undefined,
            handedOverTo: undefined,
            dispatchedBy: undefined,
            address: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                foiN_Id: initialData.foiN_Id,
                description: initialData.foiN_Discription,
                date: new Date(initialData.foiN_DateTime),
                from: initialData.foiN_From,
                contactPerson: initialData.foiN_ContactPerson,
                phoneNo: initialData.foiN_PhoneNo,
                emailId: initialData.foiN_EmailId,
                personTo: initialData.foiN_To,
                handedOverTo: initialData.foiN_HandedOverTo,
                dispatchedBy: initialData.foiN_DispatchedBy,
                address: initialData.foiN_Address || ''
            });
        } else {
            form.reset({
                description: '',
                date: new Date(),
                from: '',
                contactPerson: '',
                phoneNo: '',
                emailId: '',
                personTo: undefined,
                handedOverTo: undefined,
                dispatchedBy: undefined,
                address: ''
            });
        }
    }, [initialData, form]);

    const onSubmit = async (data: InwardSchema) => {
        try {
            await saveInward(data);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Description <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Description' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='date'
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label='Date' // The DateField component likely wants a label prop, or wraps FormItem itself. Based on previous usage at L278 in visitor-form.tsx, it takes field, fieldState and label.
                            />
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='from'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    From <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter From' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='contactPerson'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Contact Person <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Contact Person' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='phoneNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone No</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Phone No' maxLength={10} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='emailId'
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
                        name='personTo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Person To <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Employee' />
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

                    <FormField
                        control={form.control}
                        name='handedOverTo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Handed Over To</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Employee' />
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

                    <FormField
                        control={form.control}
                        name='dispatchedBy'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dispatched By</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Employee' />
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

                    <FormField
                        control={form.control}
                        name='address'
                        render={({ field }) => (
                            <FormItem className='col-span-1 md:col-span-2'>
                                <FormLabel>Full Address</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter Full Address' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' className='w-40'>
                        {initialData ? 'Update' : 'Save'}
                    </Button>
                    <Button type='button' variant='outline' className='w-40' onClick={() => onSuccess()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
