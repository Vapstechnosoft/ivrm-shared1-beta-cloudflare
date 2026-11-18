'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteMasterComplexity } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterComplexity } from '@/types/exam/online-exam/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterComplexityColumns: ColumnDef<IMasterComplexity>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'lpmcomP_ComplexityName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Complexity Name' />,
        cell: ({ row }) => <div className='font-semibold text-primary'>{row.getValue('lpmcomP_ComplexityName') || 'N/A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lpmcomP_ComplexityDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => (
            <div className='max-w-md truncate text-foreground' title={row.getValue('lpmcomP_ComplexityDesc')}>
                {row.getValue('lpmcomP_ComplexityDesc') || '-'}
            </div>
        ),
        enableSorting: true
    },
    {
        accessorKey: 'lpmcomP_DefaultFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Default' className='text-center' />,
        cell: ({ row }) => {
            const isDefault = Boolean(row.getValue('lpmcomP_DefaultFlg'));
            return (
                <div className='text-center'>
                    {isDefault ? (
                        <Badge variant='default' className='border-primary/30 bg-primary/20 font-semibold text-primary text-xs'>
                            Default
                        </Badge>
                    ) : (
                        <span className='text-muted-foreground text-xs'>-</span>
                    )}
                </div>
            );
        },
        enableSorting: true,
        size: 100
    },
    {
        accessorKey: 'lpmcomP_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => getStatusBadge(row.getValue('lpmcomP_ActiveFlg') ? 'active' : 'inactive'),
        enableSorting: true,
        size: 100
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        size: 160,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterComplexity }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterComplexity>();

    const handleEdit = useCallback(
        (data: IMasterComplexity) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterComplexity) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const { mutateAsync: deleteComplexity } = useDeleteMasterComplexity();

    const handleDelete = useCallback(
        (data: IMasterComplexity) => {
            if (confirm(`Are you sure you want to delete "${data.lpmcomP_ComplexityName}"?`)) {
                deleteComplexity(data.lpmcomP_Id)
                    .then((result: any) => {
                        if (result?.success !== false) {
                            window.location.reload();
                        } else {
                            alert(result?.message || 'Failed to delete');
                        }
                    })
                    .catch(() => alert('Error deleting complexity'));
            }
        },
        [deleteComplexity]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{
                edit: true,
                delete: true,
                toggle: true
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            toggleConditionKey='lpmcomP_ActiveFlg'
        />
    );
}
