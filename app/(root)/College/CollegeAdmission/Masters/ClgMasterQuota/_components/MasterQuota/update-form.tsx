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
import { useSaveMasterQuota, useEditMasterQuota } from '@/hooks/college/useCollegeMasters';
import { IMasterQuota } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
    acQ_QuotaName: z.string().min(1, 'Enter Quota Name').max(100, 'Maximum 100 characters'),
    acQ_QuotaCode: z.string().min(1, 'Enter Quota Code').max(100, 'Maximum 100 characters'),
    acQ_QuotaInfo: z.string().min(1, 'Enter Quota Info').max(100, 'Maximum 100 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateMasterQuotaFormProps {
    selectedRow: IMasterQuota;
    onSuccess: () => void;
}

export default function UpdateMasterQuotaForm({ selectedRow, onSuccess }: UpdateMasterQuotaFormProps) {
    const saveMutation = useSaveMasterQuota();
    const editMutation = useEditMasterQuota();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acQ_QuotaName: '',
            acQ_QuotaCode: '',
            acQ_QuotaInfo: '',
        }
    });

    useEffect(() => {
        if (selectedRow) {
            editMutation.mutateAsync({ ACQ_Id: selectedRow.acQ_Id })
                .then((res: any) => {
                    const data = res?.data?.[0];
                    if (data) {
                        form.reset({
                            acQ_QuotaName: data.acQ_QuotaName,
                            acQ_QuotaCode: data.acQ_QuotaCode,
                            acQ_QuotaInfo: data.acQ_QuotaInfo,
                        });
                    }
                })
                .catch((err) => {
                    toast.error('Failed to fetch details for edit');
                });
        }
    }, [selectedRow]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            acQ_Id: selectedRow.acQ_Id
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Updating record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data.message || 'Record Updated Successfully';
                }
                throw new Error(data?.message || 'Failed To Update Record');
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
                    <Button type='submit' disabled={saveMutation.isPending || editMutation.isPending}>
                        {(saveMutation.isPending || editMutation.isPending) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Update
                    </Button>
                    <Button type='button' variant='destructive' onClick={onSuccess} disabled={saveMutation.isPending}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
