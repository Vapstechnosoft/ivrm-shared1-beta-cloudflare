'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDayStaffGridData } from '@/hooks/timetable/constraints/fixingData';
import { deactivateFixingDayStaff } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    ttfdS_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleDayStaffFormProps {
    rowData: any;
    onClose: () => void;
}

export default function DayStaffToggle({ rowData, onClose }: ToggleDayStaffFormProps) {
    const { refetchAll } = useDayStaffGridData();
    const isActive = rowData.ttfdS_ActiveFlag;

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        defaultValues: {
            ttfdS_Id: Number(rowData.ttfdS_Id)
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await deactivateFixingDayStaff({
                TTFDS_Id: Number(rowData.ttfdS_Id),
                TTFDS_ActiveFlag: !isActive
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{isActive ? 'Deactivate' : 'Activate'} Record</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {isActive ? 'deactivate' : 'activate'} this record?
                            <br />
                            <strong>Class:</strong> {rowData.asmcL_ClassName || 'N/A'} | <strong>Section:</strong>{' '}
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
