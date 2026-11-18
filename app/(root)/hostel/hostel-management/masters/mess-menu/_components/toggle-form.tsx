'use client';

import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { toggleMessMenuStatus } from '@/server/hostel/hostel-management/masters/menu';
import type { IMessMenu } from '@/types/hostel/hostel-management/masters';
import { toast } from 'sonner';

interface ToggleMessMenuFormProps {
    rowData: IMessMenu;
    onClose: () => void;
    onSuccess: () => void;
}

export const ToggleMessMenuForm = ({ rowData, onClose, onSuccess }: ToggleMessMenuFormProps) => {
    const onConfirm = async () => {
        try {
            const result = await toggleMessMenuStatus(rowData.hlmmN_Id, rowData.hlmmN_ActiveFlag);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            onClose();
        }
    };

    return (
        <ToggleFormWrapper
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            title={rowData.hlmmN_ActiveFlag ? 'Deactivate Mess Menu' : 'Activate Mess Menu'}
            description={`Are you sure you want to ${rowData.hlmmN_ActiveFlag ? 'deactivate' : 'activate'} ${rowData.hlmmN_MenuName}?`}
        />
    );
};
