'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterDivision } from '@/types/sports/masters/division';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterDivision> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterDivision>();

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
            toggleConditionKey='spccmD_ActiveFlag'
        />
    );
}

export const MasterDivisionColumns: ColumnDef<IMasterDivision>[] = [
    {
        accessorKey: 'spccmD_Id',
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
        accessorKey: 'spccmD_DivisionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Division Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmD_DivisionName')}</div>
    },
    {
        accessorKey: 'spccmD_DivisionDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => (
            <div className='max-w-[400px] truncate' title={row.getValue('spccmD_DivisionDescription')}>
                {row.getValue('spccmD_DivisionDescription')}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
