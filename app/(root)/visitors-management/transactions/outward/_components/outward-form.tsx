'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useOutward } from '@/hooks/visitors-management/transactions/useOutward';
import { type OutwardSchema, outwardSchema } from '@/schemas/visitors-management/transactions';
import type { OutwardTransactionData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface OutwardFormProps {
    onSuccess: () => void;
    initialData?: OutwardTransactionData | null;
}

export default function OutwardForm({ onSuccess, initialData }: OutwardFormProps) {
    const { saveOutward, data: loadedData } = useOutward();
    const emplist = loadedData?.emplist || [];

    const form = useForm<OutwardSchema>({
        resolver: zodResolver(outwardSchema),
        defaultValues: {
            description: '',
            date: new Date(),
            from: '',
            to: '',
            phoneNo: '',
            emailId: '',
            dispatchedBy: undefined,
            dispatchedThrough: '',
            dispatchedDetails: '',
            dispatchedPhNo: '',
            address: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                foouT_Id: initialData.foouT_Id,
                description: initialData.foouT_Discription,
                date: new Date(initialData.foouT_DateTime),
                from: initialData.foouT_From,
                to: initialData.foouT_To,
                phoneNo: initialData.foouT_PhoneNo,
                emailId: initialData.foouT_EmailId,
                dispatchedBy: initialData.foouT_DispatchedBy,
                dispatchedThrough: initialData.foouT_DispatchedThrough,
                dispatchedDetails: initialData.foouT_DispatchedDeatils,
                dispatchedPhNo: initialData.foouT_DispatchedPhNo || '',
                address: initialData.foouT_Address
            });
        } else {
            form.reset({
                description: '',
                date: new Date(),
                from: '',
                to: '',
                phoneNo: '',
                emailId: '',
                dispatchedBy: undefined,
                dispatchedThrough: '',
                dispatchedDetails: '',
                dispatchedPhNo: '',
                address: ''
            });
        }
    }, [initialData, form]);

    const onSubmit = async (data: OutwardSchema) => {
        try {
            await saveOutward(data);
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
                        render={({ field, fieldState }) => <DateField field={field} fieldState={fieldState} label='Date' />}
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
                        name='to'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    To <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter To' />
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
                                <FormLabel>
                                    Phone No <span className='text-red-500'>*</span>
                                </FormLabel>
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
                        name='dispatchedBy'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Dispatched By <span className='text-red-500'>*</span>
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
                        name='dispatchedThrough'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Dispatched Through <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Dispatched Through' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='dispatchedDetails'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dispatched Details</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Dispatched Details' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='dispatchedPhNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dispatched Phone No</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Dispatched Phone No' maxLength={10} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='address'
                        render={({ field }) => (
                            <FormItem className='col-span-1 md:col-span-2'>
                                <FormLabel>
                                    Full Address <span className='text-red-500'>*</span>
                                </FormLabel>
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
