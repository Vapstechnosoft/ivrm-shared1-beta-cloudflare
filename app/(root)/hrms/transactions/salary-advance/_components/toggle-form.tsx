'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useSalaryAdvance } from '@/hooks/hrms/useTransactions';
import { toggleSalaryAdvance } from '@/server/hrms/hrmsConfig/transaction/salary-advance';
import type { SalaryAdvanceGridItem } from '@/types/hrms/salary-advance';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    hresA_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleSalaryAdvanceFormProps {
    rowData: SalaryAdvanceGridItem;
    onClose: () => void;
}

export default function ToggleSalaryAdvanceForm({ rowData, onClose }: ToggleSalaryAdvanceFormProps) {
    const { refetchAll } = useSalaryAdvance();
    const isActive = rowData.hresA_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange',
        defaultValues: {
            hresA_Id: rowData.hresA_Id
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response: any = await toggleSalaryAdvance(Number(rowData.hresA_Id));

            if (response?.success) {
                toast.success(response?.message || `Salary advance ${isActive ? 'deactivated' : 'activated'} successfully`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} salary advance`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} salary advance`);
        }
    };

    const displayName = rowData.employeeName || rowData.masterEmployee?.hrmE_EmployeeFirstName || `Advance #${rowData.hresA_Id}`;

    return (
        <AdaptiveDialog title='Toggle Salary Advance Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('hresA_Id', { valueAsNumber: true })} defaultValue={rowData.hresA_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} salary advance for <strong>{displayName}</strong>?
                    </p>
                    <FormError>{errors.hresA_Id?.message}</FormError>
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
