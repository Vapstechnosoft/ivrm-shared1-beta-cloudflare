'use client';

import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import React from 'react';
import type { IClgExamOrder } from '../types';

interface SetOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IClgExamOrder[];
    onSave: (data: IClgExamOrder[]) => Promise<void>;
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
    const handleSave = async (updatedData: IClgExamOrder[]) => {
        const processed = updatedData.map((item, index) => ({
            ...item,
            emE_ExamOrder: index + 1
        }));
        await onSave(processed);
    };

    return (
        <MasterViewDetails<IClgExamOrder>
            isOpen={isOpen}
            onClose={onClose}
            data={data}
            isLoading={isLoading}
            isSaving={isSaving}
            columns={[
                { key: 'id', label: 'SLNO', className: 'text-center w-16' },
                { key: 'emE_ExamName', label: 'Exam Name', className: 'text-left' },
                { key: 'emE_ExamCode', label: 'Exam Code', className: 'text-left' },
                { key: 'emE_ExamOrder', label: 'Exam Order', className: 'text-center w-28' }
            ]}
            onSave={handleSave}
            tableHeight='450px'
            title='MASTER Exams - Set Order'
        />
    );
}
