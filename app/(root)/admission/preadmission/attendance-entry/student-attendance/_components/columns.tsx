'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Input } from '@/components/ui/input';
import type { StudentAttendanceStudent } from '@/server/admission/preadmission/attendance-entry/student_attendance';
import type { ColumnDef } from '@tanstack/react-table';

export const getStudentAttendanceColumns = (
    attendanceType: string,
    updateStudent: (amsT_Id: number, field: string, value: any) => void
): ColumnDef<StudentAttendanceStudent>[] => {
    const baseColumns: ColumnDef<StudentAttendanceStudent>[] = [
        {
            accessorKey: 'slNo',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='SL. NO.' className='w-[80px] text-center font-bold text-black' />
            ),
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='w-[80px] text-center font-medium'>{continuousIndex}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'studentname',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => <div className='font-medium'>{row.getValue('studentname')}</div>
        },
        {
            accessorKey: 'amsT_AdmNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No.' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('amsT_AdmNo')}</div>
        },
        {
            accessorKey: 'amaY_RollNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No.' className='text-center font-bold text-black' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('amaY_RollNo')}</div>
        }
    ];
    const type = attendanceType?.toLowerCase() || '';

    if (type === 'monthly') {
        baseColumns.push({
            id: 'days',
            accessorKey: 'pdays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Days' className='text-center font-bold text-black' />,
            cell: ({ row }) => {
                return (
                    <div className='flex justify-center'>
                        <Input
                            type='number'
                            step='0.5'
                            className='w-20 text-center'
                            value={row.original.pdays || ''}
                            onChange={(e) => updateStudent(row.original.amsT_Id, 'pdays', Number.parseFloat(e.target.value) || 0)}
                        />
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false
        });
    } else if (type === 'dailytwice') {
        baseColumns.push(
            {
                id: 'firstHalf',
                accessorKey: 'firstHalfflag',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title='I Half' className='text-center font-bold text-black' />
                ),
                cell: ({ row }) => {
                    return (
                        <div className='flex justify-center'>
                            <Checkbox
                                checked={row.original.firstHalfflag || false}
                                onCheckedChange={(checked) => updateStudent(row.original.amsT_Id, 'firstHalfflag', checked)}
                            />
                        </div>
                    );
                },
                enableSorting: false,
                enableHiding: false
            },
            {
                id: 'secondHalf',
                accessorKey: 'secondHalfflag',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title='II Half' className='text-center font-bold text-black' />
                ),
                cell: ({ row }) => {
                    return (
                        <div className='flex justify-center'>
                            <Checkbox
                                checked={row.original.secondHalfflag || false}
                                onCheckedChange={(checked) => updateStudent(row.original.amsT_Id, 'secondHalfflag', checked)}
                            />
                        </div>
                    );
                },
                enableSorting: false,
                enableHiding: false
            }
        );
    } else {
        // DailyOnce or PeriodWise
        baseColumns.push({
            id: 'attendance',
            accessorKey: 'selected',
            header: ({ column, table }) => (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <span className='text-center font-bold text-black'>Attendance</span>
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label='Select all'
                        className='translate-y-[2px]'
                    />
                </div>
            ),
            cell: ({ row }) => {
                return (
                    <div className='flex justify-center'>
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label='Select row'
                            className='translate-y-[2px]'
                        />
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false
        });
    }

    return baseColumns;
};
