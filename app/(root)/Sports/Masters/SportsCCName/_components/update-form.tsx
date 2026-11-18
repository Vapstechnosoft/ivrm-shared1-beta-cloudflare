'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GenericInputField, GenericSelectField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { sportsCCNameSchema } from '@/schemas/sports/masters/sports-cc-name';
import { editSportsCCNameDetails, saveSportsCCName } from '@/server/sports/masters/sports-cc-name';
import type { SportsCCNameGroupDTO } from '@/types/sports/masters/sports-cc-name';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface UpdateFormProps {
    id: number;
    onSuccess: () => void;
    onCancel: () => void;
    groupNameList: SportsCCNameGroupDTO[];
}

export const UpdateForm = ({ id, onSuccess, onCancel, groupNameList }: UpdateFormProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<z.infer<typeof sportsCCNameSchema.addOrUpdate>>({
        resolver: zodResolver(sportsCCNameSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            spccmscC_Id: id,
            spccmsccG_Id: 0,
            spccmscC_SportsCCName: '',
            spccmscC_SportsCCDesc: '',
            spccmscC_SGFlag: 'Single',
            spccmscC_NoOfMembers: 1,
            spccmscC_RecHighLowFlag: 'High',
            spccmscC_RecInfo: '',
            spccmscC_MultiAttemptFlg: false,
            spccmscC_NoOfAttempts: null,
            tempDatas: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'tempDatas'
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const data: any = await editSportsCCNameDetails(id);
                if (data && data.success && data.data && data.data.editDetails && data.data.editDetails.length > 0) {
                    const detail = data.data.editDetails[0];
                    form.reset({
                        spccmscC_Id: detail.spccmscC_Id,
                        spccmsccG_Id: detail.spccmsccG_Id,
                        spccmscC_SportsCCName: detail.spccmscC_SportsCCName,
                        spccmscC_SportsCCDesc: detail.spccmscC_SportsCCDesc,
                        spccmscC_SGFlag: detail.spccmscC_SGFlag as 'Single' | 'Group',
                        spccmscC_NoOfMembers: detail.spccmscC_NoOfMembers,
                        spccmscC_RecHighLowFlag: detail.spccmscC_RecHighLowFlag as 'High' | 'Low',
                        spccmscC_RecInfo: detail.spccmscC_RecInfo,
                        spccmscC_MultiAttemptFlg: detail.spccmscC_MultiAttemptFlg,
                        spccmscC_NoOfAttempts: detail.spccmscC_NoOfAttempts,
                        tempDatas:
                            data.data.subEvents && data.data.subEvents.length > 0
                                ? data.data.subEvents.map((s: any) => ({
                                      spccmsccG_UnderEvent: s.spccmsccG_SportsCCGroupName || s.spccmsccG_UnderEvent || '',
                                      spccmsccG_Id: s.spccmsccG_Id
                                  }))
                                : [{ spccmsccG_UnderEvent: '' }]
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load details');
                onCancel();
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, form, onCancel]);

    const watchSGFlag = form.watch('spccmscC_SGFlag');
    const watchMultiAttempt = form.watch('spccmscC_MultiAttemptFlg');

    // Effect for SG Flag
    useEffect(() => {
        if (watchSGFlag === 'Single') {
            form.setValue('spccmscC_NoOfMembers', 1, { shouldValidate: true });
        }
    }, [watchSGFlag, form]);

    const onSubmit = async (values: z.infer<typeof sportsCCNameSchema.addOrUpdate>) => {
        try {
            const payload = {
                ...values,
                spccmscC_Id: id,
                spccmsccG_Id: Number(values.spccmsccG_Id),
                spccmscC_NoOfMembers: Number(values.spccmscC_NoOfMembers),
                spccmscC_NoOfAttempts: values.spccmscC_NoOfAttempts ? Number(values.spccmscC_NoOfAttempts) : null,
                tempDatas: values.tempDatas?.map((t) => ({
                    spccmsccG_UnderEvent: t.spccmsccG_UnderEvent || '',
                    spccmsccG_Id: t.spccmsccG_Id || 0
                }))
            };
            const result = await saveSportsCCName(payload);
            if (result.success) {
                toast.success(result.message);

                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        }
    };

    // Filter unique group list for dropdown
    const uniqueGroupList = Array.from(new Map(groupNameList?.map((item) => [item.spccmsccG_Id, item]) || []).values());

    if (isLoading) {
        return (
            <div className='flex justify-center p-10'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <GenericSelectField
                            name='spccmsccG_Id'
                            label='Group/Main Event'
                            required
                            options={uniqueGroupList.map((item) => ({
                                value: item.spccmsccG_Id,
                                label: (item as any).spccmsccG_SportsCCGroupName || (item as any).groupName
                            }))}
                        />

                        <GenericTextAreaField
                            name='spccmscC_SportsCCDesc'
                            label='Description'
                            placeholder='Enter Description...'
                            required
                        />

                        <GenericInputField
                            name='spccmscC_NoOfMembers'
                            label='No.Of Members'
                            placeholder='Enter No.Of Members...'
                            type='number'
                            required
                            disabled={watchSGFlag === 'Single'}
                        />

                        <FormField
                            control={form.control}
                            name='spccmscC_SGFlag'
                            render={({ field }) => (
                                <FormItem className='space-y-3 rounded-md border p-3'>
                                    <FormLabel>
                                        SG Flag <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className='flex space-x-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='Single' />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Single</FormLabel>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='Group' />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Group</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='spccmscC_RecHighLowFlag'
                            render={({ field }) => (
                                <FormItem className='space-y-3 rounded-md border p-3'>
                                    <FormLabel>
                                        High/Low Flag <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className='flex space-x-4'>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='High' />
                                                </FormControl>
                                                <FormLabel className='font-normal'>High</FormLabel>
                                            </FormItem>
                                            <FormItem className='flex items-center space-x-2 space-y-0'>
                                                <FormControl>
                                                    <RadioGroupItem value='Low' />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Low</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='spccmscC_RecInfo'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rec Info</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Rec Info' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <GenericInputField
                            name='spccmscC_SportsCCName'
                            label='Sports Name / Sub Event'
                            placeholder='Enter Sports Name...'
                            required
                        />

                        <div className='flex flex-col space-y-4 rounded-md border p-3'>
                            <FormField
                                control={form.control}
                                name='spccmscC_MultiAttemptFlg'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className='space-y-1 leading-none'>
                                            <FormLabel>Number Of Attempts?</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {watchMultiAttempt && (
                                <FormField
                                    control={form.control}
                                    name='spccmscC_NoOfAttempts'
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* <FormLabel>Number Of Attempts</FormLabel> */}
                                            <FormControl>
                                                <Input
                                                    placeholder='Enter Number Of Attempts...'
                                                    type='number'
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Sub Sub Event Dynamic Table */}
                        <div className='overflow-hidden rounded-md border'>
                            <table className='w-full text-left text-sm'>
                                <thead className='bg-muted text-muted-foreground'>
                                    <tr>
                                        <th className='w-16 p-2 text-center'>Sl.No.</th>
                                        <th className='p-2'>Sub Sub Event</th>
                                        <th className='w-20 p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className='border-t'>
                                            <td className='p-2 text-center'>{index + 1}</td>
                                            <td className='p-2'>
                                                <FormField
                                                    control={form.control}
                                                    name={`tempDatas.${index}.spccmsccG_UnderEvent`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder='Sub Sub Event' {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </td>
                                            <td className='p-2 text-center'>
                                                <div className='flex justify-center space-x-2'>
                                                    {/* Add Button only on last row */}
                                                    {index === fields.length - 1 && (
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() => append({ spccmsccG_UnderEvent: '' })}>
                                                            <Plus className='h-4 w-4 text-green-600' />
                                                        </Button>
                                                    )}

                                                    {/* Remove Button (if more than 1 row) */}
                                                    {fields.length > 1 && (
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() => remove(index)}
                                                            className='text-red-500'>
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className='mt-6 flex justify-center space-x-2'>
                    <Button type='submit' disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            'Update'
                        )}
                    </Button>
                    <Button type='button' variant='destructive' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
