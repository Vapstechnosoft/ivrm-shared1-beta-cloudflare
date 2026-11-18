'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { masterEventSchema } from '@/schemas/sports/masters/events';
import { saveMasterEvent } from '@/server/sports/masters/events';
import type { IMasterEvent } from '@/types/sports/masters/events';
import { toast } from 'sonner';

interface AddMasterEventFormProps {
    onSuccess?: () => void;
}

export default function AddMasterEventForm({ onSuccess }: AddMasterEventFormProps) {
    return (
        <GenericForm<IMasterEvent, (typeof masterEventSchema)['addOrUpdate']>
            schema={masterEventSchema.addOrUpdate}
            initialValues={{
                spccmE_Id: 0,
                mI_Id: 2, // Assuming Institute ID
                spccmE_EventName: '',
                spccmE_EventNameDesc: '',
                spccmE_ActiveFlag: true
            }}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterEvent(values);

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
                    } else if (response?.returnVal === 'duplicate' || msg.toLowerCase() === 'duplicate') {
                        toast.error('Record already exists');
                        throw new Error('duplicate');
                    } else {
                        const errorMsg = (response?.message || response?.Message || 'Failed to save record') as string;
                        toast.error(errorMsg);
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save event')) {
                        toast.error(error.message || 'Something went wrong');
                    }
                    throw error;
                }
            }}
            mode='create'
            successMessage={''}
            errorMessage={''}
            onSuccess={onSuccess}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField name='spccmE_EventName' label='Event Name' placeholder='Enter Event Name' required />
                <GenericTextAreaField
                    name='spccmE_EventNameDesc'
                    label='Event Description'
                    placeholder='Enter Event Description'
                    required
                />
            </div>
        </GenericForm>
    );
}
