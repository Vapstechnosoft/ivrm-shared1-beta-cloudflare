'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { SportsCCNameDTO } from '@/types/sports/masters/sports-cc-name';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<SportsCCNameDTO> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<SportsCCNameDTO>();

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
            toggleConditionKey='spccmscC_ActiveFlag'
        />
    );
}

/* ============================================
   Master Sports CC Name Columns Definition
   ============================================ */
export const MasterSportsCCNameColumns: ColumnDef<SportsCCNameDTO>[] = [
    {
        accessorKey: 'spccmscC_Id',
        id: 'SPCCMSCC_Id',
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
        accessorKey: 'groupName',
        id: 'groupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_SportsCCName',
        id: 'SPCCMSCC_SportsCCName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sports Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_SportsCCDesc',
        id: 'SPCCMSCC_SportsCCDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_SGFlag',
        id: 'SPCCMSCC_SGFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SG Flag' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_NoOfMembers',
        id: 'SPCCMSCC_NoOfMembers',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No.Of Members' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmscC_RecHighLowFlag',
        id: 'SPCCMSCC_RecHighLowFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='High/Low Flag' />,
        enableSorting: true
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
