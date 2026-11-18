'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { useMasterCompetitionLevels } from '@/hooks/sports/useMasterCompetitionLevels';
import { masterCompetitionLevelSchema } from '@/schemas/sports/masters/competition-level';
import { saveMasterCompetitionLevel } from '@/server/sports/masters/competition-level';
import type { IMasterCompetitionLevel } from '@/types/sports/masters/competition-level';
import { toast } from 'sonner';

interface AddMasterCompetitionLevelFormProps {
    selectedRow?: IMasterCompetitionLevel;
    onSuccess?: () => void;
}

export default function AddMasterCompetitionLevelForm({ selectedRow, onSuccess }: AddMasterCompetitionLevelFormProps) {
    const { refetchAll } = useMasterCompetitionLevels();

    return (
        <GenericForm<IMasterCompetitionLevel, (typeof masterCompetitionLevelSchema)['addOrUpdate']>
            schema={masterCompetitionLevelSchema.addOrUpdate}
            initialValues={{
                spccmcL_Id: selectedRow?.spccmcL_Id ?? 0,
                spccmcL_CompitionLevel: selectedRow?.spccmcL_CompitionLevel ?? '',
                spccmcL_CLDesc: selectedRow?.spccmcL_CLDesc ?? '',
                spccmcL_ActiveFlag: selectedRow?.spccmcL_ActiveFlag ?? true
            }}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterCompetitionLevel(values);

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
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save level')) {
                        toast.error(error.message || 'Something went wrong');
                    }
                    throw error;
                }
            }}
            mode={selectedRow ? 'edit' : 'create'}
            successMessage={''}
            errorMessage={''}
            onSuccess={() => {
                // Double ensure refetch happens
                refetchAll();
                onSuccess?.();
            }}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <GenericInputField
                    name='spccmcL_CompitionLevel'
                    label='Competition Level Name'
                    placeholder='Enter Competition Level Name...'
                    required
                />

                <GenericTextAreaField
                    name='spccmcL_CLDesc'
                    label='Competition Description'
                    placeholder='Enter Competition Description...'
                    required
                />
            </div>
        </GenericForm>
    );
}
