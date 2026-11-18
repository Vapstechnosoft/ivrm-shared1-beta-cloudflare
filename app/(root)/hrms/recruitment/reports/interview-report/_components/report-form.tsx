'use client';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Search, X } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
const interviewReportSchema = z
    .object({
        fromDate: z.string({ required_error: 'From Date is required' }).min(1, 'From Date is required'),
        toDate: z.string({ required_error: 'To Date is required' }).min(1, 'To Date is required'),
        status: z.string({ required_error: 'Status is required' }).min(1, 'Status is required'),
        interviewRound: z.string({ required_error: 'Interview Round is required' }).min(1, 'Interview Round is required')
    })
    .superRefine((data, ctx) => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (data.fromDate) {
            const from = new Date(data.fromDate);
            if (from > today) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Future dates are not allowed',
                    path: ['fromDate']
                });
            }
        }

        if (data.toDate) {
            const to = new Date(data.toDate);
            if (to > today) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Future dates are not allowed',
                    path: ['toDate']
                });
            }
        }

        if (data.fromDate && data.toDate) {
            const from = new Date(data.fromDate);
            const to = new Date(data.toDate);

            if (from > to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'From Date must be less than or equal to To Date',
                    path: ['fromDate']
                });
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'To Date must be greater than or equal to From Date',
                    path: ['toDate']
                });
            }
        }
    });
type FormFields = z.infer<typeof interviewReportSchema>;

const INTERVIEW_ROUNDS = [
    'All',
    'Written',
    'Technical',
    'HR Round',
    'Department Head',
    'Managerial',
    'MD Round',
    'Face to Face',
    'Third Party',
    'Others'
];

interface InterviewReportFormProps {
    onGenerateReport?: (filters: FormFields) => void;
    className?: string;
}
export default function InterviewReportForm({ onGenerateReport, className = '' }: InterviewReportFormProps) {
    const {
        reset,
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(interviewReportSchema),
        mode: 'onChange',
        defaultValues: {
            status: 'All',
            interviewRound: '',
            fromDate: '',
            toDate: ''
        }
    });
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // Call the parent handler to generate report
            await onGenerateReport?.(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset();
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4 ${className}`}>
            <div className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>
                                From Date:<span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative'>
                                <Controller
                                    name='fromDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date) => date > new Date()}
                                        />
                                    )}
                                />
                                {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>Status:</Label>
                            <Controller
                                name='status'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className='rounded-md border bg-gray-50 p-2'>
                                        <div className='flex gap-3'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='All' id='all' />
                                                <Label htmlFor='all' className='cursor-pointer font-normal text-sm'>
                                                    All
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='UpComing' id='upcoming' />
                                                <Label htmlFor='upcoming' className='cursor-pointer font-normal text-sm'>
                                                    UpComing
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='InProgress' id='inprogress' />
                                                <Label htmlFor='inprogress' className='cursor-pointer font-normal text-sm'>
                                                    InProgress
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Completed' id='completed' />
                                                <Label htmlFor='completed' className='cursor-pointer font-normal text-sm'>
                                                    Completed
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.status && <FormError>{errors.status.message}</FormError>}
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>
                                To Date:<span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative'>
                                <Controller
                                    name='toDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date) => date > new Date()}
                                        />
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>
                                Interview Rounds:<span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='interviewRound'
                                control={control}
                                render={({ field }) => (
                                    <Select key={field.value} onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Round' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INTERVIEW_ROUNDS.map((round) => (
                                                <SelectItem key={round} value={round}>
                                                    {round}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.interviewRound && <FormError>{errors.interviewRound.message}</FormError>}
                        </div>
                        {/* <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>Grade:</Label>
                            <Controller
                                name='grade'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--All--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='All'>--All--</SelectItem>
                                            <SelectItem value='A'>A</SelectItem>
                                            <SelectItem value='B'>B</SelectItem>
                                            <SelectItem value='C'>C</SelectItem>
                                            <SelectItem value='D'>D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div> */}
                    </div>
                </div>
            </div>
            {/* Action Buttons */}
            <div className='flex flex-row items-center justify-center gap-2 border-t pt-4'>
                <Button
                    type='submit'
                    isLoading={isSubmitting}
                    className='bg-orange-500 text-white hover:bg-orange-600'
                    disabled={isSubmitting}
                    prefix={<Search className='h-4 w-4' />}>
                    REPORT
                </Button>
                <Button type='button' variant='outline' onClick={() => handleReset()} prefix={<X className='h-4 w-4' />}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
