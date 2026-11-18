'use client';

import { useMasterTimeSetting, useSaveMasterTimeSetting } from '@/hooks/hrms/attendance-management/useMasters';
import { MasterTimeSettingForm, type MasterTimeSettingFormData } from './master-time-setting-form';

interface AddMasterTimeSettingFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterTimeSettingForm({ onSuccess, className = '' }: AddMasterTimeSettingFormProps) {
    const { refetchAll } = useMasterTimeSetting();
    const { mutate: saveMasterTimeSetting } = useSaveMasterTimeSetting();

    const onSubmit = (data: MasterTimeSettingFormData) => {
        saveMasterTimeSetting(
            {
                fomtS_Id: 0,
                mI_Id: 0, // This is usually handled by the backend or context
                ...data
            } as any,
            {
                onSuccess: () => {
                    refetchAll();
                    onSuccess?.();
                }
            }
        );
    };

    return (
        <div className={className}>
            <MasterTimeSettingForm editingData={null} onSubmit={onSubmit} onCancel={() => onSuccess?.()} />
        </div>
    );
}
