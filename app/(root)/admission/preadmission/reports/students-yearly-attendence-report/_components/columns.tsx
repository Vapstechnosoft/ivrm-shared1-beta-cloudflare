'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';

interface MonthInfo {
    monthnamee: string;
    yearidname: string;
    monthidname: number;
    MONTH_NAME: string;
    total: number;
}

export const createStudentsYearlyAttendenceReportColumns = (monthList: MonthInfo[]): ColumnDef<IStudentYearlyAttendenceReportList>[] => {
    const baseColumns: ColumnDef<IStudentYearlyAttendenceReportList>[] = [
        {
            accessorKey: 'RowNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No.' className='font-bold text-black' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'AMST_RegistrationNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Reg No.' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('AMST_RegistrationNo') ?? 'N.A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'AMST_AdmNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('AMST_AdmNo') ?? 'N.A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('name')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'AMAY_RollNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No.' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('AMAY_RollNo') ?? 'N.A'}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    // Generate dynamic month columns
    const monthColumns: ColumnDef<IStudentYearlyAttendenceReportList>[] = monthList.map((month: MonthInfo) => {
        const monthKey = `${month.yearidname}-${month.monthidname}`;
        const monthName = month.monthnamee.trim();

        return {
            accessorKey: `monthlyAttendance.${monthKey}`,
            id: monthKey,
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title={`${monthName} ${month.yearidname}(${month.total})`}
                    className='font-bold text-black'
                />
            ),
            cell: ({ row }) => {
                const attendance = row.original.monthlyAttendance?.[monthKey];
                return <div className='text-center'>{attendance ?? 0}</div>;
            },
            enableSorting: true,
            enableHiding: true
        };
    });

    const totalWorkingDays = monthList.reduce((sum: any, month: any) => sum + month.total, 0);

    // Summary columns (Total and Percentage)
    const summaryColumns: ColumnDef<IStudentYearlyAttendenceReportList>[] = [
        {
            accessorKey: 'totalPresent',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={`Total (${totalWorkingDays})`} className='font-bold text-black' />
            ),
            cell: ({ row }) => <div className='text-center font-semibold'>{Number(row.getValue('totalPresent')).toFixed(2)}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'percentage',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage' className='font-bold text-black' />,
            cell: ({ row }) => <div className='text-center font-semibold'>{row.getValue('percentage')}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    return [...baseColumns, ...monthColumns, ...summaryColumns];
};

export const createAbsentStudentColumns = (): ColumnDef<IStudentYearlyAttendenceReportList>[] => {
    return [
        {
            accessorKey: 'RowNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div>{continuousIndex}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('name')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'AMST_AdmNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('AMST_AdmNo') ?? 'N.A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'AMAY_RollNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('AMAY_RollNo') ?? 'N.A'}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalWorkingDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class Held' className='font-bold text-black' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('totalWorkingDays')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalPresent',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Present' className='font-bold text-black' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('totalPresent')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'totalAbsent',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Absent' className='font-bold text-black' />,
            cell: ({ row }) => <div className='text-center font-semibold text-red-500'>{row.getValue('totalAbsent')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'percentage',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage' className='font-bold text-black' />,
            cell: ({ row }) => <div className='text-center font-semibold'>{row.getValue('percentage')}%</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];
};
