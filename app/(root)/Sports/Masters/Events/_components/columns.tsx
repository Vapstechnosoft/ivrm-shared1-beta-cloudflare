'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterEvent } from '@/types/sports/masters/events';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterEvent> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterEvent>();

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
            toggleConditionKey='spccmE_ActiveFlag'
        />
    );
}

/* ============================================
   Master Event Columns Definition
   ============================================ */
export const MasterEventColumns: ColumnDef<IMasterEvent>[] = [
    {
        accessorKey: 'spccmE_Id',
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
        accessorKey: 'spccmE_EventName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event Name' />
    },
    {
        accessorKey: 'spccmE_EventNameDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
