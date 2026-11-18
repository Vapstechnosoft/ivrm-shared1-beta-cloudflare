'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { deleteLabConstraints } from '@/server/timetable/constraints/labconstraints';
import { useState } from 'react';
import { toast } from 'sonner';

interface LabConstraintsDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export default function LabConstraintsDelete({ isOpen, onClose, onSuccess, data }: LabConstraintsDeleteProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteLabConstraints(data.ttlaB_Id);
            if (res?.success || res?.returnval) {
                toast.success(res.message || 'Record deleted successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(res.message || 'Failed to delete record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AdaptiveDialog title='Delete Record' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to delete this record? This action cannot be undone.
                        <br />
                        <strong>Lab Name:</strong> {data?.ttlaB_LABLIBName}
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button' disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant='destructive' onClick={handleDelete} isLoading={isDeleting}>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
