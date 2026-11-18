'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { GenericInputField } from '@/components/ui/form/input-fields';
import { useMasterUOMs } from '@/hooks/sports/useMasterUOMs';
import { masterUOMSchema } from '@/schemas/sports/masters/uom';
import { saveMasterUOM } from '@/server/sports/masters/uom';
import type { IMasterUOM } from '@/types/sports/masters/uom';
import { toast } from 'sonner';

interface AddMasterUOMFormProps {
    selectedRow?: IMasterUOM;
    onSuccess?: () => void;
}

import { useFormContext } from 'react-hook-form';

function HiddenField({ name }: { name: string }) {
    const { register, watch } = useFormContext();
    const value = watch(name);
    return <input type='hidden' value={value || ''} {...register(name, { valueAsNumber: true })} />;
}

export default function AddMasterUOMForm({ selectedRow, onSuccess }: AddMasterUOMFormProps) {
    const { refetchAll } = useMasterUOMs();

    return (
        <GenericForm<IMasterUOM, (typeof masterUOMSchema)['addOrUpdate']>
            schema={masterUOMSchema.addOrUpdate}
            initialValues={{
                spccmuoM_Id: selectedRow?.spccmuoM_Id || (selectedRow as any)?.SPCCMUOM_Id || (selectedRow as any)?.spccmuom_Id || 0,
                spccmuoM_UOMName:
                    selectedRow?.spccmuoM_UOMName || (selectedRow as any)?.SPCCMUOM_UOMName || (selectedRow as any)?.spccmuom_UOMName || '',
                spccmuoM_ActiveFlag:
                    selectedRow?.spccmuoM_ActiveFlag ??
                    (selectedRow as any)?.SPCCMUOM_ActiveFlag ??
                    (selectedRow as any)?.spccmuom_ActiveFlag ??
                    true
            }}
            onSubmit={async (values) => {
                console.log('Form Submitted Values:', JSON.stringify(values, null, 2));
                try {
                    const response = await saveMasterUOM(values);

                    // Robust success check for IVRM backend responses
                    const msg = (response?.message || response?.Message || response?.msg || '') as string;
                    const isSuccess =
                        response?.success ||
                        response?.returnval == true ||
                        response?.returnVal == true ||
                        response?.returnVal === true ||
                        response?.returnVal_update === true ||
                        response?.returnVal === 'saved' ||
                        response?.returnVal === 'updated' ||
                        msg.toLowerCase() === 'saved' ||
                        msg.toLowerCase() === 'updated' ||
                        msg.toLowerCase().includes('success');

                    if (isSuccess) {
                        toast.success('Record saved successfully');
                    } else if (
                        response?.duplicate_UOM_name_bool ||
                        response?.returnVal === 'duplicate' ||
                        msg.toLowerCase() === 'duplicate'
                    ) {
                        toast.error('Record already exists');
                        throw new Error('duplicate');
                    } else {
                        const errorMsg =
                            (response?.msg as string) ||
                            (response?.message as string) ||
                            (response?.Message as string) ||
                            'Failed to save record';
                        toast.error(errorMsg);
                        throw new Error(errorMsg);
                    }
                } catch (error: any) {
                    if (error.message !== 'duplicate' && !error.message?.includes('Failed to save UOM')) {
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
            <HiddenField name='spccmuoM_Id' />
            <div className='grid grid-cols-1 gap-4'>
                <GenericInputField name='spccmuoM_UOMName' label='UOM Name' placeholder='Enter Unit of Measurement(UOM) Name...' required />
            </div>
        </GenericForm>
    );
}
