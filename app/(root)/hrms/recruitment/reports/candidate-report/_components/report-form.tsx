'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetCandidateDropDown, useGetInstitutionByLogin } from '@/hooks/hrms/recruitment/masters/useMasters';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
const candidateReportSchema = z.object({
    institution: z.string().min(1, 'Institution is required'),
    candidateId: z.string().min(1, 'Candidate Name is required')
});
type FormFields = z.infer<typeof candidateReportSchema>;
interface CandidateReportFormProps {
    onGenerateReport?: (filters: FormFields) => void;
    onClear?: () => void;
    isLoading?: boolean;
    className?: string;
}

export default function CandidateReportForm({ onGenerateReport, isLoading = false, className = '', onClear }: CandidateReportFormProps) {
    const {
        reset,
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(candidateReportSchema),
        mode: 'onChange',
        defaultValues: {
            institution: '',
            candidateId: ''
        }
    });

    const [resetKey, setResetKey] = useState(0);

    const selectedInstitution = watch('institution');

    const { data: institutionData, isLoading: institutionLoading } = useGetInstitutionByLogin();
    const { data: candidateData, isLoading: candidateLoading } = useGetCandidateDropDown(!!selectedInstitution);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // Call the parent handler to generate report
            onGenerateReport?.(data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };
    const handlePrint = () => {
        window.print();
    };

    const handleClear = () => {
        reset();
        onClear?.();
        setResetKey((prev) => prev + 1);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4 ${className}`}>
            <div className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Institution */}
                    <div className='flex flex-col gap-1.5'>
                        <span className='font-medium text-sm'>
                            Institution <span className='text-red-500'>*</span>
                        </span>
                        <Controller
                            key={resetKey}
                            name='institution'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange} disabled={institutionLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={institutionLoading ? 'Loading Institution...' : 'Select Institution'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutionData?.data?.map((inst: any) => (
                                            <SelectItem key={inst.mI_Id} value={inst.mI_Id.toString()}>
                                                {inst.mI_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.institution && <FormError>{errors.institution.message}</FormError>}
                    </div>
                    {/* Candidate Name */}
                    <div className='space-y-2'>
                        <label className='block font-medium text-sm'>
                            Candidate Name:<span className='text-red-500'>*</span>
                        </label>
                        <Controller
                            key={resetKey}
                            name='candidateId'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={candidateLoading || !selectedInstitution}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={candidateLoading ? 'Loading Candidates...' : 'Select Candidate'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {candidateData?.data?.map((candidate: any) => (
                                            <SelectItem key={candidate.hrcD_Id} value={candidate.hrcD_Id.toString()}>
                                                {candidate.hrcD_FirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.candidateId && <FormError>{errors.candidateId.message}</FormError>}
                    </div>
                </div>
            </div>
            {/* Action Buttons */}
            <div className='flex flex-row items-center justify-center gap-2 border-t pt-4'>
                <Button type='submit' isLoading={isSubmitting || isLoading} className='bg-orange-500 text-white hover:bg-orange-600'>
                    <BarChart3 className='mr-2 h-4 w-4' />
                    REPORT
                </Button>
                <Button type='button' variant='outline' onClick={handleClear} disabled={isSubmitting || isLoading}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
                {/* <Button type='button' variant='outline' onClick={handlePrint} disabled={isSubmitting || isLoading}>
                    <Printer className='mr-2 h-4 w-4' />
                    PRINT
                </Button> */}
            </div>
        </form>
    );
}
