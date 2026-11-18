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
import { useSaveSchemeType } from '@/hooks/college/useCollegeMasters';
import { IClgSubjectSchemeType } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
    acsT_SchmeType: z.string().min(1, 'Enter Scheme Type').max(30, 'Maximum 30 characters')
        .regex(/^[\s|a-zA-Z0-9|\.|\-|\/|\\]+$/, 'Invalid format'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSchemeTypeFormProps {
    selectedRow?: IClgSubjectSchemeType;
    onSuccess: () => void;
}

export default function AddSchemeTypeForm({ selectedRow, onSuccess }: AddSchemeTypeFormProps) {
    const saveMutation = useSaveSchemeType();
    const isEdit = !!selectedRow;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acsT_SchmeType: '',
        }
    });

    useEffect(() => {
        if (isEdit) {
            form.reset({
                acsT_SchmeType: selectedRow.acsT_SchmeType,
            });
        }
    }, [isEdit, selectedRow, form]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            ...values,
            ACST_Id: selectedRow ? selectedRow.acsT_Id : 0
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
                        name='acsT_SchmeType'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject Scheme Type <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Scheme Type' {...field} />
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
