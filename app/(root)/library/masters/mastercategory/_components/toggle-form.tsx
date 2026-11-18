'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useMasterCategoryListData } from '@/hooks/library/useMasters';
import { toggleMasterCategory } from '@/server/library/masters/library_category';
import type { IMasterCategoryList } from '@/types/library/masters/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleMasterCategoryFormProps {
    rowData: IMasterCategoryList;
    onClose: () => void;
}

export default function ToggleMasterCategoryForm({ rowData, onClose }: ToggleMasterCategoryFormProps) {
    const { refetchAll } = useMasterCategoryListData();
    const isActive = rowData.lmC_ActiveFlag;
    const [isPending, setIsPending] = useState(false);

    const handleToggle = async () => {
        setIsPending(true);
        try {
            const response = await toggleMasterCategory(rowData.lmC_Id);

            // Handle unusual backend where success: false but message is positive
            if (response?.success || response?.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Status updated successfully');
                refetchAll();
                onClose();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <AdaptiveDialog title='Confirmation' isOpen={true} onClose={onClose}>
            <AdaptiveBody>
                <div className='py-4 text-center'>
                    <p className='font-medium text-lg'>Do You Want To {isActive ? 'Inactivate' : 'Activate'} Record?</p>
                </div>
            </AdaptiveBody>
            <AdaptiveFooter className='justify-center border-t pt-4'>
                <Button variant='outline' onClick={onClose} disabled={isPending}>
                    Cancel
                </Button>
                <Button
                    variant='destructive'
                    onClick={handleToggle}
                    isLoading={isPending}
                    loadingText={isActive ? 'Inactivating...' : 'Activating...'}>
                    {isActive ? 'Inactivate' : 'Activate'}
                </Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
