'use client';

import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import type { IClgSubjectOrder } from '../types';

interface SetOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IClgSubjectOrder[];
    onSave: (data: IClgSubjectOrder[]) => Promise<void>;
    isLoading?: boolean;
    isSaving?: boolean;
}

export function SetOrderModal({
    isOpen,
    onClose,
    data,
    onSave,
    isLoading = false,
    isSaving = false
}: SetOrderModalProps) {
    const handleSave = async (updatedData: IClgSubjectOrder[]) => {
        const processed = updatedData.map((item, index) => {
            let flag = item.ismS_SubjectFlag;
            if (item.ismS_PreadmFlag === 0) {
                flag = 0;
            } else if (flag === 'Written' && item.ismS_PreadmFlag === 1) {
                flag = 1;
            } else if (flag === 'Oral' && item.ismS_PreadmFlag === 1) {
                flag = 0;
            }

            return {
                ...item,
                ismS_OrderFlag: index + 1,
                ismS_SubjectFlag: flag
            };
        });

        await onSave(processed);
    };

    return (
        <MasterViewDetails<IClgSubjectOrder>
            isOpen={isOpen}
            onClose={onClose}
            data={data}
            isLoading={isLoading}
            isSaving={isSaving}
            columns={[
                { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                { key: 'ismS_SubjectName', label: 'Subject Name', className: 'text-left' },
                { key: 'ismS_SubjectCode', label: 'Subject Code', className: 'text-left' },
                { key: 'ismS_OrderFlag', label: 'Subject Order', className: 'text-left' }
            ]}
            onSave={handleSave}
            tableHeight='500px'
            title='MASTER Subjects - Set Order'
        />
    );
}
