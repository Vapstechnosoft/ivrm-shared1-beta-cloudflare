'use client';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { type GuestAllotmentColumn, guestAllotmentColumns } from './columns';

interface GuestAllotmentListProps {
    data: GuestAllotmentColumn[] | null;
    onEdit: (row: GuestAllotmentColumn) => void;
}

export default function GuestAllotmentList({ data, onEdit }: GuestAllotmentListProps) {
    return <GenericDataTable columns={guestAllotmentColumns} data={data || []} isLoading={false} />;
}
