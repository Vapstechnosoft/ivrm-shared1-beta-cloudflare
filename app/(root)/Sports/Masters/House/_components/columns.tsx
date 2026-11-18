'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterHouse } from '@/types/sports/masters/house';
import type { ColumnDef, Row } from '@tanstack/react-table';

function ActionsCell({ row }: { row: Row<IMasterHouse> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterHouse>();

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
            toggleConditionKey='spccmH_ActiveFlag'
        />
    );
}

export const MasterHouseColumns: ColumnDef<IMasterHouse>[] = [
    {
        accessorKey: 'spccmH_Id',
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
        accessorKey: 'spccmH_HouseName',
        id: 'spccmH_HouseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='House Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmH_HouseName')}</div>
    },
    {
        accessorKey: 'spccmH_HouseDescription',
        id: 'spccmH_HouseDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => <div>{row.getValue('spccmH_HouseDescription')}</div>
    },
    {
        accessorKey: 'spccmH_Flag',
        id: 'spccmH_Flag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='House/Committee' />,
        cell: ({ row }) => <div>{row.getValue('spccmH_Flag')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
