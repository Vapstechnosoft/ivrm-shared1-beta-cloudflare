'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { useMasterComplexity, useSaveMasterComplexity } from '@/hooks/exam/online-exam/useMasters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    lpmcomP_ComplexityName: z.string().min(1, 'Complexity Name is required'),
    lpmcomP_ComplexityDesc: z.string().optional(),
    lpmcomP_DefaultFlg: z.boolean().default(false)
});

type FormFields = z.infer<typeof formSchema>;

interface AddMasterComplexityFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AddMasterComplexityForm({ onSuccess, onCancel }: AddMasterComplexityFormProps) {
    const { refetch } = useMasterComplexity(undefined, { enabled: false });
    const saveMutation = useSaveMasterComplexity();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            lpmcomP_ComplexityName: '',
            lpmcomP_ComplexityDesc: '',
            lpmcomP_DefaultFlg: false
        },
        mode: 'onChange'
    });

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                LPMCOMP_Id: 0,
                LPMCOMP_ComplexityName: data.lpmcomP_ComplexityName,
                LPMCOMP_ComplexityDesc: data.lpmcomP_ComplexityDesc || '',
                LPMCOMP_DefaultFlg: data.lpmcomP_DefaultFlg
            };

            const response = await saveMutation.mutateAsync(payload);
            const message = response?.message || response?.data?.message;
            const returnval = response?.returnval ?? response?.data?.returnval;

            if (message === 'Duplicate') {
                toast.error('Complexity Name already exists! (Duplicate)');
                return;
            }

            if (returnval === true || message === 'Add' || (response?.success && message !== 'Duplicate')) {
                toast.success('Complexity created successfully!');
                reset();
                refetch();
                onSuccess();
            } else {
                toast.error(message || response?.error || 'Failed to create complexity');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while creating complexity');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Complexity Name */}
                <div className='space-y-2'>
                    <Label htmlFor='lpmcomP_ComplexityName'>
                        Complexity Name <span className='text-destructive'>*</span>
                    </Label>
                    <InputText id='lpmcomP_ComplexityName' {...register('lpmcomP_ComplexityName')} placeholder='e.g., Easy, Medium, Hard' />
                    {errors.lpmcomP_ComplexityName && <p className='text-destructive text-xs'>{errors.lpmcomP_ComplexityName.message}</p>}
                </div>

                {/* Default Flag Checkbox */}
                <div className='flex items-center pt-8'>
                    <label className='flex cursor-pointer items-center gap-2 font-medium text-sm'>
                        <input
                            type='checkbox'
                            {...register('lpmcomP_DefaultFlg')}
                            className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                        />
                        Default Complexity Flag
                    </label>
                </div>

                {/* Complexity Description */}
                <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='lpmcomP_ComplexityDesc'>Complexity Description</Label>
                    <InputTextarea
                        id='lpmcomP_ComplexityDesc'
                        {...register('lpmcomP_ComplexityDesc')}
                        rows={3}
                        placeholder='Enter complexity description...'
                    />
                    {errors.lpmcomP_ComplexityDesc && <p className='text-destructive text-xs'>{errors.lpmcomP_ComplexityDesc.message}</p>}
                </div>
            </div>

            {/* Form Actions */}
            <div className='flex justify-end gap-3 border-t pt-4'>
                <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Complexity'}
                </Button>
            </div>
        </form>
    );
}
