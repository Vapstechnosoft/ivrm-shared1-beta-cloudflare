'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { useMasterTimeSlabList } from '@/hooks/library/useMasters';
import { deactivateMasterTimeSlab } from '@/server/library/masters/time-slab';
import type { IMasterTimeSlab } from '@/types/library/masters/time-slab';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ToggleTimeSlabFormProps {
    rowData: IMasterTimeSlab;
    onClose: () => void;
}

export default function ToggleTimeSlabForm({ rowData, onClose }: ToggleTimeSlabFormProps) {
    const { refetchAll } = useMasterTimeSlabList();
    const isActive = rowData.lfsE_ActiveFlg;

    const mutation = useMutation({
        mutationFn: (id: number) => deactivateMasterTimeSlab(id),
        onSuccess: async (data) => {
            if (data.success) {
                toast.success(data.message || `Record ${isActive ? 'Deactivated' : 'Activated'} Successfully!!!`);
                await refetchAll();
                onClose();
            } else {
                toast.error(data.message || `Failed to ${isActive ? 'Deactivate' : 'Activate'} Record`);
            }
        },
        onError: (error) => {
            toast.error('An error occurred while updating status');
            console.error(error);
        }
    });

    const handleConfirm = () => {
        const id = (rowData as any).lfsE_Id ?? (rowData as any).LFSE_Id;
        if (id) {
            mutation.mutate(id);
        } else {
            toast.error('Invalid Record ID');
        }
    };

    return (
        <AdaptiveDialog title={isActive ? 'Deactivate Time Slab' : 'Activate Time Slab'} isOpen={true} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <p className='text-sm'>
                    Are you sure you want to {isActive ? 'deactivate' : 'activate'} the record{' '}
                    <strong className='font-bold'>
                        {rowData.lfsE_UserType} ({rowData.lfsE_FromDay} - {rowData.lfsE_ToDay || '∞'})
                    </strong>
                    ?
                </p>
                <div className='flex justify-end gap-3 pt-2'>
                    <Button variant='outline' onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant={isActive ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={mutation.isPending}
                        className='min-w-[100px]'>
                        {mutation.isPending
                            ? isActive
                                ? 'Deactivating...'
                                : 'Activating...'
                            : isActive
                              ? 'Yes, Deactivate'
                              : 'Yes, Activate'}
                    </Button>
                </div>
            </div>
        </AdaptiveDialog>
    );
}
