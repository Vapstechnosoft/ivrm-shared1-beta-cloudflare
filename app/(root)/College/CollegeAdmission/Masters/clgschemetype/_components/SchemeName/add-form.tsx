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
import { useSaveSchemeName } from '@/hooks/college/useCollegeMasters';
import { IClgSubjectSchemeName } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
    acsS_SchmeName: z.string().min(1, 'Enter Scheme Name').max(30, 'Maximum 30 characters')
        .regex(/^[\s|a-zA-Z0-9|\.|\-|\/|\\]+$/, 'Invalid format'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSchemeNameFormProps {
    selectedRow?: IClgSubjectSchemeName;
    onSuccess: () => void;
}

export default function AddSchemeNameForm({ selectedRow, onSuccess }: AddSchemeNameFormProps) {
    const saveMutation = useSaveSchemeName();
    const isEdit = !!selectedRow;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acsS_SchmeName: '',
        }
    });

    useEffect(() => {
        if (isEdit) {
            form.reset({
                acsS_SchmeName: selectedRow.acsS_SchmeName,
            });
        }
    }, [isEdit, selectedRow, form]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            ACSS_Id: selectedRow ? selectedRow.acsS_Id : 0
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: isEdit ? 'Updating record...' : 'Saving record...',
            success: (data: any) => {
                if (data?.message === 'Add' || data?.message === 'Update') {
                    onSuccess();
                    return `Record ${data.message}ed Successfully`;
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
                        name='acsS_SchmeName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject Scheme Name <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Scheme Name' {...field} />
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
