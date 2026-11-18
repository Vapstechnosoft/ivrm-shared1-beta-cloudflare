'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCompetitionCategory } from '@/types/sports/masters/competition-category';
import type { ColumnDef, Row } from '@tanstack/react-table';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IMasterCompetitionCategory> }) {
    const data = row.original;
    const { openEditForm, openToggleForm } = useFormContext<IMasterCompetitionCategory>();

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
            toggleConditionKey='spccmcC_ActiveFlag'
        />
    );
}

/* ============================================
   Master Competition Category Columns Definition
   ============================================ */
export const MasterCompetitionCategoryColumns: ColumnDef<IMasterCompetitionCategory>[] = [
    {
        accessorKey: 'spccmcC_Id',
        id: 'SPCCMCC_Id',
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
        accessorKey: 'spccmcC_CompitionCategory',
        id: 'SPCCMCC_CompitionCategory',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Competition Category' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_CCDesc',
        id: 'SPCCMCC_CCDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_CCAgeFlag',
        id: 'SPCCMCC_CCAgeFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Age Flag' />,
        enableSorting: true,
        cell: ({ row }) =>
            row.original.spccmcC_CCAgeFlag ? (
                <Badge variant='default' className='bg-blue-600 hover:bg-blue-700'>
                    Yes
                </Badge>
            ) : (
                <Badge variant='outline'>No</Badge>
            )
    },
    {
        accessorKey: 'spccmcC_FromCCAgeYear',
        id: 'SPCCMCC_FromCCAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Year(Age)' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_ToCCAgeYear',
        id: 'SPCCMCC_ToCCAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Year(Age)' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_FromCCAgeMonth',
        id: 'SPCCMCC_FromCCAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Month(Age)' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_ToCCAgeMonth',
        id: 'SPCCMCC_ToCCAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Month(Age)' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_FromCCAgeDays',
        id: 'SPCCMCC_FromCCAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Days(Age)' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_ToCCAgeDays',
        id: 'SPCCMCC_ToCCAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Days(Age)' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccmcC_CCWeightFlag',
        id: 'SPCCMCC_CCWeightFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight Flag' />,
        enableSorting: true,
        cell: ({ row }) =>
            row.original.spccmcC_CCWeightFlag ? (
                <Badge variant='default' className='bg-blue-600 hover:bg-blue-700'>
                    Yes
                </Badge>
            ) : (
                <Badge variant='outline'>No</Badge>
            )
    },
    {
        accessorKey: 'spccmcC_CCWeight',
        id: 'SPCCMCC_CCWeight',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight' />,
        enableSorting: true
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
