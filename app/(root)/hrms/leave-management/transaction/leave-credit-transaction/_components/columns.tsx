'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Switch } from '@/components/ui/switch';
import type { LeaveTransactionManual } from '@/types/hrms/leave-management/leave-transaction-manual';
import type { ColumnDef } from '@tanstack/react-table';
export type LeaveCreditTransaction = LeaveTransactionManual;

interface LeaveCreditTransactionColumnsProps {
    onEdit: (row: LeaveCreditTransaction) => void;
    onToggle: (row: LeaveCreditTransaction) => void;
}

export const getLeaveCreditTransactionColumns = ({
    onEdit,
    onToggle
}: LeaveCreditTransactionColumnsProps): ColumnDef<LeaveCreditTransaction>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SNO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 50
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeFirstName') || '-'}</div>
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Name' />,
        cell: ({ row }) => <div>{row.getValue('hrmL_LeaveName')}</div>
    },
    {
        accessorKey: 'hreltD_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const value = row.getValue('hreltD_FromDate');
            if (!value) return <div>-</div>;
            const date = typeof value === 'string' ? new Date(value) : (value as Date);
            return <div>{date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>;
        }
    },
    {
        accessorKey: 'hreltD_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const value = row.getValue('hreltD_ToDate');
            if (!value) return <div>-</div>;
            const date = typeof value === 'string' ? new Date(value) : (value as Date);
            return <div>{date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>;
        }
    },
    {
        accessorKey: 'hreltD_TotDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hreltD_TotDays')}</div>
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ACTIONS' />,
        cell: ({ row }) => {
            const isActive = row.getValue('isActive') as boolean;
            const entity = row.original;
            return (
                <div className='flex items-center justify-center'>
                    <Switch
                        checked={isActive}
                        onCheckedChange={() => onToggle(entity)}
                        className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
                    />
                </div>
            );
        },
        enableSorting: false
    }
];
