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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSaveMasterSemester } from '@/hooks/college/useCollegeMasters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    AMSE_SEMName: z.string().trim().min(1, 'Please Enter Semester Name')
        .regex(/^[a-zA-Z0-9\s.]+$/, 'Only alphanumeric, space, and dot allowed'),
    AMSE_SEMOrder: z.coerce.number({
        required_error: 'Please Enter Semester Order',
        invalid_type_error: 'Please Enter Semester Order',
    }).min(1, 'Please Enter Semester Order').max(99999, 'Maximum 5 digits'),
    AMSE_Year: z.coerce.number({
        required_error: 'Please Enter Semester Year',
        invalid_type_error: 'Please Enter Semester Year',
    }).min(1, 'Please Enter Semester Year').max(99999, 'Maximum 5 digits'),
    radioption: z.enum(['General', 'Branch'], { required_error: 'Please Select Semester Type Flag' }),
    AMSE_SEMCode: z.string().trim().min(1, 'Please Enter Semester Code')
        .regex(/^[A-Za-z0-9\s]+$/, 'Alphanumeric and spaces only'),
    AMSE_SEMInfo: z.string().trim().min(1, 'Please Enter Semester Info')
        .regex(/^[A-Za-z0-9\s]+$/, 'Alphanumeric and spaces only'),
    radiodd: z.enum(['Odd', 'Even'], { required_error: 'Please Select Semester Odd / Even' })
});

type FormValues = z.infer<typeof formSchema>;

import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { InputNumber } from '@/components/ui/extension/input-number';
import { FormError, Label } from '@/components/ui/extension/field';
import { Controller } from 'react-hook-form';

export default function AddMasterSemesterForm({ onSuccess }: { onSuccess: () => void }) {
    const saveMutation = useSaveMasterSemester();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            AMSE_SEMName: '',
            AMSE_SEMOrder: undefined,
            AMSE_Year: undefined,
            radioption: undefined,
            AMSE_SEMCode: '',
            AMSE_SEMInfo: '',
            radiodd: undefined
        }
    });

    const onSubmit = async (values: FormValues) => {
        const payload = {
            amsE_Id: 0,
            amsE_SEMName: values.AMSE_SEMName,
            amsE_SEMInfo: values.AMSE_SEMInfo,
            amsE_SEMCode: values.AMSE_SEMCode,
            amsE_SEMTypeFlag: values.radioption,
            amsE_SEMOrder: values.AMSE_SEMOrder,
            amsE_Year: values.AMSE_Year,
            amsE_EvenOdd: values.radiodd
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Saving record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data?.message || 'Record Saved Successfully';
                }
                throw new Error(data?.message || 'Failed To Save Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    const { register, formState: { errors } } = form;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-6'>
                    <InputText
                        label='Semester Name'
                        required
                        placeholder='Enter Semester Name'
                        {...register('AMSE_SEMName')}
                        error={errors.AMSE_SEMName?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />
                    
                    <Controller
                        control={form.control}
                        name='AMSE_SEMOrder'
                        render={({ field, fieldState }) => (
                            <InputNumber
                                label='Semester Order'
                                required
                                placeholder='Enter Semester Order'
                                value={field.value as any}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                maxDigits={5}
                            />
                        )}
                    />

                    <Controller
                        control={form.control}
                        name='AMSE_Year'
                        render={({ field, fieldState }) => (
                            <InputNumber
                                label='Semester Year'
                                required
                                placeholder='Enter Semester Year'
                                value={field.value as any}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                maxDigits={5}
                            />
                        )}
                    />

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Semester Type Flag</Label>
                        <Controller
                            control={form.control}
                            name='radioption'
                            render={({ field, fieldState }) => (
                                <>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex space-x-6 mt-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="General" id="type-general" />
                                            <Label htmlFor="type-general" className="font-normal cursor-pointer">General</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Branch" id="type-branch" />
                                            <Label htmlFor="type-branch" className="font-normal cursor-pointer">Branch</Label>
                                        </div>
                                    </RadioGroup>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>
                
                <div className='space-y-6'>
                    <InputText
                        label='Semester Code'
                        required
                        placeholder='Enter Semester Code'
                        {...register('AMSE_SEMCode')}
                        error={errors.AMSE_SEMCode?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />
                    
                    <InputTextarea
                        label='Semester Info'
                        required
                        placeholder='Enter Semester Info'
                        rows={4}
                        {...register('AMSE_SEMInfo')}
                        error={errors.AMSE_SEMInfo?.message}
                    />

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Semester Odd / Even</Label>
                        <Controller
                            control={form.control}
                            name='radiodd'
                            render={({ field, fieldState }) => (
                                <>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex space-x-6 mt-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Odd" id="odd" />
                                            <Label htmlFor="odd" className="font-normal cursor-pointer">Odd</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Even" id="even" />
                                            <Label htmlFor="even" className="font-normal cursor-pointer">Even</Label>
                                        </div>
                                    </RadioGroup>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>
            
            <div className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-start'>
                <Button 
                    type='button' 
                    variant='outline' 
                    onClick={() => {
                        form.reset();
                        onSuccess();
                    }} 
                    disabled={saveMutation.isPending}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                >
                    Clear
                </Button>
                <Button 
                    type='submit' 
                    disabled={saveMutation.isPending}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                >
                    {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Save
                </Button>
            </div>
        </form>
    );
}
