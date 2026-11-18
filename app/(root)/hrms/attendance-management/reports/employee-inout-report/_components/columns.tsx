'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    try {
        return format(new Date(date), 'dd-MM-yyyy');
    } catch (e) {
        return 'N/A';
    }
};

import type { BaseEntity } from '@/lib/localdb';

export interface InOutRow extends BaseEntity {
    user_id?: number;
    user_name?: string;
    employee_code?: string;
    date?: string;
    time_in?: string;
    time_out?: string;
    branch?: string;
    department?: string;
    designation?: string;
    type?: string;
    inOutFlg?: string;
    employeeName?: string;
    timeIn?: string;
    timeOut?: string;
    [key: string]: any;
}

export const getEmployeeInOutReportColumns = (dateColumns: string[]): ColumnDef<InOutRow>[] => {
    const staticColumns: ColumnDef<InOutRow>[] = [
        {
            accessorKey: 'user_id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
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
            accessorKey: 'ename',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => <div>{row.getValue('ename')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'ecode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
            cell: ({ row }) => <div>{row.getValue('ecode')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'designation',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Designation' />,
            cell: ({ row }) => <div>{row.getValue('designation')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Type' />,
            cell: ({ row }) => <div>{row.getValue('type')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'inOutFlg',
            header: ({ column }) => <DataTableColumnHeader column={column} title='In/Out' />,
            cell: ({ row }) => {
                const val = row.getValue('inOutFlg');
                if (typeof val === 'object' && val !== null) {
                    return (
                        <div className='flex flex-col items-center justify-center gap-1 py-1'>
                            <div className='flex h-8 w-12 items-center justify-center border bg-gray-50 text-xs shadow-sm'>In</div>
                            <div className='flex h-8 w-12 items-center justify-center border bg-gray-50 text-xs shadow-sm'>Out</div>
                        </div>
                    );
                }
                return <div className='flex h-8 items-center justify-center'>{String(val)}</div>;
            },
            enableSorting: false,
            enableHiding: true
        }
    ];

    const dynamicDateColumns: ColumnDef<InOutRow>[] = dateColumns.map((dateStr) => {
        const dateObj = new Date(dateStr);
        let title = dateStr;
        try {
            if (!isNaN(dateObj.getTime())) {
                title = `${format(dateObj, 'dd-MMM')} ${format(dateObj, 'EEEE').substring(0, 3)}`;
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

                if (typeof val === 'object' && val !== null) {
                    return (
                        <div className='flex flex-col items-center justify-center gap-1 py-1'>
                            <div className='flex h-8 min-w-[60px] items-center justify-center border bg-white px-2 text-sm shadow-sm'>
                                {val.in || '--'}
                            </div>
                            <div className='flex h-8 min-w-[60px] items-center justify-center border bg-white px-2 text-sm shadow-sm'>
                                {val.out || '--'}
                            </div>
                        </div>
                    );
                }

                return <div className='flex h-8 items-center justify-center font-medium'>{val || '--'}</div>;
            },
            enableSorting: false,
            enableHiding: false
        };
    });

    return [...staticColumns, ...dynamicDateColumns];
};
