'use client';

import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import React from 'react';
import type { IClgSubSubjectOrder } from '../types';

interface SetOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IClgSubSubjectOrder[];
    onSave: (data: IClgSubSubjectOrder[]) => Promise<void>;
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
    const handleSave = async (updatedData: IClgSubSubjectOrder[]) => {
        const processed = updatedData.map((item, index) => ({
            ...item,
            emsS_Order: index + 1
        }));
        await onSave(processed);
    };

    return (
        <MasterViewDetails<IClgSubSubjectOrder>
            isOpen={isOpen}
            onClose={onClose}
            data={data}
            isLoading={isLoading}
            isSaving={isSaving}
            columns={[
                { key: 'id', label: 'SLNO', className: 'text-center w-16' },
                { key: 'emsS_SubSubjectName', label: 'Sub-Subject Name', className: 'text-left' },
                { key: 'emsS_SubSubjectCode', label: 'Sub-Subject Code', className: 'text-left' },
                { key: 'emsS_Order', label: 'Sub-Subject Order', className: 'text-center w-28' }
            ]}
            onSave={handleSave}
            tableHeight='450px'
            title='MASTER Sub-Subjects - Set Order'
        />
    );
}
