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
import { useSaveCombination } from '@/hooks/college/useCollegeMasters';
import { IClgMasterCombination } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
    admcB_NAME: z.string().min(1, 'Enter Combination Name').max(30, 'Maximum 30 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Invalid format (Only letters and spaces allowed)'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCombinationFormProps {
    selectedRow?: IClgMasterCombination;
    onSuccess: () => void;
}

export default function AddCombinationForm({ selectedRow, onSuccess }: AddCombinationFormProps) {
    const saveMutation = useSaveCombination();
    const isEdit = !!selectedRow;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            admcB_NAME: '',
        }
    });

    useEffect(() => {
        if (isEdit) {
            form.reset({
                admcB_NAME: selectedRow.admcB_NAME,
            });
        }
    }, [isEdit, selectedRow, form]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            ADMCB_ID: selectedRow ? selectedRow.admcB_ID : 0
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: isEdit ? 'Updating record...' : 'Saving record...',
            success: (data: any) => {
                if (data?.message === 'Add') {
                    onSuccess();
                    return 'Record Saved Successfully';
                } else if (data?.message === 'AddF') {
                    throw new Error('Failed To Save Record');
                } else if (data?.message === 'Update') {
                    onSuccess();
                    return 'Record Updated Successfully';
                } else if (data?.message === 'UpdateF') {
                    throw new Error('Failed To Update Record');
                } else if (data?.message === 'Duplicate') {
                    throw new Error('Record Already Exists');
                }
                throw new Error('Something Went Wrong Please Contact Administrator');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 gap-4'>
                    <FormField
                        control={form.control}
                        name='admcB_NAME'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Combination Name <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Combination Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className='flex justify-center gap-4 mt-6'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {isEdit ? 'Update' : 'Save'}
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
