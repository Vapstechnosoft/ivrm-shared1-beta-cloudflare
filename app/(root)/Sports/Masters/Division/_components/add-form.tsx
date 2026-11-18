'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { useMasterDivisions } from '@/hooks/sports/useMasterDivisions';
import { masterDivisionSchema } from '@/schemas/sports/masters/division';
import { saveMasterDivision } from '@/server/sports/masters/division';
import type { IMasterDivision } from '@/types/sports/masters/division';
import { toast } from 'sonner';

interface AddMasterDivisionFormProps {
    selectedRow?: IMasterDivision;
    onSuccess?: () => void;
}

export default function AddMasterDivisionForm({ selectedRow, onSuccess }: AddMasterDivisionFormProps) {
    const { refetchAll } = useMasterDivisions();

    return (
        <GenericForm<IMasterDivision, (typeof masterDivisionSchema)['addOrUpdate']>
            schema={masterDivisionSchema.addOrUpdate}
            initialValues={{
                spccmD_Id: selectedRow?.spccmD_Id ?? 0,
                spccmD_DivisionName: selectedRow?.spccmD_DivisionName ?? '',
                spccmD_DivisionDescription: selectedRow?.spccmD_DivisionDescription ?? '',
                spccmD_ActiveFlag: selectedRow?.spccmD_ActiveFlag ?? true
            }}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterDivision(values);

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
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save division')) {
                        toast.error(error.message || 'Something went wrong');
                    }
                    throw error;
                }
            }}
            mode={selectedRow ? 'edit' : 'create'}
            successMessage={''}
            errorMessage={''}
            onSuccess={() => {
                refetchAll();
                onSuccess?.();
            }}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField name='spccmD_DivisionName' label='Division Name' placeholder='Enter Division Name' required />

                <GenericTextAreaField
                    name='spccmD_DivisionDescription'
                    label='Division Description'
                    placeholder='Enter Division Description'
                    required
                />
            </div>
        </GenericForm>
    );
}
