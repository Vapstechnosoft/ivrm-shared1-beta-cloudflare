'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterUOM } from '@/types/sports/masters/uom';
import type { ColumnDef, Row } from '@tanstack/react-table';

function ActionsCell({ row }: { row: Row<IMasterUOM> }) {
    const data = row.original;
    const realId = row.getValue('spccmuoM_Id') as number | string;
    const { openEditForm, openToggleForm } = useFormContext<IMasterUOM>();

    // Ensure the ID is correctly populated in the original data before passing to forms
    if (realId && (!data.spccmuoM_Id || data.spccmuoM_Id === 0)) {
        (data as any).spccmuoM_Id = Number(realId);
    }

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
            toggleConditionKey='spccmuoM_ActiveFlag'
        />
    );
}

export const MasterUOMColumns: ColumnDef<IMasterUOM>[] = [
    {
        accessorFn: (row: any) =>
            row.spccmuoM_Id ||
            row.SPCCMUOM_Id ||
            row.spccmuom_Id ||
            row.spccmUOM_Id ||
            row.masterUOMid ||
            row.MasterUOMid ||
            row.uom_Id ||
            row.UOM_Id,
        id: 'spccmuoM_Id',
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
        accessorFn: (row: any) =>
            row.spccmuoM_UOMName || row.SPCCMUOM_UOMName || row.spccmuom_UOMName || row.masterUOMname || row.MasterUOMname,
        id: 'spccmuoM_UOMName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='UOM Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmuoM_UOMName')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
