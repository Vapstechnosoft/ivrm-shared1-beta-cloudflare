'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useSubjectRestrictionPeriodSubjectGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { masterDaySchema } from '@/schemas/timetable/masters';
import { ToggleSubjectPeriodSubject } from '@/server/timetable/constraints/subjectrestriction';
import type { SubjectRestrictionPeriodSubjectGridData } from '@/types/timetable/constraints/subjectRestrictions';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterDaySchema.delete>;

interface ToggleSubjectPeriodSubjectProps {
    rowData: SubjectRestrictionPeriodSubjectGridData;
    onClose: () => void;
}

export default function PeriodSubjectToggle({ rowData, onClose }: ToggleSubjectPeriodSubjectProps) {
    const { refetchAll } = useSubjectRestrictionPeriodSubjectGridData({ ASMAY_Id: 0, TTMC_Id: 0 });
    const isActive = rowData.ttrpsU_ActiveFlag;

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
            const response = await ToggleSubjectPeriodSubject(Number(rowData.ttrpsU_Id));

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
        <AdaptiveDialog title='Toggle Period Subject Constraint' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmD_Id')} defaultValue={rowData.ttrpsU_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>
                            {rowData.ismS_SubjectName} ({rowData.ttmP_PeriodName})
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
