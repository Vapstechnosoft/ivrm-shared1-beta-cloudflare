'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSaveClgMasterCategory } from '@/hooks/college/useCollegeMasters';

const formSchema = z.object({
    AMCOC_Name: z.string().min(1, 'Category Name is required').regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces are allowed').max(50),
    AMCOC_Address: z.string().min(1, 'Address is required').regex(/^[a-zA-Z0-9\s]+$/, 'Only alphanumeric characters and spaces are allowed').max(150),
    ACMC_RegNoPrefix: z.string().min(1, 'Reg Prefix/Suffix is required').regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces are allowed').max(50),
    AMCOC_Details: z.string().min(1, 'Details are required').max(50),
    AMCOC_Type: z.string().min(1, 'Type selection is required')
});

type FormValues = z.infer<typeof formSchema>;

interface AddClgMasterCategoryFormProps {
    onSuccess: () => void;
}

export default function AddClgMasterCategoryForm({ onSuccess }: AddClgMasterCategoryFormProps) {
    const saveMutation = useSaveClgMasterCategory();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            AMCOC_Name: '',
            AMCOC_Address: '',
            ACMC_RegNoPrefix: '',
            AMCOC_Details: '',
            AMCOC_Type: ''
        }
    });

    const onSubmit = async (values: FormValues) => {
        const promise = saveMutation.mutateAsync({
            AMCOC_Id: 0,
            AMCOC_Name: values.AMCOC_Name,
            AMCOC_Address: values.AMCOC_Address,
            ACMC_RegNoPrefix: values.ACMC_RegNoPrefix,
            AMCOC_Details: values.AMCOC_Details,
            AMCOC_Type: values.AMCOC_Type
        });

        toast.promise(promise, {
            loading: 'Saving category...',
            success: (data: any) => {
                if (data?.success === false || data?.message === 'Duplicate') {
                    throw new Error(data?.message === 'Duplicate' ? 'Category Already Exist' : (data?.message || 'Record Not Saved/Updated successfully'));
                }
                if (data?.success || data?.message === 'Add' || data?.returnval) {
                    onSuccess();
                    return data?.message && data.message !== 'Add' && data.message !== 'Duplicate' ? data.message : 'Record Saved Successfully';
                }
                throw new Error('Operation Failed');
            },
            error: (err: any) => err.message || 'Operation Failed'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='AMCOC_Name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Name <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter category name' {...field} maxLength={50} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='ACMC_RegNoPrefix'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reg Prefix/Suffix <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter reg prefix/suffix' {...field} maxLength={50} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='AMCOC_Type'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type <span className='text-red-500'>*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Type' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='School'>School</SelectItem>
                                            <SelectItem value='College'>College</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='AMCOC_Address'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter address' {...field} maxLength={150} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='AMCOC_Details'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Details <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter details' {...field} maxLength={50} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className='flex items-center gap-2 pt-4'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                    <Button type='button' variant='outline' onClick={onSuccess}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
