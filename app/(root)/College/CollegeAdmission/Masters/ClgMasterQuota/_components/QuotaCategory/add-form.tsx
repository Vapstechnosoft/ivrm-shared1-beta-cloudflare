'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSaveMasterQuotaCategory } from '@/hooks/college/useCollegeMasters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    acqC_CategoryName: z.string().min(1, 'Enter Category Name').max(100, 'Maximum 100 characters'),
    acqC_CategoryCode: z.string().min(1, 'Enter Category Code').max(100, 'Maximum 100 characters'),
    acqC_CategoryInfo: z.string().min(1, 'Enter Category Info').max(100, 'Maximum 100 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddQuotaCategoryForm({ onSuccess }: { onSuccess: () => void }) {
    const saveMutation = useSaveMasterQuotaCategory();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acqC_CategoryName: '',
            acqC_CategoryCode: '',
            acqC_CategoryInfo: '',
        }
    });

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            acqC_Id: 0
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Saving record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data.message || 'Record Saved Successfully';
                }
                throw new Error(data?.message || 'Failed To Save Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='acqC_CategoryName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Name <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Category Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='acqC_CategoryCode'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Code <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Category Code' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='acqC_CategoryInfo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Info <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Category Info' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className='flex justify-center gap-4 mt-6'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => {
                        form.reset();
                        onSuccess();
                    }} disabled={saveMutation.isPending}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
