'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useExamTTSession } from '@/hooks/exam/exammodule/exam-mapping';
import { toggleExamTTSession } from '@/server/exam/exam-module/exam-mapping/exam-tt-session';
import type { IExamTTSession } from '@/types/exam/exam-module/exam-mapping';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

export default function ToggleExamTTSessionForm({
    rowData,
    onClose
}: {
    rowData: IExamTTSession;
    onClose: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const { refetchAll } = useExamTTSession();

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                const response = await toggleExamTTSession(rowData.ettS_Id);

                if (response) {
                    toast.success(`Session ${rowData.ettS_Activeflag ? 'deactivated' : 'activated'} successfully`);
                    refetchAll();
                    onClose();
                } else {
                    toast.error('Failed to update status');
                }
            } catch (error) {
                toast.error('An error occurred while updating status');
            }
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {rowData.ettS_Activeflag ? 'deactivate' : 'activate'} the session "
                        {rowData.ettS_SessionName}"?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button variant='outline' onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button variant={rowData.ettS_Activeflag ? 'destructive' : 'default'} onClick={handleConfirm} disabled={isPending}>
                        {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {rowData.ettS_Activeflag ? 'Deactivate' : 'Activate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
