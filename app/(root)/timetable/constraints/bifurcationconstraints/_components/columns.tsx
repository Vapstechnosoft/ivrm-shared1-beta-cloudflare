'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export interface IBifurcationConstraintList {
    acdYear: string;
    categoryName: string;
    updatedDate?: string;
    UpdatedDate?: string;
    bifricationName: string;
    periodname: string;
    ttB_ActiveFlag: boolean;
    ttB_Id: number;
}

export const masterBifurcationConstraintsColumns: ColumnDef<IBifurcationConstraintList>[] = [
    {
        accessorKey: 'ttB_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'acdYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('acdYear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'categoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('categoryName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'bifricationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bifurcation Name' />,
        cell: ({ row }) => <div>{row.getValue('bifricationName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'periodname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No of Period' />,
        cell: ({ row }) => <div>{row.getValue('periodname')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

// function ActionButtonsCell({ rowData }: { rowData: IBifurcationConstraintList }) {
//     const { openEditForm, openToggleForm, openDeleteForm, openDetailsView } = useFormContext<IBifurcationConstraintList>();
//     const handleEdit = useCallback(
//         (data: IBifurcationConstraintList) => {
//             openEditForm(data);
//         },
//         [openEditForm]
//     );

//     const handleToggle = useCallback(
//         (data: IBifurcationConstraintList) => {
//             openToggleForm(data);
//         },
//         [openToggleForm]
//     );

//     const handleView = useCallback(
//         (data: IBifurcationConstraintList) => {
//             openDetailsView(data);
//         },
//         [openDetailsView]
//     );

//     const handleDelete = useCallback(
//         (data: IBifurcationConstraintList) => {
//             if (openDeleteForm) openDeleteForm(data);
//         },
//         [openDeleteForm]
//     );

//     return (
//         <ActionButtons
//             rowData={rowData}
//             buttons={{ edit: true, toggle: true, delete: true, view: true }}
//             onEdit={handleEdit}
//             // onView={handleView}
//             onToggle={handleToggle}
//             onDelete={handleDelete}
//             toggleConditionKey='ttB_ActiveFlag'
//         />
//     );
// }

function ActionButtonsCell({ rowData }: { rowData: IBifurcationConstraintList }) {
    const { openEditForm, openToggleForm, openDetailsView } = useFormContext<IBifurcationConstraintList>();

    const handleEdit = useCallback(
        (data: IBifurcationConstraintList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IBifurcationConstraintList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    return (
        <div className='flex items-center gap-3'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleView}
                            className='h-8 w-8 p-0 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600'>
                            <Eye className='h-4 w-4' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='ttB_ActiveFlag'
            />
        </div>
    );
}
