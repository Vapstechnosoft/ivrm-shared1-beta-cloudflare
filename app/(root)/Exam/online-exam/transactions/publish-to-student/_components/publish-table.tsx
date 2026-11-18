'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import type { IPublishToStudentList } from '@/types/exam/online-exam/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Globe, Send, XCircle } from 'lucide-react';
import { useMemo } from 'react';

interface PublishTableProps {
    students: IPublishToStudentList[];
    selectedStudentIds: number[];
    onToggleSelectStudent: (id: number) => void;
    onSelectAll: () => void;
    onBulkPublish: (publish: boolean) => void;
    isLoading?: boolean;
    isSaving?: boolean;
}

export default function PublishTable({
    students = [],
    selectedStudentIds = [],
    onToggleSelectStudent,
    onSelectAll,
    onBulkPublish,
    isLoading,
    isSaving
}: PublishTableProps) {
    const tableProps = useDataTableProps(students);
    const isAllSelected = students.length > 0 && selectedStudentIds.length === students.length;

    const columns: ColumnDef<IPublishToStudentList>[] = useMemo(
        () => [
            {
                id: 'select',
                header: () => (
                    <div className='flex justify-center'>
                        <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} aria-label='Select all' />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='flex justify-center'>
                        <Checkbox
                            checked={selectedStudentIds.includes(row.original.amsT_Id)}
                            onCheckedChange={() => onToggleSelectStudent(row.original.amsT_Id)}
                            aria-label='Select row'
                        />
                    </div>
                ),
                enableSorting: false,
                size: 50
            },
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
                cell: ({ row }) => (
                    <div className='font-semibold text-foreground'>
                        {row.getValue('studentName') ||
                            [(row.original as any).amsT_FirstName, (row.original as any).amsT_LastName].filter(Boolean).join(' ') ||
                            'N/A'}
                    </div>
                ),
                enableSorting: true
            },
            {
                accessorKey: 'admNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' />,
                cell: ({ row }) => (
                    <div>
                        {row.getValue('admNo') || (row.original as any).amsT_AdmNo || (row.original as any).AMST_AdmNo || 'N/A'}
                    </div>
                ),
                enableSorting: true
            },
            {
                accessorKey: 'rollNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
                cell: ({ row }) => (
                    <div className='text-center'>
                        {row.getValue('rollNo') || (row.original as any).amsT_RollNo || (row.original as any).AMST_RollNo || 'N/A'}
                    </div>
                ),
                enableSorting: true,
                size: 90
            },
            {
                accessorKey: 'marksObtained',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Score' />,
                cell: ({ row }) => {
                    const obtained = row.original.marksObtained ?? (row.original as any).score ?? 0;
                    const total = row.original.totalMarks ?? 100;
                    return (
                        <div className='text-center font-bold text-primary'>
                            {obtained} / {total}
                        </div>
                    );
                },
                enableSorting: true,
                size: 100
            },
            {
                accessorKey: 'percentage',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage' />,
                cell: ({ row }) => {
                    const pct = row.getValue('percentage') ?? (row.original as any).percentage ?? 0;
                    return <div className='text-center font-semibold'>{pct}%</div>;
                },
                enableSorting: true,
                size: 110
            },
            {
                accessorKey: 'resultStatus',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
                cell: ({ row }) => {
                    const res = row.getValue('resultStatus') || (row.original as any).result;
                    const pass = res === 'Pass' || res === 'PASS' || (Number(row.original.percentage) >= 35);
                    return (
                        <Badge variant={pass ? 'success' : 'destructive'} className='font-medium'>
                            {pass ? 'Pass' : 'Fail'}
                        </Badge>
                    );
                },
                enableSorting: true,
                size: 90
            },
            {
                accessorKey: 'isPublished',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Publish Status' />,
                cell: ({ row }) => {
                    const isPub = row.getValue('isPublished') === true;
                    return (
                        <div className='flex items-center gap-1.5'>
                            {isPub ? (
                                <Badge className='flex items-center gap-1 bg-emerald-600 text-white'>
                                    <Globe className='h-3 w-3' /> Published
                                </Badge>
                            ) : (
                                <Badge variant='outline' className='text-muted-foreground'>
                                    Unpublished
                                </Badge>
                            )}
                        </div>
                    );
                },
                enableSorting: true,
                size: 130
            }
        ],
        [isAllSelected, onSelectAll, selectedStudentIds, onToggleSelectStudent]
    );

    return (
        <div className='space-y-3'>
            {/* Bulk Action Banner */}
            {students.length > 0 && (
                <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3'>
                    <div className='text-muted-foreground text-xs'>
                        Selected: <strong className='text-foreground'>{selectedStudentIds.length}</strong> of {students.length} students
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            disabled={selectedStudentIds.length === 0 || isSaving}
                            onClick={() => onBulkPublish(false)}
                            className='h-8 gap-1.5 text-xs'>
                            <XCircle className='h-3.5 w-3.5 text-muted-foreground' /> Unpublish Selected
                        </Button>
                        <Button
                            type='button'
                            size='sm'
                            disabled={selectedStudentIds.length === 0 || isSaving}
                            onClick={() => onBulkPublish(true)}
                            className='h-8 min-w-28 gap-1.5 bg-emerald-600 text-white text-xs shadow-sm hover:bg-emerald-700'>
                            <Send className='h-3.5 w-3.5' /> {isSaving ? 'Publishing...' : 'Publish Selected'}
                        </Button>
                    </div>
                </div>
            )}

            <GenericDataTable<IPublishToStudentList> columns={columns} {...tableProps} isLoading={Boolean(isLoading)} />
        </div>
    );
}
