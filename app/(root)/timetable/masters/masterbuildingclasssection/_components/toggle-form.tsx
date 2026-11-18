'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterBuildingClasssection } from '@/hooks/timetable/useMasters';
import { masterBuildingClassSectionSchema } from '@/schemas/timetable/masters';
import { ToggleMasterBuildingClassSection } from '@/server/timetable/masters/masterbuilding';
import type { IMasterBuildClassSectionGrid } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterBuildingClassSectionSchema.delete>;

interface ToggleMasterBuildingClassSectionFormProps {
    rowData: IMasterBuildClassSectionGrid;
    onClose: () => void;
}

export default function ToggleMasterBuildingClassSectionForm({ rowData, onClose }: ToggleMasterBuildingClassSectionFormProps) {
    const { refetchAll } = useMasterBuildingClasssection();
    const isActive = rowData.ttmbcS_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterBuildingClassSectionSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await ToggleMasterBuildingClassSection(Number(rowData.ttmbcS_Id));
            if (response.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Building Class Section' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmbcS_Id')} defaultValue={rowData.ttmbcS_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.ttmB_BuildingName}</strong>?
                    </p>
                    <FormError>{errors.ttmbcS_Id?.message}</FormError>
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
