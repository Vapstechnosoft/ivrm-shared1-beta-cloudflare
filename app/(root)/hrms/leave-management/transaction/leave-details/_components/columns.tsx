'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<any>[] = [
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
        accessorKey: 'hrmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'hrmdeS_DesignationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'hrmlD_NoOfDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Number of Days' className='whitespace-nowrap' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrmlD_NoOfDays')}</div>
    },
    {
        accessorKey: 'hrmlD_MaxLeaveApplicable',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Leave Applicable' className='whitespace-nowrap' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrmlD_MaxLeaveApplicable')}</div>
    }
];
