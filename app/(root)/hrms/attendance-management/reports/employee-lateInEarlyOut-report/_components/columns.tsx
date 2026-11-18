'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    return format(new Date(date), 'dd-MM-yyyy');
};

import type { BaseEntity } from '@/lib/localdb';

export interface LIEORow extends BaseEntity {
    hrmE_Id: number;
    ecode: string;
    ename: string;
    depname?: string;
    desgname?: string;
    gtype?: string;
    employeeCode?: string;
    employee_code?: string;
    employeeName?: string;
    user_name?: string;
    lateBy?: string;
    late_by?: string;
    earlyOut?: string;
    early_out?: string;
    type?: string;
    department?: string;
    designation?: string;
    date?: string;
    [key: string]: any; // For dynamic date columns
}

export const getEmployeeLateInEarlyOutReportColumns = (dateColumns: string[], mode?: string): ColumnDef<LIEORow>[] => {
    const staticColumns: ColumnDef<LIEORow>[] = [
        {
            accessorKey: 'hrmE_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                return <div className='pl-2 text-center text-xs'>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false,
            size: 50
        },
        {
            accessorKey: 'ecode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
            cell: ({ row }) => <div className='text-center text-xs'>{row.getValue('ecode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'ename',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => <div className='truncate text-left font-medium text-xs uppercase'>{row.getValue('ename')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'desgname',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Designation' />,
            cell: ({ row }) => <div className='text-left text-xs'>{row.getValue('desgname')}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    const dynamicDateColumns: ColumnDef<LIEORow>[] = dateColumns.map((dateStr) => {
        const dateObj = new Date(dateStr);
        let title = dateStr;
        try {
            if (!isNaN(dateObj.getTime())) {
                title = `${format(dateObj, 'dd-MM')} ${format(dateObj, 'EEEE').substring(0, 3)}`;
            }
        } catch (e) {}

        return {
            accessorKey: dateStr,
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title={title}
                    className='flex flex-col items-center justify-center text-center text-xs'
                />
            ),
            cell: ({ row }) => {
                const val = row.getValue(dateStr) as any;

                // For Late In-Early Out mode, show nested table color-coded
                if (mode === 'Late In Early Out') {
                    if (typeof val === 'object' && val !== null) {
                        return (
                            <div className='flex flex-col items-center justify-center gap-1 py-1'>
                                <div className='flex min-h-[24px] min-w-[60px] items-center justify-center border-gray-100 border-b px-2 font-bold text-[10px] text-green-600'>
                                    {val.in || '--'}
                                </div>
                                <div className='flex min-h-[24px] min-w-[60px] items-center justify-center px-2 font-bold text-[10px] text-red-600'>
                                    {val.out || '--'}
                                </div>
                            </div>
                        );
                    }
                }

                // For other modes, just show the time/value
                return <div className='flex h-8 items-center justify-center font-medium text-[10px]'>{val || '--'}</div>;
            },
            enableSorting: false,
            enableHiding: false
        };
    });

    return [...staticColumns, ...dynamicDateColumns];
};
