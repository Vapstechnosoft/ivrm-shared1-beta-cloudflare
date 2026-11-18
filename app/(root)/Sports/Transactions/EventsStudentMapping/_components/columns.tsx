'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useEventsStudentMapping } from '@/hooks/sports/useEventsStudentMapping';
import type { IEventsStudentMappingData } from '@/types/sports/events-student-mapping';
import type { ColumnDef, Row } from '@tanstack/react-table';

// Simple columns for the display grid (the "Saved" list)
export const eventsStudentMappingColumns: ColumnDef<IEventsStudentMappingData>[] = [
    {
        accessorKey: 'spccestR_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'studentName',
        header: 'Student Name'
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: 'Adm No.'
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: 'Class'
    },
    {
        accessorKey: 'asmC_SectionName',
        header: 'Section'
    },
    {
        accessorKey: 'spccmH_HouseName',
        header: 'House'
    },
    {
        accessorKey: 'eventName',
        header: 'Event'
    },
    {
        accessorKey: 'spccestR_Points',
        header: 'Points'
    },
    {
        accessorKey: 'spccestR_Rank',
        header: 'Rank'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];

function ActionsCell({ row }: { row: Row<IEventsStudentMappingData> }) {
    const mapping = row.original;
    const { deactivateData } = useEventsStudentMapping();

    return (
        <ActionButtons
            rowData={mapping}
            buttons={{
                edit: false, // Edit usually involves reloading the form, disabling for now unless requested
                toggle: true,
                delete: false
            }}
            onToggle={() => {
                deactivateData.mutate({
                    id: mapping.spccestR_Id,
                    activeFlag: !mapping.spccestR_ActiveFlag
                });
            }}
            toggleConditionKey='spccestR_ActiveFlag'
        />
    );
}
