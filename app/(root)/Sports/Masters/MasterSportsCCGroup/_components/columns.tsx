'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSportsCCGroup } from '@/types/sports/masters/sports-cc-group';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterSportsCCGroup> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterSportsCCGroup>();

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
            toggleConditionKey='spccmsccG_ActiveFlag'
        />
    );
}

export const MasterSportsCCGroupColumns: ColumnDef<IMasterSportsCCGroup>[] = [
    {
        accessorKey: 'spccmsccG_Id',
        id: 'SPCCMSCCG_Id',
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
        accessorKey: 'spccmsccG_SportsCCGroupName',
        id: 'SPCCMSCCG_SportsCCGroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.spccmsccG_SportsCCGroupName}</div>
    },
    {
        accessorKey: 'spccmsccG_SportsCCGroupDesc',
        id: 'SPCCMSCCG_SportsCCGroupDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => (
            <div className='max-w-[400px] truncate' title={row.original.spccmsccG_SportsCCGroupDesc}>
                {row.original.spccmsccG_SportsCCGroupDesc}
            </div>
        )
    },
    {
        accessorKey: 'spccmsccG_SCCFlag',
        id: 'SPCCMSCCG_SCCFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SCC Flag' />
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
