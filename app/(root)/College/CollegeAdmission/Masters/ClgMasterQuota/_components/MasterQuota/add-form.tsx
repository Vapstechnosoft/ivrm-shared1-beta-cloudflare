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
import { useSaveMasterQuota } from '@/hooks/college/useCollegeMasters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    acQ_QuotaName: z.string().min(1, 'Enter Quota Name').max(100, 'Maximum 100 characters'),
    acQ_QuotaCode: z.string().min(1, 'Enter Quota Code').max(100, 'Maximum 100 characters'),
    acQ_QuotaInfo: z.string().min(1, 'Enter Quota Info').max(100, 'Maximum 100 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddMasterQuotaForm({ onSuccess }: { onSuccess: () => void }) {
    const saveMutation = useSaveMasterQuota();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acQ_QuotaName: '',
            acQ_QuotaCode: '',
            acQ_QuotaInfo: '',
        }
    });

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            acQ_Id: 0
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
                        name='acQ_QuotaName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quota Name <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Quota Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='acQ_QuotaCode'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quota Code <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Quota Code' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='acQ_QuotaInfo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quota Info <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Quota Info' {...field} />
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
