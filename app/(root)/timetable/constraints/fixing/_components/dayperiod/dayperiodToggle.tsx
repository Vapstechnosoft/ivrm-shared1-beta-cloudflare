'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useFixingDayPeriodGridData } from '@/hooks/timetable/constraints/fixingData';
import { deactivateFixingDayPeriod } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    ttfdP_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleDayPeriodFormProps {
    rowData: any;
    onClose: () => void;
}

export default function DayPeriodToggle({ rowData, onClose }: ToggleDayPeriodFormProps) {
    const { refetchAll } = useFixingDayPeriodGridData();
    const isActive = rowData.ttfdP_ActiveFlag;

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        defaultValues: {
            ttfdP_Id: Number(rowData.ttfdP_Id)
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await deactivateFixingDayPeriod({
                TTFDP_Id: Number(rowData.ttfdP_Id),
                TTFDP_ActiveFlag: !isActive
            });

            if (response.success) {
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
        <AdaptiveDialog title={isActive ? 'Deactivate Record' : 'Activate Record'} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} this record?
                        <br />
                        <strong>Class:</strong> {rowData.asmcL_ClassName} | <strong>Section:</strong> {rowData.asmC_SectionName}
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button' disabled={isSubmitting}>
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
