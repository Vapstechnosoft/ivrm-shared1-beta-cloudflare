'use client';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetCandidateInterviewByIdVMS, useSaveInterviewerFeedback } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const interviewerFeedbackSchema = z.object({
    candidateId: z.string().min(1, 'Candidate is required'),
    interviewStatus: z.string().min(1, 'Interview is required'),
    interviewerId: z.string().min(1, 'Interviewer is required'),
    feedback: z.string().min(1, 'Feedback is required'),
    status: z.string().min(1, 'status is required'),
    interviewDate: z.string().min(1, 'Interview Date is required')
});
type FormFields = z.infer<typeof interviewerFeedbackSchema>;

const statusOptions = [
    { value: '1', label: 'Completed' },
    { value: '2', label: 'InProgress' },
    { value: '3', label: 'Upcoming' }
];
interface AddInterviewerFeedbackFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
    candidateList?: any[];
    interviewerList?: any[];
}
export default function AddInterviewerFeedbackForm({
    onSuccess,
    onCancel,
    className = '',
    candidateList,
    interviewerList
}: AddInterviewerFeedbackFormProps) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(interviewerFeedbackSchema),
        mode: 'onChange'
    });

    const { mutateAsync: saveInterviewerFeedback, isPending: isSaving } = useSaveInterviewerFeedback();
    const getRecordMutation = useGetCandidateInterviewByIdVMS();
    const { selectedRow, isEditFormOpen } = useFormContext();
    const isEditMode = isEditFormOpen && !!selectedRow;

    // const { data: response, isLoading: isLoadingData } =
    //   useGetCandidateAndInterviewers();

    // const candidates = response?.data?.candidates || [];
    // const interviewers = response?.data?.interviewers || [];

    // console.log("candiadates", candidateList)
    // console.log("interviewer", interviewerList)

    const [feedbackId, setFeedbackId] = useState<number>(0);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [candStatusId, setCandStatusId] = useState<number>(0);

    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            const id = selectedRow.hrcisC_Id || selectedRow.HRCISC_Id;
            console.log('selected row', selectedRow);
            if (id) {
                setIsLoadingDetails(true);
                getRecordMutation.mutate(id, {
                    onSuccess: (res) => {
                        const resData = res?.data || res;
                        if (resData) {
                            const editVal = resData.vmsEditValue?.[0];
                            const completed = resData.completedintvw?.[0];
                            // console.log("editVal",editVal)
                            // console.log("completed",completed)
                            setFeedbackId(editVal?.hrcmG_Id || editVal?.HRCIMG_Id || 0);
                            setCandStatusId(editVal?.hrciS_Id || editVal?.HRciS_Id || 0);

                            if (editVal) {
                                const candidateIdVal = editVal.hrcD_Id ?? editVal.HRCD_Id ?? '';
                                setValue('candidateId', candidateIdVal.toString());

                                const interviewerIdVal = editVal.hrcisC_Interviewer || 0;
                                const foundInterviewer = interviewerList?.find(
                                    (i: any) => i.id == interviewerIdVal || i.hrmE_Id == interviewerIdVal || i.HRME_Id == interviewerIdVal
                                );
                                const finalInterviewerId = foundInterviewer
                                    ? foundInterviewer.id || foundInterviewer.hrmE_Id || foundInterviewer.HRME_Id
                                    : interviewerIdVal;
                                setValue('interviewerId', finalInterviewerId?.toString());

                                // Set feedback if present
                                if (completed) {
                                    setValue('feedback', completed.hrciS_InterviewFeedBack || '');
                                    setValue('status', completed.hrciS_CandidateStatus || '');

                                    // Map date
                                    if (completed.hrciS_Datetime) {
                                        try {
                                            setValue('interviewDate', new Date(completed.hrciS_Datetime).toISOString());
                                        } catch (_) {
                                            setValue('interviewDate', completed.hrciS_Datetime);
                                        }
                                    } else if (editVal.hrcisC_InterviewDateTime) {
                                        try {
                                            setValue('interviewDate', new Date(editVal.hrcisC_InterviewDateTime).toISOString());
                                        } catch (_) {
                                            setValue('interviewDate', editVal.hrcisC_InterviewDateTime);
                                        }
                                    }

                                    // Map interview status
                                    const statusText = editVal.hrcisC_Status || '';
                                    if (statusText === 'Complete' || statusText === 'Completed') {
                                        setValue('interviewStatus', '1');
                                    } else if (statusText === 'InProgress') {
                                        setValue('interviewStatus', '2');
                                    } else {
                                        setValue('interviewStatus', '3');
                                    }
                                } else {
                                    setValue('feedback', '');
                                    setValue('status', '');
                                    if (editVal.hrcisC_InterviewDateTime) {
                                        try {
                                            setValue('interviewDate', new Date(editVal.hrcisC_InterviewDateTime).toISOString());
                                        } catch (_) {
                                            setValue('interviewDate', editVal.hrcisC_InterviewDateTime);
                                        }
                                    }

                                    const statusText = editVal.hrcisC_Status || '';

                                    if (statusText === 'Complete' || statusText === 'Completed') {
                                        setValue('interviewStatus', '1');
                                    } else if (statusText === 'InProgress') {
                                        setValue('interviewStatus', '2');
                                    } else {
                                        setValue('interviewStatus', '3');
                                    }
                                }
                            }
                        }
                        setIsLoadingDetails(false);
                    },
                    onError: () => {
                        setIsLoadingDetails(false);
                    }
                });
            }
        } else if (!isEditFormOpen) {
            reset({
                candidateId: '',
                interviewStatus: '',
                interviewerId: '',
                feedback: '',
                status: '',
                interviewDate: ''
            });
            setFeedbackId(0);
        }
    }, [isEditFormOpen, selectedRow, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const InterviewStatus = statusOptions.find((sta: any) => sta.value === data.interviewStatus);
        try {
            const payload = {
                hrciS_Id: isEditMode ? candStatusId : 0,

                // Interview Status Id
                hrcisC_Id: isEditMode ? selectedRow?.hrcisC_Id || 0 : Number(data.interviewStatus),

                // Candidate Id
                hrcD_Id: Number(data.candidateId),

                // Feedback
                hrciS_InterviewFeedBack: data.feedback,

                // Candidate Status
                hrciS_CandidateStatus: data.status,

                // Interview Status Text
                hrcisC_Status: isEditMode ? InterviewStatus?.label || 'Complete' : InterviewStatus?.label,

                // Interview Date
                hrciS_Datetime: data.interviewDate,

                // Interviewer Id / Group Id
                hrcmG_Id: feedbackId || 0
            };

            console.log('Payload:', payload);

            const response = await saveInterviewerFeedback(payload);
            // console.log("Response:", response);

            toast.success(isEditMode ? 'Interviewer feedback updated successfully' : 'Interviewer feedback added successfully');

            reset();

            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save interviewer feedback');
        }
    };

    if (isLoadingDetails) {
        return (
            <div className='flex h-48 items-center justify-center gap-2'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='text-muted-foreground'>Loading interview details...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4 ${className}`}>
            <div className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label className='block font-medium text-sm'>
                            Candidate Name:<span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='candidateId'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={'Select Candidate'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {candidateList?.map((candidate: any, index: number) => (
                                            <SelectItem
                                                key={`candidate-${candidate.hrcD_Id || candidate.HRCD_Id}-${index}`}
                                                value={(candidate.hrcD_Id || candidate.HRCD_Id)?.toString()}>
                                                {candidate.hrcD_FullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.candidateId && <FormError>{errors.candidateId.message}</FormError>}
                    </div>
                    <div className='space-y-2'>
                        <label className='block font-medium text-sm'>
                            Interview Status <span className='text-red-500'>*</span>
                        </label>
                        <Controller
                            name='interviewStatus'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Interview Status' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions?.map((status: any, index: number) => (
                                            <SelectItem key={`status-${status.value}-${index}`} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.interviewStatus && <FormError>{errors.interviewStatus.message}</FormError>}
                    </div>
                    <div className='space-y-2'>
                        <Label className='block font-medium text-sm'>
                            Interviewer Name:<span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='interviewerId'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={'Select Interviewer'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {interviewerList?.map((interviewer: any, index: number) => (
                                            <SelectItem
                                                key={`interviewer-${interviewer?.id || interviewer?.hrmE_Id || interviewer?.HRME_Id}-${index}`}
                                                value={(interviewer?.id || interviewer?.hrmE_Id || interviewer?.HRME_Id)?.toString()}>
                                                {interviewer?.hrmE_EmployeeFirstName} {interviewer?.hrmE_EmployeeLastName}{' '}
                                                {interviewer?.hrmE_EmployeeMiddleName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.interviewerId && <FormError>{errors.interviewerId.message}</FormError>}
                    </div>
                    {/* <div className="space-y-2">
            <label className="block font-medium text-sm">
              Rating <span className="text-red-500">*</span>
            </label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.rating && <FormError>{errors.rating.message}</FormError>}
          </div> */}

                    {/* Status */}
                    <div className='space-y-2'>
                        <label className='block font-medium text-sm'>
                            Status <span className='text-red-500'>*</span>
                        </label>

                        <Controller
                            name='status'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Status' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value='Short Listed'>Short Listed</SelectItem>
                                        <SelectItem value='Selected'>Selected</SelectItem>
                                        <SelectItem value='Rejected'>Rejected</SelectItem>
                                        <SelectItem value='Hold'>On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />

                        {errors.status && <FormError>{errors.status.message}</FormError>}
                    </div>

                    {/* Interview Date */}
                    <div className='space-y-2'>
                        <Label>
                            Interview Date <span className='font-bold text-red-500'>*</span>
                        </Label>

                        <Controller
                            name='interviewDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date) => field.onChange(date ? date.toISOString() : '')}
                                    // disabled={{ after: new Date() }}
                                    placeholder='Select Interview Date'
                                />
                            )}
                        />

                        {errors.interviewDate && <FormError>{errors.interviewDate.message}</FormError>}
                    </div>
                    <div className='space-y-2 md:col-span-2'>
                        <label className='block font-medium text-sm'>
                            Feedback <span className='text-red-500'>*</span>
                        </label>
                        <Textarea placeholder='Enter feedback' rows={4} {...register('feedback')} />
                        {errors.feedback && <FormError>{errors.feedback.message}</FormError>}
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center justify-center gap-2 border-t pt-4'>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='bg-orange-500 text-white hover:bg-orange-600'
                    isLoading={isSubmitting}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save & Proceed
                    </div>
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                        reset();
                        onCancel?.();
                    }}
                    disabled={isSubmitting}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
