'use client';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { MasterPeriodDelete } from '@/server/timetable/masters/masterperiod';
import type { IMasterPeriodDetailsList } from '@/types/timetable/masters/masters';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteMasterPeriodFormProps {
    rowData: IMasterPeriodDetailsList;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteMasterPeriodForm({ rowData, onClose, onSuccess }: DeleteMasterPeriodFormProps) {
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            return await MasterPeriodDelete(rowData.imP_Id);
        },
        onSuccess: (response: any) => {
            if (response.success || response.returnval) {
                toast.success('Record Deleted Successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(response.message || 'Failed to delete record');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred');
        }
    });

    return (
        <AdaptiveDialog title='Delete Master Period' isOpen={true} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>Are you sure you want to delete this period?</p>
                    <div className='rounded-md bg-muted p-3 text-muted-foreground text-sm'>
                        <p>
                            <strong>Period Name:</strong> {rowData.imP_PeriodName}
                        </p>
                        <p>
                            <strong>Category:</strong> {rowData.categoryName}
                        </p>
                    </div>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button onClick={() => mutate()} isLoading={isPending} variant='destructive'>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
