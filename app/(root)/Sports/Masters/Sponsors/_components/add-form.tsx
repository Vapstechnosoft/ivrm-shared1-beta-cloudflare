'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField, GenericTextAreaField } from '@/components/ui/form/input-fields';
import { useMasterSponsors } from '@/hooks/sports/useMasterSponsors';
import { masterSponsorSchema } from '@/schemas/sports/masters/sponsors';
import { saveMasterSponsor } from '@/server/sports/masters/sponsors';
import type { IMasterSponsor } from '@/types/sports/masters/sponsors';
import { toast } from 'sonner';

interface AddMasterSponsorFormProps {
    selectedRow?: IMasterSponsor;
    onSuccess?: () => void;
}

export default function AddMasterSponsorForm({ selectedRow, onSuccess }: AddMasterSponsorFormProps) {
    const { refetchAll } = useMasterSponsors();

    return (
        <GenericForm<IMasterSponsor, (typeof masterSponsorSchema)['addOrUpdate']>
            schema={masterSponsorSchema.addOrUpdate}
            initialValues={{
                spccmsP_Id: selectedRow?.spccmsP_Id ?? 0,
                spccmsP_SponsorName: selectedRow?.spccmsP_SponsorName ?? '',
                spccmsP_ContactPerson: selectedRow?.spccmsP_ContactPerson ?? '',
                spccmsP_ContactNo: selectedRow?.spccmsP_ContactNo ?? '',
                spccmsP_SponsorDetails: selectedRow?.spccmsP_SponsorDetails ?? '',
                spccmsP_ActiveFlag: selectedRow?.spccmsP_ActiveFlag ?? true
            }}
            onSubmit={async (values) => {
                try {
                    const response = await saveMasterSponsor(values);
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
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save sponsor')) {
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
                <GenericInputField name='spccmsP_SponsorName' label='Sponsor Name' placeholder='Enter Sponsor Name' required />

                <GenericInputField name='spccmsP_ContactPerson' label='Contact Person' placeholder='Enter Contact Person' required />

                <GenericInputField name='spccmsP_ContactNo' label='Contact No.' placeholder='Enter Contact No' required />

                <GenericTextAreaField name='spccmsP_SponsorDetails' label='Sponsor Details' placeholder='Enter Sponsor Details' required />
            </div>
        </GenericForm>
    );
}
