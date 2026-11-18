'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { type IBirthdayFormValues, birthdayFormSchema } from './schema';

interface BirthdayFormProps {
    initialData: any;
    onTypeChange: (type: string, values: any) => void;
    onChannelChange: (channels: { sms: boolean; email: boolean; Whatsapp: boolean }) => void;
    onSubmit: (values: IBirthdayFormValues) => void;
    onCancel: () => void;
    isLoading: boolean;
    totalRecords?: number;
}

export default function BirthdayForm({
    initialData,
    onTypeChange,
    onChannelChange,
    onSubmit,
    onCancel,
    isLoading,
    totalRecords = 0
}: BirthdayFormProps) {
    const form = useForm<IBirthdayFormValues>({
        resolver: zodResolver(birthdayFormSchema),
        defaultValues: {
            radioption: undefined,
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            sms: false,
            email: false,
            Whatsapp: false,
            selectedParticipants: []
        }
    });

    const isAnySelected = form.watch('sms') || form.watch('email') || form.watch('Whatsapp');
    const radioption = form.watch('radioption');

    // Watch for changes and notify parent
    const sms = form.watch('sms');
    const email = form.watch('email');
    const Whatsapp = form.watch('Whatsapp');

    React.useEffect(() => {
        onChannelChange({ sms, email, Whatsapp });
    }, [sms, email, Whatsapp, onChannelChange]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='fade-in slide-in-from-top-4 animate-in space-y-8 duration-500'>
                <Card className='overflow-hidden rounded-b-3xl border border-x-1 border-t-4 border-t-orange-400 border-b-1 bg-white shadow-sm'>
                    <CardContent className='p-8'>
                        <div className='flex flex-col items-center justify-center gap-12 rounded-[2rem] border bg-slate-50/50 py-8 md:flex-row'>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-slate-700 text-sm'>Please Select Radio Button:</span>
                                <span className='font-bold text-red-500'>*</span>
                            </div>

                            <FormField
                                control={form.control}
                                name='radioption'
                                render={({ field }) => (
                                    <FormItem className='space-y-0'>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    onTypeChange(val, form.getValues());
                                                }}
                                                value={field.value}
                                                className='flex items-center gap-8'>
                                                {['student', 'Staff', 'Alumni'].map((cat) => (
                                                    <div key={cat} className='group flex cursor-pointer items-center space-x-2'>
                                                        <RadioGroupItem
                                                            value={cat}
                                                            id={`cat-${cat}`}
                                                            className='h-5 w-5 border-slate-300 text-primary'
                                                        />
                                                        <label
                                                            htmlFor={`cat-${cat}`}
                                                            className='cursor-pointer font-bold text-slate-600 text-sm capitalize group-hover:text-primary'>
                                                            {cat === 'student' ? 'Student' : cat}
                                                        </label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Checkboxes Row - Only show when a radio button is selected */}
                        {radioption && (
                            <div className='zoom-in-95 fade-in mt-6 flex animate-in flex-col items-center justify-center gap-12 rounded-[2rem] border bg-slate-50/50 py-8 shadow-sm duration-500 md:flex-row'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-bold text-slate-700 text-sm'>Please Select Check Box:</span>
                                    <span className='font-bold text-red-500'>*</span>
                                </div>

                                <div className='flex items-center gap-8'>
                                    {[
                                        { name: 'sms', label: 'SMS' },
                                        { name: 'email', label: 'EMAIL' },
                                        { name: 'Whatsapp', label: 'WHATSAPP' }
                                    ].map((channel) => (
                                        <FormField
                                            key={channel.name}
                                            control={form.control}
                                            name={channel.name as any}
                                            render={({ field }) => (
                                                <div className='group flex cursor-pointer items-center space-x-3'>
                                                    <input
                                                        type='checkbox'
                                                        id={`check-${channel.name}`}
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className='h-5 w-5 cursor-pointer rounded border-slate-300 text-primary accent-primary focus:ring-primary'
                                                    />
                                                    <label
                                                        htmlFor={`check-${channel.name}`}
                                                        className={cn(
                                                            'cursor-pointer font-bold text-sm uppercase tracking-wider transition-colors',
                                                            field.value ? 'text-primary' : 'text-slate-500 group-hover:text-primary'
                                                        )}>
                                                        {channel.label}
                                                    </label>
                                                </div>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filtering Criteria - Removed as per request */}

                        {isAnySelected && (
                            <div className='zoom-in-95 mt-10 flex animate-in items-center justify-center gap-6 border-slate-100 border-t pt-10 duration-300'>
                                <Button
                                    type='submit'
                                    size='lg'
                                    disabled={isLoading || initialData == undefined || totalRecords === 0}
                                    className='h-14 rounded-xl px-12 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20'>
                                    {isLoading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <Send className='mr-3 h-4 w-4' /> Send Wishes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='lg'
                                    onClick={onCancel}
                                    className='h-14 rounded-xl px-10 font-black text-[10px] text-slate-400 uppercase tracking-widest'>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
