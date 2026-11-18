import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export type LeaveStatusReportData = {
    hrelS_CBLeaves: number;
    hrelS_TotalLeaves: number;
    hrelS_TransLeaves: number;
    hrmE_EmployeeCode: string;
    hrmE_EmployeeName: string;
    hrmL_LeaveName: string;
};

export const columns: ColumnDef<LeaveStatusReportData>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => (
            <div className='text-center font-bold text-black'>
                <DataTableColumnHeader column={column} title='Sl.No' />
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmE_EmployeeCode',
        header: ({ column }) => (
            <div className='font-bold text-black'>
                <DataTableColumnHeader column={column} title='Employee Code' />
            </div>
        ),
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeCode')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmE_EmployeeName',
        header: ({ column }) => (
            <div className='font-bold text-black'>
                <DataTableColumnHeader column={column} title='Employee Name' />
            </div>
        ),
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeName')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => (
            <div className='text-center font-bold text-black'>
                <DataTableColumnHeader column={column} title='Leave Type' />
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrmL_LeaveName')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrelS_TotalLeaves',
        header: ({ column }) => (
            <div className='text-center font-bold text-black'>
                <DataTableColumnHeader column={column} title='Total Leave' />
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrelS_TotalLeaves')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrelS_TransLeaves',
        header: ({ column }) => (
            <div className='text-center font-bold text-black'>
                <DataTableColumnHeader column={column} title='Leave Used' />
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrelS_TransLeaves')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrelS_CBLeaves',
        header: ({ column }) => (
            <div className='text-center font-bold text-black'>
                <DataTableColumnHeader column={column} title='Leave Balance' />
            </div>
        ),
        cell: ({ row }) => <div className='text-center font-bold'>{row.getValue('hrelS_CBLeaves')}</div>,
        enableSorting: false
    }
];
