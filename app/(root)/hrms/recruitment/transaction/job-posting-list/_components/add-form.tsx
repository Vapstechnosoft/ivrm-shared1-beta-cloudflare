'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveOrUpdateJobListVMS } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const jobPostingSchema = z.object({
    position: z.string().min(1, 'Position is required'),
    priority: z.string().min(1, 'Priority is required'),
    qualification: z.string().min(1, 'Qualification is required'),
    noOfPosition: z.string().min(1, 'No. of Position is required'),
    jobDescription: z.string().min(1, 'Job Description is required'),
    gender: z.string().min(1, 'Gender is required'),
    remark: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    department: z.string().min(1, 'Department is required'),
    positionType: z.string().min(1, 'Position Type is required'),
    mrfNo: z.string().min(1, 'MRF No. is required').regex(/^\d+$/, 'MRF No. must contain only numbers'),
    skill: z.string().min(1, 'Skill is required'),
    experienceFrom: z.string().min(1, 'Experience From is required'),
    experienceTo: z.string().min(1, 'Experience To is required'),
    age: z.string().min(1, 'Age is required'),
    reason: z.string().min(1, 'Reason is required'),
    writtenTest: z.boolean().optional(),
    technicalInterview: z.boolean().optional(),
    onlineTest: z.boolean().optional()
});

type FormFields = z.infer<typeof jobPostingSchema>;

