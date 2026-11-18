'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCompetitionLevel } from '@/types/sports/masters/competition-level';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterCompetitionLevel> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterCompetitionLevel>();

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
            toggleConditionKey='spccmcL_ActiveFlag'
        />
    );
}

export const MasterCompetitionLevelColumns: ColumnDef<IMasterCompetitionLevel>[] = [
    {
        accessorKey: 'spccmcL_Id',
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
        accessorKey: 'spccmcL_CompitionLevel',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Competition Level Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmcL_CompitionLevel')}</div>
    },
    {
        accessorKey: 'spccmcL_CLDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => (
            <div className='max-w-[400px] truncate' title={row.getValue('spccmcL_CLDesc')}>
                {row.getValue('spccmcL_CLDesc')}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
