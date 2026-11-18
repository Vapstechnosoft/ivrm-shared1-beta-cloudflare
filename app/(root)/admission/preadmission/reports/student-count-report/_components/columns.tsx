'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
export const formatDate = (date: unknown): string => {
    if (!date) return 'N/A';
    if (typeof date === 'string') {
        const trimmed = date.trim();
        // Check if format is DD/MM/YYYY or DD-MM-YYYY
        const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(.*)$/);
        if (dmyMatch) {
            const day = dmyMatch[1].padStart(2, '0');
            const month = dmyMatch[2].padStart(2, '0');
            const year = dmyMatch[3];
            return `${day}-${month}-${year}`;
        }
        // Check if format is YYYY-MM-DD
        const ymdMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
        if (ymdMatch) {
            const year = ymdMatch[1];
            const month = ymdMatch[2].padStart(2, '0');
            const day = ymdMatch[3].padStart(2, '0');
            return `${day}-${month}-${year}`;
        }
    }
    const parsedDate = new Date(date as any);
    if (isNaN(parsedDate.getTime())) return 'N/A';
    return format(parsedDate, 'dd-MM-yyyy');
};

export const getStudentName = (row: any): string => {
    if (!row) return 'N/A';
    const firstName = row.FirstName || '';
    const middleName = row.MiddleName || '';
    const lastName = row.LastName || '';
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    return fullName || row.FatherName || row.UserName || 'N/A';
};

export const getStudentCountReportColumns = (): ColumnDef<IMasterStudentCountReportList>[] => {
    return [
        {
            accessorKey: 'user_id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='w-full pl-6 font-bold text-black' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='w-full pl-6'>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            id: 'FirstName',
            accessorFn: (row) => getStudentName(row),
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => {
                return <div>{getStudentName(row.original)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'EmailID',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Email-Id' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('EmailID') || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'Mobileno',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile Number' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('Mobileno') || 'N/A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'RegDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='font-bold text-black' />,
            cell: ({ row }) => {
                const date = row.getValue('RegDate') as string;
                return <div>{formatDate(date)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        }
    ];
};
