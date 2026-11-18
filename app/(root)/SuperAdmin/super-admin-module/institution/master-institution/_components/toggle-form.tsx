'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { institutionMasterSchema } from '@/schemas/super-admin/super-admin-module/institution/master-institution';
import { activateDeactivateMasterInstitution } from '@/server/super-admin/super-admin-module/institution/master-institution';
import type { IMasterInstitution } from '@/types/super-admin/super-admin-module/institution/master-institution';

import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof institutionMasterSchema.delete>;

interface ToggleMasterInstitutionFormProps {
    rowData: IMasterInstitution;
    onClose: () => void;
    onRefresh?: () => void;
}

export default function ToggleMasterInstitutionForm({ rowData, onClose, onRefresh }: ToggleMasterInstitutionFormProps) {
    const isActive = Boolean(rowData.mI_ActiveFlag);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(institutionMasterSchema.delete),
        defaultValues: {
            mI_Id: rowData.mI_Id
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await activateDeactivateMasterInstitution(data.mI_Id);

            if (response.success) {
                toast.success(response.message || `Institution ${isActive ? 'deactivated' : 'activated'} successfully`);
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
        <AdaptiveDialog title='Toggle Institution Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('mI_Id')} defaultValue={rowData.mI_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.mI_Name}</strong>?
                    </p>
                    <FormError>{errors.mI_Id?.message}</FormError>
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
