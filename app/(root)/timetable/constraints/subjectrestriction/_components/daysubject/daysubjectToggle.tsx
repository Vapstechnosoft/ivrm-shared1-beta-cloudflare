'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useSubjectRestrictionDaySubjectGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { masterDaySchema } from '@/schemas/timetable/masters';
import { ToggleSubjectDaySubject } from '@/server/timetable/constraints/subjectrestriction';
import type { SubjectRestrictionDaySubjectGridData } from '@/types/timetable/constraints/subjectRestrictions';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterDaySchema.delete>;

interface ToggleSubjectDaySubjectProps {
    rowData: SubjectRestrictionDaySubjectGridData;
    onClose: () => void;
}

export default function DaySubjectToggle({ rowData, onClose }: ToggleSubjectDaySubjectProps) {
    const { refetchAll } = useSubjectRestrictionDaySubjectGridData({ ASMAY_Id: rowData.asmaY_Id || 0, TTMC_Id: 0 });
    const isActive = rowData.ttrdsU_ActiveFlag;

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
            const response = await ToggleSubjectDaySubject(Number(rowData.ttrdsU_Id));

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
        <AdaptiveDialog title='Toggle Day Subject Constraint' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmD_Id')} defaultValue={rowData.ttrdsU_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong>
                            {rowData.ismS_SubjectName} ({rowData.ttmD_DayName})
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
