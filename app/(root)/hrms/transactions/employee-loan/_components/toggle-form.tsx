'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useEmployeeLoan } from '@/hooks/hrms/useTransactions';
import { toggleEmployeeLoan } from '@/server/hrms/hrmsConfig/transaction/employee-loan';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    HREL_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleEmployeeLoanFormProps {
    rowData: EmployeeLoanItem;
    onClose: () => void;
}

export default function ToggleEmployeeLoanForm({ rowData, onClose }: ToggleEmployeeLoanFormProps) {
    const { refetchAll } = useEmployeeLoan();
    const isActive = rowData.HREL_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange',
        defaultValues: {
            HREL_Id: rowData.HREL_Id
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response: any = await toggleEmployeeLoan(Number(rowData.HREL_Id));

            if (response?.success) {
                toast.success(response?.message || `Employee loan ${isActive ? 'deactivated' : 'activated'} successfully`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} employee loan`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} employee loan`);
        }
    };

    const loanDisplayName = rowData.EmployeeFullName || rowData.HRME_EmployeeFirstName || `Loan #${rowData.HREL_Id}`;

    return (
        <AdaptiveDialog title='Toggle Employee Loan Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('HREL_Id', { valueAsNumber: true })} defaultValue={rowData.HREL_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} employee loan for <strong>{loanDisplayName}</strong>?
                    </p>
                    <FormError>{errors.HREL_Id?.message}</FormError>
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
