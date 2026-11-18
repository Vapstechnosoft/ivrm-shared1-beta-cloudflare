'use client';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { guestColumns, staffColumns, studentColumns } from './columns';

interface VacateRoomListProps {
    data: any[];
    type: 'student' | 'staff' | 'guest';
}

export default function VacateRoomList({ data, type }: VacateRoomListProps) {
    const columns = type === 'student' ? studentColumns : type === 'staff' ? staffColumns : guestColumns;
    return <GenericDataTable columns={columns} data={data} isLoading={false} />;
}
