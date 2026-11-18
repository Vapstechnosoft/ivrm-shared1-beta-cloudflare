'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { IFeeStreamGroupMappingGrid } from '@/types/fees/transactions/feeStreamGroupMapping';
import type { ColumnDef } from '@tanstack/react-table';

export const feeStreamGroupMappingColumns = (
    onEdit: (item: IFeeStreamGroupMappingGrid) => void,
    onToggleStatus: (item: IFeeStreamGroupMappingGrid) => void
): ColumnDef<IFeeStreamGroupMappingGrid>[] => [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' className='whitespace-nowrap' />,
        cell: ({ row }) => (
            <div className='whitespace-nowrap font-medium text-slate-800 dark:text-slate-100'>
                {row.original.asmaY_Year || row.original.ASMAY_Year || 'N/A'}
            </div>
        )
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' className='whitespace-nowrap' />,
        cell: ({ row }) => (
            <div className='whitespace-nowrap font-medium text-slate-800 dark:text-slate-100'>
                {row.original.asmcL_ClassName || row.original.ASMCL_ClassName || 'N/A'}
            </div>
        )
    },
    {
        accessorKey: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' className='whitespace-nowrap' />,
        cell: ({ row }) => (
            <div className='whitespace-nowrap font-medium text-slate-800 dark:text-slate-100'>
                {row.original.fmG_GroupName || row.original.FMG_GroupName || 'N/A'}
            </div>
        )
    },
    {
        accessorKey: 'pasL_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Stream Name' className='whitespace-nowrap' />,
        cell: ({ row }) => (
            <div className='whitespace-nowrap font-medium text-slate-800 dark:text-slate-100'>
                {row.original.pasL_Name || row.original.PASL_Name || 'N/A'}
            </div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => (
            <ActionButtons
                rowData={row.original}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={onEdit}
                onToggle={onToggleStatus}
                toggleConditionKey={['fmsgM_Active', 'FMSGM_Active', 'active_flag']}
            />
        ),
        enableSorting: false
    }
];