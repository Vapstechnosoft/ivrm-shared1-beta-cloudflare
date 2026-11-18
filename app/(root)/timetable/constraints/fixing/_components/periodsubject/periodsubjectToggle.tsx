'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { usePeriodSubjectGridData } from '@/hooks/timetable/constraints/fixingData';
import { deactivateFixingPeriodSubject } from '@/server/timetable/constraints/fixing';

import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    ttfpsU_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface TogglePeriodSubjectFormProps {
    rowData: any;
    onClose: () => void;
}

export default function PeriodSubjectToggle({ rowData, onClose }: TogglePeriodSubjectFormProps) {
    const { refetchAll } = usePeriodSubjectGridData();

    const isActive = rowData.ttfpsU_ActiveFlag;

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        defaultValues: {
            ttfpsU_Id: Number(rowData.ttfpsU_Id)
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await deactivateFixingPeriodSubject({
                TTRPSU_Id: Number(rowData.ttfpsU_Id),
                TTRPSU_ActiveFlag: !isActive
            });

            if (response.success || response.returnval) {
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{isActive ? 'Deactivate' : 'Activate'} Record</DialogTitle>

                        <DialogDescription>
                            Are you sure you want to {isActive ? 'deactivate' : 'activate'} this record?
                            <br />
                            <strong>Class:</strong> {rowData.asmcL_ClassName || 'N/A'} |<strong> Section:</strong>{' '}
                            {rowData.asmC_SectionName || 'N/A'}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className='mt-6'>
                        <Button variant='outline' onClick={onClose} type='button' disabled={isSubmitting}>
                            Cancel
                        </Button>

                        <Button variant={isActive ? 'destructive' : 'default'} type='submit' isLoading={isSubmitting}>
                            {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
