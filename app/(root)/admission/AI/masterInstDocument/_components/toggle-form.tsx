'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { masterInstDocumentSchema } from '@/schemas/admission/AI/masterInstDocument';
import { toggleMasterInstDocument } from '@/server/admission/AI/masterInstDocument';
import type { IMasterInstDocumentList } from '@/types/admission/AI/masterInstDocument';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';

type FormFields = z.infer<typeof masterInstDocumentSchema.delete>;

interface ToggleMasterInstDocumentFormProps {
    rowData: IMasterInstDocumentList;
    onClose: () => void;
}

export default function ToggleMasterInstDocumentForm({ rowData, onClose }: ToggleMasterInstDocumentFormProps) {
    const queryClient = useQueryClient();
    const isActive = rowData.activeFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstDocumentSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await toggleMasterInstDocument(Number(rowData.aiD_Id));

            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: [ADMISSION_QUERY_KEYS.MASTER_INST_DOCUMENT] });
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Toggle AI Master Document Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('aiD_Id')} defaultValue={rowData.aiD_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.fileName}</strong>?
                    </p>
                    <FormError>{errors.aiD_Id?.message}</FormError>
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
