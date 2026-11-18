'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { useMasterPrograms } from '@/hooks/sports/useMasterPrograms';
import { masterProgramSchema } from '@/schemas/sports/masters/program';
import { saveMasterProgram } from '@/server/sports/masters/program';
import type { IMasterProgram } from '@/types/sports/masters/program';
import { toast } from 'sonner';

interface AddMasterProgramFormProps {
    onSuccess?: () => void;
}

export default function AddMasterProgramForm({ onSuccess }: AddMasterProgramFormProps) {
    const { refetchAll } = useMasterPrograms();

    return (
        <GenericForm<IMasterProgram, (typeof masterProgramSchema)['addOrUpdate']>
            schema={masterProgramSchema.addOrUpdate}
            initialValues={{
                spccpM_Id: 0,
                mI_Id: 1, // Institute ID
                spccpM_Name: '',
                spccpM_Description: '',
                spccpM_ActiveFlag: true
            }}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterProgram(values);

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
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save program')) {
                        toast.error(error.message || 'Something went wrong');
                    }
                    throw error;
                }
            }}
            mode='create'
            successMessage={''}
            errorMessage={''}
            onSuccess={() => {
                refetchAll();
                onSuccess?.();
            }}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField name='spccpM_Name' label='Program Name' placeholder='Enter Program Name' required />
                <GenericTextAreaField
                    name='spccpM_Description'
                    label='Program Description'
                    placeholder='Enter Program Description'
                    required
                />
            </div>
        </GenericForm>
    );
}
