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

interface AddMasterVenueFormProps {
    onSuccess?: () => void;
}

export default function AddMasterVenueForm({ onSuccess }: AddMasterVenueFormProps) {
    const { refetchAll } = useMasterVenues();

    const methods = useForm<IMasterEventVenue>({
        resolver: zodResolver(masterVenueSchema.addOrUpdate),
        defaultValues: {
            spccmeV_Id: 0,
            mI_Id: 2, // Assuming Institute ID
            spccmeV_EventVenue: '',
            spccmeV_EventVenueDesc: '',
            spccmeV_ActiveFlag: true
        },
        mode: 'onChange'
    });

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = methods;

    const onSubmit = async (values: IMasterEventVenue) => {
        try {
            const response = await saveMasterVenue(values);

            // Robust success check for IVRM backend responses
            const msg = (response?.message || response?.Message || '') as string;
            const isSuccess =
                response?.success ||
                response?.returnval == true ||
                response?.returnVal == true ||
                response?.returnVal === 'saved' ||
                response?.returnVal === 'updated' ||
                msg.toLowerCase() === 'saved' ||
                msg.toLowerCase() === 'updated' ||
                msg.toLowerCase().includes('success');

            if (isSuccess) {
                toast.success('Record saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else if (response?.returnVal === 'duplicate' || msg.toLowerCase() === 'duplicate') {
                toast.error('Record already exists');
            } else {
                const errorMsg = (response?.message || response?.Message || 'Failed to save record') as string;
                toast.error(errorMsg);
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
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
                        Create
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
