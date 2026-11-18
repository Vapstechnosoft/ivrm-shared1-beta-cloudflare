'use client';

import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
import { InputText } from '@/components/ui/extension/input-text';
import { preadmissionRegistrationSchema } from '@/schemas/admission/preadmission/transactions';
import { addPreadmissionRegistration } from '@/server/admission/preadmission/configuration/configuration';
import { login } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Ban, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const formSchema = preadmissionRegistrationSchema.add.extend({
    confirm_password: z.string().min(1, 'Confirm Password is required')
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password']
});

type FormFields = z.infer<typeof formSchema>;

interface AddPreadmissionRegistrationFormProps {
    sub_domain: string;
    closeDialog: () => void;
}

export default function AddPreadmissionRegistrationForm({ sub_domain, closeDialog }: AddPreadmissionRegistrationFormProps) {
    const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        mode: 'onChange'
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        const { mobileno, confirm_password, ...filteredData } = data;
        const payload = {
            sub_domain: sub_domain,
            ...filteredData,
            mobileno: mobileno.toString()
        };

        try {
            const response = await addPreadmissionRegistration(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                setPhotoPreview(null);
                closeDialog();
            } else {
                toast.error(response.message);
                return;
            }
        } catch (error: any) {
            toast.error(error.message);
            return;
        }

        // Auto-login after successful registration
        const loginRes = await login({
            values: {
                email: data.username,
                password: data.password
            },
            callbackUrl: '/admission/preadmission/dashboard'
        });

        if (loginRes?.success) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = loginRes.redirectTo || '/admission/preadmission/dashboard';
        } else if (loginRes?.error) {
            toast.error(loginRes.error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <AdaptiveBody className='flex flex-col gap-4'>
                <div className="flex flex-col items-center mb-2">
                    <div className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden mb-0">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs text-gray-400">No Photo</span>
                        )}
                    </div>
                    <label className="bg-[#2c5282] text-white px-3 py-1 text-xs font-semibold cursor-pointer w-24 text-center mt-[-1px]">
                        Upload Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                </div>

                <InputText
                    label='Name'
                    required
                    id='name'
                    {...register('name')}
                    error={errors.name?.message}
                    requiredTooltip='Name is mandatory. Please fill it.'
                />

                <InputText
                    label='Email'
                    required
                    id='email'
                    {...register('email_id')}
                    error={errors.email_id?.message}
                    requiredTooltip='Email is mandatory. Please fill it.'
                />

                <div className='group flex flex-col gap-1.5'>
                    <Controller
                        name='mobileno'
                        control={control}
                        render={({ field }) => (
                            <MobileNumberInput
                                label='Mobile No.'
                                required
                                id='mobileno'
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                type='number'
                                showSpinner={false}
                                requiredTooltip='Mobile No. is mandatory. Please fill it.'
                            />
                        )}
                    />
                    {errors.mobileno && <FormError>{errors.mobileno.message}</FormError>}
                </div>

                <InputText
                    label='Username'
                    required
                    id='username'
                    {...register('username')}
                    error={errors.username?.message}
                    requiredTooltip='Username is mandatory. Please fill it.'
                />

                <div className='group flex flex-col gap-1.5'>
                    <label
                        htmlFor='password'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1'>
                        Password
                        <span className='font-bold text-red-500'>*</span>
                        <span className='text-blue-700 font-normal ml-1 text-xs'>Ex:Password@123</span>
                    </label>
                    <div className='relative'>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <FormError>{errors.password.message}</FormError>}
                </div>

                <div className='group flex flex-col gap-1.5'>
                    <label
                        htmlFor='confirm_password'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1'>
                        Confirm Password
                        <span className='font-bold text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                        <input
                            id='confirm_password'
                            type={showConfirmPassword ? 'text' : 'password'}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            {...register('confirm_password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirm_password && <FormError>{errors.confirm_password.message}</FormError>}
                </div>

                <FormError>{errors.root?.message}</FormError>
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button variant='outline' type='button' onClick={() => closeDialog()} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Ban className='w-4 h-4 mr-2' /> Cancel
                </Button>
                <Button type='submit' isLoading={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                    <User className='w-4 h-4 mr-2' /> Register
                </Button>
            </AdaptiveFooter>
        </form>
    );
}
