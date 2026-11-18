'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useSubjectRestrictionPeriodStaffGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { masterDaySchema } from '@/schemas/timetable/masters';
import { ToggleSubjectPeriodStaff } from '@/server/timetable/constraints/subjectrestriction';
import type { SubjectRestrictionPeriodStaffGridData } from '@/types/timetable/constraints/subjectRestrictions';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterDaySchema.delete>;

interface ToggleSubjectPeriodStaffProps {
    rowData: SubjectRestrictionPeriodStaffGridData;
    onClose: () => void;
}

export default function PeriodStaffToggle({ rowData, onClose }: ToggleSubjectPeriodStaffProps) {
    const { refetchAll } = useSubjectRestrictionPeriodStaffGridData({ ASMAY_Id: 0, TTMC_Id: 0 });
    const isActive = rowData.ttrpS_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterDaySchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await ToggleSubjectPeriodStaff(Number(rowData.ttrpS_Id));

            if (response.success || response.returnval === true) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Period Staff Constraint' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmD_Id')} defaultValue={rowData.ttrpS_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>
                            {rowData.staffName} ({rowData.ttmP_PeriodName})
                        </strong>
                        ?
                    </p>
                    <FormError>{errors.ttmD_Id?.message}</FormError>
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
