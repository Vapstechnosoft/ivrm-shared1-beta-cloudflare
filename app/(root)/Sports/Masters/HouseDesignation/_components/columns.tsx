'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterHouseDesignation } from '@/types/sports/masters/house-designation';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterHouseDesignation> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterHouseDesignation>();

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
            toggleConditionKey='spccmhD_ActiveFlag'
        />
    );
}

/* ============================================
   Master House Designation Columns Definition
   ============================================ */
export const MasterHouseDesignationColumns: ColumnDef<IMasterHouseDesignation>[] = [
    {
        accessorKey: 'spccmhD_Id',
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
        accessorKey: 'spccmhD_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation Name' />
    },
    {
        accessorKey: 'spccmhD_DesignationDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation Description' />
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
