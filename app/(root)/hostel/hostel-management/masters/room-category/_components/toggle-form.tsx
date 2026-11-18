'use client';

import { ToggleFormWrapper } from '@/components/ui/form/toggle-form-wrapper';
import { useRoomCategory } from '@/hooks/hostel/useRoomCategory';
import { deactivateRoomCategory } from '@/server/hostel/hostel-management/masters/room-category';
import type { IRoomCategory } from '@/types/hostel/hostel-management/masters';
import { toast } from 'sonner';

interface ToggleRoomCategoryProps {
    data: IRoomCategory;
    onClose: () => void;
    onSuccess: () => void;
}

export const ToggleRoomCategory = ({ data, onClose, onSuccess }: ToggleRoomCategoryProps) => {
    const { refetchAll } = useRoomCategory();
    const onConfirm = async () => {
        try {
            const result = await deactivateRoomCategory(data.hlmrcA_Id);

            if (result?.success) {
                toast.success(data.hlmrcA_ActiveFlag ? 'Room Category deactivated successfully' : 'Room Category activated successfully');
                onSuccess();
                refetchAll();
            } else {
                toast.error(result?.message);
            }
        } catch (error) {
            toast.error('Failed to update Room Category status');
        } finally {
            onClose();
        }
    };

    return (
        <ToggleFormWrapper
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            title={data.hlmrcA_ActiveFlag ? 'Deactivate Room Category' : 'Activate Room Category'}
            description={`Are you sure you want to ${data.hlmrcA_ActiveFlag ? 'deactivate' : 'activate'} ${data.hlmrcA_RoomCategory}?`}
        />
    );
};
