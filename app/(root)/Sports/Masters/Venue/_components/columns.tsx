'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterEventVenue } from '@/types/sports/masters/venue';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterEventVenue> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterEventVenue>();

    return (
        <ActionButtons
            rowData={data}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(data)}
            onToggle={() => openToggleForm(data)}
            toggleConditionKey='spccmeV_ActiveFlag'
        />
    );
}

/* ============================================
   Master Venue Columns Definition
   ============================================ */
export const MasterVenueColumns: ColumnDef<IMasterEventVenue>[] = [
    {
        accessorKey: 'spccmeV_Id',
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
        accessorKey: 'spccmeV_EventVenue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event Venue' />
    },
    {
        accessorKey: 'spccmeV_EventVenueDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event Venue Description' />
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