interface AddJobPostingFormProps {
    basicDataResponse?: any;
    isLoadingBasicData?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

const AddJobPostingForm = memo(function AddJobPostingForm({
    basicDataResponse,
    isLoadingBasicData,
    onSuccess,
    onCancel,
    className = ''
}: AddJobPostingFormProps) {
    const { mutate: saveJobPosting, isPending: isSaving } = useSaveOrUpdateJobListVMS();

    const basicData = useMemo(() => basicDataResponse?.data || {}, [basicDataResponse]);
    const positionList = useMemo(() => basicData.masterPositionList || [], [basicData]);
    const priorityList = useMemo(() => basicData.masterPriorityList || [], [basicData]);
    const qualificationList = useMemo(() => basicData.masterQualification || [], [basicData]);
    const genderList = useMemo(() => basicData.masterGender || [], [basicData]);
    const locationList = useMemo(
        () => Array.from(new Map((basicData.masterLocation || []).map((item: any) => [item.hrmlO_LocationName, item])).values()),
        [basicData]
    );
    const departmentList = useMemo(() => basicData.masterDepartmentList || [], [basicData]);
    const positionTypeList = useMemo(() => basicData.masterPosTypeList || [], [basicData]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(jobPostingSchema),
        mode: 'onChange',
        defaultValues: {
            writtenTest: false,
            technicalInterview: false,
            onlineTest: false,
            location: ''
        }
    });

    const onSubmit: SubmitHandler<FormFields> = useCallback(
        async (data) => {
            const payload = {
                hrmrfr_Id: 0,
                hrmP_Id: Number(data.position),
                hrmD_Id: Number(data.department),
                hrmpR_Id: Number(data.priority),
                hrmpT_Id: Number(data.positionType),
                hrmC_Id: Number(data.qualification),
                ivrmmG_Id: Number(data.gender),
                hrmrfr_NoofPosition: Number(data.noOfPosition),
                hrmrfr_Skills: data.skill,
                hrmrfr_JobDesc: data.jobDescription,
                hrmrfr_EXPFrom: Number(data.experienceFrom),
                hrmrfr_EXPTo: Number(data.experienceTo),
                hrmrfr_Age: Number(data.age),
                hrmrfr_MRFNO: data.mrfNo,
                hrmrfr_WrittenTestFlg: !!data.writtenTest,
                hrmrfr_OnlineTestFlg: !!data.onlineTest,
                hrmrfr_TechnicalInterviewFlg: !!data.technicalInterview,
                hrmrfr_Reason: data.reason,
                hrmrfr_Remark: data.remark || '',
                hrmrfr_Attachment: '',
                hrmrfr_JobLocation: data.location,
                hrmrfr_Status: 'Pending',
                hrmrfr_HRComment: 'Pending',
                hrmrfr_MDComment: 'Pending'
            };

            console.log('payload', payload);

            saveJobPosting(payload, {
                onSuccess: (res) => {
                    if (res.success) {
                        reset();
                        onSuccess?.();
                    }
                }
            });
        },
        [saveJobPosting, reset, onSuccess]
    );

    const handleReset = useCallback(() => {
        reset();
    }, [reset]);

    if (isLoadingBasicData) {
        return (
            <div className='flex min-h-[300px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed py-12'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <p className='text-muted-foreground text-sm'>Loading form data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4 ${className}`}>
            <div className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Position:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='position'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Position--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positionList.map((item: any) => (
                                                <SelectItem key={item.hrmP_Id} value={item.hrmP_Id.toString()}>
                                                    {item.hrmP_Position}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.position && <FormError>{errors.position.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Priority:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='priority'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Priority--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorityList.map((item: any) => (
                                                <SelectItem key={item.hrmpR_Id} value={item.hrmpR_Id.toString()}>
                                                    {item.hrmP_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.priority && <FormError>{errors.priority.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Qualification:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='qualification'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Qualification--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {qualificationList.map((item: any) => (
                                                <SelectItem key={item.hrmC_Id} value={item.hrmC_Id.toString()}>
                                                    {item.hrmC_QulaificationName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.qualification && <FormError>{errors.qualification.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                No. of Position:<span className='text-red-500'>*</span>
                            </label>
                            <InputText
                                type='number'
                                placeholder='Enter number of positions'
                                {...register('noOfPosition')}
                                error={errors.noOfPosition?.message}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Job Description:<span className='text-red-500'>*</span>
                            </label>
                            <InputTextarea placeholder='Enter job description' rows={4} {...register('jobDescription')} />
                            {errors.jobDescription && <FormError>{errors.jobDescription.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Gender:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='gender'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Gender--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genderList.map((item: any) => (
                                                <SelectItem key={item.ivrmmG_Id} value={item.ivrmmG_Id.toString()}>
                                                    {item.ivrmmG_GenderName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.gender && <FormError>{errors.gender.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>Remark:</label>
                            <InputTextarea placeholder='Enter remarks' rows={3} {...register('remark')} />
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Location:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='location'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Location--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locationList.map((item: any) => (
                                                <SelectItem key={item.hrmlO_Id} value={item.hrmlO_LocationName}>
                                                    {item.hrmlO_LocationName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.location && <FormError>{errors.location.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Department:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Department--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentList.map((item: any) => (
                                                <SelectItem key={item.hrmD_Id} value={item.hrmD_Id.toString()}>
                                                    {item.hrmD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.department && <FormError>{errors.department.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Position Type:<span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='positionType'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Position Type--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positionTypeList.map((item: any) => (
                                                <SelectItem key={item.hrmpT_Id} value={item.hrmpT_Id.toString()}>
                                                    {item.hrmpT_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.positionType && <FormError>{errors.positionType.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                MRF No.:<span className='text-red-500'>*</span>
                            </label>
                            <InputText
                                type='number'
                                placeholder='Enter MRF number'
                                {...register('mrfNo')}
                                error={errors.mrfNo?.message}
                                onKeyDown={(e) => {
                                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Skill:<span className='text-red-500'>*</span>
                            </label>
                            <InputText placeholder='Enter required skills' {...register('skill')} error={errors.skill?.message} />
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Experience:<span className='text-red-500'>*</span>
                            </label>
                            <div className='flex items-center gap-2'>
                                <InputText
                                    type='number'
                                    placeholder='From'
                                    {...register('experienceFrom')}
                                    error={errors.experienceFrom?.message}
                                />
                                <span className='text-sm'>
                                    to :<span className='text-red-500'>*</span>
                                </span>
                                <InputText
                                    type='number'
                                    placeholder='To'
                                    {...register('experienceTo')}
                                    error={errors.experienceTo?.message}
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Age:<span className='text-red-500'>*</span>
                            </label>
                            <InputText type='number' placeholder='Enter age requirement' {...register('age')} error={errors.age?.message} />
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>
                                Reason:<span className='text-red-500'>*</span>
                            </label>
                            <InputText placeholder='Enter reason' {...register('reason')} error={errors.reason?.message} />
                        </div>
                        <div className='space-y-2'>
                            <label className='block font-medium text-sm'>Attachment:</label>
                            <Button type='button' variant='outline' className='w-full justify-start' disabled={isSaving}>
                                <Upload className='mr-2 h-4 w-4' />
                                Upload Employee Document
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Bottom Section - Checkboxes */}
                <div className='flex items-center gap-6 border-t pt-4'>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='writtenTest' {...register('writtenTest')} disabled={isSaving} />
                        <label htmlFor='writtenTest' className='cursor-pointer font-medium text-sm'>
                            Written Test
                        </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='technicalInterview' {...register('technicalInterview')} disabled={isSaving} />
                        <label htmlFor='technicalInterview' className='cursor-pointer font-medium text-sm'>
                            Technical Interview
                        </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='onlineTest' {...register('onlineTest')} disabled={isSaving} />
                        <label htmlFor='onlineTest' className='cursor-pointer font-medium text-sm'>
                            Online Test
                        </label>
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center justify-center gap-2 border-t pt-4'>
                <Button
                    type='submit'
                    disabled={isSaving}
                    className='bg-orange-500 text-white hover:bg-orange-600'
                    isLoading={isSaving}
                    loadingText='Saving...'>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save & Proceed
                    </div>
                </Button>
                <Button type='button' variant='destructive' onClick={handleReset} disabled={isSaving}>
                    <X className='mr-2 h-4 w-4' />
                    Clear
                </Button>
            </div>
        </form>
    );
});

export default AddJobPostingForm;
