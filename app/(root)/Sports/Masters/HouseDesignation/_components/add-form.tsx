'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { masterHouseDesignationSchema } from '@/schemas/sports/masters/house-designation';
import { saveMasterHouseDesignation } from '@/server/sports/masters/house-designation';
import type { IMasterHouseDesignation } from '@/types/sports/masters/house-designation';
import { toast } from 'sonner';

interface AddMasterHouseDesignationFormProps {
    onSuccess?: () => void;
}

export default function AddMasterHouseDesignationForm({ onSuccess }: AddMasterHouseDesignationFormProps) {
    return (
        <GenericForm<IMasterHouseDesignation, (typeof masterHouseDesignationSchema)['addOrUpdate']>
            schema={masterHouseDesignationSchema.addOrUpdate}
            initialValues={{
                spccmhD_Id: 0,
                mI_Id: 0,
                spccmhD_DesignationName: '',
                spccmhD_DesignationDescription: '',
                spccmhD_ActiveFlag: true
            }}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterHouseDesignation(values);

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
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save record')) {
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
                <GenericInputField name='spccmhD_DesignationName' label='Designation Name' placeholder='Enter Designation Name' required />
                <GenericTextAreaField
                    name='spccmhD_DesignationDescription'
                    label='Designation Description'
                    placeholder='Enter Designation Description'
                    required
                />
            </div>
        </GenericForm>
    );
}
