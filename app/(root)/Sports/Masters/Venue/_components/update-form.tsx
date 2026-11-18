'use client';

import { Button } from '@/components/ui/button';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { useMasterVenues } from '@/hooks/sports/useMasterVenues';
import { masterVenueSchema } from '@/schemas/sports/masters/venue';
import { saveMasterVenue } from '@/server/sports/masters/venue';
import type { IMasterEventVenue } from '@/types/sports/masters/venue';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateMasterVenueFormProps {
    selectedRow: IMasterEventVenue;
    onSuccess?: () => void;
}

export default function UpdateMasterVenueForm({ selectedRow, onSuccess }: UpdateMasterVenueFormProps) {
    const { refetchAll } = useMasterVenues();

    const methods = useForm<IMasterEventVenue>({
        resolver: zodResolver(masterVenueSchema.addOrUpdate),
        defaultValues: {
            ...selectedRow
        },
        mode: 'onChange'
    });

    const {
        handleSubmit,
        formState: { isSubmitting }
    } = methods;

    const onSubmit = async (values: IMasterEventVenue) => {
        try {
            const response = await saveMasterVenue(values);
            const msg = (response?.message || response?.Message || '') as string;
            const isSuccess =
                response?.success ||
                response?.returnval == true ||
                response?.returnVal == true ||
                response?.returnVal === 'updated' ||
                msg.toLowerCase() === 'updated' ||
                msg.toLowerCase().includes('success');

            if (isSuccess) {
                toast.success('Record updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(msg || 'Failed to update Master Venue');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update Master Venue');
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <GenericInputField name='spccmeV_EventVenue' label='Event Venue' placeholder='Enter Event Venue' required />
                    <GenericTextAreaField
                        name='spccmeV_EventVenueDesc'
                        label='Event Venue Description'
                        placeholder='Enter Event Venue Description'
                        required
                    />
                </div>

                <div className='flex justify-end gap-2'>
                    <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        Update
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
