'use client';

import { DataTable } from '@/components/ui/data-table/data-table';
import type { LeaveApplication } from '../types';
import { createColumns } from './columns';

interface LeaveDetailsGridProps {
    data: LeaveApplication[];
    onCancelLeave: (leave: LeaveApplication) => void;
    onEditLeave: (leave: LeaveApplication) => void;
}

export default function LeaveDetailsGrid({ data, onCancelLeave, onEditLeave }: LeaveDetailsGridProps) {
    const columns = createColumns({
        onCancel: onCancelLeave,
        onEdit: onEditLeave
    });

    return (
        <DataTable
            columns={columns}
            data={data}
            totalItems={data.length}
            isSearchRequired={true}
            isPaginationRequired={true}
            showExportOptions={false}
            showViewOptions={false}
            isLoading={false}
        />
    );
}
