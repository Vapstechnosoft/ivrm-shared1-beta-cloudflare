'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import type { IStudentExamSubmission } from '@/types/exam/online-exam/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { UserCheck } from 'lucide-react';
import { useMemo } from 'react';

interface StudentListTableProps {
    students: IStudentExamSubmission[];
    onEvaluateStudent: (student: IStudentExamSubmission) => void;
    isLoading?: boolean;
}

export default function StudentListTable({ students = [], onEvaluateStudent, isLoading }: StudentListTableProps) {
    const tableProps = useDataTableProps(students);

    const columns: ColumnDef<IStudentExamSubmission>[] = useMemo(
        () => [
            {
                accessorKey: 'slNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
                cell: ({ row, table }) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    const pageSize = table.getState().pagination.pageSize;
                    return <div className='font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
                },
                size: 70
            },
            {
                accessorKey: 'studentName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                cell: ({ row }) => <div className='font-semibold text-foreground'>{row.getValue('studentName')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'admNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No' />,
                cell: ({ row }) => <div>{row.getValue('admNo')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'rollNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
                cell: ({ row }) => <div className='text-center'>{row.getValue('rollNo') || 'N/A'}</div>,
                enableSorting: true,
                size: 90
            },
            {
                accessorKey: 'totalQuestions',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Total Qs' />,
                cell: ({ row }) => <div className='text-center'>{row.getValue('totalQuestions')}</div>,
                size: 90
            },
            {
                accessorKey: 'totalAttempted',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Attempted' />,
                cell: ({ row }) => <div className='text-center'>{row.getValue('totalAttempted')}</div>,
                size: 100
            },
            {
                accessorKey: 'marksObtained',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Score' />,
                cell: ({ row }) => (
                    <div className='text-center font-bold text-primary'>
                        {row.original.marksObtained} / {row.original.totalMarks}
                    </div>
                ),
                enableSorting: true,
                size: 100
            },
            {
                accessorKey: 'percentage',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage' />,
                cell: ({ row }) => <div className='text-center font-semibold'>{row.getValue('percentage')}%</div>,
                enableSorting: true,
                size: 110
            },
            {
                accessorKey: 'examStatus',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
                cell: ({ row }) => {
                    const status = row.getValue('examStatus') as string;
                    let badgeVariant = 'default';
                    if (status === 'Submitted') badgeVariant = 'bg-purple-600 text-white';
                    if (status === 'Evaluated') badgeVariant = 'bg-emerald-600 text-white';
                    if (status === 'In Progress') badgeVariant = 'bg-blue-600 text-white';
                    if (status === 'Not Started') badgeVariant = 'bg-gray-500 text-white';

                    return <Badge className={`${badgeVariant} font-medium`}>{status}</Badge>;
                },
                enableSorting: true,
                size: 120
            },
            {
                id: 'actions',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Evaluation' className='text-center' />,
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <Button
                            size='sm'
                            variant='outline'
                            className='h-8 gap-1.5 text-xs transition-all hover:bg-primary hover:text-primary-foreground'
                            onClick={() => onEvaluateStudent(row.original)}>
                            <UserCheck className='h-3.5 w-3.5' />
                            Evaluate Paper
                        </Button>
                    </div>
                ),
                size: 140
            }
        ],
        [onEvaluateStudent]
    );

    return <GenericDataTable<IStudentExamSubmission> columns={columns} {...tableProps} isLoading={Boolean(isLoading)} />;
}
