'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterFeeYearlyGroup, useMasterGetYearlyCategory } from '@/hooks/fees/useMasters';
import { YearlyGroupSchema } from '@/schemas/fees/masters';
import { toggleMasterclassYearlyCategory } from '@/server/fees/masters/fees_yearly_group';
import type { IMaasterFeesYearlyGrouping } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof YearlyGroupSchema.delete>;
interface ToggleYearColumnFormProps {
    rowData: IMaasterFeesYearlyGrouping;
    onClose: () => void;
}

export default function ToggleYearColumnForm({ rowData, onClose }: ToggleYearColumnFormProps) {
    const { refetchAll } = useMasterFeeYearlyGroup();
    const { refetchAll: refetchCategory } = useMasterGetYearlyCategory();

    const isActive = typeof rowData.fyG_ActiveFlag === 'number' ? rowData.fyG_ActiveFlag === 1 : Boolean(rowData.fyG_ActiveFlag);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(YearlyGroupSchema.delete),
        mode: 'onChange',
        defaultValues: {
            fyG_Id: String(rowData.fyG_Id ?? rowData.fmG_Id ?? 0)
        }
    });

    const closeDialog = () => {
        reset();
        onClose();
    };

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        const fyG_Id = Number(formData.fyG_Id || rowData.fyG_Id || rowData.fmG_Id || 0);
        const miId = Number(rowData.mI_Id ?? 0);

        if (!fyG_Id) return;
        if (!miId) {
            console.warn('miId not found on rowData, using default 30');
        }

        try {
            const response: any = await toggleMasterclassYearlyCategory(fyG_Id);

            const msg: string =
                (typeof response?.message === 'string' ? response.message : '') ||
                (typeof response?.returnval === 'string' && response.returnval !== 'false' && response.returnval !== 'true'
                    ? response.returnval
                    : '') ||
                (typeof response?.retrunMsg === 'string' ? response.retrunMsg : '') ||
                '';

            const isError =
                !response ||
                response.success === false ||
                response.returnval === false ||
                response.returnval === 'false' ||
                response.returnval === 'Failed' ||
                ['failed', 'error', 'invalid', 'cannot', 'can not', 'not found'].some(
                    (kw) =>
                        (typeof response?.message === 'string' && response.message.toLowerCase().includes(kw)) ||
                        (typeof response?.returnval === 'string' && response.returnval.toLowerCase().includes(kw))
                );

            if (isError) {
                toast.error(msg || 'Failed to update status', {
                    style: { color: '#dc2626', borderColor: '#fca5a5' }
                });
                return;
            }

            const isDeactivated = isActive || msg.toLowerCase().includes('deactivat');
            const displayMsg: string = msg || `Record ${isActive ? 'deactivated' : 'activated'} successfully`;

            if (isDeactivated) {
                toast.error(displayMsg, {
                    style: { color: '#dc2626', borderColor: '#fca5a5' }
                });
            } else {
                toast.success(displayMsg);
            }

            try {
                if (typeof refetchCategory === 'function') {
                    await refetchCategory();
                } else if (typeof refetchAll === 'function') {
                    await refetchAll();
                }
            } catch (e) {
                console.warn('Failed to refetch after toggle:', e);
            }
            closeDialog();
        } catch (error: any) {
            console.error('ToggleYearColumnForm error:', error);
            toast.error(error?.message || 'Failed to update status', {
                style: { color: '#dc2626', borderColor: '#fca5a5' }
            });
            closeDialog();
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Yearly Group Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fyG_Id')} defaultValue={String(rowData.fyG_Id ?? rowData.fmG_Id ?? 0)} />

                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>
                            {Array.isArray(rowData.fmG_GroupName)
                                ? rowData.fmG_GroupName.join(', ')
                                : String(rowData.fmG_GroupName ?? 'Yearly Group')}
                        </strong>
                        ?
                    </p>

                    {errors.fyG_Id && <FormError>{errors.fyG_Id.message}</FormError>}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
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
