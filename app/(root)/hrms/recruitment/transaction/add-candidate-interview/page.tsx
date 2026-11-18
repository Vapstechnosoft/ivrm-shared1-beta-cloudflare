'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetCandidateAndInterviewers } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Save, X } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const candidateInterviewSchema = z.object({
    candidateId: z.string().min(1, 'Candidate is required'),
    interviewDate: z.string().min(1, 'Interview date is required'),
    interviewRound: z.string().min(1, 'Interview round is required'),
    interviewerId: z.string().min(1, 'Interviewer is required'),
    interviewVenue: z.string().min(1, 'Interview venue is required'),
    status: z.string().min(1, 'Status is required'),
    notifyByEmail: z.boolean().optional(),
    notifyBySMS: z.boolean().optional()
});

type FormFields = z.infer<typeof candidateInterviewSchema>;

export default function AddCandidateInterviewPage() {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(candidateInterviewSchema),
        mode: 'onChange',
        defaultValues: {
            candidateId: '',
            interviewDate: '',
            interviewRound: '',
            interviewerId: '',
            interviewVenue: '',
            status: '',
            notifyByEmail: false,
            notifyBySMS: false
        }
    });

    const { data: response, isLoading: isLoadingData } = useGetCandidateAndInterviewers();

    const candidates = response?.data?.candidates || [];
    const interviewers = response?.data?.interviewers || [];

    const onSubmit: SubmitHandler<FormFields> = async (_data) => {
        try {
            // TODO: Replace with actual API call
            toast.success('Candidate interview added successfully');
            reset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add candidate interview');
        }
    };

    return (
        <div className='container mx-auto p-4 md:p-6 lg:p-8'>
            <CollapsibleSection
                title='Add Candidate Interview'
                description='Fill in the details below to schedule a new candidate interview'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='shadow-lg'>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label className='block font-medium text-sm'>
                                    Candidate Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='candidateId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingData}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingData ? 'Loading...' : 'Select Candidate'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {candidates?.map((candidate: any, index: number) => (
                                                    <SelectItem
                                                        key={`candidate-${candidate.hrcD_Id}-${index}`}
                                                        value={candidate.hrcD_Id?.toString()}>
                                                        {candidate.hrcD_FullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.candidateId && <FormError>{errors.candidateId.message}</FormError>}
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label>
                                    Interview Date <span className='font-bold text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='interviewDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={{ after: new Date() }}
                                            placeholder='Select Interview Date'
                                        />
                                    )}
                                />
                                {errors.interviewDate && <FormError>{errors.interviewDate.message}</FormError>}
                            </div>

                            <div className='space-y-2'>
                                <Label className='block font-medium text-sm'>Notify Candidate By:</Label>
                                <div className='flex items-center space-x-6'>
                                    <div className='flex items-center space-x-2'>
                                        <Controller
                                            name='notifyByEmail'
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox id='notifyByEmail' checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor='notifyByEmail' className='text-sm'>
                                            E-Mail
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Controller
                                            name='notifyBySMS'
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox id='notifyBySMS' checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor='notifyBySMS' className='text-sm'>
                                            SMS
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label className='block font-medium text-sm'>
                                    Status:<span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='status'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Status' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Upcoming'>Upcoming</SelectItem>
                                                <SelectItem value='InProgress'>InProgress</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <FormError>{errors.status.message}</FormError>}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label className='block font-medium text-sm'>
                                    Interview Rounds:<span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='interviewRound'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Round' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Written'>Written</SelectItem>
                                                <SelectItem value='Technical'>Technical</SelectItem>
                                                <SelectItem value='HR Round'>HR Round</SelectItem>
                                                <SelectItem value='Department Head'>Department Head</SelectItem>
                                                <SelectItem value='Managerial'>Managerial</SelectItem>
                                                <SelectItem value='MD Round'>MD Round</SelectItem>
                                                <SelectItem value='Face to Face'>Face to Face</SelectItem>
                                                <SelectItem value='Third Party'>Third Party</SelectItem>
                                                <SelectItem value='Others'>Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.interviewRound && <FormError>{errors.interviewRound.message}</FormError>}
                            </div>

                            <div className='space-y-2'>
                                <Label className='block font-medium text-sm'>
                                    Interviewer Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='interviewerId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingData}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingData ? 'Loading...' : 'Select Interviewer'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {interviewers?.map((interviewer: any, index: number) => (
                                                    <SelectItem
                                                        key={`${interviewer?.id}-${interviewer?.hrmE_Id}-${index}`}
                                                        value={(interviewer?.hrmE_Id || interviewer?.id)?.toString() || ''}>
                                                        {interviewer.employee_fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.interviewerId && <FormError>{errors.interviewerId.message}</FormError>}
                            </div>

                            <div className='space-y-2'>
                                <Label className='block font-medium text-sm'>
                                    Interview Venue:<span className='text-red-500'>*</span>
                                </Label>
                                <Textarea placeholder='Enter interview venue' rows={4} {...register('interviewVenue')} />
                                {errors.interviewVenue && <FormError>{errors.interviewVenue.message}</FormError>}
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-row items-center justify-center gap-4 border-t pt-6'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='min-w-[120px] bg-orange-500 text-white hover:bg-orange-600'
                            isLoading={isSubmitting}
                            loadingText='Saving...'>
                            <Save className='mr-2 h-4 w-4' />
                            Save & Proceed
                        </Button>
                        <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting} className='min-w-[120px]'>
                            <X className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>
        </div>
    );
}
