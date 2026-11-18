'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IStudentAttendanceReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';

export const getAttendanceColumns = (monthDateWise: boolean, monthList?: any[]): ColumnDef<IStudentAttendanceReportList>[] => {
    const columns: ColumnDef<IStudentAttendanceReportList>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 24
        },
        {
            accessorKey: 'RowNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
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
            cell: ({ row }) => <div>{row.getValue('AMST_AdmNo')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'AMAY_RollNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('AMAY_RollNo')}</div>,
            enableSorting: true,
            enableHiding: true
        }
    ];

    if (monthDateWise) {
        // Use monthList if available, otherwise fallback to 31 days
        const days = monthList?.length ? monthList.map((m) => m.day) : Array.from({ length: 31 }, (_, i) => i + 1);

        for (const day of days) {
            columns.push({
                accessorKey: `_${day}`,
                header: ({ column }) => <div className='flex items-center justify-center font-bold text-black'>{day}</div>,
                cell: ({ row }) => {
                    const value = (row.original as any)[`_${day}`] || (row.original as any)[day] || 'NE';
                    let colorClass = '';
                    if (value === 'P') colorClass = 'text-green-600 font-bold';
                    else if (value === 'A') colorClass = 'text-red-600 font-bold';
                    else if (value === 'L') colorClass = 'text-blue-600 font-bold';
                    else if (value === 'HO') colorClass = 'text-amber-500 font-bold';
                    else if (value === 'NE') colorClass = 'text-muted-foreground font-medium';
                    return <div className={`text-center ${colorClass}`}>{value}</div>;
                },
                size: 40
            });
        }
    }

    columns.push(
        {
            accessorKey: 'ASA_ClassHeld',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class Held' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('ASA_ClassHeld')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'ASA_Class_Attended',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class Attended' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('ASA_Class_Attended')}</div>,
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'Percentage',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage(%)' className='font-bold text-black' />,
            cell: ({ row }) => {
                const percentage = Number(row.getValue('Percentage'));
                return <div>{percentage.toFixed(2)}</div>;
            },
            enableSorting: true,
            enableHiding: true
        },
        {
            accessorKey: 'Remarks',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' className='font-bold text-black' />,
            cell: ({ row }) => {
                const apiRemarks = (row.original as any).Remarks || (row.original as any).remarks;
                if (apiRemarks) return <div>{apiRemarks}</div>;

                // Fallback computation if backend doesn't provide Remarks
                const percentage = Number(row.getValue('Percentage'));
                let remarks = 'Poor Attendance';
                if (percentage >= 75) remarks = 'Very Good Attendance';
                else if (percentage >= 50) remarks = 'Good Attendance';
                else if (percentage >= 35) remarks = 'Average Attendance';
                return <div>{remarks}</div>;
            },
            enableSorting: true,
            enableHiding: true
        }
    );

    return columns;
};

export const attendanceColumns = getAttendanceColumns(false);
