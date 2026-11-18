'use client';

import { useMasterTimeSetting, useSaveMasterTimeSetting } from '@/hooks/hrms/attendance-management/useMasters';
import type { IMasterTimeSetting } from '@/types/hrms/attendance-management/masters';
import { MasterTimeSettingForm, type MasterTimeSettingFormData } from './master-time-setting-form';

interface UpdateMasterTimeSettingFormProps {
    selectedRow: IMasterTimeSetting;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateMasterTimeSettingForm({ selectedRow, onSuccess, className = '' }: UpdateMasterTimeSettingFormProps) {
    const { refetchAll } = useMasterTimeSetting();
    const { mutate: saveMasterTimeSetting } = useSaveMasterTimeSetting();

    const onSubmit = (data: MasterTimeSettingFormData) => {
        saveMasterTimeSetting(
            {
                ...selectedRow,
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
            <MasterTimeSettingForm editingData={selectedRow} onSubmit={onSubmit} onCancel={() => onSuccess?.()} />
        </div>
    );
}
