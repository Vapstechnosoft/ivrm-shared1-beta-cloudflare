'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useStudentHouseMapping } from '@/hooks/sports/useStudentHouseMapping';
import type { StudentHouseMappingDTO } from '@/types/sports/masters/student-house-mapping';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleFormProps {
    rowData: StudentHouseMappingDTO;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleForm({ rowData, onClose, onSuccess }: ToggleFormProps) {
    const { toggleData } = useStudentHouseMapping();
    const isActive = rowData.spccmH_ActiveFlag;

    const handleConfirm = async () => {
        toggleData.mutate(rowData.spccsH_Id!, {
            onSuccess: (response: any) => {
                const msg = (response?.message || response?.Message || '') as string;
                const isOk =
                    response?.success ||
                    response?.returnval == true ||
                    response?.returnVal == true ||
                    (msg && !msg.toLowerCase().includes('failed'));

                if (isOk) {
                    toast.success(msg || `Mapping ${isActive ? 'deactivated' : 'activated'} successfully`);
                    onSuccess();
                    onClose();
                } else {
                    toast.error(msg || 'Failed to update status');
                }
            },
            onError: () => {
                toast.error('Something went wrong');
            }
        });
    };

    return (
        <AdaptiveDialog title='Toggle Mapping Status' isOpen={true} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} house mapping for{' '}
                        <strong>{rowData.studentname}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={toggleData.isPending} variant={isActive ? 'destructive' : 'default'}>
                        {toggleData.isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Working...
                            </>
                        ) : isActive ? (
                            'Deactivate'
                        ) : (
                            'Activate'
                        )}
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
