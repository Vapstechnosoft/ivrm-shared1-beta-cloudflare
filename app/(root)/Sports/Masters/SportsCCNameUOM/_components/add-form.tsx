'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveMasterSportsCCNameUOM } from '@/server/sports/masters/sports-cc-name-uom';
import { type ISportsCCName, type IUOM, MasterSportsCCNameUOMSchema } from '@/types/sports/masters/sports-cc-name-uom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddMasterSportsCCNameUOMFormProps {
    onSuccess: () => void;
    sportsCCNameList: ISportsCCName[];
    uomList: IUOM[];
}

export default function AddMasterSportsCCNameUOMForm({ onSuccess, sportsCCNameList, uomList }: AddMasterSportsCCNameUOMFormProps) {
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof MasterSportsCCNameUOMSchema>>({
        resolver: zodResolver(MasterSportsCCNameUOMSchema),
        defaultValues: {
            spccmsccuoM_Id: 0,
            spccmscC_Id: undefined,
            spccmuoM_Id: undefined,
            spccmsccuoM_ActiveFlag: true
        },
        mode: 'onChange'
    });

    const onSubmit = async (values: z.infer<typeof MasterSportsCCNameUOMSchema>) => {
        try {
            const result = await saveMasterSportsCCNameUOM(values);
            const msg = (result?.message || result?.Message || '') as string;
            const isSuccess =
                result.success ||
                result?.returnval == true ||
                result?.returnVal == true ||
                result?.returnVal === 'saved' ||
                result?.returnVal === 'updated' ||
                msg.toLowerCase() === 'saved' ||
                msg.toLowerCase() === 'updated' ||
                msg.toLowerCase().includes('success');

            if (isSuccess) {
                toast.success('Record saved successfully');
                queryClient.invalidateQueries({ queryKey: ['master-sports-cc-name-uom'] });
                form.reset();
                onSuccess();
            } else if (result?.returnVal === 'duplicate' || msg.toLowerCase() === 'duplicate') {
                toast.error('Record already exists');
            } else {
                const errorMsg = (result?.message || result?.Message || 'Failed to save record') as string;
                toast.error(errorMsg);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const onError = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        const message = firstError?.message || 'Please fix the validation errors before saving';
        toast.error(message);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className='space-y-4 pt-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='spccmscC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Sports Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}
                                    searchable={true}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Sports Name--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sportsCCNameList.map((item) => (
                                            <SelectItem key={item.spccmscC_Id} value={item.spccmscC_Id.toString()}>
                                                {item.spccmscC_SportsCCName}
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
                        name='spccmuoM_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    UOM <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}
                                    searchable={true}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select UOM--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {uomList.map((item) => (
                                            <SelectItem key={item.spccmuoM_Id} value={item.spccmuoM_Id.toString()}>
                                                {item.spccmuoM_UOMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={() => {
                            form.reset();
                            onSuccess();
                        }}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
