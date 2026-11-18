'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { institutionSubscriptionSchema } from '@/schemas/super-admin/super-admin-module/institution/institution-subscription';
import { activateDeactivateInstitutionSubscription } from '@/server/super-admin/super-admin-module/institution/institution-subscription';
import type { IInstitutionSubscription } from '@/types/super-admin/super-admin-module/institution/institution-subscription';

import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof institutionSubscriptionSchema.delete>;

interface ToggleInstitutionSubscriptionFormProps {
    rowData: IInstitutionSubscription;
    onClose: () => void;
    onRefresh?: () => void;
}

export default function ToggleInstitutionSubscriptionForm({
    rowData,
    onClose,
    onRefresh
}: ToggleInstitutionSubscriptionFormProps) {
    const isActive = Boolean(rowData.misV_ActiveFlag);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(institutionSubscriptionSchema.delete),
        defaultValues: {
            misV_Id: rowData.misV_Id
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await activateDeactivateInstitutionSubscription(data.misV_Id);

            if (response.success) {
                toast.success(response.message || `Subscription ${isActive ? 'deactivated' : 'activated'} successfully`);
                onRefresh?.();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Subscription Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('misV_Id')} defaultValue={rowData.misV_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} subscription for{' '}
                        <strong>{rowData.institutionName || 'this institution'}</strong>?
                    </p>
                    <FormError>{errors.misV_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
