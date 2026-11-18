'use client';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { type StaffAllotmentColumn, staffAllotmentColumns } from './columns';

interface StaffAllotmentListProps {
    data: StaffAllotmentColumn[];
    onEdit: (row: StaffAllotmentColumn) => void;
}

export default function StaffAllotmentList({ data, onEdit }: StaffAllotmentListProps) {
    return <GenericDataTable columns={staffAllotmentColumns} data={data} isLoading={false} />;
}
